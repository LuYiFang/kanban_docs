import mongomock
import pytest
from httpx import AsyncClient

from app.main import app
from database import get_db, insert_default_data_to_db
from tests.mongoAsyncMock import AsyncMongoMockWrapper


@pytest.fixture
def mongo_mock():
    """
    初始化模擬的 MongoDB
    """
    mock_client = mongomock.MongoClient()
    return AsyncMongoMockWrapper(mock_client.get_database("MockDB"))


@pytest.fixture(autouse=True)
def override_get_db(mongo_mock):
    app.dependency_overrides[get_db] = lambda: mongo_mock
    yield
    app.dependency_overrides = {}


class TestFlowAPI:

    @pytest.mark.asyncio
    async def test_task_flow(self, mongo_mock):
        """測試任務的創建、更新、刪除以及屬性操作的完整流程"""
        async with AsyncClient(app=app,
                               base_url="http://test") as async_client:
            await self.initialize_collections(mongo_mock)
            propertyId = await self.verify_default_property_options(async_client)

            task_id = await self.create_task_with_properties(async_client)
            await self.update_task(async_client, task_id)

            await self.varify_properties(async_client, task_id)
            await self.delete_task(async_client, task_id)
            await self.check_empty_task(async_client)
            new_option_id = await self.create_property_option(async_client, propertyId)
            await self.verify_property_options(async_client, propertyId, new_option_id)

            # await self.test_daily_task(async_client)



    @staticmethod
    async def initialize_collections(mongo_mock):
        await insert_default_data_to_db(mongo_mock)

    @staticmethod
    async def verify_default_property_options(async_client):
        """Verify default property options using the /properties/options endpoint."""
        response_property_options = await async_client.get("/api/property/properties/options")
        assert response_property_options.status_code == 200
        options_data = response_property_options.json()

        assert len(options_data) > 0
        expected_options = [
            {"name": "Todo"},
            {"name": "In Progress"},
            {"name": "Done"}
        ]

        # Find the 'status' property
        status_property = next(
            (prop for prop in options_data if prop.get("name") == "status"),
            None)
        assert status_property is not None, "Property with name 'status' not found"
        assert status_property[
                   "type"] == "select", "Property type is not 'select'"

        # Verify the options
        for expected_option in expected_options:
            matching_option = next(
                (opt for opt in status_property["options"] if
                 opt["name"] == expected_option["name"]), None
            )
            assert matching_option is not None, f"Option with name {expected_option['name']} not found"
        return status_property['id']

    @staticmethod
    async def create_task_with_properties(async_client):
        payload_create = {
            "title": "Test Task",
            "content": "This is a test content",
            "type": "regular",
        }
        properties = [
            {"name": "priority", "value": "low"},
            {"name": "status", "value": "todo"},
            {"name": "level", "value": "c-level"},
            {"name": "assignee", "value": ""},
            {"name": "deadline", "value": ""},
            {"name": "finishedAt", "value": ""}
        ]
        response = await async_client.post(
            "/api/task/properties",
            json={"task": payload_create, "properties": properties}
        )
        assert response.status_code == 200
        task_with_properties = response.json()
        assert task_with_properties["title"] == payload_create["title"]
        assert len(task_with_properties["properties"]) == len(properties)
        return task_with_properties["id"]

    @staticmethod
    async def create_task(async_client):
        payload_create = {
            "title": "Test Task",
            "content": "This is a test content"
        }
        response_create = await async_client.post("/api/task/",
                                                  json=payload_create)
        assert response_create.status_code == 200
        task_data = response_create.json()
        task_id = task_data["id"]
        assert task_data["title"] == payload_create["title"]
        return task_id

    @staticmethod
    async def create_properties(async_client, task_id):
        default_properties = [
            {"name": "priority", "value": "low", "taskId": task_id},
            {"name": "status", "value": "todo", "taskId": task_id},
            {"name": "level", "value": "c-level", "taskId": task_id},
            {"name": "assignee", "value": "", "taskId": task_id},
            {"name": "deadline", "value": "", "taskId": task_id},
            {"name": "finishedAt", "value": "", "taskId": task_id},
        ]
        response_property_batch_create = await async_client.post(
            "/api/property/batch", json=default_properties)
        assert response_property_batch_create.status_code == 200
        batch_property_data = response_property_batch_create.json()
        assert len(batch_property_data) == len(default_properties)

    @staticmethod
    async def update_task(async_client, task_id):
        payload_update = {
            "title": "Updated Task",
            "content": "Updated task content"
        }
        response_update = await async_client.put(f"/api/task/{task_id}",
                                                 json=payload_update)
        assert response_update.status_code == 200
        updated_task = response_update.json()
        assert updated_task["title"] == payload_update["title"]
        assert updated_task["content"] == payload_update["content"]

    @staticmethod
    async def varify_properties(async_client, task_id):
        response_task_properties = await async_client.get(
            "/api/task/properties")
        assert response_task_properties.status_code == 200
        tasks_with_properties = response_task_properties.json()
        assert len(tasks_with_properties) == 1

        task_properties = next(
            (t for t in tasks_with_properties if t["id"] == task_id), None)
        assert task_properties is not None
        assert task_properties["title"] == "Updated Task"
        assert len(task_properties["properties"]) > 0
        assert task_properties["properties"][0]["name"] == "priority"
        assert task_properties["properties"][0]["value"] == "low"

    @staticmethod
    async def delete_task(async_client, task_id):
        response_delete = await async_client.delete(f"/api/task/{task_id}")
        assert response_delete.status_code == 200

    @staticmethod
    async def check_empty_task(async_client):
        response_check = await async_client.get(f"/api/task/properties")
        data = response_check.json()
        assert response_check.status_code == 200
        assert len(data) == 0

    @staticmethod
    async def create_property_option(async_client, property_id):
        """Create a property option for a specific property."""
        option_data = {"name": "test_value", "propertyId": property_id}
        response = await async_client.post(
            f"/api/property/{property_id}/option", json=option_data
        )
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["name"] == option_data["name"]
        return response_data["id"]

    @staticmethod
    async def verify_property_options(async_client, property_id, new_option_id):
        """Verify the created property options."""
        response = await async_client.get(
            f"/api/property/properties/options")
        assert response.status_code == 200
        options_data = response.json()
        assert len(options_data) > 0

        status_property = next(
            (prop for prop in options_data if prop.get("id") == property_id),
            None)
        new_option = next(
            (opt for opt in status_property['options'] if opt.get("id") == new_option_id),
            None)
        assert new_option["name"] == "test_value"

    @staticmethod
    async def test_daily_task(async_client):
        """Test the creation of a daily task with required fields."""
        payload_create = {
            "title": "Daily Task",
            "content": "This is a daily task.",
            "type": "daily",
        }
        properties = [
            {"name": "start_date", "value": "2023-10-01T00:00:00"},
            {"name": "end_date", "value": "2023-10-31T23:59:59"},
            {"name": "week_day", "value": "一"}
        ]

        # Create the daily task
        response = await async_client.post(
            "/api/task/properties",
            json={"task": payload_create, "properties": properties}
        )
        assert response.status_code == 200
        task_with_properties = response.json()

        # Verify the task details
        assert task_with_properties["title"] == payload_create["title"]
        assert task_with_properties["type"] == payload_create["type"]

        # Verify the properties
        property_map = {p['name']: p['value'] for p in properties}
        for prop in task_with_properties["properties"]:
            assert prop["value"] == property_map[prop["name"]]
