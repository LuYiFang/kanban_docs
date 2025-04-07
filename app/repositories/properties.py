from typing import List, Dict, Any

from motor.core import AgnosticDatabase

from models.properties import PropertyResponse
from repositories.base import (upsert_document, delete_document_by_id,
                               batch_insert_documents)

collection_name = "properties"


async def upsert_property(property_id: str, updates: dict,
                          db: AgnosticDatabase) -> dict:
    return await upsert_document(collection_name, property_id, updates, db)


async def batch_insert_properties(properties: List[Dict[str, Any]],
                                  db: AgnosticDatabase) -> List[PropertyResponse]:
    return await batch_insert_documents(collection_name, properties, db)


async def delete_property_by_id(property_id: str,
                                db: AgnosticDatabase) -> bool:
    return await delete_document_by_id(collection_name, property_id, db)


async def delete_properties_by_task_id(task_id: str,
                                       db: AgnosticDatabase) -> bool:
    result = await db[collection_name].delete_many({'taskId': task_id})
    return result.deleted_count > 0
