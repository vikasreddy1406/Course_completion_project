import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookie from 'js-cookie';
import { Link } from 'react-router-dom';
import { Card, Button, Progress } from 'flowbite-react';
import { jwtDecode } from 'jwt-decode';
import { alertContext } from '../context/alertContext';
import LoadingUi from "./LoadingUi"; 
import img from "../../src/assests/man.jpg" 
import EmployeeLearningPath from './EmployeeLearningPath';
import api from "../api/api"

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]); 
  const [completionStats, setCompletionStats] = useState({ totalCourses: 0, completedCourses: 0, completionRate: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('All'); 
  const [tags, setTags] = useState([
    'All', 'Web Development', 'Data Engineering', 'Data Science', 
    'Generative AI', 'DevOps', 'Cybersecurity', 
    'Mobile Development', 'UI/UX Design', 'Software Testing'
  ]);
  
  let navigate = useNavigate();
  let { showAlert } = useContext(alertContext);

  useEffect(() => {

    if (!Cookie.get('accessToken')) {
      navigate("/login");
    }

    if (Cookie.get('role') === "admin") {
      navigate("/admin");
    }

    const fetchCourses = async () => {
      try {
        const response = await api.get('/api/user/get-courses', {
          headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
        });
        setCourses(response.data);
        setFilteredCourses(response.data); 
      } catch (error) {
        console.error('Error fetching assigned courses:', error);
      }
    };

    const fetchCompletionStats = async () => {
      try {
        const response = await api.get('/api/user/stats/completion', {
          headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
        });
        setCompletionStats(response.data);
      } catch (error) {
        console.error('Error fetching completion stats:', error);
      }
    };

    const loadData = async () => {
      await Promise.all([fetchCourses(), fetchCompletionStats()]);
      setLoading(false);
    };

    loadData();
  }, []);

  
  const downloadCertificate = async (courseId) => {
    try {
      const decodedToken = jwtDecode(Cookie.get('accessToken'));
      const employeeId = decodedToken._id;
      const response = await api.get(`/api/user/certificate/${employeeId}/${courseId}`, {
        headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
        responseType: 'blob', 
      });

    
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'certificate.pdf'); 
      document.body.appendChild(link);
      link.click();
      link.remove();
      showAlert("Certificate downloaded successfully");
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  const handleTagChange = (e) => {
    const selected = e.target.value;
    setSelectedTag(selected);
    
    if (selected === 'All') {
      setFilteredCourses(courses); 
    } else {
      const filtered = courses.filter(course => course.course_id?.tag === selected);
      setFilteredCourses(filtered);
    }
  };

  if (loading) {
    return <div className="text-center"><LoadingUi /></div>;
  }

  return (
    <div className="p-5">
      {/* Performance Stats Card */}
      <h2 className="mb-4 text-3xl font-bold text-center">Performance Stats</h2>
      <div id="performanceStats" className="mb-6 rounded-lg">
        <div className="p-6 mx-80 bg-white rounded-lg md:p-8 dark:bg-gray-800">
          <dl className="grid grid-cols-1 gap-6 mx-auto text-gray-900 sm:grid-cols-2 lg:grid-cols-3 dark:text-white">
            <div className="flex gap-4 rounded-lg bg-[#0369a1] text-white h-52 flex-col items-center justify-center">
              <dt className="mb-2 text-3xl font-extrabold">{completionStats.completionRate.toFixed(2)}%</dt>
              <dd className="text-xl">Performance Score</dd>
            </div>
            <div className="flex gap-4 rounded-lg bg-[#0369a1] text-white flex-col items-center justify-center">
              <dt className="mb-2 text-3xl font-extrabold">{completionStats.totalCourses}</dt>
              <dd className="text-xl">Total Courses Assigned</dd>
            </div>
            <div className="flex gap-4 rounded-lg bg-[#0369a1] text-white flex-col items-center justify-center">
              <dt className="mb-2 text-3xl font-extrabold">{completionStats.completedCourses}</dt>
              <dd className="text-xl">Courses Completed</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* <div>
        <EmployeeLearningPath/>
        </div> */}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold mx-auto ">Courses</h2>
        
        <div className='mr-44'>
            <label htmlFor="" className='text-xl'>Select tag </label>
          <select
            className="border border-gray-300 p-2 rounded"
            value={selectedTag}
            onChange={handleTagChange}
          >
            {tags.map((tag, index) => (
              <option key={index} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>


      <div className='pl-16'>
        <div className="flex flex-wrap gap-20"> 
          {filteredCourses.length === 0 ? (
            <p>No courses available for the selected tag.</p>
          ) : (
            filteredCourses.map((course) => (
              <div key={course.course_id?._id} className="w-[20%] h-3/5 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 transition-transform transform hover:scale-105">
                <a href={`/courses/${course.course_id?._id}`}>
                  <img
                    className="rounded-t-lg h-44 w-full object-cover"
                    src={course.course_id?.imageUrl ? `${course.course_id?.imageUrl}` : img}
                    alt={course.course_id?.title || 'Placeholder image'}
                  />
                </a>
                <div className="p-5">
                  <a href={`/courses/${course.course_id?._id}`}>
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {course.course_id?.title}
                    </h5>
                    <h6 className='mb-4 text-lg font-semibold w-fit p-2 border-2 border-black rounded-xl'>{course.course_id?.tag}</h6>
                  </a>
                  <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700 mb-2">
                    <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${course.completion_percentage}%` }}>
                      {course.completion_percentage || 0}%
                    </div>
                  </div>
                  <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                    <span dangerouslySetInnerHTML={{ __html: course.course_id?.description.slice(0, 50) }} />
                    {course.course_id?.description.length > 50 ? '...' : ''}
                  </p>

                  <p className="font-normal text-gray-700 dark:text-gray-400 my-1"><span className='font-bold'>Modules:</span> {course.totalModules}</p>
                  <p className="font-normal text-gray-700 dark:text-gray-400 my-1"><span className='font-bold'>Duration:</span> {course.course_id?.duration} hours</p>
                  <p className="font-normal text-gray-700 dark:text-gray-400 my-2"><span className='font-bold'>Modules Completed:</span> {course.modulesCompleted || 0}</p>
                  
                  <div className='flex justify-between mt-4'>
                    <Link to={`/courses/${course.course_id?._id}`}>
                      <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        View Details
                      </button>
                    </Link>
                    {course.course_id && course.completion_percentage === 100 && (
                      <button
                        className="inline-flex items-center ml-1 px-4 py-2 text-sm font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                        onClick={() => downloadCertificate(course.course_id?._id)}
                      >
                        Get Certificate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
