import React from "react";
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  Award,
  Flame
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { SUBJECTS, TOPICS } from "../data/syllabus";
import {
  getWeeklyStudySessions,
  getTotalStudyTime,
  calculateStudyStreak,
  getWeeklyStudyTime,
  getDailyStudyTime
} from "../services/storageService";
import { generateRecommendations } from "../services/mlService";

export default function Progress() {
  const {
    topics,
    sessions,
    quizAttempts,
    exams,
    navigateTo,
    startFocusForTopic
  } = useApp();

  // Helper functions for session calculations
  const getSessionMins = (s) =>
    s.durationMinutes !== undefined
      ? Number(s.durationMinutes) || 0
      : s.active_duration_seconds
      ? Math.round(Number(s.active_duration_seconds) / 60)
      : 0;
  const getSessionSubId = (s) => s.subjectId || s.subject_id || "cs-cn";
  const getSessionDate = (s) =>
    s.date || (s.started_at ? s.started_at.split("T")[0] : "");

  // ==================================================
  // 1. THIS WEEK CALCULATIONS (Dynamic from actual data)
  // ==================================================
  const weeklySessions = getWeeklyStudySessions(sessions);
  const weeklySessionMins = getTotalStudyTime(weeklySessions);
  const weeklyActivityMins = getWeeklyStudyTime();
  const weeklyTotalMinutes = Math.max(weeklySessionMins, weeklyActivityMins);
  const weeklyHours = Math.floor(weeklyTotalMinutes / 60);
  const weeklyMins = weeklyTotalMinutes % 60;
  const weeklyTimeString =
    weeklyHours > 0 ? `${weeklyHours}h ${weeklyMins}m` : `${weeklyMins}m`;

  const completedWeeklySessions = weeklySessions.filter(
    (s) => s.completed !== false
  );
  const completedSessionsCount = completedWeeklySessions.length;
  const avgSessionLength =
    completedSessionsCount > 0
      ? Math.round(weeklyTotalMinutes / completedSessionsCount)
      : 0;

  // Most studied subject
  const subjectMinutesMap = {};
  weeklySessions.forEach((s) => {
    const subId = getSessionSubId(s);
    subjectMinutesMap[subId] =
      (subjectMinutesMap[subId] || 0) + getSessionMins(s);
  });
  let mostStudiedSubId = null;
  let maxSubMinutes = 0;
  Object.entries(subjectMinutesMap).forEach(([id, mins]) => {
    if (mins > maxSubMinutes) {
      maxSubMinutes = mins;
      mostStudiedSubId = id;
    }
  });
  const mostStudiedSubjectName = mostStudiedSubId
    ? SUBJECTS.find((s) => s.id === mostStudiedSubId)?.name || "Computer Networks"
    : weeklyTotalMinutes > 0
    ? "Computer Networks"
    : "None yet";

  // Study activity by day (last 7 calendar days)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayDate = new Date();
  const dailyActivity = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayDate.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = dayNames[d.getDay()];
    const isToday = i === 0;

    const dayMinutesFromSessions = weeklySessions
      .filter((s) => getSessionDate(s) === dateStr)
      .reduce((sum, s) => sum + getSessionMins(s), 0);
    const dayMinutesFromActivity = getDailyStudyTime(dateStr);
    const dayMinutes = Math.max(dayMinutesFromSessions, dayMinutesFromActivity);
    const dayHours = Math.round((dayMinutes / 60) * 10) / 10;

    dailyActivity.push({
      day: isToday ? `${dayName} (Today)` : dayName,
      shortDay: dayName,
      hours: dayHours,
      minutes: dayMinutes,
      isToday
    });
  }

  const maxActivityHour = Math.max(1, ...dailyActivity.map((d) => d.hours), 3);
  const currentStreak = calculateStudyStreak(sessions);

  // ==================================================
  // 2. QUIZ PERFORMANCE (Standalone general practice only)
  // Strictly isolates practice from exam-specific attempts
  // ==================================================
  const practiceAttempts = (quizAttempts || [])
    .filter((q) => !q.examId && !q.exam_id)
    .sort(
      (a, b) =>
        new Date(b.date || b.attemptedAt || 0) -
        new Date(a.date || a.attemptedAt || 0)
    );

  // ==================================================
  // 3. LEARNING INSIGHTS (Intelligence Recommendations)
  // ==================================================
  const mlRecommendations = generateRecommendations({
    topics,
    sessions,
    quizAttempts,
    exams
  });
  const mlInsights = mlRecommendations.insights || {
    strongAreas: [],
    topicsNeedingPractice: [],
    recentlyImproved: [],
    suggestedRevision: []
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1>My Progress</h1>
        <p>
          A clear, focused view of your weekly study habits, quiz performance, and learning insights.
        </p>
      </div>

      {/* ==================================================
          SECTION 1: THIS WEEK
          ================================================== */}
      <section className="progress-section" aria-labelledby="heading-this-week">
        <div className="section-title-row">
          <h2 id="heading-this-week" className="section-title">
            This Week
          </h2>
          <span
            className="section-subtext"
            style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
          >
            Real study session activity
          </span>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid-4 metrics-banner-grid" style={{ marginBottom: "1.25rem" }}>
          {/* 1. Total Study Time */}
          <div className="card overview-stat-card">
            <span className="overview-label">Total Study Time</span>
            <div className="stat-headline-row">
              <span className="stat-big-number">{weeklyTimeString}</span>
              <span className="icon-chip bg-indigo">
                <Clock size={16} />
              </span>
            </div>
            <p className="stat-footnote-text">Active focused learning across last 7 days</p>
          </div>

          {/* 2. Completed Sessions */}
          <div className="card overview-stat-card">
            <span className="overview-label">Completed Sessions</span>
            <div className="stat-headline-row">
              <span className="stat-big-number">{completedSessionsCount}</span>
              <span className="icon-chip bg-emerald">
                <CheckCircle2 size={16} />
              </span>
            </div>
            <p className="stat-footnote-text">Full Pomodoro and focus blocks finished</p>
          </div>

          {/* 3. Average Session Length */}
          <div className="card overview-stat-card">
            <span className="overview-label">Average Session Length</span>
            <div className="stat-headline-row">
              <span className="stat-big-number">{avgSessionLength} min</span>
              <span className="icon-chip bg-sky">
                <TrendingUp size={16} />
              </span>
            </div>
            <p className="stat-footnote-text">Average focus duration per session</p>
          </div>

          {/* 4. Most Studied Subject */}
          <div className="card overview-stat-card">
            <span className="overview-label">Most Studied Subject</span>
            <div className="stat-headline-row">
              <span
                className="stat-big-number"
                style={{ fontSize: "1.15rem", lineHeight: 1.3 }}
              >
                {mostStudiedSubjectName}
              </span>
              <span className="icon-chip bg-amber">
                <Award size={16} />
              </span>
            </div>
            <p className="stat-footnote-text">Highest concentrated study time</p>
          </div>
        </div>

        {/* Streak & Daily Activity Chart */}
        <div className="grid-2 consistency-grid">
          {/* Current Study Streak Card */}
          <div className="card streak-card">
            <div className="streak-badge-box">
              <Flame size={32} className="streak-flame" />
              <div>
                <span className="streak-number">{currentStreak} Days</span>
                <span className="streak-label">Current Study Streak 🔥</span>
              </div>
            </div>
            <p className="streak-encourage-text">
              "Great momentum! Studying consistently for 25 to 45 minutes every day boosts retention and reduces exam anxiety."
            </p>
          </div>

          {/* Study Activity By Day Bar Chart */}
          <div className="card weekly-chart-card">
            <div className="chart-header">
              <span className="chart-title">Study Activity by Day</span>
              <span className="chart-avg">Total: {weeklyTimeString}</span>
            </div>

            <div className="bars-container">
              {dailyActivity.map((bar, idx) => {
                const heightPct = Math.min(
                  100,
                  (bar.hours / maxActivityHour) * 100
                );
                return (
                  <div key={idx} className="bar-column">
                    <span className="bar-val-label">
                      {bar.hours > 0 ? `${bar.hours}h` : "0m"}
                    </span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${Math.max(bar.hours > 0 ? 12 : 4, heightPct)}%`,
                          backgroundColor: bar.isToday ? "#6366f1" : undefined
                        }}
                      />
                    </div>
                    <span
                      className="bar-day-label"
                      style={{ fontWeight: bar.isToday ? 700 : 500 }}
                    >
                      {bar.shortDay}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 2: QUIZ PERFORMANCE
          ================================================== */}
      <section className="progress-section" aria-labelledby="heading-quiz">
        <div
          className="section-title-row"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem"
          }}
        >
          <div>
            <h2 id="heading-quiz" className="section-title" style={{ margin: 0 }}>
              Quiz Performance
            </h2>
            <span
              className="section-subtext"
              style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
            >
              Standalone practice quiz attempts and accuracy tracking
            </span>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigateTo("practice")}
          >
            Take Another Quiz
          </button>
        </div>

        <div className="card quiz-history-card">
          <div className="history-table-wrapper">
            <table className="quiz-history-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {practiceAttempts.length > 0 ? (
                  practiceAttempts.slice(0, 10).map((q) => {
                    const topicTitle =
                      q.topicTitle ||
                      TOPICS.find((t) => t.id === (q.topicId || q.topic_id))?.title ||
                      q.topicId ||
                      "Practice Quiz";
                    const totalQ = Number(q.totalQuestions || q.total_questions || 5);
                    const scoreVal = Number(q.score ?? 0);
                    const pctVal =
                      q.percentage !== undefined && q.percentage !== null
                        ? Number(q.percentage)
                        : totalQ > 0
                        ? Math.round((scoreVal / totalQ) * 100)
                        : 0;
                    const dateVal =
                      q.date ||
                      (q.attemptedAt ? q.attemptedAt.split("T")[0] : "Recent");

                    return (
                      <tr key={q.id}>
                        <td className="table-topic-col">
                          <strong>{topicTitle}</strong>
                        </td>
                        <td className="table-date-col">{dateVal}</td>
                        <td>
                          {scoreVal} / {totalQ}
                        </td>
                        <td>
                          <span className="accuracy-pct">{pctVal}%</span>
                        </td>
                        <td>
                          <span
                            className={`badge badge-sm ${
                              pctVal >= 80
                                ? "badge-success"
                                : pctVal >= 60
                                ? "badge-warning"
                                : "badge-danger"
                            }`}
                          >
                            {pctVal >= 80
                              ? "Doing well"
                              : pctVal >= 60
                              ? "Review soon"
                              : "Needs practice"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: "2.5rem 1rem",
                        color: "var(--text-muted)"
                      }}
                    >
                      No practice quiz attempts recorded yet. Take a quiz to test your knowledge!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 3: LEARNING INSIGHTS (RESTORED)
          ================================================== */}
      <section className="progress-section" aria-labelledby="heading-insights">
        <div className="section-title-row">
          <div>
            <h2 id="heading-insights" className="section-title">
              Learning Insights
            </h2>
            <span
              className="section-subtext"
              style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
            >
              Data-driven patterns detected across quizzes, revisions, and study habits
            </span>
          </div>
        </div>

        <div className="grid-2 strengths-grid">
          {/* Card A: Strong Areas */}
          <section className="card list-section-card" aria-labelledby="heading-strong">
            <div className="card-section-header">
              <div className="header-icon-title">
                <span className="status-dot success" />
                <h3 id="heading-strong" className="card-heading">
                  Strong Areas
                </h3>
              </div>
              <span className="badge badge-success">
                {mlInsights.strongAreas.length} Mastered
              </span>
            </div>

            <div className="topics-item-stack">
              {mlInsights.strongAreas.length > 0 ? (
                mlInsights.strongAreas.map((topic) => (
                  <div key={topic.id} className="progress-topic-row">
                    <div>
                      <h4 className="topic-name">{topic.title}</h4>
                      <span className="topic-sub">
                        {topic.averageQuizScore
                          ? `Avg Quiz: ${topic.averageQuizScore}%`
                          : "Mastered"}{" "}
                        · High retention
                      </span>
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => navigateTo("practice", topic.id)}
                    >
                      Practice
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ margin: "1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Keep practicing quizzes to build your strong mastery areas.
                </p>
              )}
            </div>
          </section>

          {/* Card B: Topics Needing Practice */}
          <section className="card list-section-card" aria-labelledby="heading-practice-needed">
            <div className="card-section-header">
              <div className="header-icon-title">
                <span className="status-dot danger" />
                <h3 id="heading-practice-needed" className="card-heading">
                  Topics Needing Practice
                </h3>
              </div>
              <span className="badge badge-danger">
                {mlInsights.topicsNeedingPractice.length} Focus Areas
              </span>
            </div>

            <div className="topics-item-stack">
              {mlInsights.topicsNeedingPractice.length > 0 ? (
                mlInsights.topicsNeedingPractice.map((topic) => (
                  <div key={topic.id} className="progress-topic-row">
                    <div>
                      <h4 className="topic-name">{topic.title}</h4>
                      <span className="topic-sub">
                        {topic.averageQuizScore > 0
                          ? `Avg Quiz: ${topic.averageQuizScore}% · Needs reinforcement`
                          : "Needs practice"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => startFocusForTopic(topic.id, 25)}
                        title="Start focus timer"
                      >
                        Focus
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => navigateTo("practice", topic.id)}
                        title="Practice quiz"
                      >
                        Quiz
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ margin: "1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Great work! No critical weak areas detected at this time.
                </p>
              )}
            </div>
          </section>

          {/* Card C: Recently Improved */}
          <section className="card list-section-card" aria-labelledby="heading-improved">
            <div className="card-section-header">
              <div className="header-icon-title">
                <span
                  className="status-dot"
                  style={{ backgroundColor: "#38bdf8" }}
                />
                <h3 id="heading-improved" className="card-heading">
                  Recently Improved
                </h3>
              </div>
              <span
                className="badge"
                style={{
                  backgroundColor: "rgba(56, 189, 248, 0.15)",
                  color: "#0284c7"
                }}
              >
                {mlInsights.recentlyImproved.length} Upward Trend
              </span>
            </div>

            <div className="topics-item-stack">
              {mlInsights.recentlyImproved.length > 0 ? (
                mlInsights.recentlyImproved.map((topic) => (
                  <div key={topic.id} className="progress-topic-row">
                    <div>
                      <h4 className="topic-name">{topic.title}</h4>
                      <span className="topic-sub" style={{ color: "#0284c7" }}>
                        Recent practice scores gained ground over historical average
                      </span>
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => navigateTo("practice", topic.id)}
                    >
                      Keep Momentum
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ margin: "1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Complete additional practice quizzes to detect upward improvement curves.
                </p>
              )}
            </div>
          </section>

          {/* Card D: Suggested Revision */}
          <section className="card list-section-card" aria-labelledby="heading-revision">
            <div className="card-section-header">
              <div className="header-icon-title">
                <span className="status-dot warning" />
                <h3 id="heading-revision" className="card-heading">
                  Suggested Revision
                </h3>
              </div>
              <span className="badge badge-warning">
                {mlInsights.suggestedRevision.length} High Yield
              </span>
            </div>

            <div className="topics-item-stack">
              {mlInsights.suggestedRevision.length > 0 ? (
                mlInsights.suggestedRevision.map((topic) => (
                  <div key={topic.id} className="progress-topic-row">
                    <div>
                      <h4 className="topic-name">{topic.title}</h4>
                      <span className="topic-sub">
                        Not studied recently · Revise to prevent memory decay
                      </span>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => startFocusForTopic(topic.id, 25)}
                    >
                      Revise
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ margin: "1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Your revision schedule is current. All recent topics are fresh in memory.
                </p>
              )}
            </div>
          </section>
        </div>
      </section>

      {/* Embedded Component Styles */}
      <style>{`
        .progress-section {
          margin-bottom: 36px;
        }

        .section-title {
          font-size: 1.35rem;
          margin-bottom: 16px;
        }

        .metrics-banner-grid {
          margin-bottom: 24px;
        }

        .overview-stat-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .overview-label {
          font-size: 0.82rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        .stat-headline-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-big-number {
          font-family: var(--font-display);
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1;
        }

        .stat-footnote-text {
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .icon-chip {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Consistency Grid */
        .consistency-grid {
          margin-bottom: 20px;
        }

        .streak-card {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 28px;
        }

        .streak-badge-box {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 16px;
        }

        .streak-flame {
          color: #f59e0b;
        }

        .streak-number {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-main);
          display: block;
          line-height: 1;
        }

        .streak-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .streak-encourage-text {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.5;
          font-style: italic;
        }

        /* Weekly Chart */
        .weekly-chart-card {
          padding: 24px;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .chart-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .chart-avg {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .bars-container {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 140px;
          padding-top: 20px;
        }

        .bar-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          flex: 1;
        }

        .bar-val-label {
          font-size: 0.72rem;
          color: var(--text-dim);
        }

        .bar-track {
          width: 22px;
          height: 90px;
          background-color: var(--border-light);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }

        .bar-fill {
          width: 100%;
          background: linear-gradient(180deg, var(--primary) 0%, #4338ca 100%);
          border-radius: var(--radius-sm);
          transition: height 0.4s ease;
        }

        .bar-day-label {
          font-size: 0.74rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        /* Quiz History Table */
        .quiz-history-card {
          padding: 0;
          overflow: hidden;
        }

        .history-table-wrapper {
          overflow-x: auto;
        }

        .quiz-history-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          text-align: left;
        }

        .quiz-history-table th {
          background-color: var(--bg-subtle);
          padding: 14px 20px;
          color: var(--text-muted);
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-light);
        }

        .quiz-history-table td {
          padding: 14px 20px;
          border-bottom: 1px solid var(--border-light);
          color: var(--text-secondary);
        }

        .quiz-history-table tr:last-child td {
          border-bottom: none;
        }

        .table-topic-col strong {
          color: var(--text-main);
        }

        .table-date-col {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .accuracy-pct {
          font-weight: 700;
          color: var(--text-main);
        }

        /* Strengths & Weaknesses / Learning Insights */
        .strengths-grid {
          margin-bottom: 36px;
        }

        .list-section-card {
          padding: 24px;
        }

        .card-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .header-icon-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-heading {
          font-size: 1.15rem;
          margin: 0;
          color: var(--text-main);
          font-weight: 700;
        }

        .topics-item-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .progress-topic-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          gap: 12px;
        }

        .topic-name {
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 2px;
        }

        .topic-sub {
          font-size: 0.76rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
