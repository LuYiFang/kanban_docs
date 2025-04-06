from typing import Type

from motor.core import AgnosticDatabase
from pydantic import BaseModel


async def upsert_service(repo_upsert_func, doc_id: str, updates: dict,
                         response_model: Type[BaseModel],
                         db: AgnosticDatabase):
    """
    通用的 upsert 服務邏輯
    """
    document = await repo_upsert_func(doc_id, updates, db)
    if document:
        return response_model(**document)
    raise ValueError("Failed to upsert document")


async def delete_service(repo_delete_func, doc_id: str, db: AgnosticDatabase) -> bool:
    """
    通用的 delete 服務邏輯
    """
    return await repo_delete_func(doc_id, db)
