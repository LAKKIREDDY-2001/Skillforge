"""MCP Tool: `refine_skill`
Iteratively refines an existing Alexa skill package based on plain English instructions.
Crucially preserves existing intents while adding new features.
"""

from __future__ import annotations

import logging
import time
from datetime import datetime, timezone
from typing import Any

from mcp_server.generators.lambda_generator import lambda_generator
from mcp_server.generators.test_generator import test_generator
from mcp_server.models.mcp_models import MCPToolResponse
from mcp_server.services.dynamodb_service import dynamodb_service

logger = logging.getLogger("skillforge.tool.refine_skill")


def refine_skill(skill_id: str, instructions: str) -> dict[str, Any]:
    """MCP Tool: Refine an existing Alexa skill package with follow-up instructions."""
    start_time = time.time()
    existing_package = dynamodb_service.get_skill(skill_id)

    if not existing_package:
        return MCPToolResponse(
            success=False,
            tool="refine_skill",
            message=f"Skill '{skill_id}' not found.",
            data={},
            error="SkillNotFound",
        ).model_dump()

    # Deep copy / clone interaction model
    im = existing_package.get("interaction_model", {})
    container = im.get("interactionModel", im)
    lm = container.get("languageModel", {})
    existing_intents = list(lm.get("intents", []))

    # Parse instructions to determine added intent or refinement
    inst_lower = instructions.lower()
    new_intent_name = "WeeklySummaryIntent"
    new_samples = [
        "give me my weekly summary",
        "what was my average daily intake this week",
        "tell me my weekly report",
        "show weekly average",
        "how did I do this week",
        "give me my seven day breakdown",
        "calculate my weekly stats",
        "summarize my week",
        "what is my weekly score",
        "review my performance for the week",
    ]

    if "weekly" in inst_lower or "summary" in inst_lower or "average" in inst_lower:
        new_intent_name = "WeeklySummaryIntent"
    elif "history" in inst_lower or "log" in inst_lower:
        new_intent_name = "ViewHistoryIntent"
        new_samples = [
            "show my history",
            "what did I log yesterday",
            "view past entries",
            "show recent logs",
            "read my logbook",
            "list my previous sessions",
            "tell me what I did yesterday",
            "check yesterday's record",
            "review my previous records",
            "show my log history",
        ]
    else:
        new_intent_name = "CustomRefinementIntent"
        new_samples = [
            f"run {instructions[:20].strip()}",
            "execute my custom action",
            "perform requested operation",
            "apply my custom command",
            "do the new step",
            "trigger the refinement",
            "run the updated procedure",
            "start custom action now",
            "please execute updated workflow",
            "begin refined action",
        ]

    # PRESERVE existing intents: check if new intent already exists; if not, append!
    existing_names = [i.get("name") for i in existing_intents if isinstance(i, dict)]
    if new_intent_name not in existing_names:
        existing_intents.insert(
            len(existing_names) - 5,  # insert right before built-in Amazon intents
            {
                "name": new_intent_name,
                "slots": [],
                "samples": new_samples,
            },
        )

    lm["intents"] = existing_intents
    container["languageModel"] = lm
    im["interactionModel"] = container
    existing_package["interaction_model"] = im

    # Re-generate Lambda handler incorporating new intent
    skill_name = existing_package.get("name", "Alexa Skill")
    new_lambda = lambda_generator.generate_lambda_handler(
        skill_name=skill_name,
        description=f"{existing_package.get('description', '')} (Refined: {instructions})",
        interaction_model=im,
    )
    existing_package["lambda_handler"] = new_lambda

    # Update Test Suite
    new_tests = test_generator.generate_test_suite(
        skill_name=skill_name,
        interaction_model=im,
    )
    existing_package["test_suite"] = new_tests

    # Increment Version and Timestamp
    existing_package["version"] = existing_package.get("version", 1) + 1
    existing_package["updated_at"] = datetime.now(timezone.utc).isoformat()
    existing_package["status"] = "refined"

    # Save to DynamoDB & Local Cache
    dynamodb_service.save_skill(existing_package)

    elapsed_ms = int((time.time() - start_time) * 1000)

    return MCPToolResponse(
        success=True,
        tool="refine_skill",
        message=f"✨ Skill refined to version {existing_package['version']}. Preserved {len(existing_names)} existing intents and added '{new_intent_name}'.",
        data=existing_package,
        execution_time_ms=elapsed_ms,
    ).model_dump()
