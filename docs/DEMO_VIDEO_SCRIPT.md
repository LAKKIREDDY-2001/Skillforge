# 🎬 SkillForge — 3-Minute Demo Video Script

> **Video Duration:** Under 3 minutes (2:55)  
> **Target Track:** Alexa+ MCP | AWS Builder Mini-Challenge  
> **Presenter / Architect:** Venkata Madhava Reddy  
> **Audio Style:** Clear, energetic, confident, developer-focused

---

## Storyboard & Timestamp Breakdown

### [0:00 - 0:05] The Hook — The Voice Developer Dilemma
- **Visual:** Pure black screen with bold white typography appearing with a subtle audio cue.
- **On Screen Text:**
  > *"Building an Alexa skill takes 3-5 hours."*  
  > *"What if AI could do it in 60 seconds?"*
- **Voiceover:**  
  *"Building an Alexa skill today means hours of wrestling with JSON interaction models, SDK boilerplate, and fragmented developer consoles. What if you could build and ship in under 60 seconds?"*

---

### [0:05 - 0:15] Title Card & Architecture Overview
- **Visual:** High-res SkillForge title graphic with glowing Alexa Cyan accents, showing AWS Bedrock + Alexa+ MCP badge.
- **On Screen Text:**  
  **SkillForge — AI-Powered Alexa Skill Builder via MCP**  
  *Built with Python + Amazon Bedrock + Alexa+ MCP | By Venkata Madhava Reddy*
- **Voiceover:**  
  *"Welcome to SkillForge — the first AI-powered MCP tool server that lets any developer describe an Alexa skill in plain English and get a fully tested, deployable package in seconds."*

---

### [0:15 - 0:45] The Magic Moment — Natural Language Generation
- **Visual:** Split screen showing developer terminal / web interface.
  - The user types: `"Build a skill that tracks my daily water intake and reminds me to drink every 2 hours"`.
  - Clicks `[Generate Skill via MCP]`.
  - Real-time pipeline lights up:
    1. Bedrock Claude 3 Haiku analyzes the prompt.
    2. Intent Generator creates `LogWaterIntent`, `CheckDailyIntakeIntent`, `SetReminderIntent` with slots and synonyms.
    3. Lambda Generator streams `lambda/index.js` with DynamoDB persistence.
    4. Test Generator creates 20+ automated test utterances.
  - On-screen stopwatch stops at: **47 seconds**.
- **Voiceover:**  
  *"Watch this in real-time. I type: 'Build a skill that tracks my daily water intake and reminds me to drink every 2 hours'. In just 47 seconds, SkillForge calls Amazon Bedrock to synthesize the entire skill architecture: intents, slots, sample utterances, an ASK SDK Lambda handler with DynamoDB sessions, and an automated regression test suite."*

---

### [0:45 - 1:15] Deep Dive into the Generated Artifacts
- **Visual:** Smooth zoom-in on the 4 generated artifacts:
  - `interactionModel.json`: 3 custom intents, custom `VolumeUnitType` slot with synonyms, and 30+ spoken utterances.
  - `lambda/index.js`: Clean Node.js ASK SDK v2 code showing `attributesManager.getSessionAttributes()`, `DynamoDbPersistenceAdapter`, and SSML output.
  - `tests/test_suite.json`: Test runner executing 22 test cases live — all showing green checkmarks!
- **Voiceover:**  
  *"Let's inspect what was generated. The interaction model has 3 custom intents, complete slot synonyms for milliliters, ounces, and cups, and multi-turn dialog delegation. The Lambda handler includes full session management and DynamoDB persistence. And look at the test suite: 22 automated positive and negative test cases passing with 100% accuracy."*

---

### [1:15 - 1:45] Iterative Refinement Loop
- **Visual:** Terminal / UI where user enters refinement instruction:
  - User types: `"Add a weekly summary that tells me my average daily intake"`.
  - Tool `refine_skill` executes.
  - Diff view highlights the new `WeeklySummaryIntent` seamlessly added, while all existing intents and slots remain intact.
  - Lambda handler and test suite automatically update to version 2.
- **Voiceover:**  
  *"Need to iterate? Simply describe your changes. I ask it to 'Add a weekly summary that tells me my average daily intake'. SkillForge executes the `refine_skill` MCP tool, preserving our existing intents while adding the new handler, diffing the model, and bumping to version 2."*

---

### [1:45 - 2:15] Voice Testing Simulator & One-Click Deployment
- **Visual:**
  - In-browser Voice Simulator: The user clicks the mic and speaks: *"Alexa, log 500 milliliters of water"*.
  - Visualizer pulses with Alexa cyan glow.
  - Alexa responds with SSML: *"Got it! Added 500 ml of water. You are at 1,500 ml toward your daily goal."*
  - User clicks `[Deploy via ASK CLI]`.
  - Pre-validation passes, and the confirmation banner displays: `"Skill deployed to Alexa Developer Console"`.
- **Voiceover:**  
  *"Before deploying, test it directly in our voice simulator with real SSML playback. Then, click one button. SkillForge pre-validates the package to prevent silent CLI failures and deploys directly to the Alexa Developer Console."*

---

### [2:15 - 2:45] Analytics Dashboard & Developer Portfolio
- **Visual:**
  - Analytics Dashboard displaying invocation trends, 82.4% retention rate, error tracking, and a Sankey diagram showing conversation flow transitions.
  - Portfolio Manager displaying 3 skills generated during the session: Hydration Tracker, Workout Logger, and Habit Forge.
  - Show multi-language toggle generating the same skill in Hindi (`hi-IN`) and Spanish (`es-ES`).
- **Voiceover:**  
  *"Post-deployment, monitor skill performance with our built-in analytics dashboard featuring Sankey conversation paths and CloudWatch metrics. Plus, manage your entire skill portfolio and generate localized skills across English, Hindi, and Spanish with a single prompt."*

---

### [2:45 - 3:00] Closing & Call to Action
- **Visual:** Final hero card with repository link, architecture summary, and hackathon credits.
- **On Screen Text:**  
  **SkillForge**  
  *Build Alexa skills with AI. Ship in minutes, not months.*  
  `https://github.com/LAKKIREDDY-2001/Skillforge`  
  Python • FastAPI • Amazon Bedrock Claude 3 Haiku • Alexa+ MCP
- **Voiceover:**  
  *"SkillForge reduces Alexa skill development time by 98%, turning hours of manual boilerplate into under 60 seconds of AI-driven creation. SkillForge: Build Alexa skills with AI. Ship in minutes, not months. Thank you!"*
