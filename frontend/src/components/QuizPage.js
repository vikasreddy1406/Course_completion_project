import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';
import { useParams } from 'react-router-dom';
import { Button, Card } from 'flowbite-react';

const QuizPage = () => {
  const { courseId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/user/quiz/${courseId}`, {
          headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
        });
        setQuiz(response.data[0]); // Set the first quiz from the response array
      } catch (error) {
        console.error('Error fetching quiz:', error);
      }
    };

    fetchQuiz();
  }, [courseId]);

  const handleAnswerChange = (questionIndex, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption.option_text, // Store the text of the selected option
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      const response = await axios.post(`http://localhost:4000/api/user/submit-quiz/${courseId}`, {
        quizId: quiz._id, // Include the quiz ID in the submission
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

  if (!quiz) {
    return <div>Loading...</div>;
  }

  if (quizCompleted) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold">Quiz Completed!</h2>
        <p>Your Score: {score}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        <h2 className="text-3xl font-bold mb-6 text-center">Quiz for Course ID: {quiz.course_id}</h2>
        {quiz.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{question.question_text}</h3>
            {question.options.map((option) => (
              <div key={option._id} className="flex items-center mb-2">
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  value={option.option_text} // Set the value to the option text
                  checked={answers[questionIndex] === option.option_text} // Check if the answer is the selected text
                  onChange={() => handleAnswerChange(questionIndex, option)} // Pass the entire option
                  className="mr-2"
                />
                <label>{option.option_text}</label>
              </div>
            ))}
          </div>
        ))}
        <Button className='text-black' onClick={handleSubmitQuiz}>Submit Quiz</Button>
      </Card>
    </div>
  );
};

export default QuizPage;
