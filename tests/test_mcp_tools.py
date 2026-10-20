"""Integration tests for MCP Tool calls."""

from mcp_server.tools.generate_skill import generate_skill
from mcp_server.tools.refine_skill import refine_skill


def test_generate_skill_mcp_tool_returns_package():
    """Verify generate_skill MCP tool generates and returns complete deployable package."""
    res = generate_skill(
        description="Build a skill that tracks my daily water intake and reminds me to drink every 2 hours",
        skill_name="Hydration Tracker",
        invocation_name="water tracker",
    )

    assert res["success"] is True
    assert res["tool"] == "generate_skill"
    data = res["data"]
    assert "skill_id" in data
    assert "interaction_model" in data
    assert "lambda_handler" in data
    assert "manifest" in data
    assert "test_suite" in data
    assert len(data["test_suite"]) >= 20


def test_refine_skill_preserves_existing_intents():
    """Verify refine_skill MCP tool preserves existing intents and adds new ones."""
    # 1. Generate base skill
    init_res = generate_skill(
        description="Build a skill that tracks my daily water intake",
        skill_name="Hydration Tracker",
        invocation_name="water tracker",
    )
    skill_id = init_res["data"]["skill_id"]
    initial_intents = [
        i["name"]
        for i in init_res["data"]["interaction_model"]["interactionModel"]["languageModel"]["intents"]
    ]

    # 2. Refine skill to add weekly summary
    refine_res = refine_skill(
        skill_id=skill_id,
        instructions="Add a weekly summary that tells me my average daily intake",
    )

    assert refine_res["success"] is True
    refined_data = refine_res["data"]
    refined_intents = [
        i["name"]
        for i in refined_data["interaction_model"]["interactionModel"]["languageModel"]["intents"]
    ]

    # Check all initial intents are preserved
    for orig in initial_intents:
        assert orig in refined_intents, f"Existing intent '{orig}' was lost during refinement!"

    # Check new intent was added
    assert "WeeklySummaryIntent" in refined_intents
    assert refined_data["version"] >= 2
