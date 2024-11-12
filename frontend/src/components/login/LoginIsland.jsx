import {Link} from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import {useState} from 'react';

export default function LoginIsland() {
    const navigate = useNavigate();
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    }

    async function handleLoginSubmit(event) {
        event.preventDefault();
        // get the url
        const url = 'http://127.0.0.1:5000/login';
        
        // post username and password to axios to flask backend
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        // get a response from the backend telling me if it was successful
        try {
            const response = await axios.post(url, formData);
            const data = await response.data;
            console.log('here')
            if (response.status === 200) {
                console.log('Success:', data.message);
                navigate('/upload_pdf');
            }
        } catch (error) {
            console.error(error);
        }

    }


    return <>
    <div className="login-island">
        <div className="login-box">
        <div className='login-description'>
            <h1>Access Your PDF Summaries</h1>
            <h2>Log in here to generate accurate and concise summaries from your PDFs.</h2>
            <Link to="/register"><h2>New here? Register now to start summarizing your documents effortlessly!</h2></Link>
        </div>
            <form className="login-form" onSubmit={handleLoginSubmit}>
                <h2>Welcome Back!</h2>
                <label className="login-form-label" for="username">Username</label>
                <input className="username" id="username" placeholder="your username..." type='text' onChange={handleUsernameChange} required></input>
                <label className="login-form-label" for="password">Password</label>
                <input className="password" id="password" placeholder="your password..." type='password' onChange={handlePasswordChange} required></input>
                <button type="submit">Login</button>
            </form>
        </div>
    </div>
    </>
}