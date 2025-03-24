import React from "react";

const WeeklyReportPage: React.FC = () => {
    const completedTasks = 8;
    const pendingTasks = 3;

    return (
        <div className="p-4 bg-gray-900 text-gray-300" >
            <h1 className="text-2xl font-bold mb-4">Weekly Report</h1>
            <div className="mb-4">
                <p className="text-lg">Tasks Completed: {completedTasks}</p>
                <p className="text-lg">Tasks Pending: {pendingTasks}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded">
                <h2 className="text-xl font-semibold">Weekly Summary</h2>
                <p>
                    This week, the team achieved key milestones, with 8 tasks completed
                    and 3 tasks still pending. Next week, the focus will shift to finalizing
                    the remaining tasks and starting the deployment process.
                </p>
            </div>
        </div>
    );
};

export default WeeklyReportPage;