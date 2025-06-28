import { setupInterceptors } from "../mocks/kanbanInterceptors";
import { setupBaseInterceptors } from "../mocks/base";

describe("Kanban Page Workflow Tests", () => {
  beforeEach(() => {
    setupBaseInterceptors();
    setupInterceptors();
    cy.viewport(1280, 720);
    cy.visit("/#/kanban"); // 確保訪問正確的 Kanban 頁面
  });

  it("should verify the first card contains priority, epic, and project properties", () => {
    // 確保第二個卡片存在
    cy.get('[data-cy="kanban-column"] [data-cy="kanban-task"]')
      .eq(2)
      .within(() => {
        // 檢查是否包含 priority 屬性
        cy.get('[data-cy="kanban-task-priority"]').should("exist");

        // 檢查是否包含 epic 屬性
        cy.get('[data-cy="kanban-task-epic"]').should("exist");

        // 檢查是否包含 project 屬性
        cy.get('[data-cy="kanban-task-project"]').should("exist");
      });
  });

  it("should create a task, drag it to a new column, and verify status", () => {
    // 1. 新增任務
    cy.get("#add-task-button").click(); // 點擊新增任務按鈕

    // 確認 Edit Dialog 打開
    cy.get('[data-cy="edit-dialog"]').should("exist");

    cy.get("[data-cy=toggle-properties]").click();

    // 編輯任務標題和內容
    cy.get('[data-cy="title-input"]').type("Test Task");
    cy.get('[data-cy="editor-content"] .mdxeditor-root-contenteditable').type(
      "This is a test content.",
    );

    // 關閉對話框保存
    cy.get("body").click(0, 0);

    // 確保任務已新增到 "To Do" 列
    cy.get(
      '[data-cy="kanban-column"][id="option-id-todo"] [data-cy="kanban-task-title"]',
    )
      .contains("Test Task")
      .should("exist");

    // 檢查 content
    cy.get(
      '[data-cy="kanban-column"][id="option-id-todo"] [data-cy="kanban-task-title"]',
    )
      .contains("Test Task")
      .click();
    cy.get('[data-cy="edit-dialog"]').should("exist");
    cy.get('[data-cy="editor-content"] .mdxeditor-root-contenteditable').should(
      "contain",
      "This is a test content.",
    );
  });

  it('should drag a task and drop it into the "done" column, then verify status via InteractiveSelect', () => {
    const draggableTaskId = "task-id-1";
    const destinationColumnId = "option-id-done";

    // 展開 "done" 列
    cy.get(`[data-cy="kanban-column"][id="option-id-done"]`)
      .find(".flex.justify-between.items-center.cursor-pointer span")
      .click();

    // 模擬拖放
    simulateDragDrop({
      draggableId: draggableTaskId,
      source: {
        droppableId: "option-id-todo", // 起始列 ID
        index: 0, // 起始列的 index
      },
      destination: {
        droppableId: destinationColumnId,
        index: 0, // 移動到的目標列 index
      },
    });

    // 確認任務已成功移動到 "done" 列
    cy.get(
      `[data-rbd-droppable-id="${destinationColumnId}"] [data-rbd-draggable-id="${draggableTaskId}"]`,
    )
      .contains("This is default task")
      .should("exist");

    // 打開任務對話框
    cy.get(
      `[data-rbd-droppable-id="${destinationColumnId}"] [data-rbd-draggable-id="${draggableTaskId}"]`,
    ).click();

    cy.get("[data-cy=toggle-properties]").click();

    // 使用 InteractiveSelect 驗證屬性狀態
    cy.get('[data-cy="edit-dialog"]')
      .find('[data-cy="property-select-title"]')
      .contains("Status:")
      .parent()
      .within(() => {
        const interactiveInputSelector = '[data-cy="property-select-input"]';
        cy.get(interactiveInputSelector).should("contain", "Done");
      });
  });

  it("should delete a task and verify it is removed from the board", () => {
    const taskId = "task-id-2";

    // 打開任務對話框
    cy.get(`[data-rbd-draggable-id="${taskId}"]`)
      .contains("Second task")
      .click();

    // 確保 Edit Dialog 打開
    cy.get('[data-cy="edit-dialog"]').should("exist");

    // 打開選單
    cy.get('[data-cy="edit-dialog"]')
      .find('[data-cy="edit-menu-trigger"]')
      .click();

    // 確保選單展開
    cy.get('[data-cy="edit-menu"]').should("exist");

    // 點擊刪除按鈕
    cy.get('[data-cy="delete-task-button"]').click();

    // 檢查是否觸發 deleteFile API
    cy.wait("@deleteFile").its("response.statusCode").should("eq", 200);

    // 確保 Edit Dialog 關閉
    cy.get('[data-cy="edit-dialog"]').should("not.exist");

    // 確保任務已從看板中移除
    cy.get(
      `[data-cy="kanban-column"] [data-rbd-draggable-id="${taskId}"]`,
    ).should("not.exist");
  });

  it("should move a task within the same column", () => {
    const taskId1 = "task-id-1";
    const taskId2 = "task-id-2";
    const columnId = "option-id-todo";

    // 模擬拖放
    simulateDragDrop({
      draggableId: taskId2,
      source: {
        droppableId: columnId,
        index: 1,
      },
      destination: {
        droppableId: columnId,
        index: 0,
      },
    });

    // 驗證 task 排序是否正確
    cy.wait(500);
    cy.get(
      `[data-rbd-droppable-id="${columnId}"] [data-cy="kanban-column-cards"]`,
    )
      .children("[data-rbd-draggable-id]") // 確保只選取直接子元素
      .then((tasks) => {
        const taskIds = tasks
          .toArray()
          .map((task) => task.getAttribute("data-rbd-draggable-id"));
        expect(taskIds).to.deep.eq([
          taskId2, // 預期第一個任務
          taskId1, // 預期第二個任務
        ]);
      });
  });
});

interface SourceAndDestination {
  droppableId: string;
  index: number;
}

interface SimulateDragDrop {
  draggableId: string;
  source: SourceAndDestination;
  destination: SourceAndDestination;
}

const simulateDragDrop = ({
  draggableId,
  source,
  destination,
}: SimulateDragDrop) => {
  cy.get(`[data-rbd-draggable-id="${draggableId}"]`).then(($el) => {
    cy.window().then((win) => {
      const event = {
        draggableId,
        type: "DEFAULT",
        source,
        destination,
      };

      // 直接調用 react-beautiful-dnd 的上下文
      // @ts-ignore
      win["reactBeautifulDndContext"].handleDragEnd(event);
    });
  });
};
