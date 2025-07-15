import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { me } from "./store/slices/authSlice";
import Dashboard from "./pages/Dashboard";
import KanbanPage from "./pages/KanbanPage";
import WeeklyReportPage from "./pages/WeeklyReportPage";
import DocsPage from "./pages/DocsPage";
import TaskPage from "./pages/TaskPage";
import LoginPage from "./pages/LoginPage";
import { AppDispatch, RootState } from "./store/store";

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const location = useLocation();

  useEffect(() => {
    dispatch(me());
  }, [dispatch, location]);

  return (
    <Routes>
      {!isLoggedIn ? (
        <Route path="*" element={<LoginPage />} />
      ) : (
        <>
          <Route path="/" element={<Dashboard />}>
            <Route index element={<Navigate to="/kanban" />} />{" "}
            <Route path="kanban" element={<KanbanPage />} />
            <Route path="weekly-report" element={<WeeklyReportPage />} />
            <Route path="docs" element={<DocsPage />} />
            <Route path="task/:taskId" element={<TaskPage />} />
          </Route>
          <Route path="*" element={<div>Page Not Found</div>} />
        </>
      )}
    </Routes>
  );
};

export default App;
