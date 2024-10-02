import Cookie from "js-cookie";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const [link, setLink] = useState("/");
  const [role, setRole] = useState("employee"); 
    const [name, setName] = useState(""); 
    const [designation, setDesignation] = useState("");
  const location = useLocation();

  useEffect(() => {
    const token = Cookie.get("accessToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      const currentRole = decodedToken.role;

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
    navigate('/login');
  };

  return (
    <div className="mb-32 sm:mb-20 dark">
      <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
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
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <button
              type="button"
              className="mr-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <Link
                  to={link}
                  className={`block py-2 px-3 rounded md:p-0 ${location.pathname === link ? "text-blue-700" : "text-gray-900 dark:text-white"}`}
                  aria-current="page"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className={`block py-2 px-3 rounded md:p-0 ${location.pathname === "/contact" ? "text-blue-700" : "text-gray-900 dark:text-white"}`}
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
