import { setupInterceptors } from "../mocks/interceptors";

describe("Kanban Page Workflow Tests", () => {
  beforeEach(() => {
    setupInterceptors();
    cy.visit("/kanban"); // 確保訪問正確的 Kanban 頁面
  });

  it("should verify the first card contains priority, epic, and project properties", () => {
    // 確保第二個卡片存在
    cy.get('[data-cy="kanban-column"] [data-cy="kanban-task"]')
      .eq(1)
      .within(() => {
        // 檢查是否包含 priority 屬性
        cy.get('[data-cy="kanban-task-priority"]').should("exist");

        // 檢查是否包含 epic 屬性
        cy.get('[data-cy="kanban-task-epic"]').should("exist");

        // 檢查是否包含 project 屬性
        cy.get('[data-cy="kanban-task-project"]').should("exist");
      });
  });

  // loading進頁面，點開task，點開 epic，確定裡面有2個task
  it("should load the Kanban board and verify task count in Epic", () => {
    // 確保 Kanban Board 正確加載
    cy.get('[data-cy="kanban-column"]').should("exist");

    // 點開第一個task
    cy.get('[data-cy="kanban-column"][id="todo"] [data-cy="kanban-task"]')
      .first()
      .click();

    // 確保 Edit Dialog 打開
    cy.get('[data-cy="edit-dialog"]').should("exist");

    // 找標題是 "Epic" 的選項
    cy.get('[data-cy="edit-dialog"]')
      .find('[data-cy="property-select-title"]')
      .contains("Epic:")
      .parent()
      .within(() => {
        const interactiveInputSelector = '[data-cy="property-select-input"]';
        cy.get(interactiveInputSelector).click();
      });

    // 確認 Epic 選項有兩個
    cy.get('[data-cy="property-select-search"]')
      .parent()
      .find("li")
      .should("have.length", 2);
  });

  it("should create a task, drag it to a new column, and verify status", () => {
    // 1. 新增任務
    cy.get("#add-task-button").click(); // 點擊新增任務按鈕

    // 確認 Edit Dialog 打開
    cy.get('[data-cy="edit-dialog"]').should("exist");

    // 編輯任務標題和內容
    cy.get('[data-cy="title-input"]').type("Test Task");
    cy.get('[data-cy="property-content-input"]').type(
      "This is a test content.",
    );

    // 關閉對話框保存
    cy.get("body").click(0, 0);

    // 確保任務已新增到 "To Do" 列
    cy.get('[data-cy="kanban-column"][id="todo"] [data-cy="kanban-task-title"]')
      .contains("Test Task")
      .should("exist");
  });

  it('should drag a task and drop it into the "done" column, then verify status via InteractiveSelect', () => {
    const draggableSelector =
      '[data-rbd-draggable-id="550e8400-e29b-41d4-a716-446655440001"]';
    const destinationSelector = '[data-rbd-droppable-id="done"]';

    // 展開 "done" 列
    cy.get('[data-cy="kanban-column"][id="done"]')
      .find(".flex.justify-between.items-center.cursor-pointer")
      .click();

    // 模擬拖放
    simulateDragDrop(draggableSelector, destinationSelector);

    // 確認任務已成功移動到 "done" 列
    cy.get(
      '[data-rbd-droppable-id="done"] [data-rbd-draggable-id="550e8400-e29b-41d4-a716-446655440001"]',
    )
      .contains("This is default task")
      .should("exist");

    // 打開任務對話框
    cy.get(
      '[data-rbd-droppable-id="done"] [data-rbd-draggable-id="550e8400-e29b-41d4-a716-446655440001"]',
    ).click();

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
    const taskSelector =
      '[data-rbd-draggable-id="550e8400-e29b-41d4-a716-446655440001"]';

    // 打開任務對話框
    cy.get(taskSelector).contains("This is default task").click();

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

    // 確保 Edit Dialog 關閉
    cy.get('[data-cy="edit-dialog"]').should("not.exist");

    // 確保任務已從看板中移除
    cy.get(
      '[data-cy="kanban-column"] [data-rbd-draggable-id="550e8400-e29b-41d4-a716-446655440001"]',
    ).should("not.exist");
  });

  it("should move a task within the same column", () => {
    const draggableSelector1 =
      '[data-rbd-draggable-id="550e8400-e29b-41d4-a716-446655440001"]'; // 第一個任務
    const draggableSelector2 =
      '[data-rbd-draggable-id="550e8400-e29b-41d4-a716-446655440002"]'; // 第二個任務

    // 模擬拖放
    cy.get(draggableSelector2).then(($el) => {
      const draggableId = $el.attr("data-rbd-draggable-id");
      cy.window().then((win) => {
        const event = {
          draggableId,
          type: "DEFAULT",
          source: {
            droppableId: "todo",
            index: 1,
          },
          destination: {
            droppableId: "todo",
            index: 0,
          },
        };

        win["reactBeautifulDndContext"].handleDragEnd(event);
      });
    });

    // 驗證 task 排序是否正確
    cy.wait(500);
    cy.get('[data-rbd-droppable-id="todo"] [data-cy="kanban-column-cards"]')
      .children("[data-rbd-draggable-id]") // 確保只選取直接子元素
      .then((tasks) => {
        const taskIds = tasks
          .toArray()
          .map((task) => task.getAttribute("data-rbd-draggable-id"));
        console.log("taskIds", taskIds);
        expect(taskIds).to.deep.eq([
          "550e8400-e29b-41d4-a716-446655440002", // 預期第一個任務
          "550e8400-e29b-41d4-a716-446655440001", // 預期第二個任務
        ]);
      });
  });

  it("should add a new project option and verify it exists in the options list", () => {
    const newProjectName = "New Project";

    // 打開任務對話框
    cy.get(
      '[data-rbd-draggable-id="550e8400-e29b-41d4-a716-446655440001"]',
    ).click();

    // 確保 Edit Dialog 打開
    cy.get('[data-cy="edit-dialog"]').should("exist");

    // 找到屬性選擇器並展開
    cy.get('[data-cy="edit-dialog"]')
      .find('[data-cy="property-select-title"]')
      .contains("Project:")
      .parent()
      .within(() => {
        const interactiveInputSelector = '[data-cy="property-select-input"]';
        cy.get(interactiveInputSelector).click();
        // 在搜索框中輸入新選項名稱
        cy.get('[data-cy="property-select-search"]').type(newProjectName);

        // 按下 Enter 鍵
        cy.get('[data-cy="property-select-search"]').type("{enter}");

        cy.get(interactiveInputSelector).click();

        // 確認新選項是否出現在選項列表中
        cy.get('[data-cy="property-select-search"]')
          .parent()
          .find("ul")
          .contains(newProjectName)
          .should("exist");
      });

    // 關閉 Edit Dialog，點開另一個任務，點開第一個選項，確定新選項有出現在選項列表中
    cy.get("body").click(0, 0);
    cy.get(
      '[data-rbd-draggable-id="550e8400-e29b-41d4-a716-446655440002"]',
    ).click();
    cy.get('[data-cy="edit-dialog"]').should("exist");
    cy.get('[data-cy="edit-dialog"]')
      .find('[data-cy="property-select-input"]')
      .first()
      .click();
    cy.get('[data-cy="property-select-search"]')
      .parent()
      .find("ul")
      .contains(newProjectName)
      .should("exist");
  });

  it("should paste an image into the editor and verify it is uploaded", () => {
    // 打開任務對話框
    cy.get(
      '[data-rbd-draggable-id="550e8400-e29b-41d4-a716-446655440001"]',
    ).click();

    // 確保 Edit Dialog 打開
    cy.get('[data-cy="edit-dialog"]').should("exist");

    // 模擬圖片粘貼
    const clipboardData = new DataTransfer();
    cy.fixture("past_image.jpeg", "base64").then((fileContent) => {
      const blob = Cypress.Blob.base64StringToBlob(fileContent, "image/jpeg");
      const file = new File([blob], "past_image.jpeg", { type: "image/jpeg" });
      clipboardData.items.add(file);

      cy.get('[data-cy="property-content-input"]').trigger("paste", {
        clipboardData,
      });
    });

    // 確保圖片 URL 被插入到內容中
    cy.get('[data-cy="property-content-input"]').should(
      "contain.value",
      "![Pasted Image](",
    );

    // 確保圖片預覽顯示正確
    cy.get('[data-cy="markdown-preview"]')
      .find("img")
      .should("have.attr", "src")
      .and("include", "/files/");
  });
});

const simulateDragDrop = (draggableSelector, destinationSelector) => {
  cy.get(draggableSelector).then(($el) => {
    const draggableId = $el.attr("data-rbd-draggable-id"); // 獲取 draggable ID
    const droppableId = destinationSelector
      .replace('[data-rbd-droppable-id="', "")
      .replace('"]', ""); // 獲取 droppable ID

    cy.window().then((win) => {
      const event = {
        draggableId,
        type: "DEFAULT",
        source: {
          droppableId: "todo", // 起始列 ID
          index: 0, // 起始列的 index
        },
        destination: {
          droppableId,
          index: 0, // 移動到的目標列 index
        },
      };

      // 直接調用 react-beautiful-dnd 的上下文
      win["reactBeautifulDndContext"].handleDragEnd(event);
    });
  });
};
