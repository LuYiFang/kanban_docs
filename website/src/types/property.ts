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
  primary: "bg-indigo-800 text-white", // 深藍紫
  secondary: "bg-teal-800 text-white", // 深藍綠
  success: "bg-emerald-800 text-white", // 深綠
  warning: "bg-amber-800 text-black", // 深琥珀黃
  danger: "bg-rose-800 text-white", // 深玫瑰紅
  info: "bg-sky-800 text-white", // 深天藍
  neutral: "bg-slate-800 text-white", // 深灰藍
};

// 狀態對應的顏色
export const statusColors = {
  epic: "bg-violet-300 text-black", // 淺紫色
  todo: "bg-amber-300 text-black", // 淺橙黃色
  "in-progress": "bg-sky-300 text-black", // 淺天藍色
  waiting: "bg-lime-300 text-black", // 淺綠黃色
  done: "bg-emerald-300 text-black", // 淺綠色
  cancelled: "bg-gray-400 text-black", // 淺灰色（不突出）
  deferred: "bg-zinc-300 text-black", // 淺灰色（不同於 cancelled）
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
