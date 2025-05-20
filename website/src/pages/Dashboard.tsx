import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import { getPropertiesAndOptions } from "../store/slices/kanbanThuck";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(getPropertiesAndOptions());
  }, []);

  return (
    <div className="flex h-screen w-screen">
      <Sidebar />

      <div className="flex flex-col flex-grow h-full bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
