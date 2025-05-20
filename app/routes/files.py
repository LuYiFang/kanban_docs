from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import StreamingResponse

from database import get_db
from models.files import FileResponse, FileCreate
from services.files import (upload_file_service, get_file_service,
                            delete_file_service,
                            get_file_ids_by_filename_service)

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


@router.get("/filename/{filename}/ids")
async def get_file_ids_by_filename(filename: str, db=Depends(get_db)):
    """
    Retrieve file IDs by filename. Handles cases with multiple files having the same filename.
    """
    file_ids = await get_file_ids_by_filename_service(filename, db)
    return file_ids


@router.delete("/{file_id}")
async def delete_file(file_id: str, db=Depends(get_db)):
    """
    刪除檔案
    """
    is_success = await delete_file_service(file_id, db)
    if not is_success:
        raise HTTPException(status_code=404, detail="File not found")
    return is_success
