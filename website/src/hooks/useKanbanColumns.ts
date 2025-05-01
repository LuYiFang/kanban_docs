import { useMemo, useState } from "react";
import { generateColumns } from "../utils/kanbanUtils";
import { Task, TaskWithProperties } from "../types/task";
import { PropertyConfig } from "../types/property";
import { Column } from "../types/kanban";

export const useKanbanColumns = (
  tasks: TaskWithProperties[],
  propertyConfig: PropertyConfig[],
  groupPropertyName: string,
  columnSort: string[],
  taskSortProperty: string,
) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<
    Record<string, boolean>
  >({
    done: true,
    cancelled: true,
    deferred: true,
  });

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

  const toggleColumnCollapse = (columnId: string) => {
    setCollapsedColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  return {
    columns,
    collapsedColumns,
    toggleColumnCollapse,
    isDialogOpen,
    selectedTask,
    setIsDialogOpen,
    setSelectedTask,
  };
};
