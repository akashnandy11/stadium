from typing import Optional, List, Literal
from pydantic import BaseModel


class TicketRequest(BaseModel):
    title: str
    description: str
    language: Literal["python", "javascript", "java", "go"] = "python"
    codebase_path: Optional[str] = None
