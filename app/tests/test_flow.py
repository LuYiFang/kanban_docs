import pytest
import mongomock
from httpx import AsyncClient
from app.main import app
from database import get_db
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
            task_id = await self.create_task(async_client)
            await self.create_properties(async_client, task_id)
            await self.update_task(async_client, task_id)
            await self.varify_properties(async_client, task_id)
            await self.delete_task(async_client, task_id)
            await self.check_empty_task(async_client)

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
