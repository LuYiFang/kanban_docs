from pydantic import BaseModel, Field


class FileCreate(BaseModel):
    filename: str = Field(..., description="Name of the uploaded file")
    content_type: str = Field(..., description="MIME type of the file")
    data: bytes = Field(..., description="Binary data of the file")


class FileResponse(BaseModel):
    id: str = Field(..., description="Unique ID of the file")
    url: str = Field(..., description="URL to access the file")