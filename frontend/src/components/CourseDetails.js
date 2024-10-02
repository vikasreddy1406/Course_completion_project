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
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [openAccordionIndex, setOpenAccordionIndex] = useState(null); // State to manage which accordion is open

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/user/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
        });
        setCourse(response.data.course);
        setModules(response.data.modules);
        calculateCompletionPercentage(response.data.modules);
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const calculateCompletionPercentage = (modules) => {
    const completedModules = modules.filter(module => module.is_completed).length;
    const totalModules = modules.length;
    const percentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
    setCompletionPercentage(percentage);
  };

  const markAsCompleted = async (moduleId) => {
    try {
      await axios.patch(`http://localhost:4000/api/user/courses/${courseId}/modules/${moduleId}`, {}, {
        headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
      });
      const updatedModules = modules.map(mod =>
        mod._id === moduleId ? { ...mod, is_completed: true } : mod
      );
      setModules(updatedModules);
      calculateCompletionPercentage(updatedModules);
    } catch (error) {
      console.error('Error marking module as completed:', error);
    }
  };

  // Function to toggle the accordion
  const toggleAccordion = (index) => {
    setOpenAccordionIndex(openAccordionIndex === index ? null : index);
  };

  if (loading) {
    return <div className="text-center text-lg font-semibold">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="mb-5 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Tag: {course.tag}</h3>
        <p className="text-gray-600 mb-3">Total Duration: {course.total_duration} hours</p>
        <p className="text-gray-600 mb-3">Completion Percentage: {completionPercentage.toFixed(2)}%</p>
        <p dangerouslySetInnerHTML={{ __html: course.description }} className="text-gray-600 mb-4"></p> {/* Render HTML */}
      </Card>

      <h3 className="text-xl font-bold mb-4">Modules:</h3>
      <div id="accordion-collapse">
        {modules.map((module, index) => (
          <div key={module._id}>
            <h2>
              <button
                type="button"
                className="flex items-center justify-between w-full p-5 font-medium text-gray-500 border border-b-0 border-gray-200 rounded-t-xl hover:bg-gray-100 focus:ring-4 focus:ring-gray-200"
                onClick={() => toggleAccordion(index)} // Toggle accordion on click
                aria-expanded={openAccordionIndex === index} // Set aria attribute for accessibility
              >
                <span>{module.module_title}</span>
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${openAccordionIndex === index ? 'rotate-180' : ''
                    }`}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5" />
                </svg>
              </button>
            </h2>
            <div
              className={`p-5 border border-b-0 border-gray-200 ${openAccordionIndex === index ? '' : 'hidden'}`} // Show/hide content based on state
              aria-labelledby={`accordion-collapse-heading-${index}`}
            >
              <p dangerouslySetInnerHTML={{ __html: module.module_content }} className="text-gray-600 mb-2"></p> {/* Render HTML */}
              <p className="text-gray-500 mb-3">Duration: {module.module_duration} hours</p>
              {!module.is_completed ? (
                <Button className='bg-blue-500 text-white' onClick={() => markAsCompleted(module._id)}>Mark as Read</Button>
              ) : (
                <Button className='bg-green-500 text-white' disabled>Completed</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetails;
