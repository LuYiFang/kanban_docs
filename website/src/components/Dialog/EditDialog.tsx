import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateTask, updateProperty } from "../../store/slices/kanbanSlice";
import ReactMarkdown from "react-markdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { propertyDefinitions } from "../../types/kanban";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface EditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  columnId: string;
  taskId: string;
  initialTitle: string;
  initialContent: string;
  initialProperties: { [key: string]: string };
}

const EditDialog: React.FC<EditDialogProps> = ({
  isOpen,
  onClose,
  columnId,
  taskId,
  initialTitle,
  initialContent,
  initialProperties,
}) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [properties, setProperties] = useState(initialProperties);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setContent(initialContent);
      setProperties(initialProperties);
    }
  }, [isOpen, initialTitle, initialContent, initialProperties]);

  const handlePropertyChange = (property: string, value: string) => {
    setProperties({ ...properties, [property]: value });
    dispatch(updateProperty({ columnId, taskId, property, value }));
  };

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      dispatch(
        updateTask({
          columnId,
          taskId,
          updatedTitle: title,
          updatedContent: content,
        }),
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [title, content, isOpen, dispatch, columnId, taskId]);

  if (!isOpen) return null;

  const handleOverlayClick = () => {
    dispatch(
      updateTask({
        columnId,
        taskId,
        updatedTitle: title,
        updatedContent: content,
      }),
    );
    onClose();
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-gray-900 p-6 rounded shadow-lg w-3/4 h-4/5 flex flex-col space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
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
            {Object.entries(propertyDefinitions).map(([key, config]) => (
              <div key={key} className="flex items-center space-x-2">
                <span className="w-24 text-sm text-gray-300">{key}:</span>{" "}
                {config.type === "select" && (
                  <select
                    className="w-1/3 text-sm p-1 border border-gray-700 bg-gray-800 text-gray-300 rounded" /* 限制寬度 */
                    value={properties[key] || ""}
                    onChange={(e) => handlePropertyChange(key, e.target.value)}
                  >
                    {config.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
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
                      value={properties[key] || ""}
                      onChange={(e) =>
                        handlePropertyChange(key, e.target.value)
                      }
                    />
                  </div>
                )}
                {config.type === "date" && (
                  <input
                    type="date"
                    className="w-1/3 text-sm p-1 border border-gray-700 bg-gray-800 text-gray-300 rounded"
                    value={properties[key] || ""}
                    onChange={(e) => handlePropertyChange(key, e.target.value)}
                  />
                )}
                {config.type === "readonly" && (
                  <span className="w-1/3 text-sm text-gray-400">
                    {properties[key] || "N/A"}
                  </span>
                )}
              </div>
            ))}
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
