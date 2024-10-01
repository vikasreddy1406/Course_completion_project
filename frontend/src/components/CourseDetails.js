import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';
import { useParams } from 'react-router-dom';
import { Card, Button } from 'flowbite-react';

const CourseDetails = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/user/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
        });
        setCourse(response.data.course);
        setModules(response.data.modules);
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const markAsCompleted = async (moduleId) => {
    try {
      await axios.patch(`http://localhost:4000/api/user/courses/${courseId}/modules/${moduleId}`, {}, {
        headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
      });
      // Optionally refresh the modules after marking
      const updatedModules = modules.map(mod => 
        mod._id === moduleId ? { ...mod, is_completed: true } : mod
      );
      setModules(updatedModules);
    } catch (error) {
      console.error('Error marking module as completed:', error);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">{course.title}</h2>
      <p>{course.description}</p>
      <h3 className="mt-4">Modules:</h3>
      <div className="grid grid-cols-1 gap-4">
        {modules.map(module => (
          <Card key={module._id} className="shadow-lg">
            <h5 className="text-lg font-bold">{module.module_title}</h5>
            <p>{module.module_content}</p>
            <p>Duration: {module.module_duration} hours</p>
            {!module.is_completed ? (
              <Button className='text-black' onClick={() => markAsCompleted(module._id)}>Mark as Read</Button>
            ) : (
              <Button className='text-black' disabled>Completed</Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseDetails;
