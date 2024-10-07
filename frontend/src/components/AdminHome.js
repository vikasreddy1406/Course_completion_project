import React, { useEffect, useState, useContext } from 'react';
import { alertContext } from '../context/alertContext';
import axios from 'axios';
import Cookie from 'js-cookie';
import { Checkbox, Label, Modal } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag'
import EmployeePerformance from './EmployeePerformance';
import AdminLearningPaths from './AdminLearningPaths';

// Register necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminHome = () => {
  const [courses, setCourses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [showAssignCourseModal, setShowAssignCourseModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStats, setCourseStats] = useState(null);
  const [selectedDesignation, setSelectedDesignation] = useState('All');
  const [sortOrder, setSortOrder] = useState('Top');
  const [searchTerm, setSearchTerm] = useState('');

  const [employeeCoursesStats,setEmployeesCoursesStats] = useState([])

  const [expandedRows, setExpandedRows] = useState([]);

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

  const fetchCourseStats = async (courseId) => {
    if (!courseId) return;
    try {
      const response = await axios.get(`http://localhost:4000/api/admin/course/${courseId}/stats`, {
        headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
      });
      setCourseStats(response.data);
    } catch (error) {
      console.error('Error fetching course stats:', error);
    }
  };

  const fetchEmployeeCourses = async () => {
    const response = await axios.get('http://localhost:4000/api/admin/employee-courses', {
      headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
    });
    setEmployeesCoursesStats(response.data);
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    fetchCourseStats(courseId);
  };

  useEffect(() => {
    if (!Cookie.get('accessToken')) {
      navigate("/login");
    }
    if(Cookie.get('role')==="employee"){
      navigate("/")
    }
    fetchCourses();
    fetchEmployees();
    fetchPerformanceData();
    fetchEmployeeCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      setSelectedCourse(courses[0]._id);
      fetchCourseStats(courses[0]._id); 
    }
  
  }, [courses]);

  

  const getFilteredData = () => {
    let filteredData = performanceData;

    if (selectedDesignation !== 'All') {
      filteredData = filteredData.filter(emp => emp.designation === selectedDesignation);
    }
    filteredData.sort((a, b) => {
      return sortOrder === 'Top' ? b.performance_score - a.performance_score : a.performance_score - b.performance_score;
    });

    return filteredData.slice(0, 5);
  };

  
  const handleAssignCourse = async () => {
    if (!selectedCourse || selectedEmployees.length === 0) return;
    try {
 
      await axios.post(
        `http://localhost:4000/api/admin/assign-courses/${selectedCourse}/assign`,
        { employee_ids: selectedEmployees }, 
        {
          headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
        }
      );
      showAlert('Course assigned successfully');
      setSelectedEmployees([]); 
      setShowAssignCourseModal(false); 

      await fetchEmployeeCourses();
    } catch (error) {
      console.error('Error assigning course:', error);
    }
  };

  const filteredData = getFilteredData();
  const chartData = {
    labels: filteredData.map(emp => emp.employee),
    datasets: [
      {
        label: 'Performance Score',
        data: filteredData.map(emp => emp.performance_score),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };


  const courseChartData = courseStats ? {
    labels: ['Assigned', 'Completed'],
    datasets: [
      {
        label: 'Course Stats',
        data: [courseStats.assignedCount, courseStats.completedCount],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      datalabels: {
        display: true,
        color: 'white',  
        anchor: 'center', 
        align: 'center',  
        formatter: (value) => `${value.toFixed(2)}%`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value + "%"; 
          }
        }
      }
    }
  };
  

  const courseTemplate = (data) => {
    return (
      <div className="pl-3">
        <table className="w-full border-separate border-spacing-2">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-center">Course Name</th>
              <th className="p-2 text-center">Tag</th>
              <th className="p-2 text-center">Total Modules</th>
              <th className="p-2 text-center">Modules Completed</th>
              <th className="p-2 text-center">Status</th>
              <th className="p-2 text-center">Completion Percentage</th>
            </tr>
          </thead>
          <tbody>
            {data.courses.map((course, index) => (
              <tr key={index} className="bg-white border-b">
                <td className="p-2 text-center">{course.course_title}</td>
                <td className="p-2 text-center">{course.course_tag}</td>
                <td className="p-2 text-center">{course.totalModules}</td>
                <td className="p-2 text-center">{course.modulesCompleted}</td>
                <td className="p-2 text-center">
                  <Tag value={course.status} severity={getSeverity(course.status)} />
                </td>
                <td className="p-2 text-center">{course.completion_percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Utility function for status severity
  const getSeverity = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'warning';
      default:
        return null;
    }
  };


  return (
    <>


      {/* Main content container */}
      <div className={`p-5 ${showAssignCourseModal ? 'blur-sm opacity-50' : ''} `}>
        <div>
          <h1 className="text-3xl font-bold mb-5 text-center uppercase">Admin Dashboard</h1>
          <div className='flex '>
            <button type='button' onClick={() => navigate('/create-course')} className="text-white bg-[#0369a1] focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
              Create Course
            </button>
            <button type='button' onClick={() => setShowAssignCourseModal(true)} className="text-white bg-[#0369a1] focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ml-2 mb-2">
              Assign Courses
            </button>
            <button type='button' onClick={() => navigate('/create-learningpath')} className="text-white bg-[#0369a1] focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ml-2 mb-2">
              Create Learning-Path
            </button>
            <button type='button' onClick={() => navigate('/assign-learningpath')} className="text-white bg-[#0369a1] focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ml-2 mb-2">
              Assign Learning-Path
            </button>
          </div>
        </div>

        

       
        <div className='flex justify-between'>
            <div className="mt-8 w-[48%] h-[670px] border-2 rounded-md p-4  mx-4">
              
              <div className='p-5'>
                {/* Dropdowns */}
                <h1 className='text-center text-2xl font-bold mb-4'>Performance Rate of Employees</h1>
                <div className="flex justify-between mb-4">
                  {/* Designation Dropdown */}
                  <div>
                    <label htmlFor="designation" className="mr-2 font-bold">Designation:</label>
                    <select
                      id="designation"
                      className="border p-2 rounded"
                      value={selectedDesignation}
                      onChange={(e) => setSelectedDesignation(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Web Developer">Web Developer</option>
                      <option value="Data Engineer">Data Engineer</option>
                      <option value="Data Scientist">Data Scientist</option>
                      <option value="AI Specialist">AI Specialist</option>
                      <option value="DevOps Engineer">DevOps Engineer</option>
                      <option value="Cybersecurity Specialist">Cybersecurity Specialist</option>
                      <option value="Mobile Developer">Mobile Developer</option>
                      <option value="UI/UX Designer">UI/UX Designer</option>
                      <option value="Software Tester">Software Tester</option>
                    </select>
                  </div>

                  {/* Top/Bottom Dropdown */}
                  <div>
                    <label htmlFor="sortOrder" className="mr-2 font-bold">Sort Order:</label>
                    <select
                      id="sortOrder"
                      className="border p-2 rounded"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="Top">Top 5</option>
                      <option value="Bottom">Bottom 5</option>
                    </select>
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="mt-8 w-full h-[500px] border-2 rounded-md p-4">
                  <Bar
                    data={chartData}
                    options={{chartOptions}}
                  />
                </div>
              </div>
            </div>



            <div className='mt-8 w-[48%] h-[670px] flex flex-col items-center border-2 rounded-md p-4  mx-4'>
            <h1 className='text-center text-2xl font-bold mb-8'>Completion Rate of Courses</h1>
            <div className='flex'>
              <label  className="w-1/2 font-bold">Select Course:</label>
              <select
                id="course"
                className="mb-8 bg-gray-50 border max-w-md border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                onChange={handleCourseChange}  // Updated handler
              >
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.title} - {course.tag}</option>
                ))}
              </select>
            </div>
            {/* Course Stats Chart */}
            {courseStats && (
              <div className="mt-8 w-full max-w-4xl mx-auto h-96 ">
                <Bar
                  data={courseChartData}
                  options={{chartOptions}}
                />
              </div>
            )}
            </div>
        </div>    
      </div>

      <div>
        <EmployeePerformance/>
      </div>
  

      <div className="card border-2 mx-8 mb-8">
      <h1 className='text-center text-2xl font-bold my-4'>Employee Course Details Table</h1>
        <DataTable value={employeeCoursesStats} expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)}
          rowExpansionTemplate={courseTemplate} dataKey="employee_id"
          tableStyle={{ minWidth: '60rem' }} className="shadow-md text-center">

          <Column expander style={{ width: '3em' }} />
          <Column field="name" header="Employee Name" className="p-2 text-center" style={{ width: '20%' }} alignHeader={'center'} sortable />
          <Column field="designation" header="Designation" className="p-2 text-center" style={{ width: '20%' }} alignHeader={'center'} sortable />
          <Column field="totalCourses" header="Total Courses" className="p-2 text-center" style={{ width: '20%' }} alignHeader={'center'} sortable/>
          <Column field="completedCourses" header="Courses Completed" className="p-2 text-center" style={{ width: '20%' }} alignHeader={'center'} sortable />
          <Column sortable field="performanceScore" header="Performance Score" className="p-2 text-center" style={{ width: '20%' }}
            body={(rowData) => rowData.performanceScore?.toFixed(2)} alignHeader={'center'}/>
        </DataTable>
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

                {/* <div className="mb-4">
                  <h3 className="text-lg text-gray-900 dark:text-white">Select Employees</h3>
                  {employees && employees.length > 0 ? (
                    employees.map(employee => (
                      <div key={employee._id} className="flex items-center mb-2">
                        <input
                          id={employee._id}
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 focus:ring-2 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
                          // Check if the employee is selected
                          checked={selectedEmployees.includes(employee._id)}
                          onChange={() => handleCheckboxChange(employee._id)} // Handle checkbox change
                        />
                        <label htmlFor={employee._id} className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                          {employee.name} - {employee.designation}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p>No employees available to assign courses.</p>
                  )}
                </div> */}

                {/* <button
                  onClick={handleAssignCourse}
                  type="button"
                  className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Assign Course
                </button> */}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHome;

