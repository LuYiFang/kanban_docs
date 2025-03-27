export type PropertyType = "select" | "member" | "date" | "readonly";

export interface PropertyConfig {
  type: PropertyType;
  options?: string[];
  defaultValue?: string;
}

export const propertyDefinitions: Record<string, PropertyConfig> = {
  Priority: {
    type: "select",
    options: ["High", "Medium", "Low"],
    defaultValue: "Medium",
  },
  Status: {
    type: "select",
    options: ["To Do", "In Progress", "Done"],
    defaultValue: "To Do",
  },
  Assignee: { type: "member", defaultValue: "" },
  Deadline: { type: "date" },
  "Create Date": { type: "readonly" },
  "Update Date": { type: "readonly" },
  "Finished Date": { type: "date" },
};
