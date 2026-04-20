import asyncio
import anthropic
from config import settings
from models.agent_output import AgentEvent
from agents.prompts import parse_code_block


class ArchitectAgent:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.ARCHITECT_MODEL

    async def run(self, prompt: str, event_queue: asyncio.Queue, round_num: int) -> str:
        await event_queue.put(AgentEvent(
            agent="architect",
            round=round_num,
            event_type="thinking",
            content=f"🏗️ Architect is designing the implementation (Round {round_num})...",
        ))

        loop = asyncio.get_event_loop()
        full_response = await loop.run_in_executor(None, self._call_claude, prompt)

        code = parse_code_block(full_response)

        await event_queue.put(AgentEvent(
            agent="architect",
            round=round_num,
            event_type="output",
            content=code,
            metadata={"raw_response": full_response[:500]},
        ))

        return code

    def _call_claude(self, prompt: str) -> str:
        message = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text
