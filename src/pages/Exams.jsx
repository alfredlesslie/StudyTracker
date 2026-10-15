import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Sparkles,
  Edit2,
  Trash2,
  Plus,
  X,
  Filter,
  FileText,
  Check,
  TrendingUp,
  Brain,
  HelpCircle,
  RefreshCw,
  Layers,
  CheckSquare,
  Square,
  ListChecks,
  Info,
  AlertCircle,
  Target,
  Award,
  Zap,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { SUBJECTS, MODULES, TOPICS } from "../data/syllabus";
import { calculateExamCountdown } from "../services/storageService";
import {
  getAllSubjectPredictions,
  getSubjectPrediction,
  getPredictionTrend,
  getCachedPrediction,
  getExamScopePrediction
} from "../services/mlService";
import { getExamScopeAnalysisAsync, recordExamActualScoreAsync } from "../services/examService";

/**
 * Format a list of selected module IDs into a human-readable scope string
 * e.g., "2 modules: Modules 3 and 4" or "1 module: Module 3"
 */
export function formatExamScope(selectedModuleIds, subjectModules) {
  if (!selectedModuleIds || selectedModuleIds.length === 0) {
    return "0 modules selected";
  }
  const mods = (subjectModules || [])
    .filter((m) => selectedModuleIds.includes(m.id))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (mods.length === 0) {
    return `${selectedModuleIds.length} modules`;
  }

  const count = mods.length;
  const countStr = count === 1 ? "1 module" : `${count} modules`;
  const moduleNames = mods.map((m) => `Module ${m.order || m.moduleNumber || m.id.split("-m")[1]}`);

  let formattedList = "";
  if (moduleNames.length === 1) {
    formattedList = moduleNames[0];
  } else if (moduleNames.length === 2) {
    formattedList = `${moduleNames[0]} and ${moduleNames[1]}`;
  } else {
    formattedList = `${moduleNames.slice(0, -1).join(", ")}, and ${moduleNames[moduleNames.length - 1]}`;
  }

  return `${countStr}: ${formattedList}`;
}

export default function Exams() {
  const {
    exams,
    addExam,
    editExam,
    removeExam,
    refreshExams,
    toggleExamModuleCompletion,
    toggleExamTopicCompletion,
    topics,
    quizAttempts,
    navigateTo,
    selectTopic,
    startExamPractice,
    examScopePredictions
  } = useApp();

  // Filter & tab states
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" | "completed" | "all"
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  // Real ML Predictions & Scope Predictions
  const [predictions, setPredictions] = useState({});
  const [scopePredictions, setScopePredictions] = useState({});
  const [isPredictionsLoading, setIsPredictionsLoading] = useState(true);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [selectedExamForModal, setSelectedExamForModal] = useState(null);

  // Fetch whole-subject predictions and per-exam scope predictions
  useEffect(() => {
    let isMounted = true;
    setIsPredictionsLoading(true);

    // 1. Fetch general whole-subject predictions
    getAllSubjectPredictions()
      .then((res) => {
        if (isMounted) {
          const map = {};
          (res.predictions || []).forEach((p) => {
            map[p.subjectId] = p;
          });
          setPredictions(map);
        }
      })
      .catch(() => {});

    // 2. Fetch scope prediction analysis for each exam from backend
    if (exams && exams.length > 0) {
      Promise.all(
        exams.map((exam) =>
          getExamScopePrediction(exam.id)
            .then((data) => ({ examId: exam.id, data }))
            .catch(() => ({ examId: exam.id, data: null }))
        )
      ).then((results) => {
        if (isMounted) {
          const scopeMap = {};
          results.forEach(({ examId, data }) => {
            if (data) scopeMap[examId] = data;
          });
          setScopePredictions(scopeMap);
          setIsPredictionsLoading(false);
        }
      });
    } else {
      setIsPredictionsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [exams, topics, quizAttempts]);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [currentExamId, setCurrentExamId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    subjectId: SUBJECTS[0].id,
    name: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    notes: "",
    moduleIds: MODULES.filter((m) => m.subjectId === SUBJECTS[0].id).map((m) => m.id)
  });
  const [formError, setFormError] = useState("");

  // Delete confirmation
  const [examToDelete, setExamToDelete] = useState(null);

  // Actual Score Recording Modal State
  const [actualScoreModalExam, setActualScoreModalExam] = useState(null);
  const [actualScoreInput, setActualScoreInput] = useState("");
  const [isSavingActualScore, setIsSavingActualScore] = useState(false);
  const [actualScoreError, setActualScoreError] = useState("");

  const handleOpenRecordScore = (exam) => {
    setActualScoreModalExam(exam);
    const existing = exam.actual_score ?? exam.actualScore ?? "";
    setActualScoreInput(existing !== null && existing !== undefined ? String(existing) : "");
    setActualScoreError("");
  };

  const handleSaveActualScore = async (e) => {
    e.preventDefault();
    if (!actualScoreModalExam) return;
    const val = parseFloat(actualScoreInput);
    if (isNaN(val) || val < 0 || val > 100) {
      setActualScoreError("Please enter a valid exam mark between 0 and 100.");
      return;
    }
    try {
      setIsSavingActualScore(true);
      setActualScoreError("");
      await recordExamActualScoreAsync(actualScoreModalExam.id, val);
      // Immediately fetch updated scope prediction which now reflects the recorded score
      const updatedScope = await getExamScopePrediction(actualScoreModalExam.id);
      if (updatedScope) {
        setScopePredictions((prev) => ({
          ...prev,
          [actualScoreModalExam.id]: updatedScope
        }));
      }
      if (refreshExams) await refreshExams();
      setActualScoreModalExam(null);
    } catch (err) {
      setActualScoreError(err.message || "Failed to record actual score.");
    } finally {
      setIsSavingActualScore(false);
    }
  };

  // Open Add Exam Modal
  const handleOpenAdd = () => {
    setModalMode("add");
    setCurrentExamId(null);
    const initialSubId = SUBJECTS[0].id;
    const initialMods = MODULES.filter((m) => m.subjectId === initialSubId).map((m) => m.id);
    setFormData({
      subjectId: initialSubId,
      name: "",
      date: new Date().toISOString().split("T")[0],
      time: "10:00 AM",
      notes: "",
      moduleIds: initialMods
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // Open Edit Exam Modal
  const handleOpenEdit = (exam) => {
    setModalMode("edit");
    setCurrentExamId(exam.id);
    const examSubId = exam.subjectId || SUBJECTS[0].id;
    const validMods = MODULES.filter((m) => m.subjectId === examSubId).map((m) => m.id);
    const rawMods = exam.moduleIds || exam.module_ids || [];
    const assignedMods = rawMods.length > 0
      ? rawMods.filter((id) => validMods.includes(id))
      : validMods;

    setFormData({
      subjectId: examSubId,
      name: exam.name || "",
      date: exam.date || "",
      time: exam.time || "10:00 AM",
      notes: exam.notes || "",
      moduleIds: assignedMods.length > 0 ? assignedMods : validMods
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // Handle switching subject inside modal — updates available modules automatically
  const handleSubjectChange = (newSubjectId) => {
    const newSubjectModules = MODULES.filter((m) => m.subjectId === newSubjectId).map((m) => m.id);
    setFormData({
      ...formData,
      subjectId: newSubjectId,
      moduleIds: newSubjectModules // Default select all modules of new subject
    });
  };

  // Toggle module selection inside modal
  const handleToggleModule = (modId) => {
    const current = formData.moduleIds || [];
    let updated;
    if (current.includes(modId)) {
      updated = current.filter((id) => id !== modId);
    } else {
      updated = [...current, modId];
    }
    setFormData({ ...formData, moduleIds: updated });
  };

  // Quick module presets
  const handleSelectPreset = (preset) => {
    const subMods = MODULES.filter((m) => m.subjectId === formData.subjectId);
    if (preset === "all") {
      setFormData({ ...formData, moduleIds: subMods.map((m) => m.id) });
    } else if (preset === "series1") {
      const s1 = subMods.filter((m) => m.order === 1 || m.order === 2).map((m) => m.id);
      setFormData({ ...formData, moduleIds: s1 });
    } else if (preset === "series2") {
      const s2 = subMods.filter((m) => m.order === 3 || m.order === 4).map((m) => m.id);
      setFormData({ ...formData, moduleIds: s2 });
    } else if (preset === "clear") {
      setFormData({ ...formData, moduleIds: [] });
    }
  };

  // Handle Form Submission with backend integration and validation
  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Please enter an exam title.");
      return;
    }
    if (!formData.date) {
      setFormError("Please select an exam date.");
      return;
    }
    if (!formData.moduleIds || formData.moduleIds.length === 0) {
      setFormError("Please select at least one module for this exam.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");
      const payload = {
        subjectId: formData.subjectId,
        name: formData.name.trim(),
        date: formData.date,
        time: formData.time || "10:00 AM",
        notes: formData.notes.trim(),
        moduleIds: formData.moduleIds
      };

      if (modalMode === "add") {
        await addExam(payload);
      } else {
        await editExam(currentExamId, payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || "Failed to save exam. Backend rejected request.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    if (examToDelete) {
      try {
        setIsDeleting(true);
        await removeExam(examToDelete.id);
        setExamToDelete(null);
      } catch (err) {
        alert(err.message || "Failed to delete exam.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      if (refreshExams) await refreshExams();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper to calculate module-scope-aware preparation and authentic quiz performance
  const getExamScopePrep = (exam) => {
    const validSubjectModules = MODULES.filter((m) => m.subjectId === exam.subjectId);
    const rawModules = exam.moduleIds || exam.module_ids || [];
    const assignedModuleIds = rawModules.length > 0
      ? rawModules.filter((id) => validSubjectModules.some((m) => m.id === id))
      : validSubjectModules.map((m) => m.id);

    const selectedModules = validSubjectModules.filter((m) => assignedModuleIds.includes(m.id));

    // Topics strictly inside selected modules
    const scopeTopics = TOPICS.filter(
      (t) => t.subjectId === exam.subjectId && assignedModuleIds.includes(t.moduleId)
    );
    const totalTopics = scopeTopics.length;

    if (totalTopics === 0) {
      return {
        selectedModules,
        totalTopics: 0,
        completedTopics: 0,
        coveragePct: 0,
        quizAccuracy: null,
        quizAttemptsCount: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        status: "Needs attention",
        statusBadge: "badge-danger",
        recommended: []
      };
    }

    const completedTopicIds = exam.completedTopicIds || exam.completed_topic_ids || [];
    const completedModuleIds = exam.completedModuleIds || exam.completed_module_ids || [];
    const completed = scopeTopics.filter(
      (t) => completedTopicIds.includes(t.id) || completedModuleIds.includes(t.moduleId)
    );
    const coveragePct = Math.round((completed.length / totalTopics) * 100);

    // Authentic quiz performance strictly inside this exam's quizzes
    const relevantAttempts = (quizAttempts || []).filter(
      (q) => q.examId === exam.id || q.exam_id === exam.id
    );

    let quizAccuracy = null;
    let quizAttemptsCount = relevantAttempts.length;
    let questionsAnswered = 0;
    let correctAnswers = 0;

    if (relevantAttempts.length > 0) {
      correctAnswers = relevantAttempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
      questionsAnswered = relevantAttempts.reduce((sum, a) => sum + (Number(a.totalQuestions) || 5), 0);
      if (questionsAnswered > 0) {
        quizAccuracy = Math.round((correctAnswers / questionsAnswered) * 100);
      }
    }

    // Identify weak or incomplete topics strictly in scope
    let recommended = scopeTopics.filter(
      (t) =>
        t.status === "needs_practice" ||
        (t.averageQuizScore !== null && t.averageQuizScore !== undefined && t.averageQuizScore < 60) ||
        (t.completion || 0) < 50
    );

    if (recommended.length === 0) {
      recommended = scopeTopics.filter((t) => (t.completion || 0) < 100);
    }

    let status = "Getting ready";
    let statusBadge = "badge-warning";
    if (coveragePct >= 75) {
      status = "You're on track";
      statusBadge = "badge-success";
    } else if (coveragePct < 40) {
      status = "Needs attention";
      statusBadge = "badge-danger";
    }

    return {
      selectedModules,
      totalTopics,
      completedTopics: completed.length,
      coveragePct,
      quizAccuracy,
      quizAttemptsCount,
      questionsAnswered,
      correctAnswers,
      status,
      statusBadge,
      recommended: recommended.slice(0, 3)
    };
  };

  // Enriched exams with dynamic countdown and scope prep
  const enrichedExams = exams.map((exam) => {
    const countdown = calculateExamCountdown(exam.date);
    const prep = getExamScopePrep(exam);
    const sub = SUBJECTS.find((s) => s.id === exam.subjectId);
    return {
      ...exam,
      ...countdown,
      subjectName: sub?.name || exam.subjectName || "Subject",
      subjectCode: sub?.code || exam.subjectCode || "",
      prep
    };
  });

  // Filter by subject
  const subjectFiltered = enrichedExams.filter((exam) => {
    if (selectedSubjectFilter === "all") return true;
    return exam.subjectId === selectedSubjectFilter;
  });

  // Filter by tab (upcoming vs completed vs all)
  const displayedExams = subjectFiltered.filter((exam) => {
    if (activeTab === "upcoming") return !exam.isPast;
    if (activeTab === "completed") return exam.isPast;
    return true;
  });

  const upcomingCount = enrichedExams.filter((e) => !e.isPast).length;
  const completedCount = enrichedExams.filter((e) => e.isPast).length;

  // Active modules for currently selected subject in the modal
  const modalAvailableModules = MODULES.filter((m) => m.subjectId === formData.subjectId);

  return (
    <div className="page-container animate-fade-in exams-page-container">
      {/* Page Header */}
      <div className="page-header exams-header-flex">
        <div>
          <h1>Semester V Examinations</h1>
          <p>
            Track module-scoped exam schedules, real topic completions, quiz accuracy, and AI revision priorities.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            className="btn btn-outline btn-md"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Refresh exams from backend database"
          >
            <RefreshCw size={16} className={isRefreshing ? "spin-animate" : ""} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          <button className="btn btn-primary btn-md add-exam-cta" onClick={handleOpenAdd}>
            <Plus size={18} />
            <span>Add Exam</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Subject Filter & Status Tabs */}
      <div className="card exams-filter-bar">
        <div className="filter-group">
          <span className="filter-label">
            <Filter size={15} />
            <span>Filter Subject:</span>
          </span>
          <select
            className="subject-filter-select"
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
          >
            <option value="all">All Subjects ({enrichedExams.length})</option>
            {SUBJECTS.map((sub) => {
              const count = enrichedExams.filter((e) => e.subjectId === sub.id).length;
              return (
                <option key={sub.id} value={sub.id}>
                  {sub.code} — {sub.name} ({count})
                </option>
              );
            })}
          </select>
        </div>

        <div className="status-tabs-group">
          <button
            className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            Past / Completed ({completedCount})
          </button>
          <button
            className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All ({enrichedExams.length})
          </button>
        </div>
      </div>

      {/* Main Exams Stack */}
      <div className="exams-stack">
        {displayedExams.length === 0 ? (
          <div className="card empty-exams-card animate-fade-in">
            <Calendar size={48} className="empty-icon text-muted" />
            <h3>No exams found</h3>
            <p>
              {activeTab === "completed"
                ? "You have no past/completed exams recorded yet."
                : "No upcoming exams match your current filter. Add one above to start tracking."}
            </p>
            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={16} />
              <span>Add an Exam</span>
            </button>
          </div>
        ) : (
          displayedExams.map((exam) => {
            const { prep } = exam;
            const scopeData = (examScopePredictions && examScopePredictions[exam.id]) || scopePredictions[exam.id];
            const examSubId = exam.subjectId || exam.subject_id;
            const validSubjectModules = MODULES.filter((m) => m.subjectId === examSubId);
            const rawModules = exam.moduleIds || exam.module_ids || [];
            const assignedModuleIds = rawModules.length > 0
              ? rawModules.filter((id) => validSubjectModules.some((m) => m.id === id))
              : validSubjectModules.map((m) => m.id);
            const selectedModules = validSubjectModules.filter((m) => assignedModuleIds.includes(m.id));
            const completedModuleIds = exam.completedModuleIds || exam.completed_module_ids || [];
            const completedTopicIds = exam.completedTopicIds || exam.completed_topic_ids || [];

            // All topics strictly inside selected modules for this exam
            const examScopeTopics = TOPICS.filter(
              (t) => t.subjectId === examSubId && assignedModuleIds.includes(t.moduleId)
            );
            const totalPrepTopics = examScopeTopics.length;
            const completedPrepTopics = examScopeTopics.filter(
              (t) => completedTopicIds.includes(t.id) || completedModuleIds.includes(t.moduleId)
            ).length;

            // Module completion progress
            const completedModulesCount = selectedModules.filter((m) => completedModuleIds.includes(m.id)).length;
            const totalModulesCount = selectedModules.length;
            const moduleProgressPct = totalModulesCount > 0
              ? Math.round((completedModulesCount / totalModulesCount) * 100)
              : 0;
            const prepProgressPct = totalPrepTopics > 0
              ? Math.round((completedPrepTopics / totalPrepTopics) * 100)
              : moduleProgressPct;

            // Formatted scope string: e.g. "2 modules: Modules 3 and 4"
            const scopeText = formatExamScope(assignedModuleIds, validSubjectModules);

            // Filter specific exam practice quiz attempts
            const examQuizAttempts = (quizAttempts || [])
              .filter((q) => q && (q.examId === exam.id || q.exam_id === exam.id))
              .sort((a, b) => {
                const timeB = new Date(b.attemptedAt || b.attempted_at || b.date || 0).getTime();
                const timeA = new Date(a.attemptedAt || a.attempted_at || a.date || 0).getTime();
                return timeB - timeA;
              });
            const latestExamAttempt = examQuizAttempts[0] || null;
            const attemptCount = examQuizAttempts.length;

            // Target module for Study button (first pending module in scope, or first module)
            const firstPendingModule = selectedModules.find((m) => !completedModuleIds.includes(m.id)) || selectedModules[0];
            const targetTopic = topics.find((t) => t.moduleId === firstPendingModule?.id) ||
              TOPICS.find((t) => t.moduleId === firstPendingModule?.id);

            const studyBtnText = completedModulesCount === totalModulesCount && totalModulesCount > 0
              ? "Review Modules in Learn"
              : completedModulesCount > 0
              ? `Continue Studying: Module ${firstPendingModule?.order || ""}`
              : `Study Module ${firstPendingModule?.order || ""}`;

            // Predicted score logic (preparation-based estimate available even without quiz attempts)
            const prepPct = prepProgressPct !== undefined ? prepProgressPct : (prep.coveragePct || 0);
            const fallbackEstimate = Math.round(
              (prepPct * 0.40) +
              ((prep.quizAccuracy || 50) * 0.35) +
              (50 * 0.15) +
              (65 * 0.10)
            );
            const predictedScore = (scopeData?.estimated_score !== undefined && scopeData?.estimated_score !== null)
              ? scopeData.estimated_score
              : (scopeData?.predicted_score !== undefined && scopeData?.predicted_score !== null)
              ? scopeData.predicted_score
              : fallbackEstimate;

            // Dynamic explanation according to actual information used
            const hasStudyData = (scopeData?.active_study_minutes || 0) > 0;
            const hasQuizData = attemptCount > 0 || !!scopeData?.has_quiz_data || (scopeData?.total_quiz_attempts || 0) > 0;
            const hasPrepData = prepProgressPct > 0 || completedPrepTopics > 0 || completedModulesCount > 0;

            let scoreExplanation = scopeData?.basis_explanation;
            if (!scoreExplanation) {
              if (hasStudyData && (hasQuizData || hasPrepData)) {
                scoreExplanation = "Based on available study and performance data.";
              } else if (hasPrepData && hasQuizData) {
                scoreExplanation = "Based on preparation progress and previous quiz results.";
              } else if (hasQuizData) {
                scoreExplanation = "Based on previous quiz results.";
              } else if (hasPrepData) {
                scoreExplanation = "Based on preparation progress.";
              } else {
                scoreExplanation = "Based on available study and performance data.";
              }
            }

            return (
              <div
                key={exam.id}
                className={`card exam-row-card ${exam.isPast ? "exam-card-past" : ""} ${
                  exam.isToday ? "exam-card-today" : ""
                }`}
              >
                {/* 1. Header: Subject, Exam Name, Date, Countdown, Edit/Delete/Mark */}
                <div className="exam-main-header">
                  <div className="exam-subject-meta">
                    <div
                      className={`exam-calendar-box ${
                        exam.isPast ? "box-past" : exam.isToday ? "box-today" : ""
                      }`}
                    >
                      <Calendar size={22} />
                    </div>
                    <div>
                      <div className="exam-subject-tag-row">
                        <span className="badge-code">{exam.subjectCode}</span>
                        <span className="exam-subject-title">{exam.subjectName}</span>
                      </div>
                      <h2 className="exam-title">{exam.name}</h2>
                      <div className="exam-date-row">
                        <span className="exam-date-text">
                          <Calendar size={14} /> <strong>{exam.date}</strong>
                        </span>
                        {exam.time && (
                          <span className="exam-time-text">
                            <Clock size={14} /> {exam.time}
                          </span>
                        )}
                      </div>
                      <div className="exam-scope-tag">
                        <Layers size={13} />
                        <span>{scopeText}</span>
                      </div>
                    </div>
                  </div>

                  <div className="exam-countdown-box">
                    {exam.isPast ? (
                      <span className="countdown-pill pill-past">Exam Completed</span>
                    ) : exam.isToday ? (
                      <span className="countdown-pill pill-today animate-pulse">
                        🔥 Exam Today
                      </span>
                    ) : (
                      <div className="countdown-active-cluster">
                        <span className="days-number">{exam.daysRemaining}</span>
                        <span className="days-label">
                          {exam.daysRemaining === 1 ? "day remaining" : "days remaining"}
                        </span>
                      </div>
                    )}

                    <div className="card-top-actions">
                      <button
                        className="btn-icon-subtle"
                        onClick={() => handleOpenRecordScore(exam)}
                        title={exam.actualScore !== null || exam.actual_score !== null ? "Edit Verified Actual Mark" : "Record Actual Mark"}
                      >
                        <Award size={15} className={exam.actualScore !== null || exam.actual_score !== null ? "text-success" : ""} />
                      </button>
                      <button
                        className="btn-icon-subtle"
                        onClick={() => handleOpenEdit(exam)}
                        title="Edit Exam"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn-icon-subtle danger-hover"
                        onClick={() => setExamToDelete(exam)}
                        title="Delete Exam"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Optional Notes */}
                {exam.notes && (
                  <div className="exam-notes-callout">
                    <FileText size={15} className="notes-icon" />
                    <span>{exam.notes}</span>
                  </div>
                )}

                {/* 2. Key Metrics Row: Predicted Score & Exam Preparation Progress */}
                <div className="exam-simplified-metrics-grid">
                  {/* Predicted Score Panel */}
                  <div className="metric-card-panel">
                    <div className="metric-card-header">
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="metric-title">Predicted Exam Score</span>
                        <span style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: "rgba(99, 102, 241, 0.12)",
                          color: "var(--primary)"
                        }}>
                          Preparation-Based
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-audit-inline"
                        onClick={() => {
                          setSelectedExamForModal(exam);
                          setShowExplanationModal(true);
                        }}
                        title="Open detailed calculation audit, ML breakdown & formula"
                      >
                        <HelpCircle size={13} />
                        <span>Audit & Details</span>
                      </button>
                    </div>
                    <div className="score-value-row">
                      <span className="score-number-big">{predictedScore}</span>
                      <span className="score-denom-text">/ 100</span>
                      {(exam.actualScore !== null && exam.actualScore !== undefined) || (exam.actual_score !== null && exam.actual_score !== undefined) ? (
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "var(--success, #059669)",
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            border: "1px solid rgba(16, 185, 129, 0.25)"
                          }}
                          title="Verified actual university mark entered by student"
                        >
                          Actual: {exam.actualScore ?? exam.actual_score}/100
                        </span>
                      ) : null}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginTop: "6px" }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                        {scoreExplanation}
                      </span>
                      <span style={{ fontSize: "0.70rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                        Data used: {attemptCount} completed exam-specific attempt{attemptCount === 1 ? "" : "s"} · {prepProgressPct}% scope coverage
                      </span>
                    </div>
                  </div>

                  {/* Exam Preparation Progress Panel */}
                  <div className="metric-card-panel">
                    <div className="metric-card-header">
                      <span className="metric-title">Exam Preparation Progress</span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {totalPrepTopics > 0
                          ? `${completedPrepTopics} / ${totalPrepTopics} topics prepared (${prepProgressPct}%)`
                          : `${completedModulesCount} / ${totalModulesCount} modules completed (${moduleProgressPct}%)`}
                      </span>
                    </div>
                    <div className="progress-bar-track" style={{ height: "8px", marginTop: "6px" }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${prepProgressPct}%`,
                          backgroundColor: prepProgressPct === 100 ? "var(--success, #10b981)" : "var(--primary)"
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "6px", fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "6px" }}>
                      <span>
                        <strong>Latest Practice Quiz:</strong>{" "}
                        <span style={{ color: latestExamAttempt ? "var(--primary)" : "inherit", fontWeight: latestExamAttempt ? 600 : 400 }}>
                          {latestExamAttempt
                            ? `${latestExamAttempt.score}/${latestExamAttempt.totalQuestions || latestExamAttempt.total_questions || 10} (${latestExamAttempt.percentage}%)`
                            : "No attempts yet"}
                        </span>
                      </span>
                      <span>
                        <strong>Attempts:</strong> {attemptCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Compact List of Selected Modules with Checkbox / Mark Complete */}
                <div className="compact-modules-container">
                  <div className="compact-modules-header">
                    <span>Selected Modules ({totalModulesCount}) & Topics</span>
                    <span>Preparation Status</span>
                  </div>
                  <div className="compact-modules-list">
                    {selectedModules.map((mod) => {
                      const isComplete = completedModuleIds.includes(mod.id);
                      const modTopics = examScopeTopics.filter((t) => t.moduleId === mod.id);
                      const modCompletedCount = modTopics.filter(
                        (t) => completedTopicIds.includes(t.id) || isComplete
                      ).length;
                      const modPrepPct = modTopics.length > 0 ? Math.round((modCompletedCount / modTopics.length) * 100) : 0;
                      const expandKey = `${exam.id}_${mod.id}`;
                      const isExpanded = expandedModules[expandKey] !== false; // expanded by default

                      return (
                        <div key={mod.id} className="module-group-container">
                          <div className="compact-module-row">
                            <div className="compact-module-left">
                              <button
                                type="button"
                                className={`btn-module-checkbox ${isComplete ? "is-complete" : ""}`}
                                onClick={() => toggleExamModuleCompletion(exam.id, mod.id, !isComplete)}
                                title={isComplete ? "Mark module pending for this exam" : "Mark module completed for this exam"}
                              >
                                {isComplete ? (
                                  <CheckSquare size={18} className="text-success" />
                                ) : (
                                  <Square size={18} />
                                )}
                              </button>
                              <span className="badge-mod-num">Module {mod.order}</span>
                              <span className={`module-name-text ${isComplete ? "is-complete" : ""}`}>
                                {mod.title.includes(":") ? mod.title.split(":")[1].trim() : mod.title}
                              </span>
                              <span className="module-topic-count-tag">
                                {modCompletedCount}/{modTopics.length} prepared ({modPrepPct}%)
                              </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span
                                className={`badge-completion-status ${
                                  isComplete || (modTopics.length > 0 && modCompletedCount === modTopics.length)
                                    ? "status-completed"
                                    : "status-pending"
                                }`}
                              >
                                {isComplete || (modTopics.length > 0 && modCompletedCount === modTopics.length)
                                  ? "Completed"
                                  : "Pending"}
                              </span>
                              <button
                                type="button"
                                className="btn-expand-module"
                                onClick={() =>
                                  setExpandedModules((prev) => ({
                                    ...prev,
                                    [expandKey]: !isExpanded
                                  }))
                                }
                                title={isExpanded ? "Collapse topics" : "Expand topics"}
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </div>
                          </div>

                          {/* Topics List for this Module */}
                          {isExpanded && modTopics.length > 0 && (
                            <div className="module-topics-list">
                              {modTopics.map((topic) => {
                                const isTopicDone = completedTopicIds.includes(topic.id) || isComplete;
                                return (
                                  <div key={topic.id} className="module-topic-row">
                                    <div className="module-topic-left">
                                      <button
                                        type="button"
                                        className={`btn-topic-checkbox ${isTopicDone ? "is-complete" : ""}`}
                                        onClick={() =>
                                          toggleExamTopicCompletion(exam.id, topic.id, !isTopicDone)
                                        }
                                        title={
                                          isTopicDone
                                            ? "Mark topic pending for this exam"
                                            : "Mark topic prepared for this exam"
                                        }
                                      >
                                        {isTopicDone ? (
                                          <CheckSquare size={16} className="text-success" />
                                        ) : (
                                          <Square size={16} />
                                        )}
                                      </button>
                                      <span
                                        className={`topic-name-text ${
                                          isTopicDone ? "is-complete" : ""
                                        }`}
                                      >
                                        {topic.title}
                                      </span>
                                    </div>
                                    <span
                                      className={`badge-completion-status badge-sm ${
                                        isTopicDone ? "status-completed" : "status-pending"
                                      }`}
                                    >
                                      {isTopicDone ? "Prepared" : "Pending"}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Action Row: Take Practice Quiz, Study/Continue Studying, Audit */}
                <div className="exam-simplified-actions" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                    onClick={() => startExamPractice(exam.id)}
                    title="Launch mixed-module practice quiz strictly drawn from selected modules"
                  >
                    <Zap size={16} />
                    <span>Take Practice Quiz</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline study-main-cta"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                    onClick={() => {
                      if (targetTopic) {
                        selectTopic(targetTopic.id);
                        navigateTo("learn", targetTopic.id);
                      }
                    }}
                    title={`Open ${firstPendingModule?.title || "selected module"} directly in Learn mode`}
                  >
                    <BookOpen size={16} />
                    <span>{studyBtnText}</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-subtle"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginLeft: "auto", fontSize: "0.82rem" }}
                    onClick={() => {
                      setSelectedExamForModal(exam);
                      setShowExplanationModal(true);
                    }}
                  >
                    <HelpCircle size={14} />
                    <span>Audit / Details</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =========================================================================
          ADD / EDIT EXAM MODAL WITH MODULE SELECTION
          ========================================================================= */}
      {isModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-content exam-modal-card animate-scale-up"
            style={{ maxWidth: "620px", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <Calendar size={22} className="text-primary" />
                <h3>{modalMode === "add" ? "Add Examination" : "Edit Examination"}</h3>
              </div>
              <button
                className="btn-icon-subtle"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="exam-form">
              {formError && (
                <div className="form-error-banner animate-fade-in">
                  <AlertTriangle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Subject Selector (Dropdown from official syllabus) */}
              <div className="form-group">
                <label className="form-label">
                  Linked Subject <span className="req">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.subjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                >
                  {SUBJECTS.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} — {sub.name}
                    </option>
                  ))}
                </select>
                <span className="form-hint">
                  Linked to your official Semester V KTU syllabus. Changing subject updates available modules.
                </span>
              </div>

              {/* Exam Scope / Module Selection Section (Agenda 1.A) */}
              <div className="form-group" style={{ backgroundColor: "var(--bg-subtle)", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                    <Layers size={16} className="text-primary" />
                    <span>Included Modules in Exam Scope <span className="req">*</span></span>
                  </label>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Select 1 to 4 modules
                  </span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0 0 10px 0" }}>
                  Choose which modules are covered by this specific exam. Scope-aware topic completion, quiz accuracy, and predictions are strictly calculated for your chosen modules.
                </p>

                {/* Module Quick Select Buttons */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={() => handleSelectPreset("all")}
                  >
                    All 4 Modules
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={() => handleSelectPreset("series1")}
                  >
                    Module 1 & 2 (Series 1)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={() => handleSelectPreset("series2")}
                  >
                    Module 3 & 4 (Series 2)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={() => handleSelectPreset("clear")}
                  >
                    Clear All
                  </button>
                </div>

                {/* Module Checkbox Options */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {modalAvailableModules.map((mod) => {
                    const isChecked = (formData.moduleIds || []).includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => handleToggleModule(mod.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          backgroundColor: isChecked ? "rgba(99, 102, 241, 0.08)" : "var(--bg-surface)",
                          border: isChecked ? "1px solid var(--primary)" : "1px solid var(--border)",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {isChecked ? (
                            <CheckSquare size={18} className="text-primary" />
                          ) : (
                            <Square size={18} className="text-muted" />
                          )}
                          <div>
                            <span style={{ fontSize: "0.84rem", fontWeight: 600, color: isChecked ? "var(--primary)" : "var(--text-main)", display: "block" }}>
                              {mod.title}
                            </span>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
                              {mod.description?.slice(0, 80)}...
                            </span>
                          </div>
                        </div>
                        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)" }}>
                          4 Topics
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Review Scope Summary Banner */}
                <div style={{ marginTop: "10px", padding: "8px 10px", borderRadius: "6px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", fontSize: "0.76rem" }}>
                  <strong>Selected Scope Summary: </strong>
                  {(formData.moduleIds || []).length > 0 ? (
                    <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                      {(formData.moduleIds || []).length} of {modalAvailableModules.length} Modules selected (
                      {(formData.moduleIds || []).length * 4} topics total)
                    </span>
                  ) : (
                    <span style={{ color: "var(--danger)", fontWeight: 600 }}>
                      No modules selected! Please select at least 1 module.
                    </span>
                  )}
                </div>
              </div>

              {/* Exam Title */}
              <div className="form-group">
                <label className="form-label">
                  Exam Name / Title <span className="req">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Series Test 1, End Semester Exam (ESE), Lab Viva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Date & Time Row */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">
                    Exam Date <span className="req">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 10:00 AM, 01:30 PM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              {/* Notes / Syllabus Focus */}
              <div className="form-group">
                <label className="form-label">Preparation Notes</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Focus on numerical problems in Module 2 and protocol diagrams."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Modal Actions */}
              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving || (formData.moduleIds || []).length === 0}>
                  {isSaving ? <RefreshCw size={16} className="spin-animate" /> : <Check size={16} />}
                  <span>{isSaving ? "Saving..." : modalMode === "add" ? "Save Exam" : "Update Exam"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION DIALOG
          ========================================================================= */}
      {examToDelete && (
        <div className="modal-backdrop animate-fade-in" onClick={() => !isDeleting && setExamToDelete(null)}>
          <div
            className="modal-content delete-modal-card animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-modal-body">
              <div className="delete-icon-box">
                <Trash2 size={24} />
              </div>
              <h3>Delete Examination?</h3>
              <p>
                Are you sure you want to remove <strong>{examToDelete.name}</strong> (
                {examToDelete.date})? This action cannot be undone.
              </p>
              <div className="modal-actions-row">
                <button className="btn btn-secondary" onClick={() => setExamToDelete(null)} disabled={isDeleting}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={confirmDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Yes, Delete Exam"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          RECORD ACTUAL EXAM SCORE MODAL (Ground Truth Collection)
          ========================================================================= */}
      {actualScoreModalExam && (
        <div className="modal-backdrop animate-fade-in" onClick={() => !isSavingActualScore && setActualScoreModalExam(null)}>
          <div
            className="modal-content animate-scale-up"
            style={{ maxWidth: "440px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <Target size={22} className="text-primary" />
                <h3>Record Actual Exam Mark</h3>
              </div>
              <button
                className="btn-icon-subtle"
                onClick={() => setActualScoreModalExam(null)}
                aria-label="Close modal"
                disabled={isSavingActualScore}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveActualScore} className="exam-form">
              {actualScoreError && (
                <div className="form-error-banner animate-fade-in">
                  <AlertTriangle size={15} />
                  <span>{actualScoreError}</span>
                </div>
              )}

              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
                Enter the verified mark you received for <strong>{actualScoreModalExam.name}</strong>.
              </p>

              <div className="form-group">
                <label className="form-label">
                  Mark Achieved (0 to 100 scale) <span className="req">*</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    className="form-input"
                    placeholder="e.g. 78.5"
                    value={actualScoreInput}
                    onChange={(e) => setActualScoreInput(e.target.value)}
                    required
                    style={{ fontSize: "1.1rem", fontWeight: 700 }}
                  />
                  <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-muted)" }}>/ 100</span>
                </div>
                <span className="form-hint">
                  Your genuine exam score feeds the authentic StudySense ML data pipeline and will improve future exam predictions for this subject.
                </span>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActualScoreModalExam(null)}
                  disabled={isSavingActualScore}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSavingActualScore || !actualScoreInput}>
                  {isSavingActualScore ? <RefreshCw size={16} className="spin-animate" /> : <Check size={16} />}
                  <span>{isSavingActualScore ? "Saving Mark..." : "Save Verified Mark"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page Styles */}
      <style>{`
        .exams-page-container {
          padding-bottom: 3rem;
        }

        .exams-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .add-exam-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .exams-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .subject-filter-select {
          padding: 0.45rem 0.85rem;
          font-size: 0.875rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background-color: var(--bg-surface);
          color: var(--text-primary);
        }

        .status-tabs-group {
          display: flex;
          background-color: var(--bg-subtle);
          padding: 4px;
          border-radius: var(--radius-md);
          gap: 4px;
        }

        .tab-btn {
          padding: 0.4rem 0.9rem;
          font-size: 0.8125rem;
          font-weight: 600;
          border: none;
          background: transparent;
          color: var(--text-muted);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .tab-btn.active {
          background-color: var(--bg-surface);
          color: var(--primary);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .exams-stack {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .exam-row-card {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .exam-row-card:hover {
          border-color: var(--primary-light, #c7d2fe);
        }

        .exam-card-past {
          opacity: 0.85;
          background-color: var(--bg-subtle);
        }

        .exam-card-today {
          border: 2px solid var(--danger);
        }

        .exam-main-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .exam-subject-meta {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
        }

        .exam-calendar-box {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-lg);
          background-color: var(--primary-subtle);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .box-past {
          background-color: var(--bg-subtle);
          color: var(--text-muted);
        }

        .box-today {
          background-color: #fee2e2;
          color: #dc2626;
        }

        .exam-subject-tag-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .badge-code {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary);
          background-color: var(--primary-subtle);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .exam-subject-title {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .exam-title {
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 0.35rem;
          color: var(--text-primary);
        }

        .exam-date-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .exam-date-text, .exam-time-text {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .exam-countdown-box {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .countdown-active-cluster {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          background-color: var(--bg-subtle);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
        }

        .days-number {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--warning-text, #d97706);
          line-height: 1;
        }

        .days-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .countdown-pill {
          padding: 0.4rem 0.9rem;
          border-radius: var(--radius-full);
          font-size: 0.8125rem;
          font-weight: 700;
        }

        .pill-past {
          background-color: var(--bg-subtle);
          color: var(--text-muted);
        }

        .pill-today {
          background-color: #fee2e2;
          color: #dc2626;
        }

        .card-top-actions {
          display: flex;
          gap: 0.35rem;
        }

        .btn-icon-subtle {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 6px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }

        .btn-icon-subtle:hover {
          background-color: var(--bg-surface-hover);
          color: var(--text-primary);
        }

        .btn-icon-subtle.danger-hover:hover {
          color: var(--danger);
          background-color: #fee2e2;
        }

        .exam-notes-callout {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          background-color: var(--bg-subtle);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          color: var(--text-secondary);
          border-left: 3px solid var(--primary);
        }

        .notes-icon {
          color: var(--primary);
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* Simplified & Redesigned Compact Exam Card */
        .exam-scope-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--primary);
          background-color: var(--primary-subtle, rgba(99, 102, 241, 0.1));
          padding: 3px 10px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(99, 102, 241, 0.2);
          margin-top: 6px;
        }

        .exam-simplified-metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 1rem;
          background-color: var(--bg-subtle);
          padding: 1rem 1.25rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-light);
        }

        @media (max-width: 768px) {
          .exam-simplified-metrics-grid {
            grid-template-columns: 1fr;
          }
        }

        .metric-card-panel {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .metric-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .metric-title {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--text-muted);
        }

        .score-value-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
          flex-wrap: wrap;
        }

        .score-number-big {
          font-family: var(--font-display);
          font-size: 1.85rem;
          font-weight: 900;
          color: var(--primary);
          line-height: 1;
        }

        .score-denom-text {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .btn-audit-inline {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          transition: all 0.15s;
        }

        .btn-audit-inline:hover {
          color: var(--primary);
          background-color: var(--bg-surface);
        }

        /* Compact Module Completion Checklist */
        .compact-modules-container {
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .compact-modules-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 1rem;
          background-color: var(--bg-subtle);
          border-bottom: 1px solid var(--border-light);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .compact-modules-list {
          display: flex;
          flex-direction: column;
        }

        .compact-module-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 1rem;
          border-bottom: 1px solid var(--border-light);
          transition: background-color 0.15s;
          gap: 0.75rem;
        }

        .compact-module-row:last-child {
          border-bottom: none;
        }

        .compact-module-row:hover {
          background-color: var(--bg-surface-hover, rgba(0, 0, 0, 0.02));
        }

        .compact-module-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          min-width: 0;
        }

        .btn-module-checkbox {
          background: transparent;
          border: none;
          padding: 2px;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          transition: transform 0.1s, color 0.15s;
        }

        .btn-module-checkbox:hover {
          transform: scale(1.1);
        }

        .btn-module-checkbox.is-complete {
          color: var(--success, #10b981);
        }

        .badge-mod-num {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: var(--radius-sm);
          background-color: var(--bg-subtle);
          color: var(--text-secondary);
          white-space: nowrap;
          border: 1px solid var(--border-light);
        }

        .module-name-text {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .module-name-text.is-complete {
          color: var(--text-secondary);
        }

        .badge-completion-status {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .status-completed {
          background-color: rgba(16, 185, 129, 0.12);
          color: var(--success, #059669);
          border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .status-pending {
          background-color: var(--bg-subtle);
          color: var(--text-muted);
          border: 1px solid var(--border-light);
        }

        .badge-completion-status.badge-sm {
          font-size: 0.68rem;
          padding: 1px 6px;
        }

        .module-group-container {
          border-bottom: 1px solid var(--border-light);
        }

        .module-group-container:last-child {
          border-bottom: none;
        }

        .module-topic-count-tag {
          font-size: 0.72rem;
          color: var(--text-muted);
          background-color: var(--bg-subtle);
          padding: 1px 6px;
          border-radius: var(--radius-sm);
          white-space: nowrap;
        }

        .btn-expand-module {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          transition: all 0.15s;
        }

        .btn-expand-module:hover {
          color: var(--text-primary);
          background-color: var(--bg-subtle);
        }

        .module-topics-list {
          background-color: var(--bg-surface-hover, rgba(0, 0, 0, 0.02));
          border-top: 1px dashed var(--border-light);
          padding: 4px 1rem 6px 2.8rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .module-topic-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.3rem 0;
          gap: 0.75rem;
        }

        .module-topic-left {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex: 1;
          min-width: 0;
        }

        .btn-topic-checkbox {
          background: transparent;
          border: none;
          padding: 2px;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          transition: transform 0.1s, color 0.15s;
        }

        .btn-topic-checkbox:hover {
          transform: scale(1.1);
        }

        .btn-topic-checkbox.is-complete {
          color: var(--success, #10b981);
        }

        .topic-name-text {
          font-size: 0.81rem;
          color: var(--text-secondary);
        }

        .topic-name-text.is-complete {
          color: var(--text-primary);
          font-weight: 500;
        }
          color: var(--text-muted);
          border: 1px solid var(--border-light);
        }

        .exam-simplified-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 0.25rem;
        }

        .study-main-cta {
          flex: 1;
          min-width: 200px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.65rem 1.25rem;
          font-weight: 700;
          border-radius: var(--radius-md);
        }

        .exam-readiness-row {
          background-color: var(--bg-subtle);
          padding: 1rem 1.25rem;
          border-radius: var(--radius-md);
        }

        @media (max-width: 840px) {
          .exam-readiness-row {
            grid-template-columns: 1fr !important;
          }
        }

        .progress-section {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .pct-bold {
          font-weight: 700;
          color: var(--text-primary);
        }

        .progress-bar-track {
          height: 8px;
          background-color: var(--border-light, #e2e8f0);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #3b82f6);
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
        }

        .prep-status-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        .status-title-label {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .urgent-topics-section {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .urgent-heading {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .urgent-pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
        }

        .urgent-topic-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          padding: 0.45rem 0.95rem;
          border-radius: var(--radius-full);
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .urgent-topic-pill:hover {
          background-color: var(--bg-surface-hover);
          border-color: var(--primary);
          color: var(--primary);
        }

        .pill-book-icon {
          color: var(--primary);
        }

        .pill-arrow {
          color: var(--text-muted);
        }

        .all-clear-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #059669;
        }

        .exam-card-actions {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-light);
          flex-wrap: wrap;
        }

        .empty-exams-card {
          padding: 3rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .exam-modal-card {
          width: 100%;
          background-color: var(--bg-surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          padding: 1.75rem;
        }

        .delete-modal-card {
          width: 100%;
          max-width: 420px;
          background-color: var(--bg-surface);
          border-radius: var(--radius-lg);
          padding: 1.75rem;
          text-align: center;
        }

        .delete-modal-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.85rem;
        }

        .delete-icon-box {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-full);
          background-color: #fee2e2;
          color: #dc2626;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-light);
        }

        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .exam-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-error-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: #fee2e2;
          color: #dc2626;
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.8125rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .req {
          color: #dc2626;
        }

        .btn-xs {
          padding: 3px 8px;
          font-size: 0.74rem;
          border-radius: 4px;
        }

        .form-input, .form-select, .form-textarea {
          padding: 0.55rem 0.85rem;
          font-size: 0.875rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background-color: var(--bg-surface);
          color: var(--text-primary);
          outline: none;
          font-family: inherit;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px var(--primary-subtle);
        }

        .form-hint {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .modal-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
        }

        .spin-animate {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Prediction Explanation & ML Audit Modal */}
      {showExplanationModal && selectedExamForModal && (() => {
        const auditExam = selectedExamForModal;
        const auditScopeData = (examScopePredictions && examScopePredictions[auditExam.id]) || scopePredictions[auditExam.id];
        const auditSub = SUBJECTS.find((s) => s.id === (auditExam.subjectId || auditExam.subject_id)) || SUBJECTS[0];
        const auditSubMods = MODULES.filter((m) => m.subjectId === auditSub.id);
        const rawModIds = auditExam.moduleIds || auditExam.module_ids || [];
        const auditSelectedModIds = rawModIds.length > 0
          ? rawModIds.filter((id) => auditSubMods.some((m) => m.id === id))
          : auditSubMods.map((m) => m.id);
        const auditSelectedMods = auditSubMods.filter((m) => auditSelectedModIds.includes(m.id));
        const auditCompletedModIds = auditExam.completedModuleIds || auditExam.completed_module_ids || [];
        const auditScopeText = formatExamScope(auditSelectedModIds, auditSubMods);

        const auditAttempts = (quizAttempts || [])
          .filter((q) => q.examId === auditExam.id || q.exam_id === auditExam.id)
          .sort((a, b) => new Date(b.date || b.attemptedAt || 0) - new Date(a.date || a.attemptedAt || 0));
        const latestAuditAtt = auditAttempts[0] || null;
        const prevAuditAtt = auditAttempts[1] || null;
        const attemptDiff = prevAuditAtt && latestAuditAtt ? latestAuditAtt.percentage - prevAuditAtt.percentage : null;

        const prepPct = auditScopeData?.coverage_percentage !== undefined
          ? auditScopeData.coverage_percentage
          : Math.round((auditCompletedModIds.length / (auditSelectedMods.length || 1)) * 100);

        const quizPct = auditScopeData?.quiz_accuracy !== undefined
          ? auditScopeData.quiz_accuracy
          : latestAuditAtt ? latestAuditAtt.percentage : 50.0;

        const consistencyPct = auditScopeData?.consistency_score !== undefined
          ? auditScopeData.consistency_score
          : 50.0;

        const priorScore = auditScopeData?.prior_exam_score !== undefined
          ? auditScopeData.prior_exam_score
          : (auditExam.actual_score ?? auditExam.actualScore ?? 65.0);

        const calculatedScore = auditScopeData?.estimated_score !== undefined
          ? auditScopeData.estimated_score
          : Math.round(prepPct * 0.4 + quizPct * 0.35 + consistencyPct * 0.15 + priorScore * 0.1);

        const calculatedTime = auditScopeData?.calculated_at
          ? new Date(auditScopeData.calculated_at).toLocaleString()
          : "Recently calculated";

        const reliability = auditScopeData?.reliability_level || (auditAttempts.length > 0 ? "Moderate" : "Limited");

        return (
          <div className="modal-backdrop animate-fade-in" onClick={() => setShowExplanationModal(false)}>
            <div
              className="modal-content animate-scale-up"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "680px", maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="modal-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Brain size={22} className="text-primary" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.15rem" }}>
                      Readiness Audit: {auditExam.name}
                    </h3>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {auditSub.code} · {auditSub.name} · Exam Date: {auditExam.date}
                    </span>
                  </div>
                </div>
                <button className="btn-icon-subtle" onClick={() => setShowExplanationModal(false)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: "0.75rem 0", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* 1. Score Summary Banner with Authentic Status */}
                <div style={{
                  padding: "1rem 1.25rem",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(14, 165, 233, 0.06) 100%)",
                  border: "1px solid rgba(79, 70, 229, 0.2)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem"
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                        Current Saved Prediction
                      </span>
                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: "rgba(14, 165, 233, 0.15)",
                        color: "var(--info)"
                      }}>
                        Experimental Readiness Heuristic
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)" }}>
                        {calculatedScore}
                      </span>
                      <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-muted)" }}>
                        / 100
                      </span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      Last calculated: <strong>{calculatedTime}</strong>
                    </div>
                  </div>

                  <div style={{ maxWidth: "260px", fontSize: "0.775rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    <strong>Why this estimate:</strong> {auditScopeData?.why_prediction_changed || "Estimate dynamically integrates your module completion and authentic practice quiz scores."}
                  </div>
                </div>

                {/* 2. Selected Exam Scope */}
                <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", padding: "1rem", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <strong style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                      Selected Exam Scope ({auditSelectedMods.length} of {auditSubMods.length} Modules)
                    </strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600 }}>
                      {auditScopeText}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {auditSelectedMods.map((mod) => {
                      const isComplete = auditCompletedModIds.includes(mod.id);
                      return (
                        <span
                          key={mod.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "0.75rem",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor: isComplete ? "var(--success-bg)" : "var(--bg-subtle)",
                            color: isComplete ? "var(--success-text)" : "var(--text-secondary)",
                            border: `1px solid ${isComplete ? "rgba(16, 185, 129, 0.3)" : "var(--border-light)"}`
                          }}
                        >
                          <CheckCircle2 size={13} style={{ color: isComplete ? "var(--success)" : "var(--text-muted)" }} />
                          <span>Module {mod.order}: {mod.title.split(":")[1]?.trim() || mod.title} ({isComplete ? "Prepared" : "Pending"})</span>
                        </span>
                      );
                    })}
                  </div>
                  <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "6px" }}>
                    * Strict scope isolation: Topics outside these selected modules are completely excluded from this exam's readiness calculation and practice quizzes.
                  </span>
                </div>

                {/* 3. Actual Formula Component Breakdown */}
                <div style={{ backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border-light)", padding: "1rem", borderRadius: "8px" }}>
                  <strong style={{ fontSize: "0.85rem", color: "var(--text-main)", display: "block", marginBottom: "8px" }}>
                    Actual Input Values Used in Calculation
                  </strong>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div style={{ padding: "8px", background: "var(--bg-surface)", borderRadius: "6px", border: "1px solid var(--border-light)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>40% Module Preparation</span>
                      <strong style={{ fontSize: "1rem", color: "var(--text-main)" }}>{prepPct}%</strong>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", display: "block" }}>
                        {auditCompletedModIds.length} of {auditSelectedMods.length} modules completed
                      </span>
                    </div>

                    <div style={{ padding: "8px", background: "var(--bg-surface)", borderRadius: "6px", border: "1px solid var(--border-light)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>35% Quiz Accuracy</span>
                      <strong style={{ fontSize: "1rem", color: "var(--text-main)" }}>{quizPct}%</strong>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", display: "block" }}>
                        {auditScopeData?.is_quiz_assumed ? "Neutral 50% baseline (no quizzes)" : "65/35 damping across attempts"}
                      </span>
                    </div>

                    <div style={{ padding: "8px", background: "var(--bg-surface)", borderRadius: "6px", border: "1px solid var(--border-light)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>15% Study Consistency</span>
                      <strong style={{ fontSize: "1rem", color: "var(--text-main)" }}>{consistencyPct}%</strong>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", display: "block" }}>
                        {auditScopeData?.is_consistency_assumed ? "Neutral benchmark" : "Logged study sessions"}
                      </span>
                    </div>

                    <div style={{ padding: "8px", background: "var(--bg-surface)", borderRadius: "6px", border: "1px solid var(--border-light)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>10% Prior Exam Performance</span>
                      <strong style={{ fontSize: "1rem", color: "var(--text-main)" }}>{priorScore}%</strong>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", display: "block" }}>
                        {auditScopeData?.is_prior_exam_assumed ? "Neutral 65% baseline" : `Verified score: ${auditExam.actualScore ?? auditExam.actual_score}/100`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Practice Quiz Attempts & Trend */}
                <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", padding: "1rem", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <strong style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                      Comparable Practice Quiz History ({auditAttempts.length} attempt{auditAttempts.length === 1 ? "" : "s"})
                    </strong>
                    {attemptDiff !== null && (
                      <span style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: attemptDiff > 0 ? "var(--success)" : attemptDiff < 0 ? "var(--danger)" : "var(--warning)"
                      }}>
                        Trend: {attemptDiff > 0 ? `Improving (+${attemptDiff}%)` : attemptDiff < 0 ? `Declining (${attemptDiff}%)` : "Stable"}
                      </span>
                    )}
                  </div>
                  {auditAttempts.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {auditAttempts.slice(0, 3).map((att, idx) => {
                        const attNum = auditAttempts.length - idx;
                        const prev = idx < auditAttempts.length - 1 ? auditAttempts[idx + 1] : null;
                        const chg = prev ? att.percentage - prev.percentage : null;
                        return (
                          <div
                            key={att.id || idx}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "6px 10px",
                              backgroundColor: "var(--bg-subtle)",
                              borderRadius: "4px",
                              fontSize: "0.78rem"
                            }}
                          >
                            <span>
                              <strong>Attempt #{attNum}</strong> {idx === 0 && <span style={{ color: "var(--primary)", fontWeight: 700 }}>(Latest)</span>} · {att.date || "Recent"}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <strong style={{ color: att.percentage >= 80 ? "var(--success)" : att.percentage >= 60 ? "var(--warning)" : "var(--danger)" }}>
                                {att.score}/{att.totalQuestions} ({att.percentage}%)
                              </strong>
                              {chg !== null && (
                                <span style={{ color: chg >= 0 ? "var(--success)" : "var(--danger)", fontSize: "0.72rem" }}>
                                  ({chg > 0 ? `+${chg}%` : `${chg}%`})
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      No practice quiz attempts recorded yet for this exam. Take a practice quiz to replace assumed baseline accuracy with authentic score data.
                    </p>
                  )}
                </div>

                {/* 5. ML Integrity Disclosure */}
                <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fef3c7", padding: "0.85rem 1rem", borderRadius: "8px", fontSize: "0.78rem", color: "#92400e" }}>
                  <strong>ML Integrity & Methodology Notice:</strong>
                  <p style={{ margin: "4px 0 0 0", lineHeight: 1.45 }}>
                    StudySense AI does NOT pretend this module-scoped readiness estimate is an authentic neural network or deep learning model. The global ML model in <code>ml/models/best_model.joblib</code> is evaluated on UCI school datasets (RMSE: 3.82, R²: 0.28) and cannot scientifically generalize to KTU engineering module subsets. We calculate this readiness estimate transparently while collecting genuine student exam records for future validated training.
                  </p>
                </div>
              </div>

              <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", paddingTop: "0.75rem", borderTop: "1px solid var(--border-light)" }}>
                <button className="btn btn-primary btn-sm" onClick={() => setShowExplanationModal(false)}>
                  Close Audit
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

