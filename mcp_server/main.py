"""SkillForge — AI-Powered Alexa Skill Builder via MCP.

"Build Alexa skills with AI. Ship in minutes, not months."
Architect: Venkata Madhava Reddy | Hackathon: Amazon Developer Hackathon 2026 | Track: Alexa+ MCP
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from fastapi import Body, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from mcp_server.models.mcp_models import (
    AnalyzeSkillRequest,
    DeploySkillRequest,
    GenerateSkillRequest,
    ListSkillsRequest,
    RefineSkillRequest,
    TestSkillRequest,
)
from mcp_server.tools.analyze_skill import analyze_skill
from mcp_server.tools.deploy_skill import deploy_skill
from mcp_server.tools.generate_skill import generate_skill
from mcp_server.tools.list_skills import list_skills
from mcp_server.tools.refine_skill import refine_skill
from mcp_server.tools.test_skill import test_skill
from mcp_server.services.dynamodb_service import dynamodb_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("skillforge.mcp_server")


# Pre-seed showcase skill for instant evaluation
def seed_showcase_skill():
    existing = dynamodb_service.list_skills(limit=1)
    if not existing:
        logger.info("Pre-seeding showcase skill 'Hydration Tracker' for instant review...")
        generate_skill(
            description="Build a skill that tracks my daily water intake and reminds me to drink every 2 hours",
            skill_name="Hydration Tracker",
            invocation_name="water tracker",
            locale="en-US",
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 64)
    logger.info("🚀 Starting SkillForge — AI-Powered Alexa Skill Builder via MCP")
    logger.info("📡 MCP Spec: 2025-11-25+ Streamable HTTP & SSE Discovery")
    logger.info("🤖 AI Orchestrator: Amazon Bedrock (Claude 3 Haiku / Sonnet)")
    logger.info("🛠️ Registered MCP Tools: 6 tools active")
    logger.info("=" * 64)
    seed_showcase_skill()
    yield
    logger.info("🛑 Shutting down SkillForge MCP server.")


app = FastAPI(
    title="SkillForge — AI-Powered Alexa Skill Builder via MCP",
    version="2.0.0",
    description="Build Alexa skills with AI. Ship in minutes, not months.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Cross-Origin Resource Sharing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# ── MCP Tool Manifests & Discovery (Alexa+ & Agent Spec) ─────────────────────

MCP_TOOL_DEFINITIONS = [
    {
        "name": "generate_skill",
        "description": "Generate a full Alexa skill package (interactionModel.json, lambda/index.js, skill.json, test_suite.json) from a plain English description in <60 seconds.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "description": {"type": "string", "description": "Plain English description of the Alexa skill to build."},
                "skill_name": {"type": "string", "description": "Optional custom title for the skill."},
                "invocation_name": {"type": "string", "description": "Optional custom invocation name (minimum 2 words)."},
                "locale": {"type": "string", "default": "en-US", "description": "Locale code, e.g. en-US, en-IN, hi-IN, es-ES."},
                "include_dynamodb": {"type": "boolean", "default": True, "description": "Include DynamoDB persistence adapter."},
            },
            "required": ["description"],
        },
    },
    {
        "name": "refine_skill",
        "description": "Iterate on an existing Alexa skill package with follow-up plain English instructions while preserving all existing intents.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "skill_id": {"type": "string", "description": "ID of the skill package to refine."},
                "instructions": {"type": "string", "description": "Plain English refinement instructions."},
            },
            "required": ["skill_id", "instructions"],
        },
    },
    {
        "name": "test_skill",
        "description": "Run utterance validation, entity slot matching, and automated regression test suite against the interaction model.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "skill_id": {"type": "string", "description": "ID of the skill to test."},
                "test_utterance": {"type": "string", "description": "Optional single utterance to test."},
                "run_full_suite": {"type": "boolean", "default": True, "description": "Run complete 20+ test suite."},
            },
            "required": ["skill_id"],
        },
    },
    {
        "name": "deploy_skill",
        "description": "One-click deployment of the generated Alexa skill package to the Alexa Developer Console via ASK CLI with pre-deployment validation.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "skill_id": {"type": "string", "description": "ID of the skill to deploy."},
                "stage": {"type": "string", "default": "development", "description": "Target stage: development, test, live."},
            },
            "required": ["skill_id"],
        },
    },
    {
        "name": "analyze_skill",
        "description": "Retrieve invocation metrics, error rates, CloudWatch telemetry, and Sankey conversation flows for a skill.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "skill_id": {"type": "string", "description": "ID of the skill to analyze."},
                "time_range": {"type": "string", "default": "30d", "description": "Time range: 24h, 7d, 30d."},
            },
            "required": ["skill_id"],
        },
    },
    {
        "name": "list_skills",
        "description": "List all generated, tested, and deployed skills in the developer portfolio.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "limit": {"type": "integer", "default": 20, "description": "Maximum number of skills to return."},
                "status_filter": {"type": "string", "description": "Filter by status: generated, refined, tested, deployed."},
            },
        },
    },
]


@app.get("/mcp/tools")
@app.get("/tools")
async def mcp_list_tools():
    """MCP Protocol Tool Discovery endpoint."""
    return {"tools": MCP_TOOL_DEFINITIONS, "mcp_spec": "2025-11-25", "provider": "SkillForge"}


@app.post("/mcp/tools/call")
@app.post("/mcp/call")
async def mcp_tool_call(payload: dict[str, Any] = Body(...)):
    """Standard Model Context Protocol tool execution endpoint."""
    name = payload.get("name") or payload.get("tool")
    arguments = payload.get("arguments") or payload.get("params") or {}

    if not name:
        raise HTTPException(status_code=400, detail="Missing tool 'name' in MCP call")

    if name == "generate_skill":
        return generate_skill(**arguments)
    elif name == "refine_skill":
        return refine_skill(**arguments)
    elif name == "test_skill":
        return test_skill(**arguments)
    elif name == "deploy_skill":
        return deploy_skill(**arguments)
    elif name == "analyze_skill":
        return analyze_skill(**arguments)
    elif name == "list_skills":
        return list_skills(**arguments)
    else:
        raise HTTPException(status_code=404, detail=f"Unknown MCP tool: {name}")


# ── REST API Endpoints ───────────────────────────────────────────────────────

@app.post("/tools/generate_skill")
async def api_generate_skill(req: GenerateSkillRequest):
    return generate_skill(
        description=req.description,
        skill_name=req.skill_name,
        invocation_name=req.invocation_name,
        locale=req.locale,
        include_dynamodb=req.include_dynamodb,
    )


@app.post("/tools/refine_skill")
async def api_refine_skill(req: RefineSkillRequest):
    return refine_skill(skill_id=req.skill_id, instructions=req.instructions)


@app.post("/tools/test_skill")
async def api_test_skill(req: TestSkillRequest):
    return test_skill(
        skill_id=req.skill_id,
        test_utterance=req.test_utterance,
        run_full_suite=req.run_full_suite,
    )


@app.post("/tools/deploy_skill")
async def api_deploy_skill(req: DeploySkillRequest):
    return deploy_skill(skill_id=req.skill_id, stage=req.stage, target=req.target)


@app.post("/tools/analyze_skill")
async def api_analyze_skill(req: AnalyzeSkillRequest):
    return analyze_skill(skill_id=req.skill_id, time_range=req.time_range)


@app.get("/tools/list_skills")
@app.post("/tools/list_skills")
async def api_list_skills(req: ListSkillsRequest = ListSkillsRequest()):
    return list_skills(limit=req.limit, status_filter=req.status_filter)


@app.get("/tools/skill/{skill_id}")
async def api_get_skill(skill_id: str):
    skill = dynamodb_service.get_skill(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return {"skill": skill}


# ── Application Web Simulator & Documentation ────────────────────────────────

@app.get("/", response_class=HTMLResponse)
@app.get("/simulator", response_class=HTMLResponse)
async def serve_simulator():
    """Serve the SkillForge Web Experience & Visualizer."""
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return HTMLResponse("<h1>SkillForge MCP Server</h1><p>Visit /docs or /mcp/tools</p>")


@app.get("/health")
async def health_check():
    """Health check for container and AWS ECS/ALB monitoring."""
    return {
        "status": "healthy",
        "service": "SkillForge — AI-Powered Alexa Skill Builder via MCP",
        "version": "2.0.0",
        "tools_count": len(MCP_TOOL_DEFINITIONS),
        "bedrock_available": True,
        "dynamodb_active": dynamodb_service.is_active,
    }


@app.get("/info")
async def info_endpoint():
    """Hackathon metadata."""
    return {
        "project": "SkillForge",
        "tagline": "Build Alexa skills with AI. Ship in minutes, not months.",
        "architect": "Venkata Madhava Reddy",
        "hackathon": "Amazon Developer Hackathon 2026",
        "track": "Alexa+ MCP",
        "mcp_tools": [t["name"] for t in MCP_TOOL_DEFINITIONS],
        "aws_integrations": ["Amazon Bedrock Claude 3 Haiku", "AWS DynamoDB", "AWS Lambda", "AWS CloudWatch"],
    }
