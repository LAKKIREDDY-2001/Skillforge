# Product Feedback: Amazon Developer Tools & AWS Services

This document provides structured product feedback on the tools, APIs, and SDKs utilized during the development of **SkillForge** for the **Amazon Developer Hackathon 2026**.

---

## 1. Alexa+ MCP Server Specification (Spec 2025-11-25) & Streamable HTTP Transport

### What We Used It For
We used the Model Context Protocol (MCP Spec 2025-11-25) as the primary integration layer connecting Alexa+ voice interactions to our backend agent tools (`quiz_me`, `explain_concept`, `evaluate_answer`, `suggest_next`, `check_streak`, `daily_challenge`, `get_hint`, `mock_interview`).

### What Worked Well
* **Standardized Agent Interoperability:** Adopting MCP allowed us to build once and immediately test across Alexa+, Claude Desktop, Cursor, and our custom simulated web app. The separation of `tools`, `resources`, and `prompts` is clean and intuitive.
* **JSON-RPC 2.0 Clarity:** The protocol is lightweight, predictable, and simple to debug using standard tooling and browser inspectors.
* **Streamable HTTP:** Transitioning from local stdio to Streamable HTTP and Server-Sent Events (SSE) makes hosting MCP servers on cloud infrastructure (like ECS Fargate) remarkably straightforward.

### What Needs Work
* **Streaming Answer Evaluation:** For voice assistants, waiting for full LLM completion before speaking can introduce noticeable latency (1.5 - 2.5s). Native token-level streaming over MCP tool call results (or partial chunk notifications) would allow Alexa to start speaking the first sentence while subsequent evaluation tokens are still generating.
* **Voice Speech Synthesis Markup (SSML) in Schemas:** MCP tools currently output raw text or JSON. Adding a standard schema convention for SSML (speech synthesis markup) would help voice developers specify pauses, phonemes, and emphasis directly in tool responses.

### Onboarding Experience
* **Rating:** 8.5 / 10.
* The documentation on ModelContextProtocol.io and Amazon's builder guidance was informative. Setting up the SSE message endpoint required careful handling of session queues, but once configured, it worked reliably.

### Would You Build With It Again?
* **Yes, absolutely.** MCP is clearly the future standard for AI agent and device integrations.

---

## 2. Amazon Bedrock (Anthropic Claude 3.5 Sonnet)

### What We Used It For
* Socratic answer evaluation and grading (scoring 0-100, SM-2 quality 0-5, and key points verification).
* Voice-first algorithm explanations anchored in real-world analogies.
* Dynamic question generation for custom topics and progressive hint generation.

### What Worked Well
* **Superior Reasoning & Nuance:** Claude 3.5 Sonnet on Bedrock excelled at evaluating spoken candidate answers. Candidates rarely speak textbook definitions; they use conversational phrasing and synonyms. Claude 3.5 Sonnet accurately identified whether the candidate understood the underlying time/space trade-offs without being overly pedantic.
* **Structured Output Adherence:** Claude followed our system constraints strictly, returning valid JSON without extraneous conversational preamble when asked.
* **boto3 bedrock-runtime Integration:** The `invoke_model` API with Claude 3 messages schema was seamless and responsive (~800ms average response time in us-east-1).

### What Needs Work
* **Cross-Region Model Availability:** In some AWS regions, Claude 3.5 Sonnet access requires requesting model access or using inference profiles. Clearer inline error messages in the AWS Console when model access is pending would improve the first-time developer onboarding experience.

### Onboarding Experience
* **Rating:** 9 / 10.
* Setting up Bedrock in the AWS Console, enabling model access, and writing boto3 client code took less than 15 minutes.

### Would You Build With It Again?
* **Yes, without hesitation.** Bedrock is our preferred foundation model platform for production AI workloads.

---

## 3. Amazon DynamoDB

### What We Used It For
* User study streak tracking, total quizzes, and gamification XP (`SkillForge_Users`).
* Spaced repetition flashcard review schedule persistence (`SkillForge_Reviews`).

### What Worked Well
* **Pay-Per-Request (On-Demand) Billing:** Perfect for serverless and hackathon projects with unpredictable traffic. Zero idle costs.
* **Sub-10ms Latency:** Fast key-value lookups ensured that retrieving a user's SM-2 review schedule added virtually zero overhead to the voice response loop.
* **Composite Keys:** Keying `SkillForge_Reviews` by `user_id` (HASH) and `question_id` (RANGE) made querying all review items for a specific user clean and efficient.

### What Needs Work
* **Python Decimal Serialization with Float Data:** boto3's DynamoDB resource requires `Decimal` types instead of standard Python `float` numbers (such as our SM-2 ease factor `2.5`). We had to write explicit conversions (`Decimal(str(round(val, 2)))`) to avoid serialization exceptions. Native float conversion options in boto3 would streamline development.

### Onboarding Experience
* **Rating:** 9 / 10.
* Intuitive table creation in CloudFormation and fast Python SDK integration.

### Would You Build With It Again?
* **Yes.** DynamoDB remains the premier database for low-latency user session and state management.

---

## 4. Amazon Devices Builder Tools (MCP Server & Agent Skills)

### What We Used It For
* Referencing Vega/Fire OS and Alexa+ design patterns and exploring guided AI workflows for Amazon device scaffolding.

### What Worked Well
* Bringing device knowledge into AI coding assistants is a brilliant initiative. Having documentation search and device best practices directly inside the IDE reduces context switching to external browser tabs.

### What Needs Work
* More starter templates specifically demonstrating **Alexa+ MCP Streamable HTTP** servers would be helpful for web and backend developers. Most existing templates focus on native Fire TV / Android / React Native.

### Would You Build With It Again?
* **Yes.** The developer ecosystem around Amazon Devices Builder Tools is maturing rapidly.
