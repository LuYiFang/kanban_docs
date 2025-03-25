import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Task {
    id: string;
    title: string;
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
                { id: "task-1", title: "Setup Project", content: "Setup the project structure and tools." },
                { id: "task-2", title: "Install Dependencies", content: "Install all required project dependencies." },
            ],
        },
        {
            id: "in-progress",
            name: "In Progress",
            tasks: [
                { id: "task-3", title: "UI Design", content: "Design the user interface for the Kanban board." },
            ],
        },
        {
            id: "done",
            name: "Done",
            tasks: [
                { id: "task-4", title: "Research Tools", content: "Research and finalize Tailwind CSS tools." },
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
        updateTask: (
            state,
            action: PayloadAction<{ columnId: string; taskId: string; updatedTitle: string; updatedContent: string }>
        ) => {
            const { columnId, taskId, updatedContent, updatedTitle } = action.payload;
            const column = state.columns.find((col) => col.id === columnId);
            if (column) {
                const task = column.tasks.find((task) => task.id === taskId);
                if (task) {
                    task.title = updatedTitle;
                    task.content = updatedContent;
                }
            }
        }
    },
});

export const { addTask, moveTask, updateTask } = kanbanSlice.actions;
export default kanbanSlice.reducer;