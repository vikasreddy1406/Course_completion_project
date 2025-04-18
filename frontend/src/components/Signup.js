import React, { useState, useContext } from "react";
import { alertContext } from "../context/alertContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingUi from "./LoadingUi";
import api from "../api/api"

export default function Signup() {
    const [signupData, setSignupData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "employee", 
        designation: "",
    });
    const [loading, setLoading] = useState(false);

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setSignupData((signupData) => ({ ...signupData, [name]: value }));
    };

    const { showAlert } = useContext(alertContext);
    let navigate = useNavigate();

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        if (
            !signupData.name ||
            !signupData.email ||
            !signupData.password ||
            !signupData.confirmPassword ||
            !signupData.role 
        ) {
            showAlert("Please fill in all fields");
            return;
        }

        if (signupData.password !== signupData.confirmPassword) {
            showAlert("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            const response = await api.post("/api/user/register", {
                name: signupData.name,
                email: signupData.email,
                password: signupData.password,
                role: signupData.role,
                designation: signupData.designation,
            });
            setLoading(false);
            if (response.status === 200) {
                showAlert("Account created successfully");
                navigate("/login");
            }
            if (response.status === 201) {
                showAlert("User with this email already exists");
            }
        } catch (error) {
            setLoading(false);
            console.log(error)
            showAlert("Error creating account");
        }
    };

    const handleLoginClick = (e) => {
        e.preventDefault();
        navigate('/login');
    };

    return (
        loading ? <LoadingUi /> : (
            <div
                className="flex items-center justify-center h-screen"
                style={{ background: 'linear-gradient(#dcdee0, #9198e5)' }}
            >
                <form
                    className="w-md mx-auto bg-white p-8 rounded-lg shadow-md w-96"
                    onSubmit={handleCreateAccount}
                >
                    <div className="mb-5">
                        <label
                            htmlFor="name"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Full Name <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={signupData.name}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            onChange={handleOnChange}
                            required
                        />
                    </div>
                    <div className="mb-5">
                        <label
                            htmlFor="email"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Email address <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={signupData.email}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            onChange={handleOnChange}
                            required
                        />
                    </div>
                    <div className="mb-5">
                        <label
                            htmlFor="password"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Password <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            onChange={handleOnChange}
                            value={signupData.password}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-5">
                        <label
                            htmlFor="confirmPassword"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Confirm password <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            onChange={handleOnChange}
                            value={signupData.confirmPassword}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-5">
                        <label
                            htmlFor="role"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Role <span className="text-red-600">*</span>
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={signupData.role}
                            onChange={handleOnChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required
                        >
                            <option value="">Select role</option>
                            <option value="admin">Admin</option>
                            <option value="employee">Employee</option>
                        </select>
                    </div>
                    <div className="mb-5">
                        <label
                            htmlFor="designation"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Designation 
                        </label>
                        <select
                            id="designation"
                            name="designation"
                            value={signupData.designation}
                            onChange={handleOnChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required
                        >
                            <option value="">Select designation</option>
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

                    <div className="flex justify-center mb-8">
                        <button
                            type="submit"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            Signup
                        </button>
                    </div>
                    <p className=" cursor-pointer text-center " >
                        Already an user? <Link onClick={handleLoginClick} className="text-blue-700 hover:underline">Login</Link>
                    </p>
                </form>
            </div>
        )
    );
}
