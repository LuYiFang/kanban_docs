import React, { Suspense } from "react";
import { KanbanCardContentProps } from "./Card";

const Card = React.lazy(() => import("./Card"));

const LazyCard: React.FC<KanbanCardContentProps> = (props) => {
  return (
    <Suspense
      fallback={
        <div className="bg-gray-700 rounded-lg h-48 w-full animate-pulse" />
      }
    >
      <Card {...props} />
    </Suspense>
  );
};

export default LazyCard;
