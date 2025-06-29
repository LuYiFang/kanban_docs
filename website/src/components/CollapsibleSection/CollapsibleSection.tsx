import React from "react";

interface CollapsibleSectionProps {
  isCollapsed: boolean;
  maxHigh: string;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  isCollapsed,
  maxHigh,
  children,
}) => {
  return (
    <div
      className={`collapsible-section ${
        isCollapsed ? "max-h-0" : maxHigh
      } transition-all duration-300`}
    >
      {children}
    </div>
  );
};

export default CollapsibleSection;
