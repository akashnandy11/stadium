import asyncio
import anthropic
from config import settings
from models.agent_output import AgentEvent
from agents.prompts import parse_tests_block


class AdversaryAgent:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.ADVERSARY_MODEL

    async def run(self, prompt: str, event_queue: asyncio.Queue, round_num: int) -> str:
        await event_queue.put(AgentEvent(
            agent="adversary",
            round=round_num,
            event_type="thinking",
            content=f"⚔️ Adversary is crafting adversarial tests to break the code (Round {round_num})...",
        ))

        loop = asyncio.get_event_loop()
        full_response = await loop.run_in_executor(None, self._call_claude, prompt)

        tests = parse_tests_block(full_response)

        await event_queue.put(AgentEvent(
            agent="adversary",
            round=round_num,
            event_type="output",
            content=tests,
            metadata={"raw_response": full_response[:500]},
        ))

        return tests

    def _call_claude(self, prompt: str) -> str:
        message = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text
