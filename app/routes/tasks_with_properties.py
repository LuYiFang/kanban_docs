import logging
from typing import List

from fastapi import APIRouter, HTTPException, Depends

from database import get_db
from models.tasks import TaskWithPropertiesResponse
from services.properties import delete_task_property_by_task
from services.tasks import (delete_task_service,
                            get_tasks_with_properties_service)

router = APIRouter()


@router.get("/task/properties", response_model=List[TaskWithPropertiesResponse])
async def get_tasks_with_properties(db=Depends(get_db)):

    try:
        tasks_with_properties = await get_tasks_with_properties_service(db)
        return tasks_with_properties
    except ValueError as e:
        logging.exception(e)
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/task/{task_id}/properties")
async def delete_tasks_with_properties(task_id: str, db=Depends(get_db)):
    try:
        success = await delete_task_service(task_id, db)
        if not success:
            raise HTTPException(status_code=404, detail="Task not found")

        success = await delete_task_property_by_task(task_id)
        if not success:
            raise HTTPException(status_code=404, detail="Property not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
