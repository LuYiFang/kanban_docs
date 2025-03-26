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
      if (column) {
        column.tasks.push(task);
      }
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
      const { columnId, taskId, updatedContent, updatedTitle } = action.payload;
      const column = state.columns.find((col) => col.id === columnId);
      if (column) {
        const task = column.tasks.find((task) => task.id === taskId);
        if (task) {
          task.title = updatedTitle;
          task.content = updatedContent;
        }
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
          task.properties[property] = value;
        }
      }
    },
  },
});

export const { addTask, moveTask, updateTask, updateProperty } =
  kanbanSlice.actions;
export default kanbanSlice.reducer;
