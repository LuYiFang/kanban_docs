from repositories.base import upsert_document, delete_document_by_id


async def upsert_task(task_id: str, updates: dict) -> dict:
    return await upsert_document("tasks", task_id, updates)


async def delete_task_by_id(task_id: str) -> bool:
    return await delete_document_by_id("tasks", task_id)

