import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteTask,
  updateProperty,
  updateTask,
} from "../../store/slices/kanbanThuck";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { kanbanDataName } from "../../types/kanban";
import { TaskWithProperties } from "../../types/task";
import _ from "lodash";
import moment from "moment/moment";
import { Property } from "../../types/property";

export const useEditor = (
  taskId: string,
  dataName: kanbanDataName,
  readOnly: boolean,
  deleteTaskCallback?: () => void,
) => {
  const dispatch = useDispatch<AppDispatch>();
  const tasks: TaskWithProperties[] = useSelector(
    (state: RootState) => state.kanban[dataName] as TaskWithProperties[],
  );

  const task: TaskWithProperties = useMemo(() => {
    return (
      tasks.find((t) => t.id === taskId) || {
        id: "",
        title: "",
        content: "",
        type: "",
        order: 0,
        updatedAt: "",
        properties: [],
      }
    );
  }, [tasks, taskId]);

  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle(task.title);
  }, [task.title]);

  const saveTask = useCallback(
    (title: string | null, content: string | null) => {
      if (readOnly) return;

      const newTask = { ...task };
      if (title !== null) newTask.title = title;
      if (content !== null) newTask.content = content;

      dispatch(
        updateTask({
          taskId,
          task: newTask,
        }),
      );
    },
    [dispatch, taskId, task, title],
  );
  const delaySaveTask = _.debounce(
    (title: string | null, content: string | null) => saveTask(title, content),
    3000,
  );

  const propertyMap = useMemo(
    () =>
      _.mapValues(
        _.groupBy(task.properties, "name"),
        (group) => _.first(group) as Property,
      ),
    [task.properties],
  );

  const handlePropertyChange = useCallback(
    (property: string, value: string | string[]) => {
      if (readOnly) return;

      const propertyId = propertyMap[property.toLowerCase()]?.id;
      if (!propertyId) return;
      dispatch(
        updateProperty({ taskId: task.id, propertyId, property, value }),
      );
    },
    [dispatch, propertyMap, task.id],
  );

  const formatDateTimeLocal = useCallback(
    (date: string) => (date ? moment(date).format("YYYY-MM-DDTHH:mm") : ""),
    [],
  );

  const handleDeleteTask = useCallback(() => {
    if (readOnly) return;

    dispatch(deleteTask({ taskId }));
    if (deleteTaskCallback) deleteTaskCallback();
  }, [dispatch, taskId]);

  return {
    title,
    setTitle,
    task,
    saveTask,
    delaySaveTask,
    propertyMap,
    handlePropertyChange,
    formatDateTimeLocal,
    handleDeleteTask,
  };
};
