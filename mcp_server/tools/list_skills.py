"""MCP Tool: `list_skills`
Portfolio manager listing all generated, tested, and deployed Alexa skills.
"""

from __future__ import annotations

import logging
import time
from typing import Any, Optional

from mcp_server.models.mcp_models import MCPToolResponse
from mcp_server.services.dynamodb_service import dynamodb_service

logger = logging.getLogger("skillforge.tool.list_skills")


def list_skills(limit: int = 20, status_filter: Optional[str] = None) -> dict[str, Any]:
    """MCP Tool: List skills in the developer portfolio."""
    start_time = time.time()
    skills = dynamodb_service.list_skills(limit=limit)

    if status_filter:
        skills = [s for s in skills if s.get("status") == status_filter]

    # Return clean summary representations
    summaries = []
    for s in skills:
        im = s.get("interaction_model", {}).get("interactionModel", {})
        lm = im.get("languageModel", {})
        intents = lm.get("intents", [])
        summaries.append({
            "skill_id": s.get("skill_id"),
            "name": s.get("name"),
            "invocation_name": s.get("invocation_name"),
            "description": s.get("description"),
            "locale": s.get("locale", "en-US"),
            "version": s.get("version", 1),
            "status": s.get("status", "generated"),
            "intent_count": len(intents),
            "test_count": len(s.get("test_suite", [])),
            "created_at": s.get("created_at"),
            "updated_at": s.get("updated_at"),
        })

    elapsed_ms = int((time.time() - start_time) * 1000)

    return MCPToolResponse(
        success=True,
        tool="list_skills",
        message=f"📚 Retrieved {len(summaries)} skills from portfolio.",
        data={"skills": summaries, "total_count": len(summaries)},
        execution_time_ms=elapsed_ms,
    ).model_dump()
