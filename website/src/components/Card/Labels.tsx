import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import {
  assignProjectColor,
  priorityColor,
  statusColors,
} from "../../types/property";
import { convertToKebabCase } from "../../utils/tools";

// 新增 Chip 組件
export const Chip: React.FC<{
  color: string;
  propertyName: string;
  propertyValue: string;
}> = ({ color, propertyName, propertyValue }) => {
  return (
    <div
      className={`px-2 py-1 text-xs w-[fit-content] font-semibold rounded ${color}`}
      data-cy={`kanban-task-${propertyName}`}
    >
      {propertyValue}
    </div>
  );
};

export const MultiChipLabel: React.FC<{
  propertyName: string;
  propertyValues: string[];
}> = ({ propertyName, propertyValues }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {propertyValues.map((value, index) => {
        const color = assignProjectColor(value);
        return (
          <Chip
            key={index}
            color={color}
            propertyName={propertyName}
            propertyValue={value}
          />
        );
      })}
    </div>
  );
};

export const ChipLabel: React.FC<{
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
    <div className="mt-2 mb-2 ">
      <Chip
        color={color}
        propertyName={propertyName}
        propertyValue={propertyValue}
      />
    </div>
  );
};

export const PersonLabel: React.FC<{
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

export const SummaryLabel: React.FC<{
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

export const TextLabel: React.FC<{
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

export const ContentLabel: React.FC<{
  propertyName: string;
  content: string;
}> = ({ propertyName, content }) => {
  return (
    <div
      className="mt-2 text-gray-300 text-sm"
      data-cy={`kanban-task-${propertyName}`}
    >
      {content}
    </div>
  );
};
