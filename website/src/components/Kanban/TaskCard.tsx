import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { TaskType } from "../../types/kanban";

type Props = {
    task: TaskType;
    index: number;
};

const TaskCard: React.FC<Props> = ({ task, index }) => {
    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided) => (
                <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    className="bg-white p-2 rounded border shadow-sm mb-2"
                >
                    {task.content}
                </div>
            )}
        </Draggable>
    );
};

export default TaskCard;