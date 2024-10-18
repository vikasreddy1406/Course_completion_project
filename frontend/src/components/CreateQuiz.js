import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { TextInput, Label } from 'flowbite-react'; 
import { alertContext } from '../context/alertContext';
import { Navigate, useNavigate } from 'react-router-dom';

const CreateQuiz = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
  ]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);

  let navigate = useNavigate()

  const { showAlert } = useContext(alertContext);

  useEffect(() => {
    // Fetch courses that don't have a quiz yet
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/admin/courses-without-quiz');
        setCourses(response.data);
      } catch (error) {
        showAlert('Error fetching courses. Please try again.');
      }
    };

    fetchCourses();
  }, []);

  const handleAddQuestion = () => {
    if (!questionText || correctAnswerIndex === null || correctAnswerIndex === undefined) {
      showAlert('Please provide a question and the correct answer.');
      return;
    }

    const newQuestion = {
      question_text: questionText,
      options: options.map((option, index) => ({
        option_text: option.option_text,
        is_correct: index === correctAnswerIndex,  
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
      await axios.post(`http://localhost:4000/api/admin/create-quiz/${selectedCourse}`, { questions });
      showAlert('Quiz added successfully');
      setQuestions([]); 
      navigate("/admin")
    } catch (error) {
      showAlert('Error adding quiz. Please try again.');
    }
  };

  return (
    <div className="container mx-auto my-8 border-2 p-5">
      <h2 className="text-3xl font-bold mb-6 text-center">Create Quiz</h2>

      {/* Dropdown for selecting a course */}
      <div className="mb-6">
        <Label className="text-gray-600">Select Course</Label>
        <select
          className="border p-2 w-full mt-2"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="" >Select a course</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Quiz creation section */}
      {selectedCourse && (
        <div>
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
                  value={option.option_text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="border p-2 w-full"
                />
              </div>
            ))}
          </div>

          <div className="mb-4">
            <Label className="text-gray-600">Correct Answer</Label>
            <select
              onChange={(e) => setCorrectAnswerIndex(Number(e.target.value))}
              className="border p-2 w-full"
            >
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
    </div>
  );
};

export default CreateQuiz;
