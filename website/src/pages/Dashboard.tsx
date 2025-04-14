import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { Routes, Route } from "react-router-dom";
import KanbanPage from "../pages/KanbanPage";
import WeeklyReportPage from "../pages/WeeklyReportPage";
import DocsPage from "../pages/DocsPage";
import DailyPage from "./DailyPage";
import {
  getAllTaskWithProperties,
  getPropertiesAndOptions,
} from "../store/slices/kanbanThuck";
import { useDispatch } from "react-redux";

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllTaskWithProperties());
    dispatch(getPropertiesAndOptions());
  }, []);

  return (
    <div className="flex h-screen w-screen ">
      <Sidebar />

      <div className="flex flex-col flex-grow h-full bg-gray-100">
        <Routes>
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path="/daily" element={<DailyPage />} />
          <Route path="/weekly-report" element={<WeeklyReportPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="*" element={<div>Welcome to the Dashboard!</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
