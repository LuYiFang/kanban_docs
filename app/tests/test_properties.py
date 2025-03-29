import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_update_and_get_properties():
    async with AsyncClient(app=app, base_url="http://test") as client:
        property_data = [
            {
                "_id": "property-1",
                "taskId": "task-1",
                "name": "Priority",
                "value": "High"
            },
            {
                "_id": "property-2",
                "taskId": "task-1",
                "name": "Deadline",
                "value": "2025-04-01"
            }
        ]
        response = await client.patch("/properties/batch", json=property_data)
        assert response.status_code == 200
        assert response.json()["message"] == "Properties updated successfully"

        response = await client.get("/tasks/task-1/properties")
        assert response.status_code == 200
        properties = response.json()
        assert len(properties) == 2
        assert properties["Priority"]["value"] == "High"
        assert properties["Deadline"]["value"] == "2025-04-01"