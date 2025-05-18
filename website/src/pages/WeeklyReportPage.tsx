import React, { useEffect } from "react";
import KanbanBoard from "../components/Kanban/KanbanBoard";
import {
  defaultTaskProperties,
  levelOrder,
  taskPropertyOrder,
} from "../types/property";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { getAllTaskWithProperties } from "../store/slices/kanbanThuck";

const WeeklyReportPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getAllTaskWithProperties({ taskType: "weekly" }));
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 text-gray-300">
      <h1 className="text-2xl font-bold mb-4 ml-4 mt-4">Weekly</h1>
      <KanbanBoard
        dataName="tasks"
        groupPropertyName="level"
        columnSort={levelOrder}
        defaultProperties={defaultTaskProperties}
        propertyOrder={taskPropertyOrder}
        readOnly={true}
        taskSortProperty="properties.project"
        cardVisibleProperties={[
          "title",
          "project",
          "epic",
          "status",
          "assignee",
          "summary",
        ]}
      />
    </div>
  );
};

export default WeeklyReportPage;
