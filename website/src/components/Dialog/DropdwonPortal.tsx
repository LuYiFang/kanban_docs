import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export type DropdownMode = "bottom" | "right" | "left-bottom";

interface DropdownPortalProps {
  positionRef: React.RefObject<HTMLElement>;
  isOpen: boolean;
  onClose: () => void;
  mode?: DropdownMode;
  children: ReactNode;
  className?: string;
}

const DropdownPortal: React.FC<DropdownPortalProps> = ({
  positionRef,
  isOpen,
  onClose,
  mode = "bottom",
  children,
  className = "",
}) => {
  const portalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<CSSProperties>({});

  useEffect(() => {
    if (!isOpen || !positionRef.current) return;

    const rect = positionRef.current.getBoundingClientRect();
    let pos: CSSProperties = {};

    switch (mode) {
      case "right":
        pos = {
          top: rect.top + window.scrollY,
          left: rect.right + window.scrollX + 8,
        };
        break;
      case "left-bottom":
        pos = {
          top: rect.bottom + window.scrollY + 8,
          right: window.innerWidth - rect.right - 8,
        };
        break;
      case "bottom":
      default:
        pos = {
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
        };
        break;
    }

    setPosition(pos);
  }, [isOpen, mode, positionRef]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      setTimeout(() => {
        const target = e.target as HTMLElement;
        if (isOpen && !portalRef.current?.contains(target)) {
          onClose();
        }
      }, 0);
    };

    document.addEventListener("click", handleClickOutside, {
      capture: true,
    });
    return () => {
      document.removeEventListener("click", handleClickOutside, {
        capture: true,
      });
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <>
      {position.top !== undefined &&
        createPortal(
          <div
            ref={portalRef}
            className={`absolute z-50 ${className}`}
            style={position}
            data-cy="dropdown-menu"
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
};

export default DropdownPortal;
