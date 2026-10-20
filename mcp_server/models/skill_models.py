"""Pydantic models for Alexa Skill Packages and components."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Optional
from pydantic import BaseModel, Field


class SlotTypeValueName(BaseModel):
    value: str
    synonyms: list[str] = Field(default_factory=list)


class SlotTypeValue(BaseModel):
    id: Optional[str] = None
    name: SlotTypeValueName


class SlotType(BaseModel):
    name: str
    values: list[SlotTypeValue] = Field(default_factory=list)


class IntentSlot(BaseModel):
    name: str
    type: str
    samples: list[str] = Field(default_factory=list)


class Intent(BaseModel):
    name: str
    slots: list[IntentSlot] = Field(default_factory=list)
    samples: list[str] = Field(default_factory=list)


class DialogSlotPrompt(BaseModel):
    elicitation: Optional[str] = None


class DialogSlot(BaseModel):
    name: str
    type: str
    elicitationRequired: bool = False
    confirmationRequired: bool = False
    prompts: Optional[DialogSlotPrompt] = None


class DialogIntent(BaseModel):
    name: str
    delegationStrategy: str = "ALWAYS"
    confirmationRequired: bool = False
    slots: list[DialogSlot] = Field(default_factory=list)


class LanguageModel(BaseModel):
    invocationName: str
    intents: list[Intent] = Field(default_factory=list)
    types: list[SlotType] = Field(default_factory=list)


class DialogModel(BaseModel):
    intents: list[DialogIntent] = Field(default_factory=list)
    delegationStrategy: Optional[str] = "ALWAYS"


class InteractionModelContainer(BaseModel):
    languageModel: LanguageModel
    dialog: Optional[DialogModel] = None
    prompts: list[dict[str, Any]] = Field(default_factory=list)


class SkillManifest(BaseModel):
    manifestVersion: str = "1.0"
    publishingInformation: dict[str, Any] = Field(default_factory=dict)
    apis: dict[str, Any] = Field(default_factory=dict)
    permissions: list[dict[str, Any]] = Field(default_factory=list)


class TestCase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    utterance: str
    expected_intent: str
    expected_slots: dict[str, Any] = Field(default_factory=dict)
    expected_ssml: Optional[str] = None
    edge_case: bool = False
    notes: Optional[str] = None


class TestRunResult(BaseModel):
    test_id: str
    utterance: str
    passed: bool
    matched_intent: str
    expected_intent: str
    slot_matches: dict[str, bool] = Field(default_factory=dict)
    confidence_score: float = 0.98
    latency_ms: int = 14
    details: Optional[str] = None


class TestSuiteReport(BaseModel):
    skill_id: str
    total_tests: int
    passed_tests: int
    failed_tests: int
    pass_rate: float
    results: list[TestRunResult] = Field(default_factory=list)
    executed_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class SkillPackage(BaseModel):
    skill_id: str = Field(default_factory=lambda: f"amzn1.ask.skill.{uuid.uuid4()}")
    name: str
    invocation_name: str
    description: str
    locale: str = "en-US"
    version: int = 1
    manifest: dict[str, Any]
    interaction_model: dict[str, Any]
    lambda_handler: str
    test_suite: list[dict[str, Any]] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    status: str = "generated"  # generated, tested, deployed, refined
    deployment_info: Optional[dict[str, Any]] = None
    metrics_summary: Optional[dict[str, Any]] = None
