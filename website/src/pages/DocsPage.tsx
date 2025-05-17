import React, { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const DocsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const documents = [
    {
      id: 1,
      name: "Project Plan.pdf",
      type: "PDF",
      tags: ["Planning", "Team"],
    },
    {
      id: 2,
      name: "Team Guidelines.docx",
      type: "Word",
      tags: ["Team", "Guidelines"],
    },
    { id: 3, name: "Budget.xlsx", type: "Excel", tags: ["Finance", "Budget"] },
    {
      id: 4,
      name: "Roadmap.pptx",
      type: "PowerPoint",
      tags: ["Planning", "Roadmap"],
    },
  ];

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const documentsByTag = selectedTag
    ? documents.filter((doc) => doc.tags.includes(selectedTag))
    : [];

  const allTags = Array.from(
    new Set(documents.flatMap((doc) => doc.tags)),
  ).sort();

  const layout = documents.map((doc, index) => ({
    i: doc.id.toString(),
    x: (index % 3) * 2, // 每行 3 個卡片
    y: Math.floor(index / 3) * 2,
    w: 2, // 卡片寬度
    h: 2, // 卡片高度
  }));

  return (
    <div className="p-4 bg-gray-900 text-gray-300 h-full relative">
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
                  setSearchTerm(doc.name);
                  setShowDropdown(false);
                }}
              >
                {doc.name}
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
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
            >
              {tag}
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
                {doc.name}
              </div>
            ))}
            {documentsByTag.length === 0 && (
              <div className="p-2 text-gray-500">No documents found</div>
            )}
          </div>
        </div>
      )}
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        isResizable={true}
        isDraggable={true}
      >
        {documents.map((doc) => (
          <div
            key={doc.id.toString()}
            className="border rounded bg-gray-100 p-2 flex items-center justify-center"
          >
            {doc.name} ({doc.type})
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DocsPage;
