from datetime import datetime, timezone

from fastapi import FastAPI
from pydantic import BaseModel, Field, field_validator

app = FastAPI()


class TransformDate(BaseModel):
    createdAt: datetime = Field(..., example="2025-04-06T12:00:00")
    updatedAt: datetime = Field(..., example="2025-04-06T15:30:00")

    @field_validator("createdAt", "updatedAt", mode="before")
    def parse_datetime(cls, value):
        if isinstance(value, str):
            return datetime.fromisoformat(value)
        return value


class BaseResponse(BaseModel):
    id: str = Field(..., example="550e8400-e29b-41d4-a716-446655440000")
    createdAt: str = Field(..., example="2025-04-06T12:00:00Z")
    updatedAt: str = Field(..., example="2025-04-06T15:30:00Z")

    @field_validator("createdAt", "updatedAt", mode="before")
    def parse_datetime(cls, value):
        if isinstance(value, datetime):
            utc_time = value.replace(tzinfo=timezone.utc)
            return utc_time.isoformat()
        return value
