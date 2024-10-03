import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from 'flowbite-react';

const CourseDetails = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [openAccordionIndex, setOpenAccordionIndex] = useState(null); // State to manage which accordion is open

  let navigate=useNavigate()

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
    <div className="p-6 max-w-7xl mx-auto">
      
      <Card className="mb-5 shadow-lg relative"> {/* Make the card relative for absolute positioning */}
      {/* Back Button */}
      <button
        className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
        onClick={() => navigate("/")} // Navigate to the home page
      >
        Back
      </button>
      
      <div className='flex flex-row-reverse justify-between mt-6'> {/* Added margin-top for space between image and button */}
        <div className='w-full'>
          <img
            className="rounded-t-lg h-48 w-full object-cover"
            src={`http://localhost:4000${course.imageUrl}`}
            alt={course.course_id?.title}
          />
        </div>
        <div className='w-full'>
          <div>
            <h2 className="text-3xl font-bold mb-2 text-center">{course.title}</h2>
            <h3 className="mb-4 text-lg font-semibold w-fit p-2 border-2 border-black rounded-xl">{course.tag}</h3>
          </div>
          <div>
            <p className="mb-3 text-lg text-black"><span className='font-bold'>Duration:</span> {course.duration} hours</p>
            <div className="w-[95%] bg-gray-200 rounded-full dark:bg-gray-700 mb-2">
              <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{width: `${completionPercentage.toFixed(2)}%`}}> 
                {completionPercentage.toFixed(2) || 0}%
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className='font-bold text-lg'>About Course:</p>
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
                
                <div className='flex justify-between w-full'>
            <div className='text-left text-black font-semibold text-xl'> 
              {module.module_title}
            </div>
            <div className='text-right mr-2'> 
              {module.module_duration} hours
            </div>
          </div>
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
              {/* <p className="text-gray-500 mb-3">Duration: {module.module_duration} hours</p> */}
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
