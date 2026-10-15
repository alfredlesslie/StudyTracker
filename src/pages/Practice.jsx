import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Brain,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  AlertCircle,
  Clock,
  Layers,
  BookOpen,
  Filter,
  Check,
  Zap,
  Target,
  FileQuestion,
  ChevronRight,
  AlertTriangle,
  Play,
  History,
  Eye,
  Sliders,
  ListOrdered,
  Loader2
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { SUBJECTS, MODULES, TOPICS } from "../data/syllabus";
import {
  getQuestionsForTopic,
  getAvailableQuestionCount,
  QUESTION_BANK
} from "../data/questionBank";
import { generateQuestions } from "../services/aiService";
import { getNextRecommendedTopic } from "../services/mlService";
import {
  getPracticeAttempts,
  getPracticeAttemptById,
  getRecentPractice,
  getWeakTopics,
  getStrongTopics
} from "../services/storageService";

export default function Practice() {
  const {
    activeTopicId,
    selectTopic,
    topics,
    logQuizAttempt,
    navigateTo,
    openTutorForMistake,
    customPracticeQuestions,
    clearCustomPracticeQuestions,
    startFocusForTopic,
    startActiveSession,
    stopActiveSession
  } = useApp();

  const currentTopic =
    topics.find((t) => t.id === activeTopicId) || topics[0] || TOPICS[0];

  // ================= NAVIGATION & TAB MODES =================
  // Modes: "by_topic" | "quick_quiz" | "weak_topics" | "by_subject" | "history"
  const [practiceMode, setPracticeMode] = useState("by_topic");
  // Subject Filter: "all" or specific subjectId
  const [subjectFilter, setSubjectFilter] = useState("all");

  // Selection configurations for Practice by Topic
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    currentTopic.subjectId || "cs-cn"
  );
  const [selectedModuleId, setSelectedModuleId] = useState(
    currentTopic.moduleId || "cn-m1"
  );
  const [selectedTopicId, setSelectedTopicId] = useState(
    currentTopic.id || "cn-m1-t1"
  );

  // Setup: Question-count selector (1 to 10 slider, default 5)
  const [questionCount, setQuestionCount] = useState(5);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  // Track recently used question IDs per topic to prioritize fresh questions on retakes
  const [recentSeenQuestionIds, setRecentSeenQuestionIds] = useState({});

  // ================= ACTIVE QUIZ STATE =================
  const [quizActive, setQuizActive] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [index]: selectedOptionIndex }
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizSaveError, setQuizSaveError] = useState(null);
  const [quizRepeatNotice, setQuizRepeatNotice] = useState(null);
  const quizStartTimeRef = useRef(Date.now());

  // ================= REVIEW SAVED ATTEMPT MODAL =================
  const [reviewingAttempt, setReviewingAttempt] = useState(null);

  // Refresh practice attempts from storage
  const [practiceHistoryList, setPracticeHistoryList] = useState([]);

  useEffect(() => {
    setPracticeHistoryList(getPracticeAttempts());
  }, [quizSubmitted, quizActive]);

  // Sync with global activeTopicId when navigated from other pages
  useEffect(() => {
    if (activeTopicId) {
      const topic = topics.find((t) => t.id === activeTopicId);
      if (topic) {
        setSelectedSubjectId(topic.subjectId);
        setSelectedModuleId(topic.moduleId);
        setSelectedTopicId(topic.id);
      }
    }
  }, [activeTopicId, topics]);

  // Handle custom AI-generated question sets passed from AI Tutor
  useEffect(() => {
    if (customPracticeQuestions && customPracticeQuestions.questions?.length > 0) {
      const targetTopic =
        topics.find((t) => t.id === customPracticeQuestions.topicId) || currentTopic;
      setSelectedSubjectId(targetTopic.subjectId);
      setSelectedModuleId(targetTopic.moduleId);
      setSelectedTopicId(targetTopic.id);
      setActiveQuestions(customPracticeQuestions.questions);
      setQuestionCount(customPracticeQuestions.questions.length);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuizSubmitted(false);
      setShowExitConfirm(false);
      setShowSubmitConfirm(false);
      setQuizActive(true);
      clearCustomPracticeQuestions();
      window.scrollTo({ top: 100, behavior: "smooth" });
    }
  }, [customPracticeQuestions, topics]);

  // Derived current topic object
  const activeSelectedTopic =
    topics.find((t) => t.id === selectedTopicId) || currentTopic;
  const activeSelectedSubject =
    SUBJECTS.find((s) => s.id === activeSelectedTopic?.subjectId) || SUBJECTS[0];
  const activeSelectedModule =
    MODULES.find((m) => m.id === activeSelectedTopic?.moduleId) || MODULES[0];

  // Filter modules and topics based on current dropdown choices
  const availableModules = MODULES.filter((m) => m.subjectId === selectedSubjectId);
  const availableTopics = topics.filter((t) => t.moduleId === selectedModuleId);

  // Filter topics for the subject filter tab
  const filteredTopics = subjectFilter === "all"
    ? topics
    : topics.filter((t) => t.subjectId === subjectFilter);

  // Query recent practice & weak topics from storage service (strictly practice-only)
  const recentPracticeList = getRecentPractice(5);
  const weakTopicsList = getWeakTopics(filteredTopics);
  const strongTopicsList = getStrongTopics(filteredTopics);

  // Available question count in bank for active topic
  const availableQuestionsForActiveTopic = getAvailableQuestionCount({
    topicId: activeSelectedTopic.id
  });

  // Handle Subject selection in dropdown
  const handleSubjectChange = (subId) => {
    setSelectedSubjectId(subId);
    const subModules = MODULES.filter((m) => m.subjectId === subId);
    if (subModules.length > 0) {
      setSelectedModuleId(subModules[0].id);
      const modTopics = topics.filter((t) => t.moduleId === subModules[0].id);
      if (modTopics.length > 0) {
        setSelectedTopicId(modTopics[0].id);
        selectTopic(modTopics[0].id);
      }
    }
  };

  // Handle Module selection in dropdown
  const handleModuleChange = (modId) => {
    setSelectedModuleId(modId);
    const modTopics = topics.filter((t) => t.moduleId === modId);
    if (modTopics.length > 0) {
      setSelectedTopicId(modTopics[0].id);
      selectTopic(modTopics[0].id);
    }
  };

  // Handle Topic selection
  const handleTopicChange = (topId) => {
    setSelectedTopicId(topId);
    selectTopic(topId);
  };

  // Cleanup on unmount if quiz was left active
  useEffect(() => {
    return () => {
      stopActiveSession();
    };
  }, []);

  // ================= QUIZ CONTROLS =================
  const launchQuizWithQuestions = (targetTopic, qs) => {
    // Track active practice session
    startActiveSession("practice", {
      subjectId: targetTopic.subjectId,
      moduleId: targetTopic.moduleId,
      topicId: targetTopic.id
    });

    setActiveQuestions(qs);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizSubmitted(false);
    setShowExitConfirm(false);
    setShowSubmitConfirm(false);
    setIsSubmittingQuiz(false);
    setQuizSaveError(null);
    setQuizRepeatNotice(
      qs.hasRepeats
        ? "Note: Some questions are repeated from previous attempts because all questions in the bank have been practiced."
        : null
    );
    quizStartTimeRef.current = Date.now();
    setQuizActive(true);
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  const startQuizForTopic = async (topicId, count = questionCount, useLocalFallback = false) => {
    if (isGeneratingQuestions) return;

    const targetTopic = topics.find((t) => t.id === topicId) || activeSelectedTopic;
    const validatedCount = Math.min(10, Math.max(1, Number(count) || 5));

    selectTopic(targetTopic.id);
    setSelectedSubjectId(targetTopic.subjectId);
    setSelectedModuleId(targetTopic.moduleId);
    setSelectedTopicId(targetTopic.id);
    setGenerationError(null);

    // If local fallback is explicitly requested
    if (useLocalFallback) {
      const seenIds = recentSeenQuestionIds[targetTopic.id] || [];
      const qs = getQuestionsForTopic(targetTopic.id, validatedCount, { excludeIds: seenIds });
      launchQuizWithQuestions(targetTopic, qs);
      return;
    }

    setIsGeneratingQuestions(true);

    try {
      // Dynamically generate questions using existing backend AI integration and API key
      const aiQuestions = await generateQuestions(targetTopic, validatedCount, "Quick Practice", {
        fallbackToLocal: false
      });

      if (!aiQuestions || !Array.isArray(aiQuestions) || aiQuestions.length === 0) {
        throw new Error(`Unable to generate valid practice questions for "${targetTopic.title}".`);
      }

      // Validate that every question has question text, 4 options, valid correctAnswer index, and explanation
      const validatedQuestions = aiQuestions.filter(
        (q) =>
          q &&
          typeof q.question === "string" &&
          q.question.trim().length > 0 &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.correctAnswer === "number" &&
          q.correctAnswer >= 0 &&
          q.correctAnswer <= 3 &&
          typeof q.explanation === "string" &&
          q.explanation.trim().length > 0
      );

      if (validatedQuestions.length === 0) {
        throw new Error("Received malformed question structures from AI. Please retry.");
      }

      launchQuizWithQuestions(targetTopic, validatedQuestions);
    } catch (err) {
      setGenerationError(
        err.message || "Failed to generate AI questions. Please verify your connection and retry."
      );
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const startQuickQuiz = () => {
    // Pick topic needing attention or first filtered topic
    const target = weakTopicsList[0] || filteredTopics[0] || currentTopic;
    startQuizForTopic(target.id, 5);
  };

  const startSubjectPractice = (subId, count = 10) => {
    const targetSubject = SUBJECTS.find((s) => s.id === subId) || activeSelectedSubject;
    const subTopics = topics.filter((t) => t.subjectId === targetSubject.id);
    const first = subTopics[0] || currentTopic;
    startQuizForTopic(first.id, count);
  };

  // Select or change an answer option for the current question
  const handleSelectOption = (optionIndex) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handleJumpToQuestion = (idx) => {
    if (idx >= 0 && idx < activeQuestions.length) {
      setCurrentQuestionIndex(idx);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const calculateFinalScore = () => {
    let score = 0;
    activeQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const handleSubmitQuiz = async () => {
    if (isSubmittingQuiz) return;
    setIsSubmittingQuiz(true);
    setQuizSaveError(null);
    setShowSubmitConfirm(false);

    const finalScore = calculateFinalScore();
    const totalQ = activeQuestions.length;
    const answeredCount = Object.keys(userAnswers).length;
    const unansweredCount = Math.max(0, totalQ - answeredCount);
    const incorrectCount = Math.max(0, totalQ - finalScore - unansweredCount);
    const pct = Math.round((finalScore / (totalQ || 1)) * 100);
    const durationSec = Math.max(5, Math.round((Date.now() - quizStartTimeRef.current) / 1000));

    // Prepare complete question and answer records for persistence and review
    const answerRecords = activeQuestions.map((q, idx) => ({
      questionId: q.id,
      question: q.question,
      options: q.options,
      selectedOption: userAnswers[idx] ?? null,
      correctOption: q.correctAnswer,
      isCorrect: userAnswers[idx] === q.correctAnswer,
      isUnanswered: userAnswers[idx] === undefined,
      explanation: q.explanation,
      difficulty: q.difficulty || "medium"
    }));

    // Update seen question IDs for this topic to guarantee fresh questions on retake
    const currentQIds = activeQuestions.map((q) => q.id);
    setRecentSeenQuestionIds((prev) => ({
      ...prev,
      [activeSelectedTopic.id]: [
        ...new Set([...(prev[activeSelectedTopic.id] || []), ...currentQIds])
      ]
    }));

    try {
      // STRICT SEPARATION: examId is strictly null for all Practice quizzes
      const savedAttempt = await logQuizAttempt({
        topicId: activeSelectedTopic.id,
        subjectId: activeSelectedSubject.id,
        moduleId: activeSelectedModule.id,
        examId: null,
        score: finalScore,
        totalQuestions: totalQ,
        percentage: pct,
        durationSeconds: durationSec,
        answers: answerRecords,
        questions: activeQuestions,
        unansweredCount: unansweredCount,
        correctCount: finalScore,
        incorrectCount: incorrectCount,
        difficulty: activeSelectedTopic.difficulty || "medium",
        format: `${totalQ} Question Practice`
      });

      if (savedAttempt && savedAttempt.synced === false && savedAttempt.syncError) {
        setQuizSaveError(`Saved locally. Server synchronization note: ${savedAttempt.syncError}`);
      }
    } catch (err) {
      setQuizSaveError(err.message || "Failed to persist attempt to backend.");
    } finally {
      setIsSubmittingQuiz(false);
    }

    // Finalize active practice session
    stopActiveSession();

    setQuizSubmitted(true);

    if (pct >= 80) {
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }

    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  const handleExitQuiz = () => {
    stopActiveSession();
    if (Object.keys(userAnswers).length > 0 && !quizSubmitted) {
      setShowExitConfirm(true);
    } else {
      setQuizActive(false);
      setShowExitConfirm(false);
    }
  };

  const currentQ = activeQuestions[currentQuestionIndex];
  const isCurrentAnswered = userAnswers[currentQuestionIndex] !== undefined;
  const answeredTotalCount = Object.keys(userAnswers).length;
  const nextRecommended = getNextRecommendedTopic(activeSelectedTopic.id, topics);

  return (
    <div className="page-container animate-fade-in practice-page-wrapper">
      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div className="practice-hero-header">
        <div className="header-titles">
          <h1 className="practice-main-title">Practice</h1>
          <p className="practice-sub-title">
            Test yourself with flexible question sets, review saved attempts, and strengthen weak concepts.
          </p>
        </div>

        {/* Global Subject Filter Bar */}
        <div className="subject-filter-bar">
          <span className="filter-label">
            <Filter size={14} />
            Filter Subject:
          </span>
          <div className="filter-pills-row">
            <button
              className={`filter-pill ${subjectFilter === "all" ? "active" : ""}`}
              onClick={() => setSubjectFilter("all")}
            >
              All Subjects
            </button>
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                className={`filter-pill ${subjectFilter === s.id ? "active" : ""}`}
                onClick={() => setSubjectFilter(s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN PRACTICE VIEWS (WHEN NOT IN ACTIVE QUIZ)
          ========================================================================= */}
      {!quizActive ? (
        <div className="practice-main-layout animate-fade-in">
          {/* Practice Mode Navigation Cards */}
          <div className="practice-modes-grid">
            <div
              className={`card mode-select-card ${practiceMode === "by_topic" ? "active" : ""}`}
              onClick={() => setPracticeMode("by_topic")}
            >
              <div className="mode-icon-box bg-indigo">
                <BookOpen size={20} />
              </div>
              <h3 className="mode-card-title">Practice by Topic</h3>
              <p className="mode-card-desc">
                Select any syllabus topic and choose 1 to 10 questions to practice.
              </p>
            </div>

            <div
              className={`card mode-select-card ${practiceMode === "quick_quiz" ? "active" : ""}`}
              onClick={() => {
                setPracticeMode("quick_quiz");
                startQuickQuiz();
              }}
            >
              <div className="mode-icon-box bg-emerald">
                <Zap size={20} />
              </div>
              <h3 className="mode-card-title">Quick Quiz</h3>
              <p className="mode-card-desc">
                Rapid 5-question multiple choice burst on high-priority syllabus topics.
              </p>
            </div>

            <div
              className={`card mode-select-card ${practiceMode === "weak_topics" ? "active" : ""}`}
              onClick={() => setPracticeMode("weak_topics")}
            >
              <div className="mode-icon-box bg-rose">
                <Target size={20} />
              </div>
              <h3 className="mode-card-title">Weak Topics</h3>
              <p className="mode-card-desc">
                Target areas where previous quiz scores indicate you need more practice.
              </p>
            </div>

            <div
              className={`card mode-select-card ${practiceMode === "history" ? "active" : ""}`}
              onClick={() => setPracticeMode("history")}
            >
              <div className="mode-icon-box bg-amber">
                <History size={20} />
              </div>
              <h3 className="mode-card-title">Practice History</h3>
              <p className="mode-card-desc">
                Review past standalone practice attempts and inspect saved answer explanations.
              </p>
            </div>
          </div>

          {/* ================= MODE 1: PRACTICE BY TOPIC SETUP ================= */}
          {practiceMode === "by_topic" && (
            <div className="card topic-setup-card animate-fade-in">
              <h2 className="setup-heading">Customize Practice Session</h2>
              <p className="setup-subhead">
                Configure your topic and select the number of questions you want to practise.
              </p>

              {/* Hierarchy Pickers: Subject -> Module -> Topic */}
              <div className="hierarchy-selectors-grid">
                <div className="selector-group">
                  <label className="picker-label">1. Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="styled-select"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} — {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="selector-group">
                  <label className="picker-label">2. Module</label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => handleModuleChange(e.target.value)}
                    className="styled-select"
                  >
                    {availableModules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="selector-group">
                  <label className="picker-label">3. Topic</label>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => handleTopicChange(e.target.value)}
                    className="styled-select"
                  >
                    {availableTopics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question Count Selector: 1 to 10 Range Slider */}
              <div className="card question-count-selector-box">
                <div className="selector-title-row">
                  <div className="title-left">
                    <Sliders size={18} className="text-primary" />
                    <span className="selector-main-label">Number of questions:</span>
                  </div>
                  <span className="prominent-count-badge" id="practice-count-display">
                    {questionCount} {questionCount === 1 ? "Question" : "Questions"}
                  </span>
                </div>

                {/* Adjustable Slider Control */}
                <div className="slider-wrapper">
                  <div className="slider-input-container">
                    <input
                      id="practice-question-slider"
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Math.min(10, Math.max(1, Number(e.target.value))))}
                      className="discrete-range-slider modern-count-slider"
                      aria-label="Practice questions count slider"
                      aria-valuemin="1"
                      aria-valuemax="10"
                      aria-valuenow={questionCount}
                      aria-valuetext={`${questionCount} ${questionCount === 1 ? "Question" : "Questions"}`}
                    />
                  </div>

                  {/* Clearly visible min and max boundary labels */}
                  <div className="slider-boundary-labels">
                    <span className="boundary-pill min-label">
                      <strong>1</strong> Min (1 Question)
                    </span>
                    <span className="slider-current-hint">
                      Adjust count from 1 to 10 questions
                    </span>
                    <span className="boundary-pill max-label">
                      <strong>10</strong> Max (10 Questions)
                    </span>
                  </div>

                  {/* Discrete quick-select pills for numbers 1 to 10 */}
                  <div className="slider-ticks-row number-strip-row" role="radiogroup" aria-label="Quick select question count">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                      <button
                        key={val}
                        type="button"
                        className={`slider-tick-pill compact-step ${questionCount === val ? "selected" : ""}`}
                        onClick={() => setQuestionCount(val)}
                        aria-label={`${val} Question${val === 1 ? "" : "s"}`}
                        aria-checked={questionCount === val}
                        role="radio"
                      >
                        <span className="step-number">{val}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Question Generation Info */}
                <div className="availability-status-row">
                  <div className="availability-notice ai-ready-notice">
                    <Sparkles size={15} className="text-primary" />
                    <span>
                      Dynamically generated with AI Tutor grounded in <strong>{activeSelectedTopic.title}</strong> syllabus notes.
                    </span>
                  </div>
                </div>
              </div>

              {/* Topic Information & Start CTA Banner */}
              <div className="topic-meta-banner">
                <div className="banner-left">
                  <span className="banner-context">
                    {activeSelectedSubject.name} · {activeSelectedModule.title.split(":")[0]}
                  </span>
                  <h3 className="banner-topic-title">{activeSelectedTopic.title}</h3>
                  <div className="banner-chips-row">
                    <span className="meta-chip">
                      <Clock size={13} /> {activeSelectedTopic.estimatedMinutes || 45} min estimated
                    </span>
                    <span className={`meta-chip difficulty-${activeSelectedTopic.difficulty || "medium"}`}>
                      {activeSelectedTopic.difficulty || "medium"}
                    </span>
                    <span className="meta-chip status-chip">
                      Status: {activeSelectedTopic.status === "mastered" ? "Mastered" : activeSelectedTopic.status === "learned" ? "Learned" : activeSelectedTopic.status === "needs_practice" ? "Needs Practice" : activeSelectedTopic.status === "learning" ? "Learning" : "Not Started"}
                    </span>
                    {activeSelectedTopic.averageQuizScore !== null && (
                      <span className="meta-chip score-chip">
                        Avg Score: {activeSelectedTopic.averageQuizScore}% ({activeSelectedTopic.quizAttempts || 0} attempts)
                      </span>
                    )}
                  </div>
                </div>

                <div className="banner-right">
                  <button
                    id="start-practice-btn"
                    className="btn btn-primary btn-lg start-quiz-cta"
                    onClick={() => startQuizForTopic(activeSelectedTopic.id, questionCount)}
                    disabled={isGeneratingQuestions}
                  >
                    {isGeneratingQuestions ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Generating {questionCount} {questionCount === 1 ? "Question" : "Questions"}...</span>
                      </>
                    ) : (
                      <>
                        <Play size={18} />
                        <span>Start Practice ({questionCount} {questionCount === 1 ? "Question" : "Questions"})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Loading Indicator while Generating Questions */}
              {isGeneratingQuestions && (
                <div className="card generation-loading-banner animate-fade-in">
                  <Loader2 size={24} className="animate-spin text-primary flex-shrink-0" />
                  <div className="loading-banner-text">
                    <h4 className="loading-banner-title">
                      Generating {questionCount} Practice {questionCount === 1 ? "Question" : "Questions"} with AI...
                    </h4>
                    <p className="loading-banner-desc">
                      Synthesizing verified university multiple-choice questions grounded in <strong>{activeSelectedTopic.title}</strong> syllabus concepts.
                    </p>
                  </div>
                </div>
              )}

              {/* Generation Error State with Retry and Fallback */}
              {generationError && (
                <div className="card generation-error-card animate-fade-in">
                  <div className="error-card-inner">
                    <AlertTriangle size={22} className="text-danger flex-shrink-0" />
                    <div className="error-card-text">
                      <h4 className="error-card-title">Question Generation Notice</h4>
                      <p className="error-card-desc">{generationError}</p>
                    </div>
                  </div>
                  <div className="error-card-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => startQuizForTopic(activeSelectedTopic.id, questionCount)}
                    >
                      <RotateCcw size={14} />
                      <span>Retry AI Generation ({questionCount} Qs)</span>
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => startQuizForTopic(activeSelectedTopic.id, questionCount, true)}
                    >
                      <span>Practice from Standard Question Bank</span>
                    </button>
                    <button
                      className="btn btn-subtle btn-sm"
                      onClick={() => setGenerationError(null)}
                    >
                      <span>Dismiss</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= MODE 3: WEAK TOPICS VIEW ================= */}
          {practiceMode === "weak_topics" && (
            <div className="card weak-topics-view-card animate-fade-in">
              <div className="view-card-header">
                <h2 className="view-title">Topics Needing Practice</h2>
                <p className="view-desc">
                  Identified from your recent quiz performance where score is below 60%.
                </p>
              </div>

              {weakTopicsList.length > 0 ? (
                <div className="weak-topics-table">
                  {weakTopicsList.map((t) => (
                    <div key={t.id} className="weak-topic-row">
                      <div className="weak-topic-left">
                        <span className="dot-indicator danger" />
                        <div>
                          <h4 className="weak-t-title">{t.title}</h4>
                          <span className="weak-t-sub">
                            {SUBJECTS.find((s) => s.id === t.subjectId)?.name || "Subject"} · {t.averageQuizScore ? `Avg Score: ${t.averageQuizScore}%` : "Needs more practice"}
                          </span>
                        </div>
                      </div>
                      <div className="weak-topic-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => startQuizForTopic(t.id, 5)}
                        >
                          <Play size={14} />
                          <span>Practice (5 Qs)</span>
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => navigateTo("learn", t.id)}
                        >
                          <span>Review Topic</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="clean-empty-state-box">
                  <span className="empty-icon-emoji">🎉</span>
                  <h3>No topics needing extra practice right now!</h3>
                  <p>Great job! You don't have any topics flagged as weak. Keep practicing to maintain your mastery.</p>
                  <button className="btn btn-primary" onClick={startQuickQuiz}>
                    Take a Quick Quiz
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= MODE 4: FULL PRACTICE HISTORY ================= */}
          {practiceMode === "history" && (
            <div className="card history-view-card animate-fade-in">
              <div className="view-card-header">
                <h2 className="view-title">Practice Attempt History</h2>
                <p className="view-desc">
                  Review all your standalone practice quiz attempts. Every attempt is saved independently and can be opened for answer review.
                </p>
              </div>

              {practiceHistoryList.length > 0 ? (
                <div className="practice-history-table-wrapper">
                  <table className="practice-history-table">
                    <thead>
                      <tr>
                        <th>Attempt</th>
                        <th>Date & Time</th>
                        <th>Subject</th>
                        <th>Topic / Scope</th>
                        <th>Questions</th>
                        <th>Score</th>
                        <th>Accuracy</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {practiceHistoryList.map((attempt, index) => {
                        const dateStr = attempt.attemptedAt
                          ? new Date(attempt.attemptedAt).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : attempt.date || "Recent";

                        const pct = attempt.percentage ?? Math.round((attempt.score / attempt.totalQuestions) * 100);

                        return (
                          <tr key={attempt.id} className="history-table-row">
                            <td className="attempt-id-cell">
                              <span className="attempt-badge">#{practiceHistoryList.length - index}</span>
                            </td>
                            <td className="attempt-date-cell">{dateStr}</td>
                            <td className="attempt-subject-cell">{attempt.subjectName || "Subject"}</td>
                            <td className="attempt-topic-cell font-semibold">{attempt.topicTitle || "General Practice"}</td>
                            <td className="attempt-qcount-cell">{attempt.totalQuestions} Qs</td>
                            <td className="attempt-score-cell">{attempt.score} / {attempt.totalQuestions}</td>
                            <td className="attempt-pct-cell">
                              <span className={`score-badge ${pct >= 80 ? "good" : pct >= 60 ? "medium" : "low"}`}>
                                {pct}%
                              </span>
                            </td>
                            <td className="attempt-action-cell">
                              <button
                                className="btn btn-sm btn-outline review-btn"
                                onClick={() => setReviewingAttempt(attempt)}
                              >
                                <Eye size={14} />
                                <span>Review</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="clean-empty-state-box">
                  <FileQuestion size={40} className="empty-icon text-muted" />
                  <h3>No practice attempts yet</h3>
                  <p>Start your first quiz above to track your progress and review detailed answer explanations.</p>
                  <button className="btn btn-primary" onClick={() => setPracticeMode("by_topic")}>
                    Start Practice Quiz
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= RECENT PRACTICE & NEEDS PRACTICE SPLIT GRID ================= */}
          <div className="grid-2 performance-split-grid">
            {/* 1. Recent Practice Widget */}
            <section className="card practice-list-card" aria-labelledby="heading-recent">
              <div className="card-top-bar">
                <h3 id="heading-recent" className="list-title">Recent Practice</h3>
                <span className="list-count-badge">{recentPracticeList.length} attempts</span>
              </div>

              {recentPracticeList.length > 0 ? (
                <div className="recent-attempts-stack">
                  {recentPracticeList.map((a) => (
                    <div key={a.id} className="recent-attempt-item">
                      <div className="attempt-info">
                        <h4 className="attempt-topic-name">{a.topicTitle}</h4>
                        <span className="attempt-meta">
                          {a.subjectName} · {a.date} · {a.totalQuestions} questions
                        </span>
                      </div>
                      <div className="attempt-score-badge">
                        <span className={`score-badge ${a.percentage >= 80 ? "good" : a.percentage >= 60 ? "medium" : "low"}`}>
                          {a.score} / {a.totalQuestions} ({a.percentage}%)
                        </span>
                        <button
                          className="btn-link-action"
                          onClick={() => setReviewingAttempt(a)}
                          title="Review this attempt"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-practice-placeholder">
                  <FileQuestion size={24} className="empty-icon" />
                  <p className="empty-text">No practice history yet.</p>
                  <span className="empty-subtext">Complete your first quiz to start tracking your progress.</span>
                  <button className="btn btn-primary btn-sm mt-3" onClick={startQuickQuiz}>
                    Start Practice
                  </button>
                </div>
              )}
            </section>

            {/* 2. Needs More Practice & Strong Areas */}
            <section className="card practice-list-card" aria-labelledby="heading-focus">
              <div className="card-top-bar">
                <h3 id="heading-focus" className="list-title">Needs More Practice</h3>
                <span className="badge badge-danger">{weakTopicsList.length} topics</span>
              </div>

              {weakTopicsList.length > 0 ? (
                <div className="needs-practice-stack">
                  {weakTopicsList.slice(0, 4).map((t) => (
                    <div key={t.id} className="focus-topic-item">
                      <div className="focus-left">
                        <span className="dot-indicator danger" />
                        <div>
                          <h4 className="focus-title">{t.title}</h4>
                          <span className="focus-msg">
                            Your recent practice shows that you need more practice here.
                          </span>
                        </div>
                      </div>
                      <button
                        className="btn btn-outline btn-sm practice-now-btn"
                        onClick={() => startQuizForTopic(t.id, 5)}
                      >
                        Practice Now
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-practice-placeholder">
                  <CheckCircle2 size={24} className="icon-success" />
                  <p className="empty-text">Great job! No weak topics detected.</p>
                  <span className="empty-subtext">You're maintaining a solid score across all tested concepts.</span>
                </div>
              )}

              {/* Strong Areas Preview */}
              {strongTopicsList.length > 0 && (
                <div className="strong-areas-preview-box">
                  <span className="strong-label">
                    <CheckCircle2 size={14} className="icon-success" />
                    Strong Areas:
                  </span>
                  <div className="strong-tags-flow">
                    {strongTopicsList.slice(0, 3).map((st) => (
                      <span key={st.id} className="strong-tag">
                        🟢 {st.title} — You're doing well here.
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      ) : (
        /* =========================================================================
            ACTIVE QUIZ OR RESULTS SCREEN
            ========================================================================= */
        <div className="active-quiz-container animate-fade-in">
          {!quizSubmitted ? (
            /* ------------------ ACTIVE QUIZ INTERFACE ------------------ */
            <div className="card quiz-card">
              {/* Quiz Header & Context */}
              <div className="quiz-top-bar">
                <div className="quiz-context-labels">
                  <span className="quiz-sub-name">{activeSelectedSubject.name}</span>
                  <span className="quiz-sep">/</span>
                  <span className="quiz-mod-name">{activeSelectedModule.title.split(":")[0]}</span>
                  <span className="quiz-sep">/</span>
                  <span className="quiz-top-name">{activeSelectedTopic.title}</span>
                </div>

                <div className="quiz-header-actions">
                  <span className="q-progress-counter">
                    Question {currentQuestionIndex + 1} of {activeQuestions.length}
                  </span>
                  <button
                    className="btn btn-subtle btn-sm exit-quiz-btn"
                    onClick={handleExitQuiz}
                  >
                    Exit Quiz
                  </button>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="quiz-progress-track">
                <div
                  className="quiz-progress-fill"
                  style={{
                    width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%`
                  }}
                  role="progressbar"
                />
              </div>

              {/* Question Navigation Palette / Overview */}
              <div className="question-nav-palette">
                <span className="palette-label">Jump to question:</span>
                <div className="palette-pills-row">
                  {activeQuestions.map((_, idx) => {
                    const isAnswered = userAnswers[idx] !== undefined;
                    const isCurrent = idx === currentQuestionIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`palette-num-btn ${isCurrent ? "current" : ""} ${isAnswered ? "answered" : "unanswered"}`}
                        onClick={() => handleJumpToQuestion(idx)}
                        title={`Go to Question ${idx + 1} (${isAnswered ? "Answered" : "Unanswered"})`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
                <span className="palette-stats">
                  {answeredTotalCount} of {activeQuestions.length} answered
                </span>
              </div>

              {quizRepeatNotice && (
                <div className="repeat-notice-banner">
                  <AlertCircle size={14} />
                  <span>{quizRepeatNotice}</span>
                </div>
              )}

              {/* Question Card Body */}
              <div className="quiz-question-body">
                <div className="question-meta-row">
                  <span className="q-type-badge">
                    {currentQ?.type === "true_false" ? "True / False" : "Multiple Choice"}
                  </span>
                  <span className="q-num-pill">
                    Question {currentQuestionIndex + 1} of {activeQuestions.length}
                  </span>
                  {userAnswers[currentQuestionIndex] !== undefined ? (
                    <span className="badge badge-success answered-status-badge">Answer Selected</span>
                  ) : (
                    <span className="badge badge-warning answered-status-badge">Unanswered</span>
                  )}
                </div>

                <h2 className="quiz-question-text">{currentQ?.question}</h2>

                {/* Options List */}
                <div className="quiz-options-list">
                  {currentQ?.options?.map((option, optIdx) => {
                    const isSelected = userAnswers[currentQuestionIndex] === optIdx;
                    const letter = String.fromCharCode(65 + optIdx);

                    return (
                      <button
                        key={optIdx}
                        className={`quiz-option-btn ${isSelected ? "selected-active" : ""}`}
                        onClick={() => handleSelectOption(optIdx)}
                      >
                        <span className="option-key-badge">{letter}</span>
                        <span className="option-text">{option}</span>
                        {isSelected && (
                          <CheckCircle2 size={18} className="icon-success ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quiz Footer Controls */}
              <div className="quiz-footer-controls">
                <button
                  className="btn btn-outline"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="footer-right-buttons">
                  {currentQuestionIndex < activeQuestions.length - 1 ? (
                    <button
                      className="btn btn-primary"
                      onClick={handleNextQuestion}
                    >
                      <span>Next Question</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : null}

                  {/* Submission Trigger */}
                  <button
                    className="btn btn-success submit-quiz-btn"
                    onClick={() => setShowSubmitConfirm(true)}
                    disabled={isSubmittingQuiz}
                  >
                    <span>{isSubmittingQuiz ? "Submitting..." : "Submit Quiz"}</span>
                    <CheckCircle2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ------------------ QUIZ RESULTS SCREEN ------------------ */
            <div className="card results-presentation-card animate-fade-in">
              <div className="results-header-hero">
                <span className="results-emoji-hero">🎉</span>
                <h2 className="results-hero-title">Practice Complete</h2>

                {quizSaveError && (
                  <div className="quiz-save-error-banner">
                    <AlertTriangle size={16} color="#f59e0b" />
                    <span>{quizSaveError}</span>
                  </div>
                )}

                {/* Score & Percentage Summary Breakdown */}
                {(() => {
                  const score = calculateFinalScore();
                  const total = activeQuestions.length;
                  const answeredCount = Object.keys(userAnswers).length;
                  const unanswered = Math.max(0, total - answeredCount);
                  const incorrect = Math.max(0, total - score - unanswered);
                  const pct = Math.round((score / total) * 100);

                  let interpretation = "This topic needs more practice.";
                  let interpBadge = "badge-danger";
                  if (pct >= 80) {
                    interpretation = "You're doing well.";
                    interpBadge = "badge-success";
                  } else if (pct >= 60) {
                    interpretation = "You're getting there. A little more practice will help.";
                    interpBadge = "badge-warning";
                  }

                  return (
                    <div className="score-summary-display">
                      <div className="score-circle-badge">
                        <span className="score-big">{score} / {total}</span>
                        <span className="score-pct-label">{pct}% Accuracy</span>
                      </div>

                      <div className="score-verdict-box">
                        <span className={`badge ${interpBadge} verdict-pill`}>{interpretation}</span>
                        <div className="stats-breakdown-row">
                          <span className="stat-pill neutral">
                            {total} Total Questions
                          </span>
                          <span className="stat-pill success">
                            <CheckCircle2 size={14} /> {score} Correct
                          </span>
                          <span className="stat-pill danger">
                            <XCircle size={14} /> {incorrect} Incorrect
                          </span>
                          <span className="stat-pill warning">
                            <HelpCircle size={14} /> {unanswered} Unanswered
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Contextual Recommendation Card */}
              {(() => {
                const score = calculateFinalScore();
                const total = activeQuestions.length;
                const pct = Math.round((score / total) * 100);

                return (
                  <div className={`card recommendation-action-banner ${pct >= 80 ? "banner-success" : pct >= 60 ? "banner-neutral" : "banner-warning"}`}>
                    <div className="rec-text">
                      <span className="rec-caption">
                        {pct >= 80 ? "Strong Area" : pct >= 60 ? "Getting There" : "Needs Practice"}
                      </span>
                      <p className="rec-message">
                        {pct >= 80
                          ? "You've mastered this concept! Try another quiz or move to the next syllabus topic."
                          : pct >= 60
                          ? "Good effort! Review the detailed answers below and try another practice quiz to solidify your understanding."
                          : "This topic needs more practice. Review your mistake explanations and practice again."}
                      </p>
                    </div>
                    <div className="rec-cta-buttons">
                      <button
                        className="btn btn-primary"
                        onClick={() => startQuizForTopic(activeSelectedTopic.id, questionCount)}
                        disabled={isGeneratingQuestions}
                      >
                        {isGeneratingQuestions ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw size={16} />
                            <span>Try Another Quiz ({questionCount} Qs)</span>
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-outline"
                        onClick={() => setQuizActive(false)}
                      >
                        <ArrowLeft size={16} />
                        <span>Back to Practice</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Question Review Section with Verified Answer Keys & Explanations */}
              <div className="question-review-section">
                <h3 className="review-title">Review Answers</h3>
                <div className="review-cards-stack">
                  {activeQuestions.map((q, idx) => {
                    const userChoice = userAnswers[idx];
                    const isAnswered = userChoice !== undefined;
                    const isCorrect = isAnswered && userChoice === q.correctAnswer;
                    const isUnanswered = !isAnswered;

                    return (
                      <div
                        key={idx}
                        className={`card review-question-card ${isCorrect ? "correct-card" : isUnanswered ? "unanswered-card" : "incorrect-card"}`}
                      >
                        <div className="review-card-top">
                          <span className="review-q-num">Question {idx + 1} of {activeQuestions.length}</span>
                          <span className={`review-status-tag ${isCorrect ? "tag-correct" : isUnanswered ? "tag-warning" : "tag-incorrect"}`}>
                            {isCorrect ? (
                              <>
                                <CheckCircle2 size={14} /> Correct
                              </>
                            ) : isUnanswered ? (
                              <>
                                <HelpCircle size={14} /> Unanswered
                              </>
                            ) : (
                              <>
                                <XCircle size={14} /> Incorrect
                              </>
                            )}
                          </span>
                        </div>

                        <h4 className="review-question-text">{q.question}</h4>

                        <div className="review-answers-box">
                          <div className="answer-row">
                            <span className="ans-label">Your answer:</span>
                            <span className={`ans-val ${isCorrect ? "text-success font-semibold" : isUnanswered ? "text-warning" : "text-danger font-semibold"}`}>
                              {isAnswered ? q.options[userChoice] : "Left Unanswered"}
                            </span>
                          </div>

                          {!isCorrect && (
                            <div className="answer-row">
                              <span className="ans-label">Correct answer:</span>
                              <span className="ans-val text-success font-semibold">
                                {q.options[q.correctAnswer]}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="review-explanation-box">
                          <strong>Why:</strong> {q.explanation}
                        </div>

                        {!isCorrect && (
                          <div style={{ marginTop: "0.6rem", display: "flex", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline ask-tutor-cta"
                              onClick={() => {
                                openTutorForMistake({
                                  topic: activeSelectedTopic,
                                  question: q,
                                  studentAnswer: isAnswered ? q.options[userChoice] : "Unanswered",
                                  correctAnswer: q.options[q.correctAnswer]
                                });
                              }}
                            >
                              <Sparkles size={14} />
                              <span>Ask AI Tutor to Explain</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="results-bottom-actions-row">
                <button
                  className="btn btn-outline"
                  onClick={() => setQuizActive(false)}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Practice</span>
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setQuizActive(false);
                    setPracticeMode("history");
                  }}
                >
                  <History size={16} />
                  <span>View Practice History</span>
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => startQuizForTopic(activeSelectedTopic.id, questionCount)}
                  disabled={isGeneratingQuestions}
                >
                  {isGeneratingQuestions ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw size={16} />
                      <span>Try Another Quiz ({questionCount} Qs)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          CONFIRMATION MODAL: BEFORE FINAL QUIZ SUBMISSION
          ========================================================================= */}
      {showSubmitConfirm && (
        <div className="confirm-modal-overlay animate-fade-in" onClick={() => setShowSubmitConfirm(false)}>
          <div className="card confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <CheckCircle2 size={36} className="modal-icon text-primary" />
            <h3 className="modal-title">Ready to Submit Quiz?</h3>
            <p className="modal-desc">
              You have answered <strong>{answeredTotalCount}</strong> of <strong>{activeQuestions.length}</strong> questions.
              {activeQuestions.length - answeredTotalCount > 0 ? (
                <span className="unanswered-warning-note">
                  {" "}({activeQuestions.length - answeredTotalCount} question(s) remain unanswered).
                </span>
              ) : (
                <span> All questions answered!</span>
              )}
            </p>
            <div className="modal-actions-row">
              <button
                className="btn btn-outline"
                onClick={() => setShowSubmitConfirm(false)}
              >
                Review Questions
              </button>
              <button
                className="btn btn-success"
                onClick={handleSubmitQuiz}
                disabled={isSubmittingQuiz}
              >
                {isSubmittingQuiz ? "Submitting..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRMATION MODAL: LEAVE ACTIVE QUIZ
          ========================================================================= */}
      {showExitConfirm && (
        <div className="confirm-modal-overlay animate-fade-in" onClick={() => setShowExitConfirm(false)}>
          <div className="card confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <AlertTriangle size={32} className="modal-icon text-warning" />
            <h3 className="modal-title">Leave Active Quiz?</h3>
            <p className="modal-desc">
              You haven't submitted your practice set yet. If you exit now, your answers will not be recorded.
            </p>
            <div className="modal-actions-row">
              <button
                className="btn btn-outline"
                onClick={() => setShowExitConfirm(false)}
              >
                Keep Practicing
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setShowExitConfirm(false);
                  setQuizActive(false);
                }}
              >
                Exit Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          REVIEW SAVED ATTEMPT MODAL (FROM PRACTICE HISTORY)
          ========================================================================= */}
      {reviewingAttempt && (
        <div className="confirm-modal-overlay animate-fade-in" onClick={() => setReviewingAttempt(null)}>
          <div className="card saved-attempt-review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="saved-review-header">
              <div>
                <span className="saved-review-badge">Saved Practice Attempt</span>
                <h3 className="saved-review-title">{reviewingAttempt.topicTitle}</h3>
                <span className="saved-review-meta">
                  {reviewingAttempt.subjectName} · {reviewingAttempt.date} · {reviewingAttempt.totalQuestions} Questions · Score: {reviewingAttempt.score}/{reviewingAttempt.totalQuestions} ({reviewingAttempt.percentage}%)
                </span>
              </div>
              <button
                className="btn btn-subtle btn-sm"
                onClick={() => setReviewingAttempt(null)}
              >
                ✕ Close
              </button>
            </div>

            <div className="saved-review-scroll-body">
              {reviewingAttempt.answers && reviewingAttempt.answers.length > 0 ? (
                reviewingAttempt.answers.map((ans, idx) => {
                  const isCorrect = ans.isCorrect;
                  const isUnanswered = ans.isUnanswered || ans.selectedOption === null;

                  return (
                    <div
                      key={idx}
                      className={`card review-question-card ${isCorrect ? "correct-card" : isUnanswered ? "unanswered-card" : "incorrect-card"}`}
                    >
                      <div className="review-card-top">
                        <span className="review-q-num">Question {idx + 1}</span>
                        <span className={`review-status-tag ${isCorrect ? "tag-correct" : isUnanswered ? "tag-warning" : "tag-incorrect"}`}>
                          {isCorrect ? "✓ Correct" : isUnanswered ? "? Unanswered" : "✕ Incorrect"}
                        </span>
                      </div>

                      <h4 className="review-question-text">{ans.question || `Question ${idx + 1}`}</h4>

                      <div className="review-answers-box">
                        <div className="answer-row">
                          <span className="ans-label">Submitted answer:</span>
                          <span className={`ans-val ${isCorrect ? "text-success font-semibold" : isUnanswered ? "text-warning" : "text-danger font-semibold"}`}>
                            {ans.options && ans.selectedOption !== null && ans.selectedOption !== undefined
                              ? ans.options[ans.selectedOption]
                              : (ans.selectedOption !== null ? `Option ${ans.selectedOption}` : "Left Unanswered")}
                          </span>
                        </div>

                        {!isCorrect && ans.options && (
                          <div className="answer-row">
                            <span className="ans-label">Correct answer:</span>
                            <span className="ans-val text-success font-semibold">
                              {ans.options[ans.correctOption]}
                            </span>
                          </div>
                        )}
                      </div>

                      {ans.explanation && (
                        <div className="review-explanation-box">
                          <strong>Why:</strong> {ans.explanation}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="empty-practice-placeholder">
                  <p>Detailed question review is not available for this legacy attempt.</p>
                </div>
              )}
            </div>

            <div className="saved-review-footer">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setReviewingAttempt(null);
                  startQuizForTopic(reviewingAttempt.topicId, reviewingAttempt.totalQuestions);
                }}
              >
                <RotateCcw size={16} />
                <span>Practice this Topic Again</span>
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setReviewingAttempt(null)}
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          COMPONENT STYLES
          ========================================================================= */}
      <style>{`
        .practice-page-wrapper {
          max-width: 980px;
          margin: 0 auto;
        }

        .practice-hero-header {
          margin-bottom: 24px;
        }

        .practice-main-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .practice-sub-title {
          font-size: 1rem;
          color: var(--text-muted);
          margin-bottom: 18px;
        }

        /* Subject Filter Bar */
        .subject-filter-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-surface);
          padding: 10px 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          overflow-x: auto;
          scrollbar-width: thin;
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .filter-pills-row {
          display: flex;
          gap: 6px;
        }

        .filter-pill {
          padding: 6px 12px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border);
          background: var(--bg-surface-hover);
          color: var(--text-secondary);
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .filter-pill:hover {
          color: var(--text-main);
          background: var(--bg-subtle);
        }

        .filter-pill.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        /* Practice Mode Selection Grid */
        .practice-modes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .mode-select-card {
          padding: 22px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .mode-select-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .mode-select-card.active {
          border-color: var(--primary);
          background: var(--primary-subtle);
        }

        .mode-icon-box {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        .bg-indigo { background: #e0e7ff; color: #4338ca; }
        .bg-emerald { background: #ecfdf5; color: #047857; }
        .bg-rose { background: #ffe4e6; color: #e11d48; }
        .bg-amber { background: #fef3c7; color: #d97706; }

        .mode-card-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .mode-card-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.45;
        }

        /* Topic Setup Card */
        .topic-setup-card {
          padding: 28px;
          margin-bottom: 28px;
          border-left: 4px solid var(--primary);
        }

        .setup-heading {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 4px;
        }

        .setup-subhead {
          font-size: 0.92rem;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        .hierarchy-selectors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .selector-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .picker-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.04em;
        }

        .styled-select {
          padding: 10px 14px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-main);
          font-size: 0.9rem;
          outline: none;
        }

        .styled-select:focus {
          border-color: var(--primary);
        }

        /* ================= QUESTION COUNT SELECTOR ================= */
        .question-count-selector-box {
          padding: 20px 24px;
          margin-bottom: 24px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
        }

        .selector-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .title-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .selector-main-label {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .prominent-count-badge {
          font-size: 1rem;
          font-weight: 800;
          color: var(--primary);
          background: var(--primary-subtle);
          padding: 4px 14px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .slider-wrapper {
          margin-bottom: 16px;
        }

        .discrete-range-slider {
          width: 100%;
          height: 10px;
          border-radius: 6px;
          background: var(--border);
          outline: none;
          cursor: pointer;
          accent-color: var(--primary);
          margin-bottom: 12px;
        }

        .slider-boundary-labels {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 0.82rem;
        }

        .boundary-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          background: var(--bg-surface-hover);
          color: var(--text-secondary);
          border: 1px solid var(--border);
          font-size: 0.78rem;
          font-weight: 600;
        }

        .boundary-pill strong {
          color: var(--primary);
        }

        .slider-current-hint {
          color: var(--text-muted);
          font-size: 0.78rem;
        }

        .number-strip-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .compact-step {
          flex: 1;
          min-width: 28px;
          height: 36px;
          padding: 0 4px;
          font-size: 0.88rem;
          border-radius: var(--radius-sm);
        }

        .step-number {
          font-weight: 700;
        }

        .slider-ticks-row {
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }

        .slider-tick-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--bg-surface-hover);
          color: var(--text-secondary);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .slider-tick-pill:hover {
          background: var(--bg-subtle);
          color: var(--text-main);
          border-color: var(--primary);
        }

        .slider-tick-pill.selected {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }

        .availability-status-row {
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }

        .availability-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
        }

        .ai-ready-notice {
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .generation-loading-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 24px;
          border-radius: var(--radius-lg);
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.25);
          margin-top: 16px;
        }

        .loading-banner-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .loading-banner-title {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--primary);
        }

        .loading-banner-desc {
          margin: 0;
          font-size: 0.84rem;
          color: var(--text-secondary);
        }

        .generation-error-card {
          margin-top: 16px;
          padding: 18px 22px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--danger);
          background: rgba(239, 68, 68, 0.06);
        }

        .error-card-inner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .error-card-title {
          margin: 0 0 4px;
          font-size: 0.95rem;
          color: var(--danger);
          font-weight: 700;
        }

        .error-card-desc {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .error-card-actions {
          display: flex;
          gap: 10px;
          margin-top: 14px;
          flex-wrap: wrap;
        }

        /* Topic Meta Banner */
        .topic-meta-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 22px;
          background: var(--bg-subtle);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .banner-left {
          flex: 1;
        }

        .banner-context {
          font-size: 0.8rem;
          color: var(--text-muted);
          display: block;
          margin-bottom: 4px;
        }

        .banner-topic-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .banner-chips-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .meta-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-secondary);
        }

        .start-quiz-cta {
          gap: 8px;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
        }

        /* ================= PRACTICE HISTORY VIEW ================= */
        .history-view-card {
          padding: 28px;
          margin-bottom: 28px;
        }

        .practice-history-table-wrapper {
          overflow-x: auto;
          margin-top: 16px;
        }

        .practice-history-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }

        .practice-history-table th {
          text-align: left;
          padding: 12px 14px;
          background: var(--bg-surface-hover);
          color: var(--text-muted);
          font-weight: 700;
          font-size: 0.78rem;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border);
        }

        .practice-history-table td {
          padding: 14px;
          border-bottom: 1px solid var(--border);
          color: var(--text-main);
        }

        .attempt-badge {
          background: var(--primary-subtle);
          color: var(--primary);
          font-weight: 700;
          font-size: 0.78rem;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .attempt-date-cell {
          color: var(--text-muted);
          font-size: 0.82rem;
        }

        .review-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        /* Performance Split Grid */
        .performance-split-grid {
          margin-top: 24px;
        }

        .practice-list-card {
          padding: 24px;
        }

        .card-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .list-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .list-count-badge {
          font-size: 0.78rem;
          color: var(--text-muted);
          background: var(--bg-surface-hover);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        .recent-attempts-stack, .needs-practice-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .recent-attempt-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          background: var(--bg-surface-hover);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          gap: 12px;
        }

        .attempt-topic-name {
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 2px;
        }

        .attempt-meta {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .attempt-score-badge {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .score-badge {
          font-size: 0.8rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
        }

        .score-badge.good { background: #ecfdf5; color: #047857; }
        .score-badge.medium { background: #fffbeb; color: #b45309; }
        .score-badge.low { background: #fef2f2; color: #b91c1c; }

        .btn-link-action {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-link-action:hover {
          text-decoration: underline;
        }

        .focus-topic-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          border-radius: var(--radius-md);
          gap: 12px;
        }

        .focus-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dot-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .dot-indicator.danger { background: #ef4444; }

        .focus-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: #9f1239;
          margin-bottom: 2px;
        }

        .focus-msg {
          font-size: 0.78rem;
          color: #be123c;
        }

        .strong-areas-preview-box {
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px dashed var(--border);
        }

        .strong-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #047857;
          margin-bottom: 8px;
        }

        .strong-tags-flow {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .strong-tag {
          font-size: 0.82rem;
          color: #065f46;
        }

        .empty-practice-placeholder {
          text-align: center;
          padding: 28px 16px;
          color: var(--text-muted);
        }

        .empty-icon {
          color: var(--text-dim);
          margin-bottom: 8px;
        }

        .empty-text {
          font-weight: 600;
          color: var(--text-main);
          font-size: 0.92rem;
        }

        .empty-subtext {
          font-size: 0.82rem;
        }

        /* Weak Topics View */
        .weak-topics-view-card {
          padding: 28px;
          margin-bottom: 28px;
        }

        .view-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 4px;
        }

        .view-desc {
          font-size: 0.92rem;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        .weak-topics-table {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .weak-topic-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          border-radius: var(--radius-md);
          gap: 14px;
        }

        .weak-topic-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .weak-t-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #9f1239;
        }

        .weak-t-sub {
          font-size: 0.82rem;
          color: #be123c;
        }

        .weak-topic-actions {
          display: flex;
          gap: 8px;
        }

        .clean-empty-state-box {
          text-align: center;
          padding: 36px 20px;
        }

        .empty-icon-emoji {
          font-size: 2.2rem;
          margin-bottom: 10px;
          display: block;
        }

        /* ================= QUIZ SCREEN ================= */
        .quiz-card {
          padding: 32px 36px;
          margin-bottom: 24px;
        }

        .quiz-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .quiz-context-labels {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .quiz-sub-name {
          font-weight: 600;
          color: var(--text-main);
        }

        .quiz-sep {
          margin: 0 6px;
          color: var(--text-dim);
        }

        .quiz-header-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .q-progress-counter {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--primary);
        }

        .exit-quiz-btn {
          color: var(--text-muted);
        }

        .quiz-progress-track {
          height: 6px;
          background: var(--border);
          border-radius: var(--radius-full);
          margin-bottom: 18px;
          overflow: hidden;
        }

        .quiz-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary) 0%, #10b981 100%);
          border-radius: var(--radius-full);
          transition: width 0.25s ease;
        }

        /* Question Navigation Palette */
        .question-nav-palette {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: var(--bg-surface-hover);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .palette-label {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .palette-pills-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .palette-num-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          border: 1px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-secondary);
        }

        .palette-num-btn.answered {
          background: var(--primary-subtle);
          border-color: rgba(99, 102, 241, 0.4);
          color: var(--primary);
        }

        .palette-num-btn.current {
          box-shadow: 0 0 0 2px var(--primary);
          font-weight: 800;
        }

        .palette-stats {
          margin-left: auto;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .repeat-notice-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: var(--radius-sm);
          color: #1e40af;
          font-size: 0.82rem;
          margin-bottom: 20px;
        }

        .quiz-question-body {
          margin-bottom: 28px;
        }

        .question-meta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }

        .q-type-badge {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          background: var(--bg-surface-hover);
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }

        .q-num-pill {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .answered-status-badge {
          margin-left: auto;
          font-size: 0.75rem;
        }

        .quiz-question-text {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1.45;
          margin-bottom: 22px;
        }

        .quiz-options-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .quiz-option-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-radius: var(--radius-md);
          border: 2px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-main);
          font-size: 0.95rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .quiz-option-btn:hover {
          border-color: var(--primary);
          background: var(--bg-surface-hover);
        }

        .quiz-option-btn.selected-active {
          border-color: var(--primary);
          background: var(--primary-subtle);
          color: var(--text-main);
          font-weight: 600;
        }

        .option-key-badge {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-surface-hover);
          color: var(--text-secondary);
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .quiz-footer-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 18px;
          border-top: 1px solid var(--border);
        }

        .footer-right-buttons {
          display: flex;
          gap: 10px;
        }

        .submit-quiz-btn {
          gap: 8px;
          background: #10b981;
          color: white;
          border: none;
        }

        .submit-quiz-btn:hover:not(:disabled) {
          background: #059669;
        }

        /* ================= RESULTS SCREEN ================= */
        .results-presentation-card {
          padding: 36px;
        }

        .results-header-hero {
          text-align: center;
          margin-bottom: 28px;
        }

        .results-emoji-hero {
          font-size: 3rem;
          display: block;
          margin-bottom: 8px;
        }

        .results-hero-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 20px;
        }

        .quiz-save-error-banner {
          padding: 8px 12px;
          margin: 10px auto;
          max-width: 500px;
          background-color: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          color: var(--text-main);
        }

        .score-summary-display {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 28px;
          flex-wrap: wrap;
        }

        .score-circle-badge {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: var(--primary-subtle);
          border: 4px solid var(--primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .score-big {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--primary);
        }

        .score-pct-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .score-verdict-box {
          text-align: left;
        }

        .verdict-pill {
          font-size: 1rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          display: inline-block;
          margin-bottom: 12px;
        }

        .stats-breakdown-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: var(--radius-sm);
        }

        .stat-pill.success { background: #ecfdf5; color: #047857; }
        .stat-pill.danger { background: #fef2f2; color: #b91c1c; }
        .stat-pill.warning { background: #fffbeb; color: #b45309; }
        .stat-pill.neutral { background: var(--bg-surface-hover); color: var(--text-secondary); }

        .recommendation-action-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 26px;
          margin-bottom: 32px;
          border-radius: var(--radius-lg);
          gap: 18px;
          flex-wrap: wrap;
        }

        .banner-warning { background: #fff1f2; border: 1px solid #fecdd3; }
        .banner-neutral { background: #fffbeb; border: 1px solid #fde68a; }
        .banner-success { background: #ecfdf5; border: 1px solid #a7f3d0; }

        .rec-text {
          flex: 1;
        }

        .rec-caption {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          display: block;
          margin-bottom: 4px;
        }

        .rec-message {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .rec-cta-buttons {
          display: flex;
          gap: 10px;
        }

        /* Question Review Section */
        .question-review-section {
          margin-bottom: 32px;
        }

        .review-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 18px;
        }

        .review-cards-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .review-question-card {
          padding: 20px 24px;
        }

        .correct-card { border-left: 4px solid #10b981; }
        .incorrect-card { border-left: 4px solid #ef4444; }
        .unanswered-card { border-left: 4px solid #f59e0b; }

        .review-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .review-q-num {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .review-status-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .tag-correct { background: #ecfdf5; color: #047857; }
        .tag-incorrect { background: #fef2f2; color: #b91c1c; }
        .tag-warning { background: #fffbeb; color: #b45309; }

        .review-question-text {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 14px;
        }

        .review-answers-box {
          background: var(--bg-surface-hover);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .answer-row {
          display: flex;
          gap: 8px;
          font-size: 0.9rem;
        }

        .ans-label {
          color: var(--text-muted);
          width: 140px;
          flex-shrink: 0;
        }

        .review-explanation-box {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          padding: 10px 14px;
          background: var(--bg-subtle);
          border-radius: var(--radius-sm);
        }

        .ask-tutor-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          border-color: #6366f1;
          color: #6366f1;
          background: rgba(99, 102, 241, 0.06);
        }

        .results-bottom-actions-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }

        /* Modal Overlay & Cards */
        .confirm-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .confirm-modal-card {
          max-width: 440px;
          width: 100%;
          padding: 28px;
          text-align: center;
        }

        .modal-icon {
          margin: 0 auto 12px;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .modal-desc {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 22px;
        }

        .unanswered-warning-note {
          color: #b45309;
          font-weight: 600;
        }

        .modal-actions-row {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        /* Saved Attempt Review Modal */
        .saved-attempt-review-modal {
          max-width: 780px;
          width: 100%;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          padding: 28px;
        }

        .saved-review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
        }

        .saved-review-badge {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--primary);
          background: var(--primary-subtle);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .saved-review-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 4px 0;
        }

        .saved-review-meta {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .saved-review-scroll-body {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-right: 8px;
          margin-bottom: 18px;
        }

        .saved-review-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .quiz-card, .results-presentation-card, .topic-setup-card {
            padding: 20px 18px;
          }

          .score-summary-display {
            flex-direction: column;
            text-align: center;
          }

          .score-verdict-box {
            text-align: center;
          }

          .stats-breakdown-row {
            justify-content: center;
          }

          .results-bottom-actions-row {
            flex-direction: column;
            width: 100%;
          }

          .results-bottom-actions-row button {
            width: 100%;
          }

          .recommendation-action-banner {
            flex-direction: column;
            text-align: center;
          }

          .rec-cta-buttons {
            width: 100%;
            flex-direction: column;
          }

          .rec-cta-buttons button {
            width: 100%;
          }

          .banner-right {
            width: 100%;
          }

          .start-quiz-cta {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
