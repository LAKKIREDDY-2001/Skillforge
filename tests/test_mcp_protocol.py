"""Unit tests for MCP JSON-RPC 2.0 protocol and tools/resources/prompts."""

import json
import pytest
from skillforge.mcp_server import MCPServer
from skillforge.skill_engine import SkillEngine


@pytest.fixture
def mcp():
    engine = SkillEngine()
    return MCPServer(engine=engine)


@pytest.mark.asyncio
async def test_mcp_initialize(mcp):
    request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2025-11-25",
            "capabilities": {},
            "clientInfo": {"name": "test_client", "version": "1.0"},
        },
    }
    response = await mcp.handle_jsonrpc(request)
    assert response["jsonrpc"] == "2.0"
    assert response["id"] == 1
    assert "result" in response
    res = response["result"]
    assert res["protocolVersion"] == "2025-11-25"
    assert "capabilities" in res
    assert "tools" in res["capabilities"]
    assert "serverInfo" in res
    assert res["serverInfo"]["name"] == "SkillForge"


@pytest.mark.asyncio
async def test_mcp_tools_list(mcp):
    request = {"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}
    response = await mcp.handle_jsonrpc(request)
    assert "result" in response
    tools = response["result"]["tools"]
    tool_names = [t["name"] for t in tools]
    expected_tools = [
        "quiz_me",
        "explain_concept",
        "check_streak",
        "suggest_next",
        "evaluate_answer",
        "daily_challenge",
        "get_hint",
        "mock_interview",
        "get_code_solution",
        "export_apl_document",
        "send_streak_reminder",
    ]
    for expected in expected_tools:
        assert expected in tool_names


@pytest.mark.asyncio
async def test_mcp_tools_call_quiz_me(mcp):
    request = {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "quiz_me",
            "arguments": {"topic": "arrays", "difficulty": "easy", "num_questions": 1},
        },
    }
    response = await mcp.handle_jsonrpc(request)
    assert response["id"] == 3
    assert "result" in response
    content = response["result"]["content"]
    assert len(content) >= 1
    parsed = json.loads(content[0]["text"])
    assert parsed["topic"] == "arrays"
    assert len(parsed["questions"]) == 1


@pytest.mark.asyncio
async def test_mcp_resources_list_and_read(mcp):
    # List
    req_list = {"jsonrpc": "2.0", "id": 4, "method": "resources/list", "params": {}}
    res_list = await mcp.handle_jsonrpc(req_list)
    resources = res_list["result"]["resources"]
    uris = [r["uri"] for r in resources]
    assert "skillforge://topics/catalog" in uris
    assert "skillforge://progress/overview" in uris
    assert "skillforge://notifications/feed" in uris

    # Read
    req_read = {
        "jsonrpc": "2.0",
        "id": 5,
        "method": "resources/read",
        "params": {"uri": "skillforge://topics/catalog"},
    }
    res_read = await mcp.handle_jsonrpc(req_read)
    contents = res_read["result"]["contents"]
    assert len(contents) == 1
    catalog_data = json.loads(contents[0]["text"])
    assert "topics" in catalog_data
    assert len(catalog_data["topics"]) == 10


@pytest.mark.asyncio
async def test_mcp_prompts_list_and_get(mcp):
    # List
    req_list = {"jsonrpc": "2.0", "id": 6, "method": "prompts/list", "params": {}}
    res_list = await mcp.handle_jsonrpc(req_list)
    prompts = res_list["result"]["prompts"]
    p_names = [p["name"] for p in prompts]
    assert "study_session" in p_names

    # Get
    req_get = {
        "jsonrpc": "2.0",
        "id": 7,
        "method": "prompts/get",
        "params": {"name": "study_session", "arguments": {"topic": "graphs", "duration_minutes": 25}},
    }
    res_get = await mcp.handle_jsonrpc(req_get)
    result = res_get["result"]
    assert "messages" in result
    msg_text = result["messages"][0]["content"]["text"]
    assert "graphs" in msg_text
    assert "25-minute" in msg_text


@pytest.mark.asyncio
async def test_mcp_unknown_method_error(mcp):
    request = {"jsonrpc": "2.0", "id": 99, "method": "nonexistent/method", "params": {}}
    response = await mcp.handle_jsonrpc(request)
    assert "error" in response
    assert response["error"]["code"] == -32601


@pytest.mark.asyncio
async def test_mcp_send_streak_reminder_and_notifications_feed(mcp):
    # Test tool call
    call_req = {
        "jsonrpc": "2.0",
        "id": 10,
        "method": "tools/call",
        "params": {
            "name": "send_streak_reminder",
            "arguments": {"user_id": "test_dev", "urgency": "streak_at_risk"},
        },
    }
    call_res = await mcp.handle_jsonrpc(call_req)
    assert "result" in call_res
    content = call_res["result"]["content"]
    data = json.loads(content[0]["text"])
    assert "title" in data
    assert "body" in data
    assert "voice_prompt" in data
    assert "streak_days" in data

    # Test resource read
    read_req = {
        "jsonrpc": "2.0",
        "id": 11,
        "method": "resources/read",
        "params": {"uri": "skillforge://notifications/feed"},
    }
    read_res = await mcp.handle_jsonrpc(read_req)
    contents = read_res["result"]["contents"]
    feed_data = json.loads(contents[0]["text"])
    assert "notifications" in feed_data
    assert len(feed_data["notifications"]) >= 1

