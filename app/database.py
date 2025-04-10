import logging

from motor.motor_asyncio import AsyncIOMotorClient

from models.properties import (PropertyTypeCreate, PropertyConfigConfigCreate,
                               OptionCreate)
from repositories.properties import (batch_upsert_property_types,
                                     batch_upsert_property_config,
                                     batch_upsert_property_option)


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
        collection_list = ['tasks', 'task_properties', 'property_types',
                           'property_configs', 'property_options']
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

    async def exclude_exists(self, table_name, documents):
        existing = await self.db[table_name].find(
            {"name": {"$in": [doc["name"] for doc in documents]}}
        ).distinct("name")

        return [doc for doc in documents if doc['name'] not in existing]

    async def insert_property_types(self):
        """插入屬性類型"""
        property_types_names = [
            {"name": "select"},
            {"name": "member"},
            {"name": "date"},
            {"name": "read_only"}
        ]

        property_types_names = await self.exclude_exists(
            'property_types', property_types_names
        )

        property_types = [
            PropertyTypeCreate(name=i['name'])
            for i in property_types_names
        ]

        # 批量插入屬性類型
        if not property_types:
            return []
        property_type_results = await batch_upsert_property_types(
            property_types, self.db
        )
        print(f"Inserted Property Types")
        return property_type_results

    async def insert_property_configs(self, property_type_results):
        """插入屬性配置"""
        property_config_info = [
            {"name": "Priority", "type": "select"},
            {"name": "Status", "type": "select"},
            {"name": "Level", "type": "select"},
            {"name": "Assignee", "type": "select"},
            {"name": "Deadline", "type": "date"},
            {"name": "FinishedAt", "type": "date"},
            {"name": "Project", "type": "select"}
        ]

        property_config_info = await self.exclude_exists(
            'property_configs', property_config_info
        )
        if not property_config_info:
            print(f"No new Property Configs to insert.")
            return []

        type_map = {
            property_type['name']: property_type['id']
            for property_type in property_type_results
        }

        property_configs = [
            PropertyConfigConfigCreate(name=i['name'],
                                       typeId=type_map[i['type']])
            for i in property_config_info
        ]

        property_config_results = await batch_upsert_property_config(
            property_configs, self.db
        )
        print(f"Inserted Property Configs")
        return property_config_results

    async def insert_property_options(self, property_config_results):
        """插入選項"""
        option_info = [
            {"propertyName": "Priority", "name": "High"},
            {"propertyName": "Priority", "name": "Medium"},
            {"propertyName": "Priority", "name": "Low"},
            {"propertyName": "Status", "name": "Todo"},
            {"propertyName": "Status", "name": "In Progress"},
            {"propertyName": "Status", "name": "Done"},
            {"propertyName": "Level", "name": "A Level"},
            {"propertyName": "Level", "name": "B Level"},
            {"propertyName": "Level", "name": "C Level"},
            {"propertyName": "Deadline", "name": "2025-01-01"},
            {"propertyName": "Deadline", "name": "2025-12-31"},
            {"propertyName": "FinishedAt", "name": "Complete"},
            {"propertyName": "FinishedAt", "name": "Incomplete"},
            {"propertyName": "Project", "name": "Project A"},
            {"propertyName": "Project", "name": "Project B"}
        ]

        option_info = await self.exclude_exists(
            'property_options',
            option_info
        )

        if not option_info:
            return

        property_map = {
            prop['name']: prop['id']
            for prop in property_config_results
        }

        options = [
            OptionCreate(name=i['name'],
                         propertyId=property_map[i['propertyName']])
            for i in option_info
        ]
        property_options_results = await batch_upsert_property_option(
            options, self.db
        )

        print(f"Inserted Options")
        return property_options_results

    async def insert_default_data(self):
        try:
            property_type_results = await self.insert_property_types()

            property_config_results = await self.insert_property_configs(
                property_type_results)

            await self.insert_property_options(property_config_results)
        except Exception as e:
            logging.exception(e)


mongodb = MongoDB("mongodb://localhost:27017")


async def get_db():
    return mongodb.db
