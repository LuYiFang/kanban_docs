import React, {useState} from "react";
import {DragDropContext, Draggable, Droppable, DropResult} from "react-beautiful-dnd";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store";
import {moveTask, updateTask} from "../../store/slices/kanbanSlice";
import EditDialog from "../Dialog/EditDialog";

const KanbanBoard: React.FC = () => {
    const columns = useSelector((state: RootState) => state.kanban.columns);
    const dispatch = useDispatch();

    const handleDragEnd = (result: DropResult) => {
        const {source, destination} = result;

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

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<{ columnId: string; taskId: string; title: string; content: string } | null>(null);

    const handleEdit = (columnId: string, task: { id: string; title: string; content: string }) => {
        setSelectedTask({
            columnId,
            taskId: task.id,
            title: task.title,
            content: task.content,
        });
        setIsDialogOpen(true);
    };

    const handleSave = (updatedTitle: string, updatedContent: string) => {
        console.log('updatedTitle', updatedTitle, 'updatedContent', updatedContent);
        console.log('selectedTask', selectedTask);
        if (selectedTask) {
            dispatch(updateTask({
                columnId: selectedTask.columnId,
                taskId: selectedTask.taskId,
                updatedTitle: updatedTitle,
                updatedContent: updatedContent,
            }));
        }
        setIsDialogOpen(false);
    };


    return <>
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
                                                onClick={() => handleEdit(column.id, task)}
                                            >
                                                {task.title}
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
        {selectedTask && (
            <EditDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSave}
                initialTitle={selectedTask.title}
                initialContent={selectedTask.content}
            />
        )}
    </>
};

export default KanbanBoard;