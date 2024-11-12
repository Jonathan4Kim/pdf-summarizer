import '../../styles.css'
import { DocumentSVG } from './DocumentSVG'
import { Link } from 'react-router-dom';


export default function Home() {
    return <>
    {/* Sidebar: Login, Logout Learn More*/}
    <div className='container-sidebar'>
        <nav>
            <div className='logo'>PDF Summarizer</div>
            <div className='spacer'></div>
            <Link to="/register" className='nav-items'><button>Register</button></Link>
            <Link to="/login" className='nav-items'><button>Login</button></Link>
            <Link to="/upload_pdf" className='nav-items'><button>About</button></Link>
        </nav>
    </div>
    <div className='container-home'>
        <div classname='home-left'>
            <h1>Transform Your PDFs into Concise Summaries with Precision</h1>
            <p>
            Unlock the power of advanced text summarization with our state-of-the-art PDF summarizer.
            Effortlessly convert lengthy documents into clear, concise summaries that capture the essence of your content with remarkable accuracy.
            Whether you need quick insights for research, a study guide, or just a streamlined view of complex information,
            our tool delivers tailored results that save you time and enhance productivity.
            Ready to streamline your workflow? Start summarizing your PDFs today!
            </p>
        </div>
        <div className='spacer'></div>
        <div className='home-right'>
            <DocumentSVG className='document-svg'></DocumentSVG>
        </div>
    </div>
    </>
}