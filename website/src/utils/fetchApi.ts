import { TaskUpdate } from "../types/task";
import apiClient from "./apiClient";
import { PropertyCreate } from "../types/property";
import { useState } from "react";

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
  const response = await apiClient.post(`/property/${propertyId}/options`, {
    name,
  });
  return response.data;
};

export const getPropertiesAndOptionsApi = async () => {
  const response = await apiClient.get("/property/properties/options");
  return response.data;
};
