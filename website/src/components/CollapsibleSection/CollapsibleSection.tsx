import React from "react";

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
  return (
    <div
      className={`collapsible-section ${
        isCollapsed ? "max-h-0 opacity-0" : maxHigh
      } transform origin-top transition-all duration-300
      ${className}`}
    >
      {children}
    </div>
  );
};

export default CollapsibleSection;
