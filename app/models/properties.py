from typing import Optional, List

from pydantic import BaseModel, Field

from models.base import BaseResponse, BaseISODate, BaseCreate


class TaskPropertyBase(BaseModel):
    name: str = Field(..., min_length=0, max_length=100,
                      description="Property name", example="location")
    value: str = Field(..., min_length=0, description="property value",
                       example="Taipei")


class TaskPropertyCreate(TaskPropertyBase):
    taskId: str = Field(..., example="550e8400-e29b-41d4-a716-446655440000")


class TaskPropertyUpdate(TaskPropertyCreate):
    pass


class TaskPropertyResponse(TaskPropertyBase, BaseResponse):
    id: str = Field(..., description="Unique Property ID",
                    example="550e8400-e29b-41d4-a716-446655440001")


class PropertyTypeBase(BaseModel):
    name: str = Field(..., min_length=0, max_length=100,
                      description="Name of the property type",
                      example="select")


class PropertyTypeCreate(PropertyTypeBase, BaseCreate):
    pass


class PropertyConfigBase(BaseModel):
    name: str = Field(..., min_length=0, max_length=100,
                      description="Name of the property",
                      example="Priority")
    typeId: str = Field(..., description="ID of the associated property type",
                        example="550e8400-e29b-41d4-a716-446655440000")


class PropertyConfigConfigCreate(PropertyConfigBase, BaseCreate):
    pass


class OptionBase(BaseModel):
    propertyId: str = Field(...,
                            description="ID of the property this option belongs to",
                            example="550e8400-e29b-41d4-a716-446655440000")
    name: str = Field(..., min_length=0, max_length=100,
                      description="Name of the option",
                      example="Project A")


class OptionCreate(OptionBase):
    pass


class OptionResponse(OptionBase, BaseISODate):
    id: str = Field(..., description="Unique ID for the option",
                    example="550e8400-e29b-41d4-a716-446655440001")


class PropertyConfigWithOptions(PropertyConfigBase):
    id: str = Field(..., description="Unique ID for the property",
                    example="550e8400-e29b-41d4-a716-446655440001")
    type: str = Field(..., description="The type of the property, resolved from typeId")

    options: Optional[List[OptionResponse]] = Field(
        ...,
        description="List of options associated with this property (only for select type)"
    )