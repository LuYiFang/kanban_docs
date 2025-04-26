export interface PropertyOption {
  id?: string;
  name: string;
  propertyId?: string; // 可選屬性，表示屬於哪個 Property
  [p: string]: any; // 允許擴展屬性
}

export interface PropertyConfig {
  id: string;
  name: string;
  type: string;
  options?: PropertyOption[];
  defaultValue?: string;
}

export interface Property {
  id: string;
  name: string;
  value: string;
  taskId: string;
}

export interface PropertyCreate extends Omit<Property, "id"> {}

// 預設的屬性順序
export const taskPropertyOrder = [
  "project",
  "priority",
  "status",
  "level",
  "assignee",
  "deadline",
  "finishedAt",
];

// 狀態的排序
export const statusOrder = [
  "epic",
  "todo",
  "in-progress",
  "waiting",
  "done",
  "cancelled",
  "deferred",
];

// 優先級對應的顏色
export const priorityColor = {
  high: "bg-red-500 text-white",
  medium: "bg-orange-400 text-gray-900",
  low: "bg-green-500 text-white",
};

// 預設的任務屬性
export const defaultTaskProperties: DefaultProperty[] = [
  { name: "priority", value: "low" },
  { name: "status", value: "todo" },
  { name: "level", value: "c-level" },
  { name: "project", value: "" },
  { name: "assignee", value: "" },
  { name: "deadline", value: "" },
  { name: "finishedAt", value: "" },
];

export interface DefaultProperty {
  name: string;
  value: string;
}
