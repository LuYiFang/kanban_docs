from typing import List

from motor.core import AgnosticDatabase

from models.tasks import TaskWithPropertiesResponse
from repositories.tasks import (upsert_task, delete_task_by_id,
                                get_tasks_with_properties_repo)
from routes.tasks import TaskResponse
from services.base import upsert_service, delete_service


async def upsert_task_service(task_id: str, updates: dict, db: AgnosticDatabase) -> TaskResponse:
    return await upsert_service(upsert_task, task_id, updates, TaskResponse, db)


async def delete_task_service(task_id: str, db: AgnosticDatabase) -> bool:
    return await delete_service(delete_task_by_id, task_id, db)


async def get_tasks_with_properties_service(db: AgnosticDatabase) -> List[TaskWithPropertiesResponse]:
    tasks_with_properties = await get_tasks_with_properties_repo(db)
    return [TaskWithPropertiesResponse(**task) for task in tasks_with_properties]
