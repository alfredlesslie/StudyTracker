import React, { useEffect, useRef } from "react";
import {
  BookOpen,
  Filter,
  Layers
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { SUBJECTS, MODULES, TOPICS } from "../data/syllabus";
import { LEARNING_CONTENT, TOPIC_EXAMPLES } from "../data/learningContent";
import TopicLearningPage from "../components/learning/TopicLearningPage";

export default function Learn() {
  const {
    activeTopicId,
    selectTopic,
    topics,
    navigateTo,
    startActiveSession,
    stopActiveSession
  } = useApp();

  // Authoritative current topic, subject, and module derived from activeTopicId
  const currentTopic =
    topics.find((t) => t.id === activeTopicId) || topics[0] || TOPICS[0];
  const currentSubject =
    SUBJECTS.find((s) => s.id === currentTopic?.subjectId) || SUBJECTS[0];
  const availableModules = MODULES.filter((m) => m.subjectId === currentSubject.id);
  const currentModule =
    MODULES.find((m) => m.id === currentTopic?.moduleId) || availableModules[0] || MODULES[0];
  const availableTopicsForSubject = topics.filter(
    (t) => t.subjectId === currentSubject.id
  );

  // Keep a stable ref to active topic ID for async race condition checks
  const activeTopicIdRef = useRef(activeTopicId);
  useEffect(() => {
    activeTopicIdRef.current = activeTopicId;
  }, [activeTopicId]);

  // Sync topic from URL query param when browser back/forward or external links change hash
  useEffect(() => {
    const handleUrlTopic = () => {
      const fullHash = typeof window !== "undefined" ? window.location.hash || "" : "";
      if (fullHash.includes("?")) {
        const params = new URLSearchParams(fullHash.split("?")[1]);
        const topicParam = params.get("topic");
        if (topicParam && topicParam !== activeTopicIdRef.current && topics.some((t) => t.id === topicParam)) {
          selectTopic(topicParam);
        }
      }
    };
    window.addEventListener("hashchange", handleUrlTopic);
    return () => window.removeEventListener("hashchange", handleUrlTopic);
  }, [topics, selectTopic]);

  // Track active learning time for currently open topic
  useEffect(() => {
    if (currentTopic?.id) {
      startActiveSession("learn", {
        topicId: currentTopic.id,
        subjectId: currentTopic.subjectId,
        moduleId: currentTopic.moduleId
      });
    }
    return () => {
      stopActiveSession();
    };
  }, [currentTopic?.id]);

  // Immediate switching handlers
  const handleSubjectChange = (newSubId) => {
    if (!newSubId || newSubId === currentSubject.id) return;
    const firstInSub = topics.find((t) => t.subjectId === newSubId);
    if (firstInSub) {
      selectTopic(firstInSub.id);
    }
  };

  const handleModuleChange = (newModId) => {
    if (!newModId || newModId === currentModule.id) return;
    const firstInMod = topics.find((t) => t.moduleId === newModId);
    if (firstInMod) {
      selectTopic(firstInMod.id);
    }
  };

  const handleTopicChange = (newTopicId) => {
    if (!newTopicId || newTopicId === currentTopic.id) return;
    selectTopic(newTopicId);
  };

  const fallbackLearningContent = {
    topicId: currentTopic.id,
    title: currentTopic.title,
    understand: currentTopic.description || "Core syllabus concept for semester exam preparation.",
    whyItMatters: "Essential foundation for practical systems engineering and competitive exams.",
    howItWorks: ["Step 1: Understand definition", "Step 2: Apply algorithms", "Step 3: Analyze performance"],
    keyPoints: ["High yield syllabus concept", "Frequent exam questions appear in Section B and C"],
    examFocus: ["Explain the theoretical architecture and derivation (5 to 7 marks)"],
    selfCheck: {
      question: `What is the key principle behind ${currentTopic.title}?`,
      options: ["Systematic optimization", "Random execution", "Manual estimation", "Trial and error"],
      answer: "Systematic optimization",
      correctIndex: 0,
      explanation: `Systematic engineering principles govern ${currentTopic.title}.`
    }
  };

  const detailedContent = {
    ...(LEARNING_CONTENT[currentTopic.id] || fallbackLearningContent),
    example: TOPIC_EXAMPLES[currentTopic.id] || LEARNING_CONTENT[currentTopic.id]?.example || {
      title: `${currentTopic.title} Practical Example`,
      scenario: `Real-world engineering application for ${currentTopic.title}.`,
      context: `Understand how ${currentTopic.title} operates in production environments.`,
      steps: [
        { title: "Configuration", detail: "Initialize parameters and system architecture." },
        { title: "Operation", detail: "Execute core logic and process system data." },
        { title: "Validation", detail: "Verify performance against target benchmarks." }
      ],
      codeSnippet: `// Example for ${currentTopic.title}\nconsole.log("Executed ${currentTopic.title} successfully.");`,
      codeLanguage: "javascript",
      takeaways: [
        "Core architectural concepts ensure stability.",
        "Verify edge cases and benchmark performance."
      ]
    }
  };

  return (
    <div className="page-container animate-fade-in learn-page-wrapper">
      {/* Subject, Module & Topic Quick Switch Bar */}
      <div className="card topic-switcher-bar">
        <div className="switcher-group">
          <label className="switcher-label" htmlFor="learn-subject-select">
            <Filter size={15} />
            <span>Subject:</span>
          </label>
          <select
            id="learn-subject-select"
            className="compact-select"
            value={currentSubject.id}
            onChange={(e) => handleSubjectChange(e.target.value)}
          >
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="switcher-group">
          <label className="switcher-label" htmlFor="learn-module-select">
            <Layers size={15} />
            <span>Module:</span>
          </label>
          <select
            id="learn-module-select"
            className="compact-select"
            value={currentModule.id}
            onChange={(e) => handleModuleChange(e.target.value)}
          >
            {availableModules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div className="switcher-group">
          <label className="switcher-label" htmlFor="learn-topic-select">
            <BookOpen size={15} />
            <span>Topic ({availableTopicsForSubject.length}):</span>
          </label>
          <select
            id="learn-topic-select"
            className="compact-select topic-dropdown-select"
            value={currentTopic.id}
            onChange={(e) => handleTopicChange(e.target.value)}
          >
            {availableModules.map((m) => {
              const modTopics = topics.filter((t) => t.moduleId === m.id);
              return (
                <optgroup key={m.id} label={m.title}>
                  {modTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
      </div>

      {/* Main 7-Section Topic Learning Page (All 64 Topics Supported) */}
      <TopicLearningPage
        key={currentTopic.id}
        topicId={currentTopic.id}
        learningContent={detailedContent}
      />

      {/* Embedded Styles for Complete Learning Experience */}
      <style>{`
        .learn-page-wrapper {
          padding-bottom: 3.5rem;
        }

        .topic-switcher-bar {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 1.5rem;
          padding: 0.85rem 1.25rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }

        .switcher-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .switcher-label {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .compact-select {
          padding: 0.45rem 0.85rem;
          font-size: 0.85rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background-color: var(--bg-surface);
          color: var(--text-primary);
          outline: none;
        }

        .topic-dropdown-select {
          max-width: 320px;
        }

        /* Topic Learning Header */
        .topic-learning-header-card {
          padding: 1.75rem;
          margin-bottom: 1.25rem;
        }

        .header-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .header-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          flex-wrap: wrap;
        }

        .crumb-btn {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-primary);
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .crumb-btn:hover {
          color: var(--primary);
        }

        .badge-code {
          background-color: var(--primary-subtle);
          color: var(--primary);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: var(--radius-sm);
        }

        .crumb-sep {
          color: var(--text-muted);
        }

        .crumb-topic-name {
          font-weight: 600;
          color: var(--primary);
        }


        .header-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .topic-main-title {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .hash-symbol {
          color: var(--primary);
        }

        .topic-chips-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .chip-meta {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          background-color: var(--bg-subtle);
          padding: 3px 9px;
          border-radius: var(--radius-full);
          color: var(--text-secondary);
        }

        .progress-radial-label {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          background-color: var(--bg-subtle);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
        }

        .pct-num {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--primary);
          line-height: 1;
        }

        .pct-desc {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        /* Stepper Nav Card */
        .stepper-nav-card {
          padding: 0.75rem 1rem;
          margin-bottom: 1.25rem;
          overflow-x: auto;
        }

        .stepper-track {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: max-content;
        }

        .step-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.45rem 0.95rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border);
          background-color: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .step-nav-btn:hover {
          background-color: var(--bg-surface-hover);
          color: var(--text-primary);
        }

        .step-nav-btn.current {
          background-color: var(--primary);
          color: white;
          border-color: var(--primary);
          box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
        }

        .step-nav-btn.visited:not(.current) {
          border-color: #10b981;
          color: #059669;
          background-color: #ecfdf5;
        }

        .step-check-dot {
          font-weight: 800;
          color: #059669;
        }

        .step-nav-btn.current .step-check-dot {
          color: #ffffff;
        }

        /* Active Learning Section Card */
        .active-learning-card {
          padding: 2rem;
          margin-bottom: 1.25rem;
        }

        .section-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-light);
        }

        .section-badge-cluster {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .section-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-lg);
          background-color: var(--primary-subtle);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .section-super-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.04em;
        }

        .section-display-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        /* Pedagogical Sub-content components */
        .learning-sub-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .section-headline-box {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(59, 130, 246, 0.06));
          border-left: 4px solid var(--primary);
          padding: 1rem 1.25rem;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
        }

        .headline-tag {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--primary);
          display: block;
          margin-bottom: 0.25rem;
        }

        .section-main-heading {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .lesson-callout {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          padding: 1.15rem 1.35rem;
          border-radius: var(--radius-md);
        }

        .callout-info {
          background-color: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: #1e3a8a;
        }

        .callout-primary {
          background-color: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: #312e81;
        }

        .callout-warning {
          background-color: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          color: #78350f;
        }

        .callout-success {
          background-color: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #064e3b;
        }

        .callout-danger {
          background-color: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #7f1d1d;
        }

        .callout-neutral {
          background-color: var(--bg-subtle);
          border: 1px solid var(--border);
          color: var(--text-primary);
        }

        .callout-icon-wrap {
          margin-top: 2px;
          flex-shrink: 0;
        }

        .callout-heading {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 0.35rem;
        }

        .callout-body {
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0;
        }

        .sub-section-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.85rem;
        }

        /* Terminology Cards */
        .terminology-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }

        .term-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        .term-name {
          font-weight: 700;
          font-size: 0.92rem;
          color: var(--primary);
          display: block;
          margin-bottom: 0.35rem;
        }

        .term-def {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        /* Steps Flow */
        .steps-flow-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .step-card {
          display: flex;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background-color: var(--bg-subtle);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
        }

        .step-number-badge {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background-color: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .step-title {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .step-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        /* Comparison Table */
        .table-responsive {
          overflow-x: auto;
        }

        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .comparison-table th {
          background-color: var(--bg-subtle);
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 700;
          border-bottom: 2px solid var(--border);
        }

        .comparison-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-light);
        }

        /* Example */
        .example-header-box {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 0.5rem;
        }

        .example-icon-badge {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-lg);
          background-color: #fef3c7;
          color: #d97706;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .example-subtitle {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .example-title {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0;
        }

        .example-steps-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .example-step-row {
          display: flex;
          gap: 0.75rem;
          background-color: var(--bg-subtle);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
        }

        .step-bullet {
          font-weight: 700;
          color: var(--primary);
        }

        .step-label {
          font-size: 0.88rem;
          font-weight: 700;
          margin-bottom: 0.2rem;
        }

        .step-body-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .step-calc-box {
          margin-top: 0.5rem;
          padding: 0.5rem 0.75rem;
          background-color: var(--bg-surface);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          font-family: var(--font-mono, monospace);
          font-size: 0.82rem;
          overflow-x: auto;
        }

        .callout-result {
          background-color: #ecfdf5;
          border-color: #a7f3d0;
        }

        .callout-application {
          background-color: #f0fdf4;
          border-color: #bbf7d0;
        }

        /* Key Points Grid */
        .key-points-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .key-point-card {
          display: flex;
          gap: 0.75rem;
          background-color: var(--bg-subtle);
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
        }

        .point-title {
          font-size: 0.92rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .point-body {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        /* Exam Skills List */
        .skills-cards-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .skill-card {
          background-color: var(--bg-subtle);
          border-left: 3px solid #f59e0b;
          padding: 0.85rem 1.15rem;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
        }

        .skill-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .skill-task-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .marks-badge {
          font-size: 0.75rem;
          font-weight: 700;
          background-color: #fef3c7;
          color: #b45309;
          padding: 2px 7px;
          border-radius: var(--radius-sm);
        }

        .prep-tip-text {
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin: 0.35rem 0 0 0;
        }

        /* Self Check Card */
        .self-check-card {
          padding: 1.75rem;
          border: 1px solid var(--border);
        }

        .self-check-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .check-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--primary);
        }

        .self-check-question-text {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          line-height: 1.5;
        }

        .self-check-options-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .option-btn {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1.15rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background-color: var(--bg-surface);
          color: var(--text-primary);
          font-size: 0.9rem;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease;
        }

        .option-btn:hover:not(:disabled) {
          border-color: var(--primary);
          background-color: var(--bg-surface-hover);
        }

        .option-letter-badge {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          background-color: var(--bg-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .option-text {
          flex: 1;
        }

        .option-correct {
          background-color: #ecfdf5;
          border-color: #10b981;
          color: #065f46;
        }

        .option-correct .option-letter-badge {
          background-color: #10b981;
          color: white;
        }

        .option-incorrect {
          background-color: #fef2f2;
          border-color: #ef4444;
          color: #991b1b;
        }

        .option-incorrect .option-letter-badge {
          background-color: #ef4444;
          color: white;
        }

        .option-muted {
          opacity: 0.6;
        }

        .self-check-explanation-box {
          margin-top: 1.25rem;
          padding: 1.15rem;
          border-radius: var(--radius-md);
        }

        .feedback-success {
          background-color: #ecfdf5;
          border: 1px solid #a7f3d0;
        }

        .feedback-warning {
          background-color: #fffbeb;
          border: 1px solid #fde68a;
        }

        .feedback-status-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .explanation-text {
          font-size: 0.88rem;
          line-height: 1.6;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        /* Confidence Capture */
        .confidence-capture-card {
          padding: 1.5rem;
          text-align: center;
        }

        .confidence-heading {
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .confidence-sub {
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin-bottom: 1.25rem;
        }

        .confidence-buttons-cluster {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .conf-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          padding: 0.85rem 1.5rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background-color: var(--bg-surface);
          cursor: pointer;
          min-width: 110px;
          transition: all 0.15s ease;
        }

        .conf-btn:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
        }

        .conf-btn.selected {
          border-color: var(--primary);
          background-color: var(--primary-subtle);
        }

        .conf-emoji {
          font-size: 1.6rem;
        }

        .conf-label {
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .conf-saved-feedback {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-top: 1rem;
          font-size: 0.85rem;
          color: #059669;
          font-weight: 600;
        }

        /* Completion CTA */
        .lesson-completion-cta-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .cta-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .celebration-emoji {
          font-size: 2rem;
        }

        .cta-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.2rem;
        }

        .cta-sub {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0;
        }

        /* Section Nav Controls Card */
        .section-nav-controls-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .current-step-indicator {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        /* Sibling Topic Nav */
        .topic-sibling-nav-row {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }

        .sibling-topic-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background-color: var(--bg-surface);
          color: var(--text-primary);
          cursor: pointer;
          max-width: 48%;
          transition: all 0.15s ease;
        }

        .sibling-topic-btn:hover {
          border-color: var(--primary);
          background-color: var(--bg-surface-hover);
        }

        .sibling-sub {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          display: block;
        }

        .sibling-title {
          font-size: 0.9rem;
          font-weight: 700;
        }


      `}</style>
    </div>
  );
}
