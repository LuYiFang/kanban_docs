import _ from "lodash";
import { convertToKebabCase } from "./tools";
import { DropResult } from "react-beautiful-dnd";
import { Task, TaskCreate, TaskWithProperties } from "../types/task";
import { DefaultProperty, PropertyConfig } from "../types/property";
import { Column } from "../types/kanban";

export const generateColumns = (
  tasks: TaskWithProperties[],
  propertyConfig: PropertyConfig[],
  groupPropertyName: string,
  columnSort: string[],
  taskSortProperty: string,
): Column[] => {
  const colGroup = _.groupBy(tasks, (task) => {
    const groupProperty = task.properties.find(
      (prop) => prop.name === groupPropertyName,
    );
    return groupProperty
      ? convertToKebabCase((groupProperty.value as string) || "")
      : null;
  });

  const targetProperty = _.find(propertyConfig, { name: groupPropertyName });
  if (!targetProperty) return [];

  const defaultGroup: Record<string, Column> = {};
  const sortedOptions = _.sortBy(targetProperty.options, (option) => {
    return columnSort.indexOf(convertToKebabCase(option.name));
  });

  _.each(sortedOptions, (option) => {
    const colTitle = option.name;
    const colId = option.id;
    defaultGroup[colId] = {
      id: colId,
      name: colTitle,
      tasks: _.sortBy(colGroup[colId] || [], (t) => {
        if (!taskSortProperty.includes(".")) {
          return t[taskSortProperty];
        }

        const [_properties, _value] = taskSortProperty.split(".");
        const _property = _.find(t.properties, { name: "project" });
        return _property?.value;
      }),
    };
  });

  return _.values(defaultGroup);
};

export const generateNextTask = (
  defaultProperties: DefaultProperty[],
  columns: Column[],
): { task: TaskCreate; properties: DefaultProperty[] } => {
  return generateTask(
    defaultProperties,
    "regular",
    columns.find((column) => column.id === "todo")?.tasks.length || 0,
  );
};

export const generateTask = (
  defaultProperties: DefaultProperty[],
  type: string,
  order: number,
): { task: TaskCreate; properties: DefaultProperty[] } => {
  return {
    task: {
      title: "",
      content: "",
      type: type,
      order: order,
      updatedAt: "",
    },
    properties: defaultProperties,
  };
};

export const updateTaskOrder = (
  sourceColumn: Column,
  destinationColumn: Column,
  source: DropResult["source"],
  destination: DropResult["destination"],
  task: TaskWithProperties,
  groupPropertyName: string,
): {
  updateTasks: Task[] | null;
  updatePropertyData: {
    taskId: string;
    property: string;
    propertyId: string;
    value: string;
  } | null;
} => {
  const sourceTasks = [...sourceColumn.tasks];
  const [movedTask] = sourceTasks.splice(source.index, 1);

  const destinationTasks =
    source.droppableId === destination?.droppableId
      ? sourceTasks
      : [...destinationColumn.tasks];
  destinationTasks.splice(<number>destination?.index, 0, movedTask);

  const updatedSourceTasks = sourceTasks.map((task, index) => ({
    id: task.id,
    title: task.title,
    content: task.content,
    type: task.type,
    order: index,
    updatedAt: "",
  }));
  const updatedDestinationTasks = destinationTasks.map((task, index) => ({
    id: task.id,
    title: task.title,
    content: task.content,
    type: task.type,
    order: index,
    updatedAt: "",
  }));

  if (source.droppableId === destination?.droppableId) {
    return { updatePropertyData: null, updateTasks: updatedSourceTasks };
  } else {
    const property = task.properties.find((p) => p.name === groupPropertyName);
    if (!property) return { updatePropertyData: null, updateTasks: null };

    return {
      updatePropertyData: {
        taskId: task.id,
        property: groupPropertyName,
        propertyId: property.id,
        value: destination?.droppableId || "",
      },
      updateTasks: [...updatedSourceTasks, ...updatedDestinationTasks],
    };
  }
};

export const getOtherTasks = (
  tasks: TaskWithProperties[],
  taskId: string,
  propertyId: string,
  statusEpicId: string,
) => {
  // 過濾出屬性為 "epic" 的任務
  const epicTasks = tasks.filter((task) => {
    if (task.id === taskId) return false;

    return task.properties.some(
      (property) =>
        property.name === "status" && property.value === statusEpicId,
    );
  });
  return epicTasks.map((task) => ({
    id: task.id,
    name: task.title || `Task ${task.id}`,
    propertyId: propertyId,
  }));
};
