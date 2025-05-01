from datetime import datetime, timedelta, timezone
from typing import List

from motor.core import AgnosticDatabase
from motor.motor_asyncio import AsyncIOMotorCollection

from models.tasks import TaskType
from repositories.base import upsert_document, delete_document_by_id

collection_name = "tasks"


async def upsert_task(task_id: str, updates: dict,
                      db: AgnosticDatabase) -> dict:
    return await upsert_document(collection_name, task_id, updates, db)


async def delete_task_by_id(task_id: str, db: AgnosticDatabase) -> bool:
    return await delete_document_by_id(collection_name, task_id, db)


async def get_tasks_with_properties_repo(task_type: TaskType,
                                         db: AgnosticDatabase) -> List[dict]:
    pipeline = [
        {
            "$lookup": {
                "from": "task_properties",
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
                "type": 1,
                "order": 1,
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
        },
    ]

    if task_type == "weekly":
        now = datetime.utcnow().replace(hour=0, minute=0, second=0,
                                        microsecond=0, tzinfo=timezone.utc)
        start_of_week = now - timedelta(days=now.weekday())
        end_of_week = start_of_week + timedelta(days=7)
        end_of_week = end_of_week.replace(hour=23, minute=59, second=59)

        pipeline.append({
            "$match": {
                "updatedAt": {
                    "$gte": start_of_week,
                    "$lt": end_of_week
                }
            }
        })

    result = await db[collection_name].aggregate(pipeline).to_list(length=None)
    return result


async def update_multiple_tasks(updates: List[dict], db: AgnosticDatabase) -> \
        List[dict]:
    collection: AsyncIOMotorCollection = db[collection_name]
    results = []
    for update in updates:
        task_id = update.get("id")
        if not task_id:
            continue
        update_data = {k: v for k, v in update.items() if k != "id"}
        result = await collection.find_one_and_update(
            {"_id": task_id},
            {"$set": update_data},
            return_document=True
        )
        if result:
            result["id"] = task_id
            results.append(result)
    return results
