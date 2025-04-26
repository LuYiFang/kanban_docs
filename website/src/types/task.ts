import { Property } from "./property";

export interface Task {
  id: string;
  title: string;
  content: string;
  type: string;
  order: number;
}

export interface TaskCreate extends Omit<Task, "id"> {}

export interface TaskUpdate {
  title: string;
  content: string;
}

export interface TaskWithProperties extends Task {
  properties: Property[];
}
