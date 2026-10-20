"""MCP Tool: `analyze_skill`
Fetches usage analytics, invocation trends, error rates, and conversation Sankey flows for an Alexa skill.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from mcp_server.models.mcp_models import MCPToolResponse
from mcp_server.services.analytics_service import analytics_service
from mcp_server.services.dynamodb_service import dynamodb_service

logger = logging.getLogger("skillforge.tool.analyze_skill")


def analyze_skill(skill_id: str, time_range: str = "30d") -> dict[str, Any]:
    """MCP Tool: Performance metrics, usage analytics, and conversation flow visualizer."""
    start_time = time.time()
    package = dynamodb_service.get_skill(skill_id)

    skill_name = package.get("name", "Alexa Skill") if package else "Skill"

    report = analytics_service.get_skill_analytics(
        skill_id=skill_id,
        skill_name=skill_name,
        time_range=time_range,
    )

    elapsed_ms = int((time.time() - start_time) * 1000)

    return MCPToolResponse(
        success=True,
        tool="analyze_skill",
        message=f"📊 Analytics generated for '{skill_name}' across {time_range}.",
        data=report,
        execution_time_ms=elapsed_ms,
    ).model_dump()
