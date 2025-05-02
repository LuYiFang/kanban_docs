import { useEffect, useRef, useState } from "react";
import {
  CodeBlockEditorDescriptor,
  useCodeBlockEditorContext,
} from "@mdxeditor/editor";
import mermaid from "mermaid";
import { v4 as uuidv4 } from "uuid";

mermaid.initialize({ startOnLoad: true });

const MermaidPreview: React.FC<{ code: string }> = ({ code }) => {
  const ref = useRef<HTMLDivElement>(null);
  const uniqueId = `mermaid-${uuidv4()}`;

  useEffect(() => {
    if (ref.current) {
      void mermaid
        .render(`graphDiv-${uniqueId}`, code, ref.current)
        .then(({ svg }) => {
          ref.current!.innerHTML = svg;
        });
    }
  }, [code]);

  return (
    <div ref={ref} id={uniqueId} className="mermaid">
      {code}
    </div>
  );
};

export const MermaidCodeEditorDescriptor: CodeBlockEditorDescriptor = {
  match: (language, _meta) => {
    return language === "mermaid" || language == "mmd";
  },
  priority: 100,
  Editor: (props) => {
    const cb = useCodeBlockEditorContext();
    const [code, setCode] = useState(props.code);

    return (
      <div
        onKeyDown={(e) => {
          e.nativeEvent.stopImmediatePropagation();
        }}
      >
        <div style={{ display: "flex" }}>
          <textarea
            style={{ flex: 1 }}
            rows={3}
            cols={20}
            defaultValue={props.code}
            onChange={(e) => {
              setCode(e.target.value);
              cb.setCode(e.target.value);
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
