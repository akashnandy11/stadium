from typing import Optional, List, Literal
from pydantic import BaseModel
from .report import SecurityFinding


class AgentEvent(BaseModel):
    agent: Literal["architect", "adversary", "sentinel", "orchestrator"]
    round: int
    event_type: Literal["thinking", "output", "test_result", "security_finding", "done", "error"]
    content: str
    metadata: Optional[dict] = None


class TestResults(BaseModel):
    all_passed: bool
    passed: int
    failed: int
    total: int
    summary: str
    details: List[dict] = []


class AgentResult(BaseModel):
    agent: str
    round: int
    code: Optional[str] = None
    tests: Optional[str] = None
    findings: Optional[List[SecurityFinding]] = None
    passed: bool = False
