import { TaskWithProperties } from "./task";
import { PropertyConfig } from "./property";

export interface KanbanState {
  tasks: TaskWithProperties[];
  propertySetting: PropertyConfig[];
}

export type kanbanDataName = "tasks" | "propertySetting";

export interface Column {
  id: string;
  name: string;
  tasks: TaskWithProperties[];
}

export interface KanbanBoardProps {
  type: string;
  dataName: kanbanDataName;
  groupPropertyName: string;
  columnSort: string[];
  defaultProperties: any[];
  propertyOrder: string[];
}
