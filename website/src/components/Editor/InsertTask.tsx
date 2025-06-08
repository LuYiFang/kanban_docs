import React, { useState } from "react";
import {
  ButtonWithTooltip,
  insertMarkdown$,
  usePublisher,
} from "@mdxeditor/editor";
import SearchSelect from "../Select/SearchSelect";
import { TaskWithProperties } from "../../types/task";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { faTableList, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const InsertTask = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const insertMarkdown = usePublisher(insertMarkdown$);

  const allItems: TaskWithProperties[] = useSelector(
    (state: RootState) => state.kanban.all,
  );
  const propertySetting = useSelector(
    (state: RootState) => state.kanban.propertySetting,
  );

  const propertyOptionsIdNameMap = React.useMemo(() => {
    const taskIdTitleMap = allItems.reduce(
      (result, task) => {
        result[task.id] = task.title;
        return result;
      },
      {} as Record<string, string>,
    );

    const propertyIdNameMap = propertySetting.reduce(
      (result, property) => {
        property?.options?.forEach((option) => {
          result[option.id] = option.name;
        });
        return result;
      },
      {} as Record<string, string>,
    );

    return { ...taskIdTitleMap, ...propertyIdNameMap };
  }, [allItems, propertySetting]);

  const handleSelectDoc = (docId: string) => {
    const selectedDoc = allItems.find((item) => item.id === docId);
    if (selectedDoc) {
      insertMarkdown(
        `[${selectedDoc.title}](${window.location.origin}#/task/${docId})`,
      );
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <ButtonWithTooltip
        onClick={() => {
          setIsDialogOpen(true);
        }}
        title="Insert Task"
      >
        <FontAwesomeIcon
          icon={faTableList}
          className="m-0.5 w-[20px] h-[20px]"
        />
      </ButtonWithTooltip>
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded shadow-lg w-96 relative">
            <button
              className="z-20 absolute top-4 right-6 ml-2 w-5 h-5 p-0 flex items-center justify-center rounded-full text-gray-100 hover:bg-gray-300 hover:bg-opacity-80 text-[10px]"
              onClick={() => setIsDialogOpen(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 className="text-lg font-bold text-gray-300 mb-4">
              Select Task
            </h2>
            <SearchSelect
              allItems={allItems}
              propertyOptionsIdNameMap={propertyOptionsIdNameMap}
              onSelectDoc={handleSelectDoc}
              searchClass="w-full"
            />
          </div>
        </div>
      )}
    </>
  );
};
