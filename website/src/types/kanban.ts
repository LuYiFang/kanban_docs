export type PropertyType = "select" | "member" | "date" | "readonly";

export interface PropertyOption {
  id: string;
  name: string;
}

export interface PropertyConfig {
  type: PropertyType;
  options?: PropertyOption[];
  defaultValue?: string;
}

export const propertyDefinitions: Record<string, PropertyConfig> = {
  Priority: {
    type: "select",
    options: [
      { id: "high", name: "High" },
      { id: "medium", name: "Medium" },
      { id: "low", name: "Low" },
    ],
    defaultValue: "Medium",
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
