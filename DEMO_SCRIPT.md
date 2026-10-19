# 🎬 SkillForge — Winning 3-Minute Video Demo Script

> **Target Duration:** 2 minutes 45 seconds (Under the strict 3:00 minute judging limit)  
> **Platform:** YouTube or Vimeo (Public, in English)  
> **Video Resolution:** 1080p / 60fps, crisp screen recording with clear microphone audio.

---

## ⏱️ Video Timeline Breakdown

```
[0:00 - 0:25] ⚡ Hook: The Problem with Traditional DSA Prep & Intro
[0:25 - 1:00] 🎙️ Live Demo 1: Voice Quizzing & Real-Time MCP Protocol Stream
[1:00 - 1:40] 🎯 Live Demo 2: Socratic Spoken Answer Grading via Amazon Bedrock
[1:40 - 2:10] 🧠 Live Demo 3: SuperMemo SM-2 Spaced Repetition & Gamification
[2:10 - 2:35] ☁️ Architecture: AWS Bedrock + DynamoDB + ECS Fargate
[2:35 - 2:45] 🚀 Conclusion & Call to Action
```

---

## 📽️ Scene-by-Scene Script

### Scene 1: The Problem & The Solution (0:00 - 0:25)
* **Visual:** Full-screen capture of the SkillForge Web Simulator (`http://localhost:8000`), showing the glowing Alexa Echo orb, waveform visualizer, and MCP Inspector.
* **Speaker:**
  > *"Every software engineer knows the pain of grinding LeetCode after an eight-hour workday. Staring at another screen is exhausting, but more importantly, real tech interviews aren't silent coding tests—they are verbal communication examinations. Candidates fail because they struggle to articulate algorithmic trade-offs out loud.*
  >
  > *Meet **SkillForge**, an AI-powered, voice-first DSA learning companion built for **Alexa+** using the **Model Context Protocol (MCP Spec 2025-11-25)** and **Amazon Bedrock**."*

---

### Scene 2: Live Voice Quizzing & Real-Time MCP Stream (0:25 - 1:00)
* **Visual:** Cursor clicks the glowing cyan **"Tap to Speak"** button. The orb glows electric blue and pulses.
* **Speaker (Spoken Voice Command):**
  > *"Alexa, quiz me on dynamic programming."*
* **Visual:** The SpeechRecognition transcribes the voice input into the conversation feed. The audio waveform pulses as Alexa's synthesized voice speaks back:
* **Alexa+ Voice Response:**
  > *"Here is your medium quiz on Dynamic Programming: Describe the 0/1 Knapsack recurrence relation and its space-optimized complexity."*
* **Visual:** Zoom in slightly on the **Right Panel (MCP Inspector)**.
* **Speaker:**
  > *"Notice what just happened behind the scenes: our self-hosted MCP server intercepted the voice intent, dispatched the `quiz_me` tool over Streamable HTTP, and logged the complete JSON-RPC 2.0 payload with 85 millisecond latency."*

---

### Scene 3: Socratic Spoken Answer Grading via Bedrock (1:00 - 1:40)
* **Visual:** Click "Tap to Speak" to verbally answer the question.
* **Speaker (Spoken Candidate Answer):**
  > *"For 0/1 knapsack, at each item we choose between taking it or skipping it: dp[w] = max(dp[w], dp[w - wt] + val). In a 1D array, we must iterate capacity backwards so we don't reuse the same item twice. This runs in O(N times W) time and O(W) space."*
* **Visual:** The **Socratic Answer Grader** card slides in with glowing green border.
* **Alexa+ Voice Response:**
  > *"Spot on! You nailed the recurrence relation, the take-or-skip decision, and iterating capacity backwards. Score: 95 out of 100."*
* **Speaker:**
  > *"Amazon Bedrock (Claude 3.5 Sonnet) evaluated my spoken response, verified all four core key points, and calculated my SuperMemo SM-2 quality grade of 5 out of 5 stars."*

---

### Scene 4: SuperMemo SM-2 Spaced Repetition & Streak Dashboard (1:40 - 2:10)
* **Visual:** Switch tabs on the right panel from **"MCP Inspector"** to **"SM-2 Deck"** and **"Progress & XP"**.
* **Speaker:**
  > *"Now for the magic: SkillForge combats the forgetting curve using the scientific SuperMemo SM-2 spaced repetition algorithm. Because I scored well, this flashcard's interval expanded to 6 days. If I had struggled, it would have reset to 1 day for immediate reinforcement.*
  >
  > *Over in the Progress tab, my daily study streak incremented to 4 days, I earned 25 XP, and unlocked the 'Memoization Master' badge—all stored persistently in Amazon DynamoDB."*

---

### Scene 5: AWS Architecture & Open Source (2:10 - 2:35)
* **Visual:** Quick cut to the Mermaid Architecture diagram and CloudFormation `template.yaml` in the GitHub repo.
* **Speaker:**
  > *"Under the hood, SkillForge is built for the cloud:
  > - **Amazon Bedrock:** Claude 3.5 Sonnet for Socratic grading and intuitive analogies.
  > - **Amazon DynamoDB:** Pay-per-request tables for user progress and flashcard retention.
  > - **AWS ECS Fargate:** Production-ready containerized deployment.
  > - **Open Source:** Fully open-source under the MIT License with 31 automated tests passing."*

---

### Scene 6: Conclusion (2:35 - 2:45)
* **Visual:** Back to the SkillForge glowing Alexa orb.
* **Speaker:**
  > *"SkillForge bridges the living room and cloud AI to turn any developer into an interview-ready engineer. Thank you to the Amazon Developer team, and we can't wait for your feedback!"*

---

## 💡 Top Tips for Recording
1. **Audio Quality:** Use a decent USB mic or headset mic so both your voice and Alexa's browser speech synthesis sound crisp and clean.
2. **Smooth Cursor:** Move your mouse smoothly between the mic button, the MCP Inspector, and the tabs.
3. **Pacing:** Keep your delivery energetic and confident. You have plenty of time within 2 minutes 45 seconds!
