from typing import List

from database import db
from repositories.base import upsert_document, delete_document_by_id


async def upsert_task(task_id: str, updates: dict) -> dict:
    return await upsert_document("tasks", task_id, updates)


async def delete_task_by_id(task_id: str) -> bool:
    return await delete_document_by_id("tasks", task_id)


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
                "updatedAt": 1,
                "properties": {
                    "id": "$_id",
                    "name": 1,
                    "value": 1,
                    "createdAt": 1,
                    "updatedAt": 1
                }
            }
        }
    ]

    result = await db.tasks.aggregate(pipeline).to_list(length=None)
    return result
