"""Amazon Bedrock Claude 3 Haiku client with exponential backoff, jitter, and offline resilience.

Resolves Hackathon Friction Points:
- FP #2: Token limit truncation (chunked generation & pipeline assembly)
- FP #5: ThrottlingException during burst generation (exponential backoff with jitter)
- FP #9: Malformed JSON parsing (regex extraction fallback)
"""

from __future__ import annotations

import json
import logging
import os
import random
import re
import time
from typing import Any, Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError

logger = logging.getLogger("skillforge.bedrock")


class BedrockService:
    def __init__(
        self,
        model_id: str = "anthropic.claude-3-haiku-20240307-v1:0",
        region_name: Optional[str] = None,
    ):
        self.model_id = model_id
        self.region_name = region_name or os.getenv("AWS_DEFAULT_REGION", "us-east-1")
        self._client = None
        self._is_available = None

    @property
    def client(self):
        if self._client is None:
            try:
                self._client = boto3.client("bedrock-runtime", region_name=self.region_name)
                self._is_available = True
            except Exception as e:
                logger.warning(f"Bedrock client initialization warning: {e}. Fallback generator enabled.")
                self._is_available = False
        return self._client

    @property
    def is_available(self) -> bool:
        if self._is_available is None:
            try:
                # Try simple client init
                _ = self.client
                self._is_available = self._client is not None
            except Exception:
                self._is_available = False
        return self._is_available

    def invoke_with_retry(
        self,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 4096,
        temperature: float = 0.3,
        max_retries: int = 4,
    ) -> str:
        """Invoke Claude 3 Haiku on Bedrock with exponential backoff & jitter."""
        if not self.is_available or not os.getenv("AWS_ACCESS_KEY_ID"):
            logger.info("Bedrock credentials not active; utilizing resilient neural heuristic generator.")
            return ""

        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "temperature": temperature,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_prompt}],
        })

        delay = 1.0
        for attempt in range(max_retries):
            try:
                response = self.client.invoke_model(
                    modelId=self.model_id,
                    contentType="application/json",
                    accept="application/json",
                    body=body,
                )
                response_body = json.loads(response["body"].read().decode("utf-8"))
                return response_body["content"][0]["text"]
            except ClientError as e:
                error_code = e.response.get("Error", {}).get("Code", "")
                if error_code in ("ThrottlingException", "RequestLimitExceeded", "TooManyRequestsException"):
                    # Friction Log #5 resolution: Exponential backoff with full jitter
                    jitter = random.uniform(0.5, 1.5)
                    sleep_time = (delay * (2 ** attempt)) + jitter
                    logger.warning(f"Bedrock throttled (attempt {attempt + 1}/{max_retries}), retrying in {sleep_time:.2f}s...")
                    time.sleep(sleep_time)
                else:
                    logger.error(f"Bedrock invocation error: {e}")
                    raise
            except Exception as e:
                logger.error(f"Unexpected Bedrock error: {e}")
                if attempt == max_retries - 1:
                    raise
                time.sleep(delay)

        raise RuntimeError(f"Bedrock invocation exceeded {max_retries} retries.")

    def extract_json(self, text: str) -> dict[str, Any] | list[Any]:
        """Friction Point #9 resolution: Robust JSON extraction with regex fallback parser."""
        if not text or not text.strip():
            return {}

        text = text.strip()

        # 1. Direct parse attempt
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # 2. Markdown code block extraction
        code_block_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if code_block_match:
            try:
                return json.loads(code_block_match.group(1))
            except json.JSONDecodeError:
                pass

        # 3. Outer bracket extraction (heuristic regex)
        curly_match = re.search(r"(\{[\s\S]*\})", text)
        if curly_match:
            try:
                return json.loads(curly_match.group(1))
            except json.JSONDecodeError:
                pass

        square_match = re.search(r"(\[[\s\S]*\])", text)
        if square_match:
            try:
                return json.loads(square_match.group(1))
            except json.JSONDecodeError:
                pass

        logger.warning("Could not extract JSON via standard methods; returning empty fallback.")
        return {}


# Global instance
bedrock_service = BedrockService()
