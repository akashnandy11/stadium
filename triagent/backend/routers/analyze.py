import asyncio
import uuid
from fastapi import APIRouter, BackgroundTasks, HTTPException
from models.ticket import TicketRequest
from agents.orchestrator import run_debate_loop, job_store

router = APIRouter()

# In-memory event queues per job
job_queues: dict[str, asyncio.Queue] = {}


@router.post("/analyze")
async def analyze(ticket: TicketRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    queue: asyncio.Queue = asyncio.Queue()
    job_queues[job_id] = queue
    job_store[job_id] = {
        "status": "queued",
        "ticket": ticket.model_dump(),
        "report": None,
    }

    background_tasks.add_task(run_debate_loop, ticket, job_id, queue)
    return {"job_id": job_id, "status": "queued"}


@router.get("/report/{job_id}")
async def get_report(job_id: str):
    if job_id not in job_store:
        raise HTTPException(status_code=404, detail="Job not found")
    job = job_store[job_id]
    if job["status"] != "done":
        raise HTTPException(status_code=202, detail=f"Job is {job['status']}")
    return job["report"]


@router.get("/jobs")
async def list_jobs():
    return [
        {
            "job_id": jid,
            "status": data["status"],
            "title": data["ticket"].get("title", ""),
        }
        for jid, data in job_store.items()
    ]


@router.post("/index-codebase")
async def index_codebase(body: dict):
    from services.rag_service import rag_service
    path = body.get("path", "./codebase")
    result = await rag_service.index_codebase(path)
    return result
