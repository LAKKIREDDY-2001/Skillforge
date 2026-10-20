"""DynamoDB service for Alexa Skill metadata, sessions, and generated package persistence.

Resolves Hackathon Friction Points:
- FP #6: DynamoDB session attribute & item size limit (400KB) compressed with gzip
- Resilient local persistence cache when DynamoDB is unavailable offline
"""

from __future__ import annotations

import base64
import gzip
import json
import logging
import os
from pathlib import Path
from typing import Any, Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError

logger = logging.getLogger("skillforge.dynamodb")


class DynamoDBService:
    def __init__(self, table_name: str = "SkillForge_Skills"):
        self.table_name = table_name
        self.region_name = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
        self._dynamodb = None
        self._table = None
        self._is_active = False
        self._local_cache: dict[str, dict[str, Any]] = {}
        self._local_file = Path(__file__).resolve().parent.parent.parent / "data" / "skills_store.json"
        self._load_local_cache()

    def _load_local_cache(self):
        try:
            if self._local_file.exists():
                with open(self._local_file, "r", encoding="utf-8") as f:
                    self._local_cache = json.load(f)
        except Exception as e:
            logger.warning(f"Could not load local skill cache: {e}")
            self._local_cache = {}

    def _save_local_cache(self):
        try:
            self._local_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self._local_file, "w", encoding="utf-8") as f:
                json.dump(self._local_cache, f, indent=2)
        except Exception as e:
            logger.warning(f"Could not save local skill cache: {e}")

    @property
    def is_active(self) -> bool:
        if self._dynamodb is None:
            try:
                if os.getenv("AWS_ACCESS_KEY_ID"):
                    self._dynamodb = boto3.resource("dynamodb", region_name=self.region_name)
                    self._table = self._dynamodb.Table(self.table_name)
                    # Test table access
                    self._table.load()
                    self._is_active = True
                else:
                    self._is_active = False
            except Exception as e:
                logger.info(f"DynamoDB not reachable ({e}). Using resilient local cache.")
                self._is_active = False
        return self._is_active

    def compress_large_payload(self, data: dict[str, Any]) -> dict[str, Any]:
        """Friction Point #6 resolution: Gzip compression for skill packages > 300KB."""
        serialized = json.dumps(data)
        if len(serialized.encode("utf-8")) > 300 * 1024:
            compressed = gzip.compress(serialized.encode("utf-8"))
            b64_str = base64.b64encode(compressed).decode("ascii")
            return {"_compressed_gzip_b64": b64_str}
        return data

    def decompress_payload(self, data: dict[str, Any]) -> dict[str, Any]:
        if "_compressed_gzip_b64" in data:
            raw = base64.b64decode(data["_compressed_gzip_b64"])
            decompressed = gzip.decompress(raw).decode("utf-8")
            return json.loads(decompressed)
        return data

    def save_skill(self, skill_package: dict[str, Any]) -> bool:
        skill_id = skill_package["skill_id"]
        # Always store in local cache
        self._local_cache[skill_id] = skill_package
        self._save_local_cache()

        if self.is_active and self._table:
            try:
                item = self.compress_large_payload(skill_package)
                item["pk"] = f"SKILL#{skill_id}"
                self._table.put_item(Item=item)
                return True
            except Exception as e:
                logger.warning(f"Could not put item to DynamoDB: {e}")
        return True

    def get_skill(self, skill_id: str) -> Optional[dict[str, Any]]:
        # Check DynamoDB if active
        if self.is_active and self._table:
            try:
                resp = self._table.get_item(Key={"pk": f"SKILL#{skill_id}"})
                if "Item" in resp:
                    return self.decompress_payload(resp["Item"])
            except Exception as e:
                logger.warning(f"DynamoDB get failed: {e}. Falling back to local cache.")

        # Fallback to local cache
        return self._local_cache.get(skill_id)

    def list_skills(self, limit: int = 20) -> list[dict[str, Any]]:
        skills = list(self._local_cache.values())
        skills.sort(key=lambda s: s.get("updated_at", ""), reverse=True)
        return skills[:limit]

    def delete_skill(self, skill_id: str) -> bool:
        if skill_id in self._local_cache:
            del self._local_cache[skill_id]
            self._save_local_cache()
        if self.is_active and self._table:
            try:
                self._table.delete_item(Key={"pk": f"SKILL#{skill_id}"})
            except Exception:
                pass
        return True


# Global instance
dynamodb_service = DynamoDBService()
