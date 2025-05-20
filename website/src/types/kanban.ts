import { TaskWithProperties } from "./task";
import { PropertyConfig } from "./property";
import { Layouts } from "react-grid-layout";

export interface KanbanState {
  tasks: TaskWithProperties[];
  propertySetting: PropertyConfig[];
  docs: TaskWithProperties[];
  docsLayout: Layouts | null;
}

export type kanbanDataName = "tasks" | "propertySetting" | "docs";

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
