import os
import asyncio
from typing import Optional
from config import settings
from models.ticket import TicketRequest

try:
    import faiss
    import numpy as np
    from sentence_transformers import SentenceTransformer
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False


class RAGService:
    def __init__(self):
        self.index = None
        self.chunks: list[dict] = []
        self.model = None
        self._initialized = False

    def _ensure_model(self):
        if not RAG_AVAILABLE or self._initialized:
            return
        try:
            self.model = SentenceTransformer(settings.EMBEDDING_MODEL)
            self._load_or_build_index()
            self._initialized = True
        except Exception:
            self._initialized = False

    def _load_or_build_index(self):
        index_path = os.path.join(settings.FAISS_INDEX_PATH, "index.faiss")
        chunks_path = os.path.join(settings.FAISS_INDEX_PATH, "chunks.txt")

        if os.path.exists(index_path):
            self.index = faiss.read_index(index_path)
            if os.path.exists(chunks_path):
                with open(chunks_path, "r") as f:
                    self.chunks = [{"text": line.strip()} for line in f if line.strip()]
        else:
            self._build_index(settings.CODEBASE_PATH)

    def _build_index(self, codebase_path: str):
        if not os.path.exists(codebase_path):
            return

        extensions = {".py", ".js", ".ts", ".java", ".go"}
        all_chunks = []

        for root, _, files in os.walk(codebase_path):
            for fname in files:
                if any(fname.endswith(ext) for ext in extensions):
                    fpath = os.path.join(root, fname)
                    try:
                        with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()
                        chunks = self._chunk_text(content, fpath)
                        all_chunks.extend(chunks)
                    except Exception:
                        continue

        if not all_chunks:
            return

        self.chunks = all_chunks
        texts = [c["text"] for c in all_chunks]
        embeddings = self.model.encode(texts, show_progress_bar=False)
        embeddings = np.array(embeddings, dtype=np.float32)

        dim = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dim)
        self.index.add(embeddings)

        os.makedirs(settings.FAISS_INDEX_PATH, exist_ok=True)
        faiss.write_index(self.index, os.path.join(settings.FAISS_INDEX_PATH, "index.faiss"))
        with open(os.path.join(settings.FAISS_INDEX_PATH, "chunks.txt"), "w") as f:
            for c in all_chunks:
                f.write(c["text"].replace("\n", " ") + "\n")

    def _chunk_text(self, text: str, filepath: str) -> list[dict]:
        words = text.split()
        chunks = []
        size = settings.CHUNK_SIZE
        overlap = settings.CHUNK_OVERLAP
        for i in range(0, len(words), size - overlap):
            chunk_words = words[i : i + size]
            chunk_text = f"# File: {filepath}\n" + " ".join(chunk_words)
            chunks.append({"text": chunk_text, "file": filepath})
        return chunks

    async def retrieve(self, ticket: TicketRequest) -> str:
        if not RAG_AVAILABLE or not self._initialized:
            self._ensure_model()
            if not self._initialized or self.index is None:
                return "No codebase context available (RAG not initialized)."

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._sync_retrieve, ticket)

    def _sync_retrieve(self, ticket: TicketRequest) -> str:
        query = f"{ticket.title} {ticket.description}"
        query_embedding = self.model.encode([query], show_progress_bar=False)
        query_embedding = np.array(query_embedding, dtype=np.float32)

        k = min(settings.RAG_TOP_K, len(self.chunks))
        if k == 0:
            return "No codebase chunks available."

        distances, indices = self.index.search(query_embedding, k)
        results = []
        total_tokens = 0
        for idx in indices[0]:
            if idx < 0 or idx >= len(self.chunks):
                continue
            chunk_text = self.chunks[idx]["text"]
            tokens = len(chunk_text.split())
            if total_tokens + tokens > settings.RAG_MAX_TOKENS:
                break
            results.append(chunk_text)
            total_tokens += tokens

        return "\n\n---\n\n".join(results) if results else "No relevant context found."

    async def index_codebase(self, path: str) -> dict:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._sync_index, path)

    def _sync_index(self, path: str) -> dict:
        self._ensure_model()
        self._build_index(path)
        return {"files_indexed": len(self.chunks), "chunks": len(self.chunks)}


rag_service = RAGService()
