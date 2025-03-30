from pydantic import BaseModel, Field

from models.base import BaseResponse


class PropertyBase(BaseModel):
    name: str = Field(..., min_length=0, max_length=100,
                      description="Property name")
    value: str = Field(..., min_length=0, description="Property value")


class PropertyCreate(PropertyBase):
    taskId: str = Field(..., description="Associated Task ID")


class PropertyUpdate(PropertyBase):
    pass


class PropertyResponse(PropertyBase, BaseResponse):
    pass
