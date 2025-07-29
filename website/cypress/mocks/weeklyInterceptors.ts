export const setupInterceptors = () => {
  // Get All Tasks With Properties
  cy.intercept("GET", "**/api/task/properties?task_type=weekly&weeks_ago=0", {
    statusCode: 200,
    body: [
      {
        id: "task-id-1",
        type: "task",
        createdAt: "2025-04-29T10:00:00Z",
        updatedAt: "2025-05-01T12:00:00Z",
        title: "Task A Level",
        content:
          "This is an A-level task. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vel libero at lacus tempor consectetur non et libero. Sed volutpat, nisi eget tincidunt sollicitudin, nunc lacus sagittis arcu, eu bibendum turpis justo eget risus. Fusce ultrices, felis in tempor interdum, quam velit tincidunt arcu, vitae facilisis odio odio non metus. Integer suscipit ex sed turpis elementum, id pulvinar nisi interdum. Cras eget turpis vel ligula scelerisque pretium a id lectus. Nam fermentum, erat vel feugiat consectetur, eros sapien posuere lorem, ac bibendum enim lectus ac purus. Duis vel sem id tortor sodales gravida et ac lectus. Donec lobortis risus in sem sollicitudin, et tincidunt massa efficitur. Mauris tristique dictum lacus non imperdiet. Ut malesuada sagittis justo, eu tincidunt justo viverra vel. In hac habitasse platea dictumst. Phasellus fermentum, magna nec efficitur varius, dui justo ultricies urna, eget elementum magna lorem id tortor. Sed nec velit eu dolor auctor tincidunt in non velit. Vestibulum fringilla, ligula ac egestas convallis, lorem augue efficitur elit, ac efficitur eros arcu ac mauris. Nulla facilisi.",
        order: 0,
        properties: [
          {
            id: "property-id-priority",
            name: "priority",
            value: "option-id-high",
          },
          { id: "property-id-status", name: "status", value: "option-id-todo" },
          {
            id: "property-id-level",
            name: "level",
            value: "option-id-a-level",
          },
        ],
      },
      {
        id: "task-id-2",
        type: "task",
        createdAt: "2025-04-29T14:00:00Z",
        updatedAt: "2025-05-01T15:00:00Z",
        title: "Task B Level",
        content: "This is a B-level task.",
        order: 1,
        properties: [
          {
            id: "property-id-priority",
            name: "priority",
            value: "option-id-medium",
          },
          {
            id: "property-id-status",
            name: "status",
            value: "option-id-in-progress",
          },
          {
            id: "property-id-level",
            name: "level",
            value: "option-id-b-level",
          },
        ],
      },
      {
        id: "task-id-3",
        type: "task",
        createdAt: "2025-04-29T16:00:00Z",
        updatedAt: "2025-05-02T08:00:00Z",
        title: "Task C Level - Project D",
        content: "This is a C-level task in Project D.",
        order: 2,
        properties: [
          {
            id: "property-id-priority",
            name: "priority",
            value: "option-id-low",
          },
          { id: "property-id-status", name: "status", value: "option-id-epic" },
          {
            id: "property-id-level",
            name: "level",
            value: "option-id-c-level",
          },
          {
            id: "property-id-project",
            name: "project",
            value: "option-id-project-d",
          },
        ],
      },
      {
        id: "task-id-4",
        type: "docs",
        createdAt: "2025-04-30T10:00:00Z",
        updatedAt: "2025-05-02T09:30:00Z",
        title: "Task C Level - Project A",
        content: "This is a C-level task in Project A.",
        order: 3,
        properties: [
          {
            id: "property-id-priority",
            name: "priority",
            value: "option-id-medium",
          },
          {
            id: "property-id-status",
            name: "status",
            value: "option-id-waiting",
          },
          {
            id: "property-id-level",
            name: "level",
            value: "option-id-c-level",
          },
          {
            id: "property-id-project",
            name: "project",
            value: "option-id-project-a",
          },
        ],
      },
      {
        id: "task-id-5",
        type: "docs",
        createdAt: "2025-04-30T12:00:00Z",
        updatedAt: "2025-05-02T11:00:00Z",
        title: "Task D Level",
        content: "This is a D-level task in Project A.",
        order: 4,
        properties: [
          {
            id: "property-id-priority",
            name: "priority",
            value: "option-id-high",
          },
          { id: "property-id-status", name: "status", value: "option-id-done" },
          {
            id: "property-id-level",
            name: "level",
            value: "option-id-d-level",
          },
          {
            id: "property-id-project",
            name: "project",
            value: "option-id-project-a",
          },
          { id: "property-id-epic", name: "epic", value: "task-id-3" },
          {
            id: "property-id-assignee",
            name: "assignee",
            value: "option-id-user-b",
          },
        ],
      },
    ],
  }).as("getAllTaskWithPropertiesWeekly");

  cy.intercept("GET", "**/api/task/properties?task_type=weekly&weeks_ago=1", {
    statusCode: 200,
    body: [
      {
        id: "task-id-1",
        type: "task",
        createdAt: "2025-04-29T10:00:00Z",
        updatedAt: "2025-05-01T12:00:00Z",
        title: "Task A Level",
        content:
          "This is an A-level task. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vel libero at lacus tempor consectetur non et libero. Sed volutpat, nisi eget tincidunt sollicitudin, nunc lacus sagittis arcu, eu bibendum turpis justo eget risus. Fusce ultrices, felis in tempor interdum, quam velit tincidunt arcu, vitae facilisis odio odio non metus. Integer suscipit ex sed turpis elementum, id pulvinar nisi interdum. Cras eget turpis vel ligula scelerisque pretium a id lectus. Nam fermentum, erat vel feugiat consectetur, eros sapien posuere lorem, ac bibendum enim lectus ac purus. Duis vel sem id tortor sodales gravida et ac lectus. Donec lobortis risus in sem sollicitudin, et tincidunt massa efficitur. Mauris tristique dictum lacus non imperdiet. Ut malesuada sagittis justo, eu tincidunt justo viverra vel. In hac habitasse platea dictumst. Phasellus fermentum, magna nec efficitur varius, dui justo ultricies urna, eget elementum magna lorem id tortor. Sed nec velit eu dolor auctor tincidunt in non velit. Vestibulum fringilla, ligula ac egestas convallis, lorem augue efficitur elit, ac efficitur eros arcu ac mauris. Nulla facilisi.",
        order: 0,
        properties: [
          {
            id: "property-id-priority",
            name: "priority",
            value: "option-id-high",
          },
          { id: "property-id-status", name: "status", value: "option-id-todo" },
          {
            id: "property-id-level",
            name: "level",
            value: "option-id-a-level",
          },
        ],
      },
    ],
  }).as("getAllTaskWithPropertiesOneWeekAgo");

  cy.intercept("GET", "**/api/task/properties?task_type=weekly&weeks_ago=2", {
    statusCode: 200,
    body: [
      {
        id: "task-id-1",
        type: "task",
        createdAt: "2025-04-29T10:00:00Z",
        updatedAt: "2025-05-01T12:00:00Z",
        title: "Task A Level",
        content:
          "This is an A-level task. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vel libero at lacus tempor consectetur non et libero. Sed volutpat, nisi eget tincidunt sollicitudin, nunc lacus sagittis arcu, eu bibendum turpis justo eget risus. Fusce ultrices, felis in tempor interdum, quam velit tincidunt arcu, vitae facilisis odio odio non metus. Integer suscipit ex sed turpis elementum, id pulvinar nisi interdum. Cras eget turpis vel ligula scelerisque pretium a id lectus. Nam fermentum, erat vel feugiat consectetur, eros sapien posuere lorem, ac bibendum enim lectus ac purus. Duis vel sem id tortor sodales gravida et ac lectus. Donec lobortis risus in sem sollicitudin, et tincidunt massa efficitur. Mauris tristique dictum lacus non imperdiet. Ut malesuada sagittis justo, eu tincidunt justo viverra vel. In hac habitasse platea dictumst. Phasellus fermentum, magna nec efficitur varius, dui justo ultricies urna, eget elementum magna lorem id tortor. Sed nec velit eu dolor auctor tincidunt in non velit. Vestibulum fringilla, ligula ac egestas convallis, lorem augue efficitur elit, ac efficitur eros arcu ac mauris. Nulla facilisi.",
        order: 0,
        properties: [
          {
            id: "property-id-priority",
            name: "priority",
            value: "option-id-high",
          },
          { id: "property-id-status", name: "status", value: "option-id-todo" },
          {
            id: "property-id-level",
            name: "level",
            value: "option-id-a-level",
          },
        ],
      },
      {
        id: "task-id-2",
        type: "task",
        createdAt: "2025-04-29T14:00:00Z",
        updatedAt: "2025-05-01T15:00:00Z",
        title: "Task B Level",
        content: "This is a B-level task.",
        order: 1,
        properties: [
          {
            id: "property-id-priority",
            name: "priority",
            value: "option-id-medium",
          },
          {
            id: "property-id-status",
            name: "status",
            value: "option-id-in-progress",
          },
          {
            id: "property-id-level",
            name: "level",
            value: "option-id-b-level",
          },
        ],
      },
      {
        id: "task-id-3",
        type: "task",
        createdAt: "2025-04-29T16:00:00Z",
        updatedAt: "2025-05-02T08:00:00Z",
        title: "Task C Level - Project D",
        content: "This is a C-level task in Project D.",
        order: 2,
        properties: [
          {
            id: "property-id-priority",
            name: "priority",
            value: "option-id-low",
          },
          { id: "property-id-status", name: "status", value: "option-id-epic" },
          {
            id: "property-id-level",
            name: "level",
            value: "option-id-c-level",
          },
          {
            id: "property-id-project",
            name: "project",
            value: "option-id-project-d",
          },
        ],
      },
    ],
  }).as("getAllTaskWithPropertiesTwoWeekAgo");

  // Get Weekly Summary
  cy.intercept("GET", "**/api/summary/weekly", {
    statusCode: 200,
    body: "Summary Line 1\nSummary Line 2\nSummary Line 3",
  }).as("getSummeryWeekly");
};
