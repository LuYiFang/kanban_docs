from fastapi import APIRouter, HTTPException

from models.tasks import TaskResponse, TaskUpdate
from services.tasks import (upsert_task_service, delete_task_service)

router = APIRouter()


@router.post("/", response_model=TaskResponse)
async def create_task(task: TaskUpdate):
    try:
        task = await upsert_task_service('', task.model_dump())
        return task
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{task_id}", response_model=TaskResponse)
async def upsert_task_endpoint(task_id: str, updates: TaskUpdate):
    try:
        task = await upsert_task_service(task_id, updates.model_dump())
        return task
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{task_id}")
async def delete_task_endpoint(task_id: str):
    success = await delete_task_service(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}
