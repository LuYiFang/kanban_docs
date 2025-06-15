import { setupInterceptors } from "../mocks/weeklyInterceptors";
import { setupBaseInterceptors } from "../mocks/base";

describe("Weekly Page Workflow Tests", () => {
  beforeEach(() => {
    setupBaseInterceptors();
    setupInterceptors();
    cy.visit("/#/weekly-report"); // 確保訪問正確的 weekly-report 頁面
  });

  it("should have 4 tasks in the weekly board, verify the first card contains project, epic, status, assignee, summary properties", () => {
    cy.get('[data-cy="kanban-task"]').should("have.length", 5);

    cy.get('[data-cy="kanban-task"]')
      .last()
      .within(() => {
        cy.get('[data-cy="kanban-task-project"]').should("exist");
        cy.get('[data-cy="kanban-task-epic"]').should("exist");
        cy.get('[data-cy="kanban-task-status"]').should("exist");
        cy.get('[data-cy="kanban-task-assignee"]').should("exist");
        cy.get('[data-cy="kanban-task-summary"]').should("exist");
      });
  });

  it("should have task order in column level c", () => {
    cy.get('[data-cy="kanban-column"]')
      .eq(2)
      .within(() => {
        cy.get('[data-cy="kanban-task"]').should("have.length", 2);
        cy.get('[data-cy="kanban-task"]')
          .eq(0)
          .within(() => {
            cy.get('[data-cy="kanban-task-project"]').contains("Project A");
          });
        cy.get('[data-cy="kanban-task"]')
          .eq(1)
          .within(() => {
            cy.get('[data-cy="kanban-task-project"]').contains("Project D");
          });
      });
  });

  it("should not have #add-task-button, and editor should be read only", () => {
    cy.get("#add-task-button").should("not.exist");
    cy.get('[data-cy="kanban-task"]').last().click();
    cy.get('[data-cy="edit-dialog"]').should("exist");

    cy.get('[data-cy="title-input"]').should("have.attr", "disabled");

    cy.get('[data-cy="property-select-title"]').contains("Status:").click();
    cy.get('[data-cy="property-select-search"]').should("not.exist");

    cy.get(".mdxeditor-toolbar")
      .invoke("attr", "class")
      .should("include", "readOnly");
  });

  it("should generate summary and allow copying an item", () => {
    cy.get('[data-cy="generate-summary-button"]').click();
    cy.get('[data-cy="summary-area"]').should("exist");

    cy.get('[data-cy="summary-area"] input[type="text"]')
      .first()
      .type("123") // 在輸入框中輸入123
      .invoke("val")
      .then((text) => {
        cy.get('[data-cy="input-copy-button"]').first().click();
        cy.document().then((doc) => {
          doc.hasFocus = true; // 確保文檔獲得焦點
          cy.window().then((win) => {
            win.navigator.clipboard.readText().then((clipboardText) => {
              expect(clipboardText).to.eq(`${text}123`); // 確保複製的文本後面包含123
            });
          });
        });
      });
  });
});
