export interface PropertyOption {
  id: string;
  name: string;
  [p: string]: any;
}

export interface PropertyConfig {
  name: string;
  type: PropertyType;
  options?: PropertyOption[];
  defaultValue?: string;
}

export interface Property {
  id: string;
  name: string;
  value: string;
  taskId: string;
}

export interface PropertyCreate {
  name: string;
  value: string;
  taskId: string;
}

export const taskPropertyOrder = [
  "project",
  "priority",
  "status",
  "level",
  "assignee",
  "deadline",
  "finishedAt",
];

export const statusOrder = [
  "epic",
  "todo",
  "in-progress",
  "waiting",
  "done",
  "cancelled",
  "deferred",
];

export const priorityColor = {
  high: "bg-red-500 text-white",
  medium: "bg-orange-400 text-gray-900",
  low: "bg-green-500 text-white",
};

export interface DefaultProperty {
  name: string;
  value: string;
}

export const defaultTaskProperties = [
  { name: "priority", value: "low" },
  { name: "status", value: "todo" },
  { name: "level", value: "c-level" },
  { name: "project", value: "" },
  { name: "assignee", value: "" },
  { name: "deadline", value: "" },
  { name: "finishedAt", value: "" },
];

export interface PropertyType {
  id: string;
  name: string;
}

export interface PropertyOption {
  propertyId: string;
  name: string;
}

export interface PropertyConfig {
  id: string;
  name: string;
  type: PropertyType;
  options?: PropertyOption[];
  defaultValue?: string;
}
