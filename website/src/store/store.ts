import { configureStore } from "@reduxjs/toolkit";
import kanbanReducer from "./slices/kanbanSlice";

export const store = configureStore({
    reducer: {
        kanban: kanbanReducer,
    },
});

// TypeScript 的型別支援
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;