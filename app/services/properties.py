from repositories.properties import upsert_property, delete_property_by_id
from models.properties import PropertyResponse
from services.base import upsert_service, delete_service


async def upsert_property_service(property_id: str,
                                  updates: dict) -> PropertyResponse:
    return await upsert_service(upsert_property, property_id, updates,
                                PropertyResponse)


async def delete_property_service(property_id: str) -> bool:
    return await delete_service(delete_property_by_id, property_id)
