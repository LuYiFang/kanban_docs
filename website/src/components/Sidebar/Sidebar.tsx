import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faChartBar,
  faChevronLeft,
  faChevronRight,
  faColumns,
} from "@fortawesome/free-solid-svg-icons";

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const navItems = [
    { name: "Kanban", path: "/kanban", icon: faColumns },
    { name: "Weekly Report", path: "/weekly-report", icon: faChartBar },
    { name: "Docs", path: "/docs", icon: faBook },
  ];

  return (
    <div
      className={`h-full bg-gray-800 text-white flex flex-col ${
        isCollapsed ? "w-10" : "w-56"
      } transition-all duration-300`}
    >
      <div
        className={`flex flex-col ${isCollapsed ? "items-center" : "items-end"} w-full p-2`}
      >
        <button
          className="p-0 bg-gray-800  rounded-full h-8 w-8 text-white flex justify-center items-center"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <FontAwesomeIcon icon={faChevronRight} />
          ) : (
            <FontAwesomeIcon icon={faChevronLeft} />
          )}
        </button>
      </div>
      <nav>
        <div className={`space-y-4 ${isCollapsed ? "text-center" : ""}`}>
          {navItems.map((item) => (
            <div key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block p-2 rounded transition text-white ${
                    isActive ? "bg-gray-700" : "hover:bg-gray-700"
                  }`
                }
              >
                <div className="flex items-center">
                  <FontAwesomeIcon icon={item.icon} className="text-lg" />
                  {!isCollapsed && (
                    <span className="ml-2 text-left">{item.name}</span>
                  )}
                </div>
              </NavLink>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
