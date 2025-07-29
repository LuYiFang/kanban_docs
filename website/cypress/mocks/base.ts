import { dummyPropertiesAndOptions, dummyTasks } from "./dummyData";

export const setupBaseInterceptors = () => {
  cy.intercept("POST", "**/login", (req) => {
    req.reply({
      statusCode: 200,
      body: { message: "Login successful" },
      headers: {
        "X-New-Token": "mocked-access-token-123",
      },
    });
  }).as("loginRequest");

  cy.intercept("GET", "**/me", (req) => {
    req.reply({
      statusCode: 200,
      body: {
        username: "tester",
      },
    });
  }).as("getMe");

  // Get All Tasks With Properties
  cy.intercept("GET", "**/api/task/properties?task_type=task", {
    statusCode: 200,
    body: dummyTasks,
  }).as("getAllTaskWithProperties");

  cy.intercept("GET", "**/property/properties/options", {
    statusCode: 200,
    body: dummyPropertiesAndOptions,
  }).as("getPropertiesOptions");

  // Delete File
  cy.intercept("DELETE", "**/api/files/*", {
    statusCode: 200,
    body: "12345678",
  }).as("deleteFile");
};
