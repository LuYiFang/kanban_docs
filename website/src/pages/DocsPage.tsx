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
import { MultiChipLabel } from "../components/Label/Labels";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faTimes } from "@fortawesome/free-solid-svg-icons"; // 新增引入 faSave
import Fuse from "fuse.js";
import { generateTask } from "../utils/kanbanUtils";
import { defaultDocsProperties } from "../types/property";
import AddTaskButton from "../components/Kanban/AddTaskButton";

const ResponsiveGridLayout = WidthProvider(Responsive);

const CARD_WIDTH = 6;
const CARD_HEIGHT = 16;

const DocsPage: React.FC = () => {
  const [pinnedItems, setPinnedItems] = useState<TaskWithProperties[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [searchItems, setSearchItems] = useState<TaskWithProperties[]>([]);
  const [layouts, setLayouts] = useState<Layouts>({});
  const [newItemId, setNewItemId] = useState<string>("");
  const [isDocsLayoutLoaded, setIsDocsLayoutLoaded] = useState(false); // 新增标志变量

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
      setPinnedItems(
        docsLayout.lg
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

  const fuse = useMemo(() => {
    return new Fuse(allItems, {
      keys: [
        { name: "title", getFn: (doc) => doc.title },
        { name: "content", getFn: (doc) => doc.content },
        {
          name: "propertiesValue",
          getFn: (doc) =>
            _.map(doc.properties, (p) => {
              if (_.isArray(p.value)) {
                return _.map(p.value, (v) => propertyOptionsIdNameMap[v]).join(
                  ",",
                );
              }
              return propertyOptionsIdNameMap[p.value];
            }),
        },
      ],
      threshold: 0.3,
    });
  }, [allItems]);

  const allTags = useMemo(() => {
    return Array.from(
      new Set(
        allItems
          .flatMap(
            (item) =>
              item.properties.find((property) => property.name === "tags")
                ?.value || [],
          )
          .filter((tag) => tag),
      ),
    ).sort();
  }, [allItems]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    filteredSearch();
  };

  const filteredSearch = _.debounce(() => {
    setSearchItems(fuse.search(searchTerm).map((result) => result.item));
  }, 500);

  const handleTagSearch = (tagName: string) => {
    if (!tagName) return;

    const invertedMap = _.invert(propertyOptionsIdNameMap);
    const tagId = invertedMap[tagName];
    if (tagId === selectedTag) {
      setSelectedTag("");
      setSearchItems([]);
      return;
    }
    setSelectedTag(tagId);

    setSearchItems(
      allItems.filter((item) =>
        item.properties
          .find((property) => property.name === "tags")
          ?.value.includes(tagId),
      ),
    );
  };

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
    dispatch(saveLayout(layouts));
  };

  const handleAddDoc = () => {
    const newTask = generateTask(defaultDocsProperties, "docs", 0);
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
  return (
    <div className="p-4 bg-gray-900 text-gray-300 h-full relative flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Documents</h1>
      <AddTaskButton onClick={handleAddDoc} />
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
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 w-1/3 border rounded bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-cy="search-input"
        />
      </div>
      <div className="mb-6">
        <div className="flex flex-wrap gap-2" data-cy="all-tags">
          <MultiChipLabel
            propertyName={"tags"}
            propertyValues={_.map(
              allTags,
              (tag) => propertyOptionsIdNameMap[tag],
            )}
            onClick={handleTagSearch}
          />
        </div>
      </div>
      {searchItems.length > 0 && (
        <div className="mb-4 relative" data-cy="show-docs-result">
          <button
            className="absolute p-0 top-2 right-6 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-600"
            onClick={() => setSearchItems([])}
            data-cy="clear-search-results"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div
            className="bg-gray-800 p-2 rounded max-h-72 overflow-auto"
            data-cy="tag-documents"
          >
            {searchItems.map((doc) => {
              let alreadyPinned = false;
              if (
                _.includes(
                  pinnedItems.map((item) => item.id),
                  doc.id,
                )
              ) {
                alreadyPinned = true;
              }

              return (
                <div
                  key={doc.id}
                  className={`p-1.5 border-b border-gray-700 ${alreadyPinned ? "bg-gray-700" : "bg-gray-800"} hover:bg-gray-600 cursor-pointer`}
                  onClick={() => handleSelectDoc(doc.id)}
                >
                  {doc.title}
                </div>
              );
            })}
          </div>
        </div>
      )}
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
              className="relative"
              data-cy={`doc-card-id-${doc.id}`}
            >
              {/* Top draggable handle */}
              <div
                className="absolute top-0 left-0 right-0 h-8 draggable-handle"
                data-cy={"doc-drag-top"}
              ></div>
              {/* Bottom draggable handle */}
              <div
                className="absolute bottom-0 left-0 right-0 h-8 draggable-handle"
                data-cy={"doc-drag-bottom"}
              ></div>
              {/* Left draggable handle */}
              <div
                className="absolute top-0 bottom-0 left-0 w-8 draggable-handle"
                data-cy={"doc-drag-left"}
              ></div>
              {/* Right draggable handle */}
              <div
                className="absolute top-0 bottom-0 right-0 w-6 draggable-handle"
                data-cy={"doc-drag-right"}
              ></div>

              <button
                className="z-20 absolute top-0.5 right-6 ml-2 w-5 h-5 p-0 flex items-center justify-center rounded-full text-gray-100 hover:bg-gray-300 hover:bg-opacity-80 text-[10px]"
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
              />
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DocsPage;
