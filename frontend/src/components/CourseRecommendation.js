import React, { useState, useEffect,useContext } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';
import { alertContext } from '../context/alertContext';

const AdminCourseRecommendation = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assignedCourses, setAssignedCourses] = useState(new Set()); 

  let { showAlert } = useContext(alertContext);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await axios.get('http://localhost:4000/api/admin/getAllEmployees', {
          headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
        });
        setEmployees(response.data);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employee data.');
      }
    }
    fetchEmployees();
  }, []);

 
  const handleEmployeeSelect = async (e) => {
    setSelectedEmployee(e.target.value);
    setRecommendedCourses([]);
    setAssignedCourses(new Set()); 
    if (e.target.value) {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/recommend-courses/${e.target.value}`);
        setRecommendedCourses(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching course recommendations:', err);
        setError('Failed to load recommended courses.');
        setLoading(false);
      }
    }
  };

  const handleAssignCourse = async (courseId) => {
    try {
      await axios.post(
        `http://localhost:4000/api/admin/assign-courses/${courseId}/assign`,
        { employee_ids: [selectedEmployee] },
        {
          headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
        }
      );
      setAssignedCourses((prev) => new Set(prev).add(courseId)); 
      showAlert('Course assigned successfully');
    } catch (error) {
      console.error('Error assigning course:', error);
    }
  };

  return (
    <div className="mt-40 container w-2/4 p-6 bg-white shadow-lg rounded-lg border mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Get Course Recommendations for Employees</h1>

      <div className="mb-4">
        <label htmlFor="employee-select" className="block text-lg font-medium text-gray-700">
          Select an Employee:
        </label>
        <select
          id="employee-select"
          className="mt-2 p-2 border border-gray-300 rounded-md w-full"
          value={selectedEmployee}
          onChange={handleEmployeeSelect}
        >
          <option value="">-- Select Employee --</option>
          {employees.map((employee) => (
            <option key={employee._id} value={employee._id}>
              {employee.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading recommendations...</p>}

      {error && <p className="text-red-500">{error}</p>}

      {recommendedCourses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Recommended Courses:</h2>
          <ul className="list-disc pl-5 space-y-2">
            {recommendedCourses.map((course) => (
              <li key={course.course_id} className="text-gray-700 border-b-2 pb-4 flex justify-between items-center">
                {course.course_title} 
                <button
                  onClick={() => handleAssignCourse(course.course_id)}
                  disabled={assignedCourses.has(course.course_id)} 
                  className={`ml-4 px-4 py-2 text-white rounded ${assignedCourses.has(course.course_id) ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                  {assignedCourses.has(course.course_id) ? 'Assigned' : 'Assign'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendedCourses.length === 0 && selectedEmployee && !loading && !error && (
        <p>No recommended courses available for this employee.</p>
      )}
    </div>
  );
};

export default AdminCourseRecommendation;
