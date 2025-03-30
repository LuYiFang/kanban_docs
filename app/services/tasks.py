from repositories.tasks import upsert_task, delete_task_by_id
from routes.tasks import TaskResponse


async def upsert_task_service(task_id: str, updates: dict) -> TaskResponse:
    task = await upsert_task(task_id, updates)
    if task:
        return TaskResponse(**task)
    raise ValueError("Failed to upsert task")


async def delete_task_service(task_id: str) -> bool:
    return await delete_task_by_id(task_id)
