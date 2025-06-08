export const setupInterceptors = () => {
  // Update Task
  cy.intercept(
    {
      method: "PUT",
      url: "**/task/*",
      times: 1, // 此回應僅使用一次
    },
    {
      statusCode: 200,
      body: {
        id: "task-id-1",
        createdAt: "2025-04-06T12:00:00Z",
        updatedAt: "2025-04-06T15:30:00Z",
        title: "Updated Task Title",
        content: "default",
      },
    },
  ).as("updateTask");

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

  cy.fixture("past_image.jpeg", "base64").then((fileContent) => {
    cy.intercept("GET", "**/api/files/*", {
      statusCode: 200,
      headers: { "Content-Type": "image/jpeg" },
      body: Cypress.Blob.base64StringToBlob(fileContent, "image/jpeg"),
    }).as("getFile");
  });

  // Update Task
  cy.intercept(
    {
      method: "PUT",
      url: "**/task/*",
      times: 1, // 此回應僅使用一次
    },
    {
      statusCode: 200,
      body: {
        id: "task-id-1",
        createdAt: "2025-04-06T12:00:00Z",
        updatedAt: "2025-04-06T15:30:00Z",
        title: "Updated Task Title",
        content: "default![](http://localhost:9000/api/files/12345678)",
      },
    },
  ).as("updateTask");
  //
  // // Delete File
  // cy.intercept("DELETE", "**/api/files/*", {
  //   statusCode: 200,
  //   body: "12345678",
  // }).as("deleteFile");
};
