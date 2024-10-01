import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';
import { Button, Checkbox, Label,Modal } from 'flowbite-react';
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
      alert('Course assigned successfully');
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
      {
        label: 'Completion Rate',
        data: performanceData.map(emp => emp.completion_rate),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-5">Admin Dashboard</h1>
      <Button onClick={() => navigate('/create-course')} color="success" className="text-black mb-2">
        Create Course
      </Button>
      <Button onClick={() => setShowAssignCourseModal(true)} color="info" className="text-black ml-2 mb-2">
        Assign Courses
      </Button>

      {/* Assign Course Modal */}
      {showAssignCourseModal && (
        <Modal show={showAssignCourseModal} onClose={() => setShowAssignCourseModal(false)} className="shadow-lg max-w-[75%] mx-auto">
          <Modal.Header>Assign Course</Modal.Header>
          <Modal.Body>
            <select
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border rounded p-2 mt-2 mb-4 w-full"
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>

            <div>
              <h3 className="text-lg">Select Employees:</h3>
              {employees.map(employee => (
                <div key={employee._id} className="flex items-center">
                  <Checkbox
                    id={employee._id}
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
                  <Label htmlFor={employee._id} className="ml-2">{employee.name}</Label>
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleAssignCourse} className="text-black">Assign Course</Button>
            <Button onClick={() => setShowAssignCourseModal(false)} color="gray" className="text-black">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Performance Chart */}
      <div className="mt-8">
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Employee Performance' } } }} />
      </div>
    </div>
  );
};

export default AdminHome;
