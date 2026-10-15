import React from 'react'
import { useState, useEffect } from 'react';
import useAuth from '../Hooks/useAuth';
import {FaUserCircle} from 'react-icons/fa'
import { Link,useNavigate } from 'react-router-dom';

function AccountsMenu() {
  const {isAuthenticated , logout} = useAuth();
  const navigate = useNavigate();
  const dropdownRef = React.useRef(null);
  const [isopen, setIsOpen] = useState(false);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const toggleDropdown = () => {
    setIsOpen(!isopen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <div>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 focus:outline-none"
        >
          <FaUserCircle size={24} />
          <span className="hidden sm:inline">Account</span>
        </button>

        {isopen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
            {isAuthenticated ? (
              <>
               <Link to ="/sell" className="block px-4  bg-orange-500 py-2 text-gray-700 hover:bg-orange-100">
                +sell
               </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <Link
                  to="/mylistings"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  My Listings
                </Link>
                <Link to="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Settings
                </Link>
                <hr className="my-1 border-gray-300" />
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
   
export default AccountsMenu