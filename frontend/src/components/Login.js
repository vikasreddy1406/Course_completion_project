import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { alertContext } from '../context/alertContext';
import axios from 'axios';
import LoadingUi from './LoadingUi';
import Cookie from 'js-cookie';
import {jwtDecode} from 'jwt-decode';  

export default function Login() {

    const [loading, setLoading] = useState(false);
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });
    let navigate = useNavigate();

    const handleSignupClick = (e) => {
        e.preventDefault();
        navigate('/signup');
    };

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setLoginData((loginData) => ({ ...loginData, [name]: value }));
    };

    let { showAlert } = useContext(alertContext);

    const handleSubmitClick = async (e) => {
        e.preventDefault();
        if (!loginData.email || !loginData.password) {
            showAlert('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:4000/api/user/login', {
                email: loginData.email,
                password: loginData.password
            });

            setLoading(false);

            if (response.status === 200) {
                const { accessToken, loggedInUser } = response.data;

                // Save user details in cookies
                Cookie.set('accessToken', accessToken);
                Cookie.set('role', loggedInUser.role);
                
                // Decode JWT token to extract role
                const decodedToken = jwtDecode(accessToken);
                const role = decodedToken.role;

                showAlert('Login Successful');

                // Redirect based on role
                if (role === 'admin') {
                    navigate('/admin');
                } 
                else {
                    navigate('/');
                }
            } else if (response.status === 201) {
                showAlert('User doesn’t exist');
                navigate('/login');
            }
            else if (response.status === 202) {
                showAlert('Incorrect password');
                setLoginData({
                    ...loginData,
                    password: ''
                });
                
            }
        } catch (error) {
            setLoading(false);
            showAlert('Login failed. Please try again.');
            console.error('Login Error:', error);
        }
    };

    return (
        loading ? (
            <LoadingUi />
        ) : (
            <div className="flex items-center justify-center h-screen"
                style={{ background: 'linear-gradient(#CCD5AE, #E0E5B6, #FAEDCE)' }}>
                <form className="w-md mx-auto bg-white p-8 rounded-lg shadow-md w-96" onSubmit={handleSubmitClick}>
                    <p className="text-3xl text-pink-600 dark:text-white text-center pb-8  font-semibold">
                        Login
                    </p>
                    <div className="relative z-0 w-full mb-5 group pb-4">
                        <input
                            type="email"
                            name="email"
                            id="email"
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                            placeholder=" "
                            value={loginData.email}
                            onChange={handleOnChange}
                            required
                        />
                        <label
                            htmlFor="email"
                            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                            Email address
                        </label>
                    </div>
                    <div className="relative z-0 w-full mb-5 group pb-4">
                        <input
                            type="password"
                            name="password"
                            id="password"
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                            placeholder=" "
                            value={loginData.password}
                            onChange={handleOnChange}
                            required
                        />
                        <label
                            htmlFor="password"
                            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                            Password
                        </label>
                    </div>
                    <div className="flex justify-center mb-6">
                        <button
                            type="submit"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            Login
                        </button>
                    </div>
                    <p className="text-lg mb-4 text-gray-900 dark:text-white text-center">
                        New here? Create an Account
                    </p>
                    <div className="flex justify-center">
                        <button
                            onClick={handleSignupClick}
                            type="button"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            Signup
                        </button>
                    </div>
                </form>
            </div>
        )
    );
}
