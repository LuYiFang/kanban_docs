import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH, faUser } from "@fortawesome/free-solid-svg-icons";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkImages from "remark-images";
import remarkBreaks from "remark-breaks";
import _ from "lodash";
import moment from "moment";
import {
  deleteTask,
  updateProperty,
  updateTask,
  uploadFile,
} from "../../store/slices/kanbanThuck";
import { AppDispatch, RootState } from "../../store/store";
import InteractiveSelect from "../Select/InteractiveSelect";
import { formatToCapitalCase } from "../../utils/tools";
import { TaskWithProperties } from "../../types/task";
import {
  Property,
  PropertyConfig as PropertyConfigType,
} from "../../types/property";
import { kanbanDataName } from "../../types/kanban";
import apiClient from "../../utils/apiClient";

interface EditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  dataName: kanbanDataName;
  propertyOrder: string[];
  type: string;
}

const EditDialog: React.FC<EditDialogProps> = ({
  isOpen,
  onClose,
  taskId,
  dataName,
  propertyOrder,
  type,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const task: TaskWithProperties = useSelector((state: RootState) => {
    return (
      (state.kanban[dataName] as TaskWithProperties[]).find(
        (t) => t.id === taskId,
      ) || {
        id: "",
        title: "",
        content: "",
        type: "",
        order: 0,
        properties: [],
      }
    );
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(task.title);
      setContent(task.content);
    }
  }, [isOpen, task.title, task.content]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const propertyMap = useMemo(
    () =>
      _.mapValues(
        _.groupBy(task.properties, "name"),
        (group) => _.first(group) as Property,
      ),
    [task.properties],
  );

  const propertyConfig = useSelector(
    (state: RootState) => state.kanban.propertySetting,
  );

  const propertyConfigMap = useMemo(
    () =>
      _.mapValues(
        _.groupBy(propertyConfig, "name"),
        (group) => _.first(group) as PropertyConfigType,
      ),
    [propertyConfig],
  );

  const handlePropertyChange = useCallback(
    (property: string, value: string) => {
      const propertyId = propertyMap[property.toLowerCase()]?.id;
      if (!propertyId) return;
      dispatch(
        updateProperty({ taskId: task.id, propertyId, property, value }),
      );
    },
    [dispatch, propertyMap, task.id],
  );

  const formatDateTimeLocal = useCallback(
    (date: string) => (date ? moment(date).format("YYYY-MM-DDTHH:mm") : ""),
    [],
  );

  const handleDeleteTask = useCallback(() => {
    onClose();
    setIsMenuOpen(false);
    dispatch(deleteTask({ taskId }));
  }, [dispatch, onClose, taskId]);

  const handleOverlayClick = useCallback(() => {
    dispatch(
      updateTask({
        taskId,
        task: {
          ...task,
          title,
          content,
        },
      }),
    );
    setIsMenuOpen(false);
    onClose();
  }, [dispatch, taskId, task, title, content, onClose]);

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value),
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const target = e.target as HTMLTextAreaElement;
        const start = target.selectionStart;
        const end = target.selectionEnd;

        const newValue =
          target.value.substring(0, start) + "\t" + target.value.substring(end);
        setContent(newValue);

        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1;
        }, 0);
      }
    },
    [],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            const formData = new FormData();
            formData.append("file", file);

            dispatch(uploadFile(formData))
              .unwrap()
              .then((response) => {
                const imageUrl = `${apiClient.defaults.baseURL}${response.url}`; // 加上 apiClient 的 host
                setContent(
                  (prevContent) =>
                    `${prevContent}\n![Pasted Image](${imageUrl})`,
                );
              })
              .catch((error) => {
                console.error("Image upload failed:", error);
              });
          }
        }
      }
    },
    [dispatch],
  );

  if (!isOpen) return null;

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
        {/* Menu */}
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
              const onChange = (newValue: string) =>
                handlePropertyChange(key, newValue);

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
                      <InteractiveSelect
                        taskId={taskId}
                        propertyName={key}
                        dataName={dataName}
                        onChange={onChange}
                      />
                    )}
                    {propertyType === "date" && (
                      <input
                        type="datetime-local"
                        className="w-1/3 text-sm p-1 border border-gray-700 bg-gray-800 text-gray-300 rounded"
                        value={formatDateTimeLocal(value)}
                        onChange={(e) => onChange(e.target.value)}
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

        {/* Markdown Input & Preview */}
        <div className="flex space-x-4 flex-1 min-h-[350px] h-full">
          <textarea
            className="flex-1 min-h-[350px] h-full border border-gray-700 bg-gray-800 text-gray-300 p-3 rounded text-sm resize-none"
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Enter Markdown content here..."
            data-cy="property-content-input"
          />
          <div
            className="flex-1 min-h-[350px] h-full border border-gray-700 bg-gray-800 text-gray-300 p-3 rounded overflow-auto"
            data-cy={"markdown-preview"}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks, remarkImages]}
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
