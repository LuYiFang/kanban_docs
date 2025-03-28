from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import FastAPI

app = FastAPI()

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.my_database