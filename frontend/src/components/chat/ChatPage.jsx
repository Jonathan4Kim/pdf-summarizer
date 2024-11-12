import '../../styles.css'
import { DocumentSVG } from './SendQuerySvg'
import { FileUploadSVG } from './FileUploadSvg'
import axios from 'axios'
import {useState, useEffect} from 'react'


export default function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);

    const initialMessage = "";
    useEffect(() => {
        setMessages([...messages, initialMessage]);
    }, []);

    // function that sets file only if it is a pdf
    const handleFileChange = (e) => {
        // set the file to the new file
        setFile(e.target.files[0]);
        // prevent default event
        handleFileSubmit(e);
    };

    async function handleFileSubmit(event) {
        // prevent default event
        event.preventDefault();

        // backend url to send pdf summary to
        const url = 'http://127.0.0.1:5000/add_file';

        // create FormData instance to send to. Append file and name
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        const config = {
            headers: {
              'content-type': 'multipart/form-data',
            },
          };
        try {
            // post the data to our flask backend
            const response = await axios.post(url, formData, config);
            console.log(response.data);
            const data = response.data
            if (response.status === 200) {
                console.log('Success:', data.message);
            }
        } catch (error) {
            // print out error if axios call fails
            console.error(error);
        }
    }


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
                <label>
                    <input id="pdf-file" type="file" 
                accept=".pdf"
                onChange = {handleFileChange}/>
                </label>
                <button className='query-button'>
                        <FileUploadSVG></FileUploadSVG>
                </button>
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