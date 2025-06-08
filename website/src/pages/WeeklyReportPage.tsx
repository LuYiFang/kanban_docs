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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListCheck } from "@fortawesome/free-solid-svg-icons";

const WeeklyReportPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getAllTaskWithProperties({ taskType: "weekly" }));
  }, []);

  return (
    <div className="h-screen overflow-auto w-full flex flex-col bg-gray-900 text-gray-300">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">Weekly</h1>
        <button
          className="text-gray-300 hover:text-white flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700"
          title="Summarize"
        >
          <FontAwesomeIcon icon={faListCheck} />
        </button>
      </div>
      <KanbanBoard
        dataName="all"
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
