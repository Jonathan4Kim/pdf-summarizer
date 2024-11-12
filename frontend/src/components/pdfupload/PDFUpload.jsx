import {useState} from 'react'
import axios from 'axios';
import {useNavigate} from 'react-router-dom'
import '../../styles.css'

function PDFUpload() {
    const navigate = useNavigate();
    // create use state for file
    const [file, setFile] = useState(null);

    // function that sets file only if it is a pdf
    const handleChange = (e) => {
        // set the file to the new file
        setFile(e.target.files[0]);
    };

    async function handleSubmit(event) {
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
                navigate('/chat');
            }
        } catch (error) {
            // print out error if axios call fails
            console.error(error);
        }
    }
    return (<>
    <div>
        <form onSubmit={handleSubmit}>
            <label for="pdf-file"></label>
            <input id="pdf-file" type="file" 
            accept=".pdf"
            onChange = {handleChange}
            required></input>
            <button type="submit">Upload PDF</button>
        </form>
    </div>
    </>)
};

export default PDFUpload;