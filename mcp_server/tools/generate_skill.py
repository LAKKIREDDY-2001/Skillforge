"""MCP Tool: `generate_skill`
Transforms a plain English description into a complete, deployable Alexa Skill Package in <60 seconds.
"""

from __future__ import annotations

import logging
import time
from typing import Any, Optional

from mcp_server.generators.intent_generator import intent_generator
from mcp_server.generators.lambda_generator import lambda_generator
from mcp_server.generators.manifest_generator import manifest_generator
from mcp_server.generators.test_generator import test_generator
from mcp_server.models.mcp_models import MCPToolResponse
from mcp_server.models.skill_models import SkillPackage
from mcp_server.services.dynamodb_service import dynamodb_service

logger = logging.getLogger("skillforge.tool.generate_skill")


def generate_skill(
    description: str,
    skill_name: Optional[str] = None,
    invocation_name: Optional[str] = None,
    locale: str = "en-US",
    include_dynamodb: bool = True,
) -> dict[str, Any]:
    """MCP Tool: Generate complete Alexa skill package from natural language."""
    start_time = time.time()

    # 1. Derive names & generate interaction model (Intents, Slots, Dialog)
    derived_name, derived_invoc = intent_generator._derive_names(description, skill_name, invocation_name)
    interaction_model = intent_generator.generate_interaction_model(
        description=description,
        skill_name=derived_name,
        invocation_name=derived_invoc,
        locale=locale,
    )

    # 2. Generate ASK SDK Lambda Handler
    lambda_code = lambda_generator.generate_lambda_handler(
        skill_name=derived_name,
        description=description,
        interaction_model=interaction_model,
        include_dynamodb=include_dynamodb,
    )

    # 3. Generate 20+ Automated Test Suite
    test_suite = test_generator.generate_test_suite(
        skill_name=derived_name,
        interaction_model=interaction_model,
    )

    # 4. Generate skill.json Manifest
    manifest = manifest_generator.generate_manifest(
        skill_name=derived_name,
        description=description,
        locale=locale,
    )

    # 5. Assemble SkillPackage
    package = SkillPackage(
        name=derived_name,
        invocation_name=derived_invoc,
        description=description,
        locale=locale,
        manifest=manifest,
        interaction_model=interaction_model,
        lambda_handler=lambda_code,
        test_suite=test_suite,
    )

    # 6. Persist to DynamoDB / Local Cache
    dynamodb_service.save_skill(package.model_dump())

    elapsed_ms = int((time.time() - start_time) * 1000)

    return MCPToolResponse(
        success=True,
        tool="generate_skill",
        message=f"🎉 Successfully generated Alexa skill '{derived_name}' with {len(test_suite)} tests in {elapsed_ms}ms.",
        data=package.model_dump(),
        execution_time_ms=elapsed_ms,
    ).model_dump()
