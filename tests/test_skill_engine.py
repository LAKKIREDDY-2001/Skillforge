"""Unit tests for SkillEngine core logic and SM-2 algorithm."""

from datetime import date, timedelta
from unittest.mock import MagicMock, patch

import pytest
from skillforge.progress_store import ProgressStore
from skillforge.question_bank import QUESTION_BANK, TOPIC_METADATA, TOPICS
from skillforge.skill_engine import SkillEngine


@pytest.fixture
def mock_store(tmp_path):
    store = ProgressStore()
    # Force store to clean memory
    store._memory_users = {}
    store._memory_reviews = {}
    return store


@pytest.fixture
def engine(mock_store):
    return SkillEngine(progress_store=mock_store)


class TestQuizMe:
    def test_valid_topic_returns_questions(self, engine):
        result = engine.quiz_me(topic="arrays", difficulty="easy", num_questions=1)
        assert "questions" in result
        assert len(result["questions"]) == 1
        q = result["questions"][0]
        assert "question" in q
        assert "answer" not in q  # model answer stripped for candidate test
        assert q["topic"] == "arrays"

    def test_fuzzy_topic_matching(self, engine):
        result = engine.quiz_me(topic="dp", difficulty="medium", num_questions=1)
        assert result["topic"] == "dynamic_programming"

    def test_unknown_topic_returns_error(self, engine):
        result = engine.quiz_me(topic="quantum_teleportation")
        assert "error" in result
        assert "available_topics" in result

    def test_num_questions_boundary(self, engine):
        result = engine.quiz_me(topic="dynamic_programming", difficulty="medium", num_questions=2)
        assert len(result["questions"]) == 2


class TestCheckStreak:
    def test_new_user_has_zero_streak(self, engine):
        result = engine.check_streak(user_id="brand_new_user")
        assert result["streak_days"] == 0
        assert result["level"] == 1
        assert result["xp"] == 0

    def test_streak_after_study(self, engine):
        engine.store.record_study_event("user1", "arrays", xp_earned=20)
        result = engine.check_streak(user_id="user1")
        assert result["streak_days"] == 1
        assert result["total_quizzes"] == 1
        assert result["xp"] == 20
        assert len(result["badges"]) >= 1


class TestSuggestNextSM2:
    def test_suggest_new_topic_when_no_reviews_due(self, engine):
        result = engine.suggest_next(user_id="fresh_learner")
        assert result["type"] == "new_topic_recommendation"
        assert result["topic"] in TOPICS

    def test_suggest_overdue_review_card(self, engine):
        user_id = "test_user_sm2"
        # Seed an item with next_review set to yesterday
        yesterday = (date.today() - timedelta(days=2)).isoformat()
        engine.store.update_review_item(
            user_id,
            "arrays_easy_1",
            {
                "interval": 1,
                "repetitions": 1,
                "ease_factor": 2.5,
                "next_review": yesterday,
                "last_score": 50,
                "last_quality": 2,
            },
        )
        result = engine.suggest_next(user_id=user_id)
        assert result["type"] == "spaced_repetition_review"
        assert result["question_id"] == "arrays_easy_1"
        assert result["overdue_days"] >= 2


class TestEvaluateAnswer:
    def test_evaluate_answer_updates_sm2_and_xp(self, engine):
        result = engine.evaluate_answer(
            question_id="arrays_easy_1",
            answer="O(1) constant time because array indexes use pointer arithmetic and direct address offset",
            user_id="learner_eval",
        )
        assert "score" in result
        assert result["score"] >= 70
        assert result["quality"] >= 3
        assert "feedback" in result
        assert "sm2_state" in result
        assert result["sm2_state"]["interval"] >= 1
        assert result["sm2_state"]["repetitions"] == 1

    def test_evaluate_unknown_question(self, engine):
        result = engine.evaluate_answer("fake_question_999", "some answer")
        assert "error" in result


class TestDailyChallenge:
    def test_daily_challenge_is_deterministic(self, engine):
        r1 = engine.daily_challenge(user_id="u1")
        r2 = engine.daily_challenge(user_id="u1")
        assert r1["date"] == r2["date"]
        assert r1["question"]["id"] == r2["question"]["id"]
        assert r1["topic"] in TOPICS

    def test_daily_challenge_required_fields(self, engine):
        r = engine.daily_challenge()
        assert "date" in r
        assert "topic" in r
        assert "difficulty" in r
        assert "question" in r
        assert "id" in r["question"]


class TestSM2AlgorithmRules:
    def test_first_repetition_sets_interval_1(self, engine):
        state = engine._update_sm2_schedule("u1", "q1", quality=4, score=85)
        assert state["interval"] == 1
        assert state["repetitions"] == 1

    def test_second_repetition_sets_interval_6(self, engine):
        engine._update_sm2_schedule("u1", "q1", quality=4, score=85)
        state = engine._update_sm2_schedule("u1", "q1", quality=4, score=90)
        assert state["interval"] == 6
        assert state["repetitions"] == 2

    def test_third_repetition_multiplies_by_ease_factor(self, engine):
        engine._update_sm2_schedule("u1", "q1", quality=4, score=85)
        engine._update_sm2_schedule("u1", "q1", quality=4, score=90)
        state = engine._update_sm2_schedule("u1", "q1", quality=4, score=90)
        assert state["repetitions"] == 3
        assert state["interval"] >= 14  # round(6 * 2.5) = 15

    def test_failed_review_resets_repetitions_to_zero(self, engine):
        engine._update_sm2_schedule("u1", "q1", quality=5, score=100)
        engine._update_sm2_schedule("u1", "q1", quality=5, score=100)
        # Fail with quality 1
        state = engine._update_sm2_schedule("u1", "q1", quality=1, score=20)
        assert state["repetitions"] == 0
        assert state["interval"] == 1

    def test_ease_factor_floor_at_1_3(self, engine):
        for _ in range(15):
            engine._update_sm2_schedule("u1", "q1", quality=0, score=0)
        schedule = engine.store.get_review_schedule("u1")
        assert schedule["q1"]["ease_factor"] >= 1.3


class TestQuestionBankIntegrity:
    def test_all_10_topics_defined(self):
        assert len(TOPICS) == 10
        for t in TOPICS:
            assert t in QUESTION_BANK
            assert t in TOPIC_METADATA

    def test_all_difficulties_populated(self):
        for t in TOPICS:
            for diff in ["easy", "medium", "hard"]:
                assert diff in QUESTION_BANK[t]
                qs = QUESTION_BANK[t][diff]
                assert len(qs) >= 1
                for q in qs:
                    assert "id" in q
                    assert "question" in q
                    assert "answer" in q
                    assert "hint" in q
                    assert "key_points" in q
                    assert len(q["key_points"]) >= 1


class TestCodeSolution:
    def test_get_code_solution_default(self, engine):
        res = engine.get_code_solution(topic="dynamic_programming")
        assert "code" in res
        assert "knapsack" in res["code"].lower()
        assert "time_complexity" in res

    def test_get_code_solution_arrays(self, engine):
        res = engine.get_code_solution(topic="arrays")
        assert "two_sum_sorted" in res["code"]
        assert res["time_complexity"] == "O(n)"
