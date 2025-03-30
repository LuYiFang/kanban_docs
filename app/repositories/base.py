import datetime
import uuid
from database import db


async def upsert_document(collection_name: str, doc_id: str,
                          updates: dict) -> dict:
    """
    通用的 upsert 方法，用於插入或更新文檔
    """
    update_data = {
        "$set": updates,
        "$currentDate": {"updatedAt": True},
    }

    if not doc_id:
        doc_id = str(uuid.uuid4())
        update_data["$setOnInsert"] = {
            "createdAt": datetime.datetime.utcnow()
        }

    result = await db[collection_name].find_one_and_update(
        {"_id": doc_id},
        update_data,
        upsert=True,
        return_document=True
    )

    if result:
        result["_id"] = str(result["_id"])
    return result


async def delete_document_by_id(collection_name: str, doc_id: str) -> bool:
    """
    通用的 delete 方法，用於刪除文檔
    """
    result = await db[collection_name].delete_one({"_id": doc_id})
    return result.deleted_count > 0
