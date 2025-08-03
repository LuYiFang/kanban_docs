import { configureStore } from "@reduxjs/toolkit";
import kanbanReducer from "./slices/kanbanSlice";
import authReducer from "./slices/authSlice";
import { injectStore } from "../utils/apiClient";

export const store = configureStore({
  reducer: {
    kanban: kanbanReducer,
    auth: authReducer,
  },
});

injectStore(store);

// TypeScript 的型別支援
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
