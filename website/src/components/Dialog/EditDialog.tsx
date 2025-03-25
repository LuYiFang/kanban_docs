import React, { useState } from "react";

interface EditDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedTitle: string, updatedContent: string) => void;
    initialTitle: string;
    initialContent: string;
}
const EditDialog: React.FC<EditDialogProps> = ({
                                                   isOpen,
                                                   onClose,
                                                   onSave,
                                                   initialTitle,
                                                   initialContent,
                                               }) => {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);

    if (!isOpen) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-900 p-6 rounded shadow-lg w-1/3">
                <h2 className="text-xl font-bold text-gray-200 mb-4">Edit Card</h2>
                <input
                    type="text"
                    className="w-full mb-4 p-2 border border-gray-700 bg-gray-800 text-gray-300 rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Card Title"
                />
                <textarea
                    className="w-full h-32 border border-gray-700 bg-gray-800 text-gray-300 p-2 rounded"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Card Content"
                />
                <div className="flex justify-end mt-4">
                    <button
                        className="px-4 py-2 bg-gray-700 text-gray-300 rounded mr-2"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                        onClick={() => onSave(title, content)}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
export default EditDialog;