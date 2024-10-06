import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';
import { alertContext } from '../context/alertContext';
import { useNavigate } from 'react-router-dom';

export default function AssignLearningPath() {
    const [employees, setEmployees] = useState([]);
    const [learningPaths, setLearningPaths] = useState([]);
    const [assignment, setAssignment] = useState({
        selectedEmployees: [],
        selectedLearningPaths: [],
    });

    let { showAlert } = useContext(alertContext);

    let navigate = useNavigate()

    useEffect(() => {
        // Fetch employees
        const fetchEmployees = async () => {
            const response = await axios.get('http://localhost:4000/api/admin/getAllEmployees', {
                headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
            });
            setEmployees(response.data);
        };

        // Fetch learning paths
        const fetchLearningPaths = async () => {
            const response = await axios.get('http://localhost:4000/api/learningpath/get-learningpath');
            setLearningPaths(response.data);
        };

        fetchEmployees();
        fetchLearningPaths();
    }, []);

    const handleAssignLearningPath = async () => {
        try {
            await axios.post('http://localhost:4000/api/learningpath/assign-learningpath', assignment);
            showAlert('Learning path assigned successfully');
            navigate("/admin")
        } catch (error) {
            console.error('Error assigning learning path:', error);
        }
    };

    return (
        <div className="p-2 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white p-10 shadow-md rounded-lg">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Assign Learning Paths to Employees</h1>

                {/* Select Employees */}
                <div className="mb-4">
                    <label className="text-gray-600">Select Employees</label>
                    <div className="border p-2 mt-1 w-full">
                        {employees.map((employee) => (
                            <div key={employee._id} className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    value={employee._id}
                                    onChange={(e) => {
                                        const selectedEmployees = [...assignment.selectedEmployees];
                                        if (e.target.checked) {
                                            selectedEmployees.push(e.target.value);
                                        } else {
                                            const index = selectedEmployees.indexOf(e.target.value);
                                            if (index > -1) {
                                                selectedEmployees.splice(index, 1);
                                            }
                                        }
                                        setAssignment({ ...assignment, selectedEmployees });
                                    }}
                                    className="mr-2"
                                />
                                <label className="text-gray-600">{employee.name}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Select Learning Paths */}
                <div className="mb-4">
                    <label className="text-gray-600">Select Learning Paths</label>
                    <div className="border p-2 mt-1 w-full">
                        {learningPaths.map((path) => (
                            <div key={path._id} className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    value={path._id}
                                    onChange={(e) => {
                                        const selectedLearningPaths = [...assignment.selectedLearningPaths];
                                        if (e.target.checked) {
                                            selectedLearningPaths.push(e.target.value);
                                        } else {
                                            const index = selectedLearningPaths.indexOf(e.target.value);
                                            if (index > -1) {
                                                selectedLearningPaths.splice(index, 1);
                                            }
                                        }
                                        setAssignment({ ...assignment, selectedLearningPaths });
                                    }}
                                    className="mr-2"
                                />
                                <label className="text-gray-600">{path.title}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleAssignLearningPath}
                    className="w-full text-white bg-[#0369a1] focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-6"
                >
                    Assign Learning Path
                </button>
            </div>
        </div>
    );
}
