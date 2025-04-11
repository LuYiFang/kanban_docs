import { createSlice } from "@reduxjs/toolkit";
import { Tasks } from "../../types/task";
import {
  createTaskWithDefaultProperties,
  deleteTask,
  getAllTaskWithProperties,
  getPropertiesAndOptions,
  updateProperty,
  updateTask,
} from "./kanbanThuck";
import { convertUtcToLocal } from "../../utils/tools";
import _ from "lodash";

const initialState: Tasks = {
  tasks: [],
  propertySetting: [],
};

const kanbanSlice = createSlice({
  name: "kanban",
  initialState,
  reducers: {
    updateTaskOrder(state, action) {
      const updatedTasks = action.payload;
      state.tasks = updatedTasks;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllTaskWithProperties.fulfilled, (state, action) => {
        const tasks = action.payload;
        const timeName = ["createdAt", "updatedAt"];
        _.each(tasks, (task) => {
          _.each(timeName, (tn) => {
            task[tn] = convertUtcToLocal(task[tn]);
          });

          _.each(task.properties, (prop) => {
            _.each(timeName, (tn) => {
              prop[tn] = convertUtcToLocal(prop[tn]);
            });
          });
        });
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
        const timeName = ["createdAt", "updatedAt"];
        _.each(timeName, (tn) => {
          task[tn] = convertUtcToLocal(task[tn]);
        });

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
      })
      .addCase(getPropertiesAndOptions.fulfilled, (state, action) => {
        state.propertySetting = action.payload;
      });
  },
});

export const { updateTaskOrder } = kanbanSlice.actions;
export default kanbanSlice.reducer;
