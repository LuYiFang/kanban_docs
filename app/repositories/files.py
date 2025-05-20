from bson import ObjectId
from motor.core import AgnosticDatabase
from motor.motor_asyncio import AsyncIOMotorGridFSBucket


async def save_file(file_data: bytes, filename: str, content_type: str,
                    db: AgnosticDatabase) -> str:
    fs = AsyncIOMotorGridFSBucket(db)
    file_id = await fs.upload_from_stream(filename, file_data, metadata={
        "content_type": content_type})
    return str(file_id)


async def get_file(file_id: str, db: AgnosticDatabase):
    try:
        fs = AsyncIOMotorGridFSBucket(db)
        file = await fs.open_download_stream(ObjectId(file_id))
        return file
    except Exception as e:
        print(f"Error retrieving file: {e}")
        return None


async def get_file_ids_by_filename(filename: str, db: AgnosticDatabase):
    try:
        fs = AsyncIOMotorGridFSBucket(db)
        cursor = fs.find({"filename": filename})
        files = await cursor.to_list(length=None)
        return [str(file.get('_id')) for file in files]
    except Exception as e:
        print(f"Error retrieving file IDs by filename: {e}")
        return []


async def delete_file(file_id: str, db: AgnosticDatabase) -> bool:
    try:
        fs = AsyncIOMotorGridFSBucket(db)
        await fs.delete(ObjectId(file_id))
        return True
    except Exception as e:
        print(f"Error deleting file: {e}")
        return False
