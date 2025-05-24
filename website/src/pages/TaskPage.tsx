import React, { useEffect, useRef } from "react";
import Editor, { EditorMethods } from "../components/Editor/Editor";
import { useLocation } from "react-router";
import { taskPropertyOrder } from "../types/property";
import { getAllTaskWithProperties } from "../store/slices/kanbanThuck";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { DataType } from "../types/kanban";

const TaskPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const editorRef = useRef<EditorMethods>(null);

  const location = useLocation();

  const taskId = location.pathname.split("/").pop() || "";

  useEffect(() => {
    dispatch(getAllTaskWithProperties({ taskType: DataType.TASK }));
  }, []);

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
