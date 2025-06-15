import React, { useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import KanbanCard from "./KanbanCard";
import { kanbanDataName } from "../../types/kanban";

interface KanbanColumnProps {
  column: {
    id: string;
    name: string;
    tasks: any[];
  };
  defaultIsCollapsed: boolean;
  onEditTask: (task: any) => void;
  cardVisibleProperties: string[];
  dataName: kanbanDataName;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  defaultIsCollapsed,
  onEditTask,
  cardVisibleProperties,
  dataName,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultIsCollapsed);

  return (
    <Droppable droppableId={column.id}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="p-4 bg-gray-800 rounded shadow max-h-[80vh] overflow-y-auto"
          data-cy="kanban-column"
          id={column.id}
        >
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <h2 className="text-lg font-bold text-gray-300 mb-2">
              {column.name}
            </h2>
            <span className="text-gray-400">
              <FontAwesomeIcon icon={isCollapsed ? faPlus : faMinus} />
            </span>
          </div>

          {!isCollapsed && (
            <div data-cy="kanban-column-cards">
              {column.tasks.map((task, index) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={onEditTask}
                  cardVisibleProperties={cardVisibleProperties}
                  dataName={dataName}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </div>
      )}
    </Droppable>
  );
};

export default KanbanColumn;
