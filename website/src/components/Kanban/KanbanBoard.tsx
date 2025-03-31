import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { moveTask, updateProperty } from "../../store/slices/kanbanSlice";
import EditDialog from "../Dialog/EditDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import { TaskWithProperties } from "../../types/task";
import { priorityColor, priorityName } from "../../types/property";
import {
  createTaskWithDefaultProperties,
  getAllTaskWithProperties,
} from "../../store/slices/kanbanThuck";

const KanbanBoard: React.FC = () => {
  const columns = useSelector((state: RootState) => state.kanban.columns);
  const dispatch = useDispatch();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<
    (TaskWithProperties & { columnId: string }) | null
  >(null);

  useEffect(() => {
    dispatch(getAllTaskWithProperties());
  }, []);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const taskId = result.draggableId;
    if (!taskId) return;

    dispatch(
      moveTask({
        sourceColumnId: source.droppableId,
        destinationColumnId: destination.droppableId,
        sourceIndex: source.index,
        destinationIndex: destination.index,
      }),
    );

    const columnStatusMap: { [key: string]: string } = {
      todo: "To Do",
      "in-progress": "In Progress",
      done: "Done",
    };

    const newStatus = columnStatusMap[destination.droppableId];
    if (!newStatus) return;

    dispatch(
      updateProperty({
        columnId: destination.droppableId,
        taskId,
        property: "Status",
        value: newStatus,
      }),
    );
  };

  const handleEdit = (columnId: string, task: TaskWithProperties) => {
    setIsDialogOpen(true);
    setSelectedTask({
      columnId,
      id: task.id,
      title: task.title,
      content: task.content,
      properties: task.properties,
    });
  };

  const handleAddTask = () => {
    const newTask = {
      title: "",
      content: "",
      properties: {},
    };
    const columnId = "todo";

    dispatch(createTaskWithDefaultProperties(newTask))
      .unwrap()
      .then((createdTask) => {
        setIsDialogOpen(true);
        setSelectedTask({
          columnId,
          id: createdTask.id,
          title: createdTask.title,
          content: createdTask.content,
          properties: createdTask.properties,
        });
      })
      .catch((error) => {
        console.error("Error creating task:", error);
      });
  };

  return (
    <>
      <button
        className="fixed bottom-4 right-4 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 flex items-center justify-center"
        onClick={handleAddTask}
      >
        <FontAwesomeIcon icon={faPlus} className="w-6 h-6" />
      </button>
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
                          {task.properties.map((property) => {
                            if (property.name === "Priority") {
                              return (
                                <span
                                  key={`property-${property.id}`}
                                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-md ${priorityColor[property.value]}`}
                                >
                                  {priorityName[property.value]}
                                </span>
                              );
                            }

                            if (property.name === "Deadline") {
                              return (
                                <div
                                  key={`property-${property.id}`}
                                  className="text-sm text-gray-400 mt-2"
                                >
                                  {property.value}
                                </div>
                              );
                            }

                            if (property.name === "Assignee") {
                              return (
                                <div
                                  key={`property-${property.id}`}
                                  className="flex items-center text-sm text-gray-400 mt-2"
                                >
                                  <FontAwesomeIcon
                                    icon={faUser}
                                    className="w-4 h-4 text-gray-400 mr-2"
                                  />
                                  {property.value}
                                </div>
                              );
                            }
                          })}
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
          taskId={selectedTask.id}
          initialTitle={selectedTask.title}
          initialContent={selectedTask.content}
          initialProperties={selectedTask.properties}
        />
      )}
    </>
  );
};

export default KanbanBoard;
