export const setupBaseInterceptors = () => {
  // Get All Tasks With Properties
  cy.intercept("GET", "**/api/task/properties?task_type=task", {
    statusCode: 200,
    body: [
      {
        id: "task-id-1",
        createdAt: "2025-04-06T12:00:00Z",
        updatedAt: "2025-04-02T15:30:00Z",
        title: "This is default task",
        content: "default",
        order: 0,
        type: "task",
        properties: [
          {
            id: "property-id-priority",
            name: "priority",
            value: "option-id-low",
          },
          {
            id: "property-id-status",
            name: "status",
            value: "option-id-todo",
          },
          {
            id: "property-id-level",
            name: "level",
            value: "option-id-c-level",
          },
        ],
      },
      {
        id: "task-id-2",
        createdAt: "2025-04-06T14:00:00Z",
        updatedAt: "2025-05-01T15:45:00Z",
        title: "Second task",
        content:
          "This is the second task content.![link](https://api/files/edwefewf).",
        order: 1,
        type: "task",
        properties: [
          {
            id: "property-id-priority",
            name: "priority",
            value: "option-id-high",
          },
          {
            id: "property-id-status",
            name: "status",
            value: "option-id-todo",
          },
          {
            id: "property-id-level",
            name: "level",
            value: "option-id-b-level",
          },
          {
            id: "property-id-project",
            name: "project",
            value: "option-id-project-a",
          },
          {
            id: "property-id-epic",
            name: "epic",
            value: "task-id-3",
          },
        ],
      },
      {
        id: "task-id-3",
        createdAt: "2025-04-06T16:00:00Z",
        updatedAt: "2025-05-01T17:00:00Z",
        title: "Third task",
        content: "This is the third task content.",
        order: 0,
        type: "task",
        properties: [
          {
            id: "property-id-priority",
            name: "priority",
            value: "option-id-medium",
          },
          {
            id: "property-id-status",
            name: "status",
            value: "option-id-epic",
          },
          {
            id: "property-id-level",
            name: "level",
            value: "option-id-a-level",
          },
        ],
      },
    ],
  }).as("getAllTaskWithProperties");

  cy.intercept("GET", "**/property/properties/options", {
    statusCode: 200,
    body: [
      {
        id: "property-id-priority",
        name: "priority",
        typeId: "property-type-id-select",
        type: "select",
        options: [
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-priority",
            name: "High",
            id: "option-id-high",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-priority",
            name: "Medium",
            id: "option-id-medium",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-priority",
            name: "Low",
            id: "option-id-low",
          },
        ],
      },
      {
        id: "property-id-status",
        name: "status",
        typeId: "property-type-id-select",
        type: "select",
        options: [
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-status",
            name: "Todo",
            id: "option-id-todo",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-status",
            name: "In Progress",
            id: "option-id-in-progress",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-status",
            name: "Done",
            id: "option-id-done",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-status",
            name: "Epic",
            id: "option-id-epic",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-status",
            name: "Waiting",
            id: "option-id-waiting",
          },
        ],
      },
      {
        id: "property-id-level",
        name: "level",
        typeId: "property-type-id-select",
        type: "select",
        options: [
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-level",
            name: "A Level",
            id: "option-id-a-level",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-level",
            name: "B Level",
            id: "option-id-b-level",
          },
          // 加上 C,D level
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-level",
            name: "C Level",
            id: "option-id-c-level",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-level",
            name: "D Level",
            id: "option-id-d-level",
          },
        ],
      },
      {
        id: "property-id-epic",
        name: "epic",
        typeId: "property-type-id-select",
        type: "select",
        options: [],
      },
      {
        id: "property-id-project",
        name: "project",
        typeId: "property-type-id-select",
        type: "select",
        options: [
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-project",
            name: "Project A",
            id: "option-id-project-a",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-project",
            name: "Project B",
            id: "option-id-project-b",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-project",
            name: "Project D",
            id: "option-id-project-d",
          },
        ],
      },
      {
        id: "property-id-assignee",
        name: "assignee",
        typeId: "property-type-id-select",
        type: "select",
        options: [
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-assignee",
            name: "User A",
            id: "option-id-user-a",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-assignee",
            name: "User B",
            id: "option-id-user-b",
          },
        ],
      },
      {
        id: "property-id-tags",
        name: "tags",
        typeId: "property-type-id-multi-select",
        type: "multi_select",
        options: [
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-tags",
            name: "Tag1",
            id: "option-id-tag1",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-tags",
            name: "Tag2",
            id: "option-id-tag2",
          },
          {
            createdAt: "2025-04-06T12:00:00Z",
            updatedAt: "2025-04-06T15:30:00Z",
            propertyId: "property-id-tags",
            name: "Tag3",
            id: "option-id-tag3",
          },
        ],
      },
    ],
  }).as("getPropertiesOptions");

  // Delete File
  cy.intercept("DELETE", "**/api/files/*", {
    statusCode: 200,
    body: "12345678",
  }).as("deleteFile");
};
