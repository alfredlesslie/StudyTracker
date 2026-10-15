import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Lightbulb,
  HelpCircle,
  Layers,
  Play,
  ListChecks,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Clock
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { SUBJECTS, MODULES, TOPICS } from "../../data/syllabus";
import LearningSection from "./LearningSection";

// 7 mandatory pedagogical sections
export const SECTIONS = [
  { id: 1, key: "understand", label: "1. Understand", shortLabel: "Understand", icon: Lightbulb },
  { id: 2, key: "whyItMatters", label: "2. Why It Matters", shortLabel: "Why It Matters", icon: HelpCircle },
  { id: 3, key: "howItWorks", label: "3. How It Works", shortLabel: "How It Works", icon: Layers },
  { id: 4, key: "example", label: "4. Example", shortLabel: "Example", icon: Play },
  { id: 5, key: "keyPoints", label: "5. Key Points", shortLabel: "Key Points", icon: ListChecks },
  { id: 6, key: "examFocus", label: "6. Exam Focus", shortLabel: "Exam Focus", icon: AlertTriangle },
  { id: 7, key: "selfCheck", label: "7. Self Check", shortLabel: "Self Check", icon: CheckCircle2 }
];

export default function TopicLearningPage({
  topicId,
  learningContent
}) {
  const {
    topics,
    selectTopic,
    navigateTo,
    startTopicLearning,
    updateTopicLearningProgress,
    completeTopicLearning,
    setTopicConfidence,
    startActiveSession,
    stopActiveSession
  } = useApp();

  const currentTopic =
    topics.find((t) => t.id === topicId) || topics[0] || TOPICS[0];
  const currentSubject =
    SUBJECTS.find((s) => s.id === currentTopic?.subjectId) || SUBJECTS[0];
  const currentModule =
    MODULES.find((m) => m.id === currentTopic?.moduleId) || MODULES[0];

  const isTopicCompleted =
    (currentTopic?.completion || 0) >= 100 || currentTopic?.status === "learned" || currentTopic?.status === "mastered";

  const getSectionFromHash = () => {
    if (typeof window === "undefined") return 1;
    const fullHash = window.location.hash || "";
    if (fullHash.startsWith("#/example")) return 4;
    if (fullHash.includes("?")) {
      const params = new URLSearchParams(fullHash.split("?")[1]);
      const secParam = params.get("section") || params.get("tab");
      if (secParam) {
        if (secParam === "example" || secParam === "4") return 4;
        if (secParam === "understand" || secParam === "1") return 1;
        if (secParam === "whyItMatters" || secParam === "2") return 2;
        if (secParam === "howItWorks" || secParam === "3") return 3;
        if (secParam === "keyPoints" || secParam === "5") return 5;
        if (secParam === "examFocus" || secParam === "6") return 6;
        if (secParam === "selfCheck" || secParam === "7") return 7;
        const num = parseInt(secParam, 10);
        if (num >= 1 && num <= 7) return num;
      }
    }
    return 1;
  };

  // Active section (1 through 7)
  const [activeSectionId, setActiveSectionId] = useState(getSectionFromHash);
  const [visitedSections, setVisitedSections] = useState(() => {
    const existingComp = currentTopic?.completion || 0;
    if (existingComp >= 100 || currentTopic?.status === "learned") {
      return { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true };
    }
    if (existingComp > 0) {
      const num = Math.max(1, Math.round((existingComp / 100) * SECTIONS.length));
      const init = {};
      for (let i = 1; i <= num; i++) init[i] = true;
      return init;
    }
    return {};
  });
  const [confidenceSavedMessage, setConfidenceSavedMessage] = useState(null);

  // Sync section from URL hash changes
  useEffect(() => {
    const syncSectionFromUrl = () => {
      const sec = getSectionFromHash();
      if (sec && sec !== activeSectionId) {
        setActiveSectionId(sec);
      }
    };
    window.addEventListener("hashchange", syncSectionFromUrl);
    return () => window.removeEventListener("hashchange", syncSectionFromUrl);
  }, [activeSectionId]);

  // Active activity tracking (type: "learn")
  useEffect(() => {
    if (currentTopic?.id) {
      startActiveSession("learn", {
        subjectId: currentSubject.id,
        moduleId: currentModule.id,
        topicId: currentTopic.id
      });
      startTopicLearning(currentTopic.id);
      const initialSec = getSectionFromHash();
      setActiveSectionId(initialSec);
      setConfidenceSavedMessage(null);

      const existingComp = currentTopic?.completion || 0;
      if (existingComp >= 100 || currentTopic?.status === "learned") {
        setVisitedSections({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true });
      } else if (existingComp > 0) {
        const num = Math.max(1, Math.round((existingComp / 100) * SECTIONS.length));
        const init = {};
        for (let i = 1; i <= num; i++) init[i] = true;
        setVisitedSections(init);
      } else {
        setVisitedSections({});
      }
    }

    return () => {
      stopActiveSession();
    };
  }, [currentTopic?.id]);

  // Synchronize visitedSections whenever external completion status changes
  useEffect(() => {
    const existingComp = currentTopic?.completion || 0;
    if (existingComp >= 100 || currentTopic?.status === "learned") {
      setVisitedSections({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true });
    } else if (existingComp === 0 && currentTopic?.status === "not_started") {
      setVisitedSections({});
    }
  }, [currentTopic?.completion, currentTopic?.status]);

  // Update progress as concepts/sections are learned
  useEffect(() => {
    if (!currentTopic?.id) return;
    const count = Object.keys(visitedSections).length;
    // Guard: never reset an already completed topic to 0 on initial sync
    if (count === 0 && (currentTopic.completion || 0) >= 100) {
      return;
    }
    const pct = Math.min(100, Math.round((count / SECTIONS.length) * 100));
    const isCompleted = count >= SECTIONS.length;
    updateTopicLearningProgress(currentTopic.id, pct, isCompleted);
  }, [visitedSections, currentTopic?.id]);

  const activeSection = SECTIONS.find((s) => s.id === activeSectionId) || SECTIONS[0];
  const content = learningContent || {};

  // Previous and Next topic calculation
  const allSubjectTopics = topics.filter((t) => t.subjectId === currentSubject.id);
  const currentIndex = allSubjectTopics.findIndex((t) => t.id === currentTopic.id);
  const prevTopic = currentIndex > 0 ? allSubjectTopics[currentIndex - 1] : null;
  const nextTopic =
    currentIndex < allSubjectTopics.length - 1 ? allSubjectTopics[currentIndex + 1] : null;

  const handleToggleSectionLearned = (sectionId = activeSectionId) => {
    setVisitedSections((prev) => {
      const next = { ...prev };
      if (next[sectionId]) {
        delete next[sectionId];
      } else {
        next[sectionId] = true;
      }
      return next;
    });
  };

  const handleMarkSectionLearned = (sectionId = activeSectionId) => {
    setVisitedSections((prev) => ({ ...prev, [sectionId]: true }));
  };

  const handleSelectSection = (id) => {
    setVisitedSections((prev) => ({ ...prev, [activeSectionId]: true }));
    setActiveSectionId(id);
    const sec = SECTIONS.find((s) => s.id === id);
    if (typeof window !== "undefined" && currentTopic?.id) {
      const secKey = sec ? sec.key : id;
      window.location.hash = `#/learn?topic=${currentTopic.id}&section=${secKey}`;
    }
    window.scrollTo({ top: 140, behavior: "smooth" });
  };

  const handleNextSection = () => {
    if (activeSectionId < SECTIONS.length) {
      const nextId = activeSectionId + 1;
      setVisitedSections((prev) => ({ ...prev, [activeSectionId]: true }));
      setActiveSectionId(nextId);
      window.scrollTo({ top: 140, behavior: "smooth" });
    }
  };

  const handleToggleComplete = () => {
    const willBeComplete = !isTopicCompleted;
    if (willBeComplete) {
      setVisitedSections({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true });
      completeTopicLearning(currentTopic.id, true);
    } else {
      setVisitedSections({});
      completeTopicLearning(currentTopic.id, false);
    }
  };

  const handlePrevSection = () => {
    if (activeSectionId > 1) {
      setActiveSectionId(activeSectionId - 1);
      window.scrollTo({ top: 140, behavior: "smooth" });
    }
  };

  const handleConfidenceSelect = (level) => {
    setTopicConfidence(currentTopic.id, level);
    const messages = {
      low: "Feedback recorded: We'll flag this topic for more practice.",
      medium: "Feedback recorded: Reviewing key points will boost your confidence.",
      high: "Great job! You have a solid grasp on this concept."
    };
    setConfidenceSavedMessage(messages[level] || "Confidence saved!");
    setTimeout(() => setConfidenceSavedMessage(null), 4000);
  };

  const completedSectionsCount = Object.keys(visitedSections).length;
  const progressPercent = Math.min(100, Math.round((completedSectionsCount / SECTIONS.length) * 100));

  return (
    <div className="topic-learning-page animate-fade-in">
      {/* 1. Breadcrumbs & Header Card */}
      <div className="card topic-learning-header-card">
        <div className="header-meta-row">
          <div className="header-breadcrumbs">
            <button
              className="crumb-btn crumb-subject"
              onClick={() => navigateTo("syllabus")}
              title="Return to Syllabus"
            >
              <span className="badge-code">{currentSubject.code}</span>
              <span>{currentSubject.name}</span>
            </button>
            <span className="crumb-sep">/</span>
            <span className="crumb-module">{currentModule.title.split(":")[0]}</span>
            <span className="crumb-sep">/</span>
            <span className="crumb-topic-name">{currentTopic.title}</span>
          </div>

          <div className="header-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              className={`btn btn-sm ${isTopicCompleted ? "btn-success" : "btn-outline"}`}
              onClick={handleToggleComplete}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              title={isTopicCompleted ? "Topic completed in syllabus. Click to mark incomplete." : "Mark this topic complete in syllabus"}
            >
              <CheckCircle2 size={16} />
              <span>{isTopicCompleted ? "Completed in Syllabus ✓" : "Mark as Completed"}</span>
            </button>
          </div>
        </div>

        <div className="header-title-row">
          <div className="title-left">
            <h1 className="topic-main-title">
              <span className="hash-symbol">#</span> {currentTopic.title}
            </h1>
            <div className="topic-chips-row">
              <span className="chip-meta">
                <Clock size={14} />
                <span>{content.estimatedMinutes || currentTopic.estimatedMinutes || 30} min</span>
              </span>
              <span className="chip-meta chip-diff">
                <span>Difficulty:</span>
                <strong>{content.difficulty || currentTopic.difficulty || "Medium"}</strong>
              </span>
              <span className="chip-meta chip-mod">
                <span>{currentModule.title}</span>
              </span>
              {isTopicCompleted && (
                <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle2 size={12} />
                  Syllabus 100%
                </span>
              )}
            </div>
          </div>

          <div className="title-right-progress">
            <div className="progress-radial-label">
              <span className="pct-num" style={{ color: isTopicCompleted ? "var(--color-success, #10b981)" : "inherit" }}>
                {isTopicCompleted ? "100%" : `${progressPercent}%`}
              </span>
              <span className="pct-desc">
                {isTopicCompleted ? "Syllabus Mastered" : "Lesson Explored"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive 7-Step Navigation Bar */}
      <div className="card stepper-nav-card">
        <div className="stepper-track">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isCurrent = sec.id === activeSectionId;
            const isVisited = Boolean(visitedSections[sec.id]);

            return (
              <button
                key={sec.id}
                className={`step-nav-btn ${isCurrent ? "current" : ""} ${isVisited ? "visited" : ""}`}
                onClick={() => handleSelectSection(sec.id)}
                title={sec.label}
              >
                <div className="step-icon-wrapper">
                  <Icon size={16} />
                </div>
                <span className="step-label-text">{sec.shortLabel}</span>
                {isVisited && (
                  <span className="step-check-dot">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Active Pedagogical Section Content */}
      <LearningSection
        activeSection={activeSection}
        content={content}
        topic={currentTopic}
        isSectionLearned={Boolean(visitedSections[activeSectionId])}
        onToggleLearned={handleToggleSectionLearned}
        onCompleteSection={() => handleMarkSectionLearned(activeSectionId)}
        onConfidenceSelect={handleConfidenceSelect}
        confidenceLevel={currentTopic.confidence}
        confidenceSavedMessage={confidenceSavedMessage}
        onSelectSection={handleSelectSection}
        onStartPractice={() => {
          handleMarkSectionLearned(activeSectionId);
          navigateTo("practice", currentTopic.id);
        }}
      />

      {/* 4. Bottom Stepper Controls */}
      <div className="card section-nav-controls-card">
        <button
          className="btn btn-outline nav-step-btn"
          onClick={handlePrevSection}
          disabled={activeSectionId === 1}
        >
          <ChevronLeft size={16} />
          <span>Previous Section</span>
        </button>

        <span className="current-step-indicator">
          Section {activeSectionId} of {SECTIONS.length}
        </span>

        {activeSectionId < SECTIONS.length ? (
          <button className="btn btn-primary nav-step-btn" onClick={handleNextSection}>
            <CheckCircle2 size={16} />
            <span>Mark Learned & Next: {SECTIONS[activeSectionId].shortLabel}</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          <div style={{ display: "inline-flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            {!isTopicCompleted ? (
              <button
                className="btn btn-success nav-step-btn"
                onClick={() => {
                  setVisitedSections({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true });
                  completeTopicLearning(currentTopic.id, true);
                }}
                title="Mark this topic complete in syllabus (100%)"
              >
                <CheckCircle2 size={16} />
                <span>Complete Topic (100% in Syllabus)</span>
              </button>
            ) : (
              <button
                className="btn btn-outline nav-step-btn"
                onClick={() => navigateTo("syllabus")}
              >
                <span>Return to Syllabus</span>
              </button>
            )}
            <button
              className="btn btn-primary nav-step-btn"
              onClick={() => {
                if (!isTopicCompleted) {
                  setVisitedSections({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true });
                  completeTopicLearning(currentTopic.id, true);
                }
                navigateTo("practice", currentTopic.id);
              }}
            >
              <span>Start Topic Practice</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* 5. Topic Navigation Footer (Prev & Next Topic in Subject) */}
      <div className="topic-sibling-nav-row">
        {prevTopic ? (
          <button
            className="sibling-topic-btn btn-prev-topic"
            onClick={() => {
              selectTopic(prevTopic.id);
              navigateTo("learn", prevTopic.id);
            }}
          >
            <ArrowLeft size={16} />
            <div className="sibling-meta">
              <span className="sibling-sub">Previous Topic</span>
              <span className="sibling-title">{prevTopic.title}</span>
            </div>
          </button>
        ) : (
          <div />
        )}

        {nextTopic && (
          <button
            className="sibling-topic-btn btn-next-topic"
            onClick={() => {
              selectTopic(nextTopic.id);
              navigateTo("learn", nextTopic.id);
            }}
          >
            <div className="sibling-meta text-right">
              <span className="sibling-sub">Next Topic</span>
              <span className="sibling-title">{nextTopic.title}</span>
            </div>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
