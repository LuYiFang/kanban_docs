import React, { useEffect, useMemo, useState } from "react";
import { Layout, Layouts, Responsive, WidthProvider } from "react-grid-layout";
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
const ROW_HEIGHT = 6;

const DocsPage: React.FC = () => {
  const [pinnedDocs, setPinnedDocs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [searchDocs, setSearchDocs] = useState<TaskWithProperties[]>([]);
  const [layouts, setLayouts] = useState<Layouts>({});

  const dispatch = useDispatch<AppDispatch>();
  const documents: TaskWithProperties[] = useSelector(
    (state: RootState) => state.kanban.docs,
  );
  const propertySetting = useSelector(
    (state: RootState) => state.kanban.propertySetting,
  );
  const docsLayout = useSelector((state: RootState) => state.kanban.docsLayout);

  useEffect(() => {
    dispatch(getAllTaskWithProperties({ taskType: "docs" }));
    dispatch(getLayout());
  }, [dispatch]);

  useEffect(() => {
    const newDocId = _.first(
      _.difference(
        documents.map((doc) => doc.id),
        pinnedDocs,
      ),
    );
    if (!newDocId) return;

    let maxY = 0;
    _.each(layouts, (layout) => {
      const maxLayout = _.maxBy(layout, "y");
      if (maxLayout) {
        maxY = Math.max(maxY, maxLayout.y);
      }
    });

    setLayouts(
      _.mapValues(layouts, (layout) => {
        return [
          ...layout,
          {
            i: newDocId,
            x: 0,
            y: maxY,
            w: CARD_WIDTH,
            h: CARD_HEIGHT,
            resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
            static: false,
          },
        ];
      }) as Layouts,
    );

    setPinnedDocs((pre) => [...pre, newDocId]);
  }, [documents]);

  const generateLayout = () => {
    const createLayout = (breakpointCols: number): Layout[] => {
      return pinnedDocs.map((docId, index) => {
        return {
          i: docId,
          x: (index % breakpointCols) * CARD_WIDTH,
          y: Math.floor(index / breakpointCols) * ROW_HEIGHT,
          w: CARD_WIDTH,
          h: CARD_HEIGHT,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          static: false,
        };
      });
    };

    return {
      lg: createLayout(12),
      md: createLayout(10),
      sm: createLayout(6),
      xs: createLayout(4),
      xxs: createLayout(2),
    };
  };

  useEffect(() => {
    if (!docsLayout || !_.keys(docsLayout).length) {
      setLayouts(generateLayout());
      return;
    }

    setLayouts(docsLayout);
    setPinnedDocs(docsLayout.lg.map((item) => item.i));
  }, [docsLayout]);

  const propertyOptionsIdNameMap = useMemo(() => {
    const taskIdTitleMap = _.reduce(
      documents,
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
  }, [documents, propertySetting]);

  const fuse = useMemo(() => {
    return new Fuse(documents, {
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
  }, [documents]);

  const allTags = useMemo(() => {
    return Array.from(
      new Set(
        documents
          .flatMap(
            (doc) =>
              doc.properties.find((property) => property.name === "tags")
                ?.value || [],
          )
          .filter((tag) => tag),
      ),
    ).sort();
  }, [documents]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    filteredSearch();
  };

  const filteredSearch = _.debounce(() => {
    setSearchDocs(fuse.search(searchTerm).map((result) => result.item));
  }, 800);

  const handleTagSearch = (tagName: string) => {
    if (!tagName) return;

    const invertedMap = _.invert(propertyOptionsIdNameMap);
    const tagId = invertedMap[tagName];
    if (tagId === selectedTag) {
      setSelectedTag("");
      setSearchDocs([]);
      return;
    }
    setSelectedTag(tagId);

    setSearchDocs(
      documents.filter((doc) =>
        doc.properties
          .find((property) => property.name === "tags")
          ?.value.includes(tagId),
      ),
    );
  };

  const handleSelectDoc = (docId: string) => {
    setPinnedDocs((pre) =>
      pre.includes(docId) ? pre.filter((id) => id !== docId) : [...pre, docId],
    );
  };

  const UnpinnedDocs = (docId: string) => {
    setPinnedDocs(pinnedDocs.filter((id) => id !== docId));
  };

  const handleSaveLayout = () => {
    dispatch(saveLayout(layouts));
  };

  const handleAddDoc = () => {
    const newTask = generateTask(defaultDocsProperties, "docs", 0);
    dispatch(createTaskWithDefaultProperties(newTask));
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
      {searchDocs.length > 0 && (
        <div className="mb-4" data-cy="show-docs-result">
          <div
            className="bg-gray-800 p-2 rounded max-h-72 overflow-auto"
            data-cy="tag-documents"
          >
            {searchDocs.map((doc) => {
              let alreadyPinned = false;
              if (_.includes(pinnedDocs, doc.id)) {
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
          setLayouts(layouts);
        }}
      >
        {pinnedDocs.map((docId) => {
          const doc = documents.find((doc) => doc.id === docId);
          if (!doc) return null;

          return (
            <div
              key={doc.id}
              className="relative"
              data-cy={`doc-card-id-${docId}`}
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
                data-cy={`unpinned-${docId}`}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>

              <Card
                task={doc}
                cardVisibleProperties={["content"]}
                propertyOptionsIdNameMap={propertyOptionsIdNameMap}
                readonly={false}
              />
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DocsPage;
