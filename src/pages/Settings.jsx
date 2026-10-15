import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Sliders,
  Clock,
  Bell,
  Moon,
  Sun,
  RotateCcw,
  CheckCircle2,
  Save,
  ShieldAlert,
  Sparkles,
  Brain,
  Database,
  Cpu,
  Terminal,
  Activity,
  ChevronDown,
  ChevronUp,
  Trash2
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  getMLDiagnostics,
  getMLPredictionLogs,
  clearMLPredictionLogs
} from "../services/mlDebugService";
import { prepareTrainingData, getModelStatus } from "../services/mlService";
import DatasetPreview from "../components/dataset/DatasetPreview";

export default function Settings() {
  const {
    studentProfile,
    updateProfile,
    resetAllData,
    topics,
    sessions,
    quizAttempts,
    exams,
    studyPlan
  } = useApp();

  const [showMLDiagnostics, setShowMLDiagnostics] = useState(false);
  const [showDatasetPreview, setShowDatasetPreview] = useState(true);
  const [mlLogs, setMlLogs] = useState(() => getMLPredictionLogs());

  const profile = studentProfile || {};
  const [name, setName] = useState(profile.name || "Alex Morgan");
  const [semester, setSemester] = useState(profile.semester || "Semester V");
  const [branch, setBranch] = useState(profile.branch || "Computer Science & Engineering");
  const [email, setEmail] = useState(profile.email || "alex.morgan@university.edu");

  const [targetDailyHours, setTargetDailyHours] = useState(profile.targetDailyHours || 3.5);
  const [pomodoroFocusMin, setPomodoroFocusMin] = useState(profile.pomodoroFocusMin || 25);
  const [pomodoroBreakMin, setPomodoroBreakMin] = useState(profile.pomodoroBreakMin || 5);

  const [availableStart, setAvailableStart] = useState(profile.availableStart || "19:00");
  const [availableEnd, setAvailableEnd] = useState(profile.availableEnd || "22:30");

  const [soundEnabled, setSoundEnabled] = useState(profile.soundEnabled ?? true);
  const [dailyGoalReminder, setDailyGoalReminder] = useState(profile.dailyGoalReminder ?? true);
  const [breakAlerts, setBreakAlerts] = useState(profile.breakAlerts ?? true);

  const [savedBanner, setSavedBanner] = useState(false);

  // Synchronize state if studentProfile updates in context
  React.useEffect(() => {
    if (studentProfile) {
      if (studentProfile.name) setName(studentProfile.name);
      if (studentProfile.semester) setSemester(studentProfile.semester);
      if (studentProfile.branch) setBranch(studentProfile.branch);
      if (studentProfile.email) setEmail(studentProfile.email);
      if (studentProfile.targetDailyHours) setTargetDailyHours(studentProfile.targetDailyHours);
      if (studentProfile.pomodoroFocusMin) setPomodoroFocusMin(studentProfile.pomodoroFocusMin);
      if (studentProfile.pomodoroBreakMin) setPomodoroBreakMin(studentProfile.pomodoroBreakMin);
      if (studentProfile.availableStart) setAvailableStart(studentProfile.availableStart);
      if (studentProfile.availableEnd) setAvailableEnd(studentProfile.availableEnd);
      if (studentProfile.soundEnabled !== undefined) setSoundEnabled(studentProfile.soundEnabled);
      if (studentProfile.dailyGoalReminder !== undefined) setDailyGoalReminder(studentProfile.dailyGoalReminder);
      if (studentProfile.breakAlerts !== undefined) setBreakAlerts(studentProfile.breakAlerts);
    }
  }, [studentProfile]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      semester,
      branch,
      email,
      targetDailyHours: Number(targetDailyHours),
      pomodoroFocusMin: Number(pomodoroFocusMin),
      pomodoroBreakMin: Number(pomodoroBreakMin),
      availableStart,
      availableEnd,
      soundEnabled,
      dailyGoalReminder,
      breakAlerts
    });

    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  const toggleTheme = (themeChoice) => {
    updateProfile({ theme: themeChoice });
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your student profile, study preferences, and application theme.</p>
      </div>

      {savedBanner && (
        <div className="card saved-alert-banner animate-fade-in">
          <CheckCircle2 size={18} className="icon-success" />
          <span>Your preferences have been successfully updated!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="settings-stack">
        {/* ================= 1. PROFILE SECTION ================= */}
        <section className="card settings-section-card" aria-labelledby="profile-title">
          <div className="section-head-row">
            <div className="section-icon-badge bg-indigo">
              <User size={18} />
            </div>
            <div>
              <h2 id="profile-title" className="section-card-title">Student Profile</h2>
              <p className="section-card-sub">Academic details and contact identity</p>
            </div>
          </div>

          <div className="grid-2 form-inputs-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Student Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Degree / Branch</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Academic Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                <option value="Semester III">Semester III</option>
                <option value="Semester IV">Semester IV</option>
                <option value="Semester V">Semester V (Current Prototype)</option>
                <option value="Semester VI">Semester VI</option>
                <option value="Semester VII">Semester VII</option>
              </select>
            </div>
          </div>
        </section>

        {/* ================= 2. STUDY PREFERENCES ================= */}
        <section className="card settings-section-card" aria-labelledby="study-pref-title">
          <div className="section-head-row">
            <div className="section-icon-badge bg-emerald">
              <Sliders size={18} />
            </div>
            <div>
              <h2 id="study-pref-title" className="section-card-title">Study Preferences</h2>
              <p className="section-card-sub">Pacing, session lengths, and daily targets</p>
            </div>
          </div>

          <div className="grid-3 form-inputs-grid">
            <div className="form-group">
              <label className="form-label">Daily Study Target (Hours)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="12"
                value={targetDailyHours}
                onChange={(e) => setTargetDailyHours(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pomodoro Focus (Minutes)</label>
              <select
                value={pomodoroFocusMin}
                onChange={(e) => setPomodoroFocusMin(Number(e.target.value))}
              >
                <option value={20}>20 minutes</option>
                <option value={25}>25 minutes (Standard)</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes (Deep Session)</option>
                <option value={50}>50 minutes</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Rest Break (Minutes)</label>
              <select
                value={pomodoroBreakMin}
                onChange={(e) => setPomodoroBreakMin(Number(e.target.value))}
              >
                <option value={5}>5 minutes (Standard)</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes (Long Break)</option>
              </select>
            </div>
          </div>
        </section>

        {/* ================= 3. AVAILABLE STUDY TIME ================= */}
        <section className="card settings-section-card" aria-labelledby="time-pref-title">
          <div className="section-head-row">
            <div className="section-icon-badge bg-sky">
              <Clock size={18} />
            </div>
            <div>
              <h2 id="time-pref-title" className="section-card-title">Available Study Window</h2>
              <p className="section-card-sub">Default times for daily schedule planner</p>
            </div>
          </div>

          <div className="grid-2 form-inputs-grid">
            <div className="form-group">
              <label className="form-label">Evening Study Start Time</label>
              <input
                type="time"
                value={availableStart}
                onChange={(e) => setAvailableStart(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Evening Study End Time</label>
              <input
                type="time"
                value={availableEnd}
                onChange={(e) => setAvailableEnd(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ================= 4. THEME & APPEARANCE ================= */}
        <section className="card settings-section-card" aria-labelledby="theme-title">
          <div className="section-head-row">
            <div className="section-icon-badge bg-amber">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 id="theme-title" className="section-card-title">Appearance & Theme</h2>
              <p className="section-card-sub">Customize interface styling for your eyes</p>
            </div>
          </div>

          <div className="theme-toggle-grid">
            <button
              type="button"
              className={`theme-box-btn ${
                studentProfile?.theme !== "dark" ? "active" : ""
              }`}
              onClick={() => toggleTheme("light")}
            >
              <Sun size={24} className="theme-icon light" />
              <div className="theme-text">
                <span className="theme-label">Clean Light Mode</span>
                <span className="theme-sub">High contrast for daytime study</span>
              </div>
            </button>

            <button
              type="button"
              className={`theme-box-btn ${
                studentProfile?.theme === "dark" ? "active" : ""
              }`}
              onClick={() => toggleTheme("dark")}
            >
              <Moon size={24} className="theme-icon dark" />
              <div className="theme-text">
                <span className="theme-label">Modern Dark Mode</span>
                <span className="theme-sub">Reduced eye strain for night study</span>
              </div>
            </button>
          </div>
        </section>

        {/* ================= 5. NOTIFICATIONS & AUDIO ================= */}
        <section className="card settings-section-card" aria-labelledby="notif-title">
          <div className="section-head-row">
            <div className="section-icon-badge bg-rose">
              <Bell size={18} />
            </div>
            <div>
              <h2 id="notif-title" className="section-card-title">Notifications & Audio</h2>
              <p className="section-card-sub">Manage alerts and focus timer chimes</p>
            </div>
          </div>

          <div className="checkboxes-stack">
            <label className="setting-checkbox-row">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
              />
              <div>
                <span className="checkbox-title">Focus Timer Chimes</span>
                <span className="checkbox-sub">Play gentle sound effect when Pomodoro sessions finish</span>
              </div>
            </label>

            <label className="setting-checkbox-row">
              <input
                type="checkbox"
                checked={dailyGoalReminder}
                onChange={(e) => setDailyGoalReminder(e.target.checked)}
              />
              <div>
                <span className="checkbox-title">Daily Study Reminders</span>
                <span className="checkbox-sub">Gentle prompts when study time window begins</span>
              </div>
            </label>

            <label className="setting-checkbox-row">
              <input
                type="checkbox"
                checked={breakAlerts}
                onChange={(e) => setBreakAlerts(e.target.checked)}
              />
              <div>
                <span className="checkbox-title">Break Alerts</span>
                <span className="checkbox-sub">Alert when rest intervals conclude to restart focus</span>
              </div>
            </label>
          </div>
        </section>

        {/* Bottom Save Action */}
        <div className="settings-submit-bar">
          <button type="submit" className="btn btn-primary btn-lg save-settings-btn">
            <Save size={18} />
            Save Preferences
          </button>
        </div>
      </form>

      {/* ================= 6. DEVELOPER / ML INSIGHTS (ACADEMIC DEMO) ================= */}
      <section className="card settings-section-card" aria-labelledby="ml-demo-title">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div className="section-head-row" style={{ margin: 0 }}>
            <div className="section-icon-badge bg-indigo">
              <Brain size={18} />
            </div>
            <div>
              <h2 id="ml-demo-title" className="section-card-title">Developer / ML Insights</h2>
              <p className="section-card-sub">Academic demonstration view & internal ML pipeline diagnostics</p>
            </div>
          </div>
          <button
            type="button"
            className={`btn ${showMLDiagnostics ? "btn-primary" : "btn-outline"} btn-sm`}
            onClick={() => {
              setShowMLDiagnostics(!showMLDiagnostics);
              setMlLogs(getMLPredictionLogs());
            }}
          >
            <Terminal size={14} />
            <span>{showMLDiagnostics ? "Hide ML Diagnostics" : "Inspect ML Engine"}</span>
            {showMLDiagnostics ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showMLDiagnostics && (() => {
          const diagnostics = getMLDiagnostics({ topics, sessions, quizAttempts, exams, studyPlan });
          const trainingData = prepareTrainingData({ topics, sessions, quizAttempts, exams, studyPlan });
          const status = diagnostics.modelStatus;

          return (
            <div className="ml-diagnostics-body animate-fade-in" style={{ marginTop: "1.25rem", borderTop: "1px solid var(--border-color, #e2e8f0)", paddingTop: "1.25rem" }}>
              {/* Top Status & Architecture Row */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "12px",
                marginBottom: "16px"
              }}>
                <div style={{
                  padding: "12px 16px",
                  background: status === "trained" ? "rgba(16, 185, 129, 0.08)" : status === "baseline" ? "rgba(245, 158, 11, 0.08)" : "rgba(100, 116, 139, 0.08)",
                  border: `1px solid ${status === "trained" ? "rgba(16, 185, 129, 0.25)" : status === "baseline" ? "rgba(245, 158, 11, 0.25)" : "rgba(100, 116, 139, 0.25)"}`,
                  borderRadius: "8px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                      Model Status
                    </span>
                    <span className={`badge ${status === "trained" ? "badge-success" : status === "baseline" ? "badge-warning" : "badge-secondary"}`}>
                      {status === "trained" ? "Trained Mode Active" : status === "baseline" ? "Baseline Mode Active" : "Insufficient Data"}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {status === "trained"
                      ? "Sufficient historical samples recorded; multi-signal Logistic/Ridge inference active."
                      : status === "baseline"
                      ? "Deterministic mathematical baseline active while training data accumulates."
                      : "Fewer than 2 student activity records; fallback prior defaults active."}
                  </p>
                </div>

                <div style={{
                  padding: "12px 16px",
                  background: "var(--bg-surface, #f8fafc)",
                  border: "1px solid var(--border-color, #e2e8f0)",
                  borderRadius: "8px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <Cpu size={14} style={{ color: "#6366f1" }} />
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                      Pipeline Architecture
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {diagnostics.activeModelArchitecture.type}
                  </p>
                  <span style={{ fontSize: "0.75rem", color: "#6366f1", display: "block", marginTop: "2px" }}>
                    {diagnostics.activeModelArchitecture.backendTarget} • {diagnostics.activeModelArchitecture.privacyStatus}
                  </span>
                </div>
              </div>

              {/* Dataset & Training Metrics */}
              <div style={{ marginBottom: "16px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                  Dataset & Training Records
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
                  <div className="card" style={{ padding: "8px 12px", textAlign: "center" }}>
                    <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>{topics.length}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Total Topics</span>
                  </div>
                  <div className="card" style={{ padding: "8px 12px", textAlign: "center" }}>
                    <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#6366f1" }}>{quizAttempts.length}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Quiz Attempts</span>
                  </div>
                  <div className="card" style={{ padding: "8px 12px", textAlign: "center" }}>
                    <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#10b981" }}>{sessions.length}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Study Sessions</span>
                  </div>
                  <div className="card" style={{ padding: "8px 12px", textAlign: "center" }}>
                    <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#f59e0b" }}>{trainingData.length}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Training Samples</span>
                  </div>
                </div>
              </div>

              {/* Feature Vector Schema */}
              <div style={{ marginBottom: "16px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                  Derived Feature Vector Schema ({diagnostics.featuresVectorSchema.length} features)
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {diagnostics.featuresVectorSchema.map((feat) => (
                    <span key={feat} style={{
                      padding: "3px 8px",
                      fontSize: "0.75rem",
                      fontFamily: "monospace",
                      background: "rgba(99, 102, 241, 0.08)",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                      borderRadius: "4px",
                      color: "#4f46e5"
                    }}>
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Evaluation Metrics Framework */}
              <div style={{
                padding: "12px 16px",
                background: "var(--bg-surface, #f8fafc)",
                border: "1px solid var(--border-color, #e2e8f0)",
                borderRadius: "8px",
                marginBottom: "16px"
              }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                  Evaluation Metrics Framework
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.8rem" }}>
                  <div>
                    <strong>Classification Tasks:</strong>
                    <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
                      Accuracy, Precision, Recall, F1-Score (Calculated via <code>evaluateClassification</code> in <code>mlDebugService</code>)
                    </div>
                  </div>
                  <div>
                    <strong>Regression Tasks:</strong>
                    <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
                      MAE, RMSE, R² (Calculated via <code>evaluateRegression</code> in <code>mlDebugService</code>)
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", marginTop: "6px" }}>
                  * Metrics are computed from active student interaction data; zero fabricated test values.
                </span>
              </div>

              {/* Prediction History Logs */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                    Recent Inference Logs ({mlLogs.length} events)
                  </span>
                  {mlLogs.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-subtle btn-sm"
                      style={{ padding: "2px 8px", fontSize: "0.75rem" }}
                      onClick={() => {
                        clearMLPredictionLogs();
                        setMlLogs([]);
                      }}
                    >
                      <Trash2 size={12} />
                      Clear Logs
                    </button>
                  )}
                </div>

                {mlLogs.length > 0 ? (
                  <div style={{
                    maxHeight: "180px",
                    overflowY: "auto",
                    border: "1px solid var(--border-color, #e2e8f0)",
                    borderRadius: "6px",
                    background: "var(--bg-main, #ffffff)"
                  }}>
                    {mlLogs.slice(0, 8).map((log) => (
                      <div key={log.id} style={{
                        padding: "6px 10px",
                        borderBottom: "1px solid var(--border-color, #f1f5f9)",
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <div>
                          <strong style={{ color: "#6366f1" }}>[{log.task}]</strong> {log.modelType}
                          <span style={{ color: "var(--text-muted)", marginLeft: "8px" }}>
                            Result: {JSON.stringify(log.prediction)}
                          </span>
                        </div>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                          {log.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    No predictions logged in current session yet. Explore Home, Progress, or Focus to generate inferences.
                  </p>
                )}
              </div>
            </div>
          );
        })()}
      </section>

      {/* ================= ML DATASET PIPELINE & PREVIEW (PROMPT 8) ================= */}
      <section className="card settings-section-card" aria-labelledby="dataset-section-title">
        <div
          className="section-head-row"
          style={{
            cursor: "pointer",
            borderBottom: showDatasetPreview ? "1px solid var(--border-light)" : "none",
            marginBottom: showDatasetPreview ? "20px" : 0,
            paddingBottom: showDatasetPreview ? "14px" : 0
          }}
          onClick={() => setShowDatasetPreview((prev) => !prev)}
        >
          <div className="section-icon-badge bg-indigo">
            <Database size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 id="dataset-section-title" className="section-card-title">
                ML Dataset Pipeline & Export
              </h2>
              <span className="badge badge-primary">Developer / Admin</span>
            </div>
            <p className="section-card-sub">
              Pre-exam student + subject + exam feature vectors for exam score regression (Target: finalExamScore).
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowDatasetPreview((prev) => !prev);
            }}
          >
            {showDatasetPreview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showDatasetPreview && <DatasetPreview />}
      </section>

      {/* ================= 7. RESET DEMO DATA ================= */}
      <section className="card danger-zone-card" aria-labelledby="reset-title">
        <div className="danger-zone-head">
          <ShieldAlert size={20} className="danger-icon" />
          <div>
            <h3 id="reset-title" className="danger-title">Reset Prototype State</h3>
            <p className="danger-sub">
              Clear local storage and restore default Semester V demo data, topics, and initial tasks.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => {
            if (window.confirm("Are you sure you want to reset all prototype data to defaults?")) {
              resetAllData();
            }
          }}
        >
          <RotateCcw size={15} />
          Reset to Defaults
        </button>
      </section>

      <style>{`
        .saved-alert-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: var(--success-bg);
          border-color: rgba(16, 185, 129, 0.3);
          color: var(--success-text);
          font-weight: 600;
          font-size: 0.92rem;
          padding: 14px 20px;
          margin-bottom: 24px;
        }

        .settings-stack {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 32px;
        }

        .settings-section-card {
          padding: 24px;
        }

        .section-head-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border-light);
        }

        .section-icon-badge {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bg-indigo { background-color: #eef2ff; color: #4f46e5; }
        .bg-emerald { background-color: #ecfdf5; color: #10b981; }
        .bg-sky { background-color: #f0f9ff; color: #0284c7; }
        .bg-amber { background-color: #fffbeb; color: #d97706; }
        .bg-rose { background-color: #fef2f2; color: #ef4444; }

        .section-card-title {
          font-size: 1.2rem;
          color: var(--text-main);
          margin-bottom: 2px;
        }

        .section-card-sub {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .form-inputs-grid {
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        /* Theme Toggle */
        .theme-toggle-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 640px) {
          .theme-toggle-grid {
            grid-template-columns: 1fr;
          }
        }

        .theme-box-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          border-radius: var(--radius-lg);
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          text-align: left;
          transition: all 0.15s;
        }

        .theme-box-btn:hover {
          background-color: var(--bg-surface-hover);
        }

        .theme-box-btn.active {
          border-color: var(--primary);
          background-color: var(--primary-subtle);
          box-shadow: 0 0 0 1px var(--primary);
        }

        .theme-icon.light { color: #f59e0b; }
        .theme-icon.dark { color: #6366f1; }

        .theme-text {
          display: flex;
          flex-direction: column;
        }

        .theme-label {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .theme-sub {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        /* Checkboxes */
        .checkboxes-stack {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .setting-checkbox-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
        }

        .setting-checkbox-row input[type="checkbox"] {
          margin-top: 4px;
        }

        .checkbox-title {
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-main);
          display: block;
        }

        .checkbox-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .settings-submit-bar {
          display: flex;
          justify-content: flex-end;
        }

        .save-settings-btn {
          min-width: 200px;
        }

        /* Danger Zone */
        .danger-zone-card {
          border-color: rgba(239, 68, 68, 0.3);
          background-color: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          gap: 20px;
          flex-wrap: wrap;
        }

        .danger-zone-head {
          display: flex;
          align-items: center;
          gap: 14px;
          max-width: 600px;
        }

        .danger-icon {
          color: var(--danger);
          flex-shrink: 0;
        }

        .danger-title {
          font-size: 1.05rem;
          color: var(--text-main);
          margin-bottom: 2px;
        }

        .danger-sub {
          font-size: 0.84rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
