from repositories.tasks import upsert_task, delete_task_by_id
from routes.tasks import TaskResponse
from services.base import upsert_service, delete_service


async def upsert_task_service(task_id: str, updates: dict) -> TaskResponse:
    return await upsert_service(upsert_task, task_id, updates, TaskResponse)


async def delete_task_service(task_id: str) -> bool:
    return await delete_service(delete_task_by_id, task_id)
