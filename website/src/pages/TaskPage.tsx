import React, { useRef } from "react";
import Editor, { EditorMethods } from "../components/Editor/Editor";
import { useLocation } from "react-router";
import { taskPropertyOrder } from "../types/property";

const TaskPage: React.FC = () => {
  const editorRef = useRef<EditorMethods>(null);

  const location = useLocation();

  const taskId = location.pathname.split("/").pop() || "";

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 text-gray-300">
      <Editor
        ref={editorRef}
        taskId={taskId}
        dataName={"tasks"}
        propertyOrder={taskPropertyOrder}
        readOnly={false}
      />
    </div>
  );
};

export default TaskPage;
