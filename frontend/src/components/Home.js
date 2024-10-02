import React, { useEffect, useState,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookie from 'js-cookie';
import { Link, useNavigation } from 'react-router-dom';
import { Card, Button, Progress } from 'flowbite-react';
import { jwtDecode } from 'jwt-decode';
import { alertContext } from '../context/alertContext';
import LoadingUi from "./LoadingUi";  

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [completionStats, setCompletionStats] = useState({ totalCourses: 0, completedCourses: 0, completionRate: 0 });
  const [loading, setLoading] = useState(true);
  let navigate = useNavigate()
  
  let { showAlert}=useContext(alertContext)

  useEffect(() => {

    if (!Cookie.get('accessToken')) {
      navigate("/login");
    }

    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/user/get-courses', {
          headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
        });
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching assigned courses:', error);
      }
    };

    const fetchCompletionStats = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/user/stats/completion', {
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

  // Function to handle certificate download
  const downloadCertificate = async (courseId) => {
    try {
      const decodedToken = jwtDecode(Cookie.get('accessToken'));
      const employeeId = decodedToken._id;
      const response = await axios.get(`http://localhost:4000/api/user/certificate/${employeeId}/${courseId}`, {
        headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
        responseType: 'blob', // Set to blob to handle binary data (PDF)
      });

      // Create a link to download the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'certificate.pdf'); // Filename for the certificate
      document.body.appendChild(link);
      link.click();
      link.remove();
      showAlert("Certificate downloaded successfully")
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  if (loading) {
    return <div className="text-center"><LoadingUi/></div>;
  }

  return (
    <div className="p-5">
      <div id="performanceStats" className="border-2 mb-4 border-gray-200 dark:border-gray-600">
        <div className="p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-center">Your Performance Stats</h2>
          <dl className="grid grid-cols-1 gap-8 mx-auto text-gray-900 sm:grid-cols-2 lg:grid-cols-3 dark:text-white sm:p-8">
            <div className="flex flex-col items-center justify-center">
              <dt className="mb-2 text-3xl font-extrabold">{completionStats.completionRate.toFixed(2)}%</dt>
              <dd className="text-gray-500 dark:text-gray-400">Performance Score</dd>
            </div>
            <div className="flex flex-col items-center justify-center">
              <dt className="mb-2 text-3xl font-extrabold">{completionStats.totalCourses}</dt>
              <dd className="text-gray-500 dark:text-gray-400">Total Courses Assigned</dd>
            </div>
            <div className="flex flex-col items-center justify-center">
              <dt className="mb-2 text-3xl font-extrabold">{completionStats.completedCourses}</dt>
              <dd className="text-gray-500 dark:text-gray-400">Courses Completed</dd>
            </div>
            
          </dl>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Assigned Courses</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          // <Card key={course.course_id?._id} className="shadow-lg">
          //   {/* Display course image */}
          //   <img
          //     src={`http://localhost:4000${course.course_id?.imageUrl}`}
          //     alt={course.course_id?.title}
          //     className="w-full h-48 object-cover mb-4"
          //   />

          //   <h5 className="text-lg font-bold">
          //     {course.course_id?.title} - {course.course_id?.tag}
          //   </h5>
          //   <p dangerouslySetInnerHTML={{ __html: course.course_id?.description }}></p> {/* Render HTML */}
          //   <p>Modules: {course.totalModules}</p>
          //   <p>Duration: {course.course_id?.duration} hours</p>
          //   <p>Modules Completed: {course.modulesCompleted || 0}</p>
          //   <p>Completion Percentage: {course.completion_percentage || 0}%</p>

          //   <Link to={`/courses/${course.course_id?._id}`} className="mt-3">
          //     <Button className="text-black">View Course</Button>
          //   </Link>

          //   {/* Download Certificate button: visible only if the course is completed */}
          //   {course.completion_percentage === 100 && (
          //     <Button
          //       className="mt-2 bg-green-500 text-white"
          //       onClick={() => downloadCertificate(course.course_id?._id)}
          //     >
          //       Download Certificate
          //     </Button>
          //   )}
          // </Card>
          <div key={course.course_id?._id} className="max-w-md bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            {/* Display course image */}
            <a href={`/courses/${course.course_id?._id}`}>
              <img
                className="rounded-t-lg h-48 w-full object-cover"
                src={`http://localhost:4000${course.course_id?.imageUrl}`}
                alt={course.course_id?.title}
              />
            </a>
            <div className="p-5">
              <a href={`/courses/${course.course_id?._id}`}>
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {course.course_id?.title} - {course.course_id?.tag}
                </h5>
              </a>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: course.course_id?.description }}></p>
              <p className="font-normal text-gray-700 dark:text-gray-400">Modules: {course.totalModules}</p>
              <p className="font-normal text-gray-700 dark:text-gray-400">Duration: {course.course_id?.duration} hours</p>
              <p className="font-normal text-gray-700 dark:text-gray-400">Modules Completed: {course.modulesCompleted || 0}</p>
              <p className="font-normal text-gray-700 dark:text-gray-400">Completion Percentage: {course.completion_percentage || 0}%</p>

              <div className='flex justify-between'>
                <Link to={`/courses/${course.course_id?._id}`}>
                  <button className="inline-flex items-center px-3 py-2 mt-3 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    View Course
                    <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                    </svg>
                  </button>
                </Link>

                {/* Download Certificate button: visible only if the course is completed */}
                {course.completion_percentage === 100 && (
                  <button
                    className="mt-2 bg-green-500 text-white inline-flex items-center px-3 py-2 rounded-lg hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                    onClick={() => downloadCertificate(course.course_id?._id)}
                  >
                    Download Certificate
                  </button>
                )}
              </div>
            </div>
          </div>

        ))}
      </div>
    </div>
  );
};

export default Home;


