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
  diffSourcePlugin,
  DiffSourceToggleWrapper,
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
  jsxPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  MDXEditorMethods,
  quotePlugin,
  StrikeThroughSupSubToggles,
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
import { MermaidCodeEditorDescriptor } from "./MermaidCodeEditorDescriptor";
import mermaid from "mermaid";
import { InsertTask } from "./InsertTask";

interface MarkdownEditorProps {
  readOnly: boolean;
  content: string;
  onChange: (title: string | null, content: string | null) => void;
}

export interface MarkdownEditorMethods {
  getMarkdown: () => string;
}

const MarkdownEditor = forwardRef<MarkdownEditorMethods, MarkdownEditorProps>(
  ({ readOnly, content, onChange }, ref) => {
    const dispatch = useDispatch<AppDispatch>();
    const editorRef = useRef<MDXEditorMethods>(null);

    useImperativeHandle(ref, () => ({
      getMarkdown: () => editorRef.current?.getMarkdown() || "",
    }));

    useEffect(() => {
      if (!editorRef.current) return;

      editorRef.current.setMarkdown(content);
      mermaid.run({
        querySelector: ".mermaid",
      });
    }, [content]);

    const handleEditorChange = (markdown: string) => {
      onChange(null, markdown);
    };

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
        className="dark-theme w-full"
        markdown={""}
        onChange={handleEditorChange}
        onError={(error) => {
          console.error("Error in MDX editor", error);
        }}
        plugins={[
          listsPlugin(),
          toolbarPlugin({
            toolbarClassName: "my-classname",
            toolbarContents: () => (
              <>
                <DiffSourceToggleWrapper>
                  <UndoRedo />
                  <ListsToggle />
                  <InsertTable />
                  <InsertTask />
                  <StrikeThroughSupSubToggles />
                  <BoldItalicUnderlineToggles />
                  <InsertThematicBreak />
                  <InsertAdmonition />
                  <CodeToggle />
                  <InsertCodeBlock />
                  <CreateLink />
                  <InsertImage />
                  <InsertFrontmatter />
                  <BlockTypeSelect />
                </DiffSourceToggleWrapper>
              </>
            ),
          }),
          jsxPlugin(),
          quotePlugin(),
          headingsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin({ imageUploadHandler: uploadImage }),
          tablePlugin(),
          thematicBreakPlugin(),
          frontmatterPlugin(),
          codeBlockPlugin({
            defaultCodeBlockLanguage: "txt",
            codeBlockEditorDescriptors: [MermaidCodeEditorDescriptor],
          }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              javascript: "JavaScript",
              css: "CSS",
              tsx: "TypeScript",
              python: "Python",
              sql: "SQL",
              mermaid: "Mermaid",
              csharp: "C#",
            },
          }),
          directivesPlugin({
            directiveDescriptors: [AdmonitionDirectiveDescriptor],
          }),
          markdownShortcutPlugin(),
          diffSourcePlugin({
            diffMarkdown: "An older version",
            viewMode: "rich-text",
          }),
        ]}
      />
    );
  },
);
export default MarkdownEditor;
