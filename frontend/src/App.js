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
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import EmployeeProfile from "./components/EmployeeProfile.js";
import AdminLearningPaths from "./components/AdminLearningPaths.js";
import AssignLearningPath from "./components/AssignLearningPath.js";
import EmployeeLearningPath from "./components/EmployeeLearningPath.js";
import AdminLearningPathsDisplay from "./components/AdminLearningPathsDisplay.js";
import AdminCourseRecommendation from "./components/CourseRecommendation.js";
import QuizPage from "./components/QuizPage.js";
import CreateQuiz from "./components/CreateQuiz.js";



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
          <Route path="/profile/:employeeId" element={<EmployeeProfile/>} />
          <Route path="/create-learningpath" element={<AdminLearningPaths />} />
          <Route path="/assign-learningpath" element={<AssignLearningPath />} />
          <Route path="/learning-path/:employeeId" element={<EmployeeLearningPath />} />
          <Route path="/admin/learning-path" element={<AdminLearningPathsDisplay />} />
          <Route path="/course-recommend" element={<AdminCourseRecommendation />} />
          <Route path="/quiz/:courseId" element={<QuizPage />} />
          <Route path="/create-quiz" element={<CreateQuiz />} />
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
