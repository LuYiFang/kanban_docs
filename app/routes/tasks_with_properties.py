import logging
from typing import List

from fastapi import APIRouter, HTTPException, Depends

from database import get_db
from models.properties import TaskPropertyBase
from models.tasks import TaskWithPropertiesResponse, TaskUpdate, TaskType
from services.properties import delete_task_property_by_task
from services.tasks import (delete_task_service)
from services.tasks_with_properties import (get_tasks_with_properties_service,
                                            create_task_with_properties_service,
                                            summarize_weekly_tasks)

router = APIRouter()


@router.get("/task/properties",
            response_model=List[TaskWithPropertiesResponse])
async def get_tasks_with_properties(task_type: TaskType, db=Depends(get_db)):
    try:
        tasks_with_properties = await get_tasks_with_properties_service(
            task_type,
            db
        )

        return tasks_with_properties
    except ValueError as e:
        logging.exception(e)
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/task/properties",
             response_model=TaskWithPropertiesResponse)
async def create_tasks_with_properties(task: TaskUpdate,
                                       properties: List[TaskPropertyBase],
                                       db=Depends(get_db)):
    try:
        tasks_with_properties = await create_task_with_properties_service(
            task,
            properties,
            db
        )
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

        success = await delete_task_property_by_task(task_id, db)
        if not success:
            raise HTTPException(status_code=404, detail="Property not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/summary/weekly", response_model=str)
async def get_weekly_tasks_summary(db=Depends(get_db)):
    """
    API to summarize weekly tasks.
    """
    return await summarize_weekly_tasks(db)
