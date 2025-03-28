import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Task {
  id: string;
  title: string;
  content: string;
  properties: {
    [key: string]: string;
  };
}

export interface Column {
  id: string;
  name: string;
  tasks: Task[];
}

export interface KanbanState {
  columns: Column[];
}

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
          properties: {
            Priority: "High",
            Status: "To Do",
            Deadline: "2025-04-01",
            Assignee: "Alice",
          },
        },
        {
          id: "task-2",
          title: "Install Dependencies",
          content: "Install all required project dependencies.",
          properties: {
            Priority: "Medium",
            Status: "To Do",
            Deadline: "2025-04-02",
          },
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
          properties: {
            Priority: "High",
            Status: "In Progress",
            Deadline: "2025-04-03",
            Assignee: "Bob",
          },
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
          properties: {
            Priority: "Low",
            Status: "Done",
            Deadline: "2025-04-01",
          },
        },
      ],
    },
  ],
};

const updateTaskProperties = (
  task: Task,
  property: string,
  value: string,
): void => {
  task.properties[property] = value;

  const dateNow = new Date().toISOString().split("T")[0];
  task.properties["Update Date"] = dateNow;

  if (property === "Status" && value === "Done") {
    task.properties["Finished Date"] = dateNow;
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
      action: PayloadAction<{ columnId: string; task: Task }>,
    ) => {
      const { columnId, task } = action.payload;
      const column = state.columns.find((col) => col.id === columnId);
      if (!column) return;

      const taskExists = column.tasks.some((_task) => _task.id === task.id);
      if (taskExists) return;

      const dateNow = new Date().toISOString().split("T")[0];
      const newTask: Task = {
        id: task.id,
        title: task.title,
        content: task.content,
        properties: {
          ...task.properties,
          "Create Date": dateNow,
          "Update Date": dateNow,
          Status: "To Do",
        },
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
