/**
 * [EXPERIMENTAL] Custom InsertLink component for toolbar-driven link insertion.
 *
 * This component was built to explore a fully controlled link insertion flow,
 * including custom toolbar button, popover positioning near cursor, and markdown injection.
 *
 * Currently not wired into the production toolbar. Retained for reference and future integration.
 * Note: InsertLink is incomplete and may not behave correctly in all scenarios.
 *
 * Related to: cursor-based popover alignment, bypassing linkDialogPlugin
 */

import React, { useState } from "react";
import {
  ButtonWithTooltip,
  iconComponentFor$,
  insertMarkdown$,
  useCellValues,
  usePublisher,
} from "@mdxeditor/editor";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Popover from "@radix-ui/react-popover";

export const InsertLink = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [iconComponentFor] = useCellValues(iconComponentFor$);
  const insertMarkdown = usePublisher(insertMarkdown$);
  // const updateLink = usePublisher(updateLink$);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [anchorPos, setAnchorPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const recordSelectionPosition = () => {
    const sel = window.getSelection();
    if (sel?.rangeCount) {
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setAnchorPos({ x: rect.left, y: rect.bottom }); // bottom 是游標下緣
    }
  };

  const handleInsertLink = () => {
    insertMarkdown(`[${title}](${url})`);
  };

  return (
    <>
      <Popover.Root open={isDialogOpen}>
        {/*<button type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:rc:"*/}
        {/*        data-state="closed">*/}
        {/*</button>*/}
        <Popover.Trigger asChild>
          {/*<div*/}
          {/*  className="ffffffff"*/}
          {/*  style={{*/}
          {/*    position: "absolute",*/}
          {/*    top: anchorPos?.y,*/}
          {/*    left: anchorPos?.x,*/}
          {/*  }}*/}
          {/*/>*/}
          <div>
            <ButtonWithTooltip
              onClick={() => {
                setIsDialogOpen(true);
                recordSelectionPosition();
              }}
              title="Insert Link"
              data-cy={"insert-link-button"}
              aria-haspopup="dialog"
              aria-expanded="false"
              aria-controls="radix-:rc:"
              data-state="closed"
            >
              {iconComponentFor("link")}
            </ButtonWithTooltip>
          </div>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={5}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-4 rounded shadow-lg w-96 relative">
                <button
                  className="z-20 absolute top-1 right-6 ml-2 w-5 h-5 p-0 flex items-center justify-center rounded-full text-gray-100 hover:bg-gray-300 hover:bg-opacity-80 text-[10px]"
                  onClick={() => setIsDialogOpen(false)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
                {/*<h2 className="text-lg font-bold text-gray-300 mb-4">*/}
                {/*  Select Task*/}
                {/*</h2>*/}
                <input
                  type="text"
                  className={`w-full text-lg p-1 pl-2 mt-3 mb-1 border border-gray-700 bg-gray-800 text-gray-300 rounded`}
                  placeholder="URL"
                  data-cy="url-input"
                  onChange={(e) => setUrl(e.target.value)}
                />
                <input
                  type="text"
                  className={`w-full text-lg p-1 pl-2 border border-gray-700 bg-gray-800 text-gray-300 rounded`}
                  placeholder="Tilte"
                  data-cy="title-input"
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => {
                      handleInsertLink();
                      setIsDialogOpen(false);
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
        {/*</Popover.Anchor>*/}
      </Popover.Root>
    </>
  );
};
