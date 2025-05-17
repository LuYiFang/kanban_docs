import React, { useEffect, useMemo, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { getAllTaskWithProperties } from "../store/slices/kanbanThuck";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { TaskWithProperties } from "../types/task";
import Card from "../components/Card/Card";
import _ from "lodash";

const ResponsiveGridLayout = WidthProvider(Responsive);

const CARD_WIDTH = 4;
const CARD_HEIGHT = 8;
const ROW_HEIGHT = 6;

const DocsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
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

  const layout = useMemo(() => {
    const createLayout = (breakpointCols: number) => {
      return documents.map((doc, index) => ({
        i: doc.id.toString(),
        x: (index % breakpointCols) * CARD_WIDTH,
        y: Math.floor(index / breakpointCols) * ROW_HEIGHT,
        w: CARD_WIDTH,
        h: CARD_HEIGHT,
      }));
    };

    return {
      lg: createLayout(12),
      md: createLayout(10),
      sm: createLayout(6),
      xs: createLayout(4),
      xxs: createLayout(2),
    };
  }, [documents]);

  const filteredDocuments = documents.filter((doc) =>
    doc.properties
      .find((property) => property.name === "title")
      ?.value.toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const documentsByTag = selectedTag
    ? documents.filter((doc) =>
        doc.properties
          .find((property) => property.name === "tags")
          ?.value.includes(selectedTag),
      )
    : [];

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

  return (
    <div className="p-4 bg-gray-900 text-gray-300 h-full relative  flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Documents</h1>
      <div className="absolute top-4 right-4 w-1/3">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(e.target.value.trim() !== "");
          }}
          className="p-2 w-full border rounded bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {showDropdown && (
          <div className="absolute bg-white border rounded shadow-md w-full max-h-40 overflow-y-auto z-10 mt-1">
            {filteredDocuments.map((doc) => (
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
            {filteredDocuments.length === 0 && (
              <div className="p-2 text-gray-500">No results found</div>
            )}
          </div>
        )}
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <span
              key={tag}
              className={`px-3 py-1 rounded text-sm cursor-pointer ${
                selectedTag === tag
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-100"
              }`}
              onClick={() => setSelectedTag(tag)}
            >
              {propertyOptionsIdNameMap[tag]}
            </span>
          ))}
        </div>
      </div>
      {selectedTag && (
        <div className="mb-4">
          <h3 className="text-md font-semibold mb-2">
            Documents with tag: {selectedTag}
          </h3>
          <div className="bg-gray-800 p-2 rounded">
            {documentsByTag.map((doc) => (
              <div key={doc.id} className="p-2 border-b border-gray-700">
                {doc.title}
              </div>
            ))}
            {documentsByTag.length === 0 && (
              <div className="p-2 text-gray-500">No documents found</div>
            )}
          </div>
        </div>
      )}
      <ResponsiveGridLayout
        className="layout bg-gray-800 flex-grow"
        layouts={layout}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        isResizable={true}
        isDraggable={true}
      >
        {documents.map((doc) => (
          <div key={doc.id.toString()}>
            <Card
              task={doc}
              cardVisibleProperties={["title", "tags", "content"]}
              propertyOptionsIdNameMap={propertyOptionsIdNameMap}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DocsPage;
