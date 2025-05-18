import React from "react";
import { PropertyOption } from "../../types/property";

const DropdownMenu: React.FC<{
  inputValue: string;
  filteredOptions: PropertyOption[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSelectOption: (option: PropertyOption) => void;
}> = ({
  inputValue,
  filteredOptions,
  onInputChange,
  onKeyDown,
  onSelectOption,
}) => {
  return (
    <div className="absolute top-12 left-0 w-full z-50 bg-gray-800 border border-gray-700 rounded-md shadow-md">
      <input
        type="text"
        value={inputValue}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        placeholder="Search or add an option"
        className="w-full border-b border-gray-700 p-2 bg-gray-800 text-gray-300 placeholder-gray-500 rounded-t-md"
        data-cy="property-select-search"
      />
      <ul className="max-h-48 overflow-y-auto">
        {filteredOptions.map((option) => (
          <li
            key={option.propertyId + option.name}
            onClick={() => onSelectOption(option)}
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
  );
};

export default DropdownMenu;
