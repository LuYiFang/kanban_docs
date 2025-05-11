import React, { useCallback, useRef } from "react";
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

  const handleOverlayClick = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.save();
    editorRef.current.close();
    onClose();
  }, [taskId, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
      onClick={handleOverlayClick}
      data-cy="edit-dialog-backdrop"
    >
      <div className="w-3/4 max-h-[90vh]">
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
