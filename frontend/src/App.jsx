import Home from './components/home/Home'
import Login from './components/login/Login'
import Register from './components/register/Register'
import React from 'react'
import PDFUpload from './components/pdfupload/PDFUpload'
import ChatPage from './components/chat/ChatPage'
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom'


export default function App() {
  return( 
  <Router>
    <Routes>
      <Route path="/" element={<Home></Home>}/>
      <Route path="/login" element={<Login></Login>}></Route>
      <Route path="/register" element={<Register></Register>}></Route>
      <Route path="/upload_pdf" element={<PDFUpload></PDFUpload>}></Route>
      <Route path="/chat" element={<ChatPage></ChatPage>}></Route>
    </Routes>
  </Router>);
}
