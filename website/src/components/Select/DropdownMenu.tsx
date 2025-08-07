import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  InteractiveSelectPropertyConfig,
  PropertyOption,
} from "../../types/property";
import DropdownPortal from "../Dialog/DropdwonPortal";

export type DropdownMode = "bottom" | "right";

const DropdownMenu: React.FC<{
  propertyConfig: InteractiveSelectPropertyConfig;
  selectedOptions: PropertyOption[] | string;
  readOnly: boolean;
  isExpanded: boolean;
  onClose: () => void;
  onChange: (value: string | PropertyOption[]) => void;
  onCreateOption: (name: string) => Promise<PropertyOption>;
  mode?: DropdownMode;
}> = ({
  propertyConfig,
  selectedOptions,
  readOnly,
  isExpanded,
  onClose,
  onChange,
  onCreateOption,
  mode = "right",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<PropertyOption[]>([]);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilteredOptions(propertyConfig?.options || []);
  }, [propertyConfig]);

  const handleSearch = useCallback(() => {
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
          onClose();
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
    [inputValue, propertyConfig, onCreateOption, onClose],
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
      onClose();
    },
    [selectedOptions, onChange, onClose],
  );

  if (!isExpanded) return null;

  return (
    <>
      <div ref={triggerRef} className="relative w-full " />
      <DropdownPortal
        positionRef={triggerRef}
        isOpen={isExpanded}
        onClose={() => {
          onClose();
          setInputValue("");
        }}
        mode={mode}
        className="absolute w-64 bg-gray-950 border border-gray-500 z-50 p-1"
      >
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search or add an option"
          className="w-full border-b border-gray-700 focus:border-blue-500 focus:outline-none p-1 bg-gray-950 text-gray-300 placeholder-gray-500 rounded-t-sm"
          onFocus={handleSearch}
          data-cy="property-select-search"
          style={{ display: !readOnly ? "block" : "none" }}
        />
        <div
          className="shadow-md max-h-48 overflow-y-auto"
          style={{ display: isExpanded ? "block" : "none" }}
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
      </DropdownPortal>
    </>
  );
};

export default DropdownMenu;
