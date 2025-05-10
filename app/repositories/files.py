from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from motor.core import AgnosticDatabase
from bson import ObjectId


async def save_file(file_data: bytes, filename: str, content_type: str,
                    db: AgnosticDatabase) -> str:
    fs = AsyncIOMotorGridFSBucket(db)
    file_id = await fs.upload_from_stream(filename, file_data, metadata={
        "content_type": content_type})
    return str(file_id)


async def get_file(file_id: str, db: AgnosticDatabase):
    fs = AsyncIOMotorGridFSBucket(db)
    file = await fs.open_download_stream(ObjectId(file_id))
    return file


async def delete_file(file_id: str, db: AgnosticDatabase) -> bool:
    fs = AsyncIOMotorGridFSBucket(db)
    await fs.delete(ObjectId(file_id))
    return True
