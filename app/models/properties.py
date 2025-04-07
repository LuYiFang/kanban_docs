from pydantic import BaseModel, Field

from models.base import BaseResponse


class PropertyBase(BaseModel):
    name: str = Field(..., min_length=0, max_length=100,
                      description="Property name", example="location")
    value: str = Field(..., min_length=0, description="property value",
                       example="Taipei")


class PropertyCreate(PropertyBase):
    taskId: str = Field(..., example="550e8400-e29b-41d4-a716-446655440000")


class PropertyUpdate(PropertyCreate):
    pass


class PropertyResponse(PropertyBase, BaseResponse):
    id: str = Field(..., description="Unique Property ID",
                    example="550e8400-e29b-41d4-a716-446655440001")
    createdAt: str = Field(..., description="Creation timestamp",
                           example="2025-04-06T12:00:00Z")
    updatedAt: str = Field(..., description="Last update timestamp",
                           example="2025-04-06T15:30:00Z")
