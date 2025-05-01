import React, { useEffect } from "react";
import KanbanBoard from "../components/Kanban/KanbanBoard";
import {
  defaultTaskProperties,
  statusOrder,
  taskPropertyOrder,
} from "../types/property";
import { getAllTaskWithProperties } from "../store/slices/kanbanThuck";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";

const KanbanPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getAllTaskWithProperties({ taskType: "regular" }));
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 text-gray-300">
      <h1 className="text-2xl font-bold mb-4 ml-4 mt-4">Kanban</h1>
      <KanbanBoard
        dataName="tasks"
        groupPropertyName="status"
        columnSort={statusOrder}
        defaultProperties={defaultTaskProperties}
        propertyOrder={taskPropertyOrder}
        readOnly={false}
        taskSortProperty="order"
        cardVisibleProperties={["project", "epic", "priority", "assignee"]}
      />
    </div>
  );
};

export default KanbanPage;
