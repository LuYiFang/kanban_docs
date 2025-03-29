from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient

app = FastAPI()

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.kanbanDocs

tasks_collection = db.tasks
columns_collection = db.columns


async def initialize_collections():
    collection_list = ['tasks', 'properties']
    existing_collections = await db.list_collection_names()

    for collection_name in collection_list:
        if collection_name in existing_collections:
            print(f"Collection '{collection_name}' already exists. Skipping initialization.")
            continue

        await db.create_collection(collection_name)
        print(f"Collection '{collection_name}' initialized.")

