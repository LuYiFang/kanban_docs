import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH, faUser } from "@fortawesome/free-solid-svg-icons";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import { propertyOrder } from "../../types/property";
import _ from "lodash";
import {
  deleteTask,
  updateProperty,
  updateTask,
} from "../../store/slices/kanbanThuck";
import { RootState } from "../../store/store";
import InteractiveSelect from "../Select/InteractiveSelect";
import { formatToCapitalCase } from "../../utils/tools";

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

  const propertyConfig = useSelector(
    (state: RootState) => state.kanban.propertySetting,
  );

  const propertyConfigMap = useMemo(() => {
    return _.mapValues(_.groupBy(propertyConfig, "name"), _.first);
  }, [propertyConfig]);

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

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    const formattedValue = inputValue.replace(/\n{2,}/g, (match) => {
      return "\n" + "<br/>".repeat(match.length - 1);
    });
    setContent(formattedValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      // 插入制表符
      const value = target.value;
      const newValue = value.substring(0, start) + "\t" + value.substring(end);

      // 更新內容並調整光標位置
      setContent(newValue);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1;
      }, 0);
    }
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
      onClick={handleOverlayClick}
      data-cy="edit-dialog-backdrop"
    >
      <div
        className="bg-gray-900 p-6 rounded shadow-lg w-3/4 max-h-[90vh] flex flex-col space-y-4 relative overflow-auto"
        onClick={(e) => e.stopPropagation()}
        data-cy="edit-dialog"
      >
        <div className="absolute top-4 right-4">
          <FontAwesomeIcon
            icon={faEllipsisH}
            className="text-gray-400 cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-cy="edit-menu-trigger"
          />
          {isMenuOpen && (
            <div
              ref={menuRef}
              className="absolute top-8 right-0 bg-gray-800 shadow rounded p-1 text-sm whitespace-nowrap"
              data-cy="edit-menu"
            >
              <button
                className="text-gray-200 hover:text-red-600"
                onClick={handleDeleteTask}
                data-cy="delete-task-button"
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
            data-cy="title-input"
          />
        </div>

        {/* Properties */}
        <div>
          <h3 className="text-lg font-bold text-gray-200 mb-2">Properties</h3>
          <div className="flex flex-col space-y-1">
            {_.map(propertyOrder, (key) => {
              const title = formatToCapitalCase(key) || "";
              const value = propertyMap[key]?.value || "";
              const propertyType = propertyConfigMap[key]?.type || "";
              const onChange = (e) => handlePropertyChange(key, e.target.value);

              return (
                <div key={key} className="flex items-center space-x-2">
                  {title.toLowerCase() === "assignee" && (
                    <FontAwesomeIcon
                      icon={faUser}
                      className="w-4 h-4 text-gray-300"
                    />
                  )}
                  <span
                    className="w-24 text-sm text-gray-300"
                    data-cy="property-select-title"
                  >
                    {title}:
                  </span>{" "}
                  <div className="flex items-center flex-1">
                    {propertyType === "select" && (
                      <InteractiveSelect taskId={taskId} propertyName={key} />
                    )}
                    {propertyType === "date" && (
                      <input
                        type="date"
                        className="w-1/3 text-sm p-1 border border-gray-700 bg-gray-800 text-gray-300 rounded"
                        value={value}
                        onChange={onChange}
                        data-cy="property-date-input"
                      />
                    )}
                    {propertyType === "readonly" && (
                      <span
                        className="w-1/3 text-sm text-gray-400"
                        data-cy="property-readonly"
                      >
                        {value}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Markdown Input & Preview (side-by-side) */}
        <div className="flex space-x-4 flex-1 min-h-[350px] h-full">
          {/* Markdown Input */}
          <textarea
            className="flex-1 min-h-[350px] h-full border border-gray-700 bg-gray-800 text-gray-300 p-3 rounded text-sm resize-none"
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter Markdown content here..."
            data-cy="property-content-input"
          />

          {/* Markdown Preview */}
          <div className="flex-1 min-h-[350px] h-full border border-gray-700 bg-gray-800 text-gray-300 p-3 rounded overflow-auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
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
