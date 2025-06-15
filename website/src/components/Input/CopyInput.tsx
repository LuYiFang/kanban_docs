import React, { useState } from "react";
import { faClone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface CopyInputProps {
  text: string;
}

const CopyInput: React.FC<CopyInputProps> = ({ text }) => {
  const [value, setValue] = useState(text);
  return (
    <div className="flex justify-between items-center bg-gray-700 p-1 rounded-md mb-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 bg-gray-700 text-s text-gray-300 p-1 rounded-md mr-2"
      />
      <button
        className="text-gray-300 hover:text-white w-8 h-8 p-1 bg-gray-600 hover:bg-gray-500 rounded-md"
        onClick={() => navigator.clipboard.writeText(value)}
      >
        <FontAwesomeIcon icon={faClone} />
      </button>
    </div>
  );
};

export default CopyInput;
