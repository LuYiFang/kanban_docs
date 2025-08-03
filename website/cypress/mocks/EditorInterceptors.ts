export const setupInterceptors = () => {
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

  // Create Property Option
  cy.intercept("POST", "**/property/properties/option", {
    statusCode: 200,
    body: {
      createdAt: "2025-04-06T16:00:00Z",
      updatedAt: "2025-04-06T16:05:00Z",
      propertyId: "property-id-project",
      name: "New Project",
      id: "option-id-new-project",
    },
  }).as("createPropertyOption");

  // Upload File
  cy.intercept("POST", "**/api/files", {
    statusCode: 200,
    body: {
      id: "12345678",
      url: "/files/12345678",
    },
  }).as("uploadFile");

  // Update Task
  cy.intercept(
    {
      method: "PUT",
      url: "**/task/task-id-1",
    },
    {
      statusCode: 200,
      body: {
        id: "task-id-1",
        createdAt: "2025-04-06T12:00:00Z",
        updatedAt: "2025-04-06T15:30:00Z",
        title: "Updated Task Title",
        content:
          "default![](http://localhost:9000/api/files/3c9e7f2a-8b6d-4e3a-9f8f-2d1a4c6e1a3b)",
      },
    },
  ).as("updateTask");

  cy.intercept(
    {
      method: "PUT",
      url: "**/task/task-id-2",
    },
    {
      statusCode: 200,
      body: {
        id: "task-id-2",
        createdAt: "2025-04-06T12:00:00Z",
        updatedAt: "2025-04-06T15:30:00Z",
        title: "Second task",
        content:
          "This is the second task content.![link](https://api/files/f47ac10b-58cc-4372-a567-0e02b2c3d479)![](http://localhost:9000/api/files/3c9e7f2a-8b6d-4e3a-9f8f-2d1a4c6e1a3b)",
      },
    },
  ).as("updateTask");
};
