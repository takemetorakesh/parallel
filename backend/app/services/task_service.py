import threading
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple

from app.schemas.task import (
    SortField,
    SortOrder,
    TaskCreate,
    TaskOut,
    TaskPriority,
    TaskStatus,
    TaskUpdate,
)

_PRIORITY_RANK = {TaskPriority.low: 1, TaskPriority.medium: 2, TaskPriority.high: 3}


def _now() -> datetime:
    return datetime.now(timezone.utc)


class TaskService:
    """In-memory task store. Data resets when the process restarts."""

    def __init__(self) -> None:
        self._tasks: Dict[str, TaskOut] = {}
        self._lock = threading.Lock()

    def reset(self) -> None:
        with self._lock:
            self._tasks.clear()

    def list(
        self,
        q: Optional[str] = None,
        status: Optional[TaskStatus] = None,
        priority: Optional[TaskPriority] = None,
        sort_by: SortField = SortField.created_at,
        order: SortOrder = SortOrder.desc,
        page: int = 1,
        limit: int = 10,
    ) -> Tuple[List[TaskOut], int]:
        with self._lock:
            items = list(self._tasks.values())

        if q:
            needle = q.strip().lower()
            items = [
                t for t in items
                if needle in t.title.lower() or needle in t.description.lower()
            ]
        if status:
            items = [t for t in items if t.status == status]
        if priority:
            items = [t for t in items if t.priority == priority]

        reverse = order == SortOrder.desc
        if sort_by == SortField.due_date:
            # Tasks without a due date always sort last, in either direction.
            dated = sorted((t for t in items if t.due_date), key=lambda t: t.due_date, reverse=reverse)
            items = dated + [t for t in items if not t.due_date]
        elif sort_by == SortField.priority:
            items = sorted(items, key=lambda t: _PRIORITY_RANK[t.priority], reverse=reverse)
        else:
            items = sorted(items, key=lambda t: t.created_at, reverse=reverse)

        total = len(items)
        start = (page - 1) * limit
        return items[start:start + limit], total

    def get(self, task_id: str) -> Optional[TaskOut]:
        with self._lock:
            return self._tasks.get(task_id)

    def create(self, payload: TaskCreate) -> TaskOut:
        now = _now()
        task = TaskOut(
            id=str(uuid.uuid4()),
            created_at=now,
            updated_at=now,
            **payload.model_dump(),
        )
        with self._lock:
            self._tasks[task.id] = task
        return task

    def update(self, task_id: str, payload: TaskUpdate) -> Optional[TaskOut]:
        with self._lock:
            current = self._tasks.get(task_id)
            if current is None:
                return None
            changes = payload.model_dump(exclude_unset=True)
            updated = current.model_copy(update={**changes, "updated_at": _now()})
            self._tasks[task_id] = updated
            return updated

    def delete(self, task_id: str) -> bool:
        with self._lock:
            return self._tasks.pop(task_id, None) is not None

    def seed(self) -> None:
        today = date.today()
        samples = [
            ("Complete assignment", "Build the full-stack task manager with React and FastAPI.",
             TaskStatus.in_progress, TaskPriority.high, today + timedelta(days=2)),
            ("Write API documentation", "Document every endpoint in the README and export a Postman collection.",
             TaskStatus.pending, TaskPriority.medium, today + timedelta(days=4)),
            ("Record demo video", "Short walkthrough of create, edit, filter and delete flows.",
             TaskStatus.pending, TaskPriority.low, None),
            ("Set up repository", "Initialise Git, add .gitignore and commit the project skeleton.",
             TaskStatus.completed, TaskPriority.medium, today - timedelta(days=1)),
        ]
        for title, description, status, priority, due in samples:
            self.create(TaskCreate(
                title=title, description=description, status=status,
                priority=priority, due_date=due,
            ))


task_service = TaskService()
