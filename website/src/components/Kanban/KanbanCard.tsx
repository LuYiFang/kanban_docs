import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { TaskWithProperties } from "../../types/task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { assignProjectColor, priorityColor } from "../../types/property"; // 新增引入 priorityColor

interface KanbanCardProps {
  task: TaskWithProperties;
  index: number;
  onEdit: (task: TaskWithProperties) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, index, onEdit }) => {
  // 提取 priority、assignee、epic 和 project 屬性
  const priority = task.properties.find((prop) => prop.name === "priority");
  const assignee = task.properties.find((prop) => prop.name === "assignee");
  const epic = task.properties.find((prop) => prop.name === "epic");
  const project = task.properties.find((prop) => prop.name === "project");

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
              className={`mt-2 mb-2 px-2 py-1 text-xs w-[fit-content] font-semibold rounded ${
                priorityColor[priority.value.toLowerCase()] ||
                "bg-gray-500 text-white"
              }`}
              data-cy="kanban-task-priority"
            >
              {priority.value}
            </div>
          )}
          {/* 顯示 Assignee */}
          {assignee?.value && (
            <div
              className="mt-2 text-gray-300 text-sm flex items-center"
              data-cy="kanban-task-assignee"
            >
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              <span>{assignee.value}</span>
            </div>
          )}
          {/* 顯示 Epic */}
          {epic?.value && (
            <div
              className="mt-2 text-gray-400 text-sm"
              data-cy="kanban-task-epic"
            >
              {epic.value}
            </div>
          )}
          {/* 顯示 Project */}
          {project?.value && (
            <div
              className={`mt-2 mb-2  px-2 py-1 text-xs w-[fit-content] font-semibold rounded ${assignProjectColor(project.value)}`}
              data-cy="kanban-task-project"
            >
              {project.value}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
