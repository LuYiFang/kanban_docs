from typing import List

from motor.core import AgnosticDatabase

from models.tasks import TaskUpdate
from repositories.tasks import (upsert_task, delete_task_by_id,
                                update_multiple_tasks)
from routes.tasks import TaskResponse
from services.base import upsert_service, delete_service


async def upsert_task_service(task_id: str, updates: dict, db: AgnosticDatabase) -> TaskResponse:
    return await upsert_service(upsert_task, task_id, updates, TaskResponse, db)


async def delete_task_service(task_id: str, db: AgnosticDatabase) -> bool:
    return await delete_service(delete_task_by_id, task_id, db)


async def update_multiple_tasks_service(updates: List[TaskUpdate], db: AgnosticDatabase) -> List[dict]:
    if not updates:
        raise ValueError("No updates provided")
    updates_data = [update.model_dump() for update in updates]
    return await update_multiple_tasks(updates_data, db)
