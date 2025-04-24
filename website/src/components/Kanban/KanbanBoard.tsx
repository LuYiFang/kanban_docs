import React, { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import EditDialog from "../Dialog/EditDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { TaskWithProperties } from "../../types/task";
import { DefaultProperty } from "../../types/property";
import {
  createTaskWithDefaultProperties,
  updateProperty,
  updateMultipleTasks,
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
        tasks: _.sortBy(colGroup[colId] || [], "order"),
      };
    });

    return _.values(defaultGroup);
  }, [tasks, propertyConfig, columnSort, groupPropertyName]);

  const generateNextTask = (defaultProperties: DefaultProperty[]) => {
    return {
      task: {
        title: "",
        content: "",
        type: "",
        order:
          columns.find((column) => column.id === "todo")?.tasks.length || 0,
      },
      properties: defaultProperties,
    };
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<
    (TaskWithProperties & { columnId: string }) | null
  >(null);

  const [collapsedColumns, setCollapsedColumns] = useState<
    Record<string, boolean>
  >({
    done: true,
    cancelled: true,
    deferred: true,
  });

  const toggleColumnCollapse = (columnId: string) => {
    setCollapsedColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

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

    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destinationColumn = columns.find(
      (col) => col.id === destination.droppableId,
    );

    if (!sourceColumn || !destinationColumn) return;

    // 更新 source 列任務順序
    const sourceTasks = [...sourceColumn.tasks];
    const [movedTask] = sourceTasks.splice(source.index, 1);

    // 更新 destination 列任務順序
    const destinationTasks =
      source.droppableId === destination.droppableId
        ? sourceTasks
        : [...destinationColumn.tasks];
    destinationTasks.splice(destination.index, 0, movedTask);

    // 創建新的任務列表，避免直接修改只讀屬性
    const updatedSourceTasks = sourceTasks.map((task, index) => ({
      id: task.id,
      title: task.title,
      content: task.content,
      order: index,
    }));
    const updatedDestinationTasks = destinationTasks.map((task, index) => ({
      id: task.id,
      title: task.title,
      content: task.content,
      order: index,
    }));

    if (source.droppableId === destination.droppableId) {
      // 同列拖放
      dispatch(updateMultipleTasks(updatedSourceTasks));
    } else {
      // 跨列拖放
      const property = task.properties.find(
        (p) => p.name === groupPropertyName,
      );
      if (!property) return;

      dispatch(
        updateProperty({
          taskId,
          property: groupPropertyName,
          propertyId: property.id,
          value: destination.droppableId,
        }),
      );

      // 更新 source 和 destination 列的任務
      dispatch(
        updateMultipleTasks([
          ...updatedSourceTasks,
          ...updatedDestinationTasks,
        ]),
      );
    }
  };

  const handleEdit = (task: TaskWithProperties) => {
    setIsDialogOpen(true);
    setSelectedTask(task);
  };

  const handleAddTask = () => {
    const newTask = generateNextTask(defaultProperties);
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
              {(provided) => {
                const isCollapsed = collapsedColumns[column.id];

                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="p-4 bg-gray-800 rounded shadow"
                    data-cy="kanban-column"
                    id={column.id}
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleColumnCollapse(column.id)}
                    >
                      <h2 className="text-lg font-bold text-gray-300 mb-2">
                        {column.name}
                      </h2>
                      <span className="text-gray-400">
                        <FontAwesomeIcon
                          icon={isCollapsed ? faPlus : faMinus}
                        />
                      </span>
                    </div>

                    {!isCollapsed && (
                      <div>
                        {column.tasks.map((task, index) => (
                          <KanbanCard
                            key={task.id}
                            task={task}
                            index={index}
                            onEdit={handleEdit}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
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
