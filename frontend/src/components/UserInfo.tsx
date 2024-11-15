import React, { useRef, useState, useEffect } from "react";
import { FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import { api } from "../services/api";

interface UserInfoProps {
  avatar: string;
  name: string;
  status: string;
}

export const UserInfo: React.FC<UserInfoProps> = ({ avatar, name, status }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handler to close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    await api.logout();
  };

  return (
    <div className="flex items-center justify-between bg-gray-800 p-4">
      {/* User Information */}
      <div className="flex items-center">
        {avatar ? (
          <img
            src={avatar}
            alt="User Avatar"
            className="w-12 h-12 rounded-full mr-3"
          />
        ) : (
          <div className="w-12 h-12 rounded-full mr-3 bg-gray-400"></div>
        )}
        <div>
          <h2 className="text-white text-lg font-semibold">{name}</h2>
          <div
            className={`px-2 rounded-full text-sm ${
              status === "online"
                ? "bg-green-500"
                : status === "connected"
                ? "bg-yellow-500"
                : "bg-red-500"
            } text-white`}
          >
            {status}
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center text-gray-300 hover:text-white focus:outline-none"
        >
          <FaChevronDown />
        </button>
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20"
          >
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
