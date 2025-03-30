import { TaskUpdate } from "../types/task";
import apiClient from "../utils/apiClient";
import { PropertyCreate } from "../types/property";

export const getAllTaskWithPropertiesApi = async () => {
  const response = await apiClient.get("/task/properties");
  return response.data;
};

export const createTaskApi = async (taskData: TaskUpdate) => {
  const response = await apiClient.post("/task", taskData);
  return response.data;
};

export const createTPropertiesApi = async (
  propertiesData: PropertyCreate[],
) => {
  const response = await apiClient.post("/property/batch", propertiesData);
  return response.data;
};

export const deleteTaskApi = async (taskId: string) => {
  const response = await apiClient.delete(`/task/${taskId}`);
  return response.data;
};
