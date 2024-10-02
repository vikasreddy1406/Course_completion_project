import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookie from 'js-cookie';
import { Link, useNavigation } from 'react-router-dom';
import { Card, Button, Progress } from 'flowbite-react';
import { jwtDecode } from 'jwt-decode';  

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [completionStats, setCompletionStats] = useState({ totalCourses: 0, completedCourses: 0, completionRate: 0 });
  const [loading, setLoading] = useState(true);
  let navigate=useNavigate()

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
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="p-5">
      <div className="mb-4">
        <Card>
          <h2 className="text-lg font-bold">Your Performance Stats</h2>
          <h3 className="text-lg font-bold">Performance Score: {completionStats.completionRate.toFixed(2)}%</h3>
          <p>Total Courses Assigned: {completionStats.totalCourses}</p>
          <p>Courses Completed: {completionStats.completedCourses}</p>
          <Progress progress={completionStats.completionRate} label={`${completionStats.completionRate.toFixed(2)}%`} />
        </Card>
      </div>

      <h2 className="text-xl font-bold mb-4">Assigned Courses</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Card key={course.course_id?._id} className="shadow-lg">
            {/* Display course image */}
            <img
              src={`http://localhost:4000${course.course_id?.imageUrl}`}
              alt={course.course_id?.title}
              className="w-full h-48 object-cover mb-4"
            />

            <h5 className="text-lg font-bold">
              {course.course_id?.title} - {course.course_id?.tag}
            </h5>
            <p dangerouslySetInnerHTML={{ __html: course.course_id?.description }}></p> {/* Render HTML */}
            <p>Modules: {course.totalModules}</p>
            <p>Duration: {course.course_id?.duration} hours</p>
            <p>Modules Completed: {course.modulesCompleted || 0}</p>
            <p>Completion Percentage: {course.completion_percentage || 0}%</p>

            <Link to={`/courses/${course.course_id?._id}`} className="mt-3">
              <Button className="text-black">View Course</Button>
            </Link>

            {/* Download Certificate button: visible only if the course is completed */}
            {course.completion_percentage === 100 && (
              <Button
                className="mt-2 bg-green-500 text-white"
                onClick={() => downloadCertificate(course.course_id?._id)}
              >
                Download Certificate
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;


