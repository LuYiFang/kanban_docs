from typing import List

from motor.core import AgnosticDatabase

from repositories.properties import (upsert_property, delete_property_by_id,
                                     batch_insert_properties,
                                     delete_properties_by_task_id)
from models.properties import PropertyResponse, PropertyCreate
from services.base import upsert_service, delete_service


async def upsert_property_service(property_id: str,
                                  updates: dict,
                                  db: AgnosticDatabase) -> PropertyResponse:
    return await upsert_service(upsert_property, property_id, updates,
                                PropertyResponse, db)


async def upsert_properties_service(properties: List[PropertyCreate],
                                    db: AgnosticDatabase) -> list:
    return await batch_insert_properties([p.model_dump() for p in properties],
                                         db)


async def delete_property_service(property_id: str,
                                  db: AgnosticDatabase) -> bool:
    return await delete_service(delete_property_by_id, property_id, db)


async def delete_property_by_task(task_id: str, db: AgnosticDatabase) -> bool:
    return await delete_properties_by_task_id(task_id, db)
