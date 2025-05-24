import React, { useEffect, useMemo } from "react";
import KanbanBoard from "../components/Kanban/KanbanBoard";
import {
  defaultTaskProperties,
  statusOrder,
  taskPropertyOrder,
} from "../types/property";
import { getAllTaskWithProperties } from "../store/slices/kanbanThuck";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import _ from "lodash";
import { DataType } from "../types/kanban";

const KanbanPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const propertySetting = useSelector(
    (state: RootState) => state.kanban.propertySetting,
  );

  useEffect(() => {
    dispatch(getAllTaskWithProperties({ taskType: DataType.TASK }));
  }, []);

  const defaultTaskPropertiesWithId = useMemo(() => {
    const defaultPropertiesWithId = _.cloneDeep(defaultTaskProperties);
    const propertyNameToIdMap = _.reduce(
      propertySetting,
      (result, property) => {
        _.each(property.options, (option) => {
          result[option.name] = option.id;
        });
        return result;
      },
      {} as Record<string, string>,
    );

    _.each(defaultPropertiesWithId, (property) => {
      property.value = propertyNameToIdMap[property.value as string] || "";
    });

    return defaultPropertiesWithId;
  }, [propertySetting]);

  return (
    <div className="h-screen overflow-auto w-full flex flex-col bg-gray-900 text-gray-300">
      <h1 className="text-2xl font-bold mb-4 ml-4 mt-4">Kanban</h1>
      <KanbanBoard
        dataName="tasks"
        groupPropertyName="status"
        columnSort={statusOrder}
        defaultProperties={defaultTaskPropertiesWithId}
        propertyOrder={taskPropertyOrder}
        readOnly={false}
        taskSortProperty="order"
        cardVisibleProperties={[
          "title",
          "project",
          "epic",
          "priority",
          "assignee",
        ]}
      />
    </div>
  );
};

export default KanbanPage;
