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
  "epic",
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

// level 的排序
export const levelOrder = [];

// 優先級對應的顏色
export const priorityColor = {
  high: "bg-red-500 text-white",
  medium: "bg-orange-400 text-gray-900",
  low: "bg-green-500 text-white",
};

// 任務對應的顏色
export const projectColors = {
  primary: "bg-blue-600 text-white",
  secondary: "bg-purple-500 text-white",
  success: "bg-teal-500 text-white",
  warning: "bg-yellow-400 text-gray-900",
  danger: "bg-pink-500 text-white",
  info: "bg-cyan-500 text-white",
  neutral: "bg-gray-400 text-gray-900",
};

// 狀態對應的顏色
export const statusColors = {
  epic: "bg-purple-700 text-white",
  todo: "bg-orange-700 text-white",
  "in-progress": "bg-blue-700 text-white",
  waiting: "bg-yellow-700 text-black",
  done: "bg-green-700 text-white",
  cancelled: "bg-red-700 text-white",
  deferred: "bg-gray-700 text-white",
};

// 用於跟踪已分配的顏色
const assignedProjectColors: Record<string, string> = {};

// 分配唯一的顏色給每個項目
export function assignProjectColor(projectName: string): string {
  if (!projectName) return projectColors.neutral; // 預設顏色
  if (assignedProjectColors[projectName])
    return assignedProjectColors[projectName];

  const availableColors = Object.entries(projectColors).filter(
    ([key, color]) => !Object.values(assignedProjectColors).includes(color),
  );

  if (availableColors.length > 0) {
    const [colorKey, colorValue] = availableColors[0];
    assignedProjectColors[projectName] = colorValue;
    return colorValue;
  }

  return projectColors.neutral; // 如果顏色用完，返回預設顏色
}

// 預設的任務屬性
export const defaultTaskProperties: DefaultProperty[] = [
  { name: "priority", value: "low" },
  { name: "status", value: "todo" },
  { name: "level", value: "c-level" },
  { name: "project", value: "" },
  { name: "epic", value: "" },
  { name: "assignee", value: "" },
  { name: "deadline", value: "" },
  { name: "finishedAt", value: "" },
];

export interface DefaultProperty {
  name: string;
  value: string;
}
