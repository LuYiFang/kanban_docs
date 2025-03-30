import datetime
import uuid

from database import db


async def upsert_task(task_id: str, updates: dict) -> dict:
    update_data = {
        "$set": updates,
        "$currentDate": {"updatedAt": True},
    }

    if not task_id:
        task_id = str(uuid.uuid4())
        update_data["$setOnInsert"] = {
            "createdAt": datetime.datetime.now()
        }

    print('update_data', update_data, flush=True)

    result = await db.tasks.find_one_and_update(
        {"_id": task_id},
        update_data,
        upsert=True,
        return_document=True
    )

    print('result', result, flush=True)

    if result:
        result["_id"] = str(result["_id"])
    return result


async def delete_task_by_id(task_id: str) -> bool:
    result = await db.tasks.delete_one({"_id": task_id})
    return result.deleted_count > 0
