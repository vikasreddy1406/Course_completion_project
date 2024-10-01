import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';
import { Link } from 'react-router-dom';
import { Card, Button, Progress } from 'flowbite-react';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [completionStats, setCompletionStats] = useState({ totalCourses: 0, completedCourses: 0, completionRate: 0 });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
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
        const response = await axios.get('http://localhost:4000/api/user/courses/completion-stats', {
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

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="p-5">
      {/* Performance Stats Card */}
      <div className="mb-4">
        <Card>
          <h2 className="text-lg font-bold">Your Performance Stats</h2>
          <p>Total Courses Assigned: {completionStats.totalCourses}</p>
          <p>Courses Completed: {completionStats.completedCourses}</p>
          <Progress progress={completionStats.completionRate} label={`${completionStats.completionRate.toFixed(2)}%`} />
        </Card>
      </div>

      {/* Courses List */}
      <h2 className="text-xl font-bold mb-4">Assigned Courses</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => (
          <Card key={course.course_id._id} className="shadow-lg">
            <h5 className="text-lg font-bold">{course.course_id.title}</h5>
            <p>{course.course_id.description}</p>
            <p>Modules: {course.course_id.modules}</p>
            <p>Duration: {course.course_id.duration} hours</p>
            <p>Modules Completed: {course.modulesCompleted || 0}</p>
            <p>Completion Percentage: {course.completion_percentage || 0}%</p>
            <Link to={`/courses/${course.course_id._id}`} className="mt-3">
              <Button className='text-black'>
                View Course
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;
