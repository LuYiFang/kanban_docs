import logging
from typing import List

from motor.core import AgnosticDatabase

from models.properties import (TaskPropertyResponse, PropertyUpdate,
                               OptionResponse, PropertyConfigWithOptions)
from repositories.properties import (upsert_task_property,
                                     delete_task_property_by_id,
                                     batch_insert_task_properties,
                                     delete_task_properties_by_task_id,
                                     upsert_property_option,
                                     get_all_property_option)
from services.base import upsert_service, delete_service


async def upsert_task_property_service(property_id: str,
                                       updates: dict,
                                       db: AgnosticDatabase) -> TaskPropertyResponse:
    return await upsert_service(upsert_task_property, property_id, updates,
                                TaskPropertyResponse, db)


async def upsert_task_properties_service(properties: List[PropertyUpdate],
                                         db: AgnosticDatabase) -> List[
    TaskPropertyResponse]:
    return await batch_insert_task_properties(
        [p.model_dump() for p in properties],
        db)


async def delete_task_property_service(property_id: str,
                                       db: AgnosticDatabase) -> bool:
    return await delete_service(delete_task_property_by_id, property_id, db)


async def delete_task_property_by_task(task_id: str,
                                       db: AgnosticDatabase) -> bool:
    return await delete_task_properties_by_task_id(task_id, db)


async def get_all_property_option_service(db: AgnosticDatabase) \
        -> List[PropertyConfigWithOptions]:
    try:
        properties_with_options = await get_all_property_option(db)
        return [PropertyConfigWithOptions(**prop) for prop in
                properties_with_options]
    except Exception as e:
        logging.exception(e)


async def upsert_property_option_service(updates: dict,
                                         db: AgnosticDatabase) -> OptionResponse:
    return await upsert_service(upsert_property_option, '', updates,
                                OptionResponse, db)
