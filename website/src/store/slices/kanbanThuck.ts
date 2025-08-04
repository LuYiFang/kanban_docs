import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  Task,
  TaskCreate,
  taskType,
  TaskUpdate,
  TaskWithProperties,
} from "../../types/task";
import { DefaultProperty } from "../../types/property";
import { repository } from "../../utils/fetchApi";
import { AxiosError } from "axios";
import { Layouts } from "react-grid-layout";
import _ from "lodash";

export function withErrorHandler<Returned, ThunkArg>(
  typePrefix: string,
  payloadCreator: (arg: ThunkArg, thunkAPI: any) => Promise<Returned>,
) {
  return createAsyncThunk<Returned, ThunkArg>(
    typePrefix,
    async (arg, thunkAPI) => {
      try {
        return await payloadCreator(arg, thunkAPI);
      } catch (error) {
        const axiosError = error as AxiosError;
        return thunkAPI.rejectWithValue({
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          message: axiosError.message,
        });
      }
    },
  );
}

// 1. 取得所有任務與屬性
export const getAllTaskWithProperties = withErrorHandler<
  Task[], // Return type
  { taskType: taskType; weeksAgo?: number }
>("kanban/getAllTaskWithProperties", async ({ taskType, weeksAgo }) => {
  return await repository.getAllTaskWithPropertiesApi(taskType, weeksAgo);
});

// 2. 建立任務與預設屬性
export const createTaskWithDefaultProperties = withErrorHandler<
  TaskWithProperties, // Return type
  { task: TaskCreate; properties: DefaultProperty[] }
>("kanban/createTaskWithDefaultProperties", async ({ task, properties }) => {
  return await repository.createTaskWithPropertiesApi(task, properties);
});

// 3. 更新單一任務
export const updateTask = withErrorHandler<
  { task: Task }, // Return type
  { taskId: string; task: TaskUpdate }
>("kanban/updateTask", async ({ taskId, task }) => {
  const updatedTask = await repository.updateTaskApi(taskId, task);
  return { task: updatedTask };
});

// 4. 批次更新任務
export const updateMultipleTasks = withErrorHandler<
  Task[], // Return type
  TaskUpdate[]
>("kanban/updateMultipleTasks", async (tasks) => {
  return await repository.batchUpdateTasksApi(tasks);
});

// 5. 刪除任務
export const deleteTask = withErrorHandler<
  { taskId: string },
  { taskId: string }
>("kanban/deleteTask", async ({ taskId }) => {
  await repository.deleteTaskWithPropertiesApi(taskId);
  return { taskId };
});

// 6. 更新任務屬性
export const updateProperty = withErrorHandler<
  { taskId: string; updatedProperty: any },
  { taskId: string; propertyId: string; property: string; value: any }
>("kanban/updateProperty", async ({ taskId, propertyId, property, value }) => {
  const updatedProperty = await repository.updatePropertyApi(
    propertyId,
    property,
    value,
  );
  return { taskId, updatedProperty };
});

// 7. 取得所有屬性與選項
export const getPropertiesAndOptions = withErrorHandler<
  any, // Return type
  void
>("kanban/getPropertiesAndOptions", async () => {
  return await repository.getPropertiesAndOptionsApi();
});

// 8. 建立屬性選項
export const createPropertyOption = withErrorHandler<
  any,
  { propertyId: string; name: string }
>("kanban/createPropertyOption", async ({ propertyId, name }) => {
  return await repository.createPropertyOptionApi(propertyId, name);
});

// 9. 上傳檔案
export const uploadFile = withErrorHandler<any, FormData>(
  "files/uploadFile",
  async (formData) => {
    return await repository.uploadFileApi(formData);
  },
);

// 10. 儲存版面配置
export const saveLayout = withErrorHandler<any, Layouts>(
  "kanban/saveLayout",
  async (layouts) => {
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
  },
);

// 11. 取得版面配置
export const getLayout = withErrorHandler<Layouts | null, void>(
  "kanban/getLayout",
  async () => {
    const layoutFileName = "docs-layout.json";
    const fileIds = await repository.getFileIdByNameApi(layoutFileName);
    if (!fileIds.length) return null;
    return await repository.downloadFileApi(fileIds[0]);
  },
);

// 12. 刪除檔案
export const deleteFile = withErrorHandler<{ fileId: string }, string>(
  "files/deleteFile",
  async (fileId) => {
    await repository.deleteFileApi(fileId);
    return { fileId };
  },
);

// 13. 取得摘要
export const getSummary = withErrorHandler<any, void>(
  "kanban/summary",
  async () => {
    return await repository.getSummeryWeeklyApi();
  },
);
