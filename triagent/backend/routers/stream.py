import asyncio
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from routers.analyze import job_queues
from agents.orchestrator import job_store

router = APIRouter()


@router.get("/stream/{job_id}")
async def stream_events(job_id: str):
    if job_id not in job_queues:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_generator():
        queue = job_queues[job_id]
        while True:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=120.0)
                data = json.dumps(event.model_dump())
                yield f"data: {data}\n\n"

                if event.event_type in ("done", "error"):
                    break
            except asyncio.TimeoutError:
                yield f"data: {json.dumps({'event_type': 'heartbeat', 'content': 'ping'})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'event_type': 'error', 'content': str(e)})}\n\n"
                break

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
