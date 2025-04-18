import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createTaskApi,
  createTPropertiesApi,
  deleteTaskWithPropertiesApi,
  getAllTaskWithPropertiesApi,
  getPropertiesAndOptionsApi,
  updatePropertyApi,
  updateTaskApi,
} from "../../utils/fetchApi";
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
      const createdProperties = await createTPropertiesApi(properties);

      createdTask.properties = createdProperties;
      return createdTask;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const updateTask = createAsyncThunk(
  "kanban/updateTask",
  async (
    {
      taskId,
      task,
    }: {
      columnId: string;
      taskId: string;
      task: TaskUpdate;
    },
    thunkAPI,
  ) => {
    try {
      const updatedTask = await updateTaskApi(taskId, task);
      return {
        task: updatedTask,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const deleteTask = createAsyncThunk(
  "kanban/deleteTask",
  async (
    {
      taskId,
    }: {
      taskId: string;
    },
    thunkAPI,
  ) => {
    try {
      await deleteTaskWithPropertiesApi(taskId);
      return { taskId };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const updateProperty = createAsyncThunk(
  "kanban/updateProperty",
  async (
    {
      taskId,
      propertyId,
      property,
      value,
    }: {
      taskId: string;
      propertyId: string;
      property: string;
      value: string;
    },
    thunkAPI,
  ) => {
    try {
      const updatedProperty = await updatePropertyApi(
        propertyId,
        property,
        value,
      );
      return { taskId, updatedProperty };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const getPropertiesAndOptions = createAsyncThunk(
  "kanban/getPropertiesAndOptions",
  async (_, thunkAPI) => {
    try {
      const propertiesWithOptions = await getPropertiesAndOptionsApi();
      return propertiesWithOptions;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);
