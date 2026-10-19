# 📋 Amazon Developer Hackathon 2026: Product Feedback & Friction Log

> **Project:** SkillForge — Voice-First DSA Learning Companion for Alexa+  
> **Track:** Alexa+ (Self-Hosted MCP Server Spec 2025-11-25 & Simulated Web Experience)  
> **Mini Challenges:** AWS Builder (Amazon Bedrock Claude 3.5 Sonnet, DynamoDB, ECS Fargate) & Open Source (MIT License)  
> **Author:** LAKKIREDDY-2001  

---

## Part 1: Product Feedback on Tools, APIs & SDKs

### 1. Model Context Protocol (MCP) Streamable HTTP & SSE Spec (2025-11-25)
* **What we used it for:** Standardized tool, resource, and prompt exposure connecting the voice assistant runtime to SkillForge's algorithmic pedagogical engine.
* **What worked well:** Clean decoupling between agent brain and backend capabilities. Dynamic schema validation with JSON-RPC 2.0 allowed Claude 3.5 Sonnet to invoke tools with zero hallucinated argument structures.
* **What needs work:** The distinction between stateless HTTP POST `/mcp` and stateful SSE stream `/mcp/sse` needs more explicit reference implementations in the official Amazon Developer documentation for Alexa+ integrations.
* **Onboarding Experience:** Smooth and intuitive once the specification was read. Python `mcp` SDK integration with FastAPI was straightforward.
* **Would we build with it again?** Absolutely yes (10/10). MCP is clearly the future standard for conversational AI extensions.

### 2. Amazon Bedrock Runtime (`bedrock-runtime` via Boto3)
* **What we used it for:** Socratic grading of spoken answers, generating real-world conceptual analogies, and dynamic mock interview evaluations.
* **What worked well:** Sub-second latency with Anthropic Claude 3.5 Sonnet (`anthropic.claude-3-5-sonnet-20241022-v2:0`) and Claude 3 Haiku (`anthropic.claude-3-haiku-20240307-v1:0`). Strict adherence to system prompts and structured evaluation criteria (correctness, complexity analysis, edge cases).
* **What needs work:** Cross-region inference profile ARNs (`us.anthropic.claude-3-5-sonnet-20241022-v2:0`) occasionally require custom IAM policy overrides compared to direct foundation model IDs.
* **Onboarding Experience:** Excellent. The AWS console Bedrock playground and Python SDK samples made initial prompt testing rapid.
* **Would we build with it again?** Yes, Bedrock is our preferred foundation model host due to enterprise governance and predictable throughput.

### 3. Alexa Presentation Language (APL 2026 for Echo Show 15)
* **What we used it for:** Multimodal visual layout rendering on Echo Show devices alongside spoken voice instructions.
* **What worked well:** Responsive component hierarchy (`Container`, `Text`, `ProgressBar`, `VectorGraphic`) allows seamless scaling between Echo Show 8, 10, and 15 portrait/landscape displays.
* **What needs work:** The APL authoring tool simulator could benefit from direct live JSON-RPC test benches so developers can test dynamic MCP payload bindings without manual copy-pasting.
* **Onboarding Experience:** Moderate learning curve for the layout syntax, but highly rewarding once visual widgets are live.
* **Would we build with it again?** Yes, multimodal is essential for modern ambient computing.

---

## Part 2: Friction Log (+10% Bonus Documentation)

### 📌 Friction Log Entry 1: Streaming MCP Responses over Standard HTTP Chunking
* **Task Attempted:** Stream real-time Socratic feedback tokens from Amazon Bedrock through an MCP tool directly to the Alexa+ simulated voice client.
* **Steps Taken:** Implemented SSE endpoint at `/mcp/sse` using standard FastAPI `StreamingResponse` alongside JSON-RPC 2.0 event wrappers.
* **Expected vs. Actual:** Expected standard MCP clients to parse chunked SSE lines automatically. In practice, some proxy gateways and browser clients buffered the chunks until completion.
* **Severity:** **Medium**
* **Workaround Used:** Built a hybrid dual-mode handler: full JSON-RPC response over `/mcp` with an interleaved Server-Sent Event stream on `/mcp/sse` that emits live telemetry tokens to the UI MCP Inspector.
* **Actionable Suggestion for Amazon Team:** Provide an official `@amazon/alexa-mcp-client` npm and Python package with built-in reconnect, keepalive ping, and SSE chunk reassembly.

---

### 📌 Friction Log Entry 2: Bedrock IAM Model Access Discovery
* **Task Attempted:** Programmatically verify whether a specific Bedrock foundation model is enabled in the active AWS account region before dispatching prompts.
* **Steps Taken:** Called `bedrock.get_foundation_model_availability()` during server startup.
* **Expected vs. Actual:** Found that model subscription access status cannot be queried via a simple read-only runtime call without `bedrock:ListFoundationModels` management permissions, which requires higher-tier IAM privileges than standard runtime invocation (`bedrock:InvokeModel`).
* **Severity:** **Low**
* **Workaround Used:** Implemented an optimistic try/except fallback pipeline in `skillforge/bedrock_client.py` that attempts Claude 3.5 Sonnet, gracefully falls back to Claude 3 Haiku / Titan, and defaults to deterministic offline heuristics if AWS credentials are absent.
* **Actionable Suggestion for Amazon Team:** Allow `bedrock-runtime:InvokeModel` to return a standardized dry-run error code indicating model entitlement status without needing separate control plane permissions.

---

### 📌 Friction Log Entry 3: Echo Show APL Visual Viewport Synchronization with Voice Prompts
* **Task Attempted:** Synchronize the glowing voice orb waveform state with the active APL screen transition when a user switches from Quiz to Answer Feedback.
* **Steps Taken:** Dispatched an `Alexa.Presentation.APL.ExecuteCommands` directive containing a `SetPage` command while speech was playing.
* **Expected vs. Actual:** Speech playback occasionally ended 200ms before or after the visual transition, leading to a slight visual desynchronization on slower network connections.
* **Severity:** **Low**
* **Workaround Used:** Added audio event listeners (`audio.onplay`, `audio.onended`, and Web Speech `onstart`/`onend`) with explicit animation state locks in `static/app.js` to ensure the radial score gauge and waveform render synchronously with speech delivery.
* **Actionable Suggestion for Amazon Team:** Include an automatic time-aligned speech-to-visual transition hook in the APL 2026 specification.

---

## Part 3: Feature Requests & Prioritization

| Feature Request | Description | Urgency |
|-----------------|-------------|---------|
| **Native Alexa+ MCP Bridge** | Direct configuration in the Alexa Developer Console to register an external self-hosted MCP endpoint URL without needing an intermediary Lambda proxy. | **Critical** |
| **Echo Show Code Editor APL Widget** | Built-in syntax-highlighted code viewer/editor component in the standard APL component library for developer-focused skills. | **Important** |
| **Voice Interruption / Barge-In API for Web Simulator** | Standardized Web Speech API polyfill for smooth voice interruption when the user speaks while the assistant is explaining. | **Nice-to-have** |
