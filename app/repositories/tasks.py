from typing import List

from database import db
from repositories.base import upsert_document, delete_document_by_id

collection_name = "tasks"


async def upsert_task(task_id: str, updates: dict) -> dict:
    return await upsert_document(collection_name, task_id, updates)


async def delete_task_by_id(task_id: str) -> bool:
    return await delete_document_by_id(collection_name, task_id)


async def get_tasks_with_properties_repo() -> List[dict]:
    pipeline = [
        {
            "$lookup": {
                "from": "properties",
                "localField": "_id",
                "foreignField": "taskId",
                "as": "properties"
            }
        },
        {
            "$project": {
                "id": "$_id",
                "title": 1,
                "content": 1,
                "createdAt": 1,
                "updatedAt": {
                    "$max": {
                        "$concatArrays": [
                            ["$updatedAt"],
                            {
                                "$map": {
                                    "input": "$properties",
                                    "as": "property",
                                    "in": "$$property.updatedAt"
                                }
                            }
                        ]
                    }
                },
                "properties": {
                    "$map": {
                        "input": "$properties",
                        "as": "property",
                        "in": {
                            "id": "$$property._id",
                            "name": "$$property.name",
                            "value": "$$property.value",
                            "createdAt": "$$property.createdAt",
                            "updatedAt": "$$property.updatedAt"
                        }
                    }
                }
            }
        }
    ]

    result = await db[collection_name].aggregate(pipeline).to_list(length=None)
    return result
