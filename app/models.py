from pydantic import BaseModel
from typing import List, Dict, Optional


class Task(BaseModel):
    id: str
    title: str
    content: str
    properties: Dict[str, str]


class Column(BaseModel):
    id: str
    name: str
    tasks: List[Task]
