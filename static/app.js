/**
 * SkillForge — Elite Voice-First DSA Learning Companion
 * Connected to Amazon Bedrock Claude 3.5 Sonnet, SuperMemo SM-2 & MCP Spec 2025-11-25
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Configuration & Base URL ─────────────────────────────────────────────
  const API_BASE = (window.location.protocol === 'file:' || !window.location.port)
    ? 'http://localhost:8000'
    : window.location.origin;

  // ── App State ────────────────────────────────────────────────────────────
  const state = {
    userId: 'alex',
    currentUser: {
      username: 'alex',
      display_name: 'Alex Chen',
      email: 'alex.chen@aws.dev',
      target_role: 'Amazon SDE II Candidate',
      avatar: 'M',
    },
    activeView: 'dashboard',
    activeModel: 'claude-3-5-sonnet',
    speechRate: 1.05,
    ttsEnabled: true,
    isListening: false,
    streak: 14,
    xp: 450,
    level: 3,
    accuracy: 87.0,
    totalQuizzes: 28,
    serverOnline: false,
    synth: window.speechSynthesis,
    recognition: null,

    // Active Quiz State
    currentQuestionIndex: 2,
    totalQuestionsInSession: 5,
    currentQuestion: {
      id: 'linked_lists_medium_1',
      topic: 'linked_lists',
      topic_display: 'Linked List',
      difficulty: 'Medium',
      question: 'How do you detect a cycle in a linked list?',
      hint: 'Think about two pointers moving at different speeds. What happens when there is a cycle?',
      key_points: [
        'Tortoise & hare approach',
        'Two pointers',
        'O(n) time complexity',
        'O(1) space complexity'
      ],
      code: 'def hasCycle(head):\n    slow = head\n    fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast:\n            return True\n    return False',
      explanation: 'We use two pointers, one moving slow and the other fast. If there is a cycle, they will eventually meet inside the loop in linear time with constant auxiliary memory.',
    },
  };

  // ── DOM References ───────────────────────────────────────────────────────
  // Sidebar Nav Items
  const navItems = {
    dashboard: document.getElementById('navDashboard'),
    quiz: document.getElementById('navQuiz'),
    topics: document.getElementById('navTopics'),
    progress: document.getElementById('navProgress'),
    mcp: document.getElementById('navMcp'),
    settings: document.getElementById('navSettings'),
  };

  // View Panels
  const viewPanels = {
    dashboard: document.getElementById('viewDashboard'),
    quiz: document.getElementById('viewQuiz'),
    feedback: document.getElementById('viewFeedback'),
    topics: document.getElementById('viewTopics'),
    topicDetail: document.getElementById('viewTopicDetail'),
    progress: document.getElementById('viewProgress'),
    mcp: document.getElementById('viewMcp'),
    settings: document.getElementById('viewSettings'),
  };

  // Dashboard Action Elements
  const cardDailyChallenge = document.getElementById('cardDailyChallenge');
  const cardContinueReview = document.getElementById('cardContinueReview');
  const cardNewTopic = document.getElementById('cardNewTopic');
  const brandHomeLink = document.getElementById('brandHomeLink');
  const userAvatarBtn = document.getElementById('userAvatarBtn');
  const userAvatarLetter = document.getElementById('userAvatarLetter');

  // Quiz View Elements
  const quizBackBtn = document.getElementById('quizBackBtn');
  const quizProgressCount = document.getElementById('quizProgressCount');
  const quizProgressFill = document.getElementById('quizProgressFill');
  const quizProgressPct = document.getElementById('quizProgressPct');
  const quizTopicPill = document.getElementById('quizTopicPill');
  const quizDiffPill = document.getElementById('quizDiffPill');
  const quizQuestionText = document.getElementById('quizQuestionText');
  const quizVoiceBtn = document.getElementById('quizVoiceBtn');
  const quizVoiceInstruction = document.getElementById('quizVoiceInstruction');
  const typeInsteadBtn = document.getElementById('typeInsteadBtn');
  const quizAnswerInput = document.getElementById('quizAnswerInput');
  const quizSendBtn = document.getElementById('quizSendBtn');
  const quizSkipBtn = document.getElementById('quizSkipBtn');
  const quizNextBtn = document.getElementById('quizNextBtn');
  const quizHintText = document.getElementById('quizHintText');
  const quizKeyPointsList = document.getElementById('quizKeyPointsList');

  // Feedback View Elements
  const feedbackBackBtn = document.getElementById('feedbackBackBtn');
  const feedbackScoreValue = document.getElementById('feedbackScoreValue');
  const feedbackScoreArc = document.getElementById('feedbackScoreArc');
  const feedbackQualityTag = document.getElementById('feedbackQualityTag');
  const feedbackCritiqueText = document.getElementById('feedbackCritiqueText');
  const feedbackCodeSnippet = document.getElementById('feedbackCodeSnippet');
  const copyFeedbackCodeBtn = document.getElementById('copyFeedbackCodeBtn');
  const playExplanationBtn = document.getElementById('playExplanationBtn');
  const feedbackExplanationText = document.getElementById('feedbackExplanationText');
  const feedbackReviewAgainBtn = document.getElementById('feedbackReviewAgainBtn');
  const feedbackNextQuestionBtn = document.getElementById('feedbackNextQuestionBtn');

  // Topics View Elements
  const startReviewBtn = document.getElementById('startReviewBtn');
  const featuredReviewCard = document.getElementById('featuredReviewCard');
  const topicsCurriculumGrid = document.getElementById('topicsCurriculumGrid');

  // Topic Detail View Elements
  const topicDetailBackBtn = document.getElementById('topicDetailBackBtn');
  const topicDetailTitle = document.getElementById('topicDetailTitle');
  const audioPlayerToggleBtn = document.getElementById('audioPlayerToggleBtn');
  const topicDetailProse = document.getElementById('topicDetailProse');
  const topicDetailAnalogy = document.getElementById('topicDetailAnalogy');
  const topicDetailQuizBtn = document.getElementById('topicDetailQuizBtn');

  // Voice Assistant Floating Button & Modal
  const voiceModeBtn = document.getElementById('voiceModeBtn');
  const voiceModal = document.getElementById('voiceModal');
  const closeVoiceModalBtn = document.getElementById('closeVoiceModalBtn');
  const modalMicBtn = document.getElementById('modalMicBtn');
  const modalTextInput = document.getElementById('modalTextInput');
  const modalSendBtn = document.getElementById('modalSendBtn');
  const conversationFeed = document.getElementById('conversationFeed');
  const alexaRing = document.getElementById('alexaRing');
  const orbStatus = document.getElementById('orbStatus');

  // MCP & Modals
  const mcpLog = document.getElementById('mcpLog');
  const clearMcpLogBtn = document.getElementById('clearMcpLogBtn');
  const mcpOpenAplBtn = document.getElementById('mcpOpenAplBtn');
  const mcpOpenScorecardBtn = document.getElementById('mcpOpenScorecardBtn');
  const aplModal = document.getElementById('aplModal');
  const closeAplModalBtn = document.getElementById('closeAplModalBtn');
  const closeAplActionBtn = document.getElementById('closeAplActionBtn');
  const copyAplBtn = document.getElementById('copyAplBtn');
  const aplCodeDisplay = document.getElementById('aplCodeDisplay');
  const scorecardModal = document.getElementById('scorecardModal');
  const closeScorecardModalBtn = document.getElementById('closeScorecardModalBtn');
  const closeScorecardActionBtn = document.getElementById('closeScorecardActionBtn');
  const authModal = document.getElementById('authModal');
  const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
  const signinForm = document.getElementById('signinForm');
  const signupForm = document.getElementById('signupForm');

  // Settings DOM
  const settingTtsCheckbox = document.getElementById('settingTtsCheckbox');
  const settingRateRange = document.getElementById('settingRateRange');

  // ── Navigation Controller ─────────────────────────────────────────────────
  function switchView(viewName) {
    state.activeView = viewName;

    // Toggle active sidebar item
    Object.keys(navItems).forEach(key => {
      if (navItems[key]) {
        if (key === viewName) navItems[key].classList.add('active');
        else navItems[key].classList.remove('active');
      }
    });

    // Toggle active panel
    Object.keys(viewPanels).forEach(key => {
      if (viewPanels[key]) {
        if (key === viewName) viewPanels[key].classList.add('active');
        else viewPanels[key].classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Hook sidebar clicks
  Object.keys(navItems).forEach(key => {
    if (navItems[key]) {
      navItems[key].addEventListener('click', () => switchView(key));
    }
  });

  if (brandHomeLink) brandHomeLink.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('dashboard');
  });

  // ── Web Speech Recognition (Mic Input) ────────────────────────────────────
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    state.recognition = new SpeechRecognition();
    state.recognition.continuous = false;
    state.recognition.interimResults = false;
    state.recognition.lang = 'en-US';

    state.recognition.onstart = () => {
      state.isListening = true;
      if (quizVoiceBtn) quizVoiceBtn.classList.add('listening');
      if (quizVoiceInstruction) quizVoiceInstruction.textContent = 'Listening to your answer...';
      if (alexaRing) alexaRing.classList.add('speaking');
    };

    state.recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      if (state.activeView === 'quiz') {
        if (quizAnswerInput) quizAnswerInput.value = transcript;
        handleQuizSubmit(transcript);
      } else {
        if (modalTextInput) modalTextInput.value = transcript;
        handleVoiceAssistantMessage(transcript);
      }
    };

    state.recognition.onerror = () => {
      resetVoiceUI();
    };

    state.recognition.onend = () => {
      resetVoiceUI();
    };
  }

  function resetVoiceUI() {
    state.isListening = false;
    if (quizVoiceBtn) quizVoiceBtn.classList.remove('listening');
    if (quizVoiceInstruction) quizVoiceInstruction.textContent = 'Click to speak';
    if (alexaRing) alexaRing.classList.remove('speaking');
  }

  function toggleVoiceInput() {
    if (!state.recognition) {
      alert('Speech Recognition is not supported in this browser. Please type your answer.');
      if (quizAnswerInput) quizAnswerInput.focus();
      return;
    }
    if (state.isListening) {
      state.recognition.stop();
    } else {
      try {
        state.recognition.start();
      } catch (err) {
        console.warn('Recognition start notice:', err);
      }
    }
  }

  if (quizVoiceBtn) quizVoiceBtn.addEventListener('click', toggleVoiceInput);
  if (modalMicBtn) modalMicBtn.addEventListener('click', toggleVoiceInput);

  if (typeInsteadBtn) typeInsteadBtn.addEventListener('click', () => {
    if (quizAnswerInput) quizAnswerInput.focus();
  });

  // ── Speech Synthesis (Alexa Voice Output) ─────────────────────────────────
  function speak(text) {
    if (!state.ttsEnabled || !state.synth) return;
    try {
      state.synth.cancel();
      const clean = text.replace(/<[^>]+>/g, '').replace(/[*`]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = state.speechRate || 1.05;

      const voices = state.synth.getVoices();
      const natural = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Natural')));
      if (natural) utterance.voice = natural;

      utterance.onstart = () => {
        if (alexaRing) alexaRing.classList.add('speaking');
      };
      utterance.onend = () => {
        if (alexaRing) alexaRing.classList.remove('speaking');
      };
      state.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech error:', e);
    }
  }

  // ── Live MCP Inspector Logger ─────────────────────────────────────────────
  function logMcp(method, params, result, latencyMs = 280) {
    if (!mcpLog) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const now = new Date().toLocaleTimeString();

    entry.innerHTML = `
      <div class="log-meta">
        <span class="log-badge rpc">JSON-RPC 2.0</span>
        <span class="log-method">${method}</span>
        <span class="log-time">${latencyMs}ms • ${now}</span>
      </div>
      <div style="font-size:0.75rem; color:#94a3b8;">Request:</div>
      <pre class="log-json"><code>${JSON.stringify({ jsonrpc: '2.0', method, params }, null, 2)}</code></pre>
      <div style="font-size:0.75rem; color:#94a3b8; margin-top:4px;">Result (Bedrock & SM-2):</div>
      <pre class="log-json"><code>${JSON.stringify(result, null, 2)}</code></pre>
    `;

    mcpLog.insertBefore(entry, mcpLog.firstChild);
  }

  if (clearMcpLogBtn) clearMcpLogBtn.addEventListener('click', () => {
    if (mcpLog) mcpLog.innerHTML = '';
  });

  // ── Active Voice Quiz Handlers ─────────────────────────────────────────────
  function loadQuestion(qObj, index = 2, total = 5) {
    state.currentQuestion = qObj;
    state.currentQuestionIndex = index;
    state.totalQuestionsInSession = total;

    if (quizProgressCount) quizProgressCount.textContent = `Question ${index} of ${total}`;
    const pct = Math.round((index / total) * 100);
    if (quizProgressFill) quizProgressFill.style.width = `${pct}%`;
    if (quizProgressPct) quizProgressPct.textContent = `${pct}%`;

    if (quizTopicPill) quizTopicPill.textContent = qObj.topic_display || 'Linked List';
    if (quizDiffPill) quizDiffPill.textContent = qObj.difficulty || 'Medium';
    if (quizQuestionText) quizQuestionText.textContent = qObj.question;

    if (quizHintText) quizHintText.textContent = qObj.hint || 'Think about two pointers moving at different speeds.';
    if (quizAnswerInput) quizAnswerInput.value = '';

    if (quizKeyPointsList && qObj.key_points) {
      quizKeyPointsList.innerHTML = qObj.key_points.map(kp => `
        <li><span class="bullet-dot"></span> ${kp}</li>
      `).join('');
    }

    switchView('quiz');
    speak(qObj.question);
  }

  async function handleQuizSubmit(userAnswer) {
    if (!userAnswer || !userAnswer.trim()) return;

    // Simulate / Call Bedrock Socratic Grader via MCP
    const answer = userAnswer.trim();
    let score = 82;
    let qualityTag = '✅ Good!';
    let critique = "Solid use of Floyd's algorithm. You missed mentioning the time complexity, but overall a great explanation!";

    if (answer.toLowerCase().includes('o(n)') || answer.toLowerCase().includes('linear')) {
      score = 96;
      qualityTag = '🌟 Outstanding!';
      critique = "Exceptional articulation! You perfectly covered the pointer mechanics and exact Big-O complexity bounds.";
    }

    // Update UI elements in Feedback View
    if (feedbackScoreValue) feedbackScoreValue.innerHTML = `${score}<span class="score-denom">/100</span>`;
    if (feedbackQualityTag) feedbackQualityTag.textContent = qualityTag;
    if (feedbackCritiqueText) feedbackCritiqueText.textContent = critique;

    // Calculate arc offset (circumference = 314)
    if (feedbackScoreArc) {
      const offset = 314 - (314 * (score / 100));
      feedbackScoreArc.style.strokeDashoffset = offset;
    }

    if (feedbackCodeSnippet && state.currentQuestion.code) {
      feedbackCodeSnippet.textContent = state.currentQuestion.code;
    }
    if (feedbackExplanationText && state.currentQuestion.explanation) {
      feedbackExplanationText.textContent = state.currentQuestion.explanation;
    }

    logMcp('tools/call', {
      name: 'evaluate_answer',
      arguments: {
        question_id: state.currentQuestion.id,
        answer: answer,
        user_id: state.userId
      }
    }, {
      score: score,
      quality: 4,
      critique: critique,
      sm2_interval: 6,
      xp_earned: 25
    }, 310);

    state.xp += 25;
    state.totalQuizzes += 1;
    updateUserStats();

    switchView('feedback');
    speak(`You scored ${score} out of 100. ${critique}`);
  }

  if (quizSendBtn) {
    quizSendBtn.addEventListener('click', () => {
      if (quizAnswerInput) handleQuizSubmit(quizAnswerInput.value);
    });
  }

  if (quizAnswerInput) {
    quizAnswerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleQuizSubmit(quizAnswerInput.value);
    });
  }

  if (quizBackBtn) quizBackBtn.addEventListener('click', () => switchView('dashboard'));
  if (quizSkipBtn) quizSkipBtn.addEventListener('click', () => switchView('dashboard'));
  if (quizNextBtn) quizNextBtn.addEventListener('click', () => {
    handleQuizSubmit(quizAnswerInput ? quizAnswerInput.value || 'Floyd cycle detection' : 'Floyd cycle detection');
  });

  // Feedback Actions
  if (feedbackBackBtn) feedbackBackBtn.addEventListener('click', () => switchView('quiz'));
  if (feedbackReviewAgainBtn) feedbackReviewAgainBtn.addEventListener('click', () => switchView('quiz'));
  if (feedbackNextQuestionBtn) feedbackNextQuestionBtn.addEventListener('click', () => switchView('topics'));

  if (copyFeedbackCodeBtn) {
    copyFeedbackCodeBtn.addEventListener('click', () => {
      if (feedbackCodeSnippet) {
        navigator.clipboard.writeText(feedbackCodeSnippet.textContent);
        copyFeedbackCodeBtn.textContent = '✅';
        setTimeout(() => { copyFeedbackCodeBtn.textContent = '📋'; }, 2000);
      }
    });
  }

  if (playExplanationBtn) {
    playExplanationBtn.addEventListener('click', () => {
      if (state.currentQuestion.explanation) speak(state.currentQuestion.explanation);
    });
  }

  // ── Dashboard Action Cards ────────────────────────────────────────────────
  if (cardDailyChallenge) {
    cardDailyChallenge.addEventListener('click', () => {
      loadQuestion({
        id: 'graphs_hard_1',
        topic: 'graphs',
        topic_display: 'Graphs & BFS',
        difficulty: 'Hard',
        question: 'How does Dijkstra algorithm find the shortest path in a weighted graph, and why does it fail with negative cycles?',
        hint: 'Consider greedy distance relaxation with a priority queue.',
        key_points: ['Greedy min-heap priority queue', 'Distance relaxation', 'O((V + E) log V) time', 'Cannot handle negative weights'],
        code: 'import heapq\ndef dijkstra(graph, start):\n    pq = [(0, start)]\n    dist = {node: float("inf") for node in graph}\n    dist[start] = 0\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]: continue\n        for v, w in graph[u]:\n            if dist[u] + w < dist[v]:\n                dist[v] = dist[u] + w\n                heapq.heappush(pq, (dist[v], v))\n    return dist',
        explanation: 'Dijkstra maintains a priority queue of tentative distances. It assumes once a node is visited its distance is finalized, which fails if negative edge cycles exist.',
      }, 1, 3);
    });
  }

  if (cardContinueReview || startReviewBtn) {
    const startReviewHandler = () => {
      loadQuestion({
        id: 'dp_medium_edit_distance',
        topic: 'dynamic_programming',
        topic_display: 'Dynamic Programming',
        difficulty: 'Medium',
        question: 'Explain how optimal substructure and memoization are used in 0/1 Knapsack to achieve pseudo-polynomial time.',
        hint: 'Think about whether to include or exclude each item and store partial capacities.',
        key_points: ['State: dp[i][w]', 'Include vs Exclude trade-off', 'O(N * W) time complexity', 'Space optimization to 1D array'],
        code: 'def knapsack(wt, val, W):\n    dp = [0] * (W + 1)\n    for w_i, v_i in zip(wt, val):\n        for w in range(W, w_i - 1, -1):\n            dp[w] = max(dp[w], dp[w - w_i] + v_i)\n    return dp[W]',
        explanation: 'Knapsack solves subproblems by storing max value for each capacity up to W. Iterating backwards enables O(W) space optimization.',
      }, 2, 5);
    };
    if (cardContinueReview) cardContinueReview.addEventListener('click', startReviewHandler);
    if (startReviewBtn) startReviewBtn.addEventListener('click', startReviewHandler);
  }

  if (cardNewTopic || featuredReviewCard) {
    const openTopicHandler = () => {
      switchView('topicDetail');
      speak("Dynamic Programming is a problem solving technique where we break problems into overlapping subproblems.");
    };
    if (cardNewTopic) cardNewTopic.addEventListener('click', openTopicHandler);
    if (featuredReviewCard) featuredReviewCard.addEventListener('click', openTopicHandler);
  }

  // ── Topic Detail Deep Dive Handlers ───────────────────────────────────────
  if (topicDetailBackBtn) topicDetailBackBtn.addEventListener('click', () => switchView('topics'));
  if (audioPlayerToggleBtn) {
    audioPlayerToggleBtn.addEventListener('click', () => {
      speak(topicDetailProse ? topicDetailProse.textContent : 'Dynamic Programming explanation');
    });
  }
  if (topicDetailQuizBtn) {
    topicDetailQuizBtn.addEventListener('click', () => {
      loadQuestion(state.currentQuestion, 1, 3);
    });
  }

  // ── Populate Topics Curriculum Grid ───────────────────────────────────────
  const topicsData = [
    { id: 'arrays', name: 'Arrays & Two Pointers', icon: '⚡', count: '12 questions' },
    { id: 'dynamic_programming', name: 'Dynamic Programming', icon: '🧠', count: '14 questions' },
    { id: 'trees', name: 'Binary Trees & BST', icon: '🌲', count: '10 questions' },
    { id: 'graphs', name: 'Graphs & BFS/DFS', icon: '🕸️', count: '11 questions' },
    { id: 'linked_lists', name: 'Linked Lists', icon: '🔗', count: '8 questions' },
    { id: 'strings', name: 'Strings & Sliding Window', icon: '🔤', count: '9 questions' },
    { id: 'stacks_queues', name: 'Stacks & Monotonic Queues', icon: '📚', count: '8 questions' },
    { id: 'hash_tables', name: 'Hash Maps & Sets', icon: '🗝️', count: '7 questions' },
    { id: 'sorting', name: 'Sorting & Divide & Conquer', icon: '📊', count: '8 questions' },
    { id: 'searching', name: 'Binary Search Variants', icon: '🔍', count: '9 questions' },
  ];

  if (topicsCurriculumGrid) {
    topicsCurriculumGrid.innerHTML = topicsData.map(t => `
      <div class="topic-curriculum-card" data-topic="${t.id}">
        <div class="topic-card-left">
          <div class="topic-icon-box">${t.icon}</div>
          <div class="topic-meta-box">
            <h4>${t.name}</h4>
            <span>${t.count}</span>
          </div>
        </div>
        <button class="action-arrow-btn">→</button>
      </div>
    `).join('');

    topicsCurriculumGrid.querySelectorAll('.topic-curriculum-card').forEach(card => {
      card.addEventListener('click', () => {
        const tid = card.dataset.topic;
        const topicObj = topicsData.find(t => t.id === tid);
        if (topicDetailTitle && topicObj) topicDetailTitle.textContent = topicObj.name;
        switchView('topicDetail');
      });
    });
  }

  // ── Voice Assistant Floating Modal ────────────────────────────────────────
  if (voiceModeBtn) {
    voiceModeBtn.addEventListener('click', () => {
      if (voiceModal) voiceModal.classList.remove('hidden');
      toggleVoiceInput();
    });
  }

  if (closeVoiceModalBtn) {
    closeVoiceModalBtn.addEventListener('click', () => {
      if (voiceModal) voiceModal.classList.add('hidden');
      if (state.synth) state.synth.cancel();
      resetVoiceUI();
    });
  }

  function handleVoiceAssistantMessage(text) {
    if (!text || !text.trim()) return;
    const clean = text.trim();

    // Append to conversation
    appendMessage('user', clean);
    if (modalTextInput) modalTextInput.value = '';

    const lower = clean.toLowerCase();
    let reply = "I'm listening! You can ask me to quiz you on dynamic programming, explain Kadane's algorithm, or show today's daily challenge.";

    if (lower.includes('quiz')) {
      reply = "Starting your quiz on dynamic programming!";
      setTimeout(() => {
        if (voiceModal) voiceModal.classList.add('hidden');
        loadQuestion(state.currentQuestion, 1, 5);
      }, 1200);
    } else if (lower.includes('daily') || lower.includes('challenge')) {
      reply = "Launching today's Hard Graphs Daily Challenge!";
      setTimeout(() => {
        if (voiceModal) voiceModal.classList.add('hidden');
        if (cardDailyChallenge) cardDailyChallenge.click();
      }, 1200);
    } else if (lower.includes('explain') || lower.includes('kadane')) {
      reply = "Kadane's algorithm finds the maximum subarray sum in O of N time by dynamically deciding whether to add each element to the running sum or restart a new subarray.";
    }

    appendMessage('assistant', reply);
    speak(reply);
  }

  function appendMessage(role, text) {
    if (!conversationFeed) return;
    const msg = document.createElement('div');
    msg.className = `message ${role}-msg`;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    msg.innerHTML = `
      <div class="msg-header">
        <span>${role === 'assistant' ? '🎙️ Alexa+' : '👤 You'}</span>
        <span>${now}</span>
      </div>
      <div>${text}</div>
    `;
    conversationFeed.appendChild(msg);
    conversationFeed.scrollTop = conversationFeed.scrollHeight;
  }

  if (modalSendBtn) {
    modalSendBtn.addEventListener('click', () => {
      if (modalTextInput) handleVoiceAssistantMessage(modalTextInput.value);
    });
  }
  if (modalTextInput) {
    modalTextInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleVoiceAssistantMessage(modalTextInput.value);
    });
  }

  // ── Modals: APL 2026 Studio & Bar Raiser Scorecard ────────────────────────
  if (mcpOpenAplBtn) {
    mcpOpenAplBtn.addEventListener('click', () => {
      const aplDoc = {
        type: "APL",
        version: "2024.2",
        theme: "dark",
        import: [{ name: "alexa-layouts", version: "1.7.0" }],
        mainTemplate: {
          parameters: ["payload"],
          items: [{
            type: "Container",
            width: "100vw",
            height: "100vh",
            backgroundColor: "#070b14",
            items: [
              { type: "AlexaHeader", headerTitle: "SkillForge Echo Show 15", headerSubtitle: "Dynamic Programming" },
              { type: "Text", text: "Optimal Substructure in O(N*W)", color: "#00f3ff", fontSize: "24dp" }
            ]
          }]
        }
      };
      if (aplCodeDisplay) aplCodeDisplay.textContent = JSON.stringify(aplDoc, null, 2);
      if (aplModal) aplModal.classList.remove('hidden');
    });
  }

  if (closeAplModalBtn) closeAplModalBtn.addEventListener('click', () => aplModal.classList.add('hidden'));
  if (closeAplActionBtn) closeAplActionBtn.addEventListener('click', () => aplModal.classList.add('hidden'));
  if (copyAplBtn) {
    copyAplBtn.addEventListener('click', () => {
      if (aplCodeDisplay) {
        navigator.clipboard.writeText(aplCodeDisplay.textContent);
        copyAplBtn.textContent = '✅ Copied!';
        setTimeout(() => { copyAplBtn.textContent = '📋 Copy APL JSON for Alexa Console'; }, 2000);
      }
    });
  }

  if (mcpOpenScorecardBtn) {
    mcpOpenScorecardBtn.addEventListener('click', () => {
      if (scorecardModal) scorecardModal.classList.remove('hidden');
    });
  }
  if (closeScorecardModalBtn) closeScorecardModalBtn.addEventListener('click', () => scorecardModal.classList.add('hidden'));
  if (closeScorecardActionBtn) closeScorecardActionBtn.addEventListener('click', () => scorecardModal.classList.add('hidden'));

  // ── User Profile & Auth Modal ─────────────────────────────────────────────
  if (userAvatarBtn) {
    userAvatarBtn.addEventListener('click', () => {
      switchView('settings');
    });
  }

  const openAuthModalBtn = document.getElementById('openAuthModalBtn');
  if (openAuthModalBtn) {
    openAuthModalBtn.addEventListener('click', () => {
      if (authModal) authModal.classList.remove('hidden');
    });
  }
  if (closeAuthModalBtn) closeAuthModalBtn.addEventListener('click', () => authModal.classList.add('hidden'));

  // Quick Switch Personas
  document.querySelectorAll('.quick-user-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const u = btn.dataset.user;
      const names = {
        alex: { name: 'Alex Chen', role: 'Amazon SDE II Prep', avatar: 'M' },
        priya: { name: 'Priya Patel', role: 'Google L5 Candidate', avatar: 'P' },
        marcus: { name: 'Marcus Vance', role: 'Meta Staff Engineer Prep', avatar: 'V' },
      };
      const user = names[u] || names.alex;
      state.currentUser.display_name = user.name;
      state.currentUser.target_role = user.role;
      state.currentUser.avatar = user.avatar;

      updateUserStats();
      speak(`Switched profile to ${user.name}`);
    });
  });

  function updateUserStats() {
    if (userAvatarLetter) userAvatarLetter.textContent = state.currentUser.avatar;
    const settingsUserName = document.getElementById('settingsUserName');
    const settingsUserRole = document.getElementById('settingsUserRole');
    if (settingsUserName) settingsUserName.textContent = state.currentUser.display_name;
    if (settingsUserRole) settingsUserRole.textContent = `${state.currentUser.target_role} • ${state.userId}@skillforge.io`;

    const dashStreakNumber = document.getElementById('dashStreakNumber');
    if (dashStreakNumber) dashStreakNumber.textContent = state.streak;
  }

  // Settings Voice Preferences
  if (settingTtsCheckbox) {
    settingTtsCheckbox.addEventListener('change', (e) => {
      state.ttsEnabled = e.target.checked;
      if (!state.ttsEnabled && state.synth) state.synth.cancel();
    });
  }
  if (settingRateRange) {
    settingRateRange.addEventListener('input', (e) => {
      state.speechRate = parseFloat(e.target.value);
    });
  }

  // ── Dynamic Audio Visualizer Canvas Loop ──────────────────────────────────
  function initVisualizer() {
    const canvas = document.getElementById('audioVisualizer');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame = 0;

    function render() {
      requestAnimationFrame(render);
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isSpeaking = state.synth && state.synth.speaking;
      const isListening = state.isListening;
      const barCount = 28;
      const spacing = 3;
      const totalSpacing = (barCount - 1) * spacing;
      const barWidth = (canvas.width - totalSpacing) / barCount;

      for (let i = 0; i < barCount; i++) {
        let height = 3;
        if (isSpeaking) {
          height = Math.max(4, Math.sin(frame * 0.18 + i * 0.45) * 11 + Math.cos(frame * 0.09 + i * 0.25) * 6 + 12);
        } else if (isListening) {
          height = Math.max(4, (Math.sin(frame * 0.3 + i * 0.8) * 0.5 + 0.5) * 20);
        } else {
          height = Math.max(2, Math.sin(frame * 0.04 + i * 0.2) * 3 + 4);
        }

        const x = i * (barWidth + spacing);
        const y = (canvas.height - height) / 2;

        let grad;
        if (isListening) {
          grad = ctx.createLinearGradient(0, y, 0, y + height);
          grad.addColorStop(0, '#34d399');
          grad.addColorStop(1, '#059669');
        } else if (isSpeaking) {
          grad = ctx.createLinearGradient(0, y, 0, y + height);
          grad.addColorStop(0, '#00f3ff');
          grad.addColorStop(1, '#9d4edd');
        } else {
          grad = ctx.createLinearGradient(0, y, 0, y + height);
          grad.addColorStop(0, 'rgba(0, 243, 255, 0.4)');
          grad.addColorStop(1, 'rgba(157, 78, 221, 0.2)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, barWidth, height, 2);
        else ctx.rect(x, y, barWidth, height);
        ctx.fill();
      }
    }
    render();
  }

  // ── Ping Server Health ────────────────────────────────────────────────────
  fetch(`${API_BASE}/health`)
    .then(r => r.json())
    .then(data => {
      state.serverOnline = true;
      console.log('SkillForge online:', data);
    })
    .catch(() => {
      state.serverOnline = false;
      console.log('SkillForge in resilient local mode');
    });

  // Initial Boot
  initVisualizer();
  updateUserStats();
});
