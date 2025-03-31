from typing import List, Dict, Any

from database import db
from repositories.base import (upsert_document, delete_document_by_id,
                               batch_insert_documents)

collection_name = "properties"


async def upsert_property(property_id: str, updates: dict) -> dict:
    return await upsert_document(collection_name, property_id, updates)


async def batch_insert_properties(properties: List[Dict[str, Any]]) -> list:
    return await batch_insert_documents(collection_name, properties)


async def delete_property_by_id(property_id: str) -> bool:
    return await delete_document_by_id(collection_name, property_id)


async def delete_properties_by_task_id(task_id: str) -> bool:
    result = await db[collection_name].delete_many({'taskId': task_id})
    return result.deleted_count > 0
