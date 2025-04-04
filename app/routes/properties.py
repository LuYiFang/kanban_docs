from typing import List

from fastapi import APIRouter, HTTPException
from models.properties import PropertyResponse, PropertyUpdate, PropertyCreate
from services.properties import (upsert_property_service,
                                 delete_property_service,
                                 upsert_properties_service)

router = APIRouter()


@router.post("/", response_model=PropertyResponse)
async def create_property(property: PropertyCreate):
    try:
        property = await upsert_property_service('', property.model_dump())
        return property
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/batch", response_model=list)
async def create_batch_property(properties: List[PropertyCreate]):
    try:
        properties = await upsert_properties_service(properties)
        return properties
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{property_id}", response_model=PropertyResponse)
async def upsert_property_endpoint(property_id: str, updates: PropertyUpdate):
    try:
        property = await upsert_property_service(property_id,
                                                 updates.model_dump())
        return property
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{property_id}")
async def delete_property_endpoint(property_id: str):
    success = await delete_property_service(property_id)
    if not success:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": "Property deleted successfully"}


@router.delete("/task/{task_id}")
async def delete_property_by_task_endpoint(property_id: str):
    success = await delete_property_service(property_id)
    if not success:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": "Property deleted successfully"}
