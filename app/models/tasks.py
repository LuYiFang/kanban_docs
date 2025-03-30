from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class TaskBase(BaseModel):
    title: str = Field(..., min_length=0, max_length=100,
                       description="Task title")
    content: str = Field(..., min_length=0,
                         description="Detailed content of the task")


class TaskUpdate(TaskBase):
    pass


class TaskResponse(TaskBase):
    id: str = Field(..., alias="_id")
    createdAt: str
    updatedAt: str

    @field_validator("createdAt", "updatedAt", mode="before")
    def parse_datetime(cls, value):
        if isinstance(value, datetime):
            return value.strftime("%Y/%m/%d %H:%M:%S")
        return value
