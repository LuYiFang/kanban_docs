import { createPortal } from "react-dom";
import React, { useEffect, useState } from "react";

export type StatusType = "success" | "error" | "none";

type StatusBubbleProps = {
  message: string;
  duration?: number;
  position?: "belowTarget" | "center";
  targetId?: string;
  children?: React.ReactNode;
  status: StatusType;
};

const StatusBubble = ({
  message,
  duration = 2000,
  position = "belowTarget",
  targetId,
  children,
  status,
}: StatusBubbleProps) => {
  const [visible, setVisible] = useState(true);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  useEffect(() => {
    if (status === "none") {
      setVisible(false);
      return;
    }

    if (position === "belowTarget" && targetId) {
      const target = document.getElementById(targetId);
      if (target) {
        setVisible(true);
        const rect = target.getBoundingClientRect();
        setCoords({
          top: rect.bottom + 8,
          left: rect.left + rect.width / 2,
        });
      }
    } else if (position === "center") {
      setVisible(true);
      setCoords({
        top: 32,
        left: window.innerWidth / 2,
      });
    }

    const timeout = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timeout);
  }, [status, targetId, duration, position]);

  return (
    <>
      {children}
      {visible &&
        coords &&
        createPortal(
          <span
            className={`fixed z-50 px-3 py-2 text-xs rounded shadow-lg transform -translate-x-1/2 transition-opacity
              ${status === "success" ? "bg-gray-700 text-white" : "bg-red-600 text-white"}`}
            style={{ top: coords.top, left: coords.left }}
            data-cy={"status-bubble"}
          >
            {message}
          </span>,
          document.body,
        )}
    </>
  );
};

export default StatusBubble;
