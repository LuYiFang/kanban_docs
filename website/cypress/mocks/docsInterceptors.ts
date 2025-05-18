export const setupInterceptors = () => {
  // Get All Tasks With Properties
  cy.intercept("GET", "**/api/task/properties?task_type=docs", {
    statusCode: 200,
    body: [
      {
        id: "task-id-1",
        createdAt: "2025-04-29T10:00:00Z",
        updatedAt: "2025-05-01T12:00:00Z",
        title: "Task A Title",
        content: "This is an A-level task.",
        order: 0,
        type: "docs",
        properties: [
          {
            id: "property-id-tags",
            name: "tags",
            value: ["option-id-tag1", "option-id-tag2"],
          },
        ],
      },
      {
        id: "task-id-2",
        createdAt: "2025-04-29T14:00:00Z",
        updatedAt: "2025-05-01T15:00:00Z",
        title: "Task B Title",
        content: "This is a B",
        order: 1,
        type: "docs",
        properties: [
          {
            id: "property-id-tags",
            name: "tags",
            value: ["option-id-tag2"],
          },
        ],
      },
      {
        id: "task-id-3",
        createdAt: "2025-04-29T16:00:00Z",
        updatedAt: "2025-05-02T08:00:00Z",
        title: "Task C Title",
        content: "This is a C-level task in Project D.",
        order: 2,
        type: "docs",
        properties: [
          {
            id: "property-id-tags",
            name: "tags",
            value: ["option-id-tag3"],
          },
        ],
      },
    ],
  }).as("getDocs");
};
