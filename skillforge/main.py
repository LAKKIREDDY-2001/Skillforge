"""SkillForge — Voice-First Developer Learning MCP Server for Alexa+ & AWS Bedrock."""

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from skillforge.config import settings
from skillforge.mcp_handler import api_router, engine, mcp_router, mcp_server

# Logging Setup
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("skillforge.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown hooks."""
    logger.info("=" * 60)
    logger.info(f"🚀 Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"📡 MCP Protocol Spec: {settings.mcp_protocol_version} (Streamable HTTP & SSE)")
    logger.info(f"🤖 Bedrock Model: {settings.bedrock_model_id}")
    logger.info(f"💾 Storage Mode: {'AWS DynamoDB' if engine.store.is_dynamodb_active else 'Local JSON Fallback'}")
    logger.info(f"🛠️ Registered MCP Tools: {len(mcp_server.list_tools())}")
    logger.info("=" * 60)
    yield
    logger.info("🛑 Shutting down SkillForge server.")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=settings.description,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware for local web simulator and cross-origin tools
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount MCP and REST routers
app.include_router(mcp_router, prefix="/mcp")
app.include_router(api_router, prefix="/api")

# Static files directory
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/", response_class=HTMLResponse)
@app.get("/simulator", response_class=HTMLResponse)
async def serve_simulator():
    """Serve the Simulated Alexa+ Web Experience."""
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return HTMLResponse("<h1>SkillForge MCP Server</h1><p>Visit /docs or /mcp/tools</p>")


@app.get("/health")
async def health_check():
    """Health check endpoint for ECS Fargate / ALB container monitoring."""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "mcp_version": settings.mcp_protocol_version,
        "bedrock_available": engine.bedrock.is_available,
        "dynamodb_active": engine.store.is_dynamodb_active,
    }


@app.get("/info")
async def info_endpoint():
    """Server metadata and hackathon track details."""
    return {
        "project": "SkillForge",
        "tagline": "Voice-First Developer Learning for Alexa+ & AWS Bedrock",
        "hackathon_tracks": {
            "primary": "Alexa+ (Self-Hosted MCP Server 2025-11-25 + Simulated Web Experience)",
            "mini_challenges": [
                "AWS Builder (Amazon Bedrock Claude 3.5 Sonnet + DynamoDB + ECS Fargate)",
                "Open Source (Apache 2.0 / MIT Reusable MCP Tool Suite)",
            ],
        },
        "endpoints": {
            "web_simulator": "/",
            "mcp_sse": "/mcp/sse",
            "mcp_jsonrpc": "/mcp",
            "mcp_tools": "/mcp/tools",
            "mcp_resources": "/mcp/resources",
            "mcp_prompts": "/mcp/prompts",
            "api_docs": "/docs",
        },
    }
