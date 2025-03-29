import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_create_and_get_tasks():
    async with AsyncClient(app=app, base_url="http://test") as client:
        task_data = {
            "_id": "task-1",
            "title": "Setup Project",
            "content": "Setup the project structure and tools.",
            "createdAt": "2025-03-28T12:00:00",
            "updatedAt": "2025-03-29T15:00:00"
        }
        response = await client.post("/tasks", json=task_data)
        assert response.status_code == 200
        created_task = response.json()
        assert created_task["id"] == "task-1"
        assert created_task["title"] == "Setup Project"

        response = await client.get("/tasks_with_properties")
        assert response.status_code == 200
        tasks = response.json()
        assert len(tasks) == 1
        assert tasks[0]["title"] == "Setup Project"


@pytest.mark.asyncio
async def test_tasks_with_properties():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/tasks_with_properties")
        assert response.status_code == 200
        tasks = response.json()
        assert len(tasks) > 0

        assert "Priority" in tasks[0]["properties"]
        assert tasks[0]["properties"]["Priority"]["value"] == "High"