"""MCP tool request and response models complying with Model Context Protocol."""

from typing import Any, Optional
from pydantic import BaseModel, Field
from mcp_server.models.skill_models import SkillPackage, TestSuiteReport


class GenerateSkillRequest(BaseModel):
    description: str = Field(
        ...,
        description="Plain English description of the Alexa skill to build, e.g. 'Build a skill that tracks my daily water intake and reminds me to drink every 2 hours'",
    )
    skill_name: Optional[str] = Field(None, description="Optional override name for the Alexa skill")
    invocation_name: Optional[str] = Field(None, description="Optional custom invocation name (e.g., 'water tracker')")
    locale: str = Field("en-US", description="Alexa locale, e.g. en-US, en-IN, hi-IN, es-ES, de-DE, ja-JP")
    include_dynamodb: bool = Field(True, description="Whether to include DynamoDB session & persistent state adapter")


class RefineSkillRequest(BaseModel):
    skill_id: str = Field(..., description="ID of the previously generated skill package to refine")
    instructions: str = Field(
        ...,
        description="Follow-up refinement instructions in plain English, e.g. 'Add a weekly summary that tells me my average daily intake'",
    )


class TestSkillRequest(BaseModel):
    skill_id: str = Field(..., description="ID of the skill package to validate and test")
    test_utterance: Optional[str] = Field(None, description="Optional single test utterance to validate")
    run_full_suite: bool = Field(True, description="Run the full 20+ automated test suite against the model")


class DeploySkillRequest(BaseModel):
    skill_id: str = Field(..., description="ID of the skill to deploy via ASK CLI orchestrator")
    stage: str = Field("development", description="Deployment stage: development, test, certification, live")
    target: str = Field("ask_cli", description="Target orchestrator: ask_cli, alexa_developer_console, aws_lambda")


class AnalyzeSkillRequest(BaseModel):
    skill_id: str = Field(..., description="ID of the skill to fetch usage metrics and error analytics for")
    time_range: str = Field("30d", description="Time window for metrics: 24h, 7d, 30d, 90d")


class ListSkillsRequest(BaseModel):
    limit: int = Field(20, description="Max skills to return")
    status_filter: Optional[str] = Field(None, description="Filter by status: generated, tested, deployed")


# Standard MCP Tool Response Envelopes
class MCPToolResponse(BaseModel):
    success: bool
    tool: str
    message: str
    data: dict[str, Any]
    error: Optional[str] = None
    execution_time_ms: int = 42
