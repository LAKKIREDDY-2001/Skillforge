"""MCP protocol routes and REST endpoints for SkillForge."""

import asyncio
import json
import logging
import uuid
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from skillforge.mcp_server import MCPServer
from skillforge.skill_engine import SkillEngine

logger = logging.getLogger("skillforge.mcp_handler")

# Shared instances
engine = SkillEngine()
mcp_server = MCPServer(engine=engine)

mcp_router = APIRouter(tags=["MCP Protocol"])
api_router = APIRouter(tags=["Web Simulator API"])


# ── Pydantic Request Models ───────────────────────────────────────────────────

class ToolCallRequest(BaseModel):
    name: str
    arguments: dict[str, Any] = {}


class ResourceReadRequest(BaseModel):
    uri: str
    user_id: Optional[str] = "default_user"


class PromptGetRequest(BaseModel):
    name: str
    arguments: dict[str, Any] = {}


class QuizRequest(BaseModel):
    topic: str = "dynamic_programming"
    difficulty: str = "medium"
    user_id: str = "default_user"
    num_questions: int = 2


class ExplainRequest(BaseModel):
    topic: str = "dynamic_programming"
    user_id: str = "default_user"
    style: str = "analogy"


class EvaluateRequest(BaseModel):
    question_id: str
    answer: str
    user_id: str = "default_user"


class HintRequest(BaseModel):
    question_id: str
    attempt_text: Optional[str] = None
    hint_level: int = 1


# ── MCP Streamable HTTP & SSE Transport ────────────────────────────────────────

# Active SSE client queues: session_id -> asyncio.Queue
_active_sse_sessions: dict[str, asyncio.Queue] = {}


@mcp_router.get("/sse")
async def mcp_sse_endpoint(request: Request):
    """Server-Sent Events endpoint for Streamable HTTP MCP clients."""
    session_id = str(uuid.uuid4())
    queue: asyncio.Queue = asyncio.Queue()
    _active_sse_sessions[session_id] = queue

    # Send endpoint URI as initial event per MCP Streamable HTTP spec
    endpoint_url = f"/mcp/messages?session_id={session_id}"
    await queue.put({"event": "endpoint", "data": endpoint_url})

    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=20.0)
                    yield event
                except asyncio.TimeoutError:
                    # Keep-alive ping
                    yield {"event": "ping", "data": "{}"}
        finally:
            _active_sse_sessions.pop(session_id, None)

    return EventSourceResponse(event_generator())


@mcp_router.post("/messages")
async def mcp_messages_endpoint(request: Request, session_id: str):
    """Post message endpoint for established SSE sessions."""
    queue = _active_sse_sessions.get(session_id)
    if not queue:
        raise HTTPException(status_code=404, detail="Session not found or expired.")

    body = await request.json()
    response_rpc = await mcp_server.handle_jsonrpc(body)

    # Push response through the SSE stream
    await queue.put({"event": "message", "data": json.dumps(response_rpc)})
    return {"status": "accepted", "id": body.get("id")}


# ── MCP Standard JSON-RPC 2.0 (Streamable / Post) ─────────────────────────────

@mcp_router.post("")
@mcp_router.post("/")
@mcp_router.post("/rpc")
async def mcp_jsonrpc_endpoint(request: Request):
    """Direct JSON-RPC 2.0 endpoint for MCP clients."""
    body = await request.json()
    return await mcp_server.handle_jsonrpc(body)


# ── MCP REST Compatible Routes ────────────────────────────────────────────────

@mcp_router.get("/tools")
async def list_tools():
    """List all registered MCP tools."""
    return {"tools": mcp_server.list_tools()}


@mcp_router.post("/tools/call")
async def call_tool(req: ToolCallRequest):
    """Execute an MCP tool call."""
    result = await mcp_server.execute_tool(req.name, req.arguments)
    is_error = "error" in result
    return {
        "content": [{"type": "text", "text": json.dumps(result, indent=2)}],
        "isError": is_error,
        "raw": result,
    }


@mcp_router.get("/resources")
async def list_resources():
    """List all available MCP resources."""
    return {"resources": mcp_server.list_resources()}


@mcp_router.post("/resources/read")
async def read_resource(req: ResourceReadRequest):
    """Read contents of an MCP resource."""
    data = await mcp_server.read_resource(req.uri, user_id=req.user_id or "default_user")
    return {
        "contents": [
            {
                "uri": req.uri,
                "mimeType": "application/json",
                "text": json.dumps(data, indent=2),
            }
        ]
    }


@mcp_router.get("/prompts")
async def list_prompts():
    """List all MCP prompt templates."""
    return {"prompts": mcp_server.list_prompts()}


@mcp_router.post("/prompts/get")
async def get_prompt(req: PromptGetRequest):
    """Retrieve constructed prompt text."""
    return mcp_server.get_prompt(req.name, req.arguments)


# ── Web Simulator REST API Routes ─────────────────────────────────────────────

@api_router.post("/quiz")
async def api_quiz(req: QuizRequest):
    return engine.quiz_me(
        topic=req.topic,
        difficulty=req.difficulty,
        user_id=req.user_id,
        num_questions=req.num_questions,
    )


@api_router.post("/explain")
async def api_explain(req: ExplainRequest):
    return engine.explain_concept(topic=req.topic, user_id=req.user_id, style=req.style)


@api_router.get("/streak")
async def api_streak(user_id: str = "default_user"):
    return engine.check_streak(user_id=user_id)


@api_router.get("/suggest")
async def api_suggest(user_id: str = "default_user"):
    return engine.suggest_next(user_id=user_id)


@api_router.post("/evaluate")
async def api_evaluate(req: EvaluateRequest):
    return engine.evaluate_answer(
        question_id=req.question_id,
        answer=req.answer,
        user_id=req.user_id,
    )


@api_router.get("/daily")
async def api_daily(user_id: str = "default_user"):
    return engine.daily_challenge(user_id=user_id)


@api_router.post("/hint")
async def api_hint(req: HintRequest):
    return engine.get_hint(
        question_id=req.question_id,
        attempt_text=req.attempt_text,
        hint_level=req.hint_level,
    )


@api_router.get("/topics")
async def api_topics():
    return engine.get_topics_catalog()


@api_router.get("/flashcards")
async def api_flashcards(user_id: str = "default_user"):
    """Get all flashcards with SM-2 states for interactive review deck."""
    schedule = engine.store.get_review_schedule(user_id)
    cards = []
    for qid, state in schedule.items():
        q = engine._find_question_by_id(qid)
        if q:
            cards.append({
                "id": qid,
                "topic": q["topic"],
                "question": q["question"],
                "answer": q["answer"],
                "hint": q.get("hint", ""),
                "key_points": q.get("key_points", []),
                "interval": state.get("interval", 1),
                "repetitions": state.get("repetitions", 0),
                "ease_factor": state.get("ease_factor", 2.5),
                "next_review": state.get("next_review"),
                "last_score": state.get("last_score", 0),
            })
    return {"flashcards": cards, "total": len(cards)}
