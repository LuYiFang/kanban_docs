import React, { useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { moveTask, updateTask } from "../../store/slices/kanbanSlice";
import EditDialog from "../Dialog/EditDialog";

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
      }),
    );
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{
    columnId: string;
    taskId: string;
    title: string;
    content: string;
    properties: { [key: string]: string };
  } | null>(null);

  const handleEdit = (
    columnId: string,
    task: {
      id: string;
      title: string;
      content: string;
      properties: { [key: string]: string };
    },
  ) => {
    setSelectedTask({
      columnId,
      taskId: task.id,
      title: task.title,
      content: task.content,
      properties: task.properties,
    });
    setIsDialogOpen(true);
  };

  const handleSave = (updatedTitle: string, updatedContent: string) => {
    console.log("updatedTitle", updatedTitle, "updatedContent", updatedContent);
    console.log("selectedTask", selectedTask);
    if (selectedTask) {
      dispatch(
        updateTask({
          columnId: selectedTask.columnId,
          taskId: selectedTask.taskId,
          updatedTitle: updatedTitle,
          updatedContent: updatedContent,
        }),
      );
    }
    setIsDialogOpen(false);
  };

  return (
    <>
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
                  <h2 className="text-lg font-bold text-gray-300 mb-2">
                    {column.name}
                  </h2>
                  {column.tasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-4 mb-2 bg-gray-700 rounded shadow"
                          onClick={() => handleEdit(column.id, task)}
                        >
                          {/* 任務標題 */}
                          <div className="font-bold text-gray-100">
                            {task.title}
                          </div>

                          {/* Priority Chip */}
                          {task.properties.Priority && (
                            <span
                              className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                                task.properties.Priority === "High"
                                  ? "bg-red-500 text-white"
                                  : task.properties.Priority === "Medium"
                                    ? "bg-orange-400 text-gray-900"
                                    : "bg-green-500 text-white"
                              }`}
                            >
                              {task.properties.Priority}
                            </span>
                          )}

                          {/* Deadline 顯示為文字 */}
                          {task.properties.Deadline && (
                            <div className="text-sm text-gray-400 mt-2">
                              Deadline: {task.properties.Deadline}
                            </div>
                          )}
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
          columnId={selectedTask.columnId}
          taskId={selectedTask.taskId}
          initialTitle={selectedTask.title}
          initialContent={selectedTask.content}
          initialProperties={selectedTask.properties}
        />
      )}
    </>
  );
};

export default KanbanBoard;
