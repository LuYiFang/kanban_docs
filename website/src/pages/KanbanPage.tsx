import React from "react";
import KanbanBoard from "../components/Kanban/KanbanBoard";
import {
  defaultTaskProperties,
  statusOrder,
  taskPropertyOrder,
} from "../types/property";
import { RegularStrategy } from "../components/Kanban/strategies/RegularStrategy";

const KanbanPage: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col bg-gray-900 text-gray-300">
      <h1 className="text-2xl font-bold mb-4">Kanban</h1>
      <KanbanBoard
        type="regular"
        dataName="tasks"
        groupPropertyName="status"
        columnSort={statusOrder}
        defaultProperties={defaultTaskProperties}
        propertyOrder={taskPropertyOrder}
        strategy={new RegularStrategy()}
      />
    </div>
  );
};

export default KanbanPage;
