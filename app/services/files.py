from models.files import FileCreate, FileResponse
from repositories.files import save_file, get_file, delete_file
from motor.core import AgnosticDatabase
from fastapi import HTTPException


async def upload_file_service(file: FileCreate,
                              db: AgnosticDatabase) -> FileResponse:
    file_id = await save_file(file.data, file.filename, file.content_type, db)
    return FileResponse(id=file_id, url=f"/files/{file_id}")


async def get_file_service(file_id: str, db: AgnosticDatabase):
    file = await get_file(file_id, db)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return file


async def delete_file_service(file_id: str, db: AgnosticDatabase) -> bool:
    return await delete_file(file_id, db)
