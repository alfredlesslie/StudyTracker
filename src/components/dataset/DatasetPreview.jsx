import React, { useState, useMemo } from "react";
import {
  Database,
  Download,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Layers,
  Users,
  BookOpen,
  Calendar,
  Sparkles,
  HelpCircle,
  FileSpreadsheet
} from "lucide-react";
import {
  getHistoricalDataset,
  getPredictionDataset,
  getAllDatasetRecords,
  validateDataset,
  exportDatasetToCSV,
  exportTrainingDataset,
  DATASET_FEATURE_COLUMNS
} from "../../services/datasetService.js";

export default function DatasetPreview() {
  const [activeTab, setActiveTab] = useState("historical"); // "historical" | "prediction" | "all"
  const [searchQuery, setSearchQuery] = useState("");

  const historicalRecords = useMemo(() => getHistoricalDataset(), []);
  const predictionRecords = useMemo(() => getPredictionDataset(), []);
  const allRecords = useMemo(() => getAllDatasetRecords(), []);

  // Validation report
  const validationReport = useMemo(() => validateDataset(allRecords), [allRecords]);

  // Distinct counts
  const distinctSubjects = useMemo(() => {
    return new Set(allRecords.map((r) => r.subjectId)).size;
  }, [allRecords]);

  const distinctStudents = useMemo(() => {
    return new Set(allRecords.map((r) => r.studentId)).size;
  }, [allRecords]);

  // Display records based on active tab
  const displayedRecords = useMemo(() => {
    let list = [];
    if (activeTab === "historical") list = historicalRecords;
    else if (activeTab === "prediction") list = predictionRecords;
    else list = allRecords;

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (r) =>
        r.studentId.toLowerCase().includes(q) ||
        r.subjectId.toLowerCase().includes(q) ||
        r.examId.toLowerCase().includes(q)
    );
  }, [activeTab, historicalRecords, predictionRecords, allRecords, searchQuery]);

  return (
    <div className="dataset-preview-container animate-fade-in">
      {/* Header with Title and CSV Export */}
      <div className="dataset-preview-header">
        <div className="header-left">
          <div className="dataset-icon-badge">
            <Database size={20} />
          </div>
          <div>
            <h3 className="dataset-title">ML Dataset Pipeline Preview</h3>
            <span className="dataset-subtitle">
              Regression target: <code>finalExamScore</code> (Pre-exam features only · Zero data leakage)
            </span>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => exportTrainingDataset()}
            title="Download historical records as CSV for ML training"
          >
            <Download size={14} />
            Export Training CSV
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => exportDatasetToCSV(allRecords, "studysense_all_records.csv")}
            title="Download all records including prediction snapshots"
          >
            <FileSpreadsheet size={14} />
            Export Full Dataset
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="dataset-metrics-grid">
        <div className="card stat-mini-card">
          <div className="stat-label">Total Records</div>
          <div className="stat-val-row">
            <span className="stat-val">{allRecords.length}</span>
            <Layers size={16} className="text-muted" />
          </div>
          <span className="stat-note">Pipeline entries</span>
        </div>

        <div className="card stat-mini-card">
          <div className="stat-label">Subjects</div>
          <div className="stat-val-row">
            <span className="stat-val">{distinctSubjects}</span>
            <BookOpen size={16} className="text-muted" />
          </div>
          <span className="stat-note">Semester V curriculum</span>
        </div>

        <div className="card stat-mini-card">
          <div className="stat-label">Unique Students</div>
          <div className="stat-val-row">
            <span className="stat-val">{distinctStudents}</span>
            <Users size={16} className="text-muted" />
          </div>
          <span className="stat-note">Anonymized IDs</span>
        </div>

        <div className="card stat-mini-card">
          <div className="stat-label">Known Scores (Training)</div>
          <div className="stat-val-row">
            <span className="stat-val" style={{ color: "#10b981" }}>
              {historicalRecords.length}
            </span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <span className="stat-note">Historical training set</span>
        </div>

        <div className="card stat-mini-card">
          <div className="stat-label">Prediction Ready</div>
          <div className="stat-val-row">
            <span className="stat-val" style={{ color: "#6366f1" }}>
              {predictionRecords.length}
            </span>
            <Calendar size={16} color="#6366f1" />
          </div>
          <span className="stat-note">Target: null (Upcoming)</span>
        </div>
      </div>

      {/* Validation Status Banner */}
      <div className="card dataset-validation-banner">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {validationReport.allValid ? (
            <CheckCircle2 size={18} color="#10b981" />
          ) : (
            <AlertTriangle size={18} color="#f59e0b" />
          )}
          <div>
            <strong style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
              Data Pipeline Validation:{" "}
              {validationReport.allValid
                ? "100% Valid (Zero Data Leakage Detected)"
                : `${validationReport.invalidCount} Issues Detected`}
            </strong>
            <span
              style={{
                display: "block",
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                marginTop: "2px"
              }}
            >
              All {allRecords.length} records verified for identifier integrity, feature range bounds, and temporal pre-exam isolation.
            </span>
          </div>
        </div>
        <span className="badge badge-success">RFC 4180 Ready</span>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="dataset-controls-row">
        <div className="dataset-tabs">
          <button
            type="button"
            className={`dataset-tab-btn ${activeTab === "historical" ? "active" : ""}`}
            onClick={() => setActiveTab("historical")}
          >
            Historical Training Data ({historicalRecords.length})
          </button>
          <button
            type="button"
            className={`dataset-tab-btn ${activeTab === "prediction" ? "active" : ""}`}
            onClick={() => setActiveTab("prediction")}
          >
            Prediction Snapshots ({predictionRecords.length})
          </button>
          <button
            type="button"
            className={`dataset-tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Records ({allRecords.length})
          </button>
        </div>

        <input
          type="text"
          className="dataset-search-input"
          placeholder="Filter by student, subject, or exam..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Data Table */}
      <div className="card dataset-table-card">
        <div className="table-responsive-wrapper">
          <table className="dataset-data-table">
            <thead>
              <tr>
                <th>studentId</th>
                <th>subjectId</th>
                <th>examId</th>
                <th>studyDays</th>
                <th>totalMins</th>
                <th>learnMins</th>
                <th>aiTutorMins</th>
                <th>practiceMins</th>
                <th>focusMins</th>
                <th>avgQuiz</th>
                <th>quizzes</th>
                <th>topicsDone</th>
                <th>mastery</th>
                <th>revisions</th>
                <th>confidence</th>
                <th>daysLeft</th>
                <th>prevScore</th>
                <th>diff</th>
                <th style={{ backgroundColor: "rgba(99, 102, 241, 0.08)" }}>finalExamScore (Target)</th>
              </tr>
            </thead>
            <tbody>
              {displayedRecords.map((rec, idx) => {
                const isPrediction = rec.finalExamScore === null;
                return (
                  <tr key={`${rec.studentId}-${rec.examId}-${idx}`}>
                    <td>
                      <code>{rec.studentId}</code>
                    </td>
                    <td>
                      <span className="sub-badge">{rec.subjectId}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {rec.examId}
                      </span>
                    </td>
                    <td>{rec.studyDays}</td>
                    <td>
                      <strong>{rec.totalStudyMinutes}m</strong>
                    </td>
                    <td>{rec.learnMinutes}m</td>
                    <td>{rec.aiTutorMinutes}m</td>
                    <td>{rec.practiceMinutes}m</td>
                    <td>{rec.focusMinutes}m</td>
                    <td>
                      {rec.averageQuizScore !== null ? `${rec.averageQuizScore}%` : "—"}
                    </td>
                    <td>{rec.quizAttempts}</td>
                    <td>
                      {rec.topicsCompleted} / {rec.totalTopics}
                    </td>
                    <td>{rec.averageTopicMastery}%</td>
                    <td>{rec.revisionCount}</td>
                    <td>{rec.averageConfidence} / 5</td>
                    <td>{rec.examDaysRemaining}d</td>
                    <td>{rec.previousScore !== null ? rec.previousScore : "—"}</td>
                    <td>{rec.subjectDifficulty}</td>
                    <td style={{ backgroundColor: "rgba(99, 102, 241, 0.04)" }}>
                      {isPrediction ? (
                        <span className="badge badge-warning" style={{ fontSize: "0.74rem" }}>
                          null (Target to Predict)
                        </span>
                      ) : (
                        <span className="badge badge-success" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                          {rec.finalExamScore} / 100
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .dataset-preview-container {
          margin-top: 20px;
        }

        .dataset-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dataset-icon-badge {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background-color: #eef2ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dataset-title {
          font-size: 1.15rem;
          margin: 0;
          color: var(--text-main);
        }

        .dataset-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .dataset-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .stat-mini-card {
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        .stat-val-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-val {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1;
        }

        .stat-note {
          font-size: 0.72rem;
          color: var(--text-dim);
        }

        .dataset-validation-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          margin-bottom: 16px;
          background-color: var(--bg-subtle);
          border-left: 4px solid #10b981;
        }

        .dataset-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .dataset-tabs {
          display: flex;
          gap: 6px;
        }

        .dataset-tab-btn {
          background: none;
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: var(--radius-sm);
          padding: 6px 12px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .dataset-tab-btn:hover {
          background-color: var(--bg-subtle);
        }

        .dataset-tab-btn.active {
          background-color: var(--primary);
          color: #ffffff;
          border-color: var(--primary);
        }

        .dataset-search-input {
          padding: 6px 12px;
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          background-color: var(--bg-surface);
          color: var(--text-main);
          min-width: 240px;
        }

        .dataset-table-card {
          padding: 0;
          overflow: hidden;
        }

        .table-responsive-wrapper {
          overflow-x: auto;
          max-height: 400px;
        }

        .dataset-data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
          text-align: left;
          white-space: nowrap;
        }

        .dataset-data-table th {
          position: sticky;
          top: 0;
          background-color: var(--bg-subtle);
          padding: 10px 12px;
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-light);
          z-index: 1;
        }

        .dataset-data-table td {
          padding: 10px 12px;
          border-bottom: 1px solid var(--border-light);
          color: var(--text-secondary);
        }

        .dataset-data-table tr:hover td {
          background-color: var(--bg-subtle);
        }

        .sub-badge {
          display: inline-block;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          background-color: var(--bg-subtle);
          font-size: 0.75rem;
          color: var(--text-main);
        }
      `}</style>
    </div>
  );
}
