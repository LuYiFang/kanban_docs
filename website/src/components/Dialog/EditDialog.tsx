import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateTask, updateProperty } from "../../store/slices/kanbanSlice";
import ReactMarkdown from "react-markdown";

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
        className="bg-gray-900 p-6 rounded shadow-lg w-3/4 h-4/5 flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 左側編輯區 */}
        <div className="w-1/2 flex flex-col space-y-4 pr-6">
          {/* 標題編輯 */}
          <div>
            <h2 className="text-xl font-bold text-gray-200 mb-2">Edit Title</h2>
            <input
              type="text"
              className="w-full p-3 border border-gray-700 bg-gray-800 text-gray-300 rounded text-lg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title"
            />
          </div>

          {/* 屬性編輯 */}
          <div>
            <h3 className="text-lg font-bold text-gray-200 mb-2">Properties</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <span className="w-32 text-gray-300">Priority:</span>
                <select
                  className="flex-1 p-2 border border-gray-700 bg-gray-800 text-gray-300 rounded"
                  value={properties.Priority}
                  onChange={(e) =>
                    handlePropertyChange("Priority", e.target.value)
                  }
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div className="flex items-center">
                <span className="w-32 text-gray-300">Status:</span>
                <select
                  className="flex-1 p-2 border border-gray-700 bg-gray-800 text-gray-300 rounded"
                  value={properties.Status}
                  onChange={(e) =>
                    handlePropertyChange("Status", e.target.value)
                  }
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>
              <div className="flex items-center">
                <span className="w-32 text-gray-300">Deadline:</span>
                <input
                  type="date"
                  className="flex-1 p-2 border border-gray-700 bg-gray-800 text-gray-300 rounded"
                  value={properties.Deadline}
                  onChange={(e) =>
                    handlePropertyChange("Deadline", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Markdown 編輯 */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-gray-200 mb-2">Content</h3>
            <textarea
              className="flex-1 border border-gray-700 bg-gray-800 text-gray-300 p-3 rounded text-lg resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter Markdown content here..."
            />
          </div>
        </div>

        {/* 右側 Markdown 預覽區 */}
        <div className="w-1/2 bg-gray-800 p-4 rounded shadow overflow-auto">
          <h3 className="text-lg font-bold text-gray-200 mb-4">Preview</h3>
          <div className="text-gray-300">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDialog;
