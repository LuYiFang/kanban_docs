import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { PropertyOption } from "../../types/property";
import { formatToCapitalCase } from "../../utils/tools";
import { createPropertyOption } from "../../store/slices/kanbanThuck";
import { TaskWithProperties } from "../../types/task";
import { kanbanDataName } from "../../types/kanban";

const getOtherTasks = (tasks: TaskWithProperties[], taskId: string) => {
  return tasks
    .filter((task) => task.id !== taskId)
    .map((task) => ({
      id: task.id,
      name: task.title || `Task ${task.id}`,
    }));
};

const InteractiveSelect: React.FC<{
  taskId: string;
  propertyName: string;
  readOnly: boolean;
  dataName: kanbanDataName;
  onChange: (value: string) => void;
}> = ({ taskId, propertyName, dataName, onChange, readOnly }) => {
  const dispatch = useDispatch<AppDispatch>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const propertyConfig = useSelector(
    (state: RootState) =>
      state.kanban.propertySetting.find(
        (prop) => prop.name === propertyName,
      ) || {
        id: "",
        options: [],
      },
  );

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

  const tasks = useSelector(
    (state: RootState) => state.kanban[dataName] as TaskWithProperties[],
  );

  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState(taskProperty.value);
  const [filteredOptions, setFilteredOptions] = useState<PropertyOption[]>([]);

  const otherTaskOptions = useMemo(() => {
    return getOtherTasks(tasks, taskId);
  }, [tasks, taskId]);

  useEffect(() => {
    if (propertyName === "epic") {
      setFilteredOptions(otherTaskOptions);
    } else {
      setFilteredOptions(propertyConfig?.options || []);
    }
  }, [propertyName, tasks, taskId, propertyConfig]);

  // 展開選單
  const handleExpand = useCallback(() => {
    setIsExpanded(true);
    if (propertyName === "epic") {
      setFilteredOptions(otherTaskOptions);
    } else {
      setFilteredOptions(propertyConfig?.options || []);
    }
  }, [propertyName, tasks, taskId, propertyConfig]);

  // 輸入框變更
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      if (propertyName === "epic") {
        setFilteredOptions(
          otherTaskOptions.filter((task) =>
            task.name.toLowerCase().includes(value.toLowerCase()),
          ),
        );
      } else {
        setFilteredOptions(
          (propertyConfig?.options || []).filter((option) =>
            option.name.toLowerCase().includes(value.toLowerCase()),
          ),
        );
      }
    },
    [propertyName, tasks, taskId, propertyConfig],
  );

  // 新增選項
  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && inputValue.trim()) {
        e.preventDefault();
        const newOptionName = inputValue.trim();

        if (
          (propertyConfig?.options || []).some(
            (option) =>
              option.name.toLowerCase() === newOptionName.toLowerCase(),
          )
        ) {
          setIsExpanded(false);
          return;
        }

        try {
          const newOption: PropertyOption = await dispatch(
            createPropertyOption({
              propertyId: propertyConfig.id,
              name: newOptionName,
            }),
          ).unwrap();

          setFilteredOptions((prev) => [...prev, newOption]);
          handleSelectOption(newOption);
        } catch (error) {
          console.error("Failed to create property option:", error);
        }
      }
    },
    [dispatch, inputValue, propertyConfig],
  );

  // 選擇選項
  const handleSelectOption = useCallback(
    (option: PropertyOption) => {
      setInputValue(option.name);
      setIsExpanded(false);
      onChange(option.name);
    },
    [onChange],
  );

  // 點擊外部關閉選單
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsExpanded(false);
    }
  }, []);

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, handleClickOutside]);

  return (
    <div className="relative w-64" ref={dropdownRef}>
      <button
        className="w-full text-sm p-2 border border-gray-700 bg-gray-800 text-gray-300 rounded"
        onClick={handleExpand}
        data-cy="property-select-input"
        disabled={readOnly}
      >
        {formatToCapitalCase(inputValue) || "Select an option"}
      </button>

      {isExpanded && (
        <div className="absolute top-12 left-0 w-full z-50 bg-gray-800 border border-gray-700 rounded-md shadow-md">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search or add an option"
            className="w-full border-b border-gray-700 p-2 bg-gray-800 text-gray-300 placeholder-gray-500 rounded-t-md"
            data-cy="property-select-search"
          />
          <ul className="max-h-48 overflow-y-auto">
            {filteredOptions.map((option) => (
              <li
                key={option.propertyId + option.name}
                onClick={() => handleSelectOption(option)}
                className="p-2 cursor-pointer hover:bg-gray-700 text-gray-300"
              >
                {option.name}
              </li>
            ))}
            {filteredOptions.length === 0 && (
              <li className="p-2 text-gray-500">No matching options</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InteractiveSelect;
