import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  HelpCircle,
  Brain,
  Award,
  Zap,
  Globe,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  Clock,
  ArrowLeft,
  X,
  FileQuestion,
  GraduationCap,
  Copy,
  Check
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { SUBJECTS, MODULES, TOPICS } from "../data/syllabus";
import {
  askTutor,
  explainSimply,
  giveExample,
  explainStepByStep,
  getKeyPoints,
  getExamFocus,
  generateSummary,
  explainInMalayalam,
  generateQuestions,
  explainAnswer,
  getTutorBackendStatus
} from "../services/aiService";

export default function AITutor() {
  const {
    activeTopicId,
    selectTopic,
    topics,
    navigateTo,
    tutorSessionContext,
    setTutorSessionContext,
    startPracticeWithQuestions,
    startFocusForTopic,
    startActiveSession,
    stopActiveSession
  } = useApp();

  // Active Topic Context
  const currentTopic =
    topics.find((t) => t.id === activeTopicId) || topics[0] || TOPICS[0];
  const currentSubject =
    SUBJECTS.find((s) => s.id === currentTopic?.subjectId) || SUBJECTS[0];
  const currentModule =
    MODULES.find((m) => m.id === currentTopic?.moduleId) || MODULES[0];

  // Unified Activity Tracking for AI Tutor (Active time only)
  useEffect(() => {
    startActiveSession("ai_tutor", {
      subjectId: currentSubject?.id,
      moduleId: currentModule?.id,
      topicId: currentTopic?.id
    });
    return () => {
      stopActiveSession();
    };
  }, [currentTopic?.id, currentSubject?.id, currentModule?.id]);

  // Topic Change Modal / Drawer state
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [pickerSubjectId, setPickerSubjectId] = useState(currentSubject.id);
  const [pickerModuleId, setPickerModuleId] = useState(currentModule.id);

  // Chat conversation state
  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastFailedPrompt, setLastFailedPrompt] = useState(null);

  // Gemini Backend Status & Copy Response state
  const [tutorStatus, setTutorStatus] = useState(null);
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  // Fetch real Gemini tutor configuration status from FastAPI backend
  const checkTutorStatus = () => {
    getTutorBackendStatus()
      .then((status) => {
        setTutorStatus(status);
      })
      .catch(() => {});
  };

  useEffect(() => {
    checkTutorStatus();
  }, []);

  const handleCopyMessage = (msgId, text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  };

  // AI Question Generator Mini-Modal / Interactive Panel State
  const [showQuestionGenModal, setShowQuestionGenModal] = useState(false);
  const [genCount, setGenCount] = useState(5); // 5 or 10
  const [genFormat, setGenFormat] = useState("3 Mark Practice"); // "3 Mark Practice", "5 Mark Practice", "7 Mark Practice", "10 Mark Practice"
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generatedQuestionsSet, setGeneratedQuestionsSet] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initialize or handle context changes (e.g. from Learn, Practice mistake, or topic selection)
  useEffect(() => {
    // Check if opened with special context (such as mistake analysis from Practice)
    if (tutorSessionContext) {
      if (tutorSessionContext.initialAction === "explain_mistake" && tutorSessionContext.mistakeDetails) {
        handleDiagnoseMistake(tutorSessionContext.mistakeDetails);
        setTutorSessionContext(null);
        return;
      }
      if (tutorSessionContext.initialAction) {
        handleQuickAction(tutorSessionContext.initialAction);
        setTutorSessionContext(null);
        return;
      }
    }

    // Default welcome state for this topic if message list is empty
    if (messages.length === 0) {
      setMessages([
        {
          id: `welcome-${currentTopic.id}`,
          sender: "ai",
          text: `Hello Alex! 👋 I'm your dedicated AI Study Tutor for **${currentTopic.title}**.\n\nI understand the concepts, syllabus objectives, and high-yield examination areas for **${currentSubject.name}**.\n\nHow can I help you understand this concept today? You can choose any quick action below or ask me any question!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestions: [
            "Explain Simply",
            "Give an Example",
            "Explain Step by Step",
            "Give Key Points",
            "Exam Focus",
            "Explain in Malayalam",
            "Quiz Me"
          ]
        }
      ]);
    }
  }, [currentTopic.id, tutorSessionContext]);

  // Handle mistake diagnosis triggered from Practice
  const handleDiagnoseMistake = async (details) => {
    setIsLoading(true);
    setHasError(false);

    const userMsg = {
      id: `msg-user-mistake-${Date.now()}`,
      sender: "user",
      text: `Can you explain my mistake on this question from ${currentTopic.title}?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await explainAnswer({
        topic: details.topic || currentTopic,
        question: details.question,
        studentAnswer: details.studentAnswer,
        correctAnswer: details.correctAnswer
      });

      const aiMsg = {
        id: `msg-ai-${Date.now()}`,
        sender: "ai",
        text: response.reply,
        timestamp: response.timestamp,
        suggestions: response.suggestions
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setHasError(true);
      setLastFailedPrompt({ type: "mistake", details });
    } finally {
      setIsLoading(false);
    }
  };

  // Dispatch message to AI service
  const handleSendMessage = async (textToSend = null) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    setInputPrompt("");
    setIsLoading(true);
    setHasError(false);

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);

    try {
      // Check if user asked for question generation
      if (prompt.toLowerCase().includes("quiz me") || prompt.toLowerCase().includes("generate questions")) {
        setShowQuestionGenModal(true);
      }

      const response = await askTutor({
        subject: currentSubject,
        module: currentModule,
        topic: currentTopic,
        prompt: prompt,
        history: nextMessages
      });

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: response.reply,
        timestamp: response.timestamp,
        suggestions: response.suggestions
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setHasError(true);
      setLastFailedPrompt({ type: "text", prompt });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Quick Action Dispatcher
  const handleQuickAction = async (actionLabel) => {
    if (isLoading) return;

    const labelLower = actionLabel.toLowerCase();

    if (labelLower.includes("quiz me") || labelLower.includes("generate questions")) {
      setShowQuestionGenModal(true);
      return;
    }

    handleSendMessage(actionLabel);
  };

  // Generate Questions handler
  const handleExecuteQuestionGen = async () => {
    setIsGeneratingQuestions(true);
    try {
      const qs = await generateQuestions(currentTopic, genCount, genFormat);
      setGeneratedQuestionsSet(qs);

      // Add a message in chat showing that questions are ready
      const aiMsg = {
        id: `gen-ready-${Date.now()}`,
        sender: "ai",
        text: `### 🎯 Practice Questions Ready!\n\nI have generated **${qs.length} practice questions** tailored to **${currentTopic.title}** (${genFormat}).\n\nThese questions follow the StudySense practice format and are ready to test your concept mastery!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isGeneratedSetCard: true,
        generatedQuestions: qs,
        formatLabel: genFormat
      };

      setMessages((prev) => [...prev, aiMsg]);
      setShowQuestionGenModal(false);
    } catch (err) {
      setHasError(true);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Retry failed request
  const handleRetry = () => {
    if (!lastFailedPrompt) return;
    if (lastFailedPrompt.type === "mistake") {
      handleDiagnoseMistake(lastFailedPrompt.details);
    } else if (lastFailedPrompt.type === "text") {
      handleSendMessage(lastFailedPrompt.prompt);
    }
  };

  // Change Topic in Modal
  const handleSelectTopicFromPicker = (topicId) => {
    selectTopic(topicId);
    setShowTopicPicker(false);
    setMessages([]); // Refresh chat for new topic context
  };

  // Filter modules and topics for picker
  const pickerModules = MODULES.filter((m) => m.subjectId === pickerSubjectId);
  const pickerTopics = topics.filter((t) => t.moduleId === pickerModuleId);

  return (
    <div className="page-container aitutor-page-root animate-fade-in">
      {/* ================= PAGE HEADER & CONTEXT BAR ================= */}
      <div className="aitutor-header-card card">
        <div className="aitutor-header-main">
          <div className="tutor-title-lockup">
            <div className="tutor-sparkle-avatar">
              <Sparkles size={24} className="avatar-icon-glow" />
            </div>
            <div>
              <div className="tutor-title-row" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h1 className="aitutor-main-title">AI Tutor</h1>
                <span className="aitutor-context-badge">Context-Aware</span>
                <div
                  className="aitutor-gemini-status"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    padding: "3px 9px",
                    borderRadius: "12px",
                    backgroundColor: tutorStatus?.configured ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                    color: tutorStatus?.configured ? "#059669" : "#d97706",
                    border: `1px solid ${tutorStatus?.configured ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`
                  }}
                  title={tutorStatus?.message || "Gemini model status"}
                >
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      backgroundColor: tutorStatus?.configured ? "#10b981" : "#f59e0b",
                      display: "inline-block"
                    }}
                  />
                  <span>
                    {tutorStatus?.configured
                      ? `Gemini ${tutorStatus?.model || "3.5 Flash"} Online`
                      : "Gemini Config Pending"}
                  </span>
                </div>
              </div>
              <p className="aitutor-subtitle">Learn concepts your way.</p>
            </div>
          </div>

          {/* Current Topic Context Card */}
          <div className="current-context-card">
            <div className="context-card-left">
              <div className="context-subject-row">
                <span className="ctx-sub-code">{currentSubject.code}</span>
                <span className="ctx-sub-name">{currentSubject.name}</span>
                <span className="ctx-mod-name">· {currentModule.title.split("—")[0]}</span>
              </div>
              <h2 className="context-topic-headline">{currentTopic.title}</h2>
              <div className="context-meta-row">
                <span className="ctx-tag-pill">{currentTopic.difficulty || "medium"} difficulty</span>
                <span className="ctx-tag-pill">~{currentTopic.estimatedMinutes || 45} mins</span>
                <span className="ctx-tag-pill status-pill">Status: {currentTopic.status?.replace("_", " ") || "learning"}</span>
              </div>
            </div>

            <button
              className="btn btn-outline btn-sm change-topic-btn"
              onClick={() => {
                setPickerSubjectId(currentSubject.id);
                setPickerModuleId(currentModule.id);
                setShowTopicPicker(true);
              }}
              title="Change current topic"
            >
              <BookOpen size={15} />
              <span>Change Topic</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="tutor-quick-actions-bar">
          <span className="quick-action-label">Quick Actions:</span>
          <div className="quick-actions-scroll">
            <button
              className="quick-action-chip"
              onClick={() => handleQuickAction("Explain Simply")}
              disabled={isLoading}
            >
              <Sparkles size={14} />
              <span>Explain Simply</span>
            </button>
            <button
              className="quick-action-chip"
              onClick={() => handleQuickAction("Give an Example")}
              disabled={isLoading}
            >
              <Zap size={14} />
              <span>Give an Example</span>
            </button>
            <button
              className="quick-action-chip"
              onClick={() => handleQuickAction("Explain Step by Step")}
              disabled={isLoading}
            >
              <Layers size={14} />
              <span>Explain Step by Step</span>
            </button>
            <button
              className="quick-action-chip"
              onClick={() => handleQuickAction("Give Key Points")}
              disabled={isLoading}
            >
              <CheckCircle2 size={14} />
              <span>Key Points</span>
            </button>
            <button
              className="quick-action-chip"
              onClick={() => handleQuickAction("Exam Focus")}
              disabled={isLoading}
            >
              <GraduationCap size={14} />
              <span>Exam Focus</span>
            </button>
            <button
              className="quick-action-chip malayalam-chip"
              onClick={() => handleQuickAction("Explain in Malayalam")}
              disabled={isLoading}
            >
              <Globe size={14} />
              <span>Explain in Malayalam</span>
            </button>
            <button
              className="quick-action-chip quiz-chip"
              onClick={() => setShowQuestionGenModal(true)}
              disabled={isLoading}
            >
              <FileQuestion size={14} />
              <span>Quiz Me</span>
            </button>
            <button
              className="quick-action-chip"
              onClick={() => handleQuickAction("Summarize")}
              disabled={isLoading}
            >
              <Clock size={14} />
              <span>Summarize</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= CHAT STREAM CONTAINER ================= */}
      <div className="card aitutor-chat-container">
        <div className="aitutor-messages-stream">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`tutor-bubble-row ${msg.sender === "user" ? "user-row" : "ai-row"}`}
            >
              {msg.sender === "ai" && (
                <div className="tutor-bot-icon">
                  <Brain size={18} />
                </div>
              )}

              <div className={`tutor-speech-bubble ${msg.sender === "user" ? "user-bubble" : "ai-bubble"}`}>
                <div className="bubble-header-meta" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="sender-tag">{msg.sender === "user" ? "You" : "StudySense Tutor"}</span>
                    <span className="timestamp-tag">{msg.timestamp}</span>
                  </div>
                  {msg.sender === "ai" && (
                    <button
                      type="button"
                      className="btn-icon-subtle copy-msg-btn"
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      title="Copy response to clipboard"
                      style={{ padding: "2px 6px", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      {copiedMsgId === msg.id ? (
                        <>
                          <Check size={12} className="text-success" />
                          <span style={{ fontSize: "0.7rem", color: "var(--success)" }}>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span style={{ fontSize: "0.7rem" }}>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Formatted Markdown Content */}
                <div className="bubble-text-content">
                  {msg.text.split("\n\n").map((para, pIdx) => {
                    if (para.startsWith("### ")) {
                      return <h3 key={pIdx} className="content-h3">{para.replace("### ", "")}</h3>;
                    }
                    if (para.startsWith("#### ")) {
                      return <h4 key={pIdx} className="content-h4">{para.replace("#### ", "")}</h4>;
                    }
                    if (para.startsWith("> ")) {
                      return <blockquote key={pIdx} className="content-quote">{para.replace("> ", "")}</blockquote>;
                    }
                    if (para.startsWith("• ") || para.startsWith("- ")) {
                      const items = para.split("\n").filter(Boolean);
                      return (
                        <ul key={pIdx} className="content-list">
                          {items.map((item, iIdx) => (
                            <li key={iIdx}>
                              {item.replace(/^[•-]\s*/, "").replace(/\*\*(.*?)\*\*/g, "$1")}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={pIdx} className="content-para">
                        {para}
                      </p>
                    );
                  })}
                </div>

                {/* Optional Embedded Card for AI-Generated Question Set */}
                {msg.isGeneratedSetCard && (
                  <div className="ai-gen-question-banner">
                    <div className="gen-banner-header">
                      <div className="gen-banner-badge">
                        <Award size={16} />
                        <span>{msg.formatLabel}</span>
                      </div>
                      <span className="gen-banner-count">{msg.generatedQuestions?.length || 5} Questions Generated</span>
                    </div>

                    <p className="gen-banner-desc">
                      Practice these AI-tailored questions inside the StudySense Quiz Engine to evaluate your mastery and reinforce weak areas.
                    </p>

                    <div className="gen-banner-action-row">
                      <button
                        className="btn btn-primary btn-md"
                        onClick={() => startPracticeWithQuestions(currentTopic.id, msg.generatedQuestions, msg.formatLabel)}
                      >
                        <Play size={16} />
                        <span>Start Practice</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}


                {/* Follow-up Suggestions Chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="bubble-suggestions-row">
                    <span className="sugg-label">Suggested follow-ups:</span>
                    <div className="sugg-chips-wrap">
                      {msg.suggestions.map((sugg, sIdx) => (
                        <button
                          key={sIdx}
                          className="sugg-chip"
                          onClick={() => handleQuickAction(sugg)}
                          disabled={isLoading}
                        >
                          {sugg}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Animated Loading State */}
          {isLoading && (
            <div className="tutor-bubble-row ai-row animate-fade-in">
              <div className="tutor-bot-icon">
                <Brain size={18} className="pulse-icon" />
              </div>
              <div className="tutor-speech-bubble ai-bubble loading-bubble">
                <div className="loading-state-content">
                  <div className="loading-dots-bounce">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="loading-text">Preparing your explanation...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {hasError && (
            <div className="tutor-error-banner animate-fade-in">
              <AlertCircle size={20} className="icon-danger" />
              <div className="error-text-block">
                <strong>Something went wrong while preparing the explanation.</strong>
                <p>The system encountered a minor interruption. Your study session data is safe.</p>
              </div>
              <div className="error-actions">
                <button className="btn btn-primary btn-sm" onClick={handleRetry}>
                  <RotateCcw size={14} />
                  <span>Try Again</span>
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigateTo("learn", currentTopic.id)}
                >
                  <ArrowLeft size={14} />
                  <span>Back to Topic</span>
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ================= CHAT INPUT DOCK ================= */}
        <div className="aitutor-input-dock">
          <form
            className="tutor-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <textarea
              ref={inputRef}
              className="tutor-chat-textarea"
              placeholder={`Ask a question about ${currentTopic.title} (e.g. "What is this?", "Give me an example", "Explain in Malayalam")...`}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={2}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="btn btn-primary tutor-send-btn"
              disabled={!inputPrompt.trim() || isLoading}
              title="Send to AI Tutor (Enter)"
            >
              <Send size={18} />
              <span className="send-btn-text">Send</span>
            </button>
          </form>

          <div className="input-dock-footer-meta">
            <span>Press Enter to send · Shift+Enter for new line · AI grounded in KTU Semester V syllabus</span>
            <button
              className="clear-chat-link"
              onClick={() => setMessages([])}
              title="Clear conversation history"
            >
              Clear conversation
            </button>
          </div>
        </div>
      </div>

      {/* ================= TOPIC CHANGE MODAL ================= */}
      {showTopicPicker && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setShowTopicPicker(false)}>
          <div className="modal-card topic-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-lockup">
                <BookOpen size={20} className="text-primary" />
                <h3>Select Syllabus Topic</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowTopicPicker(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="topic-picker-body">
              {/* Subject Tabs */}
              <div className="picker-subject-tabs">
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub.id}
                    className={`picker-sub-tab ${pickerSubjectId === sub.id ? "active" : ""}`}
                    onClick={() => {
                      setPickerSubjectId(sub.id);
                      const mods = MODULES.filter((m) => m.subjectId === sub.id);
                      if (mods.length > 0) setPickerModuleId(mods[0].id);
                    }}
                  >
                    <span className="sub-tab-code">{sub.code}</span>
                    <span className="sub-tab-name">{sub.name}</span>
                  </button>
                ))}
              </div>

              {/* Module Filter */}
              <div className="picker-modules-row">
                {pickerModules.map((mod) => (
                  <button
                    key={mod.id}
                    className={`picker-mod-pill ${pickerModuleId === mod.id ? "active" : ""}`}
                    onClick={() => setPickerModuleId(mod.id)}
                  >
                    {mod.title.split("—")[0]}
                  </button>
                ))}
              </div>

              {/* Topics List */}
              <div className="picker-topics-grid">
                {pickerTopics.map((top) => (
                  <div
                    key={top.id}
                    className={`picker-topic-item ${top.id === currentTopic.id ? "current-active" : ""}`}
                    onClick={() => handleSelectTopicFromPicker(top.id)}
                  >
                    <div className="picker-topic-info">
                      <h4 className="top-title">{top.title}</h4>
                      <span className="top-meta">
                        {top.difficulty || "medium"} · {top.estimatedMinutes || 45} mins · {top.status?.replace("_", " ") || "learning"}
                      </span>
                    </div>
                    <ChevronRight size={18} className="picker-arrow" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= AI QUESTION GENERATOR MODAL ================= */}
      {showQuestionGenModal && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setShowQuestionGenModal(false)}>
          <div className="modal-card question-gen-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-lockup">
                <Sparkles size={20} className="text-primary" />
                <h3>Generate AI Practice Questions</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowQuestionGenModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="gen-modal-body">
              <div className="gen-context-preview">
                <span className="gen-sub-pill">{currentSubject.name}</span>
                <h4 className="gen-topic-title">{currentTopic.title}</h4>
                <p className="gen-topic-desc">
                  Generates interactive multiple-choice and conceptual practice questions matching the StudySense schema.
                </p>
              </div>

              {/* Question Count Selector */}
              <div className="gen-config-block">
                <label className="config-label">Question Count:</label>
                <div className="config-pills-row">
                  {[5, 10].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      className={`config-pill ${genCount === cnt ? "active" : ""}`}
                      onClick={() => setGenCount(cnt)}
                    >
                      {cnt} Questions
                    </button>
                  ))}
                </div>
              </div>

              {/* Practice Format Selector */}
              <div className="gen-config-block">
                <div className="config-label-row">
                  <label className="config-label">Practice Format:</label>
                  <span className="config-subnote">(Practice format only — not official university exam pattern)</span>
                </div>
                <div className="config-pills-row">
                  {[
                    "3 Mark Practice",
                    "5 Mark Practice",
                    "7 Mark Practice",
                    "10 Mark Practice"
                  ].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      className={`config-pill ${genFormat === fmt ? "active" : ""}`}
                      onClick={() => setGenFormat(fmt)}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="gen-modal-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => setShowQuestionGenModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleExecuteQuestionGen}
                  disabled={isGeneratingQuestions}
                >
                  {isGeneratingQuestions ? (
                    <>
                      <Sparkles size={16} className="animate-spin" />
                      <span>Generating Questions...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      <span>Generate & Preview ({genCount} Qs)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= COMPONENT STYLES ================= */}
      <style>{`
        .aitutor-page-root {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-width: 1100px;
          margin: 0 auto;
          padding: 1.5rem 1rem 3rem;
        }

        .aitutor-header-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background: var(--card-bg, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .aitutor-header-main {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .tutor-title-lockup {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .tutor-sparkle-avatar {
          width: 3rem;
          height: 3rem;
          border-radius: 0.875rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .tutor-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .aitutor-main-title {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: var(--text-primary, #0f172a);
          margin: 0;
        }

        .aitutor-context-badge {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          text-transform: uppercase;
        }

        .aitutor-subtitle {
          color: var(--text-secondary, #64748b);
          font-size: 0.9375rem;
          margin: 0.2rem 0 0;
        }

        /* Current Context Card */
        .current-context-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          background: var(--bg-secondary, #f8fafc);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 0.75rem;
          gap: 1rem;
        }

        .context-card-left {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .context-subject-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--text-secondary, #64748b);
          font-weight: 500;
        }

        .ctx-sub-code {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
          padding: 0.15rem 0.45rem;
          border-radius: 0.375rem;
          font-weight: 700;
          font-size: 0.75rem;
        }

        .context-topic-headline {
          font-size: 1.1875rem;
          font-weight: 700;
          color: var(--text-primary, #0f172a);
          margin: 0;
        }

        .context-meta-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .ctx-tag-pill {
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
          border-radius: 0.375rem;
          background: rgba(0, 0, 0, 0.05);
          color: var(--text-secondary, #64748b);
          font-weight: 600;
          text-transform: capitalize;
        }

        .ctx-tag-pill.status-pill {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        }

        .change-topic-btn {
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Quick Actions Bar */
        .tutor-quick-actions-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-color, #e2e8f0);
        }

        .quick-action-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-secondary, #64748b);
          white-space: nowrap;
        }

        .quick-actions-scroll {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
          scrollbar-width: thin;
        }

        .quick-action-chip {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.85rem;
          background: var(--bg-secondary, #f8fafc);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 9999px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-primary, #1e293b);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .quick-action-chip:hover:not(:disabled) {
          background: #6366f1;
          border-color: #6366f1;
          color: white;
          transform: translateY(-1px);
        }

        .quick-action-chip.malayalam-chip {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.3);
          color: #b45309;
        }

        .quick-action-chip.malayalam-chip:hover:not(:disabled) {
          background: #d97706;
          border-color: #d97706;
          color: white;
        }

        .quick-action-chip.quiz-chip {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
          color: #047857;
        }

        .quick-action-chip.quiz-chip:hover:not(:disabled) {
          background: #059669;
          border-color: #059669;
          color: white;
        }

        /* Chat Container */
        .aitutor-chat-container {
          display: flex;
          flex-direction: column;
          height: 620px;
          padding: 0;
          overflow: hidden;
          background: var(--card-bg, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .aitutor-messages-stream {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background: var(--bg-main, #fafafa);
        }

        .tutor-bubble-row {
          display: flex;
          gap: 0.75rem;
          max-width: 85%;
        }

        .tutor-bubble-row.user-row {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .tutor-bubble-row.ai-row {
          align-self: flex-start;
        }

        .tutor-bot-icon {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 0.625rem;
          background: #6366f1;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .tutor-speech-bubble {
          padding: 1.125rem 1.25rem;
          border-radius: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          line-height: 1.6;
        }

        .tutor-speech-bubble.user-bubble {
          background: #6366f1;
          color: white;
          border-bottom-right-radius: 0.25rem;
        }

        .tutor-speech-bubble.ai-bubble {
          background: var(--card-bg, #ffffff);
          color: var(--text-primary, #1e293b);
          border: 1px solid var(--border-color, #e2e8f0);
          border-bottom-left-radius: 0.25rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }

        .bubble-header-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
        }

        .user-bubble .bubble-header-meta {
          color: rgba(255, 255, 255, 0.8);
        }

        .ai-bubble .bubble-header-meta {
          color: var(--text-secondary, #64748b);
        }

        .sender-tag {
          font-weight: 700;
        }

        .bubble-text-content {
          font-size: 0.9375rem;
        }

        .content-h3 {
          font-size: 1.0625rem;
          font-weight: 700;
          margin: 0.5rem 0 0.35rem;
          color: #4f46e5;
        }

        .user-bubble .content-h3 {
          color: #ffffff;
        }

        .content-h4 {
          font-size: 0.9375rem;
          font-weight: 700;
          margin: 0.4rem 0 0.25rem;
        }

        .content-para {
          margin: 0 0 0.65rem;
          white-space: pre-wrap;
        }

        .content-quote {
          border-left: 3px solid #6366f1;
          padding-left: 0.75rem;
          margin: 0.5rem 0;
          font-style: italic;
          background: rgba(99, 102, 241, 0.05);
          padding: 0.5rem 0.75rem;
          border-radius: 0.25rem;
        }

        .content-list {
          margin: 0.25rem 0 0.75rem;
          padding-left: 1.25rem;
        }

        .content-list li {
          margin-bottom: 0.35rem;
        }

        /* AI Generated Question Banner inside Bubble */
        .ai-gen-question-banner {
          margin-top: 0.75rem;
          padding: 1rem;
          background: rgba(99, 102, 241, 0.06);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .gen-banner-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .gen-banner-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #6366f1;
          color: white;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .gen-banner-count {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #4f46e5;
        }

        .gen-banner-desc {
          font-size: 0.875rem;
          color: var(--text-secondary, #475569);
          margin: 0;
        }

        .gen-banner-action-row {
          display: flex;
          justify-content: flex-end;
        }

        /* Follow-up Suggestions */
        .bubble-suggestions-row {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px dashed var(--border-color, #e2e8f0);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .sugg-label {
          font-size: 0.75rem;
          color: var(--text-secondary, #64748b);
          font-weight: 600;
        }

        .sugg-chips-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .sugg-chip {
          padding: 0.25rem 0.65rem;
          background: var(--bg-secondary, #f8fafc);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: #4f46e5;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sugg-chip:hover {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }

        /* Loading Bubble */
        .loading-bubble {
          padding: 0.75rem 1rem;
        }

        .loading-state-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .loading-dots-bounce {
          display: flex;
          gap: 0.3rem;
        }

        .loading-dots-bounce span {
          width: 0.45rem;
          height: 0.45rem;
          background: #6366f1;
          border-radius: 50%;
          animation: bounceDots 1.4s infinite ease-in-out both;
        }

        .loading-dots-bounce span:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots-bounce span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounceDots {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .loading-text {
          font-size: 0.875rem;
          color: var(--text-secondary, #64748b);
          font-style: italic;
        }

        .pulse-icon {
          animation: pulseIcon 1.5s infinite;
        }

        @keyframes pulseIcon {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }

        /* Error Banner */
        .tutor-error-banner {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 0.75rem;
          color: #991b1b;
        }

        .error-text-block {
          flex: 1;
        }

        .error-text-block p {
          margin: 0.2rem 0 0;
          font-size: 0.8125rem;
          color: #b91c1c;
        }

        .error-actions {
          display: flex;
          gap: 0.5rem;
        }

        /* Input Dock */
        .aitutor-input-dock {
          padding: 1rem 1.25rem;
          background: var(--card-bg, #ffffff);
          border-top: 1px solid var(--border-color, #e2e8f0);
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .tutor-input-form {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .tutor-chat-input,
        .tutor-chat-textarea {
          flex: 1;
          padding: 0.75rem 1.15rem;
          border: 1px solid var(--border-color, #cbd5e1);
          border-radius: 12px;
          font-size: 0.9375rem;
          color: var(--text-primary, #0f172a);
          background: var(--bg-secondary, #f8fafc);
          outline: none;
          font-family: inherit;
          line-height: 1.45;
          resize: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .tutor-chat-input:focus,
        .tutor-chat-textarea:focus {
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        .tutor-send-btn {
          border-radius: 9999px;
          padding: 0.875rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
        }

        .input-dock-footer-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-secondary, #94a3b8);
          padding: 0 0.5rem;
        }

        .clear-chat-link {
          background: none;
          border: none;
          color: var(--text-secondary, #64748b);
          cursor: pointer;
          font-size: 0.75rem;
          text-decoration: underline;
        }

        .clear-chat-link:hover {
          color: #ef4444;
        }

        /* Topic Picker Modal */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-card {
          background: var(--card-bg, #ffffff);
          border-radius: 1rem;
          width: 100%;
          max-width: 650px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
        }

        .modal-title-lockup {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .modal-title-lockup h3 {
          margin: 0;
          font-size: 1.1875rem;
          font-weight: 700;
        }

        .modal-close-btn {
          background: none;
          border: none;
          color: var(--text-secondary, #64748b);
          cursor: pointer;
          padding: 0.4rem;
          border-radius: 0.375rem;
        }

        .topic-picker-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
        }

        .picker-subject-tabs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .picker-sub-tab {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 0.75rem 1rem;
          background: var(--bg-secondary, #f8fafc);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 0.5rem;
          cursor: pointer;
          text-align: left;
        }

        .picker-sub-tab.active {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.08);
        }

        .sub-tab-code {
          font-size: 0.75rem;
          font-weight: 700;
          color: #6366f1;
        }

        .sub-tab-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary, #0f172a);
        }

        .picker-modules-row {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
        }

        .picker-mod-pill {
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          border: 1px solid var(--border-color, #e2e8f0);
          background: var(--bg-secondary, #f8fafc);
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .picker-mod-pill.active {
          background: #0f172a;
          color: white;
          border-color: #0f172a;
        }

        .picker-topics-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .picker-topic-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .picker-topic-item:hover {
          background: rgba(99, 102, 241, 0.05);
          border-color: #6366f1;
        }

        .picker-topic-item.current-active {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.06);
        }

        .top-title {
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary, #0f172a);
        }

        .top-meta {
          font-size: 0.75rem;
          color: var(--text-secondary, #64748b);
        }

        /* Question Gen Modal */
        .question-gen-modal {
          max-width: 520px;
        }

        .gen-modal-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .gen-context-preview {
          padding: 1rem;
          background: var(--bg-secondary, #f8fafc);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 0.75rem;
        }

        .gen-sub-pill {
          font-size: 0.75rem;
          font-weight: 700;
          color: #6366f1;
          text-transform: uppercase;
        }

        .gen-topic-title {
          font-size: 1.0625rem;
          font-weight: 700;
          color: var(--text-primary, #0f172a);
          margin: 0.25rem 0;
        }

        .gen-topic-desc {
          font-size: 0.8125rem;
          color: var(--text-secondary, #64748b);
          margin: 0;
        }

        .gen-config-block {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .config-label-row {
          display: flex;
          flex-direction: column;
        }

        .config-label {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary, #0f172a);
        }

        .config-subnote {
          font-size: 0.75rem;
          color: var(--text-secondary, #64748b);
        }

        .config-pills-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .config-pill {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border-color, #e2e8f0);
          background: var(--bg-secondary, #f8fafc);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary, #1e293b);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .config-pill.active {
          background: #6366f1;
          color: white;
          border-color: #6366f1;
        }

        .gen-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .aitutor-page-root {
            padding: 1rem 0.5rem 5rem;
          }

          .current-context-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .change-topic-btn {
            width: 100%;
            justify-content: center;
          }

          .tutor-bubble-row {
            max-width: 95%;
          }

          .picker-subject-tabs {
            grid-template-columns: 1fr;
          }

          .send-btn-text {
            display: none;
          }

          .tutor-send-btn {
            padding: 0.875rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}
