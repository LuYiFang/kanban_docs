import { Property } from "./property";

export interface Task {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface TaskCreate {
  id: string;
  title: string;
  content: string;
  properties: {
    [key: string]: string;
  };
}

export interface TaskUpdate {
  title: string;
  content: string;
}

export interface TaskWithProperties extends Task {
  properties: Property[];
}
