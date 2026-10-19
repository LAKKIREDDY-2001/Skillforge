# 🎬 SkillForge — 3-Minute Hackathon Demo Video Script

> **Target Duration:** 2 minutes 45 seconds (Strictly under 3 minutes)  
> **Platform:** YouTube / Vimeo (Public, in English)  
> **Primary Track:** Alexa+ | **Mini Challenges:** AWS Builder & Open Source  

---

### [0:00 - 0:25] The Hook & Problem
- **Visual:** Show developer tired at a desk staring at LeetCode, then switching to modern SkillForge dashboard on screen.
- **Narrator (You):**
  > *"Software engineers spend hours grinding coding problems on screens, but real tech interviews at Amazon and top companies evaluate how clearly you articulate complex algorithms out loud.*  
  > *Meet **SkillForge** — the voice-first DSA learning companion built for **Alexa+**, powered by **Amazon Bedrock** and the **Model Context Protocol**."*

---

### [0:25 - 0:55] Screen 1 & Screen 2: Ambient Voice Quiz & Multimodal UX
- **Visual:** Click the glowing blue mic button ("Ask anything"). Say: *"Alexa, quiz me on dynamic programming."*
- **Alexa+ Speaks:**
  > *"Starting quiz on Dynamic Programming. Question 2 of 5: Explain Kadane's algorithm for Maximum Subarray and its time complexity."*
- **Narrator:**
  > *"Notice how SkillForge seamlessly pairs voice interaction with an ambient multimodal dashboard. We see a 40% progress bar, topic badges, and progressive Socratic hint drawers. Let's answer verbally."*
- **Action:** Tap the mic and say:
  > *"Kadane's algorithm maintains a running current sum and a maximum sum. At each step, we either extend the subarray or start fresh from the current element. It runs in O(n) linear time."*

---

### [0:55 - 1:35] Screen 3: Socratic Evaluation with Amazon Bedrock
- **Visual:** Radial score gauge animates to 82/100 ("Good!"). Bedrock AI robot card displays personalized feedback. Key points checklist updates with green checkmarks. Runnable Python code snippet appears with a copy button.
- **Alexa+ Speaks:**
  > *"Spot on! You nailed the linear time complexity and the reset condition. For a follow-up, consider handling an all-negative array."*
- **Narrator:**
  > *"Under the hood, **Amazon Bedrock Claude 3.5 Sonnet** performs deep Socratic grading against four pillars: algorithmic correctness, edge case handling, time complexity, and verbal clarity. It even extracts runnable reference code and schedules the next review."*

---

### [1:35 - 2:05] Screen 4 & Screen 5: SuperMemo SM-2 & Real-World Analogies
- **Visual:** Click "Progress & Review" or navigate to Screen 4 (Spaced Repetition). Point out the 3D isometric cube, 14-day streak, and overdue review cards. Click "Deep Dive" (Screen 5).
- **Narrator:**
  > *"SkillForge isn't just random trivia. It implements the scientific **SuperMemo SM-2 Spaced Repetition Algorithm**, calculating exact decay intervals to review concepts right before you forget them.*  
  > *In the Deep Dive view, Alexa explains abstract concepts using vivid real-world analogies: like thinking of Kadane's algorithm as a train passenger deciding whether to stay on board or take a new express train."*

---

### [2:05 - 2:30] Developer Architecture: MCP Inspector & AWS Cloud
- **Visual:** Click **"📡 MCP Inspector"** in the sidebar. Show live JSON-RPC 2.0 messages flowing (`quiz_me`, `evaluate_answer`, `export_apl_document`). Open the Echo Show 15 APL modal.
- **Narrator:**
  > *"SkillForge is built on the **MCP Specification 2025-11-25** using Streamable HTTP and SSE. It registers 10 specialized tools, 4 resources, and 3 prompts. It connects natively to Alexa+, Claude Desktop, and Echo Show 15 devices running Alexa Presentation Language 2026."*

---

### [2:30 - 2:45] Conclusion & Future Vision
- **Visual:** Return to Dashboard showing active 14-day streak, Level 3 badge, and open-source GitHub repo badge.
- **Narrator:**
  > *"With SkillForge, mastering algorithms is as conversational as talking to your friend on the couch. Fully open source under MIT, built for AWS Bedrock, and ready for Alexa+. Thank you!"*
