import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import {
  InteractiveSelectPropertyConfig,
  PropertyOption,
} from "../../types/property";
import { createPropertyOption } from "../../store/slices/kanbanThuck";
import { TaskWithProperties } from "../../types/task";
import { kanbanDataName } from "../../types/kanban";
import _ from "lodash";
import { getOtherTasks } from "../../utils/kanbanUtils";
import DropdownMenu from "./DropdownMenu";

const InteractiveSelect: React.FC<{
  taskId: string;
  propertyName: string;
  readOnly: boolean;
  dataName: kanbanDataName;
  onChange: (value: string) => void;
}> = ({ taskId, propertyName, dataName, onChange, readOnly }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isExpanded, setIsExpanded] = useState(false);

  const propertySetting = useSelector(
    (state: RootState) => state.kanban.propertySetting,
  );
  const tasks = useSelector(
    (state: RootState) => state.kanban[dataName] as TaskWithProperties[],
  );

  const propertyConfig: InteractiveSelectPropertyConfig = useMemo(() => {
    const _propertyConfig = _.cloneDeep(
      propertySetting.find((prop) => prop.name === propertyName),
    ) || { id: "", options: [] };

    if (propertyName === "epic") {
      const statusEpicId =
        propertySetting
          .find((prop) => prop.name === "status")
          ?.options?.find((op) => op.name === "Epic")?.id || "";
      const _tasks = tasks as TaskWithProperties[];
      _propertyConfig.options = getOtherTasks(
        _tasks,
        taskId,
        _propertyConfig.id,
        statusEpicId,
      );
    }
    return _propertyConfig as InteractiveSelectPropertyConfig;
  }, [propertySetting, propertyName, tasks, taskId]);

  const taskProperty = useSelector((state: RootState) => {
    const task = (state.kanban[dataName] as TaskWithProperties[]).find(
      (task) => task.id === taskId,
    );
    return (
      task?.properties.find((prop) => prop.name === propertyName) || {
        id: "",
        name: propertyName,
        value: "",
      }
    );
  });

  const handleSelectChange = (values: string | PropertyOption[]) => {
    if (_.isArray(values)) {
      return;
    }
    onChange(values);
  };

  return (
    <div className="relative w-64">
      <button
        className="w-full text-sm p-1 border border-gray-700 bg-gray-800 text-gray-300 rounded"
        onClick={() => setIsExpanded(!isExpanded)}
        data-cy="property-select-input"
        disabled={readOnly}
      >
        {propertyConfig.options.find((op) => op.id === taskProperty.value)
          ?.name || "Select an option"}
      </button>

      <DropdownMenu
        propertyConfig={propertyConfig}
        selectedOptions={taskProperty.value as string}
        readOnly={readOnly}
        isExpanded={isExpanded}
        onClose={() => setIsExpanded(false)}
        onChange={handleSelectChange}
        onCreateOption={(name) =>
          dispatch(
            createPropertyOption({ propertyId: propertyConfig.id, name }),
          ).unwrap()
        }
      />
    </div>
  );
};

export default InteractiveSelect;
