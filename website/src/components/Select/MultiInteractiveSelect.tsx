import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import {
  assignProjectColor,
  InteractiveSelectPropertyConfig,
  PropertyOption,
} from "../../types/property";
import { createPropertyOption } from "../../store/slices/kanbanThuck";
import _ from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import DropdownMenu from "./DropdownMenu";
import { kanbanDataName } from "../../types/kanban";
import { TaskWithProperties } from "../../types/task";

const MultiInteractiveSelect: React.FC<{
  taskId: string;
  propertyName: string;
  readOnly: boolean;
  dataName: kanbanDataName;
  onChange: (values: string[]) => void;
}> = ({ taskId, propertyName, dataName, onChange, readOnly }) => {
  const dispatch = useDispatch<AppDispatch>();

  const propertySetting = useSelector(
    (state: RootState) => state.kanban.propertySetting,
  );

  const propertyConfig: InteractiveSelectPropertyConfig = useMemo(() => {
    return (
      (_.cloneDeep(
        propertySetting.find((prop) => prop.name === propertyName),
      ) as InteractiveSelectPropertyConfig) || {
        id: "",
        options: [],
      }
    );
  }, [propertySetting, propertyName]);

  const taskProperty = useSelector((state: RootState) => {
    const tasks = state.kanban[dataName] as TaskWithProperties[];
    if (!Array.isArray(tasks) || !tasks.length) {
      return { id: "", name: propertyName, value: [] };
    }

    const task = tasks.find((task) => task.id === taskId);
    return (
      task?.properties.find((prop) => prop.name === propertyName) || {
        id: "",
        name: propertyName,
        value: [],
      }
    );
  });

  const [selectedOptions, setSelectedOptions] = useState<PropertyOption[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!propertyConfig.options) {
      setSelectedOptions([]);
      return;
    }
    if (!Array.isArray(taskProperty.value)) {
      return;
    }

    const selected = taskProperty.value
      .map((id: string) => {
        if (!propertyConfig.options) return null;

        const option = propertyConfig.options.find((op) => op.id === id);
        if (!option) {
          return null;
        }
        return option;
      })
      .filter(Boolean) as PropertyOption[];
    setSelectedOptions(selected);
  }, [propertyConfig, taskProperty]);

  const handleSelectChange = (values: string | PropertyOption[]) => {
    if (typeof values === "string") {
      return;
    }
    setSelectedOptions(values);
    onChange(_.map(values, "id"));
  };

  return (
    <div className="relative w-full">
      <div className="w-full text-sm p-2 border border-gray-700 bg-gray-800 text-gray-300 rounded flex flex-wrap gap-2">
        {selectedOptions.map((option) => {
          const color = assignProjectColor(option.name);
          return (
            <div
              key={option.id}
              className={`px-2 py-1 text-xs w-[fit-content] font-semibold flex items-center rounded ${color}`}
            >
              {option.name}
              {!readOnly && (
                <button
                  onClick={() => {
                    const filteredSelectedOptions = selectedOptions.filter(
                      (opt) => opt.id !== option.id,
                    );
                    onChange(filteredSelectedOptions.map((opt) => opt.id));
                    setSelectedOptions(filteredSelectedOptions);
                  }}
                  className={`ml-2 w-5 h-5 p-0 flex items-center justify-center rounded-full ${color} text-gray-100 hover:bg-gray-300 hover:bg-opacity-80 text-[10px]`}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
          );
        })}
        {!readOnly && (
          <button
            className="my-auto w-7 h-7 p-0 flex items-center text-[12px] justify-center rounded-full bg-gray-600 bg-opacity-90 text-gray-100 hover:bg-gray-300 hover:bg-opacity-80"
            onClick={() => {
              setIsExpanded(true);
            }}
            disabled={readOnly}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
      </div>

      <DropdownMenu
        propertyConfig={propertyConfig}
        selectedOptions={selectedOptions}
        readOnly={readOnly}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
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

export default MultiInteractiveSelect;
