import React, { useMemo, useState } from "react";
import Fuse from "fuse.js";
import _ from "lodash";
import { TaskWithProperties } from "../../types/task";
import { MultiChipLabel } from "../Label/Labels";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import CollapsibleSection from "../CollapsibleSection/CollapsibleSection";

interface SearchComponentProps {
  allItems: TaskWithProperties[];
  propertyOptionsIdNameMap: Record<string, string>;
  onSelectDoc: (docId: string) => void;
  searchClass?: string;
}

const SearchSelect: React.FC<SearchComponentProps> = ({
  allItems,
  propertyOptionsIdNameMap,
  onSelectDoc,
  searchClass = "",
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [searchItems, setSearchItems] = useState<TaskWithProperties[]>([]);

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
      clearSearch();
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

  const clearSearch = () => {
    setSearchTerm("");
    setSearchItems([]);
    setSelectedTag("");
  };

  return (
    <div>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={handleSearch}
          className={`p-2 border rounded bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${searchClass}`}
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

      <CollapsibleSection
        isCollapsed={searchItems.length <= 0}
        maxHigh={"max-h-[280px]"}
      >
        <div className="mb-4 relative" data-cy="show-docs-result">
          <button
            className="absolute p-0 top-2 right-6 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-600"
            onClick={clearSearch}
            data-cy="clear-search-results"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div
            className="bg-gray-800 p-2 rounded max-h-[280px] overflow-auto"
            data-cy="tag-documents"
          >
            {searchItems.map((doc) => (
              <div
                key={doc.id}
                className="p-1.5 border-b border-gray-700 bg-gray-800 hover:bg-gray-600 cursor-pointer"
                onClick={() => onSelectDoc(doc.id)}
              >
                {doc.title}
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default SearchSelect;
