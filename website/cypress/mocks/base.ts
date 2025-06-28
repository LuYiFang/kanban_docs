import { dummyPropertiesAndOptions, dummyTasks } from "./dummyData";

export const setupBaseInterceptors = () => {
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
