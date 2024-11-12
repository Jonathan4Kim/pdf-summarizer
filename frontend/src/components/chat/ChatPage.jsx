import '../../styles.css'
import { DocumentSVG } from './SendQuerySvg'
import { FileUploadSVG } from './FileUploadSvg'
import axios from 'axios'
import {useEffect, useState} from 'react'


export default function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');

    useEffect( async () => {
        const url = 'http://127.0.0.1:5000/summary';
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                setMessages([...messages, response.data.summary]);
            }
        } catch (error) {
            console.error(error)
        }
    }, []);



    async function handleSubmit(e) {
        e.preventDefault();
        if (message === '') {
            return;
        }
        const url = 'http://127.0.0.1:5000/chat';
        const formData = new FormData();
        formData.append('message', message);
        try {
            const response = await axios.post(url, formData);
            if (response.status === 200) {
                // TODO: handle get message here
                setMessages((prevMsgs) => [...prevMsgs, message, response.data.message]);
                setMessage('');
            }
        } catch (error) {
            console.error(error)
        }
    };

    return <>
    <div className='chat-page-container'>
        <div className='chat-sidebar'>
            <div className='logo-sidebar'>PDF Summarizer</div>
            <div className='chat-sidebar-new-pdf'>
                <button>New Chat + </button>       
            </div>
        </div>
        <div className='chat-container'>
            <div className='chat-messages-container'>
                {messages.map((msg, index) => (
                    <strong key={index} style={{backgroundcolor: index % 2 === 1 ? 'green' : 'blue'}}>{msg}</strong>
                ))}
            </div>
            <div>
                <input className='message' placeholder='Ask about the pdf...' type='textbox' value={message} onChange={e => (setMessage(e.target.value))}></input>
                <button className='query-button' onClick={handleSubmit}>
                <DocumentSVG className='query-svg'>
                </DocumentSVG>
                </button>
            </div>
        </div>
    </div>
    </>
}