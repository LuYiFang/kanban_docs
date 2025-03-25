import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { moveTask } from "../../store/slices/kanbanSlice";

const KanbanBoard: React.FC = () => {
    const columns = useSelector((state: RootState) => state.kanban.columns);
    const dispatch = useDispatch();

    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        if (!destination) return;

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        dispatch(
            moveTask({
                sourceColumnId: source.droppableId,
                destinationColumnId: destination.droppableId,
                sourceIndex: source.index,
                destinationIndex: destination.index,
            })
        );
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-3 gap-4 p-4">
                {columns.map((column) => (
                    <Droppable droppableId={column.id} key={column.id}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="p-4 bg-gray-800 rounded shadow"
                            >
                                <h2 className="text-lg font-bold text-gray-300 mb-2">{column.name}</h2>
                                {column.tasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="p-2 mb-2 bg-gray-700 rounded shadow"
                                            >
                                                {task.content}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                ))}
            </div>
        </DragDropContext>
    );
};

export default KanbanBoard;