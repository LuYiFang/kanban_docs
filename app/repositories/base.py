import datetime
import uuid
from typing import Dict, List, Any

from motor.core import AgnosticDatabase


async def upsert_document(collection_name: str, doc_id: str,
                          updates: dict, db: AgnosticDatabase) -> dict:
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
        result["id"] = str(result["_id"])
    return result


async def batch_insert_documents(
        collection_name: str,
        documents: List[Dict[str, Any]],
        db: AgnosticDatabase
) -> list:
    """
    通用的批量 upsert 方法，用於插入或更新文檔
    """
    for doc in documents:
        data_now = datetime.datetime.utcnow()
        doc['_id'] = str(uuid.uuid4())
        doc['id'] = doc['_id']
        doc['updatedAt'] = data_now
        doc['createdAt'] = data_now

    await db[collection_name].insert_many(documents)
    return documents


async def delete_document_by_id(collection_name: str, doc_id: str,
                                db: AgnosticDatabase) -> bool:
    """
    通用的 delete 方法，用於刪除文檔
    """
    result = await db[collection_name].delete_one({"_id": doc_id})
    return result.deleted_count > 0
