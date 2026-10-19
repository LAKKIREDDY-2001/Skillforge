# Friction Logs & Feature Requests (10% Judging Bonus)

This document catalogs structured friction log entries and actionable feature requests encountered during the development of **SkillForge** for the **Amazon Developer Hackathon 2026**.

---

## Friction Log 1: boto3 DynamoDB Float vs. Decimal Serialization

* **Task Attempted:** Persisting the SuperMemo SM-2 Spaced Repetition ease factor (e.g. `2.5`) and fractional review metrics into Amazon DynamoDB.
* **Steps Taken:**
  1. Calculated the new SM-2 ease factor: `ease_factor = 2.5 + delta`.
  2. Called `table.put_item(Item={"user_id": "u1", "question_id": "dp_1", "ease_factor": ease_factor})`.
* **Expected vs. Actual:**
  * *Expected:* boto3 automatically marshals Python `float` primitives into DynamoDB `N` (numeric) attributes.
  * *Actual:* boto3 raised `TypeError: Float types are not supported. Use Decimal, string, or other types instead.`
* **Severity Rating:** **Medium** (blocked initial test run until type conversion wrapper was implemented).
* **Workaround Used:** Explicitly converted all floating-point calculations to `decimal.Decimal` via `Decimal(str(round(val, 2)))` before calling `put_item`.
* **Actionable Suggestion:** Provide an opt-in parameter or serializer setting in `boto3.resource('dynamodb')` (e.g. `allow_float=True` using `decimal.Decimal(str(x))` under the hood) to reduce boilerplate for developers working with scientific/mathematical algorithms.

---

## Friction Log 2: Streamable HTTP SSE Session Queue Management in Multi-Worker FastAPI

* **Task Attempted:** Hosting an MCP Spec 2025-11-25 server over Streamable HTTP Server-Sent Events (`/mcp/sse`) and client message routing (`/mcp/messages?session_id=...`).
* **Steps Taken:**
  1. Connected an MCP client to `/mcp/sse` to receive server events.
  2. Submitted tool calls to `/mcp/messages`.
  3. Attempted to route responses back across multiple worker processes (`uvicorn --workers 4`).
* **Expected vs. Actual:**
  * *Expected:* The POST request on `/mcp/messages` routes seamlessly to the waiting SSE connection.
  * *Actual:* In multi-worker deployments, the client POST request often hit a different worker process that didn't have the in-memory `session_id` queue, resulting in HTTP 404 Session Not Found.
* **Severity Rating:** **High** (impacts production scalability across multiple container replicas).
* **Workaround Used:** Bound the server to a single worker for local development, and designed the Redis / ElastiCache pub/sub architecture for multi-worker production deployments.
* **Actionable Suggestion:** Provide an official Amazon / MCP reference pattern or lightweight Redis adapter for distributed Streamable HTTP SSE session management across ECS tasks.

---

## Friction Log 3: Voice Formatting of Algorithmic Complexity (LaTeX vs. Speech)

* **Task Attempted:** Having Amazon Bedrock Claude 3.5 Sonnet generate explanations of algorithm complexities suitable for Alexa voice output.
* **Steps Taken:**
  1. Prompted Bedrock: *"Explain the time complexity of Merge Sort."*
  2. Fed response into SpeechSynthesis (Alexa voice output).
* **Expected vs. Actual:**
  * *Expected:* The assistant pronounces the complexity naturally: *"Big O of N log N"*.
  * *Actual:* The model outputted LaTeX markdown: `O(n \log n)`. The text-to-speech engine read this phonetically as *"Capital O open parenthesis n backslash log n close parenthesis"*, which was confusing to listen to.
* **Severity Rating:** **Medium** (degraded voice user experience).
* **Workaround Used:** Implemented a dedicated voice post-processing filter and strict system prompts instructing Claude: *"Never use LaTeX or mathematical notation; write out Big O of N log N phonetically in plain English sentences."*
* **Actionable Suggestion:** Introduce a voice-formatting filter or built-in SSML translator in the Amazon Devices Builder Tools MCP server to automatically convert markdown/LaTeX to natural speech phonetics.

---

## Friction Log 4: Model Access Provisioning Feedback in Bedrock Console

* **Task Attempted:** Calling `anthropic.claude-3-5-sonnet-20241022-v2:0` in a fresh AWS account.
* **Steps Taken:**
  1. Initialized `boto3.client("bedrock-runtime", region_name="us-east-1")`.
  2. Called `invoke_model`.
* **Expected vs. Actual:**
  * *Expected:* Clear error message indicating that model access needs to be enabled in the AWS Bedrock Console.
  * *Actual:* Received a generic `AccessDeniedException: You don't have access to the model with the specified model ID.` without a direct link to the Model Access page.
* **Severity Rating:** **Low / Medium** (caused temporary confusion regarding whether credentials or permissions were faulty).
* **Workaround Used:** Navigated manually to Amazon Bedrock Console > Model Access, requested Anthropic access, and implemented a multi-model fallback list in Python (`Claude 3.5 Sonnet -> Claude 3 Sonnet -> Pedagogical Evaluator`).
* **Actionable Suggestion:** Enhance the Bedrock `AccessDeniedException` message to include a direct link to the AWS Bedrock Model Access management page for the requested model.

---

## Prioritized Feature Requests

| Feature Request | Description | Urgency |
|-----------------|-------------|---------|
| **Streaming Tool Responses in MCP** | Support token-by-token streaming over MCP tool results so voice assistants can synthesize speech immediately. | **Important** |
| **Native SSML Schemas in MCP Spec** | Add standard metadata in MCP tool outputs to indicate SSML markup (whispers, emphasis, pauses). | **Important** |
| **Float Support in boto3 DynamoDB** | Add native float-to-decimal automatic coercion flag in boto3 DynamoDB client. | **Nice-to-have** |
| **Alexa+ Streamable HTTP SDK** | An official lightweight Python SDK decorator (`@alexa_mcp.tool`) for instant Streamable HTTP Alexa+ server creation. | **Critical** |
