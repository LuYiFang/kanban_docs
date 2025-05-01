import { Property } from "./property";

export type taskType = "regular" | "weekly" | "docs";

export interface Task {
  id: string;
  title: string;
  content: string;
  type: string;
  order: number;
  updatedAt: string;
}

export interface TaskCreate extends Omit<Task, "id"> {}

export interface TaskUpdate {
  title: string;
  content: string;
}

export interface TaskWithProperties extends Task {
  properties: Property[];

  [key: string]: any;
}
