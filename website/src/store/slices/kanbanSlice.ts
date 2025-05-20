import { createSlice } from "@reduxjs/toolkit";
import {
  createPropertyOption,
  createTaskWithDefaultProperties,
  deleteTask,
  getAllTaskWithProperties,
  getLayout,
  getPropertiesAndOptions,
  updateMultipleTasks,
  updateProperty,
  updateTask,
} from "./kanbanThuck";
import { convertUtcToLocal } from "../../utils/tools";
import _ from "lodash";
import { TaskWithProperties } from "../../types/task";
import { kanbanDataName, KanbanState } from "../../types/kanban";

const initialState: KanbanState = {
  tasks: [],
  propertySetting: [],
  docs: [],
  docsLayout: null,
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
        const docsTasks: TaskWithProperties[] = [];

        _.each(tasks, (task) => {
          _.each(timeName, (tn) => {
            task[tn] = convertUtcToLocal(task[tn]);
          });

          _.each(task.properties, (prop) => {
            _.each(timeName, (tn) => {
              prop[tn] = convertUtcToLocal(prop[tn]);
            });
          });

          if (task.type === "docs") {
            docsTasks.push(task);
          } else {
            regularTasks.push(task);
          }
        });

        state.tasks = regularTasks;
        state.docs = docsTasks;
      })
      .addCase(createTaskWithDefaultProperties.fulfilled, (state, action) => {
        const task = action.payload;
        let taskType = task.type as kanbanDataName;
        if (taskType !== "docs") {
          taskType = "tasks";
        }
        state[taskType].push(task);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { task } = action.payload;
        let taskType = task.type as kanbanDataName;
        if (taskType !== "docs") {
          taskType = "tasks";
        }
        const taskIndex = state[taskType].findIndex((t) => t.id === task.id);
        if (taskIndex < 0) return;

        const timeName = ["createdAt", "updatedAt"];
        _.each(timeName, (tn) => {
          task[tn] = convertUtcToLocal(task[tn]);
        });

        state[taskType][taskIndex] = {
          ...task,
          properties: state[taskType][taskIndex].properties,
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
        const options = action.payload;
        const property = state.propertySetting.find(
          (prop) => prop.id === options.propertyId,
        );
        if (property) {
          property.options = [...(property.options || []), options];
        }
      })
      .addCase(getLayout.fulfilled, (state, action) => {
        state.docsLayout = action.payload;
      });
  },
});

export default kanbanSlice.reducer;
