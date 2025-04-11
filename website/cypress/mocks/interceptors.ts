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
        ],
      },
    ],
  }).as("getAllTaskWithProperties");

  // Create Task
  cy.intercept("POST", "**/task", {
    statusCode: 200,
    body: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      createdAt: "2025-04-06T12:00:00Z",
      updatedAt: "2025-04-06T15:30:00Z",
      title: "",
      content: "",
    },
  }).as("createTask");

  // Create Batch Properties
  cy.intercept("POST", "**/property/batch", {
    statusCode: 200,
    body: [
      { name: "priority", value: "low" },
      { name: "status", value: "todo" },
      { name: "level", value: "c-level" },
      { name: "assignee", value: "" },
      { name: "deadline", value: "" },
      { name: "finishedAt", value: "" },
    ],
  }).as("createBatchProperties");

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
        ],
      },
      {
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
    ],
  }).as("getPropertiesOptions");
};
