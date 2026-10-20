# Devpost Submission Text: SkillForge — AI-Powered Alexa Skill Builder via MCP

## 1. Project Title
**SkillForge — AI-Powered Alexa Skill Builder via MCP**

---

## 2. Elevator Pitch (Short Description)
"Build Alexa skills with AI. Ship in minutes, not months."
SkillForge is an AI-powered MCP tool server that lets developers describe an Alexa skill in plain English and get a fully generated, tested, and deployable skill package — interaction model, ASK SDK Lambda handler with DynamoDB sessions, test utterances, and deployment manifest — in under 60 seconds.

---

## 3. Tracks & Challenges Entered
* **Primary Track:** **Alexa+** (Self-hosted Model Context Protocol server compliant with MCP Spec 2025-11-25 over Streamable HTTP & SSE, offering 6 compliant developer tools).
* **Mini Challenge 1:** **AWS Builder** (Amazon Bedrock Claude 3 Haiku for rapid architecture generation, Amazon DynamoDB for skill packages & session persistence, AWS Lambda, and CloudWatch metrics).
* **Mini Challenge 2:** **Open Source** (Apache 2.0 licensed public GitHub repository with 12 automated tests, Dockerfile, and reusable MCP skill generation tools).
* **Developer Friction Log Bonus:** 10 structured friction points with resolutions for a **+10% judging bonus**.

---

## 4. Inspiration & The Problem
Building an Alexa skill today requires:
1. **3–5 hours** to manually configure interaction models, intents, slot types, and sample utterances.
2. **Deep ASK SDK knowledge** — most developers give up at the Lambda handler, session persistence, and error handling layers.
3. **Trial-and-error testing** — no automated way to validate utterances, slot boundary values, and edge cases prior to deployment.
4. **Fragmented tooling** — ASK CLI, AWS Lambda console, DynamoDB, and CloudWatch are disconnected.

SkillForge solves this in 60 seconds: Describe what you want in plain English. AI does the rest.

---

## 5. What SkillForge Does (6 MCP Tools)
1. **`generate_skill`**: Takes any conversational prompt (e.g. *"Build a skill that tracks my daily water intake and reminds me to drink every 2 hours"*) and synthesizes:
   - `skill.json`: Deployment manifest with endpoints, permissions, and publishing metadata.
   - `interactionModel.json`: Intents, custom slot types with synonyms, 10+ utterances per intent, and dialog delegation (`ALWAYS`).
   - `lambda/index.js`: Production-ready Node.js ASK SDK v2 handler with `attributesManager`, session handling, DynamoDB persistence, and rich SSML speech.
   - `tests/test_suite.json`: 20+ automated test utterances with expected intents, slots, and edge cases.
2. **`refine_skill`**: Natural language iterative refinement loop. Prompts like *"Add a weekly summary that tells me my average daily intake"* seamlessly add new intents without resetting or dropping existing intents, automatically bumping version numbers.
3. **`test_skill`**: Automated regression test runner with slot matching and confidence scoring.
4. **`deploy_skill`**: One-click deployment to the Alexa Developer Console via ASK CLI orchestrator with schema pre-validation to eliminate silent deployment failures.
5. **`analyze_skill`**: Real-time performance metrics, error tracking, and Sankey diagram conversation flows.
6. **`list_skills`**: Portfolio manager for all generated skills across versions.

---

## 6. How We Built It (Tech Stack & Architecture)
* **AI Orchestrator:** Amazon Bedrock with Anthropic Claude 3 Haiku (`anthropic.claude-3-haiku-20240307-v1:0`), optimized with custom system prompts for Alexa architecture and low-latency generation.
* **Backend & Protocol:** Python 3.11 with FastAPI, Uvicorn, and Model Context Protocol (MCP Spec 2025-11-25) supporting Streamable HTTP (`/mcp/tools`, `/mcp/call`) and REST endpoints.
* **Persistence Layer:** Amazon DynamoDB for skill metadata, versioning, and session persistence, featuring automatic `gzip` compression for payloads > 300KB (resolving Friction Point #6).
* **CLI Deployment:** ASK CLI v2 integration with pre-deployment JSON schema validation (resolving Friction Point #3).
* **Testing:** 12 automated unit & integration tests covering intent generation, multi-turn dialog delegation, slot types, Lambda session management, DynamoDB code, and MCP tool execution with a 100% test pass rate.
* **Inclusive Voice Design (IVD):** Auto-generated SSML with `<prosody rate="95%">`, cognitive pauses (`<break time="300ms"/>`), phoneme hints (`<phoneme>`), and multi-language generation in English, Hindi, Spanish, German, and Japanese.

---

## 7. AWS Builder Integration Details
1. **Amazon Bedrock:**
   - Powers the Intent Generator, Lambda Generator, and Test Suite Generator with specialized system prompts.
   - Built with exponential backoff and randomized jitter to handle burst concurrency without `ThrottlingException` (Friction Point #5).
2. **Amazon DynamoDB:**
   - Persists skill architectures and version history with pay-per-request billing.
   - Gzip compression handles large packages seamlessly under the 400KB limit.
3. **AWS Lambda & CloudWatch:**
   - Generates compliant ASK SDK v2 Lambda code with structured ErrorHandlers and CloudWatch metric namespace logging (`AWS/Alexa/SkillForge`).

---

## 8. GitHub Repository & Reviewer Access
- **Repository URL:** [https://github.com/LAKKIREDDY-2001/Skillforge](https://github.com/LAKKIREDDY-2001/Skillforge)
- **Visibility:** Private (as required by the hackathon submission rules).
- **Invited Reviewers:** `chris-trag`, `knmeiss`, `giolaq`, `anishamalde`, `mosesroth`, `emersonsklar`, and `testing@devpost.com`.

---

## 9. Developer Friction Log (+10% Bonus)
Full report available in [`FRICTION_LOG.md`](https://github.com/LAKKIREDDY-2001/Skillforge/blob/main/FRICTION_LOG.md) detailing 10 technical friction points encountered with Bedrock, ASK CLI, DynamoDB, and MCP, along with their resolutions.
