import React from "react";
import { TaskWithProperties } from "../../types/task";
import {
  ChipLabel,
  ContentLabel,
  MultiChipLabel,
  PersonLabel,
  SummaryLabel,
  TextLabel,
} from "../Label/Labels";
import _ from "lodash";

interface KanbanCardContentProps {
  task: TaskWithProperties;
  cardVisibleProperties: string[];
  propertyOptionsIdNameMap: Record<string, string>;
  readonly: boolean;
  deleteContentLabelTaskCallback?: () => void;
  cardClass?: string;
}

const Card: React.FC<KanbanCardContentProps> = ({
  task,
  cardVisibleProperties,
  propertyOptionsIdNameMap,
  readonly = false,
  deleteContentLabelTaskCallback,
  cardClass = "",
}) => {
  return (
    <div
      className={`
        mb-2 bg-gray-900 rounded shadow w-full h-full flex flex-col overflow-auto ${cardClass}
      `}
      style={{ boxSizing: "border-box" }}
    >
      {cardVisibleProperties.map((propertyName, i) => {
        if (propertyName === "title") {
          return (
            <div
              key={`card-property-${i}`}
              className="font-bold text-gray-100 mb-2"
              data-cy="kanban-task-title"
            >
              {task.title}
            </div>
          );
        }

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
        if (!propertyValue && propertyName !== "content") return "";

        if (propertyName === "epic") {
          return (
            <TextLabel
              key={`card-property-${i}`}
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
              key={`card-property-${i}`}
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
              key={`card-property-${i}`}
              propertyName={propertyName}
              propertyValues={propertyValue as string[]}
            />
          );
        } else if (propertyName === "assignee") {
          return (
            <PersonLabel
              key={`card-property-${i}`}
              propertyName={propertyName}
              personName={propertyValue as string}
            />
          );
        } else if (propertyName === "summary") {
          return (
            <SummaryLabel
              key={`card-property-${i}`}
              propertyName={propertyName}
              summary={propertyValue as string}
            />
          );
        } else if (propertyName === "content") {
          return (
            <ContentLabel
              key={`card-property-${i}`}
              propertyName={propertyName}
              taskId={task.id}
              readonly={readonly}
              deleteTaskCallback={deleteContentLabelTaskCallback}
            />
          );
        }
        return "";
      })}
    </div>
  );
};

export default Card;
