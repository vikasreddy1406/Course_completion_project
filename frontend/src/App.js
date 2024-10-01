import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css"
import Login from "./components/Login.js";
import Signup from "./components/Signup.js"
import { alertContext } from "./context/alertContext.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from "./components/Home.js";
import Navbar from "./components/Navbar.js";
import AdminHome from "./components/AdminHome.js";
import Contact from "./components/Contact.js";
import CreateCourse from "./components/CreateCourse.js";
import CourseDetails from "./components/CourseDetails.js";


function App() {

  const showAlert = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  const location = useLocation();
  const hideNavbarPaths = ["/login", "/signup"];

  return (
    <>
      <alertContext.Provider value={{ showAlert }}>
        {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
        <Routes>

          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          
          
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover={false}
          theme="light"
        />
      </alertContext.Provider>
    </>
  );
}

export default function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}
