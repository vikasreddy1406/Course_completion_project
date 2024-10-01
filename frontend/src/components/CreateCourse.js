import React, { useState } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';
import { Button, TextInput, Label } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';

const CreateCourse = () => {
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const [modules, setModules] = useState([]); // Store modules for the new course
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleContent, setModuleContent] = useState('');
  const [moduleDuration, setModuleDuration] = useState('');
  const [courseCreated, setCourseCreated] = useState(false);
  const [courseId, setCourseId] = useState(null); // Store the course ID
  const navigate = useNavigate();

  // Handle course creation
  const handleCreateCourse = async () => {
    try {
      const response = await axios.post('http://localhost:4000/api/admin/create-courses', newCourse, {
        headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
      });
    //   console.log(response)
       setCourseId(response.data.course._id); // Store the course ID
      setCourseCreated(true); // Mark the course as created
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  // Handle module addition
  const handleAddModule = async () => {
            // console.log(courseId)
    if (moduleTitle && moduleContent && moduleDuration && courseId) {
      const newModule = { module_title: moduleTitle, module_content: moduleContent, module_duration: moduleDuration };

      try {
        const response = await axios.post(`http://localhost:4000/api/admin/courses/${courseId}/add-modules`, newModule, {
          headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
        });
        setModules([...modules, response.data.module]); // Update local modules state
        setModuleTitle('');
        setModuleContent('');
        setModuleDuration('');
      } catch (error) {
        console.error('Error adding module:', error);
      }
    }
  };

  const handleSaveClick = async () => {
    try {
      await axios.put(`http://localhost:4000/api/admin/courses/${courseId}/update-details`, {}, {
        headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
      });
      alert('Course details updated successfully');
    } catch (error) {
      console.error('Error updating course detailsss:', error);
    }
    navigate('/admin')
  };
  

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-5">Create a New Course</h1>

      <div>
        <Label>Course Title</Label>
        <TextInput
          value={newCourse.title}
          onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
          disabled={courseCreated} // Disable after course creation
        />

        <Label>Course Description</Label>
        <textarea
          value={newCourse.description}
          onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
          className="border rounded p-2 mt-1 w-full"
          rows="4"
          disabled={courseCreated} // Disable after course creation
        />

        {/* <Label>Duration</Label>
        <TextInput
          value={newCourse.duration}
          onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
          disabled={courseCreated} // Disable after course creation
        /> */}
      </div>

      <Button onClick={handleCreateCourse} className="text-black" disabled={courseCreated}>
        Create Course
      </Button>

      {courseCreated && (
        <div className="mt-5">
          <h3 className="text-2xl">Add Modules</h3>

          <div>
            <Label>Module Title</Label>
            <TextInput
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
            />

            <Label>Module Content</Label>
            <textarea
              value={moduleContent}
              onChange={(e) => setModuleContent(e.target.value)}
              className="border rounded p-2 mt-1 w-full"
              rows="4"
            />

            <Label>Duration</Label>
            <TextInput
              value={moduleDuration}
              onChange={(e) => setModuleDuration(e.target.value)}
            />
          </div>

          <Button onClick={handleAddModule} className="text-black">
            Add Module
          </Button>
          <ul className="mt-2">
        {modules.map((module, index) => (
          <li key={index}>{module.module_title} - {module.module_duration}hrs</li>
        ))}
      </ul>
        </div>
        
      )}
      <Button onClick={ handleSaveClick} className="mt-5 text-black">
        Save
      </Button>
      <Button onClick={() => navigate('/admin')} className="mt-5 text-black">
        Back to Admin Home
      </Button>
    </div>
  );
};

export default CreateCourse;
