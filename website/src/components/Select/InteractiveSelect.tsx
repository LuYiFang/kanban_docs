import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { PropertyOption } from "../../types/property";
import { formatToCapitalCase } from "../../utils/tools";

const InteractiveSelect: React.FC<{
  taskId: string;
  propertyName: string;
  dataName: string;
  onChange: (value: string) => void;
}> = ({ taskId, propertyName, dataName, onChange }) => {
  const propertyConfig = useSelector((state: RootState) =>
    state.kanban.propertySetting.find((prop) => prop.name === propertyName),
  );

  const taskProperty = useSelector((state: RootState) => {
    const task = state.kanban[dataName].find((task) => task.id === taskId);
    return task?.properties.find((prop) => prop.name === propertyName);
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState(taskProperty.value);
  const [filteredOptions, setFilteredOptions] = useState<PropertyOption[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 展開選單處理邏輯
  const handleExpand = () => {
    setIsExpanded(true);
    if (propertyConfig?.options) {
      setFilteredOptions(propertyConfig.options); // 重置篩選
    }
  };

  // 輸入框變更處理邏輯
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // 篩選匹配的選項
    if (propertyConfig?.options) {
      const filtered = propertyConfig.options.filter((option) =>
        option.name.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredOptions(filtered);
    }
  };

  // 選擇某個選項處理邏輯
  const handleSelectOption = (option: PropertyOption) => {
    setInputValue(option.name); // 將選項名稱設為選中的值
    setIsExpanded(false); // 收起選單
    onChange(option.name);
  };

  // 點擊外部關閉選單處理邏輯
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsExpanded(false);
    }
  };

  // useEffect 註冊點擊事件監聽器
  useEffect(() => {
    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div className="relative w-64" ref={dropdownRef}>
      {/* 展開按鈕 */}
      <button
        className="w-full text-sm p-2 border border-gray-700 bg-gray-800 text-gray-300 rounded"
        onClick={handleExpand}
        data-cy="property-select-input"
      >
        {formatToCapitalCase(inputValue) || "Select an option"}
      </button>

      {isExpanded && (
        <div className="absolute top-12 left-0 w-full z-50 bg-gray-800 border border-gray-700 rounded-md shadow-md">
          {/* 搜索框 */}
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Search or add an option"
            className="w-full border-b border-gray-700 p-2 bg-gray-800 text-gray-300 placeholder-gray-500 rounded-t-md"
          />

          {/* 選項列表 */}
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
