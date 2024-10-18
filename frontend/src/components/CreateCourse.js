
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
  const [image, setImage] = useState(null); 
  const [modules, setModules] = useState([]);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleContent, setModuleContent] = useState('');
  const [moduleDuration, setModuleDuration] = useState('');
  const [courseCreated, setCourseCreated] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const [moduleAdded, setModuleAdded] = useState(0);
  const navigate = useNavigate();
  
  // New states for quiz creation
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
  ]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);

  let { showAlert } = useContext(alertContext);

  // Handle image upload
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

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
      formData.append('image', image); 
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
      setModules([...modules, response.data.module]); 
      setModuleTitle('');
      setModuleContent('');
      setModuleDuration('');
      setModuleAdded(moduleAdded + 1);
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

  // Quiz handling functions
  const handleAddQuestion = () => {
    if (!questionText || correctAnswerIndex === null || correctAnswerIndex === undefined) {
      showAlert('Please provide a question and the correct answer.');
      return;
    }

    const newQuestion = {
      question_text: questionText,
      options: options.map((option, index) => ({
        option_text: option.option_text,
        is_correct: index === correctAnswerIndex,  // Mark the correct answer
      })),
    };

    setQuestions([...questions, newQuestion]);
    setQuestionText('');
    setOptions([
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
    ]);
    setCorrectAnswerIndex(null);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].option_text = value;
    setOptions(newOptions);
  };

  const handleQuizSubmission = async () => {
    if (questions.length === 0) {
      showAlert('Please add at least one question before submitting the quiz.');
      return;
    }

    try {
      await axios.post(`http://localhost:4000/api/admin/create-quiz/${courseId}`, { questions });
      showAlert('Quiz added successfully');
    } catch (error) {
      console.error('Error adding quiz:', error);
      showAlert('Error adding quiz. Please try again.');
    }
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
          className="w-full text-white bg-[#0369a1] focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-6"
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

            <button
              type="button"
              onClick={handleAddModule}
              className="w-full text-white bg-[#0f172a] focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-6"
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


        {/* Quiz creation section */}
        {courseCreated && (
          <div className="mt-8">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Create Quiz</h3>

            <div className="mb-4">
              <Label className="text-gray-600">Question</Label>
              <TextInput
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="border p-2 mt-1 w-full"
              />
            </div>

            <div className="mb-4">
              <Label className="text-gray-600">Options</Label>
              {options.map((option, index) => (
                <div key={index} className="flex items-center mb-2">
                  <span className="mr-2">{index + 1}.</span>
                  <TextInput
                    label={`Option ${index + 1}`}
                      value={option.option_text}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                    
                    className="border p-2 w-full"
                  />
                </div>
              ))}
            </div>

            <div className="mb-4">
              <Label className="text-gray-600">Correct Answer</Label>
              <select onChange={(e) => setCorrectAnswerIndex(Number(e.target.value))} className="border p-2 w-full">
            {options.map((_, index) => (
              <option key={index} value={index}>
                Option {index + 1}
              </option>
            ))}
            
          </select>
            </div>

            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full text-white bg-[#0369a1] focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-6"
            >
              Add Question
            </button>
            {/* Display added questions */}
              <ul className="my-4">
                {questions.map((question, index) => (
                  <li key={index} className="text-gray-700 font-medium">
                    Question {index + 1}: {question.question_text}
                  </li>
                ))}
              </ul>
            <button
              type="button"
              onClick={handleQuizSubmission}
              className="w-full text-white bg-[#0f172a] focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-6"
            >
              Submit Quiz
            </button>
          </div>
        )} 

        <button
          onClick={handleSaveClick}
          className="w-full text-white bg-[#1d4ed8] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Save Course & Modules
        </button>
      </div>
    </div>
  );
};

export default CreateCourse;
