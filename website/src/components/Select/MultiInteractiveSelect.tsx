import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { assignProjectColor, PropertyOption } from "../../types/property";
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const propertySetting = useSelector(
    (state: RootState) => state.kanban.propertySetting,
  );

  const propertyConfig = useMemo(() => {
    return (
      _.cloneDeep(
        propertySetting.find((prop) => prop.name === propertyName),
      ) || { id: "", options: [] }
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

  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<PropertyOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<PropertyOption[]>([]);

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

  useEffect(() => {
    setFilteredOptions(propertyConfig?.options || []);
  }, [propertyConfig]);

  const handleExpand = useCallback(() => {
    setIsExpanded(true);
    setFilteredOptions(propertyConfig?.options || []);
  }, [propertyConfig]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      setFilteredOptions(
        (propertyConfig?.options || []).filter((option) =>
          option.name.toLowerCase().includes(value.toLowerCase()),
        ),
      );
    },
    [propertyConfig],
  );

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

  const handleSelectOption = useCallback(
    (option: PropertyOption) => {
      if (selectedOptions.some((selected) => selected.id === option.id)) {
        return;
      }
      const newSelectedOptions = [...selectedOptions, option];
      setSelectedOptions(newSelectedOptions);
      onChange(newSelectedOptions.map((opt) => opt.id));
    },
    [selectedOptions, onChange],
  );

  const handleRemoveOption = useCallback(
    (optionId: string) => {
      const newSelectedOptions = selectedOptions.filter(
        (option) => option.id !== optionId,
      );
      setSelectedOptions(newSelectedOptions);
      onChange(newSelectedOptions.map((opt) => opt.id));
    },
    [selectedOptions, onChange],
  );

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
    <div className="relative w-full" ref={dropdownRef}>
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
                  onClick={() => handleRemoveOption(option.id)}
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
            onClick={handleExpand}
            disabled={readOnly}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
      </div>

      {isExpanded && (
        <DropdownMenu
          inputValue={inputValue}
          filteredOptions={filteredOptions}
          onInputChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSelectOption={handleSelectOption}
        />
      )}
    </div>
  );
};

export default MultiInteractiveSelect;
