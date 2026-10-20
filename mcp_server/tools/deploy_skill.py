"""MCP Tool: `deploy_skill`
One-click deployment of the generated Alexa skill package to the Alexa Developer Console via ASK CLI.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from mcp_server.models.mcp_models import MCPToolResponse
from mcp_server.services.ask_cli_service import ask_cli_service
from mcp_server.services.dynamodb_service import dynamodb_service

logger = logging.getLogger("skillforge.tool.deploy_skill")


def deploy_skill(skill_id: str, stage: str = "development", target: str = "ask_cli") -> dict[str, Any]:
    """MCP Tool: Deploy skill package to Alexa Developer Console."""
    start_time = time.time()
    package = dynamodb_service.get_skill(skill_id)

    if not package:
        return MCPToolResponse(
            success=False,
            tool="deploy_skill",
            message=f"Skill '{skill_id}' not found.",
            data={},
            error="SkillNotFound",
        ).model_dump()

    # Pre-validation & deployment via ASK CLI service
    deploy_result = ask_cli_service.deploy_skill(package, stage=stage)

    if deploy_result.get("success"):
        package["status"] = "deployed"
        package["deployment_info"] = deploy_result
        dynamodb_service.save_skill(package)

    elapsed_ms = int((time.time() - start_time) * 1000)

    return MCPToolResponse(
        success=deploy_result.get("success", False),
        tool="deploy_skill",
        message=deploy_result.get("message", "Deployment complete."),
        data=deploy_result,
        error=deploy_result.get("error"),
        execution_time_ms=elapsed_ms,
    ).model_dump()
