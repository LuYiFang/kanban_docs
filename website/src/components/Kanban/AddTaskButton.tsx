import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const AddTaskButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    className="fixed bottom-4 right-4 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 flex items-center justify-center"
    onClick={onClick}
    id="add-task-button"
  >
    <FontAwesomeIcon icon={faPlus} className="w-6 h-6" />
  </button>
);

export default AddTaskButton;
