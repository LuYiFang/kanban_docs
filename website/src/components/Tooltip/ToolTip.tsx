import { createPortal } from "react-dom";
import React, { cloneElement, useEffect, useRef, useState } from "react";

type TooltipProps = {
  title: string;
  children: React.ReactElement;
  offset?: number;
};

const Tooltip = ({ title, children, offset = 8 }: TooltipProps) => {
  const childRef = useRef<HTMLElement>(null);
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (show && childRef.current) {
      const rect = childRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + offset,
        left: rect.left + rect.width / 2,
      });
    }
  }, [show, offset]);

  const clonedChild = cloneElement(children, {
    ref: childRef,
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false),
  });

  return (
    <>
      {clonedChild}
      {show &&
        createPortal(
          <span
            className="fixed z-50 px-2 py-1 text-xs text-white bg-black rounded shadow transition-opacity transform -translate-x-1/2"
            style={{ top: position.top, left: position.left }}
          >
            {title}
          </span>,
          document.body,
        )}
    </>
  );
};

export default Tooltip;
