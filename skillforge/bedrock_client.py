"""Amazon Bedrock client for Claude 3.5 Sonnet / Claude 3 Sonnet with voice-optimized prompts and resilient fallback."""

import json
import logging
import re
from typing import Any, Optional

import boto3
from botocore.exceptions import ClientError, NoCredentialsError

from skillforge.config import settings

logger = logging.getLogger("skillforge.bedrock_client")


class BedrockClient:
    """Client for Amazon Bedrock Anthropic Claude models with voice pedagogical features."""

    def __init__(self):
        self._client = None
        self._is_available = False
        self._init_client()

    def _init_client(self):
        """Initialize boto3 bedrock-runtime client."""
        try:
            session = boto3.Session(region_name=settings.aws_region)
            self._client = session.client("bedrock-runtime")
            self._is_available = True
            logger.info(f"Initialized Bedrock client in {settings.aws_region}")
        except Exception as exc:
            logger.warning(f"Bedrock runtime initialization note: {exc}. Resilient fallback will be used if needed.")
            self._is_available = False

    @property
    def is_available(self) -> bool:
        return self._is_available

    def _invoke_bedrock(self, system_prompt: str, user_prompt: str, max_tokens: int = 2048) -> Optional[str]:
        """Invoke Claude on Amazon Bedrock with system instructions and user message."""
        if not self._client:
            return None

        # Build Claude 3 Messages payload
        payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "temperature": 0.4,
            "system": system_prompt,
            "messages": [{"role": "user", "content": [{"type": "text", "text": user_prompt}]}],
        }

        # Try primary model (e.g. Claude 3.5 Sonnet), then fallback model (Claude 3 Sonnet)
        models_to_try = [settings.bedrock_model_id, settings.bedrock_fallback_model_id]

        for model_id in models_to_try:
            try:
                response = self._client.invoke_model(
                    modelId=model_id,
                    body=json.dumps(payload),
                    contentType="application/json",
                    accept="application/json",
                )
                response_body = json.loads(response["body"].read())
                text = response_body["content"][0]["text"]
                return text
            except (ClientError, NoCredentialsError) as exc:
                logger.warning(f"Bedrock invocation with model {model_id} failed: {exc}")
                continue
            except Exception as exc:
                logger.warning(f"Unexpected Bedrock error with model {model_id}: {exc}")
                continue

        return None

    # ── 1. Question Generation ────────────────────────────────────────────────

    def generate_questions(self, topic: str, difficulty: str, count: int = 1) -> list[dict[str, Any]]:
        """Generate high-yield DSA questions tailored for voice interactive quizzing."""
        system = (
            "You are an expert Data Structures & Algorithms coach designing questions for an Alexa voice assistant. "
            "Questions must be concise and easily understandable when spoken aloud without needing code snippets on a screen. "
            "Return ONLY a valid JSON array of question objects without markdown wrapping. "
            "Each object must have the following keys: id (string), question (string), answer (string), hint (string), key_points (array of strings), voice_tip (string)."
        )
        user = (
            f"Generate {count} {difficulty}-difficulty question(s) on the topic: '{topic.replace('_', ' ')}'. "
            f"Use unique ids with format '{topic}_{difficulty}_gen_N'. Focus on core algorithmic intuition and complexity trade-offs."
        )

        raw = self._invoke_bedrock(system, user, max_tokens=1500)
        if raw:
            try:
                clean_json = self._extract_json(raw)
                parsed = json.loads(clean_json)
                if isinstance(parsed, list) and len(parsed) > 0:
                    return parsed
            except Exception as err:
                logger.warning(f"Could not parse Bedrock generated questions JSON: {err}")

        # Intelligent Fallback
        return self._fallback_generate_questions(topic, difficulty, count)

    # ── 2. Concept Explanations with Analogies ─────────────────────────────────

    def explain_concept(self, topic: str, analogy_style: str = "real_world") -> str:
        """Produce a voice-first explanation using a vivid real-world analogy."""
        system = (
            "You are Alexa, a warm and encouraging DSA technical mentor. "
            "Explain concepts for voice listening: keep your answer under 120 words, speak in simple conversational English, "
            "and anchor your explanation on a memorable real-world analogy (like a coat check, airport baggage carousel, or highway detour). "
            "Never use LaTeX, tables, or markdown formatting; use plain sentences that sound natural spoken aloud."
        )
        user = (
            f"Explain {topic.replace('_', ' ')} to a developer using a clear real-world analogy. "
            f"Structure: 1) What it is in 1 sentence. 2) The real-world analogy. 3) Where it's used in real engineering."
        )

        raw = self._invoke_bedrock(system, user, max_tokens=600)
        if raw:
            return raw.strip()

        # Voice-first curated fallback explanations
        return self._fallback_explain_concept(topic)

    # ── 3. Socratic Answer Evaluation ──────────────────────────────────────────

    def evaluate_answer(
        self,
        question_id: str,
        question_text: str,
        correct_answer: str,
        user_answer: str,
        key_points: list[str],
    ) -> dict[str, Any]:
        """Evaluate user's spoken answer, outputting score, SM-2 quality (0-5), and audio feedback."""
        system = (
            "You are an encouraging technical interviewer on Alexa+. Grade the candidate's spoken answer "
            "against the canonical answer and key criteria. Be fair: candidates speak their answers aloud, "
            "so recognize partial answers, synonyms, and verbal descriptions of big-O notation. "
            "Return ONLY a JSON object with: "
            "score (integer 0-100), "
            "quality (integer 0-5 on the SuperMemo SM-2 quality scale: 0=total blackout, 1=incorrect with slight familiarity, 2=incorrect but remembered upon seeing answer, 3=correct with hesitation, 4=good answer with minor omissions, 5=flawless mastery), "
            "feedback (string, exactly 1-2 spoken sentences of constructive audio feedback), "
            "missed_points (array of string key points the candidate omitted, or empty array if all covered)."
        )
        user = (
            f"Question: {question_text}\n"
            f"Canonical Answer: {correct_answer}\n"
            f"Required Key Points: {', '.join(key_points)}\n"
            f"Candidate Spoken Answer: {user_answer}\n"
        )

        raw = self._invoke_bedrock(system, user, max_tokens=500)
        if raw:
            try:
                clean_json = self._extract_json(raw)
                res = json.loads(clean_json)
                return {
                    "score": max(0, min(100, int(res.get("score", 70)))),
                    "quality": max(0, min(5, int(res.get("quality", 3)))),
                    "feedback": res.get("feedback", "Good effort on that algorithm concept!"),
                    "missed_points": res.get("missed_points", []),
                    "engine": "Amazon Bedrock (Claude 3.5 Sonnet)",
                }
            except Exception as err:
                logger.warning(f"Error parsing Bedrock evaluation JSON: {err}")

        # Intelligent Fallback Evaluator
        return self._fallback_evaluate_answer(correct_answer, user_answer, key_points)

    # ── 4. Socratic Hinting ────────────────────────────────────────────────────

    def generate_hint(self, question_text: str, user_attempt: Optional[str] = None, hint_level: int = 1) -> str:
        """Provide a progressive Socratic hint without spoiling the final answer."""
        system = (
            "You are Alexa. Give a gentle Socratic hint to help the developer deduce the answer themselves. "
            "Keep it under 40 words, conversational, and encouraging. Never give away the exact answer."
        )
        user = f"Question: {question_text}\nUser is stuck (Hint Level {hint_level}). Provide a guiding prompt."
        if user_attempt:
            user += f"\nUser attempted: {user_attempt}"

        raw = self._invoke_bedrock(system, user, max_tokens=250)
        if raw:
            return raw.strip()

        return "Think about the relationship between the boundaries and how each step eliminates part of the problem."

    # ── 5. Mock Interview Simulation ──────────────────────────────────────────

    def generate_mock_interview(self, company: str, role: str, topic: str) -> dict[str, Any]:
        """Generate a realistic mock interview scenario."""
        system = (
            "You are a Senior Principal Engineer at AWS conducting a technical interview for Alexa+. "
            "Generate a voice-first technical interview scenario. Return ONLY JSON with: "
            "question (string), follow_up (string), what_interviewers_look_for (array of strings)."
        )
        user = f"Company: {company}, Role: {role}, Topic: {topic}."

        raw = self._invoke_bedrock(system, user, max_tokens=800)
        if raw:
            try:
                clean = self._extract_json(raw)
                return json.loads(clean)
            except Exception:
                pass

        return {
            "question": f"At {company}, how would you approach scaling an in-memory caching system using {topic.replace('_', ' ')}?",
            "follow_up": "How would your solution handle high concurrency and cache invalidation?",
            "what_interviewers_look_for": ["Time complexity trade-offs", "Boundary conditions", "Clear verbal articulation"],
        }

    # ── Helpers & Resilient Fallbacks ─────────────────────────────────────────

    @staticmethod
    def _extract_json(raw: str) -> str:
        """Extract clean JSON text by stripping markdown fences."""
        raw = raw.strip()
        # Find ```json ... ``` or [ ... ] or { ... }
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw)
        if match:
            return match.group(1).strip()
        # Look for first { or [
        start_obj = raw.find("{")
        start_arr = raw.find("[")
        if start_obj != -1 and (start_arr == -1 or start_obj < start_arr):
            end_obj = raw.rfind("}")
            if end_obj != -1:
                return raw[start_obj : end_obj + 1]
        elif start_arr != -1:
            end_arr = raw.rfind("]")
            if end_arr != -1:
                return raw[start_arr : end_arr + 1]
        return raw

    def _fallback_generate_questions(self, topic: str, difficulty: str, count: int) -> list[dict[str, Any]]:
        clean_topic = topic.replace("_", " ").title()
        return [
            {
                "id": f"{topic}_{difficulty}_gen_1",
                "question": f"In {clean_topic}, how do trade-offs between time and space complexity guide your choice of data structure?",
                "answer": f"Selecting the right representation for {clean_topic} involves balancing lookup time against memory overhead and mutation costs.",
                "hint": "Consider operations like search, insertion, and memory locality.",
                "key_points": ["trade-offs", "time complexity", "space overhead", "mutation costs"],
                "voice_tip": "Focus on the primary operations needed in production.",
            }
        ]

    def _fallback_explain_concept(self, topic: str) -> str:
        analogies = {
            "dynamic_programming": (
                "Think of Dynamic Programming like writing down intermediate math answers on a scratchpad so you never calculate "
                "the same equation twice. If I ask you what one plus one plus one is, you say three. If I add another one, you don't "
                "recalculate from scratch; you remember three and add one. That's optimal substructure and memoization in action!"
            ),
            "hash_tables": (
                "Think of a Hash Table like a coat check room at a theater. Instead of searching through every single coat in the building, "
                "the attendant gives you a numbered ticket computed directly from your name. That ticket points straight to your hanger in constant O of 1 time."
            ),
            "graphs": (
                "Think of a Graph like a flight network connecting cities across the country. Cities are vertices, and direct flights are edges. "
                "Breadth-First Search finds the route with the fewest layovers, while Dijkstra's algorithm finds the flight path with the lowest overall ticket price."
            ),
            "trees": (
                "Think of a Tree like a company organization chart. The CEO is at the root, department directors are child nodes, "
                "and individual team contributors are the leaves. Each decision flows cleanly down the hierarchy without any cycles."
            ),
            "stacks_queues": (
                "Think of a Stack like a stack of plates at a buffet: the last plate washed and put on top is the first one taken off. "
                "A Queue is like waiting in line for morning coffee: the first person to arrive is the first person served."
            ),
        }
        return analogies.get(
            topic,
            f"{topic.replace('_', ' ').title()} is a fundamental computer science concept. "
            "It organizes data so your algorithms can process, search, and transform information with maximum efficiency."
        )

    def _fallback_evaluate_answer(
        self,
        correct_answer: str,
        user_answer: str,
        key_points: list[str],
    ) -> dict[str, Any]:
        """Heuristic answer grading based on key point overlap and conceptual alignment."""
        user_lower = user_answer.lower()
        matched_points = []
        missed_points = []

        for kp in key_points:
            # Check if any token or subphrase matches
            tokens = kp.lower().split()
            if any(t in user_lower for t in tokens if len(t) > 2):
                matched_points.append(kp)
            else:
                missed_points.append(kp)

        coverage = len(matched_points) / max(len(key_points), 1)

        if coverage >= 0.8:
            score = 95
            quality = 5
            feedback = "Spot on! You nailed the core complexity and algorithmic mechanism."
        elif coverage >= 0.5:
            score = 80
            quality = 4
            feedback = f"Good answer! You captured the main idea, but be sure to mention {missed_points[0] if missed_points else 'all complexity details'}."
        elif coverage >= 0.25:
            score = 60
            quality = 3
            feedback = "Acceptable explanation, though missing a few important technical details."
        elif len(user_answer.strip()) > 5:
            score = 40
            quality = 2
            feedback = "Partially related, but didn't quite capture the required algorithm properties."
        else:
            score = 15
            quality = 1
            feedback = "That didn't match the expected answer. Let's review the hint and try again."

        return {
            "score": score,
            "quality": quality,
            "feedback": feedback,
            "missed_points": missed_points,
            "engine": "SkillForge Heuristic Evaluator (AWS Bedrock Ready)",
        }
