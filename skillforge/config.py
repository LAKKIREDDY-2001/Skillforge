"""Configuration settings for SkillForge MCP server."""

import os
from pydantic import BaseModel


class Settings(BaseModel):
    # App
    app_name: str = "SkillForge"
    app_version: str = "1.0.0"
    description: str = "Voice-First DSA Learning Companion for Alexa+ via MCP"
    mcp_protocol_version: str = "2025-11-25"

    # Server
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))
    debug: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

    # AWS & Bedrock
    aws_region: str = os.getenv("AWS_REGION", "us-east-1")
    bedrock_model_id: str = os.getenv(
        "BEDROCK_MODEL_ID",
        "anthropic.claude-3-5-sonnet-20241022-v2:0"
    )
    bedrock_fallback_model_id: str = os.getenv(
        "BEDROCK_FALLBACK_MODEL_ID",
        "anthropic.claude-3-sonnet-20240229-v1:0"
    )

    # DynamoDB Tables
    dynamodb_users_table: str = os.getenv("DYNAMODB_USERS_TABLE", "SkillForge_Users")
    dynamodb_reviews_table: str = os.getenv("DYNAMODB_REVIEWS_TABLE", "SkillForge_Reviews")
    enable_dynamodb: bool = os.getenv("ENABLE_DYNAMODB", "auto").lower() in ("true", "1", "auto")

    # Local data store fallback
    data_dir: str = os.getenv("DATA_DIR", "./data")
    local_storage_file: str = os.getenv("LOCAL_STORAGE_FILE", "./data/skillforge_store.json")


settings = Settings()
