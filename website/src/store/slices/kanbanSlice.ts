import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Task {
    id: string;
    content: string;
}

export interface Column {
    id: string;
    name: string;
    tasks: Task[];
}

export interface KanbanState {
    columns: Column[];
}

const initialState: KanbanState = {
    columns: [
        {
            id: "todo",
            name: "To Do",
            tasks: [
                { id: "task-1", content: "Setup project structure" },
                { id: "task-2", content: "Install dependencies" },
            ],
        },
        {
            id: "in-progress",
            name: "In Progress",
            tasks: [
                { id: "task-3", content: "Design UI for Kanban Board" },
            ],
        },
        {
            id: "done",
            name: "Done",
            tasks: [
                { id: "task-4", content: "Research Tailwind CSS" },
            ],
        },
    ],
};

const kanbanSlice = createSlice({
    name: "kanban",
    initialState,
    reducers: {
        addTask: (state, action: PayloadAction<{ columnId: string; task: Task }>) => {
            const { columnId, task } = action.payload;
            const column = state.columns.find(col => col.id === columnId);
            if (column) {
                column.tasks.push(task);
            }
        },
        moveTask: (
            state,
            action: PayloadAction<{
                sourceColumnId: string;
                destinationColumnId: string;
                sourceIndex: number;
                destinationIndex: number;
            }>
        ) => {
            const { sourceColumnId, destinationColumnId, sourceIndex, destinationIndex } =
                action.payload;

            const sourceColumn = state.columns.find(col => col.id === sourceColumnId);
            const destinationColumn = state.columns.find(
                col => col.id === destinationColumnId
            );

            if (sourceColumn && destinationColumn) {
                const [movedTask] = sourceColumn.tasks.splice(sourceIndex, 1);
                destinationColumn.tasks.splice(destinationIndex, 0, movedTask);
            }
        },
    },
});

export const { addTask, moveTask } = kanbanSlice.actions;
export default kanbanSlice.reducer;