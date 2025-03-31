import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Column, KanbanState } from "../../types/kanban";
import { TaskCreate, TaskWithProperties } from "../../types/task";
import { propertyDefinitions, statusName } from "../../types/property";
import {
  createTaskWithDefaultProperties,
  removeTask,
  getAllTaskWithProperties,
  updateTask,
} from "./kanbanThuck";
import _ from "lodash";

const initialState: KanbanState = {
  columns: [
    {
      id: "todo",
      name: "To Do",
      tasks: [],
    },
    {
      id: "in-progress",
      name: "In Progress",
      tasks: [],
    },
    {
      id: "done",
      name: "Done",
      tasks: [],
    },
  ],
};

export const getDefaultProperties = (id: string, taskId: string) =>
  Object.entries(propertyDefinitions).map(([name, config]) => ({
    id: "",
    name,
    value: config.defaultValue || "",
    taskId: taskId,
  }));

const updateTaskProperties = (
  task: TaskWithProperties,
  propertyName: string,
  propertyValue: string,
): void => {
  const property = task.properties.find((prop) => prop.name === propertyName);

  if (!property) return;

  property.value = propertyValue;

  const dateNow = new Date().toISOString().split("T")[0];

  if (propertyName === "Status" && propertyValue === "done") {
    const finishedDateProperty = task.properties.find(
      (prop) => prop.name === "Finished Date",
    );

    if (finishedDateProperty) {
      finishedDateProperty.value = dateNow;
    }
  }
};

const moveTaskToColumn = (
  sourceColumn: Column | undefined,
  destinationColumn: Column | undefined,
  sourceIndex: number,
  destinationIndex: number,
): void => {
  if (!sourceColumn || !destinationColumn) return;

  const [movedTask] = sourceColumn.tasks.splice(sourceIndex, 1);
  destinationColumn.tasks.splice(destinationIndex, 0, movedTask);
};

const kanbanSlice = createSlice({
  name: "kanban",
  initialState,
  reducers: {
    updateProperty: (
      state,
      action: PayloadAction<{
        columnId: string;
        taskId: string;
        property: string;
        value: string;
      }>,
    ) => {
      const { columnId, taskId, property, value } = action.payload;

      const column = state.columns.find((col) => col.id === columnId);
      if (!column) return;

      const taskIndex = column.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex < 0) return;
      const task = column.tasks[taskIndex];

      updateTaskProperties(task, property, value);

      if (property.toLowerCase() !== "status") return;

      const destinationColumn = state.columns.find((col) => col.id === value);

      if (!destinationColumn) return;
      if (column.id === destinationColumn.id) return;

      moveTaskToColumn(
        column,
        destinationColumn,
        taskIndex,
        (destinationColumn as unknown as Column[]).length,
      );
    },
    moveTask: (
      state,
      action: PayloadAction<{
        sourceColumnId: string;
        destinationColumnId: string;
        sourceIndex: number;
        destinationIndex: number;
      }>,
    ) => {
      const {
        sourceColumnId,
        destinationColumnId,
        sourceIndex,
        destinationIndex,
      } = action.payload;

      const sourceColumn = state.columns.find(
        (col) => col.id === sourceColumnId,
      );
      if (!sourceColumn) return;

      const destinationColumn = state.columns.find(
        (col) => col.id === destinationColumnId,
      );
      if (!destinationColumn) return;

      moveTaskToColumn(
        sourceColumn,
        destinationColumn,
        sourceIndex,
        destinationIndex,
      );
      const task = sourceColumn.tasks.find((_, i) => i === sourceIndex);
      if (!task) return;

      updateTaskProperties(task, "Status", destinationColumn.name);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllTaskWithProperties.fulfilled, (state, action) => {
        const tasks = action.payload;

        const columnGroup = _.groupBy(
          tasks,
          (task) => task.properties.find((p) => p.name === "status").value,
        );

        const columns = _.map(columnGroup, (column, key) => {
          return {
            id: key,
            name: statusName[key],
            tasks: column,
          };
        });
        state.columns = columns;
      })
      .addCase(createTaskWithDefaultProperties.fulfilled, (state, action) => {
        const task = action.payload;
        const status = task.properties.find((p) => p.name === "status").value;
        const column = state.columns.find((col) => col.id === status);
        if (!column) return;

        column.tasks.push(task);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { columnId, task } = action.payload;
        const column = state.columns.find((col) => col.id === columnId);
        if (!column) return;
        const taskIndex = column.tasks.findIndex((t) => t.id === task.id);
        if (taskIndex < 0) return;

        task.properties = column.tasks[taskIndex].properties;

        column.tasks[taskIndex] = task;
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        const { columnId, taskId } = action.payload;
        const column = state.columns.find((col) => col.id === columnId);
        if (!column) return;

        column.tasks = column.tasks.filter((task) => task.id !== taskId);
      });
  },
});

export const { moveTask, updateProperty } = kanbanSlice.actions;
export default kanbanSlice.reducer;
