import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Chart from 'react-apexcharts'; 
import { Tag } from 'primereact/tag'

export default function EmployeeProfile() {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [performanceData, setPerformanceData] = useState({
    options: {
      chart: {
        type: 'bar',
      },
      xaxis: {
        categories: [],
      },
    },
    series: [{
      name: 'Performance Score',
      data: [],
    }],
  });
  const [courses, setCourses] = useState([]); // State to hold courses data

  const [tags] = useState([
    'Web Development', 'Data Engineering', 'Data Science', 
    'Generative AI', 'DevOps', 'Cybersecurity', 
    'Mobile Development', 'UI/UX Design', 'Software Testing'
  ]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/admin/employee-courses`);
        const employeeData = response.data.find(emp => emp.employee_id === employeeId);
        if (employeeData) {
          setEmployee(employeeData);
          setCourses(employeeData.courses); // Set the courses data
          prepareChartData(employeeData.courses);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, [employeeId]);

  const prepareChartData = (courses) => {
    const tagsPerformance = {};

    tags.forEach(tag => {
      tagsPerformance[tag] = 0;
    });

    courses.forEach(course => {
      const tag = course.course_tag || 'General';
      if (tagsPerformance[tag] !== undefined) {
        tagsPerformance[tag] += course.completion_percentage; 
      }
    });

    performanceData.options.xaxis.categories = tags; 
    performanceData.series[0].data = tags.map(tag => tagsPerformance[tag]); 
    setPerformanceData({ ...performanceData }); 
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
            {data.map((course, index) => (
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

  if (!employee) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="w-1/3">
          <img src="/path/to/profile/photo" alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div className="p-4 w-2/3">
          <h2 className="text-2xl font-bold">{employee.name}</h2>
          <p className="text-gray-600">Email: {employee.email}</p>
          <p className="text-gray-600">Designation: {employee.designation}</p>
          <p className="text-gray-600">Total Courses: {employee.totalCourses}</p>
          <p className="text-gray-600">Completed Courses: {employee.completedCourses}</p>
          <p className="text-gray-600">Performance Score: {employee.performanceScore}</p>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Performance Score by Course Tags</h3>
        <Chart options={performanceData.options} series={performanceData.series} type="bar" height={350} />
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Courses Overview</h3>
        {courseTemplate(courses)} {/* Render the course table */}
      </div>
    </div>
  );
}
