from typing import Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import db
from models import Task

router = APIRouter()


class PropertyResponse(BaseModel):
    id: str
    name: str
    value: str


class TaskResponse(BaseModel):
    id: str
    title: str
    content: str
    createdAt: str
    updatedAt: str
    properties: Dict[str, PropertyResponse]


@router.post("/task", response_model=Task)
async def create_task(task: Task):
    task_dict = task.model_dump(by_alias=True)
    result = await db.tasks.insert_one(task_dict)
    task.id = str(result.inserted_id)
    return task


@router.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: str):
    task_data = await db.tasks.find_one({"_id": task_id})
    if not task_data:
        raise HTTPException(status_code=404, detail="Task not found")
    return Task(**task_data)


@router.post("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, updates: Task):
    update_data = {k: v for k, v in
                   updates.model_dump(exclude_unset=True).items()}
    result = await db.tasks.update_one({"_id": task_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    updated_task = await db.tasks.find_one({"_id": task_id})
    return Task(**updated_task)


@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    task_result = await db.tasks.delete_one({"_id": task_id})
    if task_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    await db.properties.delete_many({"taskId": task_id})
    return {"message": "Task and its properties deleted successfully"}


@router.get("/tasks_with_properties", response_model=List[TaskResponse])
async def get_all_tasks_with_properties():
    tasks = await db.tasks.find().to_list(None)

    properties = await db.properties.find().to_list(None)

    property_map = {}
    for prop in properties:
        if prop["taskId"] not in property_map:
            property_map[prop["taskId"]] = []
        property_map[prop["taskId"]].append({
            "name": prop["name"],
            "value": prop["value"]
        })

    result = []
    for task in tasks:
        result.append({
            "title": task["title"],
            "content": task["content"],
            "createdAt": task["createdAt"],
            "updatedAt": task["updatedAt"],
            "properties": property_map.get(task["_id"], [])
        })

    return result
