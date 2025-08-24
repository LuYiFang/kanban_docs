import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretUp,
  faEllipsisH,
  faLink,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import _ from "lodash";
import { RootState } from "../../store/store";
import InteractiveSelect from "../Select/InteractiveSelect";
import MultiInteractiveSelect from "../Select/MultiInteractiveSelect";
import { formatToCapitalCase } from "../../utils/tools";
import { PropertyConfig as PropertyConfigType } from "../../types/property";
import { kanbanDataName } from "../../types/kanban";
import MarkdownEditor from "../Editor/MarkdownEditor";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { useEditor } from "./useEditor";
import CollapsibleSection from "../CollapsibleSection/CollapsibleSection";
import DropdownPortal from "../Dialog/DropdwonPortal";

export interface EditorConfig {
  titleExpanded: boolean;
}

interface EditorProps {
  taskId: string;
  dataName: kanbanDataName;
  propertyOrder: string[];
  readOnly: boolean;
  deleteTaskCallback?: () => void;
  onOpenLink?: (url: string) => void | null;
  config?: EditorConfig;
}

export interface EditorMethods {
  save: () => void;
  close: () => void;
}

const Editor = forwardRef<EditorMethods, EditorProps>(
  (
    {
      taskId,
      dataName,
      propertyOrder,
      readOnly,
      deleteTaskCallback,
      onOpenLink,
      config = {},
    },
    ref,
  ) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<MDXEditorMethods>(null);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const [isPropertiesExpanded, setIsPropertiesExpanded] = useState(false);
    const [isTitleExpanded, setIsTitleExpanded] = useState(
      typeof config.titleExpanded === "boolean" ? config.titleExpanded : true,
    );
    const [isSectionExpanded, setIsSectionExpanded] = useState(true);

    const positionRef = useRef<HTMLDivElement>(null);

    const {
      title,
      setTitle,
      content,
      handlePropertyChange,
      formatDateTimeLocal,
      handleDeleteTask,
      saveTask,
      delaySaveTask,
      propertyMap,
    } = useEditor(taskId, dataName, readOnly, () => {
      setIsMenuOpen(false);
      if (deleteTaskCallback) deleteTaskCallback();
    });

    useImperativeHandle(ref, () => ({
      save: () => saveTask(title, editorRef.current?.getMarkdown() || ""),
      close: () => {
        setIsMenuOpen(false);
      },
    }));

    useEffect(() => {
      const nextValue = isTitleExpanded || isPropertiesExpanded;

      if (nextValue) {
        // 立即更新為 true
        setIsSectionExpanded(true);
      } else {
        // 延遲更新為 false
        const delayedCollapse = _.debounce(() => {
          setIsSectionExpanded(false);
        }, 300);

        delayedCollapse();

        return () => delayedCollapse.cancel(); // 清除 debounce
      }
    }, [isTitleExpanded, isPropertiesExpanded]);

    const handleClickOutside = useCallback((event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }, []);

    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [handleClickOutside]);

    const handleCopyTaskUrl = () => {
      const taskUrl = `${window.location.origin}/task/${taskId}`;
      navigator.clipboard.writeText(taskUrl).then(() => {
        setIsTooltipVisible(true);
        setTimeout(() => setIsTooltipVisible(false), 2000);
      });
    };

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

    return (
      <div
        className="bg-gray-900 p-3 rounded shadow-lg w-full h-full flex flex-col  relative "
        onClick={(e) => e.stopPropagation()}
        data-cy="edit-dialog"
      >
        {/* Menu */}
        <div className="absolute top-4 right-4 flex items-center">
          {/* Copy Task URL */}
          <div className="relative  mr-2">
            <FontAwesomeIcon
              icon={faLink}
              className="text-gray-400 cursor-pointer"
              onClick={handleCopyTaskUrl}
              data-cy="copy-task-url-button"
            />
            {isTooltipVisible && (
              <div
                className="absolute top-8 right-0 bg-gray-700 shadow rounded p-1 text-sm text-gray-200 whitespace-nowrap"
                data-cy="copy-tooltip"
              >
                URL Copied!
              </div>
            )}
          </div>
          <FontAwesomeIcon
            icon={faEllipsisH}
            className="text-gray-400 cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-cy="edit-menu-trigger"
          />
          <div ref={positionRef} className="meee absolute" />
          <DropdownPortal
            positionRef={positionRef}
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            mode="left-bottom"
            className="absolute top-8 right-0 bg-gray-800 shadow rounded p-1 text-sm whitespace-nowrap"
          >
            <button
              className="text-gray-200 hover:text-red-600"
              onClick={() =>
                handleDeleteTask(editorRef.current?.getMarkdown() || "")
              }
              data-cy="delete-task-button"
            >
              Delete Task
            </button>
          </DropdownPortal>
        </div>
        {/* Title */}
        <div
          className={`flex justify-start ${isSectionExpanded ? "flex-col" : "flex-row"}`}
        >
          <div className="flex items-start ">
            <h3 className={`text-sm text-gray-200`}>Title</h3>
            <button
              className="text-sm text-gray-300 underline p-0 ml-2 mb-2 mr-1 w-6 h-6 rounded-full bg-transparent"
              onClick={() => setIsTitleExpanded(!isTitleExpanded)}
              data-cy="toggle-title"
            >
              <FontAwesomeIcon
                icon={isTitleExpanded ? faCaretUp : faCaretDown}
                className="text-gray-300"
              />
            </button>
          </div>
          <CollapsibleSection
            isCollapsed={!isTitleExpanded}
            maxHigh={"max-h-[40px]"}
          >
            <input
              type="text"
              className={`w-full text-lg p-1 pl-2 border border-gray-700 bg-gray-800 text-gray-300 rounded`}
              value={title}
              onChange={(e) => {
                delaySaveTask(e.target.value, null);
                setTitle(e.target.value);
              }}
              placeholder="Task Title"
              data-cy="title-input"
              disabled={readOnly}
            />
          </CollapsibleSection>

          {/* Properties */}
          <div
            className={`flex items-start  ${isTitleExpanded ? "mt-3" : "mt-0"}`}
          >
            <h3 className="text-sm text-gray-200 mb-2">Properties</h3>
            <button
              className="text-sm text-gray-300 underline p-0 ml-2 mb-2  w-6 h-6 rounded-full bg-transparent"
              onClick={() => setIsPropertiesExpanded(!isPropertiesExpanded)}
              data-cy="toggle-properties"
            >
              <FontAwesomeIcon
                icon={isPropertiesExpanded ? faCaretUp : faCaretDown}
                className="text-gray-300"
              />
            </button>
          </div>
        </div>
        <CollapsibleSection
          isCollapsed={!isPropertiesExpanded}
          maxHigh={"max-h-[900px]"}
        >
          <div className="flex flex-col space-y-1">
            {_.map(propertyOrder, (key) => {
              const title = formatToCapitalCase(key) || "";
              const value = propertyMap[key]?.value || "";
              const propertyType = propertyConfigMap[key]?.type || "";
              const onChange = (newValue: string | string[]) =>
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
                        readOnly={readOnly}
                      />
                    )}
                    {propertyType === "multi_select" && (
                      <MultiInteractiveSelect
                        taskId={taskId}
                        propertyName={key}
                        dataName={dataName}
                        onChange={(values) => onChange(values)}
                        readOnly={readOnly}
                      />
                    )}
                    {propertyType === "date" && (
                      <input
                        type="datetime-local"
                        className="w-1/3 text-sm p-1 border border-gray-700 bg-gray-800 text-gray-300 rounded"
                        value={formatDateTimeLocal(value as string)}
                        onChange={(e) => onChange(e.target.value)}
                        data-cy="property-date-input"
                        disabled={readOnly}
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
        </CollapsibleSection>
        <div
          className="flex space-x-4 flex-1 w-full  relative mt-3"
          data-cy="editor-content"
        >
          <MarkdownEditor
            ref={editorRef}
            readOnly={readOnly}
            content={content.current || ""}
            onChange={(value: string | null) => {
              delaySaveTask(null, value);
              content.current = value || "";
            }}
            onOpenLink={onOpenLink}
          />
        </div>
      </div>
    );
  },
);

export default Editor;
