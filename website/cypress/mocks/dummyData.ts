import { Task } from "../../src/types/task";

export const dummyTasks: Task[] = [
  {
    id: "1",
    title: "Dummy Task 1",
    content: "This is a dummy task", // description 改为 content
    type: "todo", // taskType 改为 type
    order: 0, // 添加 order
    properties: [
      { id: "property-id-priority", name: "priority", value: "option-id-low" },
      { id: "property-id-status", name: "status", value: "option-id-todo" },
      { id: "property-id-level", name: "level", value: "option-id-c-level" },
    ],
  },
  {
    id: "2",
    title: "Dummy Task 2",
    content: "This is another dummy task", // description 改为 content
    type: "in-progress", // taskType 改为 type
    order: 1, // 添加 order
    properties: [
      { id: "property-id-priority", name: "priority", value: "option-id-high" },
      { id: "property-id-status", name: "status", value: "option-id-todo" },
      { id: "property-id-level", name: "level", value: "option-id-b-level" },
      {
        id: "property-id-project",
        name: "project",
        value: "option-id-project-a",
      },
      { id: "property-id-epic", name: "epic", value: "task-id-3" },
    ],
  },
  {
    id: "3",
    title: "Dummy Task 3",
    content: "This is the third dummy task", // description 改为 content
    type: "done", // taskType 改为 type
    order: 2, // 添加 order
    properties: [
      {
        id: "property-id-priority",
        name: "priority",
        value: "option-id-medium",
      },
      { id: "property-id-status", name: "status", value: "option-id-epic" },
      { id: "property-id-level", name: "level", value: "option-id-a-level" },
    ],
  },
];

export const dummyPropertiesAndOptions = {
  properties: [
    {
      id: "property-id-priority",
      name: "priority",
      options: ["High", "Medium", "Low"],
    },
    {
      id: "property-id-status",
      name: "status",
      options: ["Todo", "In Progress", "Done", "Epic", "Waiting"],
    },
    {
      id: "property-id-level",
      name: "level",
      options: ["A Level", "B Level", "C Level", "D Level"],
    },
    {
      id: "property-id-project",
      name: "project",
      options: ["Project A", "Project B", "Project D"],
    },
    {
      id: "property-id-assignee",
      name: "assignee",
      options: ["User A", "User B"],
    },
    {
      id: "property-id-tags",
      name: "tags",
      options: ["Tag1", "Tag2", "Tag3"],
    },
    {
      id: "property-id-epic",
      name: "epic",
      options: [],
    },
  ],
};
