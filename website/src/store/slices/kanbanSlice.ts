import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Column, KanbanState } from "../../types/kanban";
import { TaskCreate, TaskWithProperties } from "../../types/task";
import { propertyDefinitions } from "../../types/property";

const initialState: KanbanState = {
  columns: [
    {
      id: "todo",
      name: "To Do",
      tasks: [
        {
          id: "task-1",
          title: "Setup Project",
          content: "Setup the project structure and tools.",
          properties: [
            { id: "prop-1", name: "Priority", value: "high", taskId: "task-1" },
            { id: "prop-2", name: "Status", value: "todo", taskId: "task-1" },
            {
              id: "prop-3",
              name: "Deadline",
              value: "2025-04-01",
              taskId: "task-1",
            },
            {
              id: "prop-4",
              name: "Assignee",
              value: "Alice",
              taskId: "task-1",
            },
          ],
        },
        {
          id: "task-2",
          title: "Install Dependencies",
          content: "Install all required project dependencies.",
          properties: [
            {
              id: "prop-5",
              name: "Priority",
              value: "medium",
              taskId: "task-2",
            },
            { id: "prop-6", name: "Status", value: "todo", taskId: "task-2" },
            {
              id: "prop-7",
              name: "Deadline",
              value: "2025-04-02",
              taskId: "task-2",
            },
          ],
        },
      ],
    },
    {
      id: "in-progress",
      name: "In Progress",
      tasks: [
        {
          id: "task-3",
          title: "UI Design",
          content: "Design the user interface for the Kanban board.",
          properties: [
            { id: "prop-8", name: "Priority", value: "high", taskId: "task-3" },
            {
              id: "prop-9",
              name: "Status",
              value: "todo",
              taskId: "task-3",
            },
            {
              id: "prop-10",
              name: "Deadline",
              value: "2025-04-03",
              taskId: "task-3",
            },
            { id: "prop-11", name: "Assignee", value: "Bob", taskId: "task-3" },
          ],
        },
      ],
    },
    {
      id: "done",
      name: "Done",
      tasks: [
        {
          id: "task-4",
          title: "Research Tools",
          content: "Research and finalize Tailwind CSS tools.",
          properties: [
            { id: "prop-12", name: "Priority", value: "low", taskId: "task-4" },
            { id: "prop-13", name: "Status", value: "done", taskId: "task-4" },
            {
              id: "prop-14",
              name: "Deadline",
              value: "2025-04-01",
              taskId: "task-4",
            },
          ],
        },
      ],
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
    addTask: (
      state,
      action: PayloadAction<{ columnId: string; task: TaskCreate }>,
    ) => {
      const { columnId, task } = action.payload;

      const column = state.columns.find((col) => col.id === columnId);
      if (!column) return;

      const taskExists = column.tasks.some((_task) => _task.id === task.id);
      if (taskExists) return;

      const mergedProperties = [
        ...getDefaultProperties("", task.id),
        ...Object.entries(task.properties),
      ];

      const newTask: TaskWithProperties = {
        id: task.id,
        title: task.title,
        content: task.content,
        properties: mergedProperties,
      };

      column.tasks.push(newTask);
    },
    updateTask: (
      state,
      action: PayloadAction<{
        columnId: string;
        taskId: string;
        updatedTitle: string;
        updatedContent: string;
      }>,
    ) => {
      const { columnId, taskId, updatedTitle, updatedContent } = action.payload;
      const column = state.columns.find((col) => col.id === columnId);
      if (!column) return;

      const task = column.tasks.find((task) => task.id === taskId);
      if (!task) return;

      task.title = updatedTitle;
      task.content = updatedContent;
      updateTaskProperties(task, "Create Date", updatedTitle);
    },
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
    removeTask: (
      state,
      action: PayloadAction<{ columnId: string; taskId: string }>,
    ) => {
      const { columnId, taskId } = action.payload;
      const column = state.columns.find((col) => col.id === columnId);
      if (!column) return;

      column.tasks = column.tasks.filter((task) => task.id !== taskId);
    },
  },
});

export const { addTask, moveTask, updateTask, updateProperty, removeTask } =
  kanbanSlice.actions;
export default kanbanSlice.reducer;
