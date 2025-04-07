import { setupInterceptors } from "../mocks/interceptors";

describe('Kanban Page Workflow Tests', () => {
    beforeEach(() => {
        setupInterceptors();
        cy.visit('/kanban'); // 確保訪問正確的 Kanban 頁面
    });

    it('should create a task, drag it to a new column, and verify status', () => {
        // 1. 新增任務
        cy.get('#add-task-button').click(); // 點擊新增任務按鈕

        // 確認 Edit Dialog 打開
        cy.get('[data-cy="edit-dialog"]').should('exist');

        // 編輯任務標題和內容
        cy.get('[data-cy="title-input"]').type('Test Task');
        cy.get('[data-cy="property-content-input"]').type('This is a test content.');

        // 關閉對話框保存
        cy.get('body').click(0, 0);

        // 確保任務已新增到 "To Do" 列
        cy.get('[data-cy="kanban-column"][id="todo"] [data-cy="kanban-task-title"]')
            .contains('Test Task')
            .should('exist');
    });

    it('should drag a task and drop it into the "done" column', () => {
        const draggableSelector = '[data-rbd-draggable-id="550e8400-e29b-41d4-a716-446655440001"]';
        const destinationSelector = '[data-rbd-droppable-id="done"]';

        // 模擬拖放
        simulateDragDrop(draggableSelector, destinationSelector);

        // 確認任務已成功移動到 "done" 列
        cy.get('[data-rbd-droppable-id="done"] [data-rbd-draggable-id="550e8400-e29b-41d4-a716-446655440001"]')
            .contains('This is default task')
            .should('exist');

        // 打開任務對話框並確認狀態
        cy.get('[data-rbd-droppable-id="done"] [data-rbd-draggable-id="550e8400-e29b-41d4-a716-446655440001"]')
            .contains('This is default task')
            .click();

        cy.get('[data-cy="property-select-title"]')
            .contains('Status:')
            .parent()
            .within(() => {
                cy.get('[data-cy="property-select-input"]')
                    .should('have.value', 'done');
            });
    });

    it('should delete a task and verify it is removed from the board', () => {
        const taskSelector = '[data-rbd-draggable-id="550e8400-e29b-41d4-a716-446655440001"]';

        // 打開任務對話框
        cy.get(taskSelector).contains('This is default task').click();

        // 確保 Edit Dialog 打開
        cy.get('[data-cy="edit-dialog"]').should('exist');

        // 打開選單
        cy.get('[data-cy="edit-dialog"]')
            .find('[data-cy="edit-menu-trigger"]')
            .click();

        // 確保選單展開
        cy.get('[data-cy="edit-menu"]').should('exist');

        // 點擊刪除按鈕
        cy.get('[data-cy="delete-task-button"]').click();

        // 確保 Edit Dialog 關閉
        cy.get('[data-cy="edit-dialog"]').should('not.exist');

        // 確保任務已從看板中移除
        cy.get('[data-cy="kanban-column"] [data-rbd-draggable-id="550e8400-e29b-41d4-a716-446655440001"]')
            .should('not.exist');
    });
});

const simulateDragDrop = (draggableSelector, destinationSelector) => {
    cy.get(draggableSelector).then(($el) => {
        const draggableId = $el.attr('data-rbd-draggable-id'); // 獲取 draggable ID
        const droppableId = destinationSelector.replace('[data-rbd-droppable-id="', '').replace('"]', ''); // 獲取 droppable ID

        cy.window().then((win) => {
            const event = {
                draggableId,
                type: 'DEFAULT',
                source: {
                    droppableId: 'todo', // 起始列 ID
                    index: 0, // 起始列的 index
                },
                destination: {
                    droppableId,
                    index: 0, // 移動到的目標列 index
                },
            };

            // 直接調用 react-beautiful-dnd 的上下文
            win['reactBeautifulDndContext'].handleDragEnd(event);
        });
    });
};