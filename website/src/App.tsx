import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import KanbanPage from "./pages/KanbanPage";
import WeeklyReportPage from "./pages/WeeklyReportPage";
import DocsPage from "./pages/DocsPage";
import TaskPage from "./pages/TaskPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<div>Welcome to the Dashboard!</div>} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="weekly-report" element={<WeeklyReportPage />} />
          <Route path="docs" element={<DocsPage />} />
          <Route path="task/:taskId" element={<TaskPage />} />
        </Route>

        {/* 任何未知的路徑顯示歡迎資訊 */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;
