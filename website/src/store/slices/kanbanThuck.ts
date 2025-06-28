import { createAsyncThunk } from "@reduxjs/toolkit";
import { Task, TaskCreate, taskType, TaskUpdate } from "../../types/task";
import { DefaultProperty } from "../../types/property";
import { repository } from "../../utils/fetchApi"; // 修改为从 repository 导入
import { AxiosError } from "axios";
import { Layouts } from "react-grid-layout";
import _ from "lodash";

export const getAllTaskWithProperties = createAsyncThunk(
  "kanban/getAllTaskWithProperties",
  async ({ taskType }: { taskType: taskType }, thunkAPI) => {
    try {
      return await repository.getAllTaskWithPropertiesApi(taskType);
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(axiosError?.response?.data);
    }
  },
);

export const createTaskWithDefaultProperties = createAsyncThunk(
  "kanban/createTaskWithDefaultProperties",
  async (
    { task, properties }: { task: TaskCreate; properties: DefaultProperty[] },
    thunkAPI,
  ) => {
    try {
      return await repository.createTaskWithPropertiesApi(task, properties);
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
      const updatedTask = await repository.updateTaskApi(taskId, task);
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
    return await repository.batchUpdateTasksApi(tasks);
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
      await repository.deleteTaskWithPropertiesApi(taskId);
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
      const updatedProperty = await repository.updatePropertyApi(
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
      return await repository.getPropertiesAndOptionsApi();
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
      return await repository.createPropertyOptionApi(propertyId, name);
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
      return await repository.uploadFileApi(formData);
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
      return await repository.downloadFileApi(fileId);
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(axiosError?.response?.data);
    }
  },
);

export const saveLayout = createAsyncThunk(
  "kanban/saveLayout",
  async (layouts: Layouts, thunkAPI) => {
    try {
      if (
        !layouts ||
        _.every(
          _.values(layouts),
          (layout) => _.isArray(layout) && layout.length === 0,
        )
      )
        return;

      const layoutFileName = "docs-layout.json";

      const fileIds = await repository.getFileIdByNameApi(layoutFileName);
      if (fileIds.length) {
        await repository.deleteFileApi(fileIds[0]);
      }

      const layoutJson = JSON.stringify(layouts);

      const formData = new FormData();
      formData.append(
        "file",
        new Blob([layoutJson], { type: "application/json" }),
        layoutFileName,
      );

      return await repository.uploadFileApi(formData);
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(axiosError?.response?.data);
    }
  },
);

export const getLayout = createAsyncThunk(
  "kanban/getLayout",
  async (_, thunkAPI) => {
    try {
      const layoutFileName = "docs-layout.json";

      const fileIds = await repository.getFileIdByNameApi(layoutFileName);
      if (!fileIds.length) {
        return null;
      }

      return await repository.downloadFileApi(fileIds[0]);
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(axiosError?.response?.data);
    }
  },
);

export const deleteFile = createAsyncThunk(
  "files/deleteFile",
  async (fileId: string, thunkAPI) => {
    try {
      await repository.deleteFileApi(fileId);
      return { fileId };
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(axiosError?.response?.data);
    }
  },
);

export const getSummary = createAsyncThunk(
  "kanban/summary",
  async (_, thunkAPI) => {
    try {
      console.log("getSummary");
      const result = await repository.getSummeryWeeklyApi();
      console.log("getSummary result", result);
      return result;
    } catch (error) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(axiosError?.response?.data);
    }
  },
);
