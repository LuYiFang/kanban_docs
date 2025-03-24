export type TaskType = {
    id: string;
    content: string;
};

export type ColumnType = {
    id: string;
    name: string;
    tasks: TaskType[];
};