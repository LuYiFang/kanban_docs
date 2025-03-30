from repositories.base import upsert_document, delete_document_by_id


async def upsert_property(property_id: str, updates: dict) -> dict:
    return await upsert_document("properties", property_id, updates)


async def delete_property_by_id(property_id: str) -> bool:
    return await delete_document_by_id("properties", property_id)
