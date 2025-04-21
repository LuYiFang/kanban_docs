import React, { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import EditDialog from "../Dialog/EditDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { TaskWithProperties } from "../../types/task";
import { DefaultProperty } from "../../types/property";
import {
  createTaskWithDefaultProperties,
  updateProperty,
} from "../../store/slices/kanbanThuck";
import _ from "lodash";
import { updateTaskOrder } from "../../store/slices/kanbanSlice";
import { convertToKebabCase } from "../../utils/tools";
import KanbanCard from "./KanbanCard";

interface KanbanBoardProps {
  type: string;
  dataName: string;
  groupPropertyName: string;
  columnSort: string[];
  defaultProperties: DefaultProperty[];
  propertyOrder: string[];
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  type,
  dataName,
  groupPropertyName,
  columnSort,
  defaultProperties,
  propertyOrder,
}) => {
  const tasks = useSelector((state: RootState) => state.kanban[dataName]);
  const dispatch = useDispatch();

  const propertyConfig = useSelector(
    (state: RootState) => state.kanban.propertySetting,
  );

  const columns = useMemo(() => {
    const colGroup = _.groupBy(tasks, (task) => {
      const groupProperty = task.properties.find(
        (prop) => prop.name === groupPropertyName,
      );
      return groupProperty ? convertToKebabCase(groupProperty.value) : null;
    });

    const targetProperty = _.find(propertyConfig, { name: groupPropertyName });
    if (!targetProperty) return [];

    const defaultGroup = {};
    const sortedOptions = _.sortBy(targetProperty.options, (option) => {
      return columnSort.indexOf(convertToKebabCase(option.name));
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
  }, [tasks, propertyConfig, columnSort, groupPropertyName]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<
    (TaskWithProperties & { columnId: string }) | null
  >(null);

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

    const property = task.properties.find((p) => p.name === groupPropertyName);
    if (!property) return;

    dispatch(
      updateProperty({
        taskId,
        property: groupPropertyName,
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
    dispatch(
      createTaskWithDefaultProperties({
        task: { title: "", content: "", type: "" },
        properties: defaultProperties,
      }),
    )
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
              {(provided) => {
                const hasSpecialTask = column.tasks.some(
                  (task) => task.type === "daily",
                );

                return (
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

                    {column.tasks.map((task, index) => {
                      return (
                        <KanbanCard
                          key={task.id}
                          task={task}
                          index={index}
                          onEdit={handleEdit}
                        />
                      );
                    })}
                    {provided.placeholder}
                  </div>
                );
              }}
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
          dataName={dataName}
          propertyOrder={propertyOrder}
          type={type}
        />
      )}
    </>
  );
};

export default KanbanBoard;
