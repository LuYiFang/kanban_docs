import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  AdmonitionDirectiveDescriptor,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  codeMirrorPlugin,
  CodeToggle,
  CreateLink,
  directivesPlugin,
  frontmatterPlugin,
  headingsPlugin,
  imagePlugin,
  InsertAdmonition,
  InsertCodeBlock,
  InsertFrontmatter,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  MDXEditorMethods,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "./styles.css";
import { uploadFile } from "../../store/slices/kanbanThuck";
import apiClient from "../../utils/apiClient";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";

interface MarkdownEditorProps {
  isOpen: boolean;
  readOnly: boolean;
  content: string;
  onChange: (content: string) => void;
}

export interface MarkdownEditorMethods {
  getMarkdown: () => string;
}

const MarkdownEditor = forwardRef<MarkdownEditorMethods, MarkdownEditorProps>(
  ({ readOnly, isOpen, content, onChange }, ref) => {
    const dispatch = useDispatch<AppDispatch>();
    const editorRef = useRef<MDXEditorMethods>(null);

    useImperativeHandle(ref, () => ({
      getMarkdown: () => editorRef.current?.getMarkdown() || "",
    }));

    useEffect(() => {
      if (!editorRef.current) return;

      editorRef.current.setMarkdown(content);
    }, [isOpen, content]);

    const uploadImage = async (image: File): Promise<string> => {
      try {
        const formData = new FormData();
        formData.append("file", image);
        const response = await dispatch(uploadFile(formData)).unwrap();
        return `${apiClient.defaults.baseURL}${response.url}`;
      } catch (error) {
        console.error("Image upload failed:", error);
        throw error;
      }
    };

    return (
      <MDXEditor
        readOnly={readOnly}
        ref={editorRef}
        className=" dark-theme  w-full"
        markdown={""}
        onChange={onChange}
        plugins={[
          listsPlugin(),
          toolbarPlugin({
            toolbarClassName: "my-classname",
            toolbarContents: () => (
              <>
                <UndoRedo />
                <ListsToggle />
                <InsertTable />
                <BoldItalicUnderlineToggles />
                <InsertThematicBreak />
                <InsertAdmonition />
                <CodeToggle />
                <InsertCodeBlock />
                <CreateLink />
                <InsertImage />
                <InsertFrontmatter />
                <BlockTypeSelect />
              </>
            ),
          }),
          quotePlugin(),
          headingsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin({ imageUploadHandler: uploadImage }),
          tablePlugin(),
          thematicBreakPlugin(),
          frontmatterPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
          directivesPlugin({
            directiveDescriptors: [AdmonitionDirectiveDescriptor],
          }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              js: "JavaScript",
              css: "CSS",
              txt: "text",
              tsx: "TypeScript",
              py: "Python",
            },
          }),
          markdownShortcutPlugin(),
        ]}
      />
    );
  },
);
export default MarkdownEditor;
