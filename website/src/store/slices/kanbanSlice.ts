import { createSlice } from "@reduxjs/toolkit";
import {
  createPropertyOption,
  createTaskWithDefaultProperties,
  deleteTask,
  getAllTaskWithProperties,
  getPropertiesAndOptions,
  updateMultipleTasks,
  updateProperty,
  updateTask,
  uploadFile,
  downloadFile,
} from "./kanbanThuck";
import { convertUtcToLocal } from "../../utils/tools";
import _ from "lodash";
import { TaskWithProperties } from "../../types/task";
import { KanbanState } from "../../types/kanban";

const initialState: KanbanState = {
  tasks: [],
  propertySetting: [],
};

const kanbanSlice = createSlice({
  name: "kanban",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllTaskWithProperties.fulfilled, (state, action) => {
        const tasks = action.payload;
        const timeName = ["createdAt", "updatedAt"];
        const regularTasks: TaskWithProperties[] = [];

        _.each(tasks, (task) => {
          _.each(timeName, (tn) => {
            task[tn] = convertUtcToLocal(task[tn]);
          });

          _.each(task.properties, (prop) => {
            _.each(timeName, (tn) => {
              prop[tn] = convertUtcToLocal(prop[tn]);
            });
          });

          regularTasks.push(task);
        });

        state.tasks = regularTasks;
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
      })
      .addCase(updateMultipleTasks.fulfilled, (state, action) => {
        const updatedTasks = action.payload;
        updatedTasks.forEach((updatedTask) => {
          const index = state.tasks.findIndex(
            (task) => task.id === updatedTask.id,
          );
          if (index !== -1) {
            state.tasks[index] = { ...state.tasks[index], ...updatedTask };
          }
        });
      })
      .addCase(createPropertyOption.fulfilled, (state, action) => {
        const { propertyId, name } = action.payload;
        const property = state.propertySetting.find(
          (prop) => prop.id === propertyId,
        );
        if (property) {
          property.options = [
            ...(property.options || []),
            { name, propertyId },
          ];
        }
      });
  },
});

export default kanbanSlice.reducer;
