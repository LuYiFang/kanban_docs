export const setupInterceptors = () => {
  // Get All Tasks With Properties
  cy.intercept("GET", "**/api/task/properties?task_type=all", {
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
      {
        id: "task-id-4",
        createdAt: "2025-04-30T10:00:00Z",
        updatedAt: "2025-05-01T12:00:00Z",
        title: "Regular Task 1",
        content: "This is a regular task 1.",
        order: 3,
        type: "task",
        properties: [
          {
            id: "property-id-priority",
            name: "priority",
            value: "option-id-low",
          },
          {
            id: "property-id-status",
            name: "status",
            value: "option-id-todo",
          },
          {
            id: "property-id-level",
            name: "level",
            value: "option-id-c-level",
          },
        ],
      },
      {
        id: "task-id-5",
        createdAt: "2025-04-30T14:00:00Z",
        updatedAt: "2025-05-01T15:00:00Z",
        title: "Regular Task 2",
        content: "This is a regular task 2.",
        order: 4,
        type: "task",
        properties: [
          {
            id: "property-id-priority",
            name: "priority",
            value: "option-id-high",
          },
          {
            id: "property-id-status",
            name: "status",
            value: "option-id-todo",
          },
          {
            id: "property-id-level",
            name: "level",
            value: "option-id-b-level",
          },
          {
            id: "property-id-project",
            name: "project",
            value: "option-id-project-a",
          },
          {
            id: "property-id-epic",
            name: "epic",
            value: "task-id-3",
          },
        ],
      },
      {
        id: "task-id-6",
        createdAt: "2025-04-30T16:00:00Z",
        updatedAt: "2025-05-02T08:00:00Z",
        title: "Regular Task 3",
        content: "This is a regular task 3.",
        order: 5,
        type: "task",
        properties: [
          {
            id: "property-id-priority",
            name: "priority",
            value: "option-id-medium",
          },
          {
            id: "property-id-status",
            name: "status",
            value: "option-id-epic",
          },
          {
            id: "property-id-level",
            name: "level",
            value: "option-id-a-level",
          },
        ],
      },
    ],
  }).as("getDocs");

  // Mock Save Layout API
  cy.intercept("POST", "**/api/files", {
    statusCode: 200,
    body: { success: true },
  }).as("saveLayout");

  // Mock Get Layout API
  cy.intercept(
    {
      method: "GET",
      url: "**/api/files/*",
      times: 1, // 此回應僅使用一次
    },
    {
      statusCode: 404,
    },
  ).as("getLayoutNotFound");

  cy.intercept("GET", "**/api/files/*", {
    statusCode: 200,
    body: {
      sm: [
        { i: "task-id-1", x: 0, y: 16, w: 2, h: 16 },
        { i: "task-id-2", x: 4, y: 16, w: 2, h: 29 },
        { i: "task-id-5", x: 0, y: 0, w: 6, h: 16 },
      ],
      lg: [
        { i: "task-id-1", x: 0, y: 16, w: 2, h: 16 },
        { i: "task-id-2", x: 4, y: 16, w: 2, h: 29 },
        { i: "task-id-5", x: 0, y: 0, w: 6, h: 16 },
      ],
    },
  }).as("getLayout");

  let isFirstRequest = true;
  cy.intercept({ method: "GET", url: "**/files/filename/*/ids" }, (req) => {
    if (isFirstRequest) {
      isFirstRequest = false; // 只在第一次請求時返回 404
      req.reply({ statusCode: 404, body: [] });
    } else {
      req.reply({ statusCode: 200, body: ["123456"] });
    }
  });

  // Mock Add Document API
  cy.intercept(
    {
      method: "POST",
      url: "**/task/properties",
      times: 1, // 此回應僅使用一次
    },
    {
      statusCode: 200,
      body: {
        id: "doc-id-new",
        createdAt: "2025-04-06T12:00:00Z",
        updatedAt: "2025-04-06T15:30:00Z",
        title: "",
        content: "",
        type: "docs",
        properties: [{ name: "tags", value: [] }],
      },
    },
  ).as("createDocWithProperties");

  // Update documents
  cy.intercept("PUT", "**/task/*", {
    statusCode: 200,
    body: {
      id: "doc-id-new",
      createdAt: "2025-04-06T12:00:00Z",
      updatedAt: "2025-04-06T15:30:00Z",
      type: "docs",
      title: "New Document Title",
      content: "This is the content of the new document.",
    },
  }).as("updateDoc");

  cy.intercept("DELETE", "**/task/*/properties", {
    statusCode: 200,
    body: {},
  }).as("deleteDocWithProperties");

  // Update Property
  cy.intercept("PUT", "**/property/*", {
    statusCode: 200,
    body: {
      id: "property-id-priority",
      createdAt: "2025-04-06T12:00:00Z",
      updatedAt: "2025-04-06T15:30:00Z",
      name: "priority",
      value: "option-id-high",
    },
  }).as("updateProperty");

  // Import Document
  cy.intercept(
    {
      method: "POST",
      url: "**/task/properties",
      times: 1, // 此回應僅使用一次
    },
    {
      statusCode: 200,
      body: {
        id: "doc-id-import",
        createdAt: "2025-04-06T12:00:00Z",
        updatedAt: "2025-04-06T15:30:00Z",
        title: "example",
        content: "## Markdown Title\n\nThis is markdown content.",
        type: "docs",
        properties: [{ name: "tags", value: [] }],
      },
    },
  ).as("createDocWithProperties");
};
