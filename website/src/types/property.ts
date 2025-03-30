export type PropertyType = "select" | "member" | "date" | "readonly";

export interface PropertyOption {
  id: string;
  name: string;
  [p: string]: any;
}

export interface PropertyConfig {
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
  Priority: {
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
  Status: {
    type: "select",
    options: [
      { id: "todo", name: "To Do" },
      { id: "in-progress", name: "In Progress" },
      { id: "done", name: "Done" },
    ],
    defaultValue: "todo",
  },
  Assignee: { type: "member", defaultValue: "" },
  Deadline: { type: "date" },
  "Create Date": { type: "readonly" },
  "Update Date": { type: "readonly" },
  "Finished Date": { type: "date" },
};

export const priorityColor = {
  high: "bg-red-500 text-white",
  medium: "bg-orange-400 text-gray-900",
  low: "bg-green-500 text-white",
};

export const priorityName = propertyDefinitions.Priority.options.reduce(
  (acc, item) => {
    acc[item.id] = item.name;
    return acc;
  },
  {} as Record<string, string>,
);

export const statusName = propertyDefinitions.Status.options.reduce(
  (acc, item) => {
    acc[item.id] = item.name;
    return acc;
  },
  {} as Record<string, string>,
);

export const defaultProperties = [
  { name: "priority", value: "low" },
  { name: "status", value: "todo" },
];
