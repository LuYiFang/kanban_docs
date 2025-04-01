import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH, faUser } from "@fortawesome/free-solid-svg-icons";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { propertyDefinitions } from "../../types/property";
import _ from "lodash";
import {
  deleteTask,
  updateProperty,
  updateTask,
} from "../../store/slices/kanbanThuck";
import { RootState } from "../../store/store";

interface EditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  columnId: string;
  taskId: string;
}

const EditDialog: React.FC<EditDialogProps> = ({ isOpen, onClose, taskId }) => {
  const dispatch = useDispatch();
  const task = useSelector((state: RootState) => {
    return state.kanban.tasks.find((t) => t.id === taskId) || {};
  });
  const [title, setTitle] = useState(task.title);
  const [content, setContent] = useState(task.content);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(task.title);
      setContent(task.content);
    }
  }, [isOpen, task]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const propertyMap = useMemo(() => {
    return _.mapValues(_.groupBy(task.properties, "name"), _.first);
  }, [task.properties]);

  const handlePropertyChange = (property: string, value: string) => {
    const propertyId = propertyMap[property.toLowerCase()]?.id;
    if (!propertyId) return;
    dispatch(updateProperty({ taskId: task.id, propertyId, property, value }));
  };

  const handleDeleteTask = () => {
    onClose();
    setIsMenuOpen(false);
    dispatch(deleteTask({ taskId }));
  };

  if (!isOpen) return null;

  const handleOverlayClick = () => {
    dispatch(
      updateTask({
        taskId,
        task: {
          title,
          content,
        },
      }),
    );
    setIsMenuOpen(false);
    onClose();
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-gray-900 p-6 rounded shadow-lg w-3/4 h-4/5 flex flex-col space-y-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4">
          <FontAwesomeIcon
            icon={faEllipsisH}
            className="text-gray-400 cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
          {isMenuOpen && (
            <div
              ref={menuRef}
              className="absolute top-8 right-0 bg-gray-800 shadow rounded p-1 text-sm whitespace-nowrap"
            >
              <button
                className="text-gray-200 hover:text-red-600"
                onClick={handleDeleteTask}
              >
                Delete Task
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <h2 className="text-lg font-bold text-gray-200 mb-2">Edit Title</h2>
          <input
            type="text"
            className="w-full text-lg p-2 border border-gray-700 bg-gray-800 text-gray-300 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task Title"
          />
        </div>

        {/* Properties */}
        <div>
          <h3 className="text-lg font-bold text-gray-200 mb-2">Properties</h3>
          <div className="flex flex-col space-y-1">
            {Object.entries(propertyDefinitions).map(([_key, config]) => {
              const key = _key.toLowerCase();
              const value = propertyMap[key]?.value || "";
              const onChange = (e) => handlePropertyChange(key, e.target.value);

              return (
                <div key={key} className="flex items-center space-x-2">
                  <span className="w-24 text-sm text-gray-300">{key}:</span>{" "}
                  {config.type === "select" && (
                    <select
                      className="w-1/3 text-sm p-1 border border-gray-700 bg-gray-800 text-gray-300 rounded"
                      value={value}
                      onChange={onChange}
                    >
                      {config.options?.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {config.type === "member" && (
                    <div className="flex items-center space-x-2 w-1/3">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="w-4 h-4 text-gray-300"
                      />
                      <input
                        type="text"
                        className="w-full text-sm p-1 border border-gray-700 bg-gray-800 text-gray-300 rounded"
                        value={value}
                        onChange={onChange}
                      />
                    </div>
                  )}
                  {config.type === "date" && (
                    <input
                      type="date"
                      className="w-1/3 text-sm p-1 border border-gray-700 bg-gray-800 text-gray-300 rounded"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                  {config.type === "readonly" && (
                    <span className="w-1/3 text-sm text-gray-400">{value}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Markdown Input & Preview (side-by-side) */}
        <div className="flex space-x-4 flex-1">
          {/* Markdown Input */}
          <textarea
            className="flex-1 h-full border border-gray-700 bg-gray-800 text-gray-300 p-3 rounded text-sm resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter Markdown content here..."
          />

          {/* Markdown Preview */}
          <div className="flex-1 h-full border border-gray-700 bg-gray-800 text-gray-300 p-3 rounded overflow-auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDialog;
