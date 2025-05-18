import React, { useEffect, useMemo, useState } from "react";
import { Layout, Layouts, Responsive, WidthProvider } from "react-grid-layout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { getAllTaskWithProperties } from "../store/slices/kanbanThuck";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { TaskWithProperties } from "../types/task";
import Card from "../components/Card/Card";
import _ from "lodash";
import { MultiChipLabel } from "../components/Label/Labels";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Fuse from "fuse.js";

const ResponsiveGridLayout = WidthProvider(Responsive);

const CARD_WIDTH = 6;
const CARD_HEIGHT = 16;
const ROW_HEIGHT = 6;

const DocsPage: React.FC = () => {
  const [pinnedDocs, setPinnedDocs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchDocs, setSearchDocs] = useState<TaskWithProperties[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");

  const dispatch = useDispatch<AppDispatch>();
  const documents: TaskWithProperties[] = useSelector(
    (state: RootState) => state.kanban.docs,
  );
  const propertySetting = useSelector(
    (state: RootState) => state.kanban.propertySetting,
  );

  useEffect(() => {
    dispatch(getAllTaskWithProperties({ taskType: "docs" }));
  }, [dispatch]);

  const layout: Layouts = useMemo(() => {
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
  }, [pinnedDocs]);

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
            _.map(doc.properties, (p) => propertyOptionsIdNameMap[p.value]),
        },
      ],
      threshold: 0.3,
    });
  }, [documents]);

  const filteredSearch = _.debounce(() => {
    setSearchDocs(fuse.search(searchTerm).map((result) => result.item));
  }, 800);

  const documentsByTag = useMemo(() => {
    if (!selectedTag) return [];

    return documents.filter((doc) =>
      doc.properties
        .find((property) => property.name === "tags")
        ?.value.includes(selectedTag),
    );
  }, [selectedTag, documents]);

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
    setShowDropdown(value.trim() !== "");
    filteredSearch();
  };

  return (
    <div className="p-4 bg-gray-900 text-gray-300 h-full relative  flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Documents</h1>
      <div className="absolute top-4 right-4 w-1/3">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 w-full border rounded bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {showDropdown && (
          <div className="absolute bg-white border rounded shadow-md w-full max-h-40 overflow-y-auto z-10 mt-1">
            {searchDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  setSearchTerm(doc.title);
                  setShowDropdown(false);
                }}
              >
                {doc.title}
              </div>
            ))}
            {searchDocs.length === 0 && (
              <div className="p-2 text-gray-500">No results found</div>
            )}
          </div>
        )}
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Tags</h2>
        <div className="flex flex-wrap gap-2">
          <MultiChipLabel
            propertyName={"tags"}
            propertyValues={_.map(
              allTags,
              (tag) => propertyOptionsIdNameMap[tag],
            )}
            onClick={(tagName) => {
              const invertedMap = _.invert(propertyOptionsIdNameMap);
              const tagId = invertedMap[tagName];
              if (tagId === selectedTag) {
                setSelectedTag("");
                return;
              }
              setSelectedTag(tagId);
            }}
          />
        </div>
      </div>
      {selectedTag && (
        <div className="mb-4">
          <div className="bg-gray-800 p-2 rounded max-h-72 overflow-auto">
            {documentsByTag.map((doc) => {
              let alreadyPinned = false;
              if (_.includes(pinnedDocs, doc.id)) {
                alreadyPinned = true;
              }

              return (
                <div
                  key={doc.id}
                  className={`p-1.5 border-b border-gray-700 ${alreadyPinned ? "bg-gray-700" : "bg-gray-800"} hover:bg-gray-600 cursor-pointer`}
                  onClick={() => {
                    setPinnedDocs((pre) =>
                      pre.includes(doc.id)
                        ? pre.filter((id) => id !== doc.id)
                        : [...pre, doc.id],
                    );
                  }}
                >
                  {doc.title}
                </div>
              );
            })}
            {documentsByTag.length === 0 && (
              <div className="p-2 text-gray-500">No documents found</div>
            )}
          </div>
        </div>
      )}
      <ResponsiveGridLayout
        className="layout bg-gray-800 flex-grow overflow-auto"
        layouts={layout}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        isResizable={true}
        isDraggable={true}
      >
        {pinnedDocs.map((docId) => {
          const doc = documents.find((doc) => doc.id === docId);
          if (!doc) return null;

          return (
            <div key={doc.id.toString()}>
              <button
                className="z-20 absolute top-0.5 right-6 ml-2 w-5 h-5 p-0 flex items-center justify-center rounded-full text-gray-100 hover:bg-gray-300 hover:bg-opacity-80 text-[10px]"
                onClick={() => {
                  setSearchTerm("");
                  setShowDropdown(false);
                }}
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
