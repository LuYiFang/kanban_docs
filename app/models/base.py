from datetime import datetime, timezone

from pydantic import BaseModel, field_validator


class TransformDate(BaseModel):
    createdAt: datetime
    updatedAt: datetime

    @field_validator("createdAt", "updatedAt", mode="before")
    def parse_datetime(cls, value):
        if isinstance(value, str):
            return datetime.fromisoformat(value)
        return value


class BaseResponse(BaseModel):
    id: str
    createdAt: str
    updatedAt: str

    @field_validator("createdAt", "updatedAt", mode="before")
    def parse_datetime(cls, value):
        if isinstance(value, datetime):
            utc_time = value.replace(tzinfo=timezone.utc)
            return utc_time.isoformat()
        return value
