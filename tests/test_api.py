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


import uuid


@pytest.mark.asyncio
async def test_api_auth_flow():
    transport = ASGITransport(app=app)
    new_username = f"coder_{uuid.uuid4().hex[:6]}"
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Sign In with seeded user
        resp = await client.post("/api/auth/signin", json={"username": "alex", "password": "alex123"})
        assert resp.status_code == 200
        assert resp.json()["user"]["username"] == "alex"

        # 2. Sign Up new user
        signup_resp = await client.post(
            "/api/auth/signup",
            json={
                "username": new_username,
                "password": "secret_password",
                "display_name": "New Coder",
                "email": f"{new_username}@skillforge.io",
                "target_role": "Google SDE",
            },
        )
        assert signup_resp.status_code == 200
        assert signup_resp.json()["user"]["username"] == new_username

        # 3. List users
        users_resp = await client.get("/api/auth/users")
        assert users_resp.status_code == 200
        usernames = [u["username"] for u in users_resp.json()["users"]]
        assert new_username in usernames
        assert "alex" in usernames

        # 4. Get profile
        prof_resp = await client.get(f"/api/auth/profile?username={new_username}")
        assert prof_resp.status_code == 200
        assert prof_resp.json()["user"]["display_name"] == "New Coder"
        assert "stats" in prof_resp.json()

