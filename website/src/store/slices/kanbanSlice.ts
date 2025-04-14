import { createSlice } from "@reduxjs/toolkit";
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
import { TaskWithProperties } from "../../types/task";
import { PropertyConfig } from "../../types/property";

interface Tasks {
  tasks: TaskWithProperties[];
  propertySetting: PropertyConfig[];
  dailyTasks: TaskWithProperties[];
}

const initialState: Tasks = {
  tasks: [],
  propertySetting: [],
  dailyTasks: [],
};

const kanbanSlice = createSlice({
  name: "kanban",
  initialState,
  reducers: {
    updateTaskOrder(state, action) {
      const updatedTasks = action.payload;
      state.tasks = updatedTasks;
    },
    updateDailyTaskOrder(state, action) {
      const updatedTasks = action.payload;
      state.dailyTasks = updatedTasks;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllTaskWithProperties.fulfilled, (state, action) => {
        const tasks = action.payload;
        const timeName = ["createdAt", "updatedAt"];
        const regularTasks: TaskWithProperties[] = [];
        const dailyTasks: TaskWithProperties[] = [];

        _.each(tasks, (task) => {
          _.each(timeName, (tn) => {
            task[tn] = convertUtcToLocal(task[tn]);
          });

          _.each(task.properties, (prop) => {
            _.each(timeName, (tn) => {
              prop[tn] = convertUtcToLocal(prop[tn]);
            });
          });

          if (task.type === "daily") {
            dailyTasks.push(task);
          } else {
            regularTasks.push(task);
          }
        });

        state.tasks = regularTasks;
        state.dailyTasks = dailyTasks;
      })
      .addCase(createTaskWithDefaultProperties.fulfilled, (state, action) => {
        const task = action.payload;
        if (task.type === "daily") {
          state.dailyTasks.push(task);
        } else {
          state.tasks.push(task);
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { task } = action.payload;
        const taskList = task.type === "daily" ? state.dailyTasks : state.tasks;
        const taskIndex = taskList.findIndex((t) => t.id === task.id);
        if (taskIndex < 0) return;

        const timeName = ["createdAt", "updatedAt"];
        _.each(timeName, (tn) => {
          task[tn] = convertUtcToLocal(task[tn]);
        });

        taskList[taskIndex] = {
          ...task,
          properties: taskList[taskIndex].properties,
        };
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const { taskId, type } = action.payload;
        if (type === "daily") {
          state.dailyTasks = state.dailyTasks.filter(
            (task) => task.id !== taskId,
          );
        } else {
          state.tasks = state.tasks.filter((task) => task.id !== taskId);
        }
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        const { taskId, updatedProperty, type } = action.payload;
        const taskList = type === "daily" ? state.dailyTasks : state.tasks;

        const task = taskList.find((task) => task.id === taskId);
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
