export const setupInterceptors = () => {
  // Create Task With Properties
  cy.intercept("POST", "**/task/properties", {
    statusCode: 200,
    body: {
      id: "task-id-new",
      createdAt: "2025-04-06T12:00:00Z",
      updatedAt: "2025-04-06T15:30:00Z",
      title: "",
      content: "",
      properties: [
        { name: "priority", value: "option-id-low" },
        { name: "status", value: "option-id-todo" },
        { name: "level", value: "option-id-low-c-level" },
        { name: "assignee", value: "" },
        { name: "deadline", value: "" },
        { name: "finishedAt", value: "" },
      ],
    },
  }).as("createTaskWithProperties");

  // Update Task
  cy.intercept("PUT", "**/task/*", {
    statusCode: 200,
    body: {
      id: "task-id-new",
      createdAt: "2025-04-06T12:00:00Z",
      updatedAt: "2025-04-06T15:30:00Z",
      title: "Test Task",
      content: "This is a test content.",
    },
  }).as("updateTask");

  // Delete Task With Properties
  cy.intercept("DELETE", "**/task/*/properties", {
    statusCode: 200,
    body: {},
  }).as("deleteTaskWithProperties");

  // Update Property
  cy.intercept("PUT", "**/property/*", {
    statusCode: 200,
    body: {
      id: "property-id-status",
      createdAt: "2025-04-06T12:00:00Z",
      updatedAt: "2025-04-06T15:30:00Z",
      name: "status",
      value: "option-id-done",
    },
  }).as("updateProperty");

  // Delete Properties By Task
  cy.intercept("DELETE", "**/property/task/:taskId", {
    statusCode: 200,
    body: {},
  }).as("deletePropertiesByTask");

  // Batch Update Tasks
  cy.intercept(
    {
      method: "POST",
      url: "**/api/task/batch",
      times: 1, // 此回應僅使用一次
    },
    {
      statusCode: 200,
      body: [
        {
          id: "task-id-1",
          updatedAt: "2025-04-06T16:00:00Z",
          title: "This is default task",
          content: "default",
          order: 0,
        },
        {
          id: "task-id-2",
          updatedAt: "2025-04-06T16:05:00Z",
          title: "Second task",
          content: "This is the second task content.",
          order: 0,
        },
        {
          id: "task-id-3",
          updatedAt: "2025-04-06T16:05:00Z",
          title: "Third task",
          content: "This is the third task content.",
          order: 1,
        },
      ],
    },
  ).as("batchUpdateTasks");

  // Batch Update Tasks - 用於 "move a task within the same column"
  cy.intercept(
    {
      method: "POST",
      url: "**/api/task/batch",
      times: 1, // 此回應僅使用一次
    },
    {
      statusCode: 200,
      body: [
        {
          id: "task-id-1",
          updatedAt: "2025-04-06T16:00:00Z",
          title: "This is default task",
          content: "default",
          order: 1,
        },
        {
          id: "task-id-2",
          updatedAt: "2025-04-06T16:05:00Z",
          title: "Second task",
          content: "This is the second task content.",
          order: 0,
        },
        {
          id: "task-id-3",
          updatedAt: "2025-04-06T16:05:00Z",
          title: "Third task",
          content: "This is the third task content.",
          order: 0,
        },
      ],
    },
  ).as("batchUpdateTasksWithinColumn");
};
