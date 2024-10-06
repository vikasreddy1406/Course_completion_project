// import React, { useEffect, useState,useMemo } from 'react';
// import axios from 'axios';
// import ReactFlow, { MiniMap, Controls } from 'react-flow-renderer';
// import Cookie from 'js-cookie';
// import { jwtDecode } from 'jwt-decode';


// export default function EmployeeLearningPath() {
//     const [learningPaths, setLearningPaths] = useState([]);

//     useEffect(() => {
//         const fetchLearningPaths = async () => {
//             const decodedToken = jwtDecode(Cookie.get('accessToken'));
//             const employeeId = decodedToken._id;
//             const response = await axios.get(`http://localhost:4000/api/learningpath/${employeeId}/get-learningpath`);
//             setLearningPaths(response.data);
//         };

//         fetchLearningPaths();
//     }, []);

//     const createFlowchartElements = useMemo(() => {
//         const elements = [];
//         let positionY = 50;

//         learningPaths.forEach((path, pathIndex) => {
//             const pathNodeId = `path-${pathIndex}`;

//             // Add learning path node
//             elements.push({
//                 id: pathNodeId,
//                 data: {
//                     label: (
//                         <div className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">
//                             {path.learningPathTitle}
//                             <span className="ml-2 text-sm">(Hover for description)</span>
//                         </div>
//                     ),
//                 },
//                 position: { x: 150, y: positionY },
//                 type: 'default',
//             });

//             positionY += 100;

//             // Add course nodes and edges
//             path.courses.forEach((course, courseIndex) => {
//                 const courseNodeId = `course-${pathIndex}-${courseIndex}`;

//                 elements.push({
//                     id: courseNodeId,
//                     data: {
//                         label: (
//                             <div className={`p-2 rounded-lg ${course.assigned ? 'bg-green-500' : 'bg-gray-300'} text-black`}>
//                                 {course.title}
//                                 {course.assigned && (
//                                     <div className="text-xs text-gray-700">
//                                         Completion: {course.completionPercentage}%
//                                     </div>
//                                 )}
//                             </div>
//                         ),
//                     },
//                     position: { x: 500, y: positionY },
//                     type: 'default',
//                 });

//                 // Add edge from learning path to course
//                 elements.push({
//                     id: `edge-${pathNodeId}-${courseNodeId}`,
//                     source: pathNodeId,
//                     target: courseNodeId,
//                     type: 'smoothstep',
//                     animated: true,
//                 });

//                 positionY += 100;
//             });
//         });

//         return elements;
//     }, [learningPaths]);

//     return (
//         <div className="p-4">
//             <h1 className="text-2xl font-bold mb-4 text-center">Employee Learning Paths</h1>
//             <div style={{ height: '100vh', width: '100%' }} className="border border-gray-300 rounded-lg shadow-lg">
//                 <ReactFlow elements={createFlowchartElements} style={{ height: '100%', width: '100%' }}>
//                     <MiniMap />
//                     <Controls />
//                 </ReactFlow>
//             </div>
//         </div>
//     );
// }

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import mermaid from "mermaid";

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

    // useEffect(() => {
    //     if (mermaidDiagram) {
    //         // Initialize mermaid after setting the diagram
    //         mermaid.initialize({ startOnLoad: true });
    //         mermaid.contentLoaded();  // This ensures the diagram is rendered
    //     }
    // }, [mermaidDiagram]);

    // Convert learning paths and courses into Mermaid syntax
    // const createMermaidDiagram = (paths) => {
    //     let mermaidData = 'graph TD\n';
    //     paths.forEach((path, pathIndex) => {
    //         const pathNodeId = `LP${pathIndex}`;
    //         mermaidData += `${pathNodeId}[${path.learningPathTitle}]:::learningPath\n`;

    //         path.courses.forEach((course, courseIndex) => {
    //             const courseNodeId = `C${pathIndex}-${courseIndex}`;
    //             mermaidData += `${courseNodeId}[${course.title}]:::course\n`;
    //             mermaidData += `${pathNodeId} --> ${courseNodeId}\n`;

    //             if (course.assigned) {
    //                 mermaidData += `${courseNodeId}:::assigned\n`;
    //             }
    //         });
    //     });
    //     return mermaidData;
    // };

    useEffect(() => {
        if (mermaidDiagram) {
            // Initialize mermaid with custom styles
            mermaid.initialize({
                startOnLoad: true,
                themeVariables: {
                    // Customize the colors for different types of nodes
                    learningPath: {
                        fill: '#4CAF50',
                        stroke: '#2E7D32',
                    },
                    assigned: {
                        fill: '#FFEB3B',
                        stroke: '#FBC02D',
                    },
                }
            });
            mermaid.contentLoaded();  // This ensures the diagram is rendered
        }
    }, [mermaidDiagram]);


    const createMermaidDiagram = (paths) => {
        let mermaidData = 'graph TD\n';

        // Add the main node for Learning Path
        mermaidData += 'MainLearningPath["Learning Path"]\n';

        // Loop through learning paths and connect them to the main node
        paths.forEach((path, pathIndex) => {
            const pathNodeId = `LP${pathIndex}`;
            mermaidData += `${pathNodeId}["${path.learningPathTitle}"]\n`;

            // Connect the learning path to the main node
            mermaidData += `MainLearningPath --> ${pathNodeId}\n`;

            
            path.courses.forEach((course, courseIndex) => {
                const courseNodeId = `C${pathIndex}-${courseIndex}`;

                // Include the assigned status and completion percentage in the node label
                let courseLabel = `${course.title}`;
                if (course.assigned) {
                    courseLabel += ` (Assigned: ${course.completionPercentage}%)`;
                }

                // Add the course node
                mermaidData += `${courseNodeId}["${courseLabel}"]\n`;

                // Connect the course to its respective learning path
                mermaidData += `${pathNodeId} --> ${courseNodeId}\n`;

                // Style if the course is assigned (using Mermaid classes)
                if (course.assigned) {
                    mermaidData += `style ${courseNodeId} fill:#FFEB3B,stroke:#FBC02D,stroke-width:2px;\n`;
                }
            });
        });

        return mermaidData;
    };



    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">Employee Learning Paths</h1>
            <div style={{ height: '50vh', width: '100%' }} className="border border-gray-300 rounded-lg shadow-lg p-4">
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
