import { setupInterceptors } from "../mocks/docsInterceptors";
import { setupBaseInterceptors } from "../mocks/base";

describe("DocsPage", () => {
  beforeEach(() => {
    setupBaseInterceptors();
    setupInterceptors();
    cy.viewport(1280, 720); // 設置固定的視窗尺寸
    cy.visit("/#/docs"); // 確保訪問正確的 docs 頁面
    cy.wait("@getDocs");
  });

  it("should display the documents", () => {
    // 驗證文檔頁面標題是否正確顯示
    cy.get("h1").contains("Documents").should("be.visible");

    // 驗證標籤區域是否正確顯示並包含 3 個標籤
    cy.get("[data-cy=all-tags]")
      .children()
      .first()
      .children()
      .should("have.length", 3);

    // 驗證搜索輸入框是否可見
    cy.get("[data-cy=search-input]").should("be.visible");

    // 驗證文檔佈局是否存在且初始為空
    cy.get(".layout").should("exist");
    cy.get(".layout").children().should("have.length", 0);
  });

  it("should filter documents by tag", () => {
    // 點擊標籤 "Tag2" 並驗證過濾後的文檔數量
    cy.get("[data-cy=kanban-task-tags]").contains("Tag2").click();
    verifyFilteredResults(2);

    // 點擊第一個文檔並驗證佈局中顯示的文檔數量
    cy.get("[data-cy=tag-documents]").children().first().click();
    cy.get(".layout").children().should("have.length", 1);

    // 點擊第二個文檔並驗證佈局中顯示的文檔數量
    cy.get("[data-cy=tag-documents]").children().eq(1).click();
    cy.get(".layout").children().should("have.length", 2);

    // 再次點擊第一個文檔並驗證佈局中顯示的文檔數量
    cy.get("[data-cy=tag-documents]").children().first().click();
    cy.get(".layout").children().should("have.length", 1);
  });

  it("should filter documents by search term", () => {
    // 在搜索框中輸入 "Tast" 並驗證過濾後的文檔數量
    cy.get("[data-cy=search-input]").type("Tast");
    verifyFilteredResults(6);

    cy.get("[data-cy=tag-documents]").children().contains("Regular Task");

    // 選擇第一個結果並驗證佈局中顯示的文檔數量
    cy.get("[data-cy=tag-documents]").children().first().click();
    cy.get(".layout").children().should("have.length", 1);

    // 清空搜索框並輸入 "Tast"，選擇第二個結果
    cy.get("[data-cy=search-input]").clear().type("Tast");
    cy.get("[data-cy=tag-documents]").children().eq(1).click();
    cy.get(".layout").children().should("have.length", 2);

    cy.get("[data-cy=search-input]").clear().type("Tag3");
    cy.get("[data-cy=tag-documents]").children().contains("Task C Title");
    cy.get("[data-cy=search-input]").clear().type("low");
    cy.get("[data-cy=tag-documents]").children().contains("Regular Task 1");
  });

  it("should pin and unpin a document", () => {
    // 選擇標籤 "Tag2" 並選中兩個文檔
    cy.get("[data-cy=kanban-task-tags]").contains("Tag2").click();
    cy.get("[data-cy=tag-documents]").children().first().click();
    cy.get("[data-cy=tag-documents]").children().eq(1).click();

    // 選擇標籤 "Tag3" 並選中一個文檔
    cy.get("[data-cy=kanban-task-tags]").contains("Tag3").click();
    cy.get("[data-cy=tag-documents]").children().first().click();

    // 驗證佈局中顯示的文檔數量
    cy.get(".layout").children().should("have.length", 3);

    // 取消固定第二個文檔並驗證佈局中的文檔數量
    cy.get("[data-cy=unpinned-task-id-2]").click();
    cy.get(".layout").children().should("have.length", 2);

    // 驗證剩餘的文檔是否正確存在
    cy.get("[data-cy=doc-card-id-task-id-1]").should("exist");
    cy.get("[data-cy=doc-card-id-task-id-3]").should("exist");
  });

  it("should resize documents", () => {
    // 選擇標籤 "Tag2" 並選中第一個文檔
    cy.get("[data-cy=kanban-task-tags]").contains("Tag2").click();
    cy.get("[data-cy=tag-documents]").children().first().click();

    // 確保元素已完全渲染
    cy.get("[data-cy=doc-card-id-task-id-1]").should("be.visible");

    // 調整文檔大小
    cy.get(
      "[data-cy=doc-card-id-task-id-1] .react-resizable-handle.react-resizable-handle-ne",
    )
      .trigger("mousedown", { clientX: 200, clientY: 200 }) // 起始位置
      .trigger("mousemove", { clientX: 50, clientY: 350 }) // 往左下移動
      .trigger("mouseup"); // 結束拖動

    // 驗證文檔的寬度和高度是否符合條件
    cy.get("[data-cy=doc-card-id-task-id-1]")
      .invoke("outerWidth")
      .should("be.lessThan", 800);

    cy.get("[data-cy=doc-card-id-task-id-1]")
      .invoke("outerHeight")
      .should("be.lessThan", 500);
  });

  it("should drag and drop a document", () => {
    // 選擇標籤 "Tag2" 並選中兩個文檔
    cy.get("[data-cy=kanban-task-tags]").contains("Tag2").click();
    cy.get("[data-cy=tag-documents]").children().first().click();
    cy.get("[data-cy=tag-documents]").children().eq(1).click();

    // 模擬拖放操作，將第一個文檔移動到新位置
    cy.get("[data-cy=doc-drag-top]")
      .first()
      .trigger("mousedown", { clientX: 0, clientY: 0, force: true }) // 起始位置
      .trigger("mousemove", { clientX: 300, clientY: 1500, force: true }) // 拖動到目標位置
      .trigger("mouseup", { force: true }); // 釋放鼠標按鈕

    // 驗證文檔的樣式是否發生變化，確保位置已更新
    cy.get("[data-cy=doc-card-id-task-id-1]")
      .invoke("attr", "style")
      .then((style) => {
        expect(style).to.include("transform: translate");
        expect(style).to.not.equal("transform: translate(10px, 10px);"); // 確保與原始位置不同
      });
  });

  it("should interact with MultiInteractiveSelect", () => {
    // 選擇標籤 "Tag2" 並選中兩個文檔
    cy.get("[data-cy=kanban-task-tags]").contains("Tag2").click();
    cy.get("[data-cy=tag-documents]").children().first().click();
    cy.get("[data-cy=tag-documents]").children().eq(1).click();

    // 驗證 MultiInteractiveSelect 是否可見
    cy.get("[data-cy=multi-interactive-select]")
      .first()
      .should("be.visible")
      .within(() => {
        cy.get("[data-cy=add-property-button]").click();

        // 驗證選中的選項是否正確顯示
        cy.get("[data-cy=property-select-options]")
          .children()
          .should("have.length", 3);

        // 再次打開 MultiInteractiveSelect 並選擇第二個選項
        cy.get("[data-cy=property-select-option]").eq(2).click();

        // 驗證選中的選項數量是否更新
        cy.get("[data-cy=multi-interactive-select-selected]")
          .children()
          .should("have.length", 4);

        // 移除第一個選中的選項
        cy.get("[data-cy=multi-interactive-select-selected]")
          .children()
          .first()
          .find("[data-cy=remove-selected-option]")
          .click();

        // 驗證選中的選項數量是否減少
        cy.get("[data-cy=multi-interactive-select-selected]")
          .children()
          .should("have.length", 3);
      });
  });

  it("should save and reload the layout", () => {
    // Step 1: 用 tag 點兩個 card
    cy.get("[data-cy=kanban-task-tags]").contains("Tag2").click();
    cy.get("[data-cy=tag-documents]").children().eq(0).click();
    cy.get("[data-cy=tag-documents]").children().eq(1).click();

    // // Step 2: 用 search 點一個 card
    cy.get("[data-cy=search-input]").type("task");
    cy.wait(500);
    cy.get("[data-cy=tag-documents]").children().eq(0).click();

    cy.get("[data-cy=doc-card-id-task-id-1] .react-resizable-handle-ne")
      .trigger("mousedown", { clientX: 600, clientY: 500, force: true })
      .trigger("mousemove", { clientX: 0, clientY: 0, force: true })
      .trigger("mouseup");

    cy.get("[data-cy=doc-card-id-task-id-2] .react-resizable-handle-ne")
      .trigger("mousedown", { clientX: 600, clientY: 500, force: true })
      .trigger("mousemove", { clientX: 0, clientY: 0, force: true })
      .trigger("mouseup");

    // Step 4: 將第二個 card 拖移到與第一個並行
    cy.get("[data-cy=doc-card-id-task-id-2] [data-cy=doc-drag-top]")
      .trigger("mousedown", { clientX: 0, clientY: 0, force: true })
      .trigger("mousemove", { clientX: 600, clientY: 600, force: true })
      .trigger("mouseup", { force: true });

    // Step 5: 儲存 layout
    cy.get("#save-layout-button").click();

    // Step 6: Reload 並檢查 layout
    cy.reload();
    cy.wait("@getDocs");

    // 驗證第一個和第二個 card 的大小和位置
    cy.get("[data-cy=doc-card-id-task-id-1]")
      .invoke("outerWidth")
      .should("be.lessThan", 800);

    cy.get("[data-cy=doc-card-id-task-id-2]")
      .invoke("outerWidth")
      .should("be.lessThan", 800);

    // 驗證第二個 card 與第一個 card 並行
    cy.get("[data-cy=doc-card-id-task-id-1]")
      .invoke("attr", "style")
      .then((style1) => {
        const translateY1 = style1.match(/translate\([^,]+, ([^)]+)\)/)?.[1];

        cy.get("[data-cy=doc-card-id-task-id-2]")
          .invoke("attr", "style")
          .then((style2) => {
            const translateY2 = style2.match(
              /translate\([^,]+, ([^)]+)\)/,
            )?.[1];
            expect(translateY1).to.equal(translateY2); // 驗證 y 軸值相同
          });
      });
  });

  it("should add a new document", () => {
    // 點擊新增文檔按鈕
    cy.get("#add-task-button").click();

    // 填寫文檔標題和內容
    cy.get("[data-cy=title-input]").type("New Document Title");
    cy.get('[data-cy="editor-content"] .mdxeditor-root-contenteditable').type(
      "This is the content of the new document.",
    );

    // 等待 5 秒以確保自動保存觸發
    cy.wait(3500);

    // 確保 API 被呼叫
    cy.wait("@updateDoc").its("response.statusCode").should("eq", 200);
  });

  function verifyFilteredResults(expectedCount: number) {
    // 驗證過濾後的文檔數量
    cy.get("[data-cy=tag-documents]")
      .children()
      .should("have.length", expectedCount);
  }
});
