import React from "react";
import { TaskWithProperties } from "../../types/task";
import {
  ChipLabel,
  ContentLabel,
  MultiChipLabel,
  PersonLabel,
  SummaryLabel,
  TextLabel,
} from "./Labels";
import _ from "lodash";

interface KanbanCardContentProps {
  task: TaskWithProperties;
  cardVisibleProperties: string[];
  propertyOptionsIdNameMap: Record<string, string>;
}

const Card: React.FC<KanbanCardContentProps> = ({
  task,
  cardVisibleProperties,
  propertyOptionsIdNameMap,
}) => {
  return (
    <div
      className="p-4 mb-2 bg-gray-700 rounded shadow w-full h-full"
      style={{ boxSizing: "border-box" }} // 確保內邊距不影響大小
    >
      <div className="font-bold text-gray-100 mb-2" data-cy="kanban-task-title">
        {task.title}
      </div>

      {cardVisibleProperties.map((propertyName) => {
        let propertyValue;
        if (propertyName == "summary" || propertyName == "content") {
          propertyValue = task.content;
        } else {
          propertyValue = task.properties.find(
            (prop) => prop.name === propertyName,
          )?.value;
          if (propertyValue) {
            if (_.isArray(propertyValue)) {
              propertyValue = _.map(
                propertyValue,
                (v) => propertyOptionsIdNameMap[v],
              );
            } else {
              propertyValue = propertyOptionsIdNameMap[propertyValue];
            }
          }
        }
        if (!propertyValue) return "";

        if (propertyName === "epic") {
          return (
            <TextLabel
              key={propertyName}
              propertyName={propertyName}
              text={propertyValue as string}
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
              propertyValue={propertyValue as string}
            />
          );
        } else if (propertyName === "tags") {
          if (!_.isArray(propertyValue)) {
            propertyValue = [propertyValue];
          }

          return (
            <MultiChipLabel
              key={propertyName}
              propertyName={propertyName}
              propertyValues={propertyValue}
            />
          );
        } else if (propertyName === "assignee") {
          return (
            <PersonLabel
              key={propertyName}
              propertyName={propertyName}
              personName={propertyValue as string}
            />
          );
        } else if (propertyName === "summary") {
          return (
            <SummaryLabel
              key={propertyName}
              propertyName={propertyName}
              summary={propertyValue as string}
            />
          );
        } else if (propertyName === "content") {
          return (
            <ContentLabel
              key={propertyName}
              propertyName={propertyName}
              content={propertyValue as string}
            />
          );
        }
        return "";
      })}
    </div>
  );
};

export default Card;
