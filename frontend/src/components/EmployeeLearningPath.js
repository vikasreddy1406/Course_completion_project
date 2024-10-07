import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';
import mermaid from "mermaid";
import { jwtDecode } from 'jwt-decode';

export default function EmployeeLearningPath() {
    const [learningPaths, setLearningPaths] = useState([]);
    const [mermaidDiagram, setMermaidDiagram] = useState('');

    

    useEffect(() => {
        const fetchLearningPaths = async () => {
            const decodedToken = jwtDecode(Cookie.get('accessToken'));
            const employeeId = decodedToken._id;
            const response = await axios.get(`http://localhost:4000/api/learningpath/${employeeId}/get-learningpath`);
            setLearningPaths(response.data);
        };

        fetchLearningPaths();
    }, []);


    useEffect(() => {
        if (learningPaths.length > 0) {
            const diagram = createMermaidDiagram(learningPaths);
            setMermaidDiagram(diagram);
        }
    }, [learningPaths]);

    useEffect(() => {
        if (mermaidDiagram) {
            mermaid.initialize({ startOnLoad: true });
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
        <div className="p-4 flex flex-col items-center mb-8">
            <h1 className="text-2xl font-bold mb-4 text-center">Employee Learning Paths</h1>
            <div style={{ height: '50%', width: '70%' }} className="border border-gray-300 rounded-lg shadow-lg p-4 text-center">
                {mermaidDiagram ? (
                    <div className="mermaid">
                        {mermaidDiagram}
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
}
