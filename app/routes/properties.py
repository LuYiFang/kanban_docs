from typing import List

from fastapi import APIRouter, HTTPException, Depends

from database import get_db
from models.properties import (TaskPropertyResponse, TaskPropertyUpdate,
                               TaskPropertyCreate,
                               TaskPropertyBase, OptionResponse,
                               OptionCreate, PropertyConfigWithOptions)
from services.properties import (upsert_task_property_service,
                                 delete_task_property_service,
                                 upsert_task_properties_service,
                                 upsert_property_option_service,
                                 get_all_property_option_service)

router = APIRouter()


@router.post("/", response_model=TaskPropertyResponse)
async def create_property(property: TaskPropertyCreate, db=Depends(get_db)):
    try:
        property = await upsert_task_property_service('',
                                                      property.model_dump(),
                                                      db)
        return property
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/batch", response_model=List[TaskPropertyResponse])
async def create_batch_property(properties: List[TaskPropertyUpdate],
                                db=Depends(get_db)):
    try:
        properties = await upsert_task_properties_service(properties, db)
        return properties
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{property_id}", response_model=TaskPropertyResponse)
async def upsert_property_endpoint(property_id: str, updates: TaskPropertyBase,
                                   db=Depends(get_db)):
    try:
        property = await upsert_task_property_service(property_id,
                                                      updates.model_dump(), db)
        return property
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{property_id}")
async def delete_property_endpoint(property_id: str, db=Depends(get_db)):
    success = await delete_task_property_service(property_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": "Property deleted successfully"}


@router.delete("/task/{task_id}")
async def delete_property_by_task_endpoint(property_id: str,
                                           db=Depends(get_db)):
    success = await delete_task_property_service(property_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": "Property deleted successfully"}


@router.get("/properties/options",
            response_model=List[PropertyConfigWithOptions])
async def get_properties_and_options(db=Depends(get_db)):
    """
    Fetch all properties and their options from the database.
    """
    try:
        tasks_with_properties = await get_all_property_option_service(db)
        return tasks_with_properties
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/properties/option", response_model=OptionResponse)
async def create_property_option(option: OptionCreate,
                                 db=Depends(get_db)):
    """
    Create a new option for a specific property.
    """
    try:
        created_option = await upsert_property_option_service(
            option.model_dump(),
            db
        )
        return created_option
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
