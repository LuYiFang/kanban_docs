from typing import List

from pydantic import BaseModel, Field

from models.base import BaseResponse
from models.properties import PropertyResponse


class TaskBase(BaseModel):
    title: str = Field(..., min_length=0, max_length=100,
                       description="Task title")
    content: str = Field(..., min_length=0,
                         description="Detailed content of the task")


class TaskUpdate(TaskBase):
    pass


class TaskResponse(TaskBase, BaseResponse):
    pass


class TaskWithPropertiesResponse(BaseResponse, TaskBase):
    properties: List[PropertyResponse] = []
