"""Root entrypoint for SkillForge MCP Server."""

import uvicorn
from mcp_server.main import app

if __name__ == "__main__":
    uvicorn.run("mcp_server.main:app", host="0.0.0.0", port=8000, reload=True)
