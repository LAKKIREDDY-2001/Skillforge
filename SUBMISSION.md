# Devpost Submission Text: SkillForge — Voice-First Developer Learning

## 1. Project Title
**SkillForge — Voice-First Developer Learning Companion (Alexa+ & AWS Bedrock)**

---

## 2. Elevator Pitch (Short Description)
SkillForge transforms Alexa+ into an interactive voice mentor for Data Structures & Algorithms. Speak algorithmic solutions aloud, receive real-time Socratic grading from Amazon Bedrock (Claude 3.5 Sonnet), and build permanent retention using the scientific SuperMemo SM-2 spaced repetition algorithm.

---

## 3. Tracks & Challenges Entered
* **Primary Track:** **Alexa+** (Self-hosted Model Context Protocol server compliant with MCP Spec 2025-11-25 over Streamable HTTP & SSE, paired with a full-featured Simulated Alexa+ Echo Web Experience).
* **Mini Challenge 1:** **AWS Builder** (Amazon Bedrock Anthropic Claude 3.5 Sonnet for Socratic grading & analogies, Amazon DynamoDB for user progress & flashcard state, and AWS CloudFormation/ECS Fargate deployment).
* **Mini Challenge 2:** **Open Source** (Open-source repository under MIT License with reusable MCP developer tools, comprehensive test suite, and clear documentation).

---

## 4. Inspiration & The Problem
Software engineers spend hours every week grinding Data Structures & Algorithms on platforms like LeetCode. However, traditional DSA preparation suffers from three major flaws:
1. **Screen Fatigue:** After 8 hours coding at work, developers don't want to spend their evenings staring at another IDE screen.
2. **The "Silent Coding" Trap:** Real technical interviews at companies like Amazon, Google, and Meta aren't silent coding tests—they are verbal communication examinations. Candidates fail because they struggle to articulate time/space trade-offs out loud under pressure.
3. **The Forgetting Curve:** Developers solve a dynamic programming problem once, only to completely forget the recurrence relation two weeks later.

We asked: *What if you could practice algorithms verbally with Alexa while cooking dinner, walking your dog, or relaxing on the couch?*

---

## 5. What SkillForge Does
SkillForge creates a seamless voice-first learning loop:
1. **Voice Quizzing:** Say *"Alexa, quiz me on dynamic programming."* SkillForge pulls from a curated 10-topic question bank or invokes Amazon Bedrock to generate a tailored interview question.
2. **Socratic Voice Explanations:** Say *"Alexa, explain Kadane's algorithm."* Instead of reciting dry code, Alexa provides a memorable real-world analogy (e.g. explaining memoization through a math scratchpad or hash tables through a coat-check ticket).
3. **Voice Answer Evaluation:** The developer speaks their solution aloud (*"I'd use two pointers, moving left when the sum is too small and right when too large, running in O(n) time and O(1) space"*). Amazon Bedrock evaluates their spoken answer, checks key points, provides constructive feedback, and awards XP.
4. **SuperMemo SM-2 Spaced Repetition:** Every question answered is scheduled into an SM-2 spaced repetition deck. Easy questions appear weeks later; difficult questions are reinforced immediately.
5. **Simulated Alexa+ Web Experience:** A web app featuring a glowing Alexa Echo pulse ring, real-time waveform visualizer, Web Speech API integration, and a **Live MCP Inspector** displaying every JSON-RPC 2.0 tool call in real time.

---

## 6. How We Built It (Tech Stack & Architecture)
* **Backend Framework:** Python 3.11 with FastAPI and Uvicorn.
* **Protocol Standard:** Model Context Protocol (MCP) Spec 2025-11-25 supporting Streamable HTTP (`/mcp/sse`, `/mcp/messages`, and `/mcp` JSON-RPC 2.0).
* **Artificial Intelligence:** Amazon Bedrock with Anthropic Claude 3.5 Sonnet (`anthropic.claude-3-5-sonnet-20241022-v2:0`) and Claude 3 Sonnet fallback.
* **Storage Layer:** Dual-mode persistence with Amazon DynamoDB (`SkillForge_Users` and `SkillForge_Reviews`) and local JSON fallback for offline resilience.
* **Algorithmic Engine:** SuperMemo SM-2 spaced repetition mathematical model with dynamic ease factors and repetition intervals.
* **Simulated Interface:** Modern HTML5/CSS3/JavaScript web application with Web Speech API (SpeechRecognition for voice input, SpeechSynthesis for Alexa voice output).
* **Cloud Infrastructure:** Docker, Docker Compose, and AWS CloudFormation template for ECS Fargate deployment with fine-grained IAM task execution roles.

---

## 7. AWS Builder Integration Details
1. **Amazon Bedrock:**
   * Used for Socratic answer grading: grades spoken candidate responses against canonical key points, outputs numerical scores (0-100), and assigns SuperMemo SM-2 quality grades (0-5).
   * Used for analogy generation: generates plain-English, voice-optimized explanations anchored in relatable analogies.
   * Used for dynamic question generation when learners request custom difficulty levels or unexplored topics.
2. **Amazon DynamoDB:**
   * `SkillForge_Users`: Stores study streaks, total quizzes, XP, and unlocked badges with pay-per-request billing.
   * `SkillForge_Reviews`: Stores the SM-2 flashcard state (interval, repetition count, ease factor, next review date) keyed by `user_id` (HASH) and `question_id` (RANGE).
3. **AWS ECS Fargate:**
   * Containerized via multi-stage Dockerfile and deployed via CloudFormation template with AWS Bedrock IAM invoke policies.

---

## 8. Open Source Mini Challenge Details
* **Repository:** Public repository with MIT License.
* **Reusable Artifacts:**
  * Complete, standalone MCP server implementation (8 tools, 3 resources, 3 prompts) ready to plug into Alexa+, Claude Desktop, or Cursor.
  * Curated 10-topic DSA Question Bank with voice-optimized metadata and key criteria scoring points.
  * Standalone SuperMemo SM-2 algorithm Python implementation.
* **Test Suite:** 31 comprehensive unit and integration tests passing in ~2 seconds.

---

## 9. Challenges We Overcame
1. **Voice-Friendly Prompt Engineering:** Traditional DSA prompts return markdown code blocks with LaTeX equations ($O(N \log K)$), which sound terrible when read aloud by text-to-speech engines. We engineered custom prompt constraints for Bedrock Claude 3.5 Sonnet that enforce plain-English verbal descriptions without markdown fences.
2. **MCP Spec 2025-11-25 Streamable HTTP Compliance:** Implementing both standard JSON-RPC 2.0 and Server-Sent Events (SSE) session queues required precise event routing to ensure Claude Desktop, Cursor, and Alexa+ clients could interact seamlessly.
3. **Zero-Crash Resilient Architecture:** To ensure hackathon judges could test SkillForge without mandatory AWS credentials or active billing, we built dual-mode fallbacks for both Bedrock and DynamoDB. If credentials are missing, SkillForge gracefully switches to high-fidelity heuristic evaluation and local storage without throwing uncaught exceptions.

---

## 10. Accomplishments That We're Proud Of
* 🎯 **31 out of 31 automated tests passing** across engine logic, SM-2 math, MCP protocol, and REST endpoints.
* 🎙️ **True hands-free voice experience** with glowing visualizer, speech recognition, and Alexa voice feedback.
* 📡 **Live MCP Inspector** that visually proves the MCP protocol stream to judges.
* 🏆 **A comprehensive, production-ready solution** bridging Alexa+, AWS Bedrock, and developer education.

---

## 11. What We Learned
* How the Model Context Protocol standardizes AI agent integrations across Amazon devices and modern developer tools.
* The nuances of designing voice-first educational interfaces where verbal clarity takes precedence over screen density.
* How to combine deterministic algorithms (SM-2 spaced repetition) with probabilistic LLMs (Claude 3.5 Sonnet) for reliable, scientific learning.

---

## 12. What's Next for SkillForge
* **Fire TV & Echo Show Visual Companion:** Multimodal UI displaying tree and graph visualizations on TV while Alexa guides you verbally.
* **Bee Wearable AI Integration:** Tap your Bee wearable during a morning walk to review your 3 most overdue DSA cards.
* **Ring Doorbell / Home Automation Celebration:** Trigger a Ring smart lighting celebration whenever you reach a 7-day study streak!
