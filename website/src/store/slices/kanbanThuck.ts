import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createTaskApi,
  createTPropertiesApi,
  deleteTaskApi,
} from "../../hooks/useApi";
import { TaskUpdate } from "../../types/task";
import { defaultProperties } from "../../types/property";

export const createTaskWithDefaultProperties = createAsyncThunk(
  "kanban/createTask",
  async (task: TaskUpdate, thunkAPI) => {
    try {
      const createdTask = await createTaskApi(task);

      const properties = defaultProperties.map((v) => ({
        ...v,
        taskId: createdTask.id,
      }));
      await createTPropertiesApi(properties);

      createdTask.properties = properties;
      return { task: createdTask };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const deleteTask = createAsyncThunk(
  "kanban/deleteTask",
  async ({ columnId, taskId }, thunkAPI) => {
    try {
      await deleteTaskApi(taskId);
      return { columnId, taskId };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);
