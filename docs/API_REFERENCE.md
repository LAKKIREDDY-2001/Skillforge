# 📖 SkillForge MCP Tool API Reference

> **Server:** SkillForge MCP Server  
> **Protocol Version:** MCP Spec 2025-11-25+ (Streamable HTTP & SSE)  
> **Live Cloud Base URL:** `https://skillforge-scoz.onrender.com`  
> **Local Base URL:** `http://localhost:8000`

---

## Tool 1: `generate_skill`

Generates a complete, deployable Alexa Skill Package from plain English in under 60 seconds.

### Endpoint
- **REST:** `POST /tools/generate_skill`
- **MCP Protocol:** `POST /mcp/tools/call` with `{"name": "generate_skill", "arguments": {...}}`

### Parameters
| Name | Type | Required | Description |
|---|---|---|---|
| `description` | `string` | **Yes** | Plain English description of the skill. |
| `skill_name` | `string` | No | Custom title for the skill. |
| `invocation_name`| `string` | No | Custom invocation name (minimum 2 words). |
| `locale` | `string` | No | Target Alexa locale (default: `en-US`). |
| `include_dynamodb`| `boolean`| No | Include DynamoDB session adapter (default: `true`). |

### Example Request
```json
{
  "description": "Build a skill that tracks my daily water intake and reminds me to drink every 2 hours",
  "skill_name": "Hydration Tracker",
  "invocation_name": "water tracker",
  "locale": "en-US",
  "include_dynamodb": true
}
```

### Example Response
```json
{
  "success": true,
  "tool": "generate_skill",
  "message": "🎉 Successfully generated Alexa skill 'Hydration Tracker' with 22 tests in 840ms.",
  "data": {
    "skill_id": "amzn1.ask.skill.9f8b2c14-...",
    "name": "Hydration Tracker",
    "invocation_name": "water tracker",
    "manifest": { ... },
    "interaction_model": { ... },
    "lambda_handler": "const Alexa = require('ask-sdk-core'); ...",
    "test_suite": [ ... ]
  },
  "execution_time_ms": 840
}
```

---

## Tool 2: `refine_skill`

Iterates on an existing skill with follow-up instructions, preserving all existing intents and bumping the version.

### Endpoint
- **REST:** `POST /tools/refine_skill`
- **MCP Protocol:** `POST /mcp/tools/call` with `{"name": "refine_skill", "arguments": {...}}`

### Parameters
| Name | Type | Required | Description |
|---|---|---|---|
| `skill_id` | `string` | **Yes** | ID of the skill package to refine. |
| `instructions` | `string` | **Yes** | Follow-up refinement instructions in plain English. |

### Example Request
```json
{
  "skill_id": "amzn1.ask.skill.9f8b2c14-...",
  "instructions": "Add a weekly summary that tells me my average daily intake"
}
```

---

## Tool 3: `test_skill`

Runs automated utterance validation, slot parsing, and regression testing against the interaction model.

### Endpoint
- **REST:** `POST /tools/test_skill`
- **MCP Protocol:** `POST /mcp/tools/call` with `{"name": "test_skill", "arguments": {...}}`

### Parameters
| Name | Type | Required | Description |
|---|---|---|---|
| `skill_id` | `string` | **Yes** | ID of the skill to test. |
| `test_utterance` | `string` | No | Single utterance to test. |
| `run_full_suite` | `boolean` | No | Run the complete 20+ test suite (default: `true`). |

---

## Tool 4: `deploy_skill`

Deploys the skill package to the Alexa Developer Console via the ASK CLI orchestrator with pre-deployment validation.

### Endpoint
- **REST:** `POST /tools/deploy_skill`
- **MCP Protocol:** `POST /mcp/tools/call` with `{"name": "deploy_skill", "arguments": {...}}`

### Parameters
| Name | Type | Required | Description |
|---|---|---|---|
| `skill_id` | `string` | **Yes** | ID of the skill to deploy. |
| `stage` | `string` | No | Deployment stage (`development`, `test`, `live`). |

---

## Tool 5: `analyze_skill`

Retrieves invocation metrics, error rates, CloudWatch telemetry, and Sankey conversation flows.

### Endpoint
- **REST:** `POST /tools/analyze_skill`
- **MCP Protocol:** `POST /mcp/tools/call` with `{"name": "analyze_skill", "arguments": {...}}`

### Parameters
| Name | Type | Required | Description |
|---|---|---|---|
| `skill_id` | `string` | **Yes** | ID of the skill to analyze. |
| `time_range` | `string` | No | Time window (`24h`, `7d`, `30d`, `90d`). |

---

## Tool 6: `list_skills`

Portfolio manager listing all skills, versions, and statuses.

### Endpoint
- **REST:** `GET /tools/list_skills` or `POST /tools/list_skills`
- **MCP Protocol:** `POST /mcp/tools/call` with `{"name": "list_skills", "arguments": {...}}`

### Parameters
| Name | Type | Required | Description |
|---|---|---|---|
| `limit` | `integer` | No | Max skills to return (default: `20`). |
| `status_filter` | `string` | No | Filter by status (`generated`, `refined`, `tested`, `deployed`). |
