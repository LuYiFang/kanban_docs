export type PropertyType = "select" | "member" | "date" | "readonly";

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

export const propertyDefinitions: Record<string, PropertyConfig> = {
  priority: {
    name: "Priority",
    type: "select",
    options: [
      { id: "high", name: "High" },
      {
        id: "medium",
        name: "Medium",
      },
      { id: "low", name: "Low" },
    ],
    defaultValue: "low",
  },
  status: {
    name: "Status",
    type: "select",
    options: [
      { id: "todo", name: "To Do" },
      { id: "in-progress", name: "In Progress" },
      { id: "done", name: "Done" },
      { id: "cancelled", name: "Cancelled" },
      { id: "deferred", name: "Deferred" },
    ],
    defaultValue: "todo",
  },
  level: {
    name: "Level",
    type: "select",
    options: [
      { id: "a-level", name: "A Level" },
      { id: "b-level", name: "B Level" },
      { id: "c-level", name: "C Level" },
      { id: "d-level", name: "D Level" },
    ],
    defaultValue: "c-level",
  },
  assignee: {
    name: "Assignee",
    type: "member", defaultValue: "" },
  deadline: {
    name: "Deadline",type: "date" },
  "finishedAt": { name: "FinishedAt",type: "date" },
};

export const priorityColor = {
  high: "bg-red-500 text-white",
  medium: "bg-orange-400 text-gray-900",
  low: "bg-green-500 text-white",
};

export const priorityName = propertyDefinitions.priority.options.reduce(
  (acc, item) => {
    acc[item.id] = item.name;
    return acc;
  },
  {} as Record<string, string>,
);

export const statusName = propertyDefinitions.status.options.reduce(
  (acc, item) => {
    acc[item.id] = item.name;
    return acc;
  },
  {} as Record<string, string>,
);

export const defaultProperties = [
  { name: "priority", value: "low" },
  { name: "status", value: "todo" },
  { name: "level", value: "c-level" },
  { name: "assignee", value: "" },
  { name: "deadline", value: "" },
  { name: "finishedAt", value: "" },
];
