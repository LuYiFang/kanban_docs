import React, { useMemo } from "react";
import { Draggable } from "react-beautiful-dnd";
import { TaskWithProperties } from "../../types/task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import {
  assignProjectColor,
  priorityColor,
  statusColors,
} from "../../types/property";
import { convertToKebabCase } from "../../utils/tools";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import _ from "lodash";
import { kanbanDataName } from "../../types/kanban";

interface KanbanCardProps {
  task: TaskWithProperties;
  index: number;
  onEdit: (task: TaskWithProperties) => void;
  cardVisibleProperties: string[];
  dataName: kanbanDataName;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  index,
  onEdit,
  cardVisibleProperties,
  dataName,
}) => {
  const propertySetting = useSelector(
    (state: RootState) => state.kanban.propertySetting,
  );

  const tasks: TaskWithProperties[] = useSelector((state: RootState) => {
    return state.kanban[dataName] as TaskWithProperties[];
  });

  const propertyOptionsIdNameMap = useMemo(() => {
    const taskIdTitleMap = _.reduce(
      tasks,
      (result, task) => {
        result[task.id] = task.title;
        return result;
      },
      {} as Record<string, string>,
    );

    const propertyIdNameMap = _.reduce(
      propertySetting,
      (result, property) => {
        _.each(property.options, (option) => {
          result[option.id] = option.name;
        });
        return result;
      },
      {} as Record<string, string>,
    );

    return _.merge({}, taskIdTitleMap, propertyIdNameMap);
  }, [tasks, propertySetting]);

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

          {cardVisibleProperties.map((propertyName) => {
            let propertyValue;
            if (propertyName == "summary") {
              propertyValue = task.content;
            } else {
              propertyValue = task.properties.find(
                (prop) => prop.name === propertyName,
              )?.value;
              if (propertyValue)
                propertyValue = propertyOptionsIdNameMap[propertyValue];
            }
            if (!propertyValue) return "";

            if (propertyName === "epic") {
              return (
                <TextLabel
                  key={propertyName}
                  propertyName={propertyName}
                  text={propertyValue}
                />
              );
            } else if (
              propertyName === "project" ||
              propertyName === "priority" ||
              propertyName === "status"
            ) {
              return (
                <ChipLabel
                  key={propertyName}
                  propertyName={propertyName}
                  propertyValue={propertyValue}
                />
              );
            } else if (propertyName === "assignee") {
              return (
                <PersonLabel
                  key={propertyName}
                  propertyName={propertyName}
                  personName={propertyValue}
                />
              );
            } else if (propertyName === "summary") {
              return (
                <SummaryLabel
                  key={propertyName}
                  propertyName={propertyName}
                  summary={propertyValue}
                />
              );
            }
            return "";
          })}
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;

const ChipLabel: React.FC<{
  propertyName: string;
  propertyValue: string;
}> = ({ propertyName, propertyValue }) => {
  const color = useMemo(() => {
    const defaultColor = "bg-gray-500 text-white";
    if (propertyName == "priority") {
      return priorityColor[
        propertyValue.toLowerCase() as keyof typeof priorityColor
      ];
    }
    if (propertyName == "project") {
      return assignProjectColor(propertyValue);
    }
    if (propertyName == "status") {
      return statusColors[
        convertToKebabCase(propertyValue) as keyof typeof statusColors
      ];
    }
    return defaultColor;
  }, [propertyValue]);

  return (
    <div
      className={`mt-2 mb-2 px-2 py-1 text-xs w-[fit-content] font-semibold rounded ${color}`}
      data-cy={`kanban-task-${propertyName}`}
    >
      {propertyValue}
    </div>
  );
};

const PersonLabel: React.FC<{
  propertyName: string;
  personName: string;
}> = ({ propertyName, personName }) => {
  return (
    <div
      className="mt-2 text-gray-300 text-sm flex items-center"
      data-cy={`kanban-task-${propertyName}`}
    >
      <FontAwesomeIcon icon={faUser} className="mr-2" />
      <span>{personName}</span>
    </div>
  );
};

const SummaryLabel: React.FC<{
  propertyName: string;
  summary: string;
}> = ({ propertyName, summary }) => {
  return (
    <div
      className="mt-2 text-gray-200 text-sm"
      data-cy={`kanban-task-${propertyName}`}
    >
      {summary.length > 50 ? `${summary.substring(0, 50)}...` : summary}
    </div>
  );
};

const TextLabel: React.FC<{
  propertyName: string;
  text: string;
}> = ({ propertyName, text }) => {
  return (
    <div
      className="mt-2 text-gray-400 text-sm"
      data-cy={`kanban-task-${propertyName}`}
    >
      {text}
    </div>
  );
};
