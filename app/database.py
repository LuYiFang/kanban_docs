import logging

from motor.motor_asyncio import AsyncIOMotorClient

from models.properties import (PropertyTypeCreate, PropertyConfigConfigCreate,
                               OptionCreate)
from repositories.properties import (batch_upsert_property_types,
                                     batch_upsert_property_config,
                                     batch_upsert_property_option)

"""插入屬性類型"""
default_property_types_names = [
    {"name": "select"},
    {"name": "member"},
    {"name": "date"},
    {"name": "read_only"},
    {"name": "multi_select"}
]

"""插入屬性配置"""
default_property_config_info = [
    {"name": "priority", "type": "select"},
    {"name": "status", "type": "select"},
    {"name": "level", "type": "select"},
    {"name": "assignee", "type": "select"},
    {"name": "deadline", "type": "date"},
    {"name": "finishedAt", "type": "date"},
    {"name": "project", "type": "select"},
    {"name": "epic", "type": "select"},
    {"name": "tags", "type": "multi_select"},
]

"""插入選項"""
default_option_info = [
    {"propertyName": "priority", "name": "High"},
    {"propertyName": "priority", "name": "Medium"},
    {"propertyName": "priority", "name": "Low"},
    {"propertyName": "status", "name": "Epic"},
    {"propertyName": "status", "name": "Todo"},
    {"propertyName": "status", "name": "In Progress"},
    {"propertyName": "status", "name": "Waiting"},
    {"propertyName": "status", "name": "Done"},
    {"propertyName": "status", "name": "Cancelled"},
    {"propertyName": "status", "name": "Deferred"},
    {"propertyName": "level", "name": "A Level"},
    {"propertyName": "level", "name": "B Level"},
    {"propertyName": "level", "name": "C Level"},
    {"propertyName": "level", "name": "D Level"},
]


class MongoDB:
    def __init__(self, uri: str, db_name: str = "kanbanDocs"):
        self.uri = uri
        self.client = None
        self.db_name = db_name
        self.db = None

    async def connect(self):
        self.client = AsyncIOMotorClient(self.uri)
        self.db = self.client[self.db_name]

    async def disconnect(self):
        if self.client:
            await self.client.close()

    async def initialize_collections(self):
        """初始化集合"""
        collection_list = ['tasks', 'task_properties', 'property_types',
                           'property_configs', 'property_options', 'users']
        existing_collections = await self.db.list_collection_names()

        for collection_name in collection_list:
            if collection_name in existing_collections:
                print(
                    f"Collection '{collection_name}' already exists. Skipping initialization.")
                continue

            await self.db.create_collection(collection_name)
            print(f"Collection '{collection_name}' initialized.")

        self.db.task_properties.create_index(
            [("taskId", 1), ("name", 1)],
            unique=True
        )

        self.db.property_types.create_index(
            [("name", 1)],
            unique=True,
            name="unique_name_property_types"
        )

        self.db.property_configs.create_index(
            [("name", 1)],
            unique=True,
            name="unique_name_property_configs"
        )

        self.db.property_options.create_index(
            [("propertyId", 1), ("name", 1)],
            unique=True,
            name="unique_name_property_options"
        )

        await insert_default_data_to_db(self.db)


async def exclude_exists(db, table_name, documents, key="name"):
    existing = await db[table_name].distinct(key, {
        key: {"$in": [doc[key] for doc in documents]}})
    return [doc for doc in documents if doc[key] not in existing]


async def insert_property_types(db, target_property_types_names):
    """插入屬性類型，確保不重複"""
    property_types_names = await exclude_exists(db, "property_types",
                                                target_property_types_names)

    if not property_types_names:
        print("No new Property Types to insert.")
        return []

    property_types = [PropertyTypeCreate(name=i["name"]) for i in
                      property_types_names]

    return await batch_upsert_property_types(property_types, db)


async def insert_property_configs(db, target_property_config_info):
    """插入屬性配置，確保 `typeId` 來自 `property_types`"""
    property_config_info = await exclude_exists(db, "property_configs",
                                                target_property_config_info)

    if not property_config_info:
        print("No new Property Configs to insert.")
        return []

    # 直接從 `db` 查找 `property_types`
    existing_types = await db["property_types"].find(
        {}, {"name": 1, "_id": 1}
    ).to_list(length=None)
    type_map = {ptype["name"]: ptype["_id"] for ptype in existing_types}

    property_configs = [
        PropertyConfigConfigCreate(name=i["name"], typeId=type_map[i["type"]])
        for i in property_config_info
    ]

    return await batch_upsert_property_config(property_configs, db)


async def insert_property_options(db, target_option_info):
    """插入選項，確保 `propertyId` 來自 `property_configs`"""
    option_info = await exclude_exists(db, "property_options",
                                       target_option_info)

    if not option_info:
        print("No new Property Options to insert.")
        return []

    # 直接從 `db` 查找 `property_configs`
    existing_properties = await db["property_configs"].find({}, {"name": 1,
                                                                 "_id": 1}).to_list(
        length=None)
    property_map = {prop["name"]: prop["_id"] for prop in existing_properties}

    options = [
        OptionCreate(name=i["name"],
                     propertyId=property_map[i["propertyName"]])
        for i in option_info
    ]

    return await batch_upsert_property_option(options, db)


async def insert_default_data_to_db(db):
    try:
        await insert_property_types(db, default_property_types_names)
        await insert_property_configs(db, default_property_config_info)
        await insert_property_options(db, default_option_info)
    except Exception as e:
        logging.exception(e)
        print('Error inserting default data:', e)


mongodb = MongoDB("mongodb://localhost:27017")


async def get_db():
    return mongodb.db
