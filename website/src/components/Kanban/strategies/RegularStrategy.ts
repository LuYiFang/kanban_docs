import { KanbanStrategy } from "../KanbanBoard";
import { TaskWithProperties } from "../../../types/task";

export class RegularStrategy implements KanbanStrategy {
  calculateCardStyle(task: TaskWithProperties) {
    return {
      position: "relative",
    };
  }

  getColumnStyle() {
    return {
      minHeight: "auto",
      position: "relative",
    };
  }

  generateNextTask(defaultProperties) {
    return {
      task: {
        title: "",
        content: "",
        type: "",
      },
      properties: defaultProperties,
    };
  }
}
