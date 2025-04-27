export const setupInterceptors = () => {
  // Get All Tasks With Properties
  cy.intercept("GET", "**/api/task/properties", {
    statusCode: 200,
    body: [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        createdAt: "2025-04-06T12:00:00Z",
        updatedAt: "2025-04-06T15:30:00Z",
        title: "This is default task",
        content: "default",
        order: 0,
        properties: [
          {
            id: "550e8400-e29b-41d4-a716-446655440004",
            name: "priority",
            value: "low",
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440005",
            name: "status",
            value: "todo",
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440006",
            name: "level",
            value: "c-level",
          },
        ],
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        createdAt: "2025-04-06T14:00:00Z",
        updatedAt: "2025-04-06T15:45:00Z",
        title: "Second task",
        content: "This is the second task content.",
        order: 1,
        properties: [
          {
            id: "550e8400-e29b-41d4-a716-446655440010",
            name: "priority",
            value: "high",
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440011",
            name: "status",
            value: "todo",
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440012",
            name: "level",
            value: "b-level",
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440012",
            name: "project",
            value: "Project A",
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440012",
            name: "epic",
            value: "This is default task",
          },
        ],
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        createdAt: "2025-04-06T16:00:00Z",
        updatedAt: "2025-04-06T17:00:00Z",
        title: "Third task",
        content: "This is the third task content.",
        order: 0,
        properties: [
          {
            id: "550e8400-e29b-41d4-a716-446655440013",
            name: "priority",
            value: "medium",
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440014",
            name: "status",
            value: "done",
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440015",
            name: "level",
            value: "a-level",
          },
        ],
      },
    ],
  }).as("getAllTaskWithProperties");

  // Create Task With Properties
  cy.intercept("POST", "**/task/properties", {
    statusCode: 200,
    body: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      createdAt: "2025-04-06T12:00:00Z",
      updatedAt: "2025-04-06T15:30:00Z",
      title: "",
      content: "",
      properties: [
        { name: "priority", value: "low" },
        { name: "status", value: "todo" },
        { name: "level", value: "c-level" },
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
      id: "550e8400-e29b-41d4-a716-446655440000",
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
      id: "550e8400-e29b-41d4-a716-446655440005",
      createdAt: "2025-04-06T12:00:00Z",
      updatedAt: "2025-04-06T15:30:00Z",
      name: "status",
      value: "done",
    },
  }).as("updateProperty");

  // Delete Properties By Task
  cy.intercept("DELETE", "**/property/task/:taskId", {
    statusCode: 200,
    body: {},
  }).as("deletePropertiesByTask");

  cy.intercept("GET", "**/property/properties/options", {
    statusCode: 200,
    body: [
      {
        id: "fake-property-id-1",
        name: "priority",
        typeId: "fake-type-id-1",
        type: "select",
        options: [
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "fake-property-id-1",
            name: "High",
            id: "fake-id-1",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "fake-property-id-1",
            name: "Medium",
            id: "fake-id-2",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "fake-property-id-1",
            name: "Low",
            id: "fake-id-3",
          },
        ],
      },
      {
        id: "fake-property-id-2",
        name: "status",
        typeId: "fake-type-id-2",
        type: "select",
        options: [
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "fake-property-id-2",
            name: "Todo",
            id: "fake-id-4",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "fake-property-id-2",
            name: "In Progress",
            id: "fake-id-5",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "fake-property-id-2",
            name: "Done",
            id: "fake-id-6",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "fake-property-id-2",
            name: "Epic",
            id: "fake-id-7",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "fake-property-id-2",
            name: "Waiting",
            id: "fake-id-8",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "fake-property-id-2",
            name: "Cancelled",
            id: "fake-id-9",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "fake-property-id-2",
            name: "Deferred",
            id: "fake-id-10",
          },
        ],
      },
      {
        id: "fake-property-id-3",
        name: "level",
        typeId: "fake-type-id-3",
        type: "select",
        options: [
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "fake-property-id-3",
            name: "A Level",
            id: "fake-id-7",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "fake-property-id-3",
            name: "B Level",
            id: "fake-id-8",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "fake-property-id-3",
            name: "C Level",
            id: "fake-id-9",
          },
        ],
      },
      {
        id: "fake-property-id-4",
        name: "epic",
        typeId: "fake-type-id-4",
        type: "select",
        options: [],
      },
      {
        id: "fake-property-id-5",
        name: "project",
        typeId: "fake-type-id-5",
        type: "select",
        options: [
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "fake-property-id-5",
            name: "Project A",
            id: "fake-id-12",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "fake-property-id-5",
            name: "Project B",
            id: "fake-id-13",
          },
        ],
      },
    ],
  }).as("getPropertiesOptions");

  // Create Property Option
  cy.intercept("POST", "**/property/properties/option", {
    statusCode: 200,
    body: {
      createdAt: "2025-04-06T16:00:00Z",
      updatedAt: "2025-04-06T16:05:00Z",
      propertyId: "fake-property-id-5",
      name: "New Project",
      id: "fake-id-11",
    },
  }).as("createPropertyOption");

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
          id: "550e8400-e29b-41d4-a716-446655440001",
          updatedAt: "2025-04-06T16:00:00Z",
          title: "This is default task",
          content: "default",
          order: 0,
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440002",
          updatedAt: "2025-04-06T16:05:00Z",
          title: "Second task",
          content: "This is the second task content.",
          order: 0,
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440003",
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
          id: "550e8400-e29b-41d4-a716-446655440001",
          updatedAt: "2025-04-06T16:00:00Z",
          title: "This is default task",
          content: "default",
          order: 1,
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440002",
          updatedAt: "2025-04-06T16:05:00Z",
          title: "Second task",
          content: "This is the second task content.",
          order: 0,
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440003",
          updatedAt: "2025-04-06T16:05:00Z",
          title: "Third task",
          content: "This is the third task content.",
          order: 0,
        },
      ],
    },
  ).as("batchUpdateTasksWithinColumn");

  // Upload File
  cy.intercept("POST", "**/api/files", {
    statusCode: 200,
    body: {
      id: "12345678",
      url: "/files/12345678",
    },
  }).as("uploadFile");
};
