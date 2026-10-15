import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Clock,
  Calendar,
  Award,
  BookOpen,
  Play,
  Plus,
  Zap,
  Layers
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { SUBJECTS, MODULES, TOPICS } from "../data/syllabus";
import { formatExamScope } from "./Exams";
import { generateRecommendations } from "../services/mlService";
import {
  calculateExamCountdown,
  getTodayStudySessions,
  getTotalStudyTime,
  getDailyStudyTime
} from "../services/storageService";
import "./Home.css";

/**
 * Home Dashboard — Refined, Focused Educational SaaS Dashboard
 * 
 * Answers immediately:
 * 1. What should I study next? (Recommended Next Study)
 * 2. When is my next exam? (Nearest Upcoming Exam)
 * 3. How am I progressing today? (Today's Telemetry & Progress)
 */
export default function Home() {
  const {
    navigateTo,
    topics,
    sessions,
    quizAttempts,
    exams,
    studentProfile,
    startFocusForTopic,
    examScopePredictions,
    startExamPractice,
    selectTopic
  } = useApp();

  // Recommendations state
  const [recommendation, setRecommendation] = useState(null);

  // Compute recommendation using existing rule-based + telemetry pipeline
  useEffect(() => {
    const recs = generateRecommendations({
      topics,
      exams,
      sessions,
      quizAttempts
    });
    setRecommendation(recs.studyNext);
  }, [topics, exams, sessions, quizAttempts]);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Formatted date string for header
  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

  // Nearest upcoming exam overall: filter out past exams, sort strictly by date ascending, with consistent tie-breaking
  const upcomingExams = exams
    .map((e) => {
      const cd = calculateExamCountdown(e.date);
      const subMods = MODULES.filter((m) => m.subjectId === (e.subjectId || e.subject_id));
      const rawMods = e.moduleIds || e.module_ids || [];
      const selectedMods = rawMods.length > 0
        ? rawMods.filter((id) => subMods.some((m) => m.id === id))
        : subMods.map((m) => m.id);
      const completedMods = e.completedModuleIds || e.completed_module_ids || [];
      const completedTopicIds = e.completedTopicIds || e.completed_topic_ids || [];

      const examScopeTopics = TOPICS.filter(
        (t) => t.subjectId === (e.subjectId || e.subject_id) && selectedMods.includes(t.moduleId)
      );
      const totalTopicCount = examScopeTopics.length;
      const completedTopicCount = examScopeTopics.filter(
        (t) => completedTopicIds.includes(t.id) || completedMods.includes(t.moduleId)
      ).length;
      const prepProgressPct = totalTopicCount > 0
        ? Math.round((completedTopicCount / totalTopicCount) * 100)
        : (selectedMods.length > 0 ? Math.round((completedMods.length / selectedMods.length) * 100) : 0);

      return {
        ...e,
        ...cd,
        selectedMods,
        completedMods,
        completedTopicIds,
        totalTopicCount,
        completedTopicCount,
        prepProgressPct
      };
    })
    .filter((e) => !e.isPast)
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (!isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
        return dateA - dateB;
      }
      const daysDiff = (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999);
      if (daysDiff !== 0) return daysDiff;
      const nameComp = (a.name || "").localeCompare(b.name || "");
      if (nameComp !== 0) return nameComp;
      return (a.id || "").localeCompare(b.id || "");
    });

  // Nearest upcoming exam strictly by date
  const nearestExam = upcomingExams[0] || null;

  const nearestExamSubject = nearestExam
    ? SUBJECTS.find((s) => s.id === (nearestExam.subjectId || nearestExam.subject_id))
    : null;

  const nearestSubMods = nearestExam
    ? MODULES.filter((m) => m.subjectId === (nearestExam.subjectId || nearestExam.subject_id))
    : [];

  const nearestScopeText = nearestExam
    ? formatExamScope(nearestExam.selectedMods, nearestSubMods)
    : "";

  const nearestExamAttempts = nearestExam
    ? (quizAttempts || [])
        .filter((q) => q.examId === nearestExam.id || q.exam_id === nearestExam.id)
        .sort((a, b) => new Date(b.date || b.attemptedAt || 0) - new Date(a.date || a.attemptedAt || 0))
    : [];
  const latestExamAttempt = nearestExamAttempts[0] || null;

  const nearestScopeData = nearestExam
    ? (examScopePredictions && examScopePredictions[nearestExam.id])
    : null;

  const nearestCompletedCount = nearestExam ? nearestExam.completedMods.length : 0;
  const nearestTotalCount = nearestExam ? nearestExam.selectedMods.length : 0;
  const nearestProgressPct = nearestExam ? nearestExam.prepProgressPct : 0;

  const nearestPredictedScore = nearestScopeData?.estimated_score !== undefined && nearestScopeData?.estimated_score !== null
    ? nearestScopeData.estimated_score
    : Math.round(nearestProgressPct * 0.4 + (latestExamAttempt ? latestExamAttempt.percentage : 50) * 0.35 + 50 * 0.15 + 65 * 0.1);

  // Target topic for Continue Studying button: first pending module in scope
  const firstPendingModId = nearestExam
    ? nearestExam.selectedMods.find((id) => !nearestExam.completedMods.includes(id)) || nearestExam.selectedMods[0]
    : null;
  const firstPendingTopic = firstPendingModId
    ? topics.find((t) => t.moduleId === firstPendingModId) || TOPICS.find((t) => t.moduleId === firstPendingModId)
    : null;

  // Minimal Study Summary telemetry (Section F)
  const todaySessions = getTodayStudySessions(sessions);
  const totalMinutesToday = getTotalStudyTime(todaySessions);
  const hours = Math.floor(totalMinutesToday / 60);
  const mins = totalMinutesToday % 60;
  const studyTimeString = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  const todaySessionsCount = todaySessions.length;

  const completedTopicsCount = topics.filter(
    (t) => t.status === "learned" || t.status === "mastered" || (t.completion || 0) >= 80
  ).length;

  const recentQuizzes = quizAttempts.slice(0, 5);
  const averageAccuracy =
    recentQuizzes.length > 0
      ? Math.round(
          recentQuizzes.reduce((sum, q) => sum + (q.percentage || 0), 0) /
            recentQuizzes.length
        )
      : null;

  return (
    <div className="page-container animate-fade-in home-dashboard">
      {/* =========================================================================
          SECTION A: WELCOME HEADER
          ========================================================================= */}
      <header className="home-welcome-header">
        <div className="home-welcome-text">
          <h1>
            {getGreeting()},{" "}
            {studentProfile?.name ? studentProfile.name.split(" ")[0] : "Student"} 👋
          </h1>
          <p>Let's make today's study session count.</p>
        </div>

        <div className="home-welcome-meta">
          <span className="home-date-chip">
            <Calendar size={13} />
            <span>{todayFormatted}</span>
          </span>
          <span className="home-cohort-chip">
            {studentProfile?.branch || "Computer Science"} · {studentProfile?.semester || "Semester V"}
          </span>
        </div>
      </header>

      {/* =========================================================================
          SECTION B: BALANCED 2-COLUMN ROW (RECOMMENDED NEXT STUDY & NEXT EXAM)
          ========================================================================= */}
      <div className="home-action-grid">
        {/* Recommended Next Study */}
        <section className="action-card" aria-labelledby="rec-title">
          <div className="action-card-header">
            <span className="action-card-tag">
              <Sparkles size={14} />
              <span>Recommended Next Study</span>
            </span>
            {recommendation?.estimatedMinutes && (
              <span className="action-card-meta-pill">
                <Clock size={12} />
                <span>{recommendation.estimatedMinutes} min</span>
              </span>
            )}
          </div>

          <div className="action-card-body">
            <h3 id="rec-title" className="action-card-title">
              {recommendation?.title || "Routing Algorithms"}
            </h3>
            <span className="action-card-context">
              {recommendation?.subjectName || "Computer Networks"} ·{" "}
              {recommendation?.moduleTitle || "Module II"}
            </span>
            <p className="action-card-reason">
              "{recommendation?.reason || "Recommended because this topic needs revision."}"
            </p>
          </div>

          <div className="action-card-footer">
            <button
              type="button"
              className="action-btn-primary"
              onClick={() => {
                const targetId = recommendation?.topicId || "cn-m2-t2";
                startFocusForTopic(targetId, recommendation?.estimatedMinutes || 25);
              }}
            >
              <Play size={15} />
              <span>Start Focus ({recommendation?.estimatedMinutes || 25}m)</span>
            </button>
          </div>
        </section>

        {/* Nearest Upcoming Exam */}
        <section className="action-card" aria-labelledby="exam-title">
          <div className="action-card-header">
            <span className="action-card-tag">
              <Calendar size={14} />
              <span>Next Exam</span>
            </span>
            {nearestExam && (
              <span className="action-card-meta-pill" style={{ color: "var(--primary)", fontWeight: 700 }}>
                {nearestExam.statusText || `${nearestExam.daysRemaining} days left`}
              </span>
            )}
          </div>

          {nearestExam ? (
            <div className="action-card-body" style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              <div>
                <h3 id="exam-title" className="action-card-title">
                  {nearestExam.name}
                </h3>
                <span className="action-card-context">
                  {nearestExamSubject?.name || nearestExam.subjectName || "Semester V Exam"} ({nearestExamSubject?.code || nearestExam.subjectCode}) · {nearestExam.date}
                </span>
              </div>

              {/* Selected modules in scope */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.775rem",
                padding: "3px 8px",
                borderRadius: "4px",
                backgroundColor: "var(--bg-subtle)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-light)",
                width: "fit-content"
              }}>
                <Layers size={13} className="text-primary" />
                <span>{nearestScopeText}</span>
              </div>

              {/* Exam preparation progress */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Exam Preparation</span>
                  <span style={{ fontWeight: 700, color: "var(--text-main)" }}>
                    {nearestExam.totalTopicCount > 0
                      ? `${nearestExam.completedTopicCount} / ${nearestExam.totalTopicCount} topics prepared (${nearestProgressPct}%)`
                      : `${nearestCompletedCount} / ${nearestTotalCount} modules (${nearestProgressPct}%)`}
                  </span>
                </div>
                <div className="progress-bar-track" style={{ height: "6px" }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${nearestProgressPct}%`,
                      backgroundColor: nearestProgressPct === 100 ? "var(--success)" : "var(--primary)"
                    }}
                  />
                </div>
              </div>

              {/* Saved predicted score & latest practice quiz result */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                padding: "8px 10px",
                borderRadius: "6px",
                backgroundColor: "var(--bg-subtle)",
                border: "1px solid var(--border-light)"
              }}>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>
                    Estimated Score
                  </span>
                  <strong style={{ fontSize: "1.1rem", color: "var(--primary)" }}>
                    {nearestPredictedScore}/100
                  </strong>
                  <span style={{
                    display: "inline-block",
                    fontSize: "0.64rem",
                    color: "var(--primary)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em"
                  }}>
                    {nearestScopeData?.score_label || "Preparation-Based Estimate"}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>
                    Latest Quiz Score
                  </span>
                  <strong style={{ fontSize: "0.95rem", color: latestExamAttempt ? "var(--text-main)" : "var(--text-muted)" }}>
                    {latestExamAttempt
                      ? `${latestExamAttempt.score}/${latestExamAttempt.totalQuestions} (${latestExamAttempt.percentage}%)`
                      : "No attempts yet"}
                  </strong>
                  <span style={{ display: "block", fontSize: "0.68rem", color: "var(--text-dim)" }}>
                    {nearestExamAttempts.length} attempt{nearestExamAttempts.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="action-card-body">
              <h3 id="exam-title" className="action-card-title">
                No Upcoming Exams
              </h3>
              <p className="action-card-reason">
                Add your upcoming semester or series examination schedule to enable dynamic countdowns, scope-isolated practice quizzes, and adaptive readiness predictions.
              </p>
            </div>
          )}

          <div className="action-card-footer" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {nearestExam ? (
              <>
                <button
                  type="button"
                  className="action-btn-primary"
                  style={{
                    flex: 1,
                    backgroundColor: "var(--primary)",
                    color: "#ffffff"
                  }}
                  onClick={() => startExamPractice(nearestExam.id)}
                  title="Take practice quiz strictly scoped to selected modules"
                >
                  <Zap size={14} />
                  <span>Take Practice Quiz</span>
                </button>
                <button
                  type="button"
                  className="action-btn-primary"
                  style={{
                    flex: 1,
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--text-main)",
                    border: "1px solid var(--border)"
                  }}
                  onClick={() => {
                    if (firstPendingTopic) {
                      selectTopic(firstPendingTopic.id);
                      navigateTo("learn", firstPendingTopic.id);
                    } else {
                      navigateTo("exams");
                    }
                  }}
                  title="Continue studying next pending module in Learn"
                >
                  <BookOpen size={14} />
                  <span>Continue Studying</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                className="action-btn-primary"
                style={{
                  width: "100%",
                  backgroundColor: "var(--primary)",
                  color: "#ffffff"
                }}
                onClick={() => navigateTo("exams")}
              >
                <Plus size={15} />
                <span>Schedule Exam</span>
              </button>
            )}
          </div>
        </section>
      </div>

      {/* =========================================================================
          SECTION C: TODAY'S TELEMETRY & PROGRESS (EXISTING)
          ========================================================================= */}
      <section className="home-summary-section" aria-labelledby="summary-heading">
        <div className="summary-heading-row">
          <h3 id="summary-heading" className="summary-heading">
            Today's Telemetry & Progress
          </h3>
        </div>

        <div className="home-summary-grid">
          {/* Tile 1: Actual Study Time Today */}
          <div className="summary-tile">
            <div className="summary-icon-box indigo">
              <Clock size={18} />
            </div>
            <div className="summary-tile-content">
              <span className="summary-tile-val">
                {totalMinutesToday > 0 ? studyTimeString : "0m studied"}
              </span>
              <span className="summary-tile-lbl">
                {todaySessionsCount > 0
                  ? `${todaySessionsCount} active session${todaySessionsCount === 1 ? "" : "s"} today`
                  : "No study sessions yet today"}
              </span>
            </div>
          </div>

          {/* Tile 2: Topics Completed */}
          <div className="summary-tile">
            <div className="summary-icon-box emerald">
              <BookOpen size={18} />
            </div>
            <div className="summary-tile-content">
              <span className="summary-tile-val">
                {completedTopicsCount} of {topics.length} Topics
              </span>
              <span className="summary-tile-lbl">
                Comprehensive syllabus coverage
              </span>
            </div>
          </div>

          {/* Tile 3: Recent Quiz Performance */}
          <div className="summary-tile">
            <div className="summary-icon-box amber">
              <Award size={18} />
            </div>
            <div className="summary-tile-content">
              <span className="summary-tile-val">
                {averageAccuracy !== null ? `${averageAccuracy}% Accuracy` : "—"}
              </span>
              <span className="summary-tile-lbl">
                {recentQuizzes.length > 0
                  ? `Across past ${recentQuizzes.length} quiz attempts`
                  : "No quiz attempts yet"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
