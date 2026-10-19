"""MCP Server implementation compliant with MCP Spec 2025-11-25 and Streamable HTTP / JSON-RPC 2.0."""

import asyncio
import json
import logging
import uuid
from typing import Any, AsyncGenerator, Optional

from fastapi import APIRouter, Request, Response
from sse_starlette.sse import EventSourceResponse

from skillforge.config import settings
from skillforge.skill_engine import SkillEngine

logger = logging.getLogger("skillforge.mcp_server")


class MCPServer:
    """Model Context Protocol (MCP) Server for Alexa+ integrations."""

    def __init__(self, engine: Optional[SkillEngine] = None):
        self.engine = engine or SkillEngine()
        # Active SSE connections: session_id -> asyncio.Queue
        self._sse_sessions: dict[str, asyncio.Queue] = {}

    # ── Protocol Definitions ──────────────────────────────────────────────────

    def get_server_capabilities(self) -> dict[str, Any]:
        return {
            "capabilities": {
                "tools": {"listChanged": False},
                "resources": {"subscribe": False, "listChanged": False},
                "prompts": {"listChanged": False},
                "logging": {},
            },
            "serverInfo": {
                "name": settings.app_name,
                "version": settings.app_version,
                "protocolVersion": settings.mcp_protocol_version,
                "description": settings.description,
            },
        }

    def list_tools(self) -> list[dict[str, Any]]:
        """Declare all 8 available tools with JSON Schema definitions."""
        return [
            {
                "name": "quiz_me",
                "description": "Generate a voice-first DSA quiz on a topic with specified difficulty.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "topic": {
                            "type": "string",
                            "description": "DSA topic (arrays, dynamic_programming, trees, graphs, sorting, searching, linked_lists, stacks_queues, hash_tables, strings)",
                            "default": "dynamic_programming",
                        },
                        "difficulty": {
                            "type": "string",
                            "enum": ["easy", "medium", "hard"],
                            "default": "medium",
                        },
                        "user_id": {
                            "type": "string",
                            "description": "Unique user or Alexa device identifier",
                            "default": "default_user",
                        },
                        "num_questions": {
                            "type": "integer",
                            "description": "Number of questions to ask (1 to 5)",
                            "default": 2,
                        },
                    },
                    "required": ["topic"],
                },
            },
            {
                "name": "explain_concept",
                "description": "Get a voice-first explanation of an algorithm or data structure with real-world analogies via Amazon Bedrock.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "topic": {"type": "string", "description": "Concept to explain"},
                        "user_id": {"type": "string", "default": "default_user"},
                        "style": {"type": "string", "enum": ["analogy", "technical", "eli5"], "default": "analogy"},
                    },
                    "required": ["topic"],
                },
            },
            {
                "name": "check_streak",
                "description": "Check user's daily study streak, level, accuracy, XP, and unlocked badges.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "default": "default_user"},
                    },
                },
            },
            {
                "name": "suggest_next",
                "description": "Determine the next optimal question or topic using the SuperMemo SM-2 spaced repetition algorithm.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "default": "default_user"},
                    },
                },
            },
            {
                "name": "evaluate_answer",
                "description": "Grade a candidate's spoken or typed answer to a DSA question using Amazon Bedrock, and update their SM-2 review schedule.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "question_id": {"type": "string", "description": "ID of the question being answered"},
                        "answer": {"type": "string", "description": "Candidate's spoken or typed answer"},
                        "user_id": {"type": "string", "default": "default_user"},
                    },
                    "required": ["question_id", "answer"],
                },
            },
            {
                "name": "daily_challenge",
                "description": "Retrieve the deterministic daily rotating algorithmic challenge.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "default": "default_user"},
                    },
                },
            },
            {
                "name": "get_hint",
                "description": "Receive a progressive Socratic hint for a question without spoiling the solution.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "question_id": {"type": "string"},
                        "attempt_text": {"type": "string", "description": "Optional prior partial answer"},
                        "hint_level": {"type": "integer", "default": 1},
                    },
                    "required": ["question_id"],
                },
            },
            {
                "name": "mock_interview",
                "description": "Conduct a mock technical interview screen for a target company.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "company": {"type": "string", "default": "Amazon"},
                        "role": {"type": "string", "default": "Software Development Engineer"},
                        "topic": {"type": "string", "default": "dynamic_programming"},
                        "user_id": {"type": "string", "default": "default_user"},
                    },
                },
            },
            {
                "name": "get_code_solution",
                "description": "Get production-grade DSA code implementations and complexity analysis for any algorithmic pattern.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "topic": {"type": "string", "default": "dynamic_programming"},
                        "language": {"type": "string", "default": "python"},
                    },
                },
            },
            {
                "name": "export_apl_document",
                "description": "Generate an Alexa Presentation Language (APL 2026 / v2024.2) document and datasource for Echo Show 10/15 smart displays.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "topic": {"type": "string", "default": "dynamic_programming"},
                        "title": {"type": "string", "description": "Visual title of the card"},
                        "language": {"type": "string", "enum": ["python", "java", "cpp", "go"], "default": "python"},
                        "user_id": {"type": "string", "default": "default_user"},
                    },
                },
            },
            {
                "name": "send_streak_reminder",
                "description": "Dispatch a daily streak retention reminder with personalized Alexa+ motivational speech, notification copy, and streak countdown.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "default": "default_user"},
                        "urgency": {"type": "string", "enum": ["normal", "streak_at_risk", "morning_boost"], "default": "streak_at_risk"},
                    },
                },
            },
        ]

    def list_resources(self) -> list[dict[str, Any]]:
        """Declare available MCP resources."""
        return [
            {
                "uri": "skillforge://progress/overview",
                "name": "User Progress Overview",
                "description": "Learner's active streak, level, accuracy, XP, and badges.",
                "mimeType": "application/json",
            },
            {
                "uri": "skillforge://topics/catalog",
                "name": "DSA Topics Catalog",
                "description": "All 10 curated DSA topics, difficulty levels, and question inventory.",
                "mimeType": "application/json",
            },
            {
                "uri": "skillforge://reviews/due",
                "name": "Due Spaced Repetition Flashcards",
                "description": "Algorithmic flashcards scheduled for review today via SM-2.",
                "mimeType": "application/json",
            },
            {
                "uri": "skillforge://apl/template",
                "name": "Alexa Presentation Language (APL) Layout",
                "description": "Multi-modal display template for Echo Show 10/15 devices.",
                "mimeType": "application/json",
            },
            {
                "uri": "skillforge://notifications/feed",
                "name": "Daily Streak Notifications Feed",
                "description": "Real-time stream of daily study reminders and streak preservation alerts.",
                "mimeType": "application/json",
            },
        ]


    def list_prompts(self) -> list[dict[str, Any]]:
        """Declare reusable prompt templates."""
        return [
            {
                "name": "study_session",
                "description": "Structured 15 to 30 minute interactive algorithm study session.",
                "arguments": [
                    {"name": "topic", "description": "Target DSA topic", "required": True},
                    {"name": "duration_minutes", "description": "Session length in minutes", "required": False},
                ],
            },
            {
                "name": "interview_prep",
                "description": "Comprehensive FAANG/Tech company mock interview drill.",
                "arguments": [
                    {"name": "company", "description": "Target company (Amazon, Google, Meta)", "required": False},
                    {"name": "topic", "description": "Target algorithm area", "required": False},
                ],
            },
            {
                "name": "socratic_coach",
                "description": "Voice coach mode that guides learners with progressive questioning.",
                "arguments": [
                    {"name": "topic", "description": "Topic to coach on", "required": True},
                ],
            },
        ]

    # ── JSON-RPC 2.0 Dispatcher ───────────────────────────────────────────────

    async def handle_jsonrpc(self, request_data: dict[str, Any]) -> dict[str, Any]:
        """Process incoming MCP JSON-RPC 2.0 request and return compliant response."""
        jsonrpc_ver = request_data.get("jsonrpc", "2.0")
        msg_id = request_data.get("id")
        method = request_data.get("method", "")
        params = request_data.get("params", {})

        logger.info(f"MCP RPC Method: {method} [ID: {msg_id}]")

        try:
            if method == "initialize":
                caps = self.get_server_capabilities()
                return {
                    "jsonrpc": jsonrpc_ver,
                    "id": msg_id,
                    "result": {
                        "protocolVersion": settings.mcp_protocol_version,
                        "capabilities": caps["capabilities"],
                        "serverInfo": caps["serverInfo"],
                    },
                }

            elif method == "notifications/initialized":
                # Client acknowledging initialization
                return {"jsonrpc": jsonrpc_ver, "id": msg_id, "result": {}}

            elif method == "ping":
                return {"jsonrpc": jsonrpc_ver, "id": msg_id, "result": {}}

            elif method == "tools/list":
                tools = self.list_tools()
                return {"jsonrpc": jsonrpc_ver, "id": msg_id, "result": {"tools": tools}}

            elif method == "tools/call":
                tool_name = params.get("name")
                tool_args = params.get("arguments", {})
                result = await self.execute_tool(tool_name, tool_args)
                return {
                    "jsonrpc": jsonrpc_ver,
                    "id": msg_id,
                    "result": {
                        "content": [{"type": "text", "text": json.dumps(result, indent=2)}],
                        "isError": "error" in result,
                    },
                }

            elif method == "resources/list":
                resources = self.list_resources()
                return {"jsonrpc": jsonrpc_ver, "id": msg_id, "result": {"resources": resources}}

            elif method == "resources/read":
                uri = params.get("uri", "")
                content = await self.read_resource(uri)
                return {
                    "jsonrpc": jsonrpc_ver,
                    "id": msg_id,
                    "result": {
                        "contents": [
                            {
                                "uri": uri,
                                "mimeType": "application/json",
                                "text": json.dumps(content, indent=2),
                            }
                        ]
                    },
                }

            elif method == "prompts/list":
                prompts = self.list_prompts()
                return {"jsonrpc": jsonrpc_ver, "id": msg_id, "result": {"prompts": prompts}}

            elif method == "prompts/get":
                prompt_name = params.get("name", "")
                prompt_args = params.get("arguments", {})
                prompt_data = self.get_prompt(prompt_name, prompt_args)
                return {"jsonrpc": jsonrpc_ver, "id": msg_id, "result": prompt_data}

            else:
                return {
                    "jsonrpc": jsonrpc_ver,
                    "id": msg_id,
                    "error": {"code": -32601, "message": f"Method '{method}' not found."},
                }

        except Exception as exc:
            logger.error(f"Error handling MCP RPC method {method}: {exc}", exc_info=True)
            return {
                "jsonrpc": jsonrpc_ver,
                "id": msg_id,
                "error": {"code": -32603, "message": f"Internal server error: {str(exc)}"},
            }

    # ── Tool Execution ────────────────────────────────────────────────────────

    async def execute_tool(self, name: str, args: dict[str, Any]) -> dict[str, Any]:
        """Dispatch tool name to SkillEngine handler."""
        tool_map = {
            "quiz_me": self.engine.quiz_me,
            "explain_concept": self.engine.explain_concept,
            "check_streak": self.engine.check_streak,
            "suggest_next": self.engine.suggest_next,
            "evaluate_answer": self.engine.evaluate_answer,
            "daily_challenge": self.engine.daily_challenge,
            "get_hint": self.engine.get_hint,
            "mock_interview": self.engine.mock_interview,
            "get_code_solution": self.engine.get_code_solution,
            "export_apl_document": self.engine.export_apl_document,
            "send_streak_reminder": self.engine.get_streak_reminder,
        }

        handler = tool_map.get(name)
        if not handler:
            return {"error": f"Unknown tool: '{name}'"}

        # Run synchronously or in threadpool if needed
        return handler(**args)

    # ── Resource Read ─────────────────────────────────────────────────────────

    async def read_resource(self, uri: str, user_id: str = "default_user") -> dict[str, Any]:
        """Read MCP resource by URI."""
        if uri == "skillforge://progress/overview":
            return self.engine.check_streak(user_id=user_id)
        elif uri == "skillforge://topics/catalog":
            return self.engine.get_topics_catalog()
        elif uri == "skillforge://reviews/due":
            schedule = self.engine.store.get_review_schedule(user_id)
            return {"due_count": len(schedule), "schedule": schedule}
        elif uri.startswith("skillforge://apl"):
            return self.engine.export_apl_document(topic="dynamic_programming", user_id=user_id)
        elif uri == "skillforge://notifications/feed":
            return self.engine.get_streak_reminder(user_id=user_id)

        else:
            return {"error": f"Resource URI not recognized: {uri}"}

    # ── Prompts ───────────────────────────────────────────────────────────────

    def get_prompt(self, name: str, args: dict[str, Any]) -> dict[str, Any]:
        """Construct structured prompt text."""
        if name == "study_session":
            topic = args.get("topic", "dynamic_programming").replace("_", " ")
            duration = args.get("duration_minutes", 20)
            text = (
                f"Begin an immersive {duration}-minute voice study session on {topic}.\n"
                f"1. Explain the primary mental model and real-world analogy in 60 seconds.\n"
                f"2. Present 2 progressive quiz questions, asking the learner to explain time/space trade-offs out loud.\n"
                f"3. Evaluate responses with encouraging constructive feedback and calculate SM-2 retention."
            )
        elif name == "interview_prep":
            company = args.get("company", "Amazon")
            topic = args.get("topic", "data_structures").replace("_", " ")
            text = (
                f"Conduct a FAANG technical interview screen for {company} on {topic}.\n"
                f"Focus on algorithmic intuition, edge case handling, and optimal time-space bounds."
            )
        elif name == "socratic_coach":
            topic = args.get("topic", "recursion").replace("_", " ")
            text = (
                f"Act as a Socratic voice tutor for {topic}. When the learner gets stuck, never give the answer. "
                f"Ask guiding questions that help them discover the invariant."
            )
        else:
            text = f"Prompt '{name}' not found."

        return {
            "description": f"SkillForge {name} prompt",
            "messages": [
                {
                    "role": "user",
                    "content": {"type": "text", "text": text},
                }
            ],
        }
