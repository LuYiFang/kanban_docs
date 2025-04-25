import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { TaskWithProperties } from "../../types/task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

interface KanbanCardProps {
  task: TaskWithProperties;
  index: number;
  onEdit: (task: TaskWithProperties) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, index, onEdit }) => {
  // 提取 priority 和 assignee 屬性
  const priority = task.properties.find((prop) => prop.name === "priority");
  const assignee = task.properties.find((prop) => prop.name === "assignee");

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
          <div
            className="font-bold text-gray-100 mb-2"
            data-cy="kanban-task-title"
          >
            {task.title}
          </div>
          {/* 顯示 Priority */}
          {priority && (
            <div
              className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                priority.value === "High"
                  ? "bg-red-500 text-white"
                  : priority.value === "Medium"
                    ? "bg-yellow-500 text-white"
                    : "bg-green-500 text-white"
              }`}
              data-cy="kanban-task-priority"
            >
              {priority.value}
            </div>
          )}
          {/* 顯示 Assignee */}
          {assignee?.label && (
            <div
              className="mt-2 text-gray-300 text-sm flex items-center"
              data-cy="kanban-task-assignee"
            >
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              <span>{assignee.label}</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
