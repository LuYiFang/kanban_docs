import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  InteractiveSelectPropertyConfig,
  PropertyOption,
} from "../../types/property";
import { createPortal } from "react-dom";

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
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const DropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilteredOptions(propertyConfig?.options || []);
  }, [propertyConfig]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        !DropdownRef.current?.contains(target) &&
        !DropdownRef.current?.contains(target)
      ) {
        onClose();
        setInputValue("");
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    if (!isExpanded) return;

    const rect = triggerRef.current?.getBoundingClientRect();

    if (rect) {
      const style =
        mode === "right"
          ? {
              top: rect.top + window.scrollY,
              left: rect.right + window.scrollX + 8,
            }
          : {
              top: rect.bottom + window.scrollY + 8,
              left: rect.left + window.scrollX,
            };

      setMenuStyle(style);
    }
  }, [isExpanded, mode]);

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
      {menuStyle.top !== undefined &&
        createPortal(
          <div
            className="absolute w-64 bg-gray-950 border border-gray-500 z-50 p-1"
            style={menuStyle}
            ref={DropdownRef}
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
              className="   shadow-md max-h-48 overflow-y-auto"
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
          </div>,
          document.body,
        )}
    </>
  );
};

export default DropdownMenu;
