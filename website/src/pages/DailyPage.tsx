import React from "react";
import KanbanBoard from "../components/Kanban/KanbanBoard";
import { dailyPropertyOrder, defaultDailyProperties } from "../types/property";
import { DailyStrategy } from "../components/Kanban/strategies/DailyStrategy";

const days = ["一", "二", "三", "四", "五"];
const timeSlots = Array.from({ length: 12 }, (_, i) => `${7 + i}:00`);

const DailyPage: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col bg-gray-900 text-gray-300">
      <h1 className="text-2xl font-bold mb-4">Daily</h1>
      <div className="grid grid-cols-6 gap-4">
        {/* 時間軸 */}
        <div>
          <div className="h-20"></div>
          <div className="border-r border-gray-700 p-2 relative">
            {timeSlots.map((time) => (
              <div
                key={time}
                className={`h-20 text-xs text-right pr-2 ${
                  time === "12:00" ? "relative" : ""
                }`}
              >
                {time}
              </div>
            ))}
          </div>
        </div>

        {/* KanbanBoard */}
        <div className="col-span-5">
          <KanbanBoard
            type="daily"
            dataName="dailyTasks"
            groupPropertyName="week_day"
            columnSort={days}
            defaultProperties={defaultDailyProperties}
            propertyOrder={dailyPropertyOrder}
            strategy={new DailyStrategy()}
          />
        </div>
      </div>
    </div>
  );
};

export default DailyPage;
