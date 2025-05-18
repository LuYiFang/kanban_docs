import { setupInterceptors } from "../mocks/docsInterceptors";
import { setupBaseInterceptors } from "../mocks/base";

describe("DocsPage", () => {
  beforeEach(() => {
    setupBaseInterceptors();
    setupInterceptors();
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
    cy.get("[data-cy=tag-documents]").children().should("have.length", 2);

    // 點擊第一個文檔並驗證佈局中顯示的文檔數量
    cy.get("[data-cy=tag-documents]").children().first().click();
    cy.get(".layout").children().should("have.length", 1);

    // 驗證第一個文檔是否被選中
    cy.get("[data-cy=tag-documents]")
      .children()
      .first()
      .should("have.class", "bg-gray-700");

    // 點擊第二個文檔並驗證佈局中顯示的文檔數量
    cy.get("[data-cy=tag-documents]").children().eq(1).click();
    cy.get(".layout").children().should("have.length", 2);

    // 再次點擊第一個文檔並驗證佈局中顯示的文檔數量
    cy.get("[data-cy=tag-documents]").children().first().click();
    cy.get(".layout").children().should("have.length", 1);

    // 驗證文檔標題輸入框的值
    cy.get("[data-cy=title-input]").should("have.value", "Task B Title");
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

  it("should filter documents by search term", () => {
    // 在搜索框中輸入 "Tast" 並選擇第一個結果
    cy.get("[data-cy=search-input]").type("Tast");
    cy.get("[data-cy=search-dropdown]").children().eq(1).click();
    cy.get(".layout").children().should("have.length", 1);

    // 清空搜索框並輸入 "Tast"，選擇第二個結果
    cy.get("[data-cy=search-input]").clear();
    cy.get("[data-cy=search-input]").type("Tast");
    cy.get("[data-cy=search-dropdown]").children().eq(2).click();
    cy.get(".layout").children().should("have.length", 2);

    // 再次選擇第一個結果並驗證文檔是否存在
    cy.get("[data-cy=search-input]").clear();
    cy.get("[data-cy=search-input]").type("Tast");
    cy.get("[data-cy=search-dropdown]").children().eq(1).click();
    cy.get("[data-cy=doc-card-id-task-id-3]").should("exist");
  });

  it("should resize documents", () => {
    // 選擇標籤 "Tag2" 並選中第一個文檔
    cy.get("[data-cy=kanban-task-tags]").contains("Tag2").click();
    cy.get("[data-cy=tag-documents]").children().first().click();

    // 驗證文檔的初始寬度和高度，並模擬調整大小操作
    cy.get("[data-cy=doc-card-id-task-id-1]")
      .invoke("outerWidth")
      .then((task1Width) => {
        cy.get("[data-cy=doc-card-id-task-id-1]")
          .invoke("outerHeight")
          .then((task1Height) => {
            cy.get(
              "[data-cy=doc-card-id-task-id-1] .react-resizable-handle.react-resizable-handle-ne",
            )
              .trigger("mousedown", { clientX: 200, clientY: 200 }) // 起始位置
              .trigger("mousemove", { clientX: 50, clientY: 350 }) // 往左下移動
              .trigger("mouseup"); // 結束拖動

            // 驗證文檔的寬度和高度是否減少
            cy.get("[data-cy=doc-card-id-task-id-1]")
              .invoke("outerWidth")
              .should("be.lessThan", task1Width);

            cy.get("[data-cy=doc-card-id-task-id-1]")
              .invoke("outerHeight")
              .should("be.lessThan", task1Height);
          });
      });
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
});
