from typing import List

from fastapi import APIRouter, HTTPException, Depends

from database import get_db
from models.tasks import TaskResponse, TaskUpdate, TaskBatch
from services.tasks import (upsert_task_service, delete_task_service,
                            update_multiple_tasks_service)

router = APIRouter()


@router.post("/", response_model=TaskResponse)
async def create_task(task: TaskUpdate, db=Depends(get_db)):
    try:
        task = await upsert_task_service('', task.model_dump(), db)
        return task
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{task_id}", response_model=TaskResponse)
async def upsert_task_endpoint(task_id: str, updates: TaskUpdate, db=Depends(get_db)):
    try:
        task = await upsert_task_service(task_id, updates.model_dump(), db)
        return task
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{task_id}")
async def delete_task_endpoint(task_id: str, db=Depends(get_db)):
    success = await delete_task_service(task_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}


@router.post("/batch", response_model=List[TaskBatch])
async def update_multiple_tasks_endpoint(updates: List[TaskBatch], db=Depends(get_db)):
    try:
        updated_tasks = await update_multiple_tasks_service(updates, db)
        return updated_tasks
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))