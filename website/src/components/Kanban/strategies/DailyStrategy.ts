import { KanbanStrategy } from "../KanbanBoard";
import { TaskWithProperties } from "../../../types/task";
import moment from "moment";
import _ from "lodash";

export class DailyStrategy implements KanbanStrategy {
  calculateCardStyle(
    task: TaskWithProperties,
    cardPositions: Record<string, number>,
  ) {
    const isDaily = task.type === "daily";
    const startDateValue =
      task.properties.find((p) => p.name === "start_date")?.value || "";
    const endDateValue =
      task.properties.find((p) => p.name === "end_date")?.value || "";

    const startDate = moment(startDateValue);
    const endDate = moment(endDateValue);

    const hourDifference = endDate.diff(startDate, "hours", true);
    const baseHeight = 50;
    const baseTop = 80 + 32;
    const startHour = startDate.hours();
    const cardHeight = isDaily
      ? Math.max(baseHeight * hourDifference, baseHeight)
      : "auto";
    const cardMargin = 20;

    let cardTop = isDaily
      ? baseTop * (startHour - 7) + (startHour - 7) * cardMargin
      : 0;

    const timeKey = `${startHour}`;
    if (isDaily) {
      if (cardPositions[timeKey] === undefined) {
        cardPositions[timeKey] = cardTop;
      } else {
        cardTop = cardPositions[timeKey] + cardHeight + cardMargin;
        cardPositions[timeKey] = cardTop;
      }
    }

    return {
      height: cardHeight,
      top: cardTop,
      position: isDaily ? "absolute" : "relative",
    };
  }

  getColumnStyle(hasSpecialTask: boolean) {
    return {
      minHeight: hasSpecialTask ? "500px" : "auto",
      position: "relative",
    };
  }

  generateNextTask(tasks) {
    const sortedTasks = _.sortBy(tasks, (task) => {
      const weekDayValue =
        task.properties.find((p) => p.name === "week_day")?.value || "一";
      const weekDayOrder = ["一", "二", "三", "四", "五"];
      return weekDayOrder.indexOf(weekDayValue);
    });

    const lastTask = sortedTasks.reduce((prev, current) => {
      const prevWeekDay =
        prev.properties.find((p) => p.name === "week_day")?.value || "一";
      const currentWeekDay =
        current.properties.find((p) => p.name === "week_day")?.value || "一";

      if (prevWeekDay !== currentWeekDay) {
        const weekDayOrder = ["一", "二", "三", "四", "五"];
        return weekDayOrder.indexOf(currentWeekDay) >
          weekDayOrder.indexOf(prevWeekDay)
          ? current
          : prev;
      }

      const prevEndDate = moment(
        prev.properties.find((p) => p.name === "end_date")?.value,
      );
      const currentEndDate = moment(
        current.properties.find((p) => p.name === "end_date")?.value,
      );

      return currentEndDate.isAfter(prevEndDate) ? current : prev;
    });

    const lastWeekDay =
      lastTask.properties.find((p) => p.name === "week_day")?.value || "一";
    const lastEndDate = moment(
      lastTask.properties.find((p) => p.name === "end_date")?.value,
    );

    const nextStartDate = lastEndDate.clone();
    const nextEndDate = nextStartDate.clone().add(1, "hour");

    return {
      task: {
        title: "",
        content: "",
        type: "daily",
      },
      properties: [
        { name: "week_day", value: lastWeekDay },
        { name: "start_date", value: nextStartDate.format("YYYY-MM-DDTHH:mm") },
        { name: "end_date", value: nextEndDate.format("YYYY-MM-DDTHH:mm") },
      ],
    };
  }

  getNextTaskPosition(tasks: TaskWithProperties[], weekDay: string) {
    const dailyTasks = tasks.filter(
      (task) =>
        task.type === "daily" &&
        task.properties.find((p) => p.name === "week_day")?.value === weekDay,
    );

    if (dailyTasks.length === 0) {
      return {
        start_date: moment().startOf("day").add(8, "hours").toISOString(),
        end_date: moment().startOf("day").add(9, "hours").toISOString(),
      };
    }

    const lastTask = dailyTasks.reduce((prev, current) => {
      const prevEnd = moment(
        prev.properties.find((p) => p.name === "end_date")?.value,
      );
      const currentEnd = moment(
        current.properties.find((p) => p.name === "end_date")?.value,
      );
      return currentEnd.isAfter(prevEnd) ? current : prev;
    });

    const lastEndDate = moment(
      lastTask.properties.find((p) => p.name === "end_date")?.value,
    );

    // 动态计算下一个任务的时间段
    const nextStartDate = lastEndDate.clone();
    const nextEndDate = nextStartDate.clone().add(1, "hour");

    return {
      start_date: nextStartDate.toISOString(),
      end_date: nextEndDate.toISOString(),
    };
  }

  updateTaskOnDrag(
    task: TaskWithProperties,
    destinationColumnId: string,
    destinationIndex: number,
  ) {
    const weekDay = destinationColumnId;
    const startHour = 7 + destinationIndex;
    const start_date = moment().startOf("day").add(startHour, "hours");
    const end_date = start_date.clone().add(1, "hour");

    task.properties = task.properties.map((prop) => {
      if (prop.name === "week_day") {
        return { ...prop, value: weekDay };
      }
      if (prop.name === "start_date") {
        return { ...prop, value: start_date.format("YYYY-MM-DDTHH:mm") };
      }
      if (prop.name === "end_date") {
        return { ...prop, value: end_date.format("YYYY-MM-DDTHH:mm") };
      }
      return prop;
    });

    return task;
  }
}
