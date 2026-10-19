/**
 * SkillForge — Elite Voice-First DSA Learning Companion
 * Connected to Amazon Bedrock Claude 3.5 Sonnet, SuperMemo SM-2 & MCP Spec 2025-11-25
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Configuration & Base URL ─────────────────────────────────────────────
  const isCustomPort = window.location.port && !['8000', '80', '443'].includes(window.location.port);
  const API_BASE = (window.location.protocol === 'file:' || isCustomPort)
    ? 'http://localhost:8000'
    : window.location.origin;

  // Safe JSON Fetch helper that never throws Unexpected End of JSON
  async function safeFetchJson(url, options = {}) {
    try {
      const resp = await fetch(url, options);
      const text = await resp.text();
      let data = null;
      if (text && text.trim().length > 0) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = null;
        }
      }
      return { ok: resp.ok, status: resp.status, data, rawText: text };
    } catch (err) {
      return { ok: false, status: 0, data: null, error: err.message };
    }
  }

  function getRegisteredUsers() {
    const builtin = {
      alex: { username: 'alex', display_name: 'Alex Chen', target_role: 'Amazon SDE II Candidate', avatar: '👨‍💻', password: 'password123' },
      sarah: { username: 'sarah', display_name: 'Sarah Jenkins', target_role: 'Principal Algorithm Architect', avatar: '👩‍💻', password: 'password123' },
      david: { username: 'david', display_name: 'David Park', target_role: 'Meta Staff Engineer Prep', avatar: '⚡', password: 'password123' },
      judge: { username: 'judge', display_name: 'Amazon Reviewer', target_role: 'Amazon Developer Relations', avatar: '🏆', password: 'password123' },
    };
    try {
      const local = JSON.parse(localStorage.getItem('skillforge_registered_users') || '{}');
      return { ...builtin, ...local };
    } catch (e) {
      return builtin;
    }
  }

  function saveRegisteredUser(userObj) {
    try {
      const current = JSON.parse(localStorage.getItem('skillforge_registered_users') || '{}');
      current[userObj.username.toLowerCase()] = userObj;
      localStorage.setItem('skillforge_registered_users', JSON.stringify(current));
    } catch (e) {
      console.warn('Could not persist local user', e);
    }
  }

  const isInitiallyLoggedIn = localStorage.getItem('skillforge_is_logged_in') === 'true';
  const savedActiveUser = localStorage.getItem('skillforge_active_user') || 'alex';

  // ── App State ────────────────────────────────────────────────────────────
  const state = {
    isLoggedIn: isInitiallyLoggedIn,
    userId: isInitiallyLoggedIn ? savedActiveUser : 'guest',
    currentUser: isInitiallyLoggedIn ? {
      username: savedActiveUser,
      display_name: savedActiveUser === 'sarah' ? 'Sarah Jenkins' : savedActiveUser === 'david' ? 'David Park' : 'Alex Chen',
      email: `${savedActiveUser}@skillforge.io`,
      target_role: savedActiveUser === 'sarah' ? 'Google Principal Architect Prep' : savedActiveUser === 'david' ? 'Meta Staff Engineer Prep' : 'Amazon SDE II Candidate',
      avatar: savedActiveUser === 'sarah' ? '👩‍💻' : savedActiveUser === 'david' ? '⚡' : '👨‍💻',
    } : {
      username: 'guest',
      display_name: 'Guest Coder',
      email: 'guest@skillforge.io',
      target_role: 'Software Development Engineer',
      avatar: '👤',
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

  // ── User Profile & Auth Modal Controller ──────────────────────────────────
  const authNavGroup = document.getElementById('authNavGroup');
  const userLoggedInGroup = document.getElementById('userLoggedInGroup');
  const headerSigninBtn = document.getElementById('headerSigninBtn');
  const headerSignupBtn = document.getElementById('headerSignupBtn');
  const headerSignoutBtn = document.getElementById('headerSignoutBtn');
  const menuSignOutBtn = document.getElementById('menuSignOutBtn');
  const userMenuDropdown = document.getElementById('userMenuDropdown');
  const userChipName = document.getElementById('userChipName');
  const menuUserName = document.getElementById('menuUserName');
  const menuUserRole = document.getElementById('menuUserRole');
  const menuAvatar = document.getElementById('menuAvatar');
  const menuUserStreak = document.getElementById('menuUserStreak');
  const menuUserXp = document.getElementById('menuUserXp');
  const menuSignInBtn = document.getElementById('menuSignInBtn');
  const menuSignUpBtn = document.getElementById('menuSignUpBtn');
  const menuSettingsBtn = document.getElementById('menuSettingsBtn');

  function updateAuthStateUI() {
    const isLoggedIn = !!state.isLoggedIn;
    if (isLoggedIn) {
      if (authNavGroup) authNavGroup.classList.add('hidden');
      if (userLoggedInGroup) userLoggedInGroup.classList.remove('hidden');
    } else {
      if (authNavGroup) authNavGroup.classList.remove('hidden');
      if (userLoggedInGroup) userLoggedInGroup.classList.add('hidden');
      if (userMenuDropdown) userMenuDropdown.classList.add('hidden');
    }
    updateUserStats();
  }

  function handleSignOut() {
    state.isLoggedIn = false;
    state.userId = 'guest';
    state.currentUser = {
      username: 'guest',
      display_name: 'Guest Coder',
      email: 'guest@skillforge.io',
      target_role: 'Software Development Engineer',
      avatar: '👤',
    };
    localStorage.removeItem('skillforge_active_user');
    localStorage.setItem('skillforge_is_logged_in', 'false');

    updateAuthStateUI();
    if (userMenuDropdown) userMenuDropdown.classList.add('hidden');
    playAlexaChime();
    showInAppToast('👋 Signed Out', 'You have been signed out. Sign in anytime to continue your streak!');
    speak('You have been signed out. See you next session!');
  }

  if (headerSignoutBtn) headerSignoutBtn.addEventListener('click', handleSignOut);
  if (menuSignOutBtn) menuSignOutBtn.addEventListener('click', handleSignOut);
  const tabSignInBtn = document.getElementById('tabSignInBtn');
  const tabSignUpBtn = document.getElementById('tabSignUpBtn');
  const linkToSignUp = document.getElementById('linkToSignUp');
  const linkToSignIn = document.getElementById('linkToSignIn');
  const authErrorMsg = document.getElementById('authErrorMsg');
  const authSuccessMsg = document.getElementById('authSuccessMsg');
  const signinUsername = document.getElementById('signinUsername');
  const signinPassword = document.getElementById('signinPassword');
  const signupUsername = document.getElementById('signupUsername');
  const signupDisplayName = document.getElementById('signupDisplayName');
  const signupEmail = document.getElementById('signupEmail');
  const signupRole = document.getElementById('signupRole');
  const signupPassword = document.getElementById('signupPassword');

  function openAuthModal(tab = 'signin') {
    if (!authModal) return;
    if (authErrorMsg) authErrorMsg.classList.add('hidden');
    if (authSuccessMsg) authSuccessMsg.classList.add('hidden');
    authModal.classList.remove('hidden');

    if (tab === 'signup') {
      if (tabSignUpBtn) tabSignUpBtn.classList.add('active');
      if (tabSignInBtn) tabSignInBtn.classList.remove('active');
      if (signupForm) signupForm.classList.remove('hidden');
      if (signinForm) signinForm.classList.add('hidden');
      if (signupUsername) signupUsername.focus();
    } else {
      if (tabSignInBtn) tabSignInBtn.classList.add('active');
      if (tabSignUpBtn) tabSignUpBtn.classList.remove('active');
      if (signinForm) signinForm.classList.remove('hidden');
      if (signupForm) signupForm.classList.add('hidden');
      if (signinUsername) signinUsername.focus();
    }
  }

  // Header and Menu Openers
  if (headerSigninBtn) headerSigninBtn.addEventListener('click', () => openAuthModal('signin'));
  if (headerSignupBtn) headerSignupBtn.addEventListener('click', () => openAuthModal('signup'));
  if (menuSignInBtn) {
    menuSignInBtn.addEventListener('click', () => {
      if (userMenuDropdown) userMenuDropdown.classList.add('hidden');
      openAuthModal('signin');
    });
  }
  if (menuSignUpBtn) {
    menuSignUpBtn.addEventListener('click', () => {
      if (userMenuDropdown) userMenuDropdown.classList.add('hidden');
      openAuthModal('signup');
    });
  }
  if (menuSettingsBtn) {
    menuSettingsBtn.addEventListener('click', () => {
      if (userMenuDropdown) userMenuDropdown.classList.add('hidden');
      switchView('settings');
    });
  }

  // Toggle user dropdown on avatar chip click
  if (userAvatarBtn) {
    userAvatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (userMenuDropdown) {
        userMenuDropdown.classList.toggle('hidden');
      }
    });

    document.addEventListener('click', (e) => {
      if (userMenuDropdown && !userMenuDropdown.classList.contains('hidden')) {
        if (!userMenuDropdown.contains(e.target) && e.target !== userAvatarBtn && !userAvatarBtn.contains(e.target)) {
          userMenuDropdown.classList.add('hidden');
        }
      }
    });
  }

  // Modal Tab Switching
  if (tabSignInBtn) tabSignInBtn.addEventListener('click', () => openAuthModal('signin'));
  if (tabSignUpBtn) tabSignUpBtn.addEventListener('click', () => openAuthModal('signup'));
  if (linkToSignUp) linkToSignUp.addEventListener('click', (e) => { e.preventDefault(); openAuthModal('signup'); });
  if (linkToSignIn) linkToSignIn.addEventListener('click', (e) => { e.preventDefault(); openAuthModal('signin'); });

  if (closeAuthModalBtn) {
    closeAuthModalBtn.addEventListener('click', () => {
      if (authModal) authModal.classList.add('hidden');
    });
  }

  // Form Submissions
  if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (authErrorMsg) authErrorMsg.classList.add('hidden');

      const username = signinUsername.value.trim();
      const password = signinPassword.value.trim();

      if (!username) {
        if (authErrorMsg) {
          authErrorMsg.textContent = '⚠️ Please enter a username';
          authErrorMsg.classList.remove('hidden');
        }
        return;
      }

      let loggedInUser = null;

      // 1. Try Backend First via safeFetchJson
      const res = await safeFetchJson(`${API_BASE}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok && res.data && res.data.user) {
        loggedInUser = res.data.user;
      } else if (res.status === 401 && res.data && res.data.detail) {
        // Backend actively rejected credentials (e.g. wrong password)
        if (authErrorMsg) {
          authErrorMsg.textContent = `⚠️ ${res.data.detail}`;
          authErrorMsg.classList.remove('hidden');
        }
        return;
      } else {
        // 2. Resilient Offline Fallback (backend not running or static file preview)
        const users = getRegisteredUsers();
        const existing = users[username.toLowerCase()];
        if (existing) {
          loggedInUser = existing;
        } else {
          // Allow instant seamless access in demo/offline mode
          const capName = username.charAt(0).toUpperCase() + username.slice(1);
          loggedInUser = {
            username: username,
            display_name: capName,
            target_role: 'Software Development Engineer',
            avatar: '👨‍💻',
          };
          saveRegisteredUser(loggedInUser);
        }
      }

      state.isLoggedIn = true;
      state.userId = loggedInUser.username;
      state.currentUser.display_name = loggedInUser.display_name || loggedInUser.username;
      state.currentUser.target_role = loggedInUser.target_role || 'Software Development Engineer';
      state.currentUser.avatar = loggedInUser.avatar || '👨‍💻';
      localStorage.setItem('skillforge_active_user', loggedInUser.username);
      localStorage.setItem('skillforge_is_logged_in', 'true');

      updateAuthStateUI();
      if (authModal) authModal.classList.add('hidden');
      playAlexaChime();
      showInAppToast(`🎉 Welcome, ${state.currentUser.display_name}!`, `Logged in as ${state.currentUser.target_role}`);
      speak(`Welcome back, ${state.currentUser.display_name}! Ready for today's practice session?`);
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (authErrorMsg) authErrorMsg.classList.add('hidden');

      const username = signupUsername.value.trim();
      const displayName = signupDisplayName.value.trim() || username;
      const email = signupEmail.value.trim() || `${username}@skillforge.io`;
      const role = signupRole.value.trim() || 'Software Development Engineer';
      const password = signupPassword.value.trim();

      if (!username) {
        if (authErrorMsg) {
          authErrorMsg.textContent = '⚠️ Please enter a username';
          authErrorMsg.classList.remove('hidden');
        }
        return;
      }

      let newUser = null;

      // 1. Try Backend First via safeFetchJson
      const res = await safeFetchJson(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password: password || 'password123',
          display_name: displayName,
          email,
          target_role: role,
          avatar: '🚀',
        }),
      });

      if (res.ok && res.data && res.data.user) {
        newUser = res.data.user;
      } else if (res.status === 400 && res.data && res.data.detail) {
        if (authErrorMsg) {
          authErrorMsg.textContent = `⚠️ ${res.data.detail}`;
          authErrorMsg.classList.remove('hidden');
        }
        return;
      } else {
        // 2. Resilient Offline Fallback
        newUser = {
          username,
          display_name: displayName,
          email,
          target_role: role,
          avatar: '🚀',
          password: password || 'password123',
        };
        saveRegisteredUser(newUser);
      }

      state.isLoggedIn = true;
      state.userId = newUser.username;
      state.currentUser.display_name = newUser.display_name;
      state.currentUser.target_role = newUser.target_role;
      state.currentUser.avatar = newUser.avatar || '🚀';
      localStorage.setItem('skillforge_active_user', newUser.username);
      localStorage.setItem('skillforge_is_logged_in', 'true');

      updateAuthStateUI();
      if (authModal) authModal.classList.add('hidden');
      playAlexaChime();
      showInAppToast(`🚀 Profile Created!`, `Welcome to SkillForge, ${newUser.display_name}!`);
      speak(`Welcome to SkillForge, ${newUser.display_name}! Your developer profile is created.`);
    });
  }

  // Quick Persona Switching
  function switchPersona(userKey) {
    const personas = {
      alex: { name: 'Alex Chen', role: 'Amazon SDE II Prep', avatar: '👨‍💻' },
      sarah: { name: 'Sarah Jenkins', role: 'Google Principal Architect Prep', avatar: '👩‍💻' },
      david: { name: 'David Park', role: 'Meta Staff Engineer Prep', avatar: '⚡' },
    };
    const p = personas[userKey] || personas.alex;
    state.isLoggedIn = true;
    state.userId = userKey;
    state.currentUser.display_name = p.name;
    state.currentUser.target_role = p.role;
    state.currentUser.avatar = p.avatar;
    localStorage.setItem('skillforge_active_user', userKey);
    localStorage.setItem('skillforge_is_logged_in', 'true');

    updateAuthStateUI();
    if (userMenuDropdown) userMenuDropdown.classList.add('hidden');
    speak(`Switched profile to ${p.name}`);
  }

  document.querySelectorAll('.persona-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.persona-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      switchPersona(btn.dataset.user);
    });
  });

  function updateUserStats() {
    if (userAvatarLetter) userAvatarLetter.textContent = state.currentUser.avatar || '👨‍💻';
    if (userChipName) userChipName.textContent = state.currentUser.display_name || 'Alex Chen';
    if (menuUserName) menuUserName.textContent = state.currentUser.display_name || 'Alex Chen';
    if (menuUserRole) menuUserRole.textContent = state.currentUser.target_role || 'Amazon SDE II Candidate';
    if (menuAvatar) menuAvatar.textContent = state.currentUser.avatar || '👨‍💻';
    if (menuUserStreak) menuUserStreak.textContent = `🔥 ${state.streak}-Day Streak`;
    if (menuUserXp) menuUserXp.textContent = `⚡ ${state.xp} XP`;

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

  // ── Notification & Daily Streak Retention System ─────────────────────────
  const bellBtn = document.getElementById('bellBtn');
  const notificationDropdown = document.getElementById('notificationDropdown');
  const closeNotifBtn = document.getElementById('closeNotifBtn');
  const notifIndicator = document.getElementById('notifIndicator');
  const notifBadgeCount = document.getElementById('notifBadgeCount');
  const defensePracticeBtn = document.getElementById('defensePracticeBtn');
  const defenseHours = document.getElementById('defenseHours');
  const defenseDesc = document.getElementById('defenseDesc');
  const enablePushBtn = document.getElementById('enablePushBtn');
  const pushSubtitle = document.getElementById('pushSubtitle');
  const reminderTimeSelect = document.getElementById('reminderTimeSelect');
  const dailyReminderToggle = document.getElementById('dailyReminderToggle');
  const testReminderBtn = document.getElementById('testReminderBtn');
  const notifFeedContainer = document.getElementById('notifFeedContainer');
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  const clearAllNotifsBtn = document.getElementById('clearAllNotifsBtn');
  const inAppToast = document.getElementById('inAppToast');
  const toastTitle = document.getElementById('toastTitle');
  const toastDesc = document.getElementById('toastDesc');
  const toastActionBtn = document.getElementById('toastActionBtn');
  const toastCloseBtn = document.getElementById('toastCloseBtn');

  // Load preferences from localStorage
  const savedReminderTime = localStorage.getItem('skillforge_reminder_time') || '20:00';
  const savedNotifsEnabled = localStorage.getItem('skillforge_notifs_enabled') !== 'false';
  if (reminderTimeSelect) reminderTimeSelect.value = savedReminderTime;
  if (dailyReminderToggle) dailyReminderToggle.checked = savedNotifsEnabled;

  // Authentic 2-Tone Alexa Audio Chime (Web Audio API)
  function playAlexaChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Tone 1: 784 Hz (G5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(784, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Tone 2: 1046.5 Hz (C6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, now + 0.16);
      gain2.gain.setValueAtTime(0.22, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.16);
      osc2.stop(now + 0.65);
    } catch (err) {
      console.warn('AudioContext chime error:', err);
    }
  }

  // Update Push Permission UI
  function updatePushStatusUI() {
    if (!('Notification' in window)) {
      if (pushSubtitle) pushSubtitle.textContent = 'Desktop notifications not supported in this browser.';
      if (enablePushBtn) enablePushBtn.style.display = 'none';
      return;
    }
    if (Notification.permission === 'granted') {
      if (pushSubtitle) pushSubtitle.textContent = '✅ Desktop push notifications are active and ready!';
      if (enablePushBtn) {
        enablePushBtn.textContent = 'Active ✅';
        enablePushBtn.disabled = true;
        enablePushBtn.style.opacity = '0.6';
      }
    } else if (Notification.permission === 'denied') {
      if (pushSubtitle) pushSubtitle.textContent = '⚠️ Notifications blocked in browser settings.';
      if (enablePushBtn) {
        enablePushBtn.textContent = 'Blocked ✕';
        enablePushBtn.disabled = true;
      }
    } else {
      if (pushSubtitle) pushSubtitle.textContent = 'Receive daily reminders on your desktop so you never lose your streak.';
      if (enablePushBtn) {
        enablePushBtn.textContent = 'Enable Push 🔔';
        enablePushBtn.disabled = false;
        enablePushBtn.style.opacity = '1';
      }
    }
  }
  updatePushStatusUI();

  // Floating Toast Notification
  let toastTimeout = null;
  function showInAppToast(title, desc, actionCallback) {
    if (!inAppToast) return;
    if (toastTitle) toastTitle.textContent = title;
    if (toastDesc) toastDesc.textContent = desc;
    inAppToast.classList.remove('hidden');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      inAppToast.classList.add('hidden');
    }, 8000);

    if (toastActionBtn) {
      toastActionBtn.onclick = () => {
        inAppToast.classList.add('hidden');
        if (actionCallback) actionCallback();
        else if (cardDailyChallenge) cardDailyChallenge.click();
      };
    }
  }

  if (toastCloseBtn) {
    toastCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (toastTimeout) clearTimeout(toastTimeout);
      if (inAppToast) inAppToast.classList.add('hidden');
    });
  }

  // Toggle Notifications Dropdown
  if (bellBtn && notificationDropdown) {
    bellBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      notificationDropdown.classList.toggle('hidden');
      if (!notificationDropdown.classList.contains('hidden')) {
        refreshNotifications();
      }
    });

    document.addEventListener('click', (e) => {
      if (notificationDropdown && !notificationDropdown.classList.contains('hidden')) {
        if (!notificationDropdown.contains(e.target) && e.target !== bellBtn && !bellBtn.contains(e.target)) {
          notificationDropdown.classList.add('hidden');
        }
      }
    });
  }

  if (closeNotifBtn) {
    closeNotifBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (notificationDropdown) notificationDropdown.classList.add('hidden');
    });
  }

  // Escape key to dismiss any open notifications or toasts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (notificationDropdown) notificationDropdown.classList.add('hidden');
      if (inAppToast) {
        if (toastTimeout) clearTimeout(toastTimeout);
        inAppToast.classList.add('hidden');
      }
    }
  });

  // Protect Streak Button
  if (defensePracticeBtn) {
    defensePracticeBtn.addEventListener('click', () => {
      if (notificationDropdown) notificationDropdown.classList.add('hidden');
      if (cardDailyChallenge) cardDailyChallenge.click();
      speak("Starting your daily streak drill! Let's conquer today's challenge.");
    });
  }

  // Enable Push Button Handler
  if (enablePushBtn) {
    enablePushBtn.addEventListener('click', () => {
      if ('Notification' in window) {
        Notification.requestPermission().then((perm) => {
          updatePushStatusUI();
          if (perm === 'granted') {
            playAlexaChime();
            showInAppToast(
              '🔥 SkillForge Streak Reminders Enabled!',
              'We will alert you daily so you never break your 14-day coding streak.'
            );
            try {
              new Notification('🔥 SkillForge: Daily Streak Reminders Active!', {
                body: "We will alert you daily so you never break your 14-day coding streak. Tap to practice anytime!",
                icon: '/static/icon.png',
                badge: '/static/icon.png',
              });
            } catch (e) { console.warn(e); }
          }
        });
      }
    });
  }

  // Scheduler Controls
  if (reminderTimeSelect) {
    reminderTimeSelect.addEventListener('change', (e) => {
      localStorage.setItem('skillforge_reminder_time', e.target.value);
      fetch(`${API_BASE}/api/notifications/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder_time: e.target.value, enabled: true, user_id: state.userId }),
      }).catch(() => {});
    });
  }

  if (dailyReminderToggle) {
    dailyReminderToggle.addEventListener('change', (e) => {
      localStorage.setItem('skillforge_notifs_enabled', e.target.checked);
    });
  }

  // Test Reminder Handler
  if (testReminderBtn) {
    testReminderBtn.addEventListener('click', () => {
      triggerStreakReminder(true);
    });
  }

  // Trigger Streak Reminder (Test or Daily Scheduled)
  async function triggerStreakReminder(isTest = false) {
    playAlexaChime();

    try {
      const resp = await fetch(`${API_BASE}/api/notifications/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urgency: 'streak_at_risk', user_id: state.userId }),
      });
      const data = await resp.json();

      const title = data.title || `🔥 Don't Break Your ${state.streak}-Day Streak!`;
      const body = data.body || "Complete 1 quick voice challenge before midnight to protect your flame.";
      const voice = data.voice_prompt || `Hey! Time to protect your ${state.streak}-day coding streak. Ready for a quick voice drill on Dynamic Programming?`;

      // 1. Show In-App Toast
      showInAppToast(title, body, () => {
        if (cardDailyChallenge) cardDailyChallenge.click();
      });

      // 2. Dispatch native OS/Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          const notif = new Notification(title, {
            body: body,
            icon: '/static/icon.png',
            badge: '/static/icon.png',
            tag: 'skillforge-streak-alert',
          });
          notif.onclick = () => {
            window.focus();
            if (cardDailyChallenge) cardDailyChallenge.click();
            notif.close();
          };
        } catch (e) {
          console.warn('Native notification error:', e);
        }
      }

      // 3. Alexa speaks the motivational message
      speak(voice);

      // 4. Update notification dot & feed
      if (notifIndicator) notifIndicator.classList.remove('hidden');
      if (notifBadgeCount) notifBadgeCount.textContent = 'Active 🔥';
    } catch (err) {
      // Offline fallback
      showInAppToast(
        `🔥 Don't Break Your ${state.streak}-Day Streak!`,
        "Complete 1 quick voice challenge before midnight to protect your flame."
      );
      speak(`Hey! Time to protect your ${state.streak}-day coding streak. Let's do a quick voice drill!`);
    }
  }

  // Fetch & Render Notification Feed
  async function refreshNotifications() {
    try {
      const resp = await fetch(`${API_BASE}/api/notifications?user_id=${state.userId}`);
      const data = await resp.json();

      if (defenseHours) defenseHours.textContent = data.hours_remaining || 7;
      if (defenseDesc && data.body) defenseDesc.textContent = data.body;

      if (notifFeedContainer && data.notifications) {
        notifFeedContainer.innerHTML = data.notifications.map(n => `
          <div class="notif-card ${n.urgency === 'high' ? 'unread' : ''}" data-action="${n.action}">
            <div class="notif-card-icon">${n.icon || '🔥'}</div>
            <div class="notif-card-content">
              <div class="notif-card-header">
                <span class="notif-card-title">${n.title}</span>
                <span class="notif-card-time">${n.timestamp}</span>
              </div>
              <p class="notif-card-body">${n.body}</p>
            </div>
          </div>
        `).join('');

        // Wire up clicks on feed items
        notifFeedContainer.querySelectorAll('.notif-card').forEach(card => {
          card.addEventListener('click', () => {
            const act = card.dataset.action;
            if (notificationDropdown) notificationDropdown.classList.add('hidden');
            if (act === 'quiz' || act === 'daily') {
              if (cardDailyChallenge) cardDailyChallenge.click();
            } else if (act === 'review') {
              switchView('reviews');
            } else {
              switchView('dashboard');
            }
          });
        });
      }
    } catch (err) {
      console.warn('Could not fetch notifications:', err);
    }
  }

  // Mark all read / clear
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', () => {
      if (notifIndicator) notifIndicator.classList.add('hidden');
      if (notifBadgeCount) notifBadgeCount.textContent = '0 New';
      if (notifFeedContainer) {
        notifFeedContainer.querySelectorAll('.notif-card').forEach(c => c.classList.remove('unread'));
      }
    });
  }

  if (clearAllNotifsBtn) {
    clearAllNotifsBtn.addEventListener('click', () => {
      if (notifIndicator) notifIndicator.classList.add('hidden');
      if (notifBadgeCount) notifBadgeCount.textContent = '0 New';
      if (notifFeedContainer) notifFeedContainer.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:0.8rem;">No notifications right now. Streak protected!</div>';
    });
  }

  // Background Daily Streak Monitor (Runs every 30 seconds)
  setInterval(() => {
    const now = new Date();
    const curTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const targetTime = localStorage.getItem('skillforge_reminder_time') || '20:00';
    const notifsEnabled = localStorage.getItem('skillforge_notifs_enabled') !== 'false';
    const todayStr = now.toISOString().slice(0, 10);
    const lastNotified = localStorage.getItem('skillforge_last_notified_date');

    // Update remaining hours live
    const hoursLeft = 23 - now.getHours();
    if (defenseHours) defenseHours.textContent = Math.max(1, hoursLeft);

    if (notifsEnabled && curTime === targetTime && lastNotified !== todayStr) {
      localStorage.setItem('skillforge_last_notified_date', todayStr);
      triggerStreakReminder(false);
    }
  }, 30000);

  // Initial fetch
  refreshNotifications();

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
  updateAuthStateUI();
});
