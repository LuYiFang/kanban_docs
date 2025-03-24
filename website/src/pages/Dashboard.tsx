import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { Routes, Route } from "react-router-dom";
import KanbanPage from "../pages/KanbanPage";
import WeeklyReportPage from "../pages/WeeklyReportPage";
import DocsPage from "../pages/DocsPage";

const Dashboard: React.FC = () => {
    return (
        <div className="flex h-screen w-screen ">
            {/* Sidebar 固定左側 */}
            <Sidebar />

            {/* 主內容區域填滿剩餘空間 */}
            <div className="flex flex-col flex-grow h-full bg-gray-100">
                <Routes>
                    <Route path="/kanban" element={<KanbanPage />} />
                    <Route path="/weekly-report" element={<WeeklyReportPage />} />
                    <Route path="/docs" element={<DocsPage />} />
                    <Route path="*" element={<div>Welcome to the Dashboard!</div>} />
                </Routes>
            </div>
        </div>
    );
};

export default Dashboard;