from typing import List, Dict, Any

from motor.core import AgnosticDatabase

from models.properties import (TaskPropertyResponse, PropertyTypeCreate,
                               PropertyConfigConfigCreate, OptionCreate)
from repositories.base import (upsert_document, delete_document_by_id,
                               batch_insert_documents)

collection_name = "task_properties"


async def upsert_task_property(property_id: str, updates: dict,
                               db: AgnosticDatabase) -> dict:
    return await upsert_document(collection_name, property_id, updates, db)


async def batch_insert_task_properties(properties: List[Dict[str, Any]],
                                       db: AgnosticDatabase) -> List[
    TaskPropertyResponse]:
    return await batch_insert_documents(collection_name, properties, db)


async def delete_task_property_by_id(property_id: str,
                                     db: AgnosticDatabase) -> bool:
    return await delete_document_by_id(collection_name, property_id, db)


async def delete_task_properties_by_task_id(task_id: str,
                                            db: AgnosticDatabase) -> bool:
    result = await db[collection_name].delete_many({'taskId': task_id})
    return result.deleted_count > 0


async def get_all_property_option(db: AgnosticDatabase) -> List[dict]:
    pipeline = [
        {
            "$lookup": {
                "from": "options",
                "localField": "_id",
                "foreignField": "propertyId",
                "as": "options"
            }
        },
        {
            "$lookup": {
                "from": "property_types",
                "localField": "typeId",
                "foreignField": "_id",
                "as": "type"
            }
        },
        {
            "$unwind": {
                "path": "$type",
                "preserveNullAndEmptyArrays": True
            }
        },
        {
            "$project": {
                "id": "$_id",
                "name": 1,
                "typeId": 1,
                "type": {
                    "id": "$type._id",
                    "name": "$type.name",
                    "createdAt": "$type.createdAt",
                    "updatedAt": "$type.updatedAt"
                },
                "options": {
                    "$map": {
                        "input": "$options",
                        "as": "option",
                        "in": {
                            "id": "$$option._id",
                            "propertyId": "$$option.propertyId",
                            "name": "$$option.name",
                            "createdAt": "$$option.createdAt",
                            "updatedAt": "$$option.updatedAt"
                        }
                    }
                },
                "createdAt": 1,
                "updatedAt": 1
            }
        }
    ]
    result = await db["property_configs"].aggregate(pipeline).to_list(
        length=None)
    return result


async def upsert_property_option(property_id: str, updates: dict,
                                 db: AgnosticDatabase) -> dict:
    return await upsert_document('property_options', property_id, updates, db)


async def batch_upsert_property_option(documents: List[OptionCreate],
                                       db: AgnosticDatabase) -> list:
    return await batch_insert_documents('property_options',
                                        [doc.model_dump() for doc in
                                         documents], db)


async def batch_upsert_property_types(documents: List[PropertyTypeCreate],
                                      db: AgnosticDatabase) -> list:
    return await batch_insert_documents('property_types',
                                        [doc.model_dump() for doc in
                                         documents],
                                        db)


async def batch_upsert_property_config(
        documents: List[PropertyConfigConfigCreate],
        db: AgnosticDatabase) -> list:
    return await batch_insert_documents('property_configs',
                                        [doc.model_dump() for doc in
                                         documents],
                                        db)
