from typing import Optional, List, Literal
from pydantic import BaseModel


class SecurityFinding(BaseModel):
    severity: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]
    owasp_id: str
    title: str
    description: str
    line_number: Optional[int] = None
    score: float


class FinalReport(BaseModel):
    job_id: str
    rounds_taken: int
    final_code: str
    test_suite: str
    security_findings: List[SecurityFinding] = []
    confidence_score: float
    pr_url: Optional[str] = None
    all_tests_passed: bool
    sentinel_issues: int
