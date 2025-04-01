import { createSlice } from "@reduxjs/toolkit";
import { Tasks } from "../../types/task";
import {
  createTaskWithDefaultProperties,
  deleteTask,
  getAllTaskWithProperties,
  updateProperty,
  updateTask,
} from "./kanbanThuck";

const initialState: Tasks = {
  tasks: [
    {
      id: "1",
      title: "",
      content: "",
      properties: [
        {
          id: "1",
          name: "status",
          value: "todo",
          taskId: "1",
        },
      ],
    },
    {
      id: "2",
      title: "",
      content: "",
      properties: [
        {
          id: "2",
          name: "status",
          value: "in-progress",
          taskId: "2",
        },
      ],
    },
    {
      id: "3",
      title: "",
      content: "",
      properties: [
        {
          id: "3",
          name: "status",
          value: "done",
          taskId: "3",
        },
      ],
    },
  ],
};

const kanbanSlice = createSlice({
  name: "kanban",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllTaskWithProperties.fulfilled, (state, action) => {
        const tasks = action.payload;
        state.tasks = tasks;
      })
      .addCase(createTaskWithDefaultProperties.fulfilled, (state, action) => {
        const task = action.payload;
        state.tasks.push(task);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { task } = action.payload;
        const taskIndex = state.tasks.findIndex((t) => t.id === task.id);
        if (taskIndex < 0) return;

        state.tasks[taskIndex] = {
          ...task,
          properties: state.tasks[taskIndex].properties,
        };
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const { taskId } = action.payload;

        state.tasks = state.tasks.filter((task) => task.id !== taskId);
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        const { taskId, updatedProperty } = action.payload;

        const task = state.tasks.find((task) => task.id === taskId);
        if (!task) return;

        const propertyIndex = task.properties.findIndex(
          (prop) => prop.id === updatedProperty.id,
        );
        if (propertyIndex < 0) return;

        task.properties[propertyIndex] = updatedProperty;
      });
  },
});

export default kanbanSlice.reducer;
