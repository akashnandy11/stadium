import asyncio
import anthropic
from config import settings
from models.agent_output import AgentEvent
from agents.prompts import parse_sentinel_findings


class SentinelAgent:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.SENTINEL_MODEL

    async def run(self, prompt: str, event_queue: asyncio.Queue, round_num: int) -> str:
        await event_queue.put(AgentEvent(
            agent="sentinel",
            round=round_num,
            event_type="thinking",
            content=f"🛡️ Sentinel is performing OWASP security analysis (Round {round_num})...",
        ))

        loop = asyncio.get_event_loop()
        full_response = await loop.run_in_executor(None, self._call_claude, prompt)

        findings = parse_sentinel_findings(full_response)

        for finding in findings:
            await event_queue.put(AgentEvent(
                agent="sentinel",
                round=round_num,
                event_type="security_finding",
                content=f"[{finding.severity}] {finding.owasp_id}: {finding.title}",
                metadata=finding.model_dump(),
            ))

        if not findings:
            await event_queue.put(AgentEvent(
                agent="sentinel",
                round=round_num,
                event_type="security_finding",
                content="✅ No security issues found in this round.",
            ))

        return full_response

    def _call_claude(self, prompt: str) -> str:
        message = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text
