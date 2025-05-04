import React, { memo, useEffect, useRef, useState } from "react";
import {
  CodeBlockEditorDescriptor,
  useCodeBlockEditorContext,
} from "@mdxeditor/editor";
import mermaid from "mermaid";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

mermaid.initialize({ startOnLoad: true, suppressErrorRendering: true });

const MermaidPreview: React.FC<{ code: string }> = memo(({ code }) => {
  const ref = useRef<HTMLDivElement>(null);
  const uniqueId = `mermaid-${uuidv4()}`;

  useEffect(() => {
    if (!ref.current || !code) return;
    void mermaid
      .render(`graphDiv-${uniqueId}`, code, ref.current)
      .then(({ svg }) => {
        ref.current!.innerHTML = svg;
      })
      .catch((error) =>
        console.warn("Mermaid 渲染失敗，但不影響其他內容", error),
      );
  }, [code]);

  return <div ref={ref} id={uniqueId} className="mermaid"></div>;
});

export const MermaidCodeEditorDescriptor: CodeBlockEditorDescriptor = {
  match: (language, _meta) => {
    return language === "mermaid" || language == "mmd";
  },
  priority: 100,
  Editor: (props) => {
    const cb = useCodeBlockEditorContext();
    const [code, setCode] = useState(props.code);

    const ref = useRef<HTMLDivElement>(null);

    const handleChange = _.debounce((newValue) => {
      setCode(newValue);
      cb.setCode(newValue);
    }, 0);

    const handleDelete = () => {
      if (!cb.parentEditor) {
        console.warn("MDXEditor parentEditor 無法取得，無法刪除 Block");
        return;
      }

      cb.parentEditor.update(() => {
        cb.lexicalNode.remove();
        console.log("Mermaid Code Block 已刪除");
      });
    };

    return (
      <div
        ref={ref}
        onKeyDown={(e) => {
          e.nativeEvent.stopImmediatePropagation();
        }}
      >
        <button
          data-cy="delete-mermaid-block-button"
          onClick={handleDelete}
          className="absolute top-2 right-2  border-none cursor-pointer hover:opacity-100"
        >
          <FontAwesomeIcon icon={faTrash} className="text-white text-lg" />{" "}
        </button>

        <div style={{ display: "flex" }}>
          <textarea
            data-cy="mermaid-code-editor"
            style={{ flex: 1 }}
            rows={3}
            cols={20}
            defaultValue={props.code}
            onChange={(e) => {
              handleChange(e.target.value);
            }}
          />
          <div style={{ flex: 1 }}>
            <MermaidPreview code={code} />
          </div>
        </div>
      </div>
    );
  },
};
