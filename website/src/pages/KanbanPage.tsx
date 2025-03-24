import React from "react";
import KanbanBoard from "../components/Kanban/KanbanBoard";

const KanbanPage: React.FC = () => {
    return (
        <div className="h-full w-full flex flex-col bg-gray-900 text-gray-300">
            <h1 className="text-2xl font-bold mb-4">Kanban</h1>
            <KanbanBoard />
        </div>
    );
};

export default KanbanPage;