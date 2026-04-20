from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analyze, stream
from config import settings

app = FastAPI(title="TriAgent API", version="1.0.0", description="The AI Code Review Squad")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api")
app.include_router(stream.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/")
def root():
    return {"message": "TriAgent API — The AI Code Review Squad", "docs": "/docs"}
