import asyncio
import uuid
from datetime import datetime, timedelta

from database import (get_db, mongodb, default_option_info,
                      default_property_config_info, insert_property_options)
from models.tasks import TaskType

# 生成時間戳
now = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
days_to_friday = (4 - now.weekday()) % 7  # 計算距離最近週五的天數
start_of_this_week = now + timedelta(days=days_to_friday)
start_of_last_week = start_of_this_week - timedelta(days=7)  # 上週開始

dummy_option_info = default_option_info.copy()
dummy_option_info.extend([
    {"name": "Project A", "propertyName": "project"},
    {"name": "Project B", "propertyName": "project"},
    {"name": "Project C", "propertyName": "project"},
    {"name": "Charlie", "propertyName": "assignee"},
    {"name": "Eve", "propertyName": "assignee"},
])

task_data = [
    ("Prepare weekly report", "Summarize project progress for this week.",
     TaskType.weekly),
    ("Write API documentation",
     "Document endpoint specifications and usage guides.", TaskType.docs),
    ("Review UI components",
     "Analyze and refine UI design for accessibility.", TaskType.regular),
    ("Optimize query performance",
     "Improve database queries for better efficiency.", TaskType.regular),
    ("Create presentation slides",
     "Design slides for upcoming project review meeting.", TaskType.docs),
    ("Update deployment script",
     "Ensure automated deployment is correctly configured.",
     TaskType.regular),
    ("Sprint retrospective",
     "Discuss completed tasks and improvements for next sprint.",
     TaskType.weekly),
    ("Bug fixing session",
     "Resolve reported issues in the latest software version.",
     TaskType.regular),
    ("Finalize roadmap draft",
     "Define milestones and key features for upcoming releases.",
     TaskType.docs),
    ("Design Kanban workflow",
     "Refactor and enhance task management approach.", TaskType.weekly),
]


async def insert_tasks(db):
    """生成 Tasks 和預設屬性（固定分配）"""

    tasks = []
    for i, (title, content, task_type) in enumerate(task_data):
        created_time = start_of_last_week if i < 5 else start_of_this_week
        updated_time = start_of_this_week - timedelta(
            days=(i % 10))  # 讓更新時間固定在兩週範圍內分布

        task_id = str(uuid.uuid4())
        tasks.append({
            "_id": task_id,
            "id": task_id,
            "title": title,
            "content": content,
            "type": task_type.value,
            "order": i + 1,
            "createdAt": created_time,
            "updatedAt": updated_time,
        })
    result = await db.tasks.insert_many(tasks)
    print(f"Inserted {len(result.inserted_ids)} tasks")
    return tasks


async def insert_task_properties(db, tasks, options):
    """插入 Task Properties"""

    property_configs = await db.property_configs.find({}).to_list(None)
    property_id_name_map = {config["_id"]: config["name"] for config in
                            property_configs}

    property_options = await db.property_options.find({}).to_list(None)

    property_groups = {}

    # 取得所有可能的屬性值
    for property_config in default_property_config_info:
        property_name = property_config["name"]
        property_type = property_config["type"]

        # 取得所有可能的屬性值
        if property_type == "select":
            options = [
                option["_id"] for option in property_options
                if
                property_id_name_map.get(option["propertyId"]) == property_name
            ]
            # 避免同 level 都是一樣的 project
            if property_name == "project":
                options.append(options[0])
            if property_name in ("project", "assignee"):
                options.append("")
            property_groups[property_name] = options
        elif property_type == "date":
            # 對於日期類型，這裡可以選擇不分組，或是給一個預設值
            property_groups[property_name] = []
        else:
            # 其他類型的處理
            property_groups[property_name] = []

    task_property_collection = db.task_properties
    task_properties = []
    for i, task in enumerate(tasks):
        for j, (property_name, property_options) in enumerate(
                property_groups.items()):
            # 取得所有可能值
            assigned_value = ''
            if property_options:
                assigned_value = property_options[
                    (i + j) % len(property_options)]

            property_id = str(uuid.uuid4())
            prop_updated_at = task["updatedAt"] + timedelta(days=(i % 6) + 1)
            prop_updated_at_iso = prop_updated_at

            task_properties.append({
                "_id": property_id,
                "id": property_id,
                "taskId": task["id"],
                "name": property_name,
                "value": assigned_value,
                "createdAt": task["createdAt"],
                "updatedAt": prop_updated_at_iso
            })

    await task_property_collection.insert_many(task_properties)
    print(f"Inserted {len(task_properties)} task properties")


async def connect_to_mongodb():
    """連接到 MongoDB"""
    await mongodb.connect()
    await mongodb.initialize_collections()


async def main():
    """主流程"""
    await connect_to_mongodb()
    db = await get_db()

    options = await insert_property_options(db, dummy_option_info)
    tasks_inserted = await insert_tasks(db)
    await insert_task_properties(db, tasks_inserted, options)


if __name__ == "__main__":
    asyncio.run(main())
