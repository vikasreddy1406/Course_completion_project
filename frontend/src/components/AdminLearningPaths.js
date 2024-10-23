import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';
import { alertContext } from '../context/alertContext';
import { Navigate, useNavigate } from 'react-router-dom';
import api from "../api/api"

export default function AdminLearningPaths() {
    const [courses, setCourses] = useState([]);
    const [learningPath, setLearningPath] = useState({
        title: '',
        description: '',
        selectedCourses: [],
    });

    let { showAlert } = useContext(alertContext);
    let navigate = useNavigate()

    useEffect(() => {
        const fetchCourses = async () => {
            const response = await api.get('/api/admin/get-courses', {
                headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
            });
            setCourses(response.data);
        };
        fetchCourses();
    }, []);

    const handleCreateLearningPath = async () => {
        try {
            await api.post('/api/learningpath/create-learningpath', {
                title: learningPath.title,
                description: learningPath.description,
                courses: learningPath.selectedCourses,
            });
            showAlert('Learning path created successfully');
            navigate("/admin");
        } catch (error) {
            console.error('Error creating learning path:', error);
        }
    };

    return (
        <div className="p-2 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white p-10 shadow-md rounded-lg">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Create a New Learning Path</h1>

                <div className="mb-4">
                    <label className="text-gray-600">Learning Path Title</label>
                    <input
                        type="text"
                        placeholder="Title"
                        value={learningPath.title}
                        onChange={(e) => setLearningPath({ ...learningPath, title: e.target.value })}
                        className="border p-2 mt-1 w-full"
                    />
                </div>

                <div className="mb-4">
                    <label className="text-gray-600">Learning Path Description</label>
                    <textarea
                        placeholder="Description"
                        value={learningPath.description}
                        onChange={(e) => setLearningPath({ ...learningPath, description: e.target.value })}
                        className="border p-2 mt-1 w-full"
                    />
                </div>

                

                <div className="mb-4">
                    <label className="text-gray-600">Select Courses</label>
                    <div className="border p-2 mt-1 w-full">
                        {courses.map((course) => (
                            <div key={course._id} className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    value={course._id}
                                    onChange={(e) => {
                                        const selectedCourses = [...learningPath.selectedCourses];
                                        if (e.target.checked) {
                                            selectedCourses.push(e.target.value);
                                        } else {
                                            const index = selectedCourses.indexOf(e.target.value);
                                            if (index > -1) {
                                                selectedCourses.splice(index, 1);
                                            }
                                        }
                                        setLearningPath({ ...learningPath, selectedCourses });
                                    }}
                                    className="mr-2"
                                />
                                <label className="text-gray-600">{course.title}</label>
                            </div>
                        ))}
                    </div>
                </div>


                <button
                    onClick={handleCreateLearningPath}
                    className="w-full text-white bg-[#0369a1] focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-6"
                >
                    Create Learning Path
                </button>
            </div>
        </div>
    );
}
