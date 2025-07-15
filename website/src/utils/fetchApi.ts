import { taskType, TaskUpdate } from "../types/task";
import apiClient from "./apiClient";
import { DefaultProperty } from "../types/property";
import { AxiosError } from "axios";

export const getAllTaskWithPropertiesApi = async (
  taskType: taskType,
  weeksAgo?: number,
) => {
  const params = new URLSearchParams({
    task_type: taskType,
    weeks_ago: `${weeksAgo}`,
  }).toString();
  const response = await apiClient.get(`/task/properties?${params}`);
  return response.data;
};

export const createTaskWithPropertiesApi = async (
  task: TaskUpdate,
  properties: DefaultProperty[],
) => {
  const response = await apiClient.post("/task/properties", {
    task,
    properties,
  });
  return response.data;
};

export const updateTaskApi = async (taskId: string, taskData: TaskUpdate) => {
  const response = await apiClient.put(`/task/${taskId}`, taskData);
  return response.data;
};

export const deleteTaskWithPropertiesApi = async (taskId: string) => {
  const response = await apiClient.delete(`/task/${taskId}/properties`);
  return response.data;
};

export const updatePropertyApi = async (
  propertyId: string,
  property: string,
  value: string,
) => {
  const response = await apiClient.put(`/property/${propertyId}`, {
    name: property,
    value,
  });
  return response.data;
};

export const deletePropertiesApi = async (taskId: string) => {
  const response = await apiClient.delete(`/property/task/${taskId}`);
  return response.data;
};

export const createPropertyOptionApi = async (
  propertyId: string,
  name: string,
) => {
  const response = await apiClient.post(`/property/properties/option`, {
    propertyId,
    name,
  });
  return response.data;
};

export const getPropertiesAndOptionsApi = async () => {
  const response = await apiClient.get("/property/properties/options");
  return response.data;
};

export const batchUpdateTasksApi = async (tasks: TaskUpdate[]) => {
  const response = await apiClient.post("/task/batch", tasks);
  return response.data;
};

export const uploadFileApi = async (formData: FormData) => {
  const response = await apiClient.post("/files/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const downloadFileApi = async (fileId: string) => {
  const response = await apiClient.get(`/files/${fileId}`);
  return response.data;
};

export const getFileIdByNameApi = async (filename: string) => {
  try {
    const response = await apiClient.get(`/files/filename/${filename}/ids`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError?.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const deleteFileApi = async (fileId: string) => {
  try {
    const response = await apiClient.delete(`/files/${fileId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError?.response?.status === 404) {
      console.warn(`File with ID ${fileId} not found.`);
      return null;
    }
    throw error;
  }
};

export const getSummeryWeeklyApi = async () => {
  const response = await apiClient.get(`/summary/weekly`, { timeout: 600000 });
  return response.data;
};

export const loginApi = async (username: string, password: string) => {
  const response = await apiClient.post(`/auth/login`, { username, password });
  return response.data;
};

export const logoutApi = async () => {
  const response = await apiClient.post(`/auth/logout`);
  return response.data;
};

export const meApi = async () => {
  const response = await apiClient.get(`/auth/me`);
  return response.data;
};

export const repository = {
  getAllTaskWithPropertiesApi,
  createTaskWithPropertiesApi,
  updateTaskApi,
  deleteTaskWithPropertiesApi,
  updatePropertyApi,
  deletePropertiesApi,
  createPropertyOptionApi,
  getPropertiesAndOptionsApi,
  batchUpdateTasksApi,
  uploadFileApi,
  downloadFileApi,
  getFileIdByNameApi,
  deleteFileApi,
  getSummeryWeeklyApi,
  loginApi,
  logoutApi,
  meApi,
};
