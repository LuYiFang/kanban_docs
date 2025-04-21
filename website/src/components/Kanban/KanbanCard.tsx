import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { TaskWithProperties } from "../../types/task";

interface KanbanCardProps {
  task: TaskWithProperties;
  index: number;
  onEdit: (task: TaskWithProperties) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, index, onEdit }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 mb-2 bg-gray-700 rounded shadow ${
            snapshot.isDragging ? "transform scale-105" : ""
          }`}
          style={{ position: "relative", ...provided.draggableProps.style }}
          data-cy="kanban-task"
          id={task.id}
          onClick={() => onEdit(task)}
        >
          <div className="font-bold text-gray-100" data-cy="kanban-task-title">
            {task.title}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
