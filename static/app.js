/**
 * SkillForge — Voice-First Simulated Alexa+ Client & Live MCP Inspector
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const state = {
    userId: 'hackathon_judge',
    ttsEnabled: true,
    isListening: false,
    currentQuestion: null, // holds currently active question for answering
    currentTopic: 'dynamic_programming',
    recognition: null,
    synth: window.speechSynthesis,
    xp: 0,
    level: 1,
  };

  // ── DOM References ───────────────────────────────────────────────────────
  const alexaRing = document.getElementById('alexaRing');
  const orbStatus = document.getElementById('orbStatus');
  const conversationFeed = document.getElementById('conversationFeed');
  const micBtn = document.getElementById('micBtn');
  const micText = document.getElementById('micText');
  const textInput = document.getElementById('textInput');
  const sendBtn = document.getElementById('sendBtn');
  const ttsToggleBtn = document.getElementById('ttsToggleBtn');
  const soundTestBtn = document.getElementById('soundTestBtn');
  const mcpLog = document.getElementById('mcpLog');
  const clearMcpLogBtn = document.getElementById('clearMcpLogBtn');
  const refreshDeckBtn = document.getElementById('refreshDeckBtn');
  const flashcardList = document.getElementById('flashcardList');
  const deckCount = document.getElementById('deckCount');

  // Grader DOM
  const graderCard = document.getElementById('graderCard');
  const graderScoreBadge = document.getElementById('graderScoreBadge');
  const graderStars = document.getElementById('graderStars');
  const graderFeedback = document.getElementById('graderFeedback');
  const graderKeyPoints = document.getElementById('graderKeyPoints');
  const graderNextReview = document.getElementById('graderNextReview');

  // Dashboard DOM
  const userXp = document.getElementById('userXp');
  const userLevel = document.getElementById('userLevel');
  const dashStreakDays = document.getElementById('dashStreakDays');
  const dashAccuracy = document.getElementById('dashAccuracy');
  const dashQuizzes = document.getElementById('dashQuizzes');
  const dashStorage = document.getElementById('dashStorage');
  const dashBadgesRow = document.getElementById('dashBadgesRow');
  const dashTopicsList = document.getElementById('dashTopicsList');
  const catalogGrid = document.getElementById('catalogGrid');

  // ── Initialize Speech Recognition (Web Speech API) ────────────────────────
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    state.recognition = new SpeechRecognition();
    state.recognition.continuous = false;
    state.recognition.interimResults = false;
    state.recognition.lang = 'en-US';

    state.recognition.onstart = () => {
      state.isListening = true;
      micBtn.classList.add('active');
      alexaRing.classList.add('listening');
      micText.textContent = 'Listening...';
      orbStatus.textContent = 'Listening to your voice...';
    };

    state.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      textInput.value = transcript;
      handleUserInput(transcript);
    };

    state.recognition.onerror = (err) => {
      console.warn('Speech recognition error:', err);
      resetVoiceUI();
    };

    state.recognition.onend = () => {
      resetVoiceUI();
    };
  } else {
    micBtn.disabled = true;
    micText.textContent = 'Mic N/A (Type below)';
  }

  function resetVoiceUI() {
    state.isListening = false;
    micBtn.classList.remove('active');
    alexaRing.classList.remove('listening');
    micText.textContent = 'Tap to Speak';
    orbStatus.textContent = '"Alexa, quiz me on dynamic programming"';
  }

  // ── Speech Synthesis (Alexa Voice Output) ─────────────────────────────────
  function speak(text) {
    if (!state.ttsEnabled || !state.synth) return;

    state.synth.cancel(); // cancel pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = state.synth.getVoices();
    const femaleVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Female')));
    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.onstart = () => {
      alexaRing.classList.add('speaking');
      orbStatus.textContent = 'Alexa is speaking...';
    };

    utterance.onend = () => {
      alexaRing.classList.remove('speaking');
      orbStatus.textContent = '"Alexa, quiz me on dynamic programming"';
    };

    utterance.onerror = () => {
      alexaRing.classList.remove('speaking');
    };

    state.synth.speak(utterance);
  }

  // ── Conversation Feed UI ──────────────────────────────────────────────────
  function addMessage(role, text, title) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}-msg`;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const headerTitle = title || (role === 'assistant' ? '🎙️ Alexa+' : '👤 You');

    msgDiv.innerHTML = `
      <div class="msg-header">
        <span class="msg-avatar">${headerTitle}</span>
        <span class="msg-time">${now}</span>
      </div>
      <div class="msg-body">${formatMarkdownLike(text)}</div>
    `;

    conversationFeed.appendChild(msgDiv);
    conversationFeed.scrollTop = conversationFeed.scrollHeight;
  }

  function formatMarkdownLike(str) {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:#1b2338;padding:2px 5px;border-radius:4px;font-family:monospace;color:#00c3ff;">$1</code>')
      .replace(/\n/g, '<br>');
  }

  // ── Live MCP Protocol Inspector Logger ─────────────────────────────────────
  function logMcpCall(method, params, result, latencyMs) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';

    const now = new Date().toLocaleTimeString();
    const isTool = method === 'tools/call';

    const rpcPayload = {
      jsonrpc: '2.0',
      id: Math.floor(Math.random() * 10000),
      method: method,
      params: params,
    };

    entry.innerHTML = `
      <div class="log-meta">
        <span class="log-badge ${isTool ? 'tool' : 'rpc'}">${isTool ? 'TOOL EXEC' : 'JSON-RPC 2.0'}</span>
        <span class="log-method">${method}${isTool && params?.name ? ': ' + params.name : ''}</span>
        <span class="log-time">${latencyMs ? latencyMs + 'ms • ' : ''}${now}</span>
      </div>
      <div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">MCP Request:</div>
      <pre class="log-json"><code>${JSON.stringify(rpcPayload, null, 2)}</code></pre>
      <div style="font-size:0.75rem; color:#94a3b8; margin-top:4px;">MCP Response (Claude 3.5 Bedrock & SM-2):</div>
      <pre class="log-json"><code>${JSON.stringify(result, null, 2)}</code></pre>
    `;

    mcpLog.insertBefore(entry, mcpLog.firstChild);
  }

  // ── Core MCP Tool Invoker ─────────────────────────────────────────────────
  async function callMcpTool(toolName, args = {}) {
    const startTime = performance.now();
    try {
      const res = await fetch('/mcp/tools/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: toolName, arguments: args }),
      });
      const data = await res.json();
      const latencyMs = Math.round(performance.now() - startTime);

      let rawResult = data.raw;
      if (!rawResult && data.content && data.content[0]?.text) {
        try {
          rawResult = JSON.parse(data.content[0].text);
        } catch {
          rawResult = data.content[0].text;
        }
      }

      logMcpCall('tools/call', { name: toolName, arguments: args }, rawResult, latencyMs);
      return rawResult;
    } catch (err) {
      console.error('MCP Tool Error:', err);
      logMcpCall('tools/call', { name: toolName, arguments: args }, { error: String(err) }, 0);
      return { error: String(err) };
    }
  }

  // ── Intent Parser & Dispatcher ────────────────────────────────────────────
  async function handleUserInput(text) {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    const lower = cleanText.toLowerCase();

    addMessage('user', cleanText);
    textInput.value = '';

    // If currently awaiting an answer for an active quiz question:
    if (state.currentQuestion) {
      const qid = state.currentQuestion.id;
      addMessage('assistant', `Evaluating your answer with Amazon Bedrock...`);

      const evalResult = await callMcpTool('evaluate_answer', {
        question_id: qid,
        answer: cleanText,
        user_id: state.userId,
      });

      renderEvaluation(evalResult);
      state.currentQuestion = null;
      refreshDashboards();
      return;
    }

    // 1. Daily Challenge
    if (lower.includes('daily') || lower.includes('challenge')) {
      const res = await callMcpTool('daily_challenge', { user_id: state.userId });
      const q = res.question;
      state.currentQuestion = q;
      const speech = `Here is today's Daily Challenge on ${res.topic_display}: ${q.question}`;
      addMessage('assistant', `<strong>📅 Daily Challenge (${res.difficulty.toUpperCase()}):</strong><br>${q.question}<br><br><em>💡 Hint: ${q.hint}</em><br><br>👉 <strong>Speak or type your answer!</strong>`);
      speak(speech);
      return;
    }

    // 2. Check Streak & Gamification
    if (lower.includes('streak') || lower.includes('level') || lower.includes('progress') || lower.includes('xp')) {
      const res = await callMcpTool('check_streak', { user_id: state.userId });
      const speech = `You have a ${res.streak_days} day streak at Level ${res.level}, ${res.level_title}, with ${res.xp} XP and ${res.accuracy} percent accuracy.`;
      addMessage('assistant', `🔥 <strong>Streak Status:</strong> ${res.streak_days} days<br>🏆 <strong>Level:</strong> ${res.level} (${res.level_title})<br>⭐ <strong>Accuracy:</strong> ${res.accuracy}%<br>💎 <strong>XP:</strong> ${res.xp}<br>📚 <strong>Total Quizzes:</strong> ${res.total_quizzes}`);
      speak(speech);
      refreshDashboards();
      return;
    }

    // 3. SM-2 Spaced Repetition Suggestion
    if (lower.includes('suggest') || lower.includes('next') || lower.includes('review')) {
      const res = await callMcpTool('suggest_next', { user_id: state.userId });
      if (res.type === 'spaced_repetition_review') {
        state.currentQuestion = { id: res.question_id, question: res.question };
        const speech = `Time for your spaced repetition review on ${res.topic}: ${res.question}`;
        addMessage('assistant', `🧠 <strong>Spaced Repetition Due (SM-2):</strong><br>${res.question}<br><br><em>Overdue by ${res.overdue_days} days. Speak or type your answer!</em>`);
        speak(speech);
      } else {
        const speech = `All reviews are complete! How about exploring ${res.topic_display}?`;
        addMessage('assistant', `🎯 <strong>Recommendation:</strong> ${res.reason}<br>Topic: <strong>${res.topic_display}</strong>`);
        speak(speech);
      }
      return;
    }

    // 4. Explain Concept
    if (lower.startsWith('explain') || lower.includes('what is') || lower.includes('how does')) {
      let topic = cleanText.replace(/explain/i, '').replace(/what is/i, '').replace(/how does/i, '').replace(/work/i, '').trim();
      if (!topic) topic = state.currentTopic;

      addMessage('assistant', `Asking Bedrock Claude 3.5 to explain ${topic}...`);
      const res = await callMcpTool('explain_concept', {
        topic: topic,
        user_id: state.userId,
        style: 'analogy',
      });

      addMessage('assistant', `💡 <strong>Concept Explanation:</strong><br>${res.explanation}`);
      speak(res.explanation);
      refreshDashboards();
      return;
    }

    // 5. Mock Interview
    if (lower.includes('mock') || lower.includes('interview')) {
      const res = await callMcpTool('mock_interview', {
        company: 'Amazon',
        topic: state.currentTopic,
        user_id: state.userId,
      });
      const sc = res.scenario;
      addMessage('assistant', `🏢 <strong>Mock Interview (${res.company}):</strong><br>${sc.question}<br><br><em>Follow-up:</em> ${sc.follow_up}`);
      speak(res.voice_prompt);
      return;
    }

    // 6. Socratic Hint
    if (lower.includes('hint') && state.currentQuestion) {
      const res = await callMcpTool('get_hint', { question_id: state.currentQuestion.id });
      addMessage('assistant', `💡 <strong>Hint:</strong> ${res.hint}`);
      speak(res.voice_prompt);
      return;
    }

    // 7. Default: Start a Quiz on recognized topic or current topic
    const topicKeywords = [
      'arrays', 'linked_lists', 'trees', 'graphs', 'dynamic_programming',
      'dp', 'sorting', 'searching', 'stacks', 'queues', 'hash', 'strings',
    ];
    let matchedTopic = 'dynamic_programming';
    for (const kw of topicKeywords) {
      if (lower.includes(kw)) {
        matchedTopic = kw === 'dp' ? 'dynamic_programming' : kw === 'stacks' || kw === 'queues' ? 'stacks_queues' : kw === 'hash' ? 'hash_tables' : kw;
        break;
      }
    }

    let diff = 'medium';
    if (lower.includes('easy')) diff = 'easy';
    if (lower.includes('hard')) diff = 'hard';

    state.currentTopic = matchedTopic;
    addMessage('assistant', `Generating a ${diff} quiz on ${matchedTopic.replace('_', ' ')}...`);

    const quizRes = await callMcpTool('quiz_me', {
      topic: matchedTopic,
      difficulty: diff,
      user_id: state.userId,
      num_questions: 1,
    });

    if (quizRes.questions && quizRes.questions.length > 0) {
      const q = quizRes.questions[0];
      state.currentQuestion = q;
      const speech = `Quiz question on ${quizRes.topic_display}: ${q.question}`;
      addMessage('assistant', `⚡ <strong>Quiz (${quizRes.topic_display} - ${diff.toUpperCase()}):</strong><br>${q.question}<br><br><em>Voice tip: ${q.voice_tip}</em><br><br>👉 <strong>Speak or type your answer to receive AI Socratic feedback!</strong>`);
      speak(speech);
      refreshDashboards();
    }
  }

  // ── Render Socratic Grader Results ─────────────────────────────────────────
  function renderEvaluation(res) {
    if (res.error) {
      addMessage('assistant', `Error evaluating answer: ${res.error}`);
      return;
    }

    graderCard.classList.remove('hidden');
    graderScoreBadge.textContent = `${res.score} / 100`;
    graderStars.textContent = res.quality_rating || '⭐⭐⭐⭐☆';
    graderFeedback.textContent = res.feedback;

    // Key points tag rendering
    graderKeyPoints.innerHTML = '';
    const points = res.key_points || [];
    const missed = new Set(res.missed_points || []);

    points.forEach(pt => {
      const tag = document.createElement('span');
      const isMatched = !missed.has(pt);
      tag.className = `kp-tag ${isMatched ? 'matched' : ''}`;
      tag.textContent = `${isMatched ? '✓' : '✗'} ${pt}`;
      graderKeyPoints.appendChild(tag);
    });

    if (res.sm2_state) {
      graderNextReview.textContent = `Next review in ${res.sm2_state.interval} day(s) • EF: ${res.sm2_state.ease_factor}`;
    }

    const speech = `${res.feedback} Score: ${res.score} out of 100.`;
    addMessage('assistant', `🎯 <strong>Evaluation Score: ${res.score}/100 (${res.quality_rating})</strong><br>${res.feedback}<br><br><em>Model Answer:</em> ${res.correct_answer}<br><em>XP Earned:</em> +${res.xp_earned} XP`);
    speak(speech);
  }

  // ── Refresh Dashboards & SM-2 Deck ────────────────────────────────────────
  async function refreshDashboards() {
    try {
      // 1. Streak & Gamification
      const streakRes = await fetch(`/api/streak?user_id=${state.userId}`);
      const sData = await streakRes.json();

      userXp.textContent = `${sData.xp} XP`;
      userLevel.textContent = `Lvl ${sData.level}`;
      dashStreakDays.textContent = sData.streak_days;
      dashAccuracy.textContent = `${sData.accuracy}%`;
      dashQuizzes.textContent = sData.total_quizzes;
      dashStorage.textContent = sData.storage_engine;

      // Badges
      dashBadgesRow.innerHTML = '';
      if (sData.badges && sData.badges.length > 0) {
        sData.badges.forEach(b => {
          const item = document.createElement('div');
          item.className = 'badge-item';
          item.title = b.desc;
          item.innerHTML = `<span>${b.icon}</span> <span>${b.name}</span>`;
          dashBadgesRow.appendChild(item);
        });
      } else {
        dashBadgesRow.innerHTML = '<span class="no-badge-hint">Complete study sessions to earn badges!</span>';
      }

      // Topics Progress List
      dashTopicsList.innerHTML = '';
      const topics = sData.topics_studied || {};
      for (const [top, count] of Object.entries(topics)) {
        const row = document.createElement('div');
        row.className = 'topic-row';
        row.innerHTML = `<span>${top.replace('_', ' ')}</span><strong>${count} sessions</strong>`;
        dashTopicsList.appendChild(row);
      }

      // 2. SM-2 Flashcard Deck
      const flashRes = await fetch(`/api/flashcards?user_id=${state.userId}`);
      const fData = await flashRes.json();
      deckCount.textContent = fData.total;

      flashcardList.innerHTML = '';
      if (fData.flashcards && fData.flashcards.length > 0) {
        fData.flashcards.forEach(card => {
          const cardEl = document.createElement('div');
          cardEl.className = 'flashcard-card';
          cardEl.innerHTML = `
            <div class="card-top">
              <span class="card-topic">${card.topic.replace('_', ' ')}</span>
              <span class="card-sm2-badge">Interval: ${card.interval}d | EF: ${card.ease_factor}</span>
            </div>
            <div class="card-question">${card.question}</div>
            <div class="card-answer"><strong>Model Answer:</strong> ${card.answer}</div>
          `;
          flashcardList.appendChild(cardEl);
        });
      } else {
        flashcardList.innerHTML = '<p class="empty-state">No flashcards reviewed yet. Take a quiz to populate your SM-2 spaced repetition deck!</p>';
      }
    } catch (e) {
      console.warn('Dashboard refresh error:', e);
    }
  }

  // ── Load 10 Topics Catalog ────────────────────────────────────────────────
  async function loadTopicsCatalog() {
    try {
      const res = await fetch('/api/topics');
      const data = await res.json();
      catalogGrid.innerHTML = '';

      for (const [key, t] of Object.entries(data.topics || {})) {
        const card = document.createElement('div');
        card.className = 'catalog-card';
        card.innerHTML = `
          <div class="catalog-info">
            <span class="catalog-icon">${t.icon}</span>
            <div>
              <div class="catalog-title">${t.name}</div>
              <div class="catalog-desc">${t.description}</div>
            </div>
          </div>
          <span class="catalog-count">${t.total_questions} Qs</span>
        `;
        card.addEventListener('click', () => {
          handleUserInput(`quiz me on ${key}`);
        });
        catalogGrid.appendChild(card);
      }
    } catch (e) {
      console.warn('Could not load topics:', e);
    }
  }

  // ── Event Listeners ───────────────────────────────────────────────────────
  micBtn.addEventListener('click', () => {
    if (!state.recognition) return;
    if (state.isListening) {
      state.recognition.stop();
    } else {
      state.recognition.start();
    }
  });

  sendBtn.addEventListener('click', () => {
    handleUserInput(textInput.value);
  });

  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleUserInput(textInput.value);
    }
  });

  ttsToggleBtn.addEventListener('click', () => {
    state.ttsEnabled = !state.ttsEnabled;
    ttsToggleBtn.textContent = state.ttsEnabled ? '🔊 Voice: On' : '🔇 Voice: Off';
    if (!state.ttsEnabled && state.synth) state.synth.cancel();
  });

  soundTestBtn.addEventListener('click', () => {
    speak('Alexa voice synthesis is active. Welcome to SkillForge on Amazon Bedrock.');
  });

  clearMcpLogBtn.addEventListener('click', () => {
    mcpLog.innerHTML = '<div style="color:#64748b; font-size:0.8rem; text-align:center; padding:15px;">Log cleared. Trigger any tool to inspect JSON-RPC 2.0 messages.</div>';
  });

  refreshDeckBtn.addEventListener('click', refreshDashboards);

  // Quick Chips
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'daily') handleUserInput('daily challenge');
      else if (action === 'quiz-dp') handleUserInput('quiz me on dynamic programming');
      else if (action === 'explain-kadane') handleUserInput("explain Kadane's algorithm");
      else if (action === 'suggest') handleUserInput('suggest next flashcard');
      else if (action === 'streak') handleUserInput('check my streak');
      else if (action === 'mock') handleUserInput('mock interview');
    });
  });

  // Tab Navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // Initial Load
  loadTopicsCatalog();
  refreshDashboards();
});
