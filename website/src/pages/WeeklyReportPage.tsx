import React, { useEffect, useMemo, useState } from "react";
import KanbanBoard from "../components/Kanban/KanbanBoard";
import {
  defaultTaskProperties,
  levelOrder,
  taskPropertyOrder,
} from "../types/property";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import {
  getAllTaskWithProperties,
  getSummary,
} from "../store/slices/kanbanThuck";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import CopyInput from "../components/Input/CopyInput"; // 新增导入

const WeeklyReportPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [summaryText, setSummaryText] = useState<string>("");

  const generateSummary = () => {
    dispatch(getSummary())
      .unwrap()
      .then((summary) => {
        setSummaryText(summary);
      });
  };

  useEffect(() => {
    dispatch(getAllTaskWithProperties({ taskType: "weekly" }));
  }, []);

  const summaryTexts = useMemo(() => {
    if (!summaryText) return [];
    return summaryText.split("\n").map((line) => line.trim());
  }, [summaryText]);

  const clearSummary = () => {
    setSummaryText("");
  };

  return (
    <div className="h-screen overflow-auto w-full flex flex-col bg-gray-900 text-gray-300">
      <div className="flex flex-col p-4 space-y-2">
        <h1 className="text-2xl font-bold">Weekly</h1>
        {summaryTexts.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-md max-h-72 overflow-auto relative">
            <button
              className="absolute p-0 top-1 right-1 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-600"
              onClick={clearSummary}
              data-cy="clear-search-results"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            {summaryTexts.map((text, index) => (
              <CopyInput key={index} text={text} />
            ))}
          </div>
        )}
      </div>
      <button
        className="absolute top-4 right-20 w-12 h-12 text-gray-300 hover:text-white flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700"
        title="Summarize"
        onClick={generateSummary}
      >
        <FontAwesomeIcon icon={faListCheck} />
      </button>
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
