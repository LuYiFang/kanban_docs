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
import {
  faChevronLeft,
  faChevronRight,
  faListCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import CopyInput from "../components/Input/CopyInput"; // 新增导入

const WeeklyReportPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [summaryText, setSummaryText] = useState<string>("");
  const [currentWeek, setCurrentWeek] = useState<number>(0);

  const generateSummary = () => {
    dispatch(getSummary())
      .unwrap()
      .then((summary) => {
        setSummaryText(summary);
      })
      .catch((error) => {
        console.error("Failed to generate summary:", error);
      });
  };

  useEffect(() => {
    dispatch(
      getAllTaskWithProperties({ taskType: "weekly", weeksAgo: currentWeek }),
    );
  }, [currentWeek]);

  const summaryTexts = useMemo(() => {
    if (!summaryText) return [];
    return summaryText.split("\n").map((line) => line.trim());
  }, [summaryText]);

  const clearSummary = () => {
    setSummaryText("");
  };

  const handleWeekChange = (direction: "prev" | "next") => {
    setCurrentWeek((prevWeek) => {
      const newWeek = direction === "prev" ? prevWeek - 1 : prevWeek + 1;
      return newWeek < 0 ? 0 : newWeek;
    });
  };

  return (
    <div className="h-screen overflow-auto w-full flex flex-col bg-gray-900 text-gray-300">
      <div className="flex flex-col p-4 space-y-2">
        <div className="flex items-start justify-start">
          <h1 className="text-2xl font-bold">Weekly</h1>
          <div className="flex items-center space-x-2 ml-4">
            <button
              className="px-2 py-1 bg-transparent text-white rounded hover:bg-gray-600"
              onClick={() => handleWeekChange("prev")}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <span>{currentWeek}</span>
            <button
              className="px-2 py-1 bg-transparent text-white rounded hover:bg-gray-600"
              onClick={() => handleWeekChange("next")}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
        {summaryTexts.length > 0 && (
          <div
            className="bg-gray-800 p-4 rounded-md max-h-72 overflow-auto relative"
            data-cy="summary-area"
          >
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
        data-cy="generate-summary-button"
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
