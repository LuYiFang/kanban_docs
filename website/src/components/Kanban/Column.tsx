import React from "react";
import { Droppable } from "react-beautiful-dnd";
import TaskCard from "./TaskCard";
import { ColumnType } from "../../types/kanban";

type Props = {
    column: ColumnType;
};

const Column: React.FC<Props> = ({ column }) => {
    return (
        <Droppable droppableId={column.id}>
            {(provided) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-gray-100 p-4 rounded shadow-md"
                >
                    <h3 className="font-bold text-lg mb-2">{column.name}</h3>
                    {column.tasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} />
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
};

export default Column;