"""Progress and Spaced Repetition persistence layer supporting DynamoDB and local JSON fallback."""

import json
import logging
import os
from datetime import date, datetime, timedelta
from typing import Any, Optional

import boto3
from botocore.exceptions import ClientError, NoCredentialsError

from skillforge.config import settings

logger = logging.getLogger("skillforge.progress_store")


class ProgressStore:
    """Persistent storage for study history, SM-2 flashcard states, and user streaks."""

    def __init__(self):
        self._dynamodb_available = False
        self._dynamodb_resource = None
        self._users_table = None
        self._reviews_table = None

        # In-memory store (also mirrored to local file if enabled)
        # { user_id: { "study_log": [ "2026-10-19" ], "topics": { "arrays": 4 }, "xp": 120, "quizzes": 5 } }
        self._memory_users: dict[str, dict[str, Any]] = {}
        # { user_id: { question_id: { interval: int, repetitions: int, ease_factor: float, next_review: "YYYY-MM-DD" } } }
        self._memory_reviews: dict[str, dict[str, dict[str, Any]]] = {}
        # { username: { username, display_name, email, password_hash, target_role, avatar, created_at } }
        self._memory_accounts: dict[str, dict[str, Any]] = {}

        self._seed_default_accounts()
        self._init_backend()

    def _seed_default_accounts(self):
        """Seed starter accounts for hackathon demo and quick sign-in."""
        self._memory_accounts = {
            "hackathon_judge": {
                "username": "hackathon_judge",
                "display_name": "Amazon Reviewer",
                "email": "testing@devpost.com",
                "password_hash": "judge2026",
                "target_role": "Amazon Developer Relations",
                "avatar": "⚡",
                "created_at": datetime.now().isoformat(),
            },
            "alex": {
                "username": "alex",
                "display_name": "Alex Chen",
                "email": "alex.chen@aws.dev",
                "password_hash": "alex123",
                "target_role": "Amazon SDE II Candidate",
                "avatar": "👨‍💻",
                "created_at": datetime.now().isoformat(),
            },
            "sarah": {
                "username": "sarah",
                "display_name": "Sarah Jenkins",
                "email": "sarah.j@techlead.io",
                "password_hash": "sarah123",
                "target_role": "Principal Algorithm Architect",
                "avatar": "👩‍💻",
                "created_at": datetime.now().isoformat(),
            },
        }

    def _init_backend(self):
        """Attempt to initialize DynamoDB, fallback to local storage if unavailable."""
        if not settings.enable_dynamodb:
            logger.info("DynamoDB is disabled by config. Using local persistence.")
            self._load_local_store()
            return

        try:
            session = boto3.Session(region_name=settings.aws_region)
            self._dynamodb_resource = session.resource("dynamodb")
            # Probe if credentials work by checking table listing
            client = session.client("dynamodb")
            existing_tables = client.list_tables().get("TableNames", [])

            self._users_table = self._dynamodb_resource.Table(settings.dynamodb_users_table)
            self._reviews_table = self._dynamodb_resource.Table(settings.dynamodb_reviews_table)

            # Check if tables exist; if not, create them if permitted
            if settings.dynamodb_users_table not in existing_tables:
                logger.info(f"DynamoDB table {settings.dynamodb_users_table} not found; creating...")
                client.create_table(
                    TableName=settings.dynamodb_users_table,
                    KeySchema=[{"AttributeName": "user_id", "KeyType": "HASH"}],
                    AttributeDefinitions=[{"AttributeName": "user_id", "AttributeType": "S"}],
                    BillingMode="PAY_PER_REQUEST",
                )

            if settings.dynamodb_reviews_table not in existing_tables:
                logger.info(f"DynamoDB table {settings.dynamodb_reviews_table} not found; creating...")
                client.create_table(
                    TableName=settings.dynamodb_reviews_table,
                    KeySchema=[
                        {"AttributeName": "user_id", "KeyType": "HASH"},
                        {"AttributeName": "question_id", "KeyType": "RANGE"},
                    ],
                    AttributeDefinitions=[
                        {"AttributeName": "user_id", "AttributeType": "S"},
                        {"AttributeName": "question_id", "AttributeType": "S"},
                    ],
                    BillingMode="PAY_PER_REQUEST",
                )

            self._dynamodb_available = True
            logger.info("Successfully connected to AWS DynamoDB.")
        except (NoCredentialsError, ClientError, Exception) as exc:
            logger.warning(
                f"AWS DynamoDB connection unavailable ({type(exc).__name__}: {exc}). "
                "Operating in resilient local fallback mode."
            )
            self._dynamodb_available = False
            self._load_local_store()

    @property
    def is_dynamodb_active(self) -> bool:
        return self._dynamodb_available

    def _load_local_store(self):
        """Load state from local JSON file if exists."""
        os.makedirs(settings.data_dir, exist_ok=True)
        if os.path.exists(settings.local_storage_file):
            try:
                with open(settings.local_storage_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._memory_users = data.get("users", {})
                    self._memory_reviews = data.get("reviews", {})
                    saved_accs = data.get("accounts", {})
                    if saved_accs:
                        self._memory_accounts.update(saved_accs)
            except Exception as e:
                logger.warning(f"Could not read local store file: {e}")

    def _save_local_store(self):
        """Persist in-memory state to local JSON file."""
        os.makedirs(settings.data_dir, exist_ok=True)
        try:
            with open(settings.local_storage_file, "w", encoding="utf-8") as f:
                json.dump(
                    {
                        "users": self._memory_users,
                        "reviews": self._memory_reviews,
                        "accounts": self._memory_accounts,
                        "updated_at": datetime.now().isoformat(),
                    },
                    f,
                    indent=2,
                )
        except Exception as e:
            logger.warning(f"Could not save to local store: {e}")

    # ── User Accounts & Authentication ─────────────────────────────────────────

    def register_account(
        self,
        username: str,
        password: str,
        display_name: str = "",
        email: str = "",
        target_role: str = "Software Development Engineer",
        avatar: str = "🚀",
    ) -> dict[str, Any]:
        """Register a new user account."""
        clean_user = username.strip().lower()
        if not clean_user:
            return {"error": "Username cannot be empty."}
        if clean_user in self._memory_accounts:
            return {"error": f"Username '{clean_user}' is already registered."}

        account = {
            "username": clean_user,
            "display_name": display_name.strip() or clean_user.capitalize(),
            "email": email.strip() or f"{clean_user}@developer.io",
            "password_hash": password,  # lightweight hash for demo
            "target_role": target_role.strip() or "Amazon SDE Candidate",
            "avatar": avatar or "🚀",
            "created_at": datetime.now().isoformat(),
        }
        self._memory_accounts[clean_user] = account
        # Initialize default user progress
        self.get_user_data(clean_user)
        self.record_study_event(clean_user, "dynamic_programming", xp_earned=50)
        self._save_local_store()
        return {"status": "success", "user": account}

    def authenticate_account(self, username: str, password: str) -> dict[str, Any]:
        """Authenticate user by username and password."""
        clean_user = username.strip().lower()
        acc = self._memory_accounts.get(clean_user)
        if not acc:
            return {"error": f"User '{clean_user}' not found. Please sign up!"}
        if acc["password_hash"] != password:
            return {"error": "Incorrect password. Please try again."}
        return {"status": "success", "user": acc}

    def get_account(self, username: str) -> Optional[dict[str, Any]]:
        clean_user = username.strip().lower()
        return self._memory_accounts.get(clean_user)

    def list_accounts(self) -> list[dict[str, Any]]:
        return [
            {
                "username": a["username"],
                "display_name": a["display_name"],
                "target_role": a.get("target_role", "Software Engineer"),
                "avatar": a.get("avatar", "👤"),
            }
            for a in self._memory_accounts.values()
        ]

    # ── User & Study Events ────────────────────────────────────────────────────

    def get_user_data(self, user_id: str) -> dict[str, Any]:
        """Fetch user progress, XP, and study history."""
        if self._dynamodb_available and self._users_table:
            try:
                resp = self._users_table.get_item(Key={"user_id": user_id})
                if "Item" in resp:
                    item = resp["Item"]
                    return {
                        "user_id": user_id,
                        "study_log": list(item.get("study_log", [])),
                        "topics": dict(item.get("topics", {})),
                        "xp": int(item.get("xp", 0)),
                        "total_quizzes": int(item.get("total_quizzes", 0)),
                    }
            except Exception as exc:
                logger.warning(f"DynamoDB get_item error, using local fallback: {exc}")

        return self._memory_users.setdefault(
            user_id,
            {
                "user_id": user_id,
                "study_log": [],
                "topics": {},
                "xp": 0,
                "total_quizzes": 0,
            },
        )

    def record_study_event(self, user_id: str, topic: str, xp_earned: int = 10):
        """Record that a user reviewed or quizzed on a topic today."""
        today_str = date.today().isoformat()
        user_data = self.get_user_data(user_id)

        study_log = set(user_data.get("study_log", []))
        study_log.add(today_str)
        user_data["study_log"] = sorted(list(study_log))

        topics = user_data.setdefault("topics", {})
        topics[topic] = topics.get(topic, 0) + 1

        user_data["total_quizzes"] = user_data.get("total_quizzes", 0) + 1
        user_data["xp"] = user_data.get("xp", 0) + xp_earned

        self._memory_users[user_id] = user_data

        if self._dynamodb_available and self._users_table:
            try:
                self._users_table.put_item(
                    Item={
                        "user_id": user_id,
                        "study_log": user_data["study_log"],
                        "topics": user_data["topics"],
                        "xp": user_data["xp"],
                        "total_quizzes": user_data["total_quizzes"],
                        "last_updated": datetime.now().isoformat(),
                    }
                )
            except Exception as exc:
                logger.warning(f"DynamoDB put_item failed: {exc}")

        self._save_local_store()

    # ── SM-2 Spaced Repetition Schedule ───────────────────────────────────────

    def get_review_schedule(self, user_id: str) -> dict[str, dict[str, Any]]:
        """Get all SM-2 spaced repetition card records for a user."""
        if self._dynamodb_available and self._reviews_table:
            try:
                from boto3.dynamodb.conditions import Key
                resp = self._reviews_table.query(
                    KeyConditionExpression=Key("user_id").eq(user_id)
                )
                items = resp.get("Items", [])
                result = {}
                for it in items:
                    qid = it["question_id"]
                    result[qid] = {
                        "interval": int(it.get("interval", 1)),
                        "repetitions": int(it.get("repetitions", 0)),
                        "ease_factor": float(it.get("ease_factor", 2.5)),
                        "next_review": it.get("next_review", date.today().isoformat()),
                        "last_score": int(it.get("last_score", 0)),
                        "last_quality": int(it.get("last_quality", 0)),
                    }
                return result
            except Exception as exc:
                logger.warning(f"DynamoDB query failed for review schedule: {exc}")

        return self._memory_reviews.setdefault(user_id, {})

    def update_review_item(self, user_id: str, question_id: str, item_state: dict[str, Any]):
        """Persist an updated SM-2 item state."""
        user_reviews = self._memory_reviews.setdefault(user_id, {})
        user_reviews[question_id] = item_state

        if self._dynamodb_available and self._reviews_table:
            try:
                # Convert float to Decimal for DynamoDB compatibility if needed
                from decimal import Decimal
                clean_item = {
                    "user_id": user_id,
                    "question_id": question_id,
                    "interval": int(item_state.get("interval", 1)),
                    "repetitions": int(item_state.get("repetitions", 0)),
                    "ease_factor": Decimal(str(round(item_state.get("ease_factor", 2.5), 2))),
                    "next_review": str(item_state.get("next_review")),
                    "last_score": int(item_state.get("last_score", 0)),
                    "last_quality": int(item_state.get("last_quality", 0)),
                    "updated_at": datetime.now().isoformat(),
                }
                self._reviews_table.put_item(Item=clean_item)
            except Exception as exc:
                logger.warning(f"DynamoDB put_item failed for review item: {exc}")

        self._save_local_store()
