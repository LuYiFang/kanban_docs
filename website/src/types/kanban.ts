import { TaskWithProperties } from "./task";

export interface KanbanState {
  columns: Column[];
}

export interface Column {
  id: string;
  name: string;
  tasks: TaskWithProperties[];
}
