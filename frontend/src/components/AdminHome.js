import React, { useEffect, useState, useContext } from 'react';
import { alertContext } from '../context/alertContext';
import axios from 'axios';
import Cookie from 'js-cookie';
import { Checkbox, Label, Modal } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminHome = () => {
  const [courses, setCourses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [showAssignCourseModal, setShowAssignCourseModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const navigate = useNavigate();

  let { showAlert } = useContext(alertContext);

  // Fetch all courses
  const fetchCourses = async () => {
    const response = await axios.get('http://localhost:4000/api/admin/get-courses', {
      headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
    });
    setCourses(response.data);
  };

  // Fetch all employees
  const fetchEmployees = async () => {
    const response = await axios.get('http://localhost:4000/api/admin/getAllEmployees', {
      headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
    });
    setEmployees(response.data);
  };

  // Fetch employee performance data
  const fetchPerformanceData = async () => {
    const response = await axios.get('http://localhost:4000/api/admin/performance', {
      headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
    });
    setPerformanceData(response.data);
  };

  useEffect(() => {
    if (!Cookie.get('accessToken')) {
      navigate("/login");
    }
    fetchCourses();
    fetchEmployees();
    fetchPerformanceData();
  }, []);

  // Handle course assignment
  const handleAssignCourse = async () => {
    if (!selectedCourse || selectedEmployees.length === 0) return;
    try {
      await axios.post(
        `http://localhost:4000/api/admin/courses/${selectedCourse}/assign`,
        { employee_ids: selectedEmployees }, // Send array as employee_ids
        {
          headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
        }
      );
      showAlert('Course assigned successfully');
      setSelectedEmployees([]); // Reset selected employees
      setShowAssignCourseModal(false); // Close modal after assignment
    } catch (error) {
      console.error('Error assigning course:', error);
    }
  };

  // Prepare performance data for Chart.js
  const chartData = {
    labels: performanceData.map(emp => emp.employee),
    datasets: [
      {
        label: 'Performance Score',
        data: performanceData.map(emp => emp.performance_score),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      
    ],
  };

  return (
    <>
      {/* Main content container */}
      <div className={`p-5 ${showAssignCourseModal ? 'blur-sm opacity-50' : ''}`}>
        <div className='flex justify-start gap-5'>
          <h1 className="text-3xl font-bold mb-5 text-center">Admin Dashboard</h1>
          <div className='flex '>
            <button type='button' onClick={() => navigate('/create-course')} className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
              Create Course
            </button>
            <button type='button' onClick={() => setShowAssignCourseModal(true)} className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ml-2 mb-2">
              Assign Courses
            </button>
          </div>
        </div>

       
        <div className="mt-8 w-full max-w-4xl mx-auto h-96">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false, // This allows the chart to resize according to the div size
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Employee Performance' }
              }
            }}
          />
        </div>



        {/* Employee Performance Table */}
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-20">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 text-center">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Designation</th>
                <th scope="col" className="px-6 py-3">Total Courses Assigned</th>
                <th scope="col" className="px-6 py-3">Courses Completed</th>
                <th scope="col" className="px-6 py-3">Performance Score</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((data, index) => (
                <tr
                  key={index}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-center"
                >
                  <td className="px-6 py-4">
              
                      {/* <img
                        className="w-10 h-10 rounded-full"
                        src={`/images/${employee.name}.jpg`} // Assuming profile images are named after the employee
                        alt={`${employee.name}`}
                      /> */}
                      <div className="pl-3">
                        <div className="text-base font-semibold">{data.employee}</div>
                        <div className="font-normal text-gray-500">{data.email}</div>
                      </div>
                    
                  </td>
                  <td className="px-6 py-4">{data.designation}</td>
                  <td className="px-6 py-4">{data.total_courses_assigned}</td>
                  <td className="px-6 py-4">{data.courses_completed}</td>
                  <td className="px-6 py-4">{data.performance_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
      </div>

      {/* Assign Course Modal */}
      {showAssignCourseModal && (
        
        <div id="crud-modal" tabIndex="-1" aria-hidden="true" className={`fixed inset-0 z-50 ${showAssignCourseModal ? 'flex' : 'hidden'}  justify-center items-center w-full h-full max-h-full `}>
          <div className="relative w-full max-w-lg max-h-full  border border-black">
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Assign Course
                </h3>
                <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setShowAssignCourseModal(false)}>
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              {/* Modal body */}
              <form className="p-4 md:p-5">
                <div className="mb-4">
                  <label htmlFor="course" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Course</label>
                  <select
                    id="course"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.title} - {course.tag}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg text-gray-900 dark:text-white">Select Employees</h3>
                  {employees.map(employee => (
                    <div key={employee._id} className="flex items-center mb-2">
                      <input
                        id={employee._id}
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 focus:ring-2 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
                        checked={selectedEmployees.includes(employee._id)}
                        onChange={() => {
                          setSelectedEmployees((prev) => {
                            if (prev.includes(employee._id)) {
                              return prev.filter(id => id !== employee._id);
                            } else {
                              return [...prev, employee._id];
                            }
                          });
                        }}
                      />
                      <label htmlFor={employee._id} className="ml-2 text-sm font-medium text-gray-900 dark:text-white">{employee.name} - {employee.designation}</label>
                    </div>
                  ))}
                </div>

                <button onClick={handleAssignCourse} type='button' className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                  Assign Course
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHome;

