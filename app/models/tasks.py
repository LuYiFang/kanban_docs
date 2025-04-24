from typing import List, Optional

from pydantic import BaseModel, Field

from models.base import BaseResponse
from models.properties import TaskPropertyResponse


class TaskBase(BaseModel):
    title: str = Field(..., min_length=0, max_length=100,
                       description="Task title",
                       example="Complete testing workflow")
    content: str = Field(..., min_length=0,
                         description="Detailed content of the task",
                         example="Implement and validate Cypress interceptors.")
    type: Optional[str] = Field("regular",
                                description="Task type (e.g., regular or daily)",
                                example="daily")
    order: int = Field(...,
                       description="Order of the task",
                       example=1)


class TaskUpdate(TaskBase):
    pass


class TaskBatch(TaskBase):
    id: str = Field(..., description="Unique Task ID")


class TaskResponse(TaskBase, BaseResponse):
    id: str = Field(..., description="Unique Task ID",
                    example="550e8400-e29b-41d4-a716-446655440000")
    createdAt: str = Field(..., description="Creation timestamp",
                           example="2025-04-06T12:00:00Z")
    updatedAt: str = Field(..., description="Last update timestamp",
                           example="2025-04-06T15:30:00Z")


class TaskWithPropertiesResponse(BaseResponse, TaskBase):
    properties: List[TaskPropertyResponse] = Field(
        ..., description="List of associated properties",
    )
