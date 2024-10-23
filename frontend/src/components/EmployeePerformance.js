import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import Cookie from 'js-cookie';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';
import api from "../api/api"

ChartJS.register(BarElement, CategoryScale, LinearScale, ChartDataLabels);

const EmployeePerformance = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [tags, setTags] = useState([
    'Web Development', 'Data Engineering', 'Data Science', 
    'Generative AI', 'DevOps', 'Cybersecurity', 
    'Mobile Development', 'UI/UX Design', 'Software Testing'
  ]);
  const [employeeCourses, setEmployeeCourses] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const response = await api.get('/api/admin/employee-courses', {
      headers: { Authorization: `Bearer ${Cookie.get('accessToken')}` },
    });
    setEmployees(response.data);
  };

  const handleEmployeeSelect = (e) => {
    const employeeId = e.target.value;
    const selectedEmp = employees.find(emp => emp.employee_id === employeeId);
    setSelectedEmployee(selectedEmp);
    calculateTagPerformance(selectedEmp);
  };

  const calculateTagPerformance = (employee) => {
    if (!employee) return;
    
    const tagPerformance = tags.map(tag => {
      const tagCourses = employee.courses.filter(course => course.course_tag === tag);
      const totalTagCourses = tagCourses.length;
      const completedTagCourses = tagCourses.filter(course => course.status === 'Completed').length;
      
      return {
        tag,
        performanceScore: totalTagCourses > 0 ? (completedTagCourses / totalTagCourses) * 100 : 0
      };
    });

    setEmployeeCourses(tagPerformance);
  };

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
  
  const chartData = {
    labels: employeeCourses.map(course => course.tag),
    datasets: [
      {
        label: 'Performance Score (%)',
        data: employeeCourses.map(course => course.performanceScore),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className='border mx-8 my-8 p-4'>
      <h1 className="text-2xl font-bold mb-4 text-center">Employee Performance by Course Tag</h1>

      <div className="mb-8 text-center flex justify-center">
        <label htmlFor="employeeSelect" className="block mb-2 text-lg font-semibold mx-4 mt-2">Select Employee</label>
        <select 
          id="employeeSelect" 
          className="border border-gray-300 p-2 rounded" 
          onChange={handleEmployeeSelect}
        >
          <option value="">-- Select an Employee --</option>
          {employees.map(emp => (
            <option key={emp.employee_id} value={emp.employee_id}>
              {emp.name} - {emp.designation}
            </option>
          ))}
        </select>
      </div>

      {selectedEmployee && (
        <div>
          {/* <h2 className="text-lg font-semibold mb-2 text-center">
            Performance Score by Tag for {selectedEmployee.name} ({selectedEmployee.designation})
          </h2> */}
          <div className='w-full max-w-8xl h-[600px] mx-auto flex justify-center'>
            <Bar 
              data={chartData} 
              options={chartOptions}
            
            />
          </div>
          
        </div>
      )}
    </div>
  );
};

export default EmployeePerformance;
