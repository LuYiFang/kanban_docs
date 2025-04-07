export const setupInterceptors = () => {
    // Get All Tasks With Properties
    cy.intercept('GET', '**/api/task/properties', {
        statusCode: 200,
        body: [
            {
                id: '550e8400-e29b-41d4-a716-446655440001',
                createdAt: '2025-04-06T12:00:00Z',
                updatedAt: '2025-04-06T15:30:00Z',
                title: 'This is default task',
                content: 'default',
                properties: [
                    { id: '550e8400-e29b-41d4-a716-446655440004',name: "priority", value: "low" },
                    { id: '550e8400-e29b-41d4-a716-446655440005',name: "status", value: "todo" },
                    { id: '550e8400-e29b-41d4-a716-446655440006',name: "level", value: "c-level" },
                    { id: '550e8400-e29b-41d4-a716-446655440007',name: "assignee", value: "" },
                    { id: '550e8400-e29b-41d4-a716-446655440008',name: "deadline", value: "" },
                    { id: '550e8400-e29b-41d4-a716-446655440009',name: "finishedAt", value: "" },
                ],

            },
        ],
    }).as('getAllTaskWithProperties');

    // Create Task
    cy.intercept('POST', '**/task', {
        statusCode: 200,
        body: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            createdAt: '2025-04-06T12:00:00Z',
            updatedAt: '2025-04-06T15:30:00Z',
            title: '',
            content: '',
        },
    }).as('createTask');

    // Create Batch Properties
    cy.intercept('POST', '**/property/batch', {
        statusCode: 200,
        body: [
            { name: "priority", value: "low" },
            { name: "status", value: "todo" },
            { name: "level", value: "c-level" },
            { name: "assignee", value: "" },
            { name: "deadline", value: "" },
            { name: "finishedAt", value: "" },
        ],
    }).as('createBatchProperties');

    // Update Task
    cy.intercept('PUT', '**/task/*', {
        statusCode: 200,
        body: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            createdAt: '2025-04-06T12:00:00Z',
            updatedAt: '2025-04-06T15:30:00Z',
            title: 'Test Task',
            content: 'This is a test content.',
        },
    }).as('updateTask');

    // Delete Task With Properties
    cy.intercept('DELETE', '**/task/*/properties', {
        statusCode: 200,
        body: {},
    }).as('deleteTaskWithProperties');

    // Update Property
    cy.intercept('PUT', '**/property/*', {
        statusCode: 200,
        body: {
            id: '550e8400-e29b-41d4-a716-446655440005',
            createdAt: '2025-04-06T12:00:00Z',
            updatedAt: '2025-04-06T15:30:00Z',
            name: 'status',
            value: 'done',
        },
    }).as('updateProperty');

    // Delete Properties By Task
    cy.intercept('DELETE', '**/property/task/:taskId', {
        statusCode: 200,
        body: {},
    }).as('deletePropertiesByTask');
};