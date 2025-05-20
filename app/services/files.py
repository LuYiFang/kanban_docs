from fastapi import HTTPException
from motor.core import AgnosticDatabase

from models.files import FileCreate, FileResponse
from repositories.files import (save_file, get_file, delete_file,
                                get_file_ids_by_filename)


async def upload_file_service(file: FileCreate,
                              db: AgnosticDatabase) -> FileResponse:
    file_id = await save_file(file.data, file.filename, file.content_type, db)
    return FileResponse(id=file_id, url=f"/files/{file_id}")


async def get_file_service(file_id: str, db: AgnosticDatabase):
    file = await get_file(file_id, db)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return file


async def get_file_ids_by_filename_service(filename: str, db: AgnosticDatabase):
    file_ids = await get_file_ids_by_filename(filename, db)
    if not file_ids:
        raise HTTPException(status_code=404, detail="No files found with the given filename")
    return file_ids


async def delete_file_service(file_id: str, db: AgnosticDatabase) -> bool:
    return await delete_file(file_id, db)
