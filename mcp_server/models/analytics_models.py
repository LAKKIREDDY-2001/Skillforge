"""Analytics and telemetry data models for Alexa skills."""

from typing import Any
from pydantic import BaseModel, Field


class IntentUsageMetric(BaseModel):
    intent_name: str
    invocations: int
    percentage: float
    avg_latency_ms: float
    error_rate: float


class UserFlowPath(BaseModel):
    source: str
    target: str
    value: int  # count of transitions for Sankey diagram


class SkillAnalyticsReport(BaseModel):
    skill_id: str
    skill_name: str
    time_range: str
    total_invocations: int
    unique_users: int
    avg_session_duration_sec: float
    retention_rate_30d: float
    error_rate: float
    intent_breakdown: list[IntentUsageMetric] = Field(default_factory=list)
    conversation_flow_sankey: list[UserFlowPath] = Field(default_factory=list)
    recent_errors: list[dict[str, Any]] = Field(default_factory=list)
    cloudwatch_metric_namespace: str = "AWS/Alexa/SkillForge"
