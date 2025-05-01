import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import KanbanCard from "./KanbanCard";

interface KanbanColumnProps {
  column: {
    id: string;
    name: string;
    tasks: any[];
  };
  isCollapsed: boolean;
  onToggleCollapse: (columnId: string) => void;
  onEditTask: (task: any) => void;
  cardVisibleProperties: string[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  isCollapsed,
  onToggleCollapse,
  onEditTask,
  cardVisibleProperties,
}) => (
  <Droppable droppableId={column.id}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className="p-4 bg-gray-800 rounded shadow"
        data-cy="kanban-column"
        id={column.id}
      >
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => onToggleCollapse(column.id)}
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
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </div>
    )}
  </Droppable>
);

export default KanbanColumn;
