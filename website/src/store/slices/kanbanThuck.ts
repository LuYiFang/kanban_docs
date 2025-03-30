import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createTaskApi,
  createTPropertiesApi,
  deleteTaskApi,
  getAllTaskWithPropertiesApi,
} from "../../hooks/useApi";
import { TaskUpdate } from "../../types/task";
import { defaultProperties } from "../../types/property";

export const getAllTaskWithProperties = createAsyncThunk(
  "kanban/getAllTaskWithProperties",
  async (_, thunkAPI) => {
    try {
      return await getAllTaskWithPropertiesApi();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const createTaskWithDefaultProperties = createAsyncThunk(
  "kanban/createTaskWithDefaultProperties",
  async (task: TaskUpdate, thunkAPI) => {
    try {
      const createdTask = await createTaskApi(task);

      const properties = defaultProperties.map((v) => ({
        ...v,
        taskId: createdTask.id,
      }));
      await createTPropertiesApi(properties);

      createdTask.properties = properties;
      return createdTask;
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
