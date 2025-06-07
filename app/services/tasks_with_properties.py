from typing import List

from motor.core import AgnosticDatabase

from clients.custom_summary_api import CustomSummaryAPI
from models.properties import TaskPropertyUpdate, TaskPropertyBase
from models.tasks import TaskWithPropertiesResponse, TaskUpdate, TaskType
from repositories.properties import get_all_property_option
from repositories.tasks import (get_tasks_with_properties_repo)
from services.properties import upsert_task_properties_service
from services.tasks import upsert_task_service


async def get_tasks_with_properties_service(task_type: TaskType,
                                            db: AgnosticDatabase) \
        -> List[TaskWithPropertiesResponse]:
    tasks_with_properties = await get_tasks_with_properties_repo(task_type, db)
    return [TaskWithPropertiesResponse(**task) for task in
            tasks_with_properties]


async def create_task_with_properties_service(
        task_update: TaskUpdate,
        property_update: List[TaskPropertyBase],
        db: AgnosticDatabase) -> TaskWithPropertiesResponse:
    task = await upsert_task_service('', task_update.model_dump(), db)

    property_update = [
        TaskPropertyUpdate(**prop.model_dump(), taskId=task.id) for prop in
        property_update
    ]

    properties = await upsert_task_properties_service(property_update, db)

    return TaskWithPropertiesResponse(**task.model_dump(),
                                      properties=properties)


async def generate_summary(db) -> str:
    tasks = await get_tasks_with_properties_repo(TaskType.weekly, db)
    if not tasks:
        return "No weekly tasks found."

    option_mapping = {}
    property_options = await get_all_property_option(db)
    for prop in property_options:
        if "options" in prop:
            option_mapping.update(
                {option["id"]: option["name"] for option in prop["options"]})

    summary_lines = []
    tasks_by_level = {}

    # Group tasks by 'level' property
    for task in tasks:
        properties = task.get("properties", [])
        level_id = next(
            (prop["value"] for prop in properties if prop["name"] == "level"),
            "No Level")
        level = option_mapping.get(level_id, "No Level")
        if level not in tasks_by_level:
            tasks_by_level[level] = []
        tasks_by_level[level].append(task)

    # Process tasks within each level group
    for level, level_tasks in tasks_by_level.items():
        tasks_by_project = {}

        # Group tasks by 'project' property
        for task in level_tasks:
            properties = task.get("properties", [])
            project_id = next((prop["value"] for prop in properties if
                               prop["name"] == "project"), "No Project")
            project = option_mapping.get(project_id, "No Project")
            if project not in tasks_by_project:
                tasks_by_project[project] = []
            tasks_by_project[project].append(task)

        # Process tasks within each project group
        for project, project_tasks in tasks_by_project.items():
            summary_lines.append(f"Level: {level}, Project: {project}")
            for task in project_tasks:
                title = task.get("title", "No Title")
                content = task.get("content", "No Content")
                properties_text = ", ".join(
                    [
                        f"{prop['name']}: {', '.join(option_mapping.get(v, v) for v in prop['value'])}"
                        if isinstance(prop['value'], list)
                        else f"{prop['name']}: {option_mapping.get(prop['value'], prop['value'])}"
                        for prop in task.get("properties", [])
                        if prop["name"] in {"status", "tags"}
                    ]
                )
                summary_lines.append(
                    f"  Title: {title}\n    Content: {content}\n    Properties: {properties_text}\n"
                )
    return "\n---\n".join(summary_lines)


async def summarize_weekly_tasks(db):
    """
    Summarize weekly tasks into a text format.
    """
    summary = ''
    try:
        summary = await generate_summary(db)
        return await CustomSummaryAPI().run(summary)
    except Exception as e:
        print(f"Error generating summary: {e}")
        return summary
