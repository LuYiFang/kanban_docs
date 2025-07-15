from typing import Optional, Dict, Any

import bcrypt
from motor.core import AgnosticDatabase

collection_name = "users"


async def get_user_by_username(username: str, db: AgnosticDatabase) -> \
        Optional[Dict[str, Any]]:
    return await db[collection_name].find_one({"username": username})


async def create_user(user_data: Dict[str, Any], db: AgnosticDatabase) -> str:
    result = await db[collection_name].insert_one(user_data)
    return str(result.inserted_id)


async def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"),
                          hashed_password.encode("utf-8"))

