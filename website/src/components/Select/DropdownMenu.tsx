import React, { useCallback, useEffect, useState } from "react";
import {
  InteractiveSelectPropertyConfig,
  PropertyOption,
} from "../../types/property";

const DropdownMenu: React.FC<{
  propertyConfig: InteractiveSelectPropertyConfig;
  selectedOptions: PropertyOption[] | string;
  readOnly: boolean;
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  onChange: (value: string | PropertyOption[]) => void;
  onCreateOption: (name: string) => Promise<PropertyOption>;
}> = ({
  propertyConfig,
  selectedOptions,
  readOnly,
  isExpanded,
  setIsExpanded,
  onChange,
  onCreateOption,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<PropertyOption[]>([]);

  useEffect(() => {
    setFilteredOptions(propertyConfig?.options || []);
  }, [propertyConfig]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdownElement = document.querySelector(
        ".dropdown-menu.relative.w-full",
      );
      if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
        setIsExpanded(false);
        setInputValue("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsExpanded]);

  const handleExpand = useCallback(() => {
    setIsExpanded(true);
    setFilteredOptions(propertyConfig?.options || []);
  }, [propertyConfig, setIsExpanded]);

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
          const newOption = await onCreateOption(newOptionName);
          setFilteredOptions((prev) => [...prev, newOption]);
          handleSelectOption(newOption);
        } catch (error) {
          console.error("Failed to create property option:", error);
        }
      }
    },
    [inputValue, propertyConfig, onCreateOption, setIsExpanded],
  );

  const handleSelectOption = useCallback(
    (option: PropertyOption) => {
      if (Array.isArray(selectedOptions)) {
        if (selectedOptions.some((selected) => selected.id === option.id)) {
          return;
        }
        const newSelectedOptions = [...selectedOptions, option];
        onChange(newSelectedOptions);
      } else {
        onChange(option.id);
      }
      setIsExpanded(false);
    },
    [selectedOptions, onChange, setIsExpanded],
  );

  if (!isExpanded) return null;

  return (
    <div className="dropdown-menu relative w-full">
      {!readOnly && (
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search or add an option"
          className="w-full border-b border-gray-700 p-1 bg-gray-800 text-gray-300 placeholder-gray-500 rounded-t-md"
          onFocus={handleExpand}
          data-cy="property-select-search"
        />
      )}
      {isExpanded && (
        <div
          className="absolute w-full z-50 bg-gray-800 border border-gray-700 shadow-md max-h-48 overflow-y-auto"
          data-cy="property-select-options"
        >
          {filteredOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleSelectOption(option)}
              className="p-2 cursor-pointer hover:bg-gray-700 text-gray-300"
              data-cy="property-select-option"
            >
              {option.name}
            </div>
          ))}
          {filteredOptions.length === 0 && (
            <div className="p-2 text-gray-500">No matching options</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
