import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  Brain,
  Edit3,
  Timer,
  Network,
  Code2,
  Binary,
  Cpu,
  Sparkles,
  Layers,
  FileText,
  AlertCircle,
  RotateCcw,
  Circle,
  HelpCircle
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { SUBJECTS, MODULES, SYLLABUS_LABEL } from "../data/syllabus";
import {
  calculateTopicStatus,
  calculateAggregateStatus,
  getTopicProgress,
  SYLLABUS_STATUS
} from "../utils/mastery";

export default function Syllabus() {
  const { topics, navigateTo, isBackendOnline, isSyncing, completeTopicLearning } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState("cs-cn");
  const [searchQuery, setSearchQuery] = useState("");
  const [masteryFilter, setMasteryFilter] = useState("All");
  const [showLegend, setShowLegend] = useState(false);

  // Keep track of module accordion state
  const [expandedModules, setExpandedModules] = useState({
    "cn-m1": true,
    "cn-m2": true,
    "cn-m3": true,
    "cn-m4": true,
    "se-m1": true,
    "se-m2": true,
    "se-m3": true,
    "se-m4": true,
    "math-m1": true,
    "math-m2": true,
    "math-m3": true,
    "math-m4": true,
    "ml-m1": true,
    "ml-m2": true,
    "ml-m3": true,
    "ml-m4": true
  });

  const activeSubject =
    SUBJECTS.find((s) => s.id === selectedSubjectId) || SUBJECTS[0];
  const subjectModules = MODULES.filter((m) => m.subjectId === selectedSubjectId);

  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  // Filter topics using the exact same progress-based status function
  const getSubjectTopics = (modId) => {
    return topics.filter((t) => {
      if (t.moduleId !== modId) return false;
      if (searchQuery.trim()) {
        const matchesQuery =
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.explanation && t.explanation.toLowerCase().includes(searchQuery.toLowerCase()));
        if (!matchesQuery) return false;
      }
      if (masteryFilter !== "All") {
        const status = calculateTopicStatus(t);
        if (status.label !== masteryFilter) return false;
      }
      return true;
    });
  };

  // Subject overall progress & aggregate status (derived purely from actual topic progress)
  const allSubjectTopics = topics.filter((t) => t.subjectId === selectedSubjectId);
  const totalSubjectProgress = allSubjectTopics.reduce((acc, t) => acc + getTopicProgress(t), 0);
  const totalCompletion = allSubjectTopics.length
    ? Math.round(totalSubjectProgress / allSubjectTopics.length)
    : 0;
  const subjectStatus = calculateTopicStatus(totalCompletion);

  // Icon mapping
  const getSubjectIcon = (iconName) => {
    switch (iconName) {
      case "Network":
        return <Network size={20} />;
      case "Code2":
        return <Code2 size={20} />;
      case "Binary":
        return <Binary size={20} />;
      case "Cpu":
        return <Cpu size={20} />;
      default:
        return <BookOpen size={20} />;
    }
  };

  // Mastery status icon mapping
  const getStatusIcon = (iconName) => {
    switch (iconName) {
      case "Award":
        return <Award size={13} />;
      case "AlertCircle":
        return <AlertCircle size={13} />;
      case "RotateCcw":
        return <RotateCcw size={13} />;
      case "Timer":
        return <Timer size={13} />;
      case "CheckCircle2":
        return <CheckCircle2 size={13} />;
      case "Circle":
      default:
        return <Circle size={11} />;
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header syllabus-head-row">
        <div>
          <div className="prototype-badge-row">
            <span className="prototype-tag">
              <Sparkles size={13} />
              {SYLLABUS_LABEL}
            </span>
            <span className="prototype-sub-tag">64 Prototype Topics</span>
            <span className={`badge ${isSyncing ? "badge-warning" : isBackendOnline ? "badge-success" : "badge-neutral"}`} style={{ fontSize: "0.72rem", padding: "2px 8px" }}>
              {isSyncing ? "Syncing..." : isBackendOnline ? "Database Synced" : "Offline Cache"}
            </span>
          </div>
          <h1>My Syllabus</h1>
          <p>
            Representative Semester V topics organized by Subject → Module → Topic.
          </p>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="subject-tabs-container">
        {SUBJECTS.map((sub) => {
          const isSelected = sub.id === selectedSubjectId;
          const subTopics = topics.filter((t) => t.subjectId === sub.id);
          const subProgressSum = subTopics.reduce((acc, t) => acc + getTopicProgress(t), 0);
          const subPct = subTopics.length
            ? Math.round(subProgressSum / subTopics.length)
            : 0;
          const subStatus = calculateTopicStatus(subPct);

          return (
            <button
              key={sub.id}
              className={`subject-tab-btn ${isSelected ? "active" : ""}`}
              onClick={() => setSelectedSubjectId(sub.id)}
            >
              <span className="tab-icon">{getSubjectIcon(sub.icon)}</span>
              <div className="tab-text-group" style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <span className="tab-code">{sub.code}</span>
                  <span className={`badge ${subStatus.badgeClass}`} style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                    {subStatus.label}
                  </span>
                </div>
                <span className="tab-title">{sub.name}</span>
                <span className="tab-sub-stat">{subTopics.length} Topics · {subPct}% complete</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Subject Overview Card */}
      <div className="card subject-banner-card">
        <div className="banner-left">
          <div className="banner-code-badge">{activeSubject.code}</div>
          <div>
            <h2 className="banner-title">{activeSubject.name}</h2>
            <p className="banner-desc">{activeSubject.description}</p>
          </div>
        </div>

        <div className="banner-right">
          <div className="banner-stats-row">
            <div className="stat-box">
              <span className="stat-label">Modules</span>
              <span className="stat-value">{subjectModules.length} Modules</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Topics</span>
              <span className="stat-value">{allSubjectTopics.length} Topics</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Overall Completion</span>
              <span className="stat-value stat-primary">{totalCompletion}%</span>
            </div>
            <div className="stat-box" style={{ minWidth: "140px" }}>
              <span className="stat-label">Learning Status</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className={`badge ${subjectStatus.badgeClass}`} style={{ fontSize: "0.82rem", padding: "3px 9px" }}>
                  {getStatusIcon(subjectStatus.iconName)}
                  {subjectStatus.label}
                </span>
              </div>
            </div>
          </div>
          <div className="stat-bar-track">
            <div
              className="stat-bar-fill"
              style={{
                width: `${totalCompletion}%`,
                backgroundColor: totalCompletion >= 100 ? "var(--success)" : "var(--primary)",
                transition: "width 0.4s ease"
              }}
            />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="syllabus-toolbar">
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={`Search ${activeSubject.name} topics...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="syllabus-search-input"
          />
        </div>

        <div className="filter-group">
          <Filter size={16} className="filter-icon" />
          <span className="filter-label">Filter:</span>
          {[
            "All",
            SYLLABUS_STATUS.NOT_STARTED,
            SYLLABUS_STATUS.NEED_PRACTICE,
            SYLLABUS_STATUS.IN_PROGRESS,
            SYLLABUS_STATUS.COMPLETED
          ].map((status) => (
            <button
              key={status}
              className={`filter-pill-btn ${
                masteryFilter === status ? "active" : ""
              }`}
              onClick={() => setMasteryFilter(status)}
            >
              {status}
            </button>
          ))}
          <button
            type="button"
            className={`legend-toggle-btn ${showLegend ? "active" : ""}`}
            onClick={() => setShowLegend((prev) => !prev)}
            title="Toggle Status Guide"
          >
            <HelpCircle size={15} />
            <span>Status Guide</span>
          </button>
        </div>
      </div>

      {/* Status Guide Card */}
      {showLegend && (
        <div className="card mastery-legend-card animate-fade-in">
          <div className="mastery-legend-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <HelpCircle size={18} className="text-primary" />
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                Topic Status Guide
              </h3>
            </div>
            <button
              type="button"
              className="btn-icon-subtle"
              onClick={() => setShowLegend(false)}
              aria-label="Close guide"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.1rem" }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: "4px 0 14px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Statuses are strictly based on actual learning progress percentage.
          </p>
          <div className="mastery-legend-grid">
            <div className="legend-item">
              <span className="badge badge-neutral" style={{ width: "fit-content" }}>
                <Circle size={11} />
                Not Started
              </span>
              <span className="legend-item-desc">
                <strong>0% progress:</strong> Topic has not been started yet.
              </span>
            </div>
            <div className="legend-item">
              <span className="badge badge-danger" style={{ width: "fit-content" }}>
                <AlertCircle size={13} />
                Need Practice
              </span>
              <span className="legend-item-desc">
                <strong>Above 0% and below 50%:</strong> Early learning stage, more practice needed.
              </span>
            </div>
            <div className="legend-item">
              <span className="badge badge-info" style={{ width: "fit-content" }}>
                <Timer size={13} />
                In Progress
              </span>
              <span className="legend-item-desc">
                <strong>50% to less than 100%:</strong> Substantial study completed and currently in progress.
              </span>
            </div>
            <div className="legend-item">
              <span className="badge badge-success" style={{ width: "fit-content" }}>
                <CheckCircle2 size={13} />
                Completed
              </span>
              <span className="legend-item-desc">
                <strong>100% progress:</strong> Topic learning is fully completed.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modules (4 Modules) and Topics (4 Topics per Module) */}
      <div className="modules-stack">
        {subjectModules.map((module) => {
          const modTopics = getSubjectTopics(module.id);
          const modAllTopics = topics.filter((t) => t.moduleId === module.id);
          const modTotalProgress = modAllTopics.reduce((acc, t) => acc + getTopicProgress(t), 0);
          const modCompletion = modAllTopics.length
            ? Math.round(modTotalProgress / modAllTopics.length)
            : 0;
          const modStatus = calculateTopicStatus(modCompletion);
          const isExpanded = expandedModules[module.id] ?? true;

          return (
            <div key={module.id} className="module-container card">
              {/* Module Header - Clickable to expand/collapse */}
              <div
                className="module-header"
                onClick={() => toggleModule(module.id)}
              >
                <div className="module-title-group">
                  <div className="module-order-badge">0{module.order}</div>
                  <div>
                    <h3 className="module-title">{module.title}</h3>
                    <p className="module-description">{module.description}</p>
                  </div>
                </div>

                <div className="module-header-meta">
                  <span
                    className={`badge ${modStatus.badgeClass}`}
                    style={{ fontSize: "0.74rem", padding: "2px 8px" }}
                    title={`Module Status: ${modStatus.label}`}
                  >
                    {getStatusIcon(modStatus.iconName)}
                    {modStatus.label}
                  </span>
                  <div className="module-count-badge">
                    {modAllTopics.length} Topics
                  </div>
                  <div className="module-progress-wrapper" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      className="module-bar-track"
                      style={{
                        width: "80px",
                        height: "6px",
                        backgroundColor: "var(--border-light)",
                        borderRadius: "var(--radius-full)",
                        overflow: "hidden"
                      }}
                      title={`Module progress: ${modCompletion}%`}
                    >
                      <div
                        className="module-bar-fill"
                        style={{
                          width: `${modCompletion}%`,
                          height: "100%",
                          backgroundColor: modCompletion >= 100 ? "var(--success)" : "var(--primary)",
                          borderRadius: "var(--radius-full)",
                          transition: "width 0.4s ease"
                        }}
                      />
                    </div>
                    <div className="module-progress-chip">
                      <span>{modCompletion}%</span>
                    </div>
                  </div>
                  <button
                    className="accordion-toggle-btn"
                    aria-label={isExpanded ? "Collapse module" : "Expand module"}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Topics List */}
              {isExpanded && (
                <div className="topics-list-container">
                  {modTopics.length === 0 ? (
                    <div className="empty-topics-msg">
                      No topics matched your search or filter criteria.
                    </div>
                  ) : (
                    modTopics.map((topic) => {
                      const topicProgress = getTopicProgress(topic);
                      const isCompleted = topicProgress >= 100;
                      const topicStatus = calculateTopicStatus(topic);
                      const diffLabel = topic.difficulty ? topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1) : "Medium";

                      return (
                        <div key={topic.id} className="topic-card-row">
                          <div className="topic-primary-col">
                            <div className="topic-title-line">
                              <h4
                                className="topic-title"
                                style={{ cursor: "pointer" }}
                                onClick={() => navigateTo("learn", topic.id)}
                                title="Learn this concept"
                              >
                                {topic.title}
                              </h4>
                              <span
                                className={`badge badge-sm ${
                                  diffLabel === "Hard"
                                    ? "badge-danger"
                                    : diffLabel === "Medium"
                                    ? "badge-warning"
                                    : "badge-neutral"
                                }`}
                              >
                                {diffLabel}
                              </span>
                            </div>

                            <div className="topic-meta-line">
                              {topic.estimatedMinutes ? (
                                <span className="meta-item">
                                  <Clock size={13} />
                                  {topic.estimatedMinutes} min
                                </span>
                              ) : null}
                              {topic.lastStudied && (
                                <>
                                  {topic.estimatedMinutes ? <span className="meta-separator">•</span> : null}
                                  <span className="meta-item">
                                    Last studied: {topic.lastStudied}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Progress and status */}
                          <div className="topic-status-col">
                            <div className="completion-col">
                              <div className="completion-bar">
                                <div
                                   className="completion-fill"
                                  style={{
                                    width: `${topicProgress}%`,
                                    backgroundColor: topicProgress >= 100 ? "var(--success)" : "var(--primary)",
                                    transition: "width 0.4s ease"
                                  }}
                                />
                              </div>
                              <span className="completion-pct">
                                {topicProgress}%
                              </span>
                            </div>

                            <span
                              className={`badge ${topicStatus.badgeClass}`}
                              title={topicStatus.description}
                              style={{ fontSize: "0.78rem" }}
                            >
                              {getStatusIcon(topicStatus.iconName)}
                              {topicStatus.label}
                            </span>
                          </div>

                          {/* Action Buttons: Complete, Learn, Practice, Focus */}
                          <div className="topic-actions-col">
                            <button
                              className={`btn btn-sm ${isCompleted ? "btn-success" : "btn-outline"}`}
                              onClick={() => completeTopicLearning(topic.id, !isCompleted)}
                              title={isCompleted ? "Mark incomplete in syllabus" : "Mark complete in syllabus"}
                              style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                            >
                              <CheckCircle2 size={14} />
                              <span>{isCompleted ? "Completed ✓" : "Mark Complete"}</span>
                            </button>
                            <button
                              className="btn btn-subtle btn-sm"
                              onClick={() => navigateTo("learn", topic.id)}
                              title="Learn this topic"
                            >
                              <Brain size={14} />
                              Learn
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => navigateTo("practice", topic.id)}
                              title="Practice this topic"
                            >
                              <Edit3 size={14} />
                              Practice
                            </button>
                            <button
                              className="btn btn-outline btn-sm desktop-only-inline"
                              onClick={() => navigateTo("focus", topic.id)}
                              title="Start focus timer"
                            >
                              <Timer size={14} />
                              Focus
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .prototype-badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .prototype-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: var(--primary-subtle);
          color: var(--primary);
          font-size: 0.76rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .prototype-sub-tag {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        /* Subject Tabs */
        .subject-tabs-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        @media (max-width: 960px) {
          .subject-tabs-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 560px) {
          .subject-tabs-container {
            grid-template-columns: 1fr;
          }
        }

        .subject-tab-btn {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          text-align: left;
          transition: all 0.15s ease;
        }

        .subject-tab-btn:hover {
          border-color: var(--primary-subtle);
          background-color: var(--bg-surface-hover);
        }

        .subject-tab-btn.active {
          border-color: var(--primary);
          background-color: var(--primary-subtle);
          box-shadow: 0 0 0 1px var(--primary);
        }

        .tab-icon {
          color: var(--primary);
          display: flex;
          margin-top: 2px;
        }

        .tab-text-group {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .tab-code {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: 0.05em;
        }

        .tab-title {
          font-size: 0.94rem;
          font-weight: 700;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 2px 0;
        }

        .tab-sub-stat {
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        /* Subject Banner */
        .subject-banner-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 24px;
          flex-wrap: wrap;
        }

        .banner-left {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          max-width: 620px;
        }

        .banner-code-badge {
          background-color: var(--primary);
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: var(--radius-md);
          letter-spacing: 0.05em;
        }

        .banner-title {
          font-size: 1.45rem;
          margin-bottom: 4px;
        }

        .banner-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .banner-right {
          min-width: 300px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .banner-stats-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .stat-box {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.74rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        .stat-value {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .stat-primary {
          color: var(--primary);
        }

        .stat-bar-track {
          height: 8px;
          background-color: var(--border-light);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .stat-bar-fill {
          height: 100%;
          background-color: var(--primary);
          border-radius: var(--radius-full);
        }

        /* Toolbar */
        .syllabus-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box-wrapper {
          position: relative;
          flex: 1;
          min-width: 260px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
          pointer-events: none;
        }

        .syllabus-search-input {
          width: 100%;
          padding-left: 42px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-icon {
          color: var(--text-dim);
        }

        .filter-label {
          font-size: 0.84rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .filter-pill-btn {
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
        }

        .filter-pill-btn:hover {
          background-color: var(--bg-surface-hover);
        }

        .filter-pill-btn.active {
          background-color: var(--primary);
          color: #ffffff;
          border-color: var(--primary);
        }

        /* Modules Stack */
        .modules-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .module-container {
          padding: 0;
          overflow: hidden;
        }

        .module-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          cursor: pointer;
          background-color: var(--bg-surface);
          border-bottom: 1px solid var(--border-light);
          user-select: none;
          transition: background-color 0.15s;
        }

        .module-header:hover {
          background-color: var(--bg-surface-hover);
        }

        .module-title-group {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .module-order-badge {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background-color: var(--bg-surface-hover);
          color: var(--text-secondary);
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .module-title {
          font-size: 1.12rem;
          margin-bottom: 2px;
        }

        .module-description {
          font-size: 0.84rem;
          color: var(--text-muted);
        }

        .module-header-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .module-count-badge {
          font-size: 0.78rem;
          color: var(--text-muted);
          background-color: var(--bg-subtle);
          padding: 3px 8px;
          border-radius: var(--radius-sm);
        }

        .module-progress-chip {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          background-color: var(--bg-subtle);
          padding: 4px 10px;
          border-radius: var(--radius-sm);
        }

        .accordion-toggle-btn {
          color: var(--text-muted);
          display: flex;
          padding: 4px;
        }

        /* Topics List */
        .topics-list-container {
          display: flex;
          flex-direction: column;
        }

        .empty-topics-msg {
          padding: 24px;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .topic-card-row {
          display: grid;
          grid-template-columns: 2fr 1.2fr auto;
          align-items: center;
          gap: 16px;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-light);
          transition: background-color 0.15s;
        }

        .topic-card-row:last-child {
          border-bottom: none;
        }

        .topic-card-row:hover {
          background-color: var(--bg-subtle);
        }

        .topic-title-line {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }

        .topic-title {
          font-size: 0.96rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .topic-meta-line {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .meta-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .meta-separator {
          color: var(--text-dim);
        }

        .topic-status-col {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .completion-col {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 100px;
        }

        .completion-bar {
          flex: 1;
          height: 6px;
          background-color: var(--border-light);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .completion-fill {
          height: 100%;
          background-color: var(--success);
          border-radius: var(--radius-full);
          transition: width 0.4s ease;
        }

        .completion-pct {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          width: 32px;
        }

        .topic-actions-col {
          display: flex;
          align-items: center;
          gap: 8px;
        }


        .legend-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.15s ease;
          margin-left: 6px;
        }

        .legend-toggle-btn:hover,
        .legend-toggle-btn.active {
          background-color: var(--bg-surface-hover);
          color: var(--primary);
          border-color: var(--primary);
        }

        /* Mastery Legend Card */
        .mastery-legend-card {
          margin-bottom: 24px;
          padding: 16px 20px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }

        .mastery-legend-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .mastery-legend-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 12px;
        }

        .legend-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          background-color: var(--bg-subtle);
          border: 1px solid var(--border-light);
        }

        .legend-item-desc {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        @media (max-width: 860px) {
          .topic-card-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .topic-status-col {
            justify-content: space-between;
          }

          .topic-actions-col {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
