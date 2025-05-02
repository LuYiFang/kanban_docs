from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.responses import StreamingResponse
from models.files import FileResponse, FileCreate
from services.files import upload_file_service, get_file_service
from database import get_db

router = APIRouter()


@router.post("/", response_model=FileResponse)
async def upload_file(file: UploadFile = File(...), db=Depends(get_db)):
    content = await file.read()
    file_create = FileCreate(
        filename=file.filename,
        content_type=file.content_type,
        data=content
    )
    return await upload_file_service(file_create, db)


@router.get("/{file_id}", response_class=StreamingResponse)
async def download_file(file_id: str, db=Depends(get_db)):
    file = await get_file_service(file_id, db)
    return StreamingResponse(
        file,
        media_type=file.metadata["content_type"],
        headers={"Content-Disposition": f"inline; filename={file.filename}"}
    )
