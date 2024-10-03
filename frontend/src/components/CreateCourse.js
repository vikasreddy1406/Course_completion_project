
import React, { useState, useContext } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';
import { Button, TextInput, Label } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { alertContext } from '../context/alertContext';

const CreateCourse = () => {
  const [newCourse, setNewCourse] = useState({ title: '', description: '', tag: '' });
  const [image, setImage] = useState(null); // State to store the image file
  const [modules, setModules] = useState([]);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleContent, setModuleContent] = useState('');
  const [moduleDuration, setModuleDuration] = useState('');
  const [courseCreated, setCourseCreated] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const navigate = useNavigate();

  // Handle image upload
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  let { showAlert } = useContext(alertContext);

  // Handle course creation
  const handleCreateCourse = async () => {
    if (!newCourse.title || !newCourse.description || !newCourse.tag) {
      showAlert('Please fill out all fields before creating the course');
      return;
    }

    const formData = new FormData();
    formData.append('title', newCourse.title);
    formData.append('description', newCourse.description);
    formData.append('tag', newCourse.tag);
    if (image) {
      formData.append('image', image); // Append the image to the form data
    }

    try {
      const response = await axios.post('http://localhost:4000/api/admin/create-courses', formData, {
        headers: {
          Authorization: `Bearer ${Cookie.get('accessToken')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setCourseId(response.data.course._id);
      setCourseCreated(true);
      showAlert('Course created successfully');
    } catch (error) {
      console.error('Error creating course:', error);
      showAlert('Error creating course. Please try again.');
    }
  };

  const handleAddModule = async () => {
    if (!moduleTitle || !moduleContent || !moduleDuration || !courseId) {
      showAlert('Please fill out all module fields before adding a module');
      return;
    }

    const newModule = { module_title: moduleTitle, module_content: moduleContent, module_duration: moduleDuration };

    try {
      const response = await axios.post(`http://localhost:4000/api/admin/courses/${courseId}/add-modules`, newModule, {
        headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
      });
      setModules([...modules, response.data.module]); // Update local modules state
      setModuleTitle('');
      setModuleContent('');
      setModuleDuration('');
      showAlert('Module added successfully');
    } catch (error) {
      console.error('Error adding module:', error);
      showAlert('Error adding module. Please try again.');
    }
  };

  const handleSaveClick = async () => {
    try {
      await axios.put(`http://localhost:4000/api/admin/courses/${courseId}/update-details`, {}, {
        headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
      });
      showAlert('Course details updated successfully');
    } catch (error) {
      console.error('Error updating course details:', error);
      showAlert('Error updating course details. Please try again.');
    }
    navigate('/admin');
  };

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-10 shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Create a New Course</h1>

        <div className="mb-4">
          <Label className="text-gray-600">Course Title</Label>
          <TextInput
            value={newCourse.title}
            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
            className="border p-2 mt-1 w-full"
            disabled={courseCreated}
          />
        </div>

        <div className="mb-4">
          <Label className="text-gray-600">Course Description</Label>
          <CKEditor
            editor={ClassicEditor}
            data={newCourse.description}
            onChange={(event, editor) => {
              const data = editor.getData();
              setNewCourse({ ...newCourse, description: data });
            }}
            disabled={courseCreated}
          />
        </div>

        <div className="mb-4">
          <Label className="text-gray-600">Tag</Label>
          <select
            value={newCourse.tag}
            onChange={(e) => setNewCourse({ ...newCourse, tag: e.target.value })}
            className="border rounded p-2 mt-1 w-full"
            disabled={courseCreated}
          >
            <option value="">Select a tag</option>
            <option value="Web Development">Web Development</option>
            <option value="Data Engineering">Data Engineering</option>
            <option value="Data Science">Data Science</option>
            <option value="Generative AI">Generative AI</option>
            <option value="DevOps">DevOps</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Software Testing">Software Testing</option>
          </select>
        </div>

        <div className="mb-4">
          <Label className="text-gray-600">Upload Course Image</Label>
          <input type="file" onChange={handleImageChange} className="border p-2 w-full" disabled={courseCreated} />
        </div>

        <button type='button'
          onClick={handleCreateCourse}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl text-white font-semibold py-2 rounded-lg mb-6"
          disabled={courseCreated}
        >
          Create Course
        </button>

        {courseCreated && (
          <div className="mt-6">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Add Modules</h3>

            <div className="mb-4">
              <Label className="text-gray-600">Module Title</Label>
              <TextInput
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                className="border p-2 mt-1 w-full"
              />
            </div>

            <div className="mb-4">
              <Label className="text-gray-600">Module Content</Label>
              <CKEditor
                editor={ClassicEditor}
                data={moduleContent}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setModuleContent(data);
                }}
              />
            </div>

            <div className="mb-4">
              <Label className="text-gray-600">Duration (in hours)</Label>
              <input type='number'
                value={moduleDuration}
                onChange={(e) => setModuleDuration(e.target.value)}
                className="border p-2 mt-1 w-full"
              />
            </div>

            <button type='button'
              onClick={handleAddModule}
              className="w-full text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            >
              Add Module
            </button>

            <ul className="mt-4">
              {modules.map((module, index) => (
                <li key={index} className="text-gray-700 font-medium">
                  {module.module_title} - {module.module_duration}hrs
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button type='button'
            onClick={handleSaveClick}
            className="w-full text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            Save
          </button>

          <button type='button'
            onClick={() => navigate('/admin')}
            className="w-full text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;

