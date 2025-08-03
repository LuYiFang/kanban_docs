import { setupInterceptors } from "../mocks/EditorInterceptors";
import { setupBaseInterceptors } from "../mocks/base";

describe("Editor Workflow Tests", () => {
  beforeEach(() => {
    setupBaseInterceptors();
    setupInterceptors();
    cy.visit("/#/kanban"); // 確保訪問正確的 Kanban 頁面
  });

  // 確定 title 能修改
  it("should edit the task title and verify the change", () => {
    // 點擊第一個任務
    cy.get(
      '[data-cy="kanban-column"][id="option-id-todo"] [data-cy="kanban-task"]',
    )
      .first()
      .click();

    // 確保 Edit Dialog 打開
    cy.get('[data-cy="edit-dialog"]').should("exist");

    // 編輯任務標題
    const newTitle = "Updated Task Title";
    cy.get('[data-cy="title-input"]').clear().type(newTitle);

    // 關閉對話框保存
    cy.get("body").click(0, 0);

    // 確保任務標題已更新
    cy.get('[data-cy="kanban-task-title"]').contains(newTitle).should("exist");
  });

  // 能修改 task1的priority
  it("should edit the task priority and verify the change", () => {
    // 點擊第一個任務
    cy.get(
      '[data-cy="kanban-column"][id="option-id-todo"] [data-cy="kanban-task"]',
    )
      .first()
      .click();

    // 確保 Edit Dialog 打開
    cy.get('[data-cy="edit-dialog"]').should("exist");

    cy.get("[data-cy=toggle-properties]").click();

    // 編輯任務優先級
    cy.get('[data-cy="property-select-title"]')
      .contains("Priority:")
      .parent()
      .within(() => {
        const interactiveInputSelector = '[data-cy="property-select-input"]';
        cy.get(interactiveInputSelector).click();

        // 點選 option high
        cy.get('[data-cy="property-select-search"]')
          .parent()
          .find("div")
          .contains("High")
          .click();
      });

    // 關閉對話框保存
    cy.get("body").click(0, 0);

    // 確保任務優先級已更新
    cy.get(
      '[data-cy="kanban-column"][id="option-id-todo"] [data-cy="kanban-task"]',
    )
      .first()
      .within(() => {
        cy.get('[data-cy="kanban-task-priority"]')
          .contains("High")
          .should("exist");
      });
  });

  // loading進頁面，點開task，點開 epic，確定裡面有2個task
  it("should load the Kanban board and verify task count in Epic", () => {
    // 確保 Kanban Board 正確加載
    cy.get('[data-cy="kanban-column"]').should("exist");

    // 點開第一個task
    cy.get(
      '[data-cy="kanban-column"][id="option-id-todo"] [data-cy="kanban-task"]',
    )
      .first()
      .click();

    // 確保 Edit Dialog 打開
    cy.get('[data-cy="edit-dialog"]').should("exist");

    cy.get("[data-cy=toggle-properties]").click();

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
      .find("div")
      .should("have.length", 2);
  });

  it("should add a new project option and verify it exists in the options list", () => {
    const newProjectName = "New Project";

    // 打開任務對話框
    cy.get('[data-rbd-draggable-id="task-id-1"]').click();

    // 確保 Edit Dialog 打開
    cy.get('[data-cy="edit-dialog"]').should("exist");

    cy.get("[data-cy=toggle-properties]").click();

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
          .find("div")
          .contains(newProjectName)
          .should("exist");
      });

    // 關閉 Edit Dialog，點開另一個任務，點開第一個選項，確定新選項有出現在選項列表中
    cy.get("body").click(0, 0);
    cy.get('[data-rbd-draggable-id="task-id-2"]').click();
    cy.get('[data-cy="edit-dialog"]').should("exist");
    cy.get("[data-cy=toggle-properties]").click();
    cy.get('[data-cy="edit-dialog"]')
      .find('[data-cy="property-select-input"]')
      .first()
      .click();
    cy.get('[data-cy="property-select-search"]')
      .parent()
      .find("div")
      .contains(newProjectName)
      .should("exist");
  });

  it("should paste an image into the editor and verify it is uploaded", () => {
    // 打開任務對話框
    cy.get('[data-rbd-draggable-id="task-id-1"]').click();

    // 確保 Edit Dialog 打開
    cy.get('[data-cy="edit-dialog"]').should("exist");

    // 模擬圖片粘貼
    const clipboardData = new DataTransfer();
    cy.fixture("past_image.jpeg", "base64").then((fileContent) => {
      const blob = Cypress.Blob.base64StringToBlob(fileContent, "image/jpeg");
      const file = new File([blob], "past_image.jpeg", { type: "image/jpeg" });
      clipboardData.items.add(file);

      cy.get(
        '[data-cy="editor-content"] .mdxeditor-root-contenteditable',
      ).trigger("paste", {
        clipboardData,
      });
    });

    //檢查有沒有去打uploadFile
    cy.wait("@uploadFile").its("response.statusCode").should("eq", 200);

    // 確保圖片 URL 被插入到內容中
    cy.get('[data-editor-block-type="image"]').should("exist");

    // 等自動儲存好
    cy.wait(4000);

    //檢查有沒有去撈 img
    cy.wait("@getFile").its("response.statusCode").should("eq", 200);

    // 刪除圖片
    cy.get('[data-editor-block-type="image"] button').first().click();
    //
    // 等待 4 秒以確保刪除 API 被觸發
    cy.wait(4000);

    // 檢查是否觸發 deleteFile API
    cy.wait("@deleteFile").its("response.statusCode").should("eq", 200);

    // 確保圖片已被刪除
    cy.get('[data-editor-block-type="image"]').should("not.exist");
  });

  // 測試 insert code block 輸入 mermaid 語法，mdxeditor 有沒有正確顯示mermaid svg
  it("should insert a code block with mermaid syntax and verify rendering", () => {
    // 打開任務對話框
    cy.get('[data-rbd-draggable-id="task-id-1"]').click();

    // 確保 Edit Dialog 打開
    cy.get('[data-cy="edit-dialog"]').should("exist");

    // 插入 code block
    cy.get(".mdxeditor-toolbar > button").eq(3).click();

    // 選擇 mermaid
    cy.get('[data-cy="editor-content"] .mdxeditor-root-contenteditable button')
      .first()
      .click();
    cy.get(".mdxeditor-popup-container .mdxeditor-select-content")
      .contains("Mermaid")
      .click();

    Cypress.on("uncaught:exception", (err) => {
      if (
        err.message.includes("UnknownDiagramError") ||
        err.message.includes("No diagram type detected")
      ) {
        return false;
      }
    });

    // 插入 mermaid 語法
    const mermaidSyntax = `classDiagram
    class User {
        + string Name
        + int Age
        + login()
    }
    `;

    cy.get('[data-cy="mermaid-code-editor"]').type(mermaidSyntax);

    Cypress.on("uncaught:exception", (err) => {
      if (
        err.message.includes("UnknownDiagramError") ||
        err.message.includes("No diagram type detected")
      ) {
        return false;
      }
    });

    // 確保 mermaid SVG 被正確渲染
    cy.get(".mermaid svg")
      .should("exist")
      .and("have.attr", "id")
      .and("match", /^graphDiv-mermaid/);

    // 刪除 mermaid code block
    cy.get('[data-cy="delete-mermaid-block-button"]').click();
    cy.wait(3000);
    cy.get(".mermaid").should("not.exist");
  });

  // 測試編輯器內容自動保存
  it("should auto-save the editor content after 3 seconds of inactivity", () => {
    // 打開第一個任務
    cy.get('[data-rbd-draggable-id="task-id-1"]').click();

    // 確保 Edit Dialog 打開
    cy.get('[data-cy="edit-dialog"]').should("exist");

    // 修改編輯器內容
    const newContent = " This is the updated content.";
    cy.get('[data-cy="editor-content"] .mdxeditor-root-contenteditable')
      // .clear()
      .type(newContent);

    // 等待 5 秒以確保自動保存觸發
    cy.wait(3500);

    // 確保 API 被呼叫
    cy.wait("@updateTask").its("response.statusCode").should("eq", 200);
  });

  it("should auto-save after 3 seconds of inactivity and continue editing", () => {
    // 打開第一個任務
    cy.get('[data-rbd-draggable-id="task-id-1"]').click();

    // 確保 Edit Dialog 打開
    cy.get('[data-cy="edit-dialog"]').should("exist");

    // 修改編輯器內容
    const initialContent = "Initial content.";
    cy.get('[data-cy="editor-content"] .mdxeditor-root-contenteditable').type(
      initialContent,
    );

    // 等待 3 秒以觸發自動保存
    cy.wait(3500);

    // 繼續編輯內容
    const additionalContent = " Additional content.";
    cy.get('[data-cy="editor-content"] .mdxeditor-root-contenteditable').type(
      additionalContent,
    );

    // 再次等待 3 秒以觸發自動保存
    cy.wait(3500);

    // 確認編輯器內容包含所有修改
    cy.get('[data-cy="editor-content"] .mdxeditor-root-contenteditable').should(
      "contain",
      initialContent + additionalContent,
    );
  });

  it("should insert task markdown when clicking insert-task-button", () => {
    // 點選指定 task 卡片
    cy.get('[data-rbd-draggable-id="task-id-1"]').click();

    // 確保 Edit Dialog 打開
    cy.get('[data-cy="edit-dialog"]').should("exist");

    // 點進 markdown 編輯器
    cy.get(
      '[data-cy="editor-content"] .mdxeditor-root-contenteditable',
    ).click();

    // 點選工具列按鈕（假設是 bold）
    cy.get('[data-cy="insert-task-button"]').click();

    // 搜尋文件
    cy.get("[data-cy=search-input]").type("This is default");

    // 等待搜尋結果並點選第一個
    cy.get("[data-cy=tag-documents] > div")
      .first()
      .should("contain.text", "This is default task")
      .click();

    // 驗證文件是否成功插入／綁定（視 UI 而定）
    cy.get("[data-cy=editor-content]").should(
      "contain.text",
      "This is default task",
    );
  });
});
