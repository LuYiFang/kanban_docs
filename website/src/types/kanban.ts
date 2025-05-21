import { TaskWithProperties } from "./task";
import { PropertyConfig } from "./property";
import { Layouts } from "react-grid-layout";

export interface KanbanState {
  tasks: TaskWithProperties[];
  propertySetting: PropertyConfig[];
  all: TaskWithProperties[];
  docsLayout: Layouts | null;
}

export type kanbanDataName = "tasks" | "propertySetting" | "all";

export enum DataType {
  TASK = "task",
  ALL = "all",
}

export interface Column {
  id: string;
  name: string;
  tasks: TaskWithProperties[];
}

export interface KanbanBoardProps {
  dataName: kanbanDataName;
  groupPropertyName: string;
  columnSort: string[];
  defaultProperties: any[];
  propertyOrder: string[];
  readOnly: boolean;
  taskSortProperty: string;
  cardVisibleProperties: string[];
}
