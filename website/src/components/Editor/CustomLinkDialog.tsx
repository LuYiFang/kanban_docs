/**
 * [WIP] CustomLinkDialog for overriding MDXEditor’s default linkDialogPlugin behavior.
 *
 * Intended to replace the built-in LinkDialog with a custom UI while preserving Lexical’s link node structure.
 * Includes hooks for intercepting <a> clicks and rendering a popover near the clicked anchor.
 *
 * Note: CustomLinkDialog is incomplete and may not behave correctly in all scenarios.
 * Preserved for future plugin-based link editing strategy.
 *
 * Related to: linkDialogPlugin customization, anchor click interception, popover rendering
 */

import React from "react";
import {
  activeEditor$,
  cancelLinkEdit$,
  editorRootElementRef$,
  iconComponentFor$,
  linkDialogState$,
  removeLink$,
  switchFromPreviewToLinkEdit$,
  updateLink$,
  useCellValues,
  usePublisher,
  useTranslation,
} from "@mdxeditor/editor";
import * as Popover from "@radix-ui/react-popover";
import BaseInput from "../Input/BaseInput";

export const CustomLinkDialog: React.FC = () => {
  const [
    editorRootElementRef,
    activeEditor,
    iconComponentFor,
    linkDialogState,
  ] = useCellValues(
    editorRootElementRef$,
    activeEditor$,
    iconComponentFor$,
    linkDialogState$,
  );
  const updateLink = usePublisher(updateLink$);
  const cancelLinkEdit = usePublisher(cancelLinkEdit$);
  const switchFromPreviewToLinkEdit = usePublisher(
    switchFromPreviewToLinkEdit$,
  );
  const removeLink = usePublisher(removeLink$);

  const [copyUrlTooltipOpen, setCopyUrlTooltipOpen] = React.useState(false);

  const t = useTranslation();

  if (linkDialogState.type === "inactive") return null;

  const urlIsExternal =
    linkDialogState.type === "preview" &&
    linkDialogState.url.startsWith("http");

  const containerRect = editorRootElementRef?.current?.getBoundingClientRect();
  const theRect = linkDialogState.rectangle;

  console.log("editorRootElementRef?.current", editorRootElementRef?.current);

  return (
    <Popover.Root open={true}>
      <Popover.Anchor
        data-visible={linkDialogState.type === "edit"}
        // className={styles.linkDialogAnchor}
        className="absolute eeeeeeee"
        style={{
          position: "fixed",
          top: `${(containerRect?.top || 0) - theRect.top}px`,
          left: `${(containerRect?.left || 0) - theRect.left}px`,
          width: `${theRect.width}px`,
          height: `${theRect.height}px`,
        }}
      />

      <Popover.Portal container={document.body}>
        <Popover.Content
          // className={classNames(styles.linkDialogPopoverContent)}
          sideOffset={5}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          key={linkDialogState.linkNodeKey}
        >
          {linkDialogState.type === "edit" && <UrlForm />}

          {linkDialogState.type === "preview" && (
            <>
              <a
                // className={styles.linkDialogPreviewAnchor}
                href={linkDialogState.url}
                {...(urlIsExternal
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                // onClick={(e) => {
                //   if (onClickLinkCallback !== null) {
                //     e.preventDefault();
                //     onClickLinkCallback(linkDialogState.url);
                //   }
                // }}
                title={
                  urlIsExternal
                    ? t("linkPreview.open", `Open {{url}} in new window`, {
                        url: linkDialogState.url,
                      })
                    : linkDialogState.url
                }
              >
                <span>{linkDialogState.url}</span>
                {urlIsExternal && iconComponentFor("open_in_new")}
              </a>
            </>
          )}
          <Popover.Arrow />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const UrlForm = () => {
  return (
    <>
      <BaseInput placeholder="URL" />
      <BaseInput placeholder="Title" />
      <button>Save</button>
    </>
  );
};
