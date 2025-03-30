from typing import List

from repositories.properties import (upsert_property, delete_property_by_id,
                                     batch_insert_properties)
from models.properties import PropertyResponse, PropertyCreate
from services.base import upsert_service, delete_service


async def upsert_property_service(property_id: str,
                                  updates: dict) -> PropertyResponse:
    return await upsert_service(upsert_property, property_id, updates,
                                PropertyResponse)


async def upsert_properties_service(properties: List[PropertyCreate]) -> list:
    return await batch_insert_properties([p.model_dump() for p in properties])


async def delete_property_service(property_id: str) -> bool:
    return await delete_service(delete_property_by_id, property_id)
