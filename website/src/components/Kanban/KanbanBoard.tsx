import React, { useEffect } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import EditDialog from "../Dialog/EditDialog";
import {
  createTaskWithDefaultProperties,
  updateMultipleTasks,
  updateProperty,
} from "../../store/slices/kanbanThuck";
import AddTaskButton from "./AddTaskButton";
import KanbanColumn from "./KanbanColumn";
import {
  defaultColumnCollapseProxy,
  useKanbanColumns,
} from "./useKanbanColumns";
import { generateNextTask, updateTaskOrder } from "../../utils/kanbanUtils";
import { TaskWithProperties } from "../../types/task";
import { KanbanBoardProps } from "../../types/kanban";

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  dataName,
  groupPropertyName,
  columnSort,
  defaultProperties,
  propertyOrder,
  readOnly,
  taskSortProperty,
  cardVisibleProperties,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const tasks: TaskWithProperties[] = useSelector((state: RootState) => {
    return state.kanban[dataName] as TaskWithProperties[];
  });
  const propertyConfig = useSelector(
    (state: RootState) => state.kanban.propertySetting,
  );

  const {
    columns,
    isDialogOpen,
    selectedTask,
    setIsDialogOpen,
    setSelectedTask,
  } = useKanbanColumns(
    tasks,
    propertyConfig,
    groupPropertyName,
    columnSort,
    taskSortProperty,
  );

  useEffect(() => {
    // for test
    // @ts-ignore
    window.reactBeautifulDndContext = { handleDragEnd };
  }, [tasks, columns]);

  const handleDragEnd = (result: DropResult) => {
    if (readOnly) return;

    const { source, destination } = result;
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    ) {
      return;
    }

    const taskId = result.draggableId;
    const task = tasks.find((task) => task.id === taskId);
    if (!task) return;

    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destinationColumn = columns.find(
      (col) => col.id === destination.droppableId,
    );

    if (!sourceColumn || !destinationColumn) return;

    const { updateTasks, updatePropertyData } = updateTaskOrder(
      sourceColumn,
      destinationColumn,
      source,
      destination,
      task,
      groupPropertyName,
    );

    if (updatePropertyData) {
      dispatch(updateProperty(updatePropertyData));
    }
    if (updateTasks) {
      dispatch(updateMultipleTasks(updateTasks));
    }
  };

  const handleEdit = (task: TaskWithProperties) => {
    setIsDialogOpen(true);
    setSelectedTask(task);
  };

  const handleAddTask = () => {
    const newTask = generateNextTask(defaultProperties, columns);
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
      {!readOnly && <AddTaskButton onClick={handleAddTask} />}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4 p-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              defaultIsCollapsed={defaultColumnCollapseProxy[column.name]}
              onEditTask={handleEdit}
              cardVisibleProperties={cardVisibleProperties}
              dataName={dataName}
            />
          ))}
        </div>
      </DragDropContext>
      {selectedTask && (
        <EditDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          taskId={selectedTask.id}
          dataName={dataName}
          propertyOrder={propertyOrder}
          readOnly={readOnly}
        />
      )}
    </>
  );
};

export default KanbanBoard;
