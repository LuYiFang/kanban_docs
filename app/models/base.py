from datetime import datetime

from pydantic import BaseModel, field_validator, Field


class TransformDate(BaseModel):
    createdAt: datetime
    updatedAt: datetime

    @field_validator("createdAt", "updatedAt", mode="before")
    def parse_datetime(cls, value):
        if isinstance(value, str):
            return datetime.fromisoformat(value)
        return value


class BaseResponse(BaseModel):
    id: str = Field(..., alias="_id")
    createdAt: str
    updatedAt: str

    @field_validator("createdAt", "updatedAt", mode="before")
    def parse_datetime(cls, value):
        if isinstance(value, datetime):
            return value.strftime("%Y/%m/%d %H:%M:%S")
        return value
