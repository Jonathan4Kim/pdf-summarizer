import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'

export default function RegisterIsland() {
    const navigate = useNavigate();
    const [name, setName] = useState(null);
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [confirmpassword, setConfirmPassword] = useState(null);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState('');


    const handleNameChange = (e) => {
        setName(e.target.value);
    }

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    }

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    }

    async function handleSubmit(event) {
        // prevent default event
        event.preventDefault();
        // backend url to post data
        const url = 'http://127.0.0.1:5000/register';

        // create form data
        const formData = new FormData();

        // create k, v pairs
        formData.append('name', name);
        formData.append('username', username);
        if (password !== confirmpassword) {
            return;
        }
        formData.append('password', password);
        // try and catch error, sending 
        try {
            const response = await axios.post(url, formData);
            const data = await response.data;
            if (response.status === 200) {
                // Handle success
                console.log('Success:', data.message);
                // You can display success message to the user
                setMessage(data.message);  // e.g., set success message in state
                navigate('/upload_pdf');
              } else {
                // Handle errors returned by Flask
                console.error('Error:', data.error);
                setError(data.error);  // e.g., set error message in state
              }
        } catch (error) {
            console.error(error)
        }
    }
    return <>
    <div className="login-island">
        <div className="login-box">
            <div>
                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
            </div>
            <div className='login-description'>
                <h1>Register and get started!</h1>
                <h2>Already have an account? Log in here to generate accurate and concise summaries from your PDFs.</h2>
            </div>
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Register Account</h2>
                <label className="login-form-label" for="name">Name</label>
                <input className="login-form-input" id="name" placeholder="your name..." type='text' onChange={handleNameChange} required></input>
                <label className="login-form-label" for="username">Username</label>
                <input className="login-form-input" id="username" placeholder="your username..." type='text' onChange={handleUsernameChange} required></input>
                <label className="login-form-label" for="password">Password</label>
                <input className="login-form-input" id ="password" placeholder="your password..." type='password'  onChange={handlePasswordChange} required></input>
                <label className="login-form-label" for="confirm-password">Confirm Password</label>
                <input className="login-form-input" id="confirm-password" placeholder="confirm your password..." type='password' onChange={handleConfirmPasswordChange} required></input>
                <button type="submit">Register</button>
            </form>
        </div>
    </div>
    </>
}