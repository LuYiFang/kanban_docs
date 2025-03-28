from typing import List

from fastapi import APIRouter, HTTPException

from database import db
from models import Task, Column

router = APIRouter()


@router.post("/columns/{column_id}/tasks", response_model=Task)
async def add_task_to_column(column_id: str, task: Task):
    column = await db.columns.find_one({"id": column_id})
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")

    if any(t["id"] == task.id for t in column["tasks"]):
        raise HTTPException(status_code=400, detail="Task ID already exists")

    column["tasks"].append(task.model_dump())
    await db.columns.update_one({"id": column_id},
                                {"$set": {"tasks": column["tasks"]}})
    return task


@router.get("/columns", response_model=List[Column])
async def get_columns():
    columns = await db.columns.find().to_list(100)
    return columns


@router.delete("/columns/{column_id}/tasks/{task_id}")
async def delete_task(column_id: str, task_id: str):
    column = await db.columns.find_one({"id": column_id})
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")

    column["tasks"] = [task for task in column["tasks"] if
                       task["id"] != task_id]
    await db.columns.update_one({"id": column_id},
                                {"$set": {"tasks": column["tasks"]}})
    return {"message": "Task deleted successfully"}
