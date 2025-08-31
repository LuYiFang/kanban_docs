import React, { useEffect, useState } from "react";

interface CollapsibleSectionProps {
  isCollapsed: boolean;
  maxHigh: string;
  children: React.ReactNode;
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  isCollapsed,
  maxHigh,
  children,
  className = "",
}) => {
  const [isChildrenRendered, setIsChildrenRendered] = useState(true);

  useEffect(() => {
    if (isCollapsed) setTimeout(() => setIsChildrenRendered(false), 400);
    else setIsChildrenRendered(true);
  }, [isCollapsed]);

  return (
    <div
      className={`collapsible-section ${
        isCollapsed ? "max-h-0 opacity-0" : maxHigh
      } transform origin-top transition-all duration-300
      ${className}`}
    >
      <div style={{ display: isChildrenRendered ? "block" : "none" }}>
        {children}
      </div>
    </div>
  );
};

export default CollapsibleSection;
