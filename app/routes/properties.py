from typing import List, Dict

from fastapi import APIRouter, HTTPException

from database import db
from models import Property

router = APIRouter()


@router.post("/properties", response_model=Property)
async def create_update_properties(task_id: str, properties: List[Property]):
    for item in properties:
        result = await db.properties.update_one(
            {"_id": item.id, "taskId": task_id},
            {"$set": {"value": item.value, "name": item.name}},
            upsert=True
        )
        if result.matched_count == 0 and not result.upserted_id:
            raise HTTPException(status_code=400,
                                detail=f"Failed to update property {item.id}")
    return {"message": "Properties updated successfully"}


@router.delete("/properties")
async def delete_properties(ids: List[str]):
    result = await db.properties.delete_many({"_id": {"$in": ids}})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404,
                            detail="No properties found to delete")
    return {
        "message": f"{result.deleted_count} properties deleted successfully"}


@router.get("/tasks/{task_id}/properties", response_model=Dict[str, Property])
async def get_task_properties(task_id: str):
    properties = await db.properties.find({"taskId": task_id}).to_list()
    if not properties:
        raise HTTPException(status_code=404,
                            detail="No properties found for the task")
    return {prop["name"]: prop["value"] for prop in properties}
