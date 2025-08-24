import React, { useCallback, useRef, useState } from "react";
import { kanbanDataName } from "../../types/kanban";
import Editor, { EditorMethods } from "../Editor/Editor";

interface EditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  dataName: kanbanDataName;
  propertyOrder: string[];
  readOnly: boolean;
}

const EditDialog: React.FC<EditDialogProps> = ({
  isOpen,
  onClose,
  taskId,
  dataName,
  propertyOrder,
  readOnly,
}) => {
  const editorRef = useRef<EditorMethods>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleOverlayClick = useCallback(() => {
    if (isDragging || !editorRef.current) return;
    editorRef.current.save();
    editorRef.current.close();
    onClose();
  }, [isDragging, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onClick={handleOverlayClick}
      data-cy="edit-dialog-backdrop"
    >
      <div className="w-3/4 h-[90vh] overflow-auto flex bg-gray-900">
        <Editor
          ref={editorRef}
          taskId={taskId}
          dataName={dataName}
          propertyOrder={propertyOrder}
          readOnly={readOnly}
          deleteTaskCallback={onClose}
        />
      </div>
    </div>
  );
};

export default EditDialog;
