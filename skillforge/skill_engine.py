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

    # ── 2b. Code Implementation Solution ─────────────────────────────────────

    def get_code_solution(
        self,
        topic: str = "dynamic_programming",
        problem: str = "",
        language: str = "python",
    ) -> dict[str, Any]:
        """Provide clean, production-grade DSA code implementations with complexity analysis."""
        normalized_topic = topic.strip().lower().replace(" ", "_").replace("-", "_")
        aliases = {
            "dp": "dynamic_programming",
            "ll": "linked_lists",
            "bst": "trees",
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
        if normalized_topic not in TOPICS:
            normalized_topic = "dynamic_programming"

        code_catalog = {
            "arrays": {
                "title": "Two-Pointer Sorted Pair Sum & Kadane's Algorithm",
                "code": (
                    "# 1. Two-Pointer Sum: O(n) Time, O(1) Space\n"
                    "def two_sum_sorted(nums: list[int], target: int) -> list[int]:\n"
                    "    left, right = 0, len(nums) - 1\n"
                    "    while left < right:\n"
                    "        curr_sum = nums[left] + nums[right]\n"
                    "        if curr_sum == target:\n"
                    "            return [left, right]\n"
                    "        elif curr_sum < target:\n"
                    "            left += 1\n"
                    "        else:\n"
                    "            right -= 1\n"
                    "    return []\n\n"
                    "# 2. Kadane's Algorithm: O(n) Time, O(1) Space\n"
                    "def max_subarray_sum(nums: list[int]) -> int:\n"
                    "    max_sum = curr_sum = nums[0]\n"
                    "    for x in nums[1:]:\n"
                    "        curr_sum = max(x, curr_sum + x)\n"
                    "        max_sum = max(max_sum, curr_sum)\n"
                    "    return max_sum\n"
                ),
                "time_complexity": "O(n)",
                "space_complexity": "O(1)",
                "voice_summary": "Here is the Python implementation for Two Pointers and Kadane's algorithm. Both run in linear O of N time with constant O of 1 auxiliary space.",
            },
            "dynamic_programming": {
                "title": "0/1 Knapsack & Longest Common Subsequence",
                "code": (
                    "# 1. 0/1 Knapsack: O(N*W) Time, O(W) Space\n"
                    "def knapsack_01(weights: list[int], values: list[int], capacity: int) -> int:\n"
                    "    dp = [0] * (capacity + 1)\n"
                    "    for wt, val in zip(weights, values):\n"
                    "        # Iterate backwards to avoid reusing the same item\n"
                    "        for w in range(capacity, wt - 1, -1):\n"
                    "            dp[w] = max(dp[w], dp[w - wt] + val)\n"
                    "    return dp[capacity]\n\n"
                    "# 2. Longest Common Subsequence: O(M*N) Time, O(N) Space\n"
                    "def longest_common_subsequence(text1: str, text2: str) -> int:\n"
                    "    m, n = len(text1), len(text2)\n"
                    "    dp = [0] * (n + 1)\n"
                    "    for c1 in text1:\n"
                    "        prev_diag = 0\n"
                    "        for j, c2 in enumerate(text2, 1):\n"
                    "            temp = dp[j]\n"
                    "            if c1 == c2:\n"
                    "                dp[j] = 1 + prev_diag\n"
                    "            else:\n"
                    "                dp[j] = max(dp[j], dp[j - 1])\n"
                    "            prev_diag = temp\n"
                    "    return dp[n]\n"
                ),
                "time_complexity": "O(N * W)",
                "space_complexity": "O(W) space-optimized",
                "voice_summary": "Here is the dynamic programming implementation for 0/1 Knapsack and LCS. Knapsack runs in O of N times W time using a 1D array by iterating capacity backwards.",
            },
            "linked_lists": {
                "title": "Reverse Linked List & Floyd's Cycle Detection",
                "code": (
                    "class ListNode:\n"
                    "    def __init__(self, val=0, next=None):\n"
                    "        self.val = val\n"
                    "        self.next = next\n\n"
                    "# In-Place Reverse: O(n) Time, O(1) Space\n"
                    "def reverse_list(head: ListNode) -> ListNode:\n"
                    "    prev, curr = None, head\n"
                    "    while curr:\n"
                    "        nxt = curr.next\n"
                    "        curr.next = prev\n"
                    "        prev = curr\n"
                    "        curr = nxt\n"
                    "    return prev\n\n"
                    "# Floyd's Tortoise and Hare: O(n) Time, O(1) Space\n"
                    "def has_cycle(head: ListNode) -> bool:\n"
                    "    slow = fast = head\n"
                    "    while fast and fast.next:\n"
                    "        slow = slow.next\n"
                    "        fast = fast.next.next\n"
                    "        if slow == fast:\n"
                    "            return True\n"
                    "    return False\n"
                ),
                "time_complexity": "O(n)",
                "space_complexity": "O(1)",
                "voice_summary": "Here is the code to reverse a singly linked list and detect cycles using Floyd's tortoise and hare algorithm. Both use O of 1 memory.",
            },
            "trees": {
                "title": "Validate Binary Search Tree (BST)",
                "code": (
                    "class TreeNode:\n"
                    "    def __init__(self, val=0, left=None, right=None):\n"
                    "        self.val = val\n"
                    "        self.left = left\n"
                    "        self.right = right\n\n"
                    "# Validate BST with Range Bounds: O(n) Time, O(h) Space\n"
                    "def is_valid_bst(root: TreeNode, low=float('-inf'), high=float('inf')) -> bool:\n"
                    "    if not root:\n"
                    "        return True\n"
                    "    if not (low < root.val < high):\n"
                    "        return False\n"
                    "    return is_valid_bst(root.left, low, root.val) and is_valid_bst(root.right, root.val, high)\n"
                ),
                "time_complexity": "O(n)",
                "space_complexity": "O(h) call stack",
                "voice_summary": "Here is the code to validate a BST using ancestor low and high bounds, running in linear O of N time.",
            },
            "graphs": {
                "title": "Dijkstra's Shortest Path & BFS",
                "code": (
                    "import heapq\n\n"
                    "# Dijkstra's Algorithm: O((V + E) log V)\n"
                    "def dijkstra(graph: dict[int, list[tuple[int, int]]], source: int) -> dict[int, int]:\n"
                    "    distances = {node: float('inf') for node in graph}\n"
                    "    distances[source] = 0\n"
                    "    pq = [(0, source)]  # (distance, node)\n\n"
                    "    while pq:\n"
                    "        curr_dist, u = heapq.heappop(pq)\n"
                    "        if curr_dist > distances[u]:\n"
                    "            continue\n"
                    "        for v, weight in graph[u]:\n"
                    "            new_dist = curr_dist + weight\n"
                    "            if new_dist < distances[v]:\n"
                    "                distances[v] = new_dist\n"
                    "                heapq.heappush(pq, (new_dist, v))\n"
                    "    return distances\n"
                ),
                "time_complexity": "O((V + E) log V)",
                "space_complexity": "O(V + E)",
                "voice_summary": "Here is Dijkstra's shortest path algorithm using a min-heap, running in O of V plus E log V time.",
            },
            "sorting": {
                "title": "Quicksort with Randomized Pivot",
                "code": (
                    "import random\n\n"
                    "def quicksort(arr: list[int]) -> list[int]:\n"
                    "    if len(arr) <= 1:\n"
                    "        return arr\n"
                    "    pivot = random.choice(arr)\n"
                    "    left = [x for x in arr if x < pivot]\n"
                    "    middle = [x for x in arr if x == pivot]\n"
                    "    right = [x for x in arr if x > pivot]\n"
                    "    return quicksort(left) + middle + quicksort(right)\n"
                ),
                "time_complexity": "O(n log n) average",
                "space_complexity": "O(n)",
                "voice_summary": "Here is Quicksort with randomized pivot selection, achieving O of N log N average time.",
            },
            "searching": {
                "title": "Binary Search & Rotated Sorted Array",
                "code": (
                    "# Search in Rotated Sorted Array: O(log n) Time\n"
                    "def search_rotated(nums: list[int], target: int) -> int:\n"
                    "    left, right = 0, len(nums) - 1\n"
                    "    while left <= right:\n"
                    "        mid = (left + right) // 2\n"
                    "        if nums[mid] == target:\n"
                    "            return mid\n"
                    "        # Check if left half is sorted\n"
                    "        if nums[left] <= nums[mid]:\n"
                    "            if nums[left] <= target < nums[mid]:\n"
                    "                right = mid - 1\n"
                    "            else:\n"
                    "                left = mid + 1\n"
                    "        else:\n"
                    "            # Right half is sorted\n"
                    "            if nums[mid] < target <= nums[right]:\n"
                    "                left = mid + 1\n"
                    "            else:\n"
                    "                right = mid - 1\n"
                    "    return -1\n"
                ),
                "time_complexity": "O(log n)",
                "space_complexity": "O(1)",
                "voice_summary": "Here is modified binary search for rotated sorted arrays in logarithmic O of log N time.",
            },
            "stacks_queues": {
                "title": "Min Stack in O(1)",
                "code": (
                    "class MinStack:\n"
                    "    def __init__(self):\n"
                    "        self.stack = []\n"
                    "        self.min_stack = []\n\n"
                    "    def push(self, val: int) -> None:\n"
                    "        self.stack.append(val)\n"
                    "        curr_min = min(val, self.min_stack[-1] if self.min_stack else val)\n"
                    "        self.min_stack.append(curr_min)\n\n"
                    "    def pop(self) -> None:\n"
                    "        self.stack.pop()\n"
                    "        self.min_stack.pop()\n\n"
                    "    def top(self) -> int:\n"
                    "        return self.stack[-1]\n\n"
                    "    def get_min(self) -> int:\n"
                    "        return self.min_stack[-1]\n"
                ),
                "time_complexity": "O(1) all operations",
                "space_complexity": "O(n)",
                "voice_summary": "Here is a Min Stack implementation supporting push, pop, top, and getMin in constant O of 1 time.",
            },
            "hash_tables": {
                "title": "Two Sum via Hash Map: O(n) Time",
                "code": (
                    "def two_sum(nums: list[int], target: int) -> list[int]:\n"
                    "    seen = {}  # val -> index\n"
                    "    for i, num in enumerate(nums):\n"
                    "        diff = target - num\n"
                    "        if diff in seen:\n"
                    "            return [seen[diff], i]\n"
                    "        seen[num] = i\n"
                    "    return []\n"
                ),
                "time_complexity": "O(n)",
                "space_complexity": "O(n)",
                "voice_summary": "Here is Two Sum solved in linear O of N time using a single pass hash table.",
            },
            "strings": {
                "title": "Longest Substring Without Repeating Characters",
                "code": (
                    "# Sliding Window: O(n) Time, O(min(m, n)) Space\n"
                    "def length_of_longest_substring(s: str) -> int:\n"
                    "    seen = {}\n"
                    "    left = max_len = 0\n"
                    "    for right, char in enumerate(s):\n"
                    "        if char in seen and seen[char] >= left:\n"
                    "            left = seen[char] + 1\n"
                    "        seen[char] = right\n"
                    "        max_len = max(max_len, right - left + 1)\n"
                    "    return max_len\n"
                ),
                "time_complexity": "O(n)",
                "space_complexity": "O(min(m, n))",
                "voice_summary": "Here is the sliding window algorithm for Longest Substring Without Repeating Characters in linear O of N time.",
            },
        }

        entry = code_catalog.get(normalized_topic, code_catalog["dynamic_programming"])
        meta = TOPIC_METADATA.get(normalized_topic, {})
        return {
            "topic": normalized_topic,
            "topic_display": meta.get("title", normalized_topic.replace("_", " ").title()),
            "title": entry["title"],
            "code": entry["code"],
            "language": language,
            "time_complexity": entry["time_complexity"],
            "space_complexity": entry["space_complexity"],
            "voice_prompt": entry["voice_summary"],
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
