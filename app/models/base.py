from datetime import datetime

from pydantic import BaseModel, field_validator


class TransformDate(BaseModel):
    createdAt: datetime
    updatedAt: datetime

    @field_validator("createdAt", "updatedAt", mode="before")
    def parse_datetime(cls, value):
        if isinstance(value, str):
            return datetime.fromisoformat(value)
        return value
