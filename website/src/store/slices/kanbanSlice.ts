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

const updateTaskProperties = (task: Task, property: string, value: string) => {
  task.properties[property] = value;
  task.properties["Update Date"] = new Date().toISOString().split("T")[0];
  if (property === "Status" && value === "Done") {
    task.properties["Finished Date"] = new Date().toISOString().split("T")[0];
  }
};

const addTaskToColumn = (
  column: Column | undefined,
  taskId: string,
  title: string,
  content: string,
  properties: { [key: string]: string } = {},
) => {
  if (!column) return;

  const taskExists = column.tasks.some((task) => task.id === taskId);
  if (taskExists) return;

  const dateNow = new Date().toLocaleString();
  const newTask: Task = {
    id: taskId,
    title,
    content,
    properties: {
      ...properties,
      "Create Date": dateNow,
      "Update Date": dateNow,
      Status: column.name,
    },
  };
  column.tasks.push(newTask);
};

const updateTaskAndMove = (
  columns: Column[],
  columnId: string,
  taskId: string,
  property: string,
  value: string,
) => {
  const column = columns.find((col) => col.id === columnId);
  if (!column) return;

  const taskIndex = column.tasks.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) return;

  const task = column.tasks[taskIndex];
  updateTaskProperties(task, property, value);

  if (property === "Status") {
    const destinationColumn = columns.find(
      (col) => col.name.toLowerCase() === value.toLowerCase(),
    );

    if (destinationColumn && column.id !== destinationColumn.id) {
      column.tasks.splice(taskIndex, 1);
      destinationColumn.tasks.push(task);
    }
  }
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
      addTaskToColumn(
        column,
        task.id,
        task.title,
        task.content,
        task.properties,
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
      const destinationColumn = state.columns.find(
        (col) => col.id === destinationColumnId,
      );

      if (sourceColumn && destinationColumn) {
        const [movedTask] = sourceColumn.tasks.splice(sourceIndex, 1);
        destinationColumn.tasks.splice(destinationIndex, 0, movedTask);

        const newStatus =
          destinationColumnId === "done" ? "Done" : destinationColumn.name;
        updateTaskProperties(movedTask, "Status", newStatus);
      }
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
      if (task) {
        task.title = updatedTitle;
        task.content = updatedContent;
        task.properties["Update Date"] = new Date().toLocaleString();
      }
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
      if (column) {
        const task = column.tasks.find((task) => task.id === taskId);
        if (task) {
          updateTaskProperties(task, property, value);
        }
      }
    },
  },
});

export const { addTask, moveTask, updateTask, updateProperty } =
  kanbanSlice.actions;
export default kanbanSlice.reducer;
