import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateTask } from "../../store/slices/kanbanSlice";
import ReactMarkdown from "react-markdown";

interface EditDialogProps {
    isOpen: boolean;
    onClose: () => void;
    columnId: string;
    taskId: string;
    initialTitle: string;
    initialContent: string;
}

const EditDialog: React.FC<EditDialogProps> = ({
                                                   isOpen,
                                                   onClose,
                                                   columnId,
                                                   taskId,
                                                   initialTitle,
                                                   initialContent,
                                               }) => {
    const dispatch = useDispatch();
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => {
            dispatch(updateTask({ columnId, taskId, updatedTitle: title, updatedContent: content }));
        }, 500); // 延遲儲存，避免頻繁操作
        return () => clearTimeout(timer);
    }, [title, content, isOpen, dispatch, columnId, taskId]);

    if (!isOpen) return null;

    const handleOverlayClick = () => {
        dispatch(updateTask({ columnId, taskId, updatedTitle: title, updatedContent: content }));
        onClose();
    };

    return (
        <div
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-gray-900 p-6 rounded shadow-lg w-4/5 h-3/4 flex"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-1/2 pr-4 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-200 mb-4">Edit Card</h2>
                    <input
                        type="text"
                        className="w-full mb-4 p-2 border border-gray-700 bg-gray-800 text-gray-300 rounded"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Card Title"
                    />
                    <textarea
                        className="flex-1 border border-gray-700 bg-gray-800 text-gray-300 p-3 rounded text-lg resize-none"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter Markdown content here..."
                    />
                </div>

                <div className="w-1/2 pl-4 bg-gray-800 p-4 rounded shadow">
                    <h3 className="text-lg font-bold text-gray-200">Preview</h3>
                    <div className="text-gray-300 overflow-auto h-64">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditDialog;