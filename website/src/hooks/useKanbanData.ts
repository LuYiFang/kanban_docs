import { useState } from "react";
import { ColumnType, TaskType } from "../types/kanban";
import { DropResult } from "react-beautiful-dnd";

const initialData: ColumnType[] = [
    // 示例數據
];

export const useKanbanData = () => {
    const [columns, setColumns] = useState<ColumnType[]>(initialData);

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceCol = columns.find(col => col.id === source.droppableId)!;
        const destCol = columns.find(col => col.id === destination.droppableId)!;

        const sourceTasks = Array.from(sourceCol.tasks);
        const [removed] = sourceTasks.splice(source.index, 1);

        if (source.droppableId === destination.droppableId) {
            sourceTasks.splice(destination.index, 0, removed);
            setColumns(columns.map(col => col.id === sourceCol.id ? {...sourceCol, tasks: sourceTasks} : col));
        } else {
            const destTasks = Array.from(destCol.tasks);
            destTasks.splice(destination.index, 0, removed);

            setColumns(columns.map(col => {
                if (col.id === sourceCol.id) return {...sourceCol, tasks: sourceTasks};
                if (col.id === destCol.id) return {...destCol, tasks: destTasks};
                return col;
            }));
        }
    };

    return { columns, setColumns, onDragEnd };
};