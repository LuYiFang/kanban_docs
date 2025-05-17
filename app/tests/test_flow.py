import pytest
from httpx import AsyncClient

from app.main import app
from database import (get_db, insert_default_data_to_db, MongoDB,
                      insert_property_options)
from migrate.dummy_tasks import (insert_tasks, insert_task_properties,
                                 dummy_option_info)
from tests.create_container import start_mongo_container, stop_mongo_container

test_uri = "mongodb://localhost:27018"
test_db = "test_db"


@pytest.fixture(scope="session", autouse=True)
def setup_mongo():
    """自動啟動 MongoDB 容器並在測試完成後清理"""
    container = start_mongo_container()

    yield  # 測試開始

    print("🛑 測試完成，停止並刪除 MongoDB 容器...")
    stop_mongo_container(container)


@pytest.mark.asyncio
async def test_task_flow():
    """測試任務的創建、更新、刪除以及屬性操作的完整流程"""

    """測試 MongoDB 任務操作"""
    mongodb = MongoDB(test_uri, test_db)
    await mongodb.connect()
    mongodb.client.drop_database(test_db)  # 清空測試 DB，避免舊數據影響測試
    await mongodb.initialize_collections()
    app.dependency_overrides[get_db] = lambda: mongodb.db

    db = mongodb.db

    async with AsyncClient(app=app,
                           base_url="http://test") as async_client:
        await initialize_collections(db)
        property_id, property_options = await verify_default_property_options(
            async_client)
        property_options_name_id_map = {}
        for prop in property_options:
            for option in prop.get('options', []):
                property_options_name_id_map[option["name"]] = option["id"]

        payload_create1, properties1 = await get_task1_payload(
            property_options_name_id_map)
        task_id = await create_task_with_properties(async_client,
                                                    payload_create1,
                                                    properties1)
        await no_change_update(async_client, db, task_id)
        await update_task(async_client, task_id)

        await varify_properties(async_client, task_id,
                                property_options_name_id_map)
        await delete_task(async_client, task_id)
        await check_empty_task(async_client)
        new_option_id = await create_property_option(async_client,
                                                     property_id)
        await verify_property_options(async_client, property_id,
                                      new_option_id)

        payload_create1, properties1 = await get_task1_payload(
            property_options_name_id_map)
        task_id = await create_task_with_properties(async_client,
                                                    payload_create1,
                                                    properties1)
        payload_create2, properties2 = await get_task2_payload(
            property_options_name_id_map)
        task_id2 = await create_task_with_properties(async_client,
                                                     payload_create2,
                                                     properties2)
        await swap_task_order(async_client, task_id, task_id2)


async def initialize_collections(db):
    await insert_default_data_to_db(db)


async def get_task1_payload(name_id_map):
    payload_create = {
        "title": "Test Task",
        "content": "This is a test content",
        "order": 0,
        "type": "regular",
    }
    properties = [
        {"name": "priority", "value": name_id_map["Low"]},
        {"name": "status", "value": name_id_map["Todo"]},
        {"name": "level", "value": name_id_map["C Level"]},
        {"name": "assignee", "value": ""},
        {"name": "deadline", "value": ""},
        {"name": "finishedAt", "value": ""}
    ]
    return payload_create, properties


async def get_task2_payload(name_id_map):
    payload_create = {
        "title": "New Task",
        "content": "Content for New Task",
        "order": 1,
        "type": "regular",
    }
    properties = [
        {"name": "priority", "value": name_id_map["Low"]},
        {"name": "status", "value": name_id_map["Todo"]},
        {"name": "level", "value": name_id_map["C Level"]},
        {"name": "assignee", "value": ""},
        {"name": "deadline", "value": ""},
        {"name": "finishedAt", "value": ""}
    ]
    return payload_create, properties


async def verify_default_property_options(async_client):
    """Verify default property options using the /properties/options endpoint."""
    response_property_options = await async_client.get(
        "/api/property/properties/options")
    print('response_property_options', response_property_options)
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
    return status_property['id'], options_data


async def create_task_with_properties(async_client, payload_create,
                                      properties):
    """Create a task with properties."""
    response = await async_client.post(
        "/api/task/properties",
        json={"task": payload_create, "properties": properties}
    )
    assert response.status_code == 200
    task_with_properties = response.json()
    assert task_with_properties["title"] == payload_create["title"]
    assert len(task_with_properties["properties"]) == len(properties)
    return task_with_properties["id"]


async def no_change_update(async_client, db, task_id):
    """測試當 title 和 content 都未改變時，更新操作不會儲存任何變更"""
    payload_no_change = {
        "title": "Updated Task",
        "content": "Updated task content",
        "order": 0,
        "type": "regular",
    }
    response_no_change = await async_client.put(f"/api/task/{task_id}",
                                                json=payload_no_change)
    assert response_no_change.status_code == 200
    no_change_task = response_no_change.json()
    assert no_change_task["title"] == payload_no_change["title"]
    assert no_change_task["content"] == payload_no_change["content"]
    # 檢查是否有更新時間戳
    task_in_db = await db["tasks"].find_one({"_id": task_id})
    assert no_change_task["updatedAt"] == task_in_db["updatedAt"].isoformat()+'+00:00', \
        "Task should not be updated if title and content are unchanged"


async def update_task(async_client, task_id):
    payload_update = {
        "title": "Updated Task",
        "content": "Updated task content",
        "order": 0
    }
    response_update = await async_client.put(f"/api/task/{task_id}",
                                             json=payload_update)
    assert response_update.status_code == 200
    updated_task = response_update.json()
    assert updated_task["title"] == payload_update["title"]
    assert updated_task["content"] == payload_update["content"]


async def varify_properties(async_client, task_id, options_name_id_map):
    response_task_properties = await async_client.get(
        "/api/task/properties?task_type=regular")
    assert response_task_properties.status_code == 200
    tasks_with_properties = response_task_properties.json()
    assert len(tasks_with_properties) == 1

    task_properties = next(
        (t for t in tasks_with_properties if t["id"] == task_id), None)
    assert task_properties is not None
    assert task_properties["title"] == "Updated Task"
    assert len(task_properties["properties"]) > 0

    priority_property = next(
        (prop for prop in task_properties["properties"] if
         prop.get("name") == "priority"), None)
    assert priority_property["value"] == options_name_id_map[
        "Low"]


async def delete_task(async_client, task_id):
    response_delete = await async_client.delete(f"/api/task/{task_id}")
    assert response_delete.status_code == 200


async def check_empty_task(async_client):
    response_check = await async_client.get(
        f"/api/task/properties?task_type=regular")
    data = response_check.json()
    assert response_check.status_code == 200
    assert len(data) == 0


async def create_property_option(async_client, property_id):
    """Create a property option for a specific property."""
    option_data = {"name": "test_value", "propertyId": property_id}
    response = await async_client.post(
        f"/api/property/properties/option", json=option_data
    )
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["name"] == option_data["name"]
    return response_data["id"]


async def verify_property_options(async_client, property_id,
                                  new_option_id):
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
        (opt for opt in status_property['options'] if
         opt.get("id") == new_option_id),
        None)
    assert new_option["name"] == "test_value"


async def swap_task_order(async_client,
                          task_id1, task_id2):
    """Swap the order of two tasks."""
    payload_swap_order = [
        {"id": task_id1, "order": 1, "title": "Test Task",
         "content": "This is a test content"},
        {"id": task_id2, "order": 0, "title": "New Task",
         "content": "Content for New Task", }
    ]
    response_swap = await async_client.post("/api/task/batch",
                                            json=payload_swap_order)
    assert response_swap.status_code == 200
    updated_tasks = response_swap.json()

    # Verify the orders are swapped
    existing_task_updated = next(
        task for task in updated_tasks if task["id"] == task_id1)
    new_task_updated = next(
        task for task in updated_tasks if task["id"] == task_id2)
    assert existing_task_updated["order"] == 1
    assert new_task_updated["order"] == 0


@pytest.mark.asyncio
async def test_file_flow():
    """測試任務的創建、更新、刪除以及屬性操作的完整流程"""

    """測試 MongoDB 任務操作"""
    mongodb = MongoDB(test_uri, test_db)
    await mongodb.connect()
    mongodb.client.drop_database(test_db)  # 清空測試 DB，避免舊數據影響測試
    await mongodb.initialize_collections()
    app.dependency_overrides[get_db] = lambda: mongodb.db

    async with AsyncClient(app=app,
                           base_url="http://test") as async_client:
        file_content = b"dummy"
        response = await async_client.post(
            "/api/files/", files={"file": file_content})
        assert response.status_code == 200
        url = response.json()["url"]
        assert "/files/" in url

        response = await async_client.get(
            f"/api{url}")
        assert response.status_code == 200
        assert response.content == file_content

        # 測刪除檔案
        file_id = url.split("/")[-1]
        response = await async_client.delete(
            f"/api/files/{file_id}")
        assert response.status_code == 200
        # 測試檔案不存在
        response = await async_client.get(
            f"/api/files/{file_id}")
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_weekly_flow():
    """測試任務的創建、更新、刪除以及屬性操作的完整流程"""

    """測試 MongoDB 任務操作"""
    mongodb = MongoDB(test_uri, test_db)
    await mongodb.connect()
    mongodb.client.drop_database(test_db)
    await mongodb.initialize_collections()

    app.dependency_overrides[get_db] = lambda: mongodb.db

    db = mongodb.db

    options = await insert_property_options(db, dummy_option_info)
    tasks_inserted = await insert_tasks(db)
    await insert_task_properties(db, tasks_inserted, options)

    async with AsyncClient(app=app,
                           base_url="http://test") as async_client:
        response = await async_client.get(
            "/api/task/properties?task_type=weekly")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 6
