import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card } from 'flowbite-react';
import { IoReturnDownBack } from 'react-icons/io5';
import tick from "../assests/tick.jpg"
import cross from "../assests/cross.png"
import api from "../api/api"

const QuizPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizNotFound, setQuizNotFound] = useState(false);
  const passingScore = 50; 

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/api/user/quiz/${courseId}`, {
          headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
        });
        setQuiz(response.data[0]);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setQuizNotFound(true);
        } else {
          console.error('Error fetching quiz:', error);
        }
      }
    };

    fetchQuiz();
  }, [courseId]);

  const handleAnswerChange = (questionIndex, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption.option_text,
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      const response = await api.post(`/api/user/submit-quiz/${courseId}`, {
        quizId: quiz._id,
        answers,
      }, {
        headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
      });
      setScore(response.data.score);
      setQuizCompleted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const handleBackClick = () => {
    navigate(`/courses/${courseId}`);
  };

  if (quizNotFound) {
    return <div className="text-center text-xl">No quiz available for this course</div>;
  }

  if (!quiz) {
    return <div>Loading...</div>;
  }

  if (quizCompleted) {
    return (
      <div className="p-6  mx-auto text-center max-w-xl">
        <Card className="mb-5 shadow-lg">
          {score >= passingScore ? (
            <div className=' flex justify-center flex-col items-center gap-4'>
              <img src={tick} className='w-52 h-44' alt="" />
              <h2 className="text-2xl font-bold text-green-600">Congratulations, you passed!</h2>
              <p><span className='score font-bold text-green-600'>Your Score:</span>  {score.toFixed(2)}</p>
            </div>
          ) : (
            <div className=' flex justify-center flex-col items-center gap-4'>
                <img src={cross} className='w-52 h-44' alt="" />
              <h2 className="text-2xl font-bold text-red-600">Sorry, you failed.</h2>
              <p><span className=' font-extrabold text-red-600'>Your Score:</span>  {score.toFixed(2)}</p>
            </div>
          )}
          <Button className='mt-4 text-white bg-[#008080] hover:bg-[#105858]' onClick={handleBackClick}>Back to Course Details</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6  max-w-4xl mx-auto">
      <Card className="mb-5 shadow-lg relative">
        {/* Back Button */}
        <button
          className="absolute top-3 right-3 bg-red-500 text-xl text-white p-2 rounded-sm hover:bg-red-600"
          onClick={handleBackClick}
        >
          <IoReturnDownBack />
        </button>
        <h2 className="text-3xl font-bold mb-6 text-center">Quiz</h2>
        {quiz.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="mb-2 bg-[#ddd] rounded-sm ">
            <h3 className="text-lg bg-[#008080] text-white font-semibold mb-2 px-2 py-1 rounded-sm">{questionIndex+1}. {question.question_text} ?</h3>
            {question.options.map((option) => (
              <div key={option._id} className="answers flex items-center border-b-2 border-gray-400 mb-2 px-2">
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  value={option.option_text}
                  checked={answers[questionIndex] === option.option_text}
                  onChange={() => handleAnswerChange(questionIndex, option)}
                  className="mr-2 "
                />
                <label>{option.option_text}</label>
              </div>
            ))}
          </div>
        ))}
        <Button className='text-white bg-[#008080] hover:bg-[#0d4e4e]' onClick={handleSubmitQuiz}>Submit Quiz</Button>
      </Card>
    </div>
  );
};

export default QuizPage;
