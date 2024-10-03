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
    setEmployees(response.data);
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

    // Filter by designation if selected
    if (selectedDesignation !== 'All') {
      filteredData = filteredData.filter(emp => emp.designation === selectedDesignation);
    }

    // Sort by performance score (ascending or descending based on sortOrder)
    filteredData.sort((a, b) => {
      return sortOrder === 'Top' ? b.performance_score - a.performance_score : a.performance_score - b.performance_score;
    });

    // Return top 5 or bottom 5
    return filteredData.slice(0, 5);
  };

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

  const filteredSearchData = performanceData.filter((data) => {
    const term = searchTerm.toLowerCase();
    return (
      data.employee.toLowerCase().includes(term) ||
      data.email.toLowerCase().includes(term) ||
      data.designation.toLowerCase().includes(term)
    );
  });
  

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

  // const courseTemplate = (data) => {
  //   return (
  //     <div className="pl-3">
  //       <table className="w-full">
  //         <thead>
  //           <tr>
  //             <th>Course Name</th>
  //             <th>Tag</th>
  //             <th>Total Modules</th>
  //             <th>Modules Completed</th>
  //             <th>Status</th>
  //             <th>Completion Percentage</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {data.courses.map((course, index) => (
  //             <tr key={index}>
  //               <td>{course.course_title}</td>
  //               <td>{course.course_tag}</td>
  //               <td>{course.totalModules}</td>
  //               <td>{course.modulesCompleted}</td>
  //               <td>{course.status}</td>
  //               <td>{course.completion_percentage}%</td>
  //             </tr>
  //           ))}
  //         </tbody>
  //       </table>
  //     </div>
  //   );
  // };

  const courseTemplate = (data) => {
    return (
      <div className="pl-3">
        <table className="w-full border-separate border-spacing-2">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Course Name</th>
              <th className="p-2 text-left">Tag</th>
              <th className="p-2 text-left">Total Modules</th>
              <th className="p-2 text-left">Modules Completed</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Completion Percentage</th>
            </tr>
          </thead>
          <tbody>
            {data.courses.map((course, index) => (
              <tr key={index} className="bg-white border-b">
                <td className="p-2">{course.course_title}</td>
                <td className="p-2">{course.course_tag}</td>
                <td className="p-2">{course.totalModules}</td>
                <td className="p-2">{course.modulesCompleted}</td>
                <td className="p-2">
                  <Tag value={course.status} severity={getSeverity(course.status)} />
                </td>
                <td className="p-2">{course.completion_percentage}%</td>
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
      <div className={`p-5 ${showAssignCourseModal ? 'blur-sm opacity-50' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold mb-5 text-center uppercase">Admin Dashboard</h1>
          <div className='flex '>
            <button type='button' onClick={() => navigate('/create-course')} className="text-white bg-[#0369a1] focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
              Create Course
            </button>
            <button type='button' onClick={() => setShowAssignCourseModal(true)} className="text-white bg-[#0369a1] focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ml-2 mb-2">
              Assign Courses
            </button>
          </div>
        </div>

        

       
        <div className='flex justify-between'>
            <div className="mt-8 w-[48%] h-[650px] border-2 rounded-md p-4  mx-4">
              
              <div className='p-5'>
                {/* Dropdowns */}
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
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Employee Performance' }
                      },
                    }}
                  />
                </div>
              </div>
            </div>



            <div className='mt-8 w-[48%] h-[650px] flex flex-col items-center border-2 rounded-md p-4  mx-4'>
            <div className='flex'>
              <label  className="mr-2 w-1/2 mt-2 font-bold">Select Course:</label>
              <select
                id="course"
                className="bg-gray-50 border max-w-md border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
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
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Course Assignment and Completion' },
                    },
                  }}
                />
              </div>
            )}
            </div>
        </div>

    <div className='flex flex-col mt-20 mx-12'>
        <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or designation"
          className="border border-gray-300 p-2 rounded-lg w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

        {/* Employee Performance Table */}
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg  ">
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
            {filteredSearchData.map((data, index) => (
              <tr
                key={index}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-center"
              >
                <td className="px-6 py-4">
                  <div className="pl-3">
                    <div className="text-base font-semibold">{data.employee}</div>
                    <div className="font-normal text-gray-500">{data.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">{data.designation}</td>
                <td className="px-6 py-4">{data.total_courses_assigned}</td>
                <td className="px-6 py-4">{data.courses_completed}</td>
                <td className="px-6 py-4">{data.performance_score.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>

        {filteredSearchData.length === 0 && (
          <div className="text-center py-4 text-red-500">
            No matching results found.
          </div>
        )}
        
      </div>
      </div>

      {/* <div className="card">
        <DataTable value={employees} expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)}
          rowExpansionTemplate={courseTemplate} dataKey="employee_id">

          <Column expander style={{ width: '3em' }} />
          <Column field="name" header="Employee Name" />
          <Column field="designation" header="Designation" />
          <Column field="totalCourses" header="Total Courses" />
          <Column field="completedCourses" header="Courses Completed" />
          <Column field="performanceScore" header="Performance Score" body={(rowData) => rowData.performanceScore?.toFixed(2)} />

        </DataTable>
      </div> */}

      <div className="card">
        <DataTable value={employees} expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)}
          rowExpansionTemplate={courseTemplate} dataKey="employee_id"
          tableStyle={{ minWidth: '60rem' }} className="shadow-md">

          <Column expander style={{ width: '3em' }} />
          <Column field="name" header="Employee Name" className="p-2" style={{ width: '20%' }} />
          <Column field="designation" header="Designation" className="p-2" style={{ width: '15%' }} />
          <Column field="totalCourses" header="Total Courses" className="p-2" style={{ width: '10%' }} />
          <Column field="completedCourses" header="Courses Completed" className="p-2" style={{ width: '10%' }} />
          <Column field="performanceScore" header="Performance Score" className="p-2" style={{ width: '15%' }}
            body={(rowData) => rowData.performanceScore?.toFixed(2)} />
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
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHome;

