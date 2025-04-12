import React, { useEffect, useMemo, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import EditDialog from "../Dialog/EditDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import { TaskWithProperties } from "../../types/task";
import { priorityColor, statusOrder } from "../../types/property";
import {
  createTaskWithDefaultProperties,
  getAllTaskWithProperties,
  getPropertiesAndOptions,
  updateProperty,
} from "../../store/slices/kanbanThuck";
import _ from "lodash";
import { updateTaskOrder } from "../../store/slices/kanbanSlice";
import { convertToKebabCase, formatToCapitalCase } from "../../utils/tools";

const KanbanBoard: React.FC = () => {
  const tasks = useSelector((state: RootState) => state.kanban.tasks);
  const dispatch = useDispatch();

  const propertyConfig = useSelector(
    (state: RootState) => state.kanban.propertySetting,
  );

  const columns = useMemo(() => {
    const colGroup = _.groupBy(tasks, (task) => {
      return task.properties.find((prop) => prop.name === "status").value;
    });

    const statusProperty = _.find(propertyConfig, { name: "status" });
    if (!statusProperty) return [];

    const defaultGroup = {};
    const sortedOptions = _.sortBy(statusProperty.options, (option) => {
      return statusOrder.indexOf(convertToKebabCase(option.name));
    });
    _.each(sortedOptions, (option) => {
      const colTitle = option.name;
      const colId = convertToKebabCase(colTitle);
      defaultGroup[colId] = {
        id: colId,
        name: colTitle,
        tasks: colGroup[colId] || [],
      };
    });

    return _.values(defaultGroup);
  }, [tasks, propertyConfig]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<
    (TaskWithProperties & { columnId: string }) | null
  >(null);

  useEffect(() => {
    dispatch(getAllTaskWithProperties());
    dispatch(getPropertiesAndOptions());
  }, []);

  useEffect(() => {
    // for test
    window.reactBeautifulDndContext = { handleDragEnd };
  }, [tasks]);

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

    const task = tasks.find((task) => task.id === taskId);
    if (!task) return;

    if (source.droppableId === destination.droppableId) {
      const updatedTasks = [...tasks];
      const [movedTask] = updatedTasks.splice(source.index, 1);
      updatedTasks.splice(destination.index, 0, movedTask);

      dispatch(updateTaskOrder(updatedTasks));
      return;
    }

    const property = task.properties.find((p) => p.name === "status");
    if (!property) return;

    dispatch(
      updateProperty({
        taskId,
        property: "status",
        propertyId: property.id,
        value: destination.droppableId,
      }),
    );
  };

  const handleEdit = (task: TaskWithProperties) => {
    setIsDialogOpen(true);
    setSelectedTask(task);
  };

  const handleAddTask = () => {
    const newTask = {
      title: "",
      content: "",
      properties: {},
    };

    dispatch(createTaskWithDefaultProperties(newTask))
      .unwrap()
      .then((createdTask) => {
        setIsDialogOpen(true);
        setSelectedTask(createdTask);
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
        id="add-task-button"
      >
        <FontAwesomeIcon icon={faPlus} className="w-6 h-6" />
      </button>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-5 gap-4 p-4">
          {_.map(columns, (column) => (
            <Droppable droppableId={column.id} key={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="p-4 bg-gray-800 rounded shadow"
                  data-cy="kanban-column"
                  id={column.id}
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
                          data-cy="kanban-task"
                          id={task.id}
                          onClick={() => handleEdit(task)}
                        >
                          <div
                            className="font-bold text-gray-100"
                            data-cy="kanban-task-title"
                          >
                            {task.title}
                          </div>

                          {/* Priority Chip */}
                          {task.properties.map((property) => {
                            if (!property.id) return "";
                            if (property.name === "priority") {
                              return (
                                <span
                                  key={`property-${property.id}`}
                                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-md ${priorityColor[property.value]}`}
                                >
                                  {formatToCapitalCase(property.value)}
                                </span>
                              );
                            }

                            if (property.name === "deadline") {
                              return (
                                <div
                                  key={`property-${property.id}`}
                                  className="text-sm text-gray-400 mt-2"
                                >
                                  {property.value}
                                </div>
                              );
                            }

                            if (
                              property.name === "assignee" &&
                              property.value
                            ) {
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
                            return "";
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
        />
      )}
    </>
  );
};

export default KanbanBoard;
