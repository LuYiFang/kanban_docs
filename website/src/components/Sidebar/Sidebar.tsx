import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar: React.FC = () => {
    const navItems = [
        { name: "Kanban", path: "/kanban" },
        { name: "Weekly Report", path: "/weekly-report" },
        { name: "Docs", path: "/docs" },
    ];

    return (
        <div className="w-64 h-full bg-gray-800 text-white flex flex-col p-4">
            <h2 className="text-xl font-bold mb-6">Navigation</h2>
            <nav>
                <ul className="space-y-4">
                    {navItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `block p-2 rounded transition ${
                                        isActive ? "bg-gray-700" : "hover:bg-gray-700"
                                    }`
                                }
                            >
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;