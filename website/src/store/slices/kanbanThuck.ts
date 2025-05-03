import { createAsyncThunk } from "@reduxjs/toolkit";
import { Task, TaskCreate, taskType, TaskUpdate } from "../../types/task";
import { PropertyCreate } from "../../types/property";
import {
  batchUpdateTasksApi,
  createPropertyOptionApi,
  createTaskWithPropertiesApi,
  deleteTaskWithPropertiesApi,
  downloadFileApi,
  getAllTaskWithPropertiesApi,
  getPropertiesAndOptionsApi,
  updatePropertyApi,
  updateTaskApi,
  uploadFileApi,
} from "../../utils/fetchApi";
import { AxiosError } from "axios";

export const getAllTaskWithProperties = createAsyncThunk(
  "kanban/getAllTaskWithProperties",
  async ({ taskType }: { taskType: taskType }, thunkAPI) => {
    try {
      return await getAllTaskWithPropertiesApi(taskType);
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(axiosError?.response?.data);
    }
  },
);

export const createTaskWithDefaultProperties = createAsyncThunk(
  "kanban/createTaskWithDefaultProperties",
  async (
    { task, properties }: { task: TaskCreate; properties: PropertyCreate[] },
    thunkAPI,
  ) => {
    try {
      return await createTaskWithPropertiesApi(task, properties);
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(axiosError?.response?.data);
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
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(axiosError?.response?.data);
    }
  },
);

export const updateMultipleTasks = createAsyncThunk<
  Task[], // 成功时返回的類型
  TaskUpdate[], // 参数類型
  { rejectValue: any } // rejectWithValue 的類型
>("kanban/updateMultipleTasks", async (tasks: TaskUpdate[], thunkAPI) => {
  try {
    return await batchUpdateTasksApi(tasks);
  } catch (error) {
    const axiosError = error as AxiosError;
    return thunkAPI.rejectWithValue(axiosError?.response?.data);
  }
});

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
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(axiosError?.response?.data);
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
      value: any;
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
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(axiosError?.response?.data);
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
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(axiosError?.response?.data);
    }
  },
);

export const createPropertyOption = createAsyncThunk(
  "kanban/createPropertyOption",
  async (
    { propertyId, name }: { propertyId: string; name: string },
    thunkAPI,
  ) => {
    try {
      return await createPropertyOptionApi(propertyId, name);
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(axiosError?.response?.data);
    }
  },
);

export const uploadFile = createAsyncThunk(
  "files/uploadFile",
  async (formData: FormData, thunkAPI) => {
    try {
      const response = await uploadFileApi(formData);
      return response;
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(axiosError?.response?.data);
    }
  },
);

export const downloadFile = createAsyncThunk(
  "files/downloadFile",
  async (fileId: string, thunkAPI) => {
    try {
      const response = await downloadFileApi(fileId);
      return response;
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(axiosError?.response?.data);
    }
  },
);
