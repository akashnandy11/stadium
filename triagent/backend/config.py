from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str = ""
    GITHUB_TOKEN: str = ""
    GITHUB_REPO_OWNER: str = ""
    GITHUB_REPO_NAME: str = ""
    OWASP_ZAP_API_KEY: str = "changeme"
    OWASP_ZAP_URL: str = "http://localhost:8080"
    CODEBASE_PATH: str = "./codebase"
    MAX_DEBATE_ROUNDS: int = 3
    BACKEND_PORT: int = 8000
    FRONTEND_PORT: int = 3000
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    ARCHITECT_MODEL: str = "claude-opus-4-5"
    ADVERSARY_MODEL: str = "claude-sonnet-4-5"
    SENTINEL_MODEL: str = "claude-sonnet-4-5"

    FAISS_INDEX_PATH: str = "./faiss_index"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    RAG_TOP_K: int = 5
    RAG_MAX_TOKENS: int = 2000
    CHUNK_SIZE: int = 200
    CHUNK_OVERLAP: int = 50

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
