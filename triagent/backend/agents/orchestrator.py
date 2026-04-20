import asyncio
import uuid
from config import settings
from models.ticket import TicketRequest
from models.agent_output import AgentEvent, TestResults
from models.report import FinalReport
from agents.architect import ArchitectAgent
from agents.adversary import AdversaryAgent
from agents.sentinel import SentinelAgent
from agents.prompts import (
    build_architect_prompt,
    build_adversary_prompt,
    build_sentinel_prompt,
    parse_sentinel_findings,
    calculate_confidence,
)
from services.rag_service import rag_service
from services.pytest_runner import run_tests
from services.github_service import create_pr

# In-memory job store (use Redis in production)
job_store: dict[str, dict] = {}


async def run_debate_loop(ticket: TicketRequest, job_id: str, event_queue: asyncio.Queue):
    """
    Main debate loop orchestrating Architect → Adversary → Sentinel
    with up to MAX_DEBATE_ROUNDS iterations until consensus is reached.
    """
    architect = ArchitectAgent()
    adversary = AdversaryAgent()
    sentinel = SentinelAgent()

    job_store[job_id]["status"] = "running"

    code = ""
    tests = ""
    findings = []
    test_results = TestResults(all_passed=False, passed=0, failed=0, total=0, summary="Not run yet")
    round_num = 1

    try:
        # Step 1: Retrieve RAG context
        await event_queue.put(AgentEvent(
            agent="orchestrator",
            round=0,
            event_type="thinking",
            content="🔍 Retrieving relevant codebase context via RAG...",
        ))
        context = await rag_service.retrieve(ticket)

        for round_num in range(1, settings.MAX_DEBATE_ROUNDS + 1):
            await event_queue.put(AgentEvent(
                agent="orchestrator",
                round=round_num,
                event_type="thinking",
                content=f"🔄 Starting Round {round_num} of {settings.MAX_DEBATE_ROUNDS}...",
            ))

            # Step 2: Architect generates code
            failed_tests_str = _format_failed_tests(test_results) if round_num > 1 else ""
            architect_prompt = build_architect_prompt(ticket, context, code, failed_tests_str, findings, round_num)
            code = await architect.run(architect_prompt, event_queue, round_num)

            # Step 3: Adversary writes tests
            adversary_prompt = build_adversary_prompt(code, ticket.language)
            tests = await adversary.run(adversary_prompt, event_queue, round_num)

            # Step 4: Run tests
            await event_queue.put(AgentEvent(
                agent="adversary",
                round=round_num,
                event_type="thinking",
                content="🧪 Running test suite against implementation...",
            ))
            test_results = await run_tests(code, tests, ticket.language)
            await event_queue.put(AgentEvent(
                agent="adversary",
                round=round_num,
                event_type="test_result",
                content=test_results.summary,
                metadata={
                    "passed": test_results.passed,
                    "failed": test_results.failed,
                    "total": test_results.total,
                    "all_passed": test_results.all_passed,
                    "details": test_results.details,
                },
            ))

            # Step 5: Sentinel security scan
            sentinel_prompt = build_sentinel_prompt(code)
            sentinel_output = await sentinel.run(sentinel_prompt, event_queue, round_num)
            findings = parse_sentinel_findings(sentinel_output)

            # Step 6: Check stopping condition
            critical_high = [f for f in findings if f.severity in ("CRITICAL", "HIGH")]
            if test_results.all_passed and len(critical_high) == 0:
                await event_queue.put(AgentEvent(
                    agent="orchestrator",
                    round=round_num,
                    event_type="thinking",
                    content=f"✅ Consensus reached in Round {round_num}! All tests pass, no critical security issues.",
                ))
                break
            elif round_num < settings.MAX_DEBATE_ROUNDS:
                await event_queue.put(AgentEvent(
                    agent="orchestrator",
                    round=round_num,
                    event_type="thinking",
                    content=f"⚠️ Round {round_num} incomplete: {test_results.failed} failing tests, {len(critical_high)} critical/high security issues. Feeding back to Architect...",
                ))

        # Step 7: Build final report
        confidence = calculate_confidence(findings, test_results)
        report = FinalReport(
            job_id=job_id,
            rounds_taken=round_num,
            final_code=code,
            test_suite=tests,
            security_findings=findings,
            confidence_score=confidence,
            all_tests_passed=test_results.all_passed,
            sentinel_issues=len(findings),
        )

        # Step 8: Create GitHub PR (if configured)
        try:
            if settings.GITHUB_TOKEN and settings.GITHUB_REPO_OWNER:
                pr_url = await create_pr(report, ticket)
                report.pr_url = pr_url
        except Exception as e:
            await event_queue.put(AgentEvent(
                agent="orchestrator",
                round=round_num,
                event_type="thinking",
                content=f"⚠️ GitHub PR creation skipped: {str(e)}",
            ))

        job_store[job_id]["status"] = "done"
        job_store[job_id]["report"] = report.model_dump()

        await event_queue.put(AgentEvent(
            agent="orchestrator",
            round=round_num,
            event_type="done",
            content="🎉 Analysis complete!",
            metadata=report.model_dump(),
        ))

    except Exception as e:
        job_store[job_id]["status"] = "error"
        await event_queue.put(AgentEvent(
            agent="orchestrator",
            round=round_num if round_num else 0,
            event_type="error",
            content=f"❌ Error during analysis: {str(e)}",
        ))


def _format_failed_tests(test_results: TestResults) -> str:
    if not test_results.details:
        return test_results.summary
    failed = [d for d in test_results.details if not d.get("passed", True)]
    if not failed:
        return ""
    lines = []
    for f in failed:
        lines.append(f"FAILED: {f.get('name', 'unknown')}")
        if f.get("error"):
            lines.append(f"  Error: {f['error']}")
    return "\n".join(lines)
