from typing import List

from motor.core import AgnosticDatabase

from models.properties import TaskPropertyUpdate, TaskPropertyBase
from models.tasks import TaskWithPropertiesResponse, TaskUpdate
from repositories.tasks import (get_tasks_with_properties_repo)
from services.properties import upsert_task_properties_service
from services.tasks import upsert_task_service


async def get_tasks_with_properties_service(db: AgnosticDatabase) \
        -> List[TaskWithPropertiesResponse]:
    tasks_with_properties = await get_tasks_with_properties_repo(db)
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
