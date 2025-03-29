from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class TransformDate(BaseModel):
    createdAt: datetime
    updatedAt: datetime

    @field_validator("createdAt", "updatedAt", mode="before")
    def parse_datetime(cls, value):
        if isinstance(value, str):
            return datetime.fromisoformat(value)
        return value


class Task(TransformDate):
    id: str = Field(..., alias="_id")
    title: str
    content: str


class Property(TransformDate):
    id: str = Field(..., alias="_id")
    name: str
    taskId: str
    value: str
