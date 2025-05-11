import { useMemo, useState } from "react";
import { generateColumns } from "../../utils/kanbanUtils";
import { Task, TaskWithProperties } from "../../types/task";
import { PropertyConfig } from "../../types/property";
import { Column } from "../../types/kanban";

interface ColumnCollapse {
  [key: string]: boolean;
}

const defaultColumnCollapse: ColumnCollapse = {
  Done: true,
  Cancelled: true,
  Deferred: true,
};

export const defaultColumnCollapseProxy = new Proxy(defaultColumnCollapse, {
  get(target, prop) {
    if (typeof prop === "string") {
      return prop in target ? target[prop] : false;
    }
    return false;
  },
});

export const useKanbanColumns = (
  tasks: TaskWithProperties[],
  propertyConfig: PropertyConfig[],
  groupPropertyName: string,
  columnSort: string[],
  taskSortProperty: string,
) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const columns: Column[] = useMemo(
    () =>
      generateColumns(
        tasks,
        propertyConfig,
        groupPropertyName,
        columnSort,
        taskSortProperty,
      ),
    [tasks, propertyConfig, columnSort, groupPropertyName, taskSortProperty],
  );

  return {
    columns,
    isDialogOpen,
    selectedTask,
    setIsDialogOpen,
    setSelectedTask,
  };
};
