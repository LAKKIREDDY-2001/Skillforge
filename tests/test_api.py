"""Integration tests for FastAPI endpoints."""

import pytest
from httpx import ASGITransport, AsyncClient
from skillforge.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert data["service"] == "SkillForge"


@pytest.mark.asyncio
async def test_info_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/info")
        assert resp.status_code == 200
        data = resp.json()
        assert "hackathon_tracks" in data
        assert "endpoints" in data


@pytest.mark.asyncio
async def test_mcp_tools_list_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/mcp/tools")
        assert resp.status_code == 200
        data = resp.json()
        assert "tools" in data
        assert len(data["tools"]) >= 8


@pytest.mark.asyncio
async def test_api_topics_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/topics")
        assert resp.status_code == 200
        data = resp.json()
        assert "topics" in data
        assert len(data["topics"]) == 10


@pytest.mark.asyncio
async def test_api_daily_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/daily")
        assert resp.status_code == 200
        data = resp.json()
        assert "question" in data
        assert "topic" in data


@pytest.mark.asyncio
async def test_api_streak_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/streak?user_id=api_test_user")
        assert resp.status_code == 200
        data = resp.json()
        assert "streak_days" in data
        assert "level" in data
