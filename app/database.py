from motor.motor_asyncio import AsyncIOMotorClient


class MongoDB:
    def __init__(self, uri: str):
        self.uri = uri
        self.client = None
        self.db = None

    async def connect(self):
        self.client = AsyncIOMotorClient(self.uri)
        self.db = self.client.kanbanDocs

    async def disconnect(self):
        if self.client:
            await self.client.close()

    async def initialize_collections(self):
        """初始化集合"""
        collection_list = ['tasks', 'properties']
        existing_collections = await self.db.list_collection_names()

        for collection_name in collection_list:
            if collection_name in existing_collections:
                print(
                    f"Collection '{collection_name}' already exists. Skipping initialization.")
                continue

            await self.db.create_collection(collection_name)
            print(f"Collection '{collection_name}' initialized.")

        self.db.properties.create_index(
            [("taskId", 1), ("name", 1)],
            unique=True
        )


mongodb = MongoDB("mongodb://localhost:27017")


async def get_db():
    return mongodb.db
