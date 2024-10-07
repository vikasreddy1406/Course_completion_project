import Cookie from "js-cookie";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

export default function Navbar() {
  const [link, setLink] = useState("/");
  const [role, setRole] = useState("employee");
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const location = useLocation();
  const [employeeId, setEmployeeId] = useState("");
  const [activeLink, setActiveLink] = useState(location.pathname); 

  useEffect(() => {
    const token = Cookie.get("accessToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      const currentRole = decodedToken.role;
      setEmployeeId(decodedToken._id);
      setRole(currentRole);
      setName(decodedToken.name);
      setDesignation(decodedToken.designation);

      if (currentRole === "admin") {
        setLink("/admin");
      } else {
        setLink("/");
      }
    }
  }, []);

  let navigate = useNavigate();

  const handleLogoutClick = (e) => {
    e.preventDefault();
    Cookie.remove("accessToken");
    Cookie.remove("role");
    navigate("/login");
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    if (role === "employee") {
      navigate(`/profile/${employeeId}`);
    }
  };

  const handleLearningPathClick = (e) => {
    e.preventDefault();
    if (role === "employee") {
      navigate(`/learning-path/${employeeId}`);
    } else {
      navigate("/admin/learning-path");
    }
    setActiveLink("/learning-path");
  };

  const handleHomeClick = () => {
    setActiveLink(link); 
  };

  return (
    <div className="mb-32 sm:mb-20 dark">
      <nav className="bg-white dark:bg-[#0369a1] fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
        <div className="justify-between flex flex-wrap mx-auto p-4">
          <Link
            to={link}
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img
              src="https://flowbite.com/docs/images/logo.svg"
              className="h-8"
              alt="Flowbite Logo"
            />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              JLearn
            </span>
          </Link>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse bg-transparent">
            <button
              onClick={handleProfileClick}
              disabled={role === "admin"}
              type="button"
              className="mr-4 text-[#0369a1] bg-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-white dark:focus:ring-white"
            >
              {name} - {designation}
            </button>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
            >
              Logout
            </button>
          </div>
          <div
            className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
            id="navbar-sticky"
          >
            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-transparent md:dark:bg-transparent dark:border-gray-700">
              <li>
                <Link
                  to={link}
                  onClick={handleHomeClick}
                  className={`block py-2 text-xl px-3 rounded md:p-0 ${activeLink === link ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}
                  aria-current="page"
                >
                  Home
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLearningPathClick}
                  className={`block py-2 text-xl px-3 rounded md:p-0 ${activeLink === "/learning-path" ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}
                >
                  Learning Path
                </button>
              </li>
              <li>
                <Link
                  to="/contact"
                  onClick={() => setActiveLink("/contact")} 
                  className={`block py-2 text-xl px-3 rounded md:p-0 ${activeLink === "/contact" ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}
