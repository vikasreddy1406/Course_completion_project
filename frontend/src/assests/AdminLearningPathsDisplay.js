import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';
import mermaid from "mermaid";

export default function AdminLearningPathsDisplay() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [learningPaths, setLearningPaths] = useState([]);
    const [mermaidDiagram, setMermaidDiagram] = useState('');

    useEffect(() => {
        const fetchEmployees = async () => {
            const response = await axios.get('http://localhost:4000/api/admin/getAllEmployees', {
                headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
            });
            setEmployees(response.data);
        };

        fetchEmployees();
        mermaid.initialize({ startOnLoad: true }); 
    }, []);

    const handleEmployeeChange = (e) => {
        setSelectedEmployee(e.target.value);
        setLearningPaths([]); 
    };

    useEffect(() => {
        const fetchLearningPaths = async () => {
            if (selectedEmployee) {
                const response = await axios.get(`http://localhost:4000/api/learningpath/${selectedEmployee}/get-learningpath`, {
                    headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
                });
                setLearningPaths(response.data);
            }
        };

        fetchLearningPaths();
    }, [selectedEmployee]);

    useEffect(() => {
        if (learningPaths.length > 0) {
            const diagram = createMermaidDiagram(learningPaths);
            setMermaidDiagram(diagram);
        } else {
            setMermaidDiagram(''); 
        }
    }, [learningPaths]);

    useEffect(() => {
        if (mermaidDiagram) {
            mermaid.contentLoaded(); 
        }
    }, [mermaidDiagram]);

    const createMermaidDiagram = (paths) => {
        let mermaidData = 'graph TD\n';
        mermaidData += 'MainLearningPath["Learning Path"]\n';

        paths.forEach((path, pathIndex) => {
            const pathNodeId = `LP${pathIndex}`;
            mermaidData += `${pathNodeId}["${path.learningPathTitle}"]\n`;
            mermaidData += `MainLearningPath --> ${pathNodeId}\n`;

            path.courses.forEach((course, courseIndex) => {
                const courseNodeId = `C${pathIndex}-${courseIndex}`;
                let courseLabel = `${course.title}`;
                if (course.assigned) {
                    courseLabel += ` (Assigned: ${course.completionPercentage}%)`;
                }
                mermaidData += `${courseNodeId}["${courseLabel}"]\n`;
                mermaidData += `${pathNodeId} --> ${courseNodeId}\n`;

                if (course.assigned) {
                    mermaidData += `style ${courseNodeId} fill:#FFEB3B,stroke:#FBC02D,stroke-width:2px;\n`;
                }
            });
        });

        return mermaidData;
    };

    return (
        <div className='border mx-8 my-8 p-4'>
            <h1 className="text-2xl font-bold mb-4 text-center">Admin Learning Path</h1>
            <div className="mb-8 text-center flex justify-center">
                <label htmlFor="employeeSelect" className="block mb-2 text-lg font-semibold mx-4 mt-2">Select Employee</label>
                <select 
                    id="employeeSelect" 
                    className="border border-gray-300 p-2 rounded" 
                    onChange={handleEmployeeChange}
                    value={selectedEmployee}
                >
                    <option value="">-- Select an Employee --</option>
                    {employees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                            {employee.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedEmployee && (
                <div style={{ height: '50%', width: '70%' }} className="border border-gray-300 rounded-lg shadow-lg p-4 text-center mx-auto">
                    {mermaidDiagram ? (
                        <div className="mermaid">
                            {mermaidDiagram}
                        </div>
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
            )}
        </div>
    );
}
