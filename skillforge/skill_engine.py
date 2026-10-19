"""Core SkillForge Engine: Quiz generation, SuperMemo SM-2 Spaced Repetition, Streaks, Gamification & Evaluation."""

import hashlib
import random
from datetime import date, datetime, timedelta
from typing import Any, Optional

from skillforge.bedrock_client import BedrockClient
from skillforge.progress_store import ProgressStore
from skillforge.question_bank import QUESTION_BANK, TOPIC_METADATA, TOPICS


class SkillEngine:
    """Orchestrates algorithmic quiz workflows, spaced repetition scheduling, and gamification."""

    def __init__(self, bedrock_client: Optional[BedrockClient] = None, progress_store: Optional[ProgressStore] = None):
        self.bedrock = bedrock_client or BedrockClient()
        self.store = progress_store or ProgressStore()

    # ── 1. Quiz Me ────────────────────────────────────────────────────────────

    def quiz_me(
        self,
        topic: str = "dynamic_programming",
        difficulty: str = "medium",
        user_id: str = "default_user",
        num_questions: int = 2,
    ) -> dict[str, Any]:
        """Generate a DSA voice quiz from the question bank and Amazon Bedrock."""
        normalized_topic = topic.strip().lower().replace(" ", "_").replace("-", "_")

        # Common abbreviations & aliases
        aliases = {
            "dp": "dynamic_programming",
            "ll": "linked_lists",
            "bst": "trees",
            "binary_search_tree": "trees",
            "heap": "stacks_queues",
            "queue": "stacks_queues",
            "stack": "stacks_queues",
            "hash": "hash_tables",
            "hashmap": "hash_tables",
            "string": "strings",
            "array": "arrays",
            "graph": "graphs",
            "tree": "trees",
        }
        if normalized_topic in aliases:
            normalized_topic = aliases[normalized_topic]

        # Fuzzy match topic if needed
        if normalized_topic not in QUESTION_BANK:
            matched = [t for t in TOPICS if normalized_topic in t or t in normalized_topic]
            if matched:
                normalized_topic = matched[0]
            else:
                return {
                    "error": f"Topic '{topic}' not found. Available topics: {', '.join(TOPICS)}",
                    "available_topics": TOPICS,
                }

        difficulty = difficulty.lower().strip()
        if difficulty not in ("easy", "medium", "hard"):
            difficulty = "medium"

        bank_qs = QUESTION_BANK[normalized_topic].get(difficulty, [])
        selected = random.sample(bank_qs, min(num_questions, len(bank_qs)))

        # If more questions requested than in bank, generate with Bedrock
        if len(selected) < num_questions:
            needed = num_questions - len(selected)
            generated = self.bedrock.generate_questions(normalized_topic, difficulty, count=needed)
            for g in generated:
                g["topic"] = normalized_topic
                g["difficulty"] = difficulty
            selected.extend(generated)

        # Prepare candidate payload (stripping model answers)
        questions_payload = []
        for q in selected:
            questions_payload.append({
                "id": q["id"],
                "topic": normalized_topic,
                "difficulty": difficulty,
                "question": q["question"],
                "hint": q.get("hint", "Focus on the algorithmic trade-offs."),
                "voice_tip": q.get("voice_tip", "Speak your answer clearly."),
            })

        self.store.record_study_event(user_id, normalized_topic, xp_earned=10 * len(selected))

        meta = TOPIC_METADATA.get(normalized_topic, {})
        return {
            "topic": normalized_topic,
            "topic_display": meta.get("title", normalized_topic.replace("_", " ").title()),
            "icon": meta.get("icon", "⚡"),
            "difficulty": difficulty,
            "count": len(questions_payload),
            "questions": questions_payload,
            "voice_prompt": f"Here is your {difficulty} quiz on {meta.get('title', normalized_topic)}. Question 1: {questions_payload[0]['question']}",
        }

    # ── 2. Explain Concept ────────────────────────────────────────────────────

    def explain_concept(
        self,
        topic: str = "dynamic_programming",
        user_id: str = "default_user",
        style: str = "analogy",
    ) -> dict[str, Any]:
        """Explain a DSA concept using Amazon Bedrock with intuitive real-world analogies."""
        normalized_topic = topic.strip().lower().replace(" ", "_").replace("-", "_")
        explanation = self.bedrock.explain_concept(normalized_topic, analogy_style=style)
        self.store.record_study_event(user_id, normalized_topic, xp_earned=15)

        meta = TOPIC_METADATA.get(normalized_topic, {})
        return {
            "topic": normalized_topic,
            "topic_display": meta.get("title", normalized_topic.replace("_", " ").title()),
            "icon": meta.get("icon", "💡"),
            "explanation": explanation,
            "voice_output": explanation,
        }

    # ── 3. Check Streak & Gamification ────────────────────────────────────────

    def check_streak(self, user_id: str = "default_user") -> dict[str, Any]:
        """Calculate streak days, user level, accuracy, XP, and unlocked badges."""
        user_data = self.store.get_user_data(user_id)
        raw_log = user_data.get("study_log", [])

        if not raw_log:
            return {
                "user_id": user_id,
                "streak_days": 0,
                "level": 1,
                "level_title": "Novice Coder",
                "xp": 0,
                "accuracy": 0.0,
                "total_quizzes": 0,
                "last_active": None,
                "badges": [],
                "topics_studied": {},
            }

        study_dates = set()
        for d in raw_log:
            try:
                study_dates.add(date.fromisoformat(str(d)))
            except Exception:
                continue

        today = date.today()
        yesterday = today - timedelta(days=1)

        # Streak calculation with yesterday grace period
        streak = 0
        cursor = today
        if today not in study_dates and yesterday in study_dates:
            cursor = yesterday

        while cursor in study_dates:
            streak += 1
            cursor -= timedelta(days=1)

        total_quizzes = user_data.get("total_quizzes", len(raw_log))
        xp = user_data.get("xp", total_quizzes * 10)

        # Level calculation: 1 level per 5 quizzes / 50 XP
        level = max(1, (total_quizzes // 5) + 1)
        level_titles = [
            "Novice Coder", "Syntax Apprentice", "Array Explorer",
            "Pointer Practitioner", "Recursion Adept", "Graph Navigator",
            "DP Specialist", "Algorithm Architect", "Principal Problem Solver",
            "SkillForge Grandmaster"
        ]
        title_idx = min(level - 1, len(level_titles) - 1)
        level_title = level_titles[title_idx]

        # Calculate accuracy from review schedule
        schedule = self.store.get_review_schedule(user_id)
        if schedule:
            mastered = sum(1 for item in schedule.values() if item.get("last_quality", 0) >= 3)
            accuracy = round((mastered / len(schedule)) * 100, 1)
        else:
            accuracy = 0.0

        # Badges system
        badges = []
        if total_quizzes >= 1:
            badges.append({"id": "first_code", "name": "First Step", "icon": "🚀", "desc": "Completed your first study session"})
        if streak >= 3:
            badges.append({"id": "streak_3", "name": "Habit Builder", "icon": "🔥", "desc": "Maintained a 3-day study streak"})
        if streak >= 7:
            badges.append({"id": "streak_7", "name": "Week Warrior", "icon": "⚡", "desc": "7-day continuous learning streak"})
        if user_data.get("topics", {}).get("dynamic_programming", 0) >= 3:
            badges.append({"id": "dp_hero", "name": "Memoization Master", "icon": "🧠", "desc": "Conquered Dynamic Programming"})
        if len(user_data.get("topics", {})) >= 5:
            badges.append({"id": "polymath", "name": "Full-Spectrum Engineer", "icon": "🌟", "desc": "Explored 5+ algorithmic topics"})

        return {
            "user_id": user_id,
            "streak_days": streak,
            "level": level,
            "level_title": level_title,
            "xp": xp,
            "accuracy": accuracy,
            "total_quizzes": total_quizzes,
            "last_active": str(max(study_dates)) if study_dates else None,
            "badges": badges,
            "topics_studied": user_data.get("topics", {}),
            "storage_engine": "AWS DynamoDB" if self.store.is_dynamodb_active else "Local Resilient Store",
        }

    # ── 4. SM-2 Spaced Repetition Suggestion ──────────────────────────────────

    def suggest_next(self, user_id: str = "default_user") -> dict[str, Any]:
        """SuperMemo SM-2 Spaced Repetition: finds card due for review, or recommends next new topic."""
        schedule = self.store.get_review_schedule(user_id)
        today = date.today()

        due_reviews = []
        for qid, state in schedule.items():
            review_date = state.get("next_review")
            if isinstance(review_date, str):
                try:
                    review_date = date.fromisoformat(review_date)
                except Exception:
                    review_date = today

            if review_date <= today:
                due_reviews.append((qid, state, review_date))

        # If cards are due for review, prioritize the most overdue
        if due_reviews:
            due_reviews.sort(key=lambda x: x[2])
            qid, state, r_date = due_reviews[0]
            q = self._find_question_by_id(qid)
            overdue_days = max(0, (today - r_date).days)
            return {
                "type": "spaced_repetition_review",
                "question_id": qid,
                "question": q["question"] if q else f"Review flashcard: {qid}",
                "topic": q["topic"] if q else "algorithm_review",
                "hint": q.get("hint", "") if q else "",
                "due_date": r_date.isoformat(),
                "overdue_days": overdue_days,
                "repetitions": state.get("repetitions", 0),
                "ease_factor": state.get("ease_factor", 2.5),
                "voice_prompt": f"It's time to review your flashcard on {q['topic'].replace('_', ' ') if q else 'algorithms'}. Overdue by {overdue_days} days. {q['question'] if q else ''}",
            }

        # Otherwise, suggest an unvisited or under-practiced topic
        user_data = self.store.get_user_data(user_id)
        studied_topics = set(user_data.get("topics", {}).keys())
        unexplored = [t for t in TOPICS if t not in studied_topics]

        suggested_topic = unexplored[0] if unexplored else random.choice(TOPICS)
        meta = TOPIC_METADATA.get(suggested_topic, {})
        return {
            "type": "new_topic_recommendation",
            "topic": suggested_topic,
            "topic_display": meta.get("title", suggested_topic.replace("_", " ").title()),
            "icon": meta.get("icon", "🎯"),
            "reason": "All spaced repetition reviews are up to date! Ready to explore a new topic?",
            "voice_prompt": f"You're all caught up on reviews! How about we start a session on {meta.get('title', suggested_topic)}?",
        }

    # ── 5. Evaluate Spoken Answer ─────────────────────────────────────────────

    def evaluate_answer(
        self,
        question_id: str,
        answer: str,
        user_id: str = "default_user",
    ) -> dict[str, Any]:
        """AI-grade candidate answer using Amazon Bedrock, updating SM-2 interval and XP."""
        q = self._find_question_by_id(question_id)
        if not q:
            return {"error": f"Question with ID '{question_id}' not found."}

        eval_result = self.bedrock.evaluate_answer(
            question_id=question_id,
            question_text=q["question"],
            correct_answer=q["answer"],
            user_answer=answer,
            key_points=q.get("key_points", []),
        )

        quality = eval_result["quality"]
        score = eval_result["score"]

        # Update SM-2 schedule
        sm2_state = self._update_sm2_schedule(user_id, question_id, quality, score)

        # Gamification: XP award
        xp_earned = 10 + (15 if score >= 80 else 0)
        self.store.record_study_event(user_id, q["topic"], xp_earned=xp_earned)

        return {
            "question_id": question_id,
            "topic": q["topic"],
            "score": score,
            "quality": quality,
            "quality_rating": self._quality_to_stars(quality),
            "feedback": eval_result["feedback"],
            "missed_points": eval_result.get("missed_points", []),
            "correct_answer": q["answer"],
            "key_points": q.get("key_points", []),
            "sm2_state": sm2_state,
            "xp_earned": xp_earned,
            "voice_response": f"{eval_result['feedback']} Your score is {score} out of 100.",
        }

    # ── 6. Deterministic Daily Challenge ──────────────────────────────────────

    def daily_challenge(self, user_id: str = "default_user") -> dict[str, Any]:
        """Deterministic daily rotating challenge based on calendar date hash."""
        today_str = date.today().isoformat()
        seed = int(hashlib.sha256(f"skillforge_daily_{today_str}".encode()).hexdigest()[:8], 16)
        rng = random.Random(seed)

        topic = rng.choice(TOPICS)
        difficulty = rng.choice(["easy", "medium", "hard"])
        bank_qs = QUESTION_BANK[topic].get(difficulty, [])
        if not bank_qs:
            bank_qs = QUESTION_BANK[topic].get("medium", QUESTION_BANK[topic]["easy"])

        q = rng.choice(bank_qs)
        meta = TOPIC_METADATA.get(topic, {})

        return {
            "date": today_str,
            "topic": topic,
            "topic_display": meta.get("title", topic.replace("_", " ").title()),
            "icon": meta.get("icon", "📅"),
            "difficulty": difficulty,
            "question": {
                "id": q["id"],
                "question": q["question"],
                "hint": q.get("hint", ""),
                "voice_tip": q.get("voice_tip", ""),
            },
            "voice_prompt": f"Here is today's SkillForge Daily Challenge on {meta.get('title', topic)}: {q['question']}",
        }

    # ── 7. Progressive Hinting ────────────────────────────────────────────────

    def get_hint(self, question_id: str, attempt_text: Optional[str] = None, hint_level: int = 1) -> dict[str, Any]:
        """Provide a progressive hint for a stuck candidate."""
        q = self._find_question_by_id(question_id)
        if not q:
            return {"error": f"Question {question_id} not found."}

        static_hint = q.get("hint", "")
        ai_hint = self.bedrock.generate_hint(q["question"], user_attempt=attempt_text, hint_level=hint_level)
        hint_text = f"{static_hint} {ai_hint}".strip()

        return {
            "question_id": question_id,
            "hint": hint_text,
            "voice_prompt": f"Here's a hint: {hint_text}",
        }

    # ── 8. Mock Interview ─────────────────────────────────────────────────────

    def mock_interview(
        self,
        company: str = "Amazon",
        role: str = "Software Development Engineer",
        topic: str = "dynamic_programming",
        user_id: str = "default_user",
    ) -> dict[str, Any]:
        """Generate a simulated voice interview round."""
        interview = self.bedrock.generate_mock_interview(company=company, role=role, topic=topic)
        self.store.record_study_event(user_id, topic, xp_earned=30)
        return {
            "company": company,
            "role": role,
            "topic": topic,
            "scenario": interview,
            "voice_prompt": f"Welcome to your mock interview for {company}. {interview.get('question', '')}",
        }

    # ── 9. Topics Catalog Resource ────────────────────────────────────────────

    def get_topics_catalog(self) -> dict[str, Any]:
        """Return catalog of all available topics, icons, and questions."""
        catalog = {}
        for t in TOPICS:
            meta = TOPIC_METADATA.get(t, {})
            levels = {}
            for diff in ["easy", "medium", "hard"]:
                qs = QUESTION_BANK[t].get(diff, [])
                levels[diff] = len(qs)

            catalog[t] = {
                "name": meta.get("title", t.replace("_", " ").title()),
                "icon": meta.get("icon", "📚"),
                "description": meta.get("description", ""),
                "levels": levels,
                "total_questions": sum(levels.values()),
            }
        return {"topics": catalog, "total_topics": len(TOPICS)}

    # ── 10. SM-2 Spaced Repetition Logic ──────────────────────────────────────

    def _update_sm2_schedule(
        self,
        user_id: str,
        question_id: str,
        quality: int,
        score: int,
    ) -> dict[str, Any]:
        """SuperMemo SM-2 algorithm: updates repetition interval, ease factor, and next review date."""
        schedule = self.store.get_review_schedule(user_id)
        current = schedule.get(
            question_id,
            {
                "interval": 1,
                "repetitions": 0,
                "ease_factor": 2.5,
                "next_review": date.today().isoformat(),
            },
        )

        interval = int(current.get("interval", 1))
        repetitions = int(current.get("repetitions", 0))
        ease_factor = float(current.get("ease_factor", 2.5))

        # SM-2 Rules:
        # If quality < 3, the card is reset (repetition count = 0, interval = 1)
        if quality < 3:
            repetitions = 0
            interval = 1
        else:
            if repetitions == 0:
                interval = 1
            elif repetitions == 1:
                interval = 6
            else:
                interval = round(interval * ease_factor)
            repetitions += 1

        # Ease Factor calculation: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        # EF cannot drop below 1.3
        ease_factor = max(1.3, ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

        next_review_date = date.today() + timedelta(days=interval)

        new_state = {
            "interval": interval,
            "repetitions": repetitions,
            "ease_factor": round(ease_factor, 2),
            "next_review": next_review_date.isoformat(),
            "last_score": score,
            "last_quality": quality,
        }

        self.store.update_review_item(user_id, question_id, new_state)
        return new_state

    # ── Helper Methods ────────────────────────────────────────────────────────

    def _find_question_by_id(self, question_id: str) -> Optional[dict[str, Any]]:
        """Look up a question by ID across all topics."""
        for topic, diff_dict in QUESTION_BANK.items():
            for diff, q_list in diff_dict.items():
                for q in q_list:
                    if q["id"] == question_id:
                        return {**q, "topic": topic, "difficulty": diff}
        return None

    @staticmethod
    def _quality_to_stars(quality: int) -> str:
        return "⭐" * quality + "☆" * (5 - quality)
