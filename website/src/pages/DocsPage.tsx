import React, { useEffect, useMemo, useState } from "react";
import { Layouts, Responsive, WidthProvider } from "react-grid-layout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import {
  createTaskWithDefaultProperties,
  getAllTaskWithProperties,
  getLayout,
  saveLayout,
} from "../store/slices/kanbanThuck";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { TaskWithProperties } from "../types/task";
import Card from "../components/Card/Card";
import _ from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark,
  faTimes,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { generateTask } from "../utils/kanbanUtils";
import { defaultDocsProperties } from "../types/property";
import AddTaskButton from "../components/Kanban/AddTaskButton";
import { isTaskUrl, readMarkdownFile, UUID_PATTERN } from "../utils/tools";
import SearchSelect from "../components/Select/SearchSelect";

const ResponsiveGridLayout = WidthProvider(Responsive);

const CARD_WIDTH = 6;
const CARD_HEIGHT = 16;

const DocsPage: React.FC = () => {
  const [pinnedItems, setPinnedItems] = useState<TaskWithProperties[]>([]);
  const [layouts, setLayouts] = useState<Layouts>({});
  const [newItemId, setNewItemId] = useState<string>("");
  const [isDocsLayoutLoaded, setIsDocsLayoutLoaded] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const allItems: TaskWithProperties[] = useSelector(
    (state: RootState) => state.kanban.all,
  );
  const propertySetting = useSelector(
    (state: RootState) => state.kanban.propertySetting,
  );
  const docsLayout = useSelector((state: RootState) => state.kanban.docsLayout);

  useEffect(() => {
    dispatch(getAllTaskWithProperties({ taskType: "all" }));
    dispatch(getLayout());
  }, [dispatch]);

  useEffect(() => {
    if (!isDocsLayoutLoaded && docsLayout && _.keys(docsLayout).length) {
      setLayouts(docsLayout);
      const recordedLayout = _.find(docsLayout, (layout) =>
        Boolean(_.isArray(layout) && layout.length),
      );
      if (!recordedLayout) return;

      setPinnedItems(
        recordedLayout
          .map((item) => allItems.find((doc) => doc.id === item.i)!)
          .filter(Boolean),
      );
      setIsDocsLayoutLoaded(true);
    }
  }, [docsLayout, allItems, isDocsLayoutLoaded]);

  const propertyOptionsIdNameMap = useMemo(() => {
    const taskIdTitleMap = _.reduce(
      allItems,
      (result, task) => {
        result[task.id] = task.title;
        return result;
      },
      {} as Record<string, string>,
    );

    const propertyIdNameMap = _.reduce(
      propertySetting,
      (result, property) => {
        _.each(property.options, (option) => {
          result[option.id] = option.name;
        });
        return result;
      },
      {} as Record<string, string>,
    );

    return _.merge({}, taskIdTitleMap, propertyIdNameMap);
  }, [allItems, propertySetting]);

  const handleSelectDoc = (docId: string) => {
    const doc = allItems.find((item) => item.id === docId);
    if (!doc) return;

    setPinnedItems((pre) =>
      pre.some((item) => item.id === docId)
        ? pre.filter((item) => item.id !== docId)
        : [...pre, doc],
    );

    if (!pinnedItems.some((item) => item.id === docId)) {
      setNewItemId(doc.id);
    }
  };

  const UnpinnedDocs = (docId: string) => {
    setPinnedItems(pinnedItems.filter((item) => item.id !== docId));
  };

  const handleSaveLayout = () => {
    dispatch(saveLayout(layouts))
      .unwrap()
      .then((result) => {
        if (result) {
          setShowSaveSuccess(true);
        } else {
          setShowSaveSuccess(false);
        }
        setTimeout(() => setShowSaveSuccess(null), 2000);
      });
  };

  const handleAddDoc = (title: string, content: string) => {
    const newTask = generateTask(defaultDocsProperties, "docs", 0);
    newTask.task.title = title;
    newTask.task.content = content;
    dispatch(createTaskWithDefaultProperties(newTask))
      .unwrap()
      .then((newItem) => {
        setNewItemId(newItem.id);
        setPinnedItems((pre) => [...pre, newItem]);
      });
  };

  const handleDeleteDoc = (docId: string) => {
    UnpinnedDocs(docId);
  };

  const handleImportMarkdown = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const markdownContent = await readMarkdownFile(file);
    handleAddDoc(file.name.replace(/\.[^/.]+$/, ""), markdownContent);
  };

  return (
    <div className="p-4 bg-gray-900 text-gray-300 h-full relative flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Documents</h1>
      <AddTaskButton onClick={() => handleAddDoc("", "")} />
      <button
        className="absolute top-4 right-20 w-12 h-12 bg-green-500 text-white rounded-full shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 flex items-center justify-center group"
        onClick={handleSaveLayout}
        id="save-layout-button"
      >
        <FontAwesomeIcon icon={faBookmark} />
        <span className="absolute top-full mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity">
          Save Layout
        </span>
      </button>
      {showSaveSuccess !== null && (
        <span className="z-50 absolute top-[68px] right-[56px] px-2 py-1 text-xs text-white bg-gray-700 rounded shadow-lg">
          {showSaveSuccess ? "Layout Saved!" : "Failed to Save Layout!"}
        </span>
      )}
      <input
        type="file"
        accept=".md"
        className="hidden"
        id="import-markdown-input"
        onChange={handleImportMarkdown}
      />
      <label
        htmlFor="import-markdown-input"
        id="import-markdown-input-label"
        className="absolute top-4 right-36 w-12 h-12 bg-yellow-500 text-white rounded-full shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 flex items-center justify-center group cursor-pointer"
      >
        <FontAwesomeIcon icon={faUpload} />
      </label>
      <SearchSelect
        allItems={allItems}
        propertyOptionsIdNameMap={propertyOptionsIdNameMap}
        onSelectDoc={handleSelectDoc}
        searchClass="w-1/3"
      />
      <ResponsiveGridLayout
        className="layout bg-gray-800 flex-grow overflow-auto"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        isResizable={true}
        isDraggable={true}
        onDragStart={() => console.log("Drag started")}
        draggableHandle={".draggable-handle"}
        onLayoutChange={(layout, layouts) => {
          setLayouts(
            _.mapValues(layouts, (layout) => {
              return _.map(layout, (item) => {
                if (item.i === newItemId) {
                  setNewItemId("");
                  return {
                    ...item,
                    w: CARD_WIDTH,
                    h: CARD_HEIGHT,
                    resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
                    static: false,
                  };
                }
                return item;
              });
            }) as Layouts,
          );
        }}
      >
        {pinnedItems.map((doc) => {
          if (!doc) return null;

          return (
            <div
              key={doc.id}
              className="relative border-2 border-gray-500 rounded-lg shadow-lg"
              data-cy={`doc-card-id-${doc.id}`}
            >
              <div
                className="absolute z-10 top-0 left-1 bg-gray-700 text-white text-xs px-2 py-1"
                data-cy={`doc-title-${doc.id}`}
              >
                {doc.title}
              </div>
              {/* Top draggable handle */}
              <div
                className="absolute z-40 top-3 left-3 right-[55px] h-8 draggable-handle bg-transparent"
                data-cy={"doc-drag-top"}
              ></div>
              {/* Bottom draggable handle */}
              <div
                className="absolute z-40 bottom-3 left-3 right-3 h-5 draggable-handle bg-transparent"
                data-cy={"doc-drag-bottom"}
              ></div>
              {/* Left draggable handle */}
              <div
                className="absolute z-40 top-3 bottom-3 left-3 w-5 draggable-handle bg-transparent"
                data-cy={"doc-drag-left"}
              ></div>
              {/* Right draggable handle */}
              <div
                className="absolute z-40 top-[55px] bottom-3 right-3 w-4 draggable-handle bg-transparent"
                data-cy={"doc-drag-right"}
              ></div>

              <button
                className="z-50 absolute top-0.5 right-6 ml-2 w-5 h-5 p-0 flex items-center justify-center rounded-full text-gray-100 hover:bg-gray-300 hover:bg-opacity-80 text-[10px]"
                onClick={() => UnpinnedDocs(doc.id)}
                data-cy={`unpinned-${doc.id}`}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>

              <Card
                task={doc}
                cardVisibleProperties={["content"]}
                propertyOptionsIdNameMap={propertyOptionsIdNameMap}
                readonly={false}
                deleteContentLabelTaskCallback={() => handleDeleteDoc(doc.id)}
                cardClass={"p-0"}
                onOpenLink={(url: string) => {
                  if (isTaskUrl(url)) {
                    const itemId = url.match(UUID_PATTERN)?.[0];
                    if (!itemId) return;
                    handleSelectDoc(itemId);
                  } else {
                    window.open(url, "_blank");
                  }
                }}
              />
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DocsPage;
