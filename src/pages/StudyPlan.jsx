import React, { useState, useEffect, useMemo } from "react";
import {
  Target,
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Sparkles,
  Play,
  ArrowRight,
  X,
  AlertCircle,
  BookOpen,
  CalendarDays,
  Coffee,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SkipForward,
  Edit2,
  Search,
  Filter,
  CheckSquare,
  HelpCircle,
  Clock3,
  CalendarCheck
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { SUBJECTS, MODULES, TOPICS } from "../data/syllabus";
import {
  getStudyTasks,
  saveStudyTask,
  updateStudyTask,
  deleteStudyTask,
  getTasksForDate,
  getUpcomingTasks,
  getOverdueTasks,
  getCompletedTasks
} from "../services/storageService";

export default function StudyPlan() {
  const {
    studyPlan,
    setStudyPlan,
    addStudyTask,
    editStudyTask,
    removeStudyTask,
    toggleStudyTaskComplete,
    rescheduleStudyTask,
    generatePlan,
    topics,
    exams,
    navigateTo,
    selectTopic,
    startFocusForTopic,
    getDailyStudyTime,
    sessions,
    getStudySessionsByDate,
    getTotalStudyTime
  } = useApp();

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Primary navigation views: "day" | "upcoming" | "overdue" | "completed"
  const [activeView, setActiveView] = useState("day");
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "pending" | "completed" | "overdue"
  const [subjectFilter, setSubjectFilter] = useState("all");

  // Modals state
  const [taskModal, setTaskModal] = useState(null); // { mode: "add"|"edit", data: {...} }
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null); // task object
  const [showCreateAIPlanModal, setShowCreateAIPlanModal] = useState(false);
  const [missedItemModal, setMissedItemModal] = useState(null);

  // AI Plan Generation Form Options
  const [availableHours, setAvailableHours] = useState(2);
  const [preferredLength, setPreferredLength] = useState(25);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");

  // Ensure tasks are initialized if storage is completely empty
  useEffect(() => {
    if (!studyPlan || studyPlan.length === 0) {
      const generated = generatePlan({
        availableMinutes: 120,
        preferredLength: 25,
        targetDate: todayStr
      });
      setStudyPlan(generated);
    }
  }, []);

  // Compute Week Days for the mini calendar strip
  const weekDays = useMemo(() => {
    const base = new Date(selectedDate);
    const day = base.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(base.getTime() + diffToMon * 86400000);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getTime() + i * 86400000);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  }, [selectedDate]);

  // All tasks from context/storage
  const allTasks = studyPlan || [];

  // Overdue count badge
  const overdueTasksCount = useMemo(() => {
    return allTasks.filter((t) => t.date < todayStr && t.status === "pending" && !t.isBreak).length;
  }, [allTasks, todayStr]);

  // Completed count badge
  const completedTasksCount = useMemo(() => {
    return allTasks.filter((t) => t.status === "completed" && !t.isBreak).length;
  }, [allTasks]);

  // Filter tasks according to active view, date, search, and filters
  const displayedTasks = useMemo(() => {
    let list = [];

    if (activeView === "day") {
      list = allTasks.filter((t) => t.date === selectedDate);
    } else if (activeView === "upcoming") {
      list = allTasks.filter((t) => t.date > todayStr && t.status !== "completed" && t.status !== "skipped");
      list.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
    } else if (activeView === "overdue") {
      list = allTasks.filter((t) => t.date < todayStr && t.status === "pending" && !t.isBreak);
      list.sort((a, b) => b.date.localeCompare(a.date) || a.startTime.localeCompare(b.startTime));
    } else if (activeView === "completed") {
      list = allTasks.filter((t) => t.status === "completed" && !t.isBreak);
      list.sort((a, b) => (b.completedAt || b.date).localeCompare(a.completedAt || a.date));
    }

    // Apply Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => {
        const titleMatch = (t.title || "").toLowerCase().includes(q);
        const subMatch = (t.subjectName || "").toLowerCase().includes(q);
        const topicMatch = (t.topicTitle || "").toLowerCase().includes(q);
        const notesMatch = (t.notes || "").toLowerCase().includes(q);
        return titleMatch || subMatch || topicMatch || notesMatch;
      });
    }

    // Apply Status Filter (only within day view)
    if (activeView === "day" && statusFilter !== "all") {
      if (statusFilter === "overdue") {
        list = list.filter((t) => t.date < todayStr && t.status === "pending");
      } else {
        list = list.filter((t) => t.status === statusFilter);
      }
    }

    // Apply Subject Filter
    if (subjectFilter !== "all") {
      list = list.filter((t) => t.subjectId === subjectFilter);
    }

    return list;
  }, [allTasks, activeView, selectedDate, todayStr, searchQuery, statusFilter, subjectFilter]);

  // Day View Progress & Summary Metrics
  const daySummary = useMemo(() => {
    const dayTasks = allTasks.filter((t) => t.date === selectedDate && !t.isBreak);
    const completed = dayTasks.filter((t) => t.status === "completed").length;
    const remaining = dayTasks.length - completed;
    const plannedMinutes = dayTasks.reduce((acc, t) => acc + (Number(t.durationMinutes) || 0), 0);

    // Actual active study time recorded on selected date from authoritative study sessions
    const dateSessions = typeof getStudySessionsByDate === "function" 
      ? getStudySessionsByDate(selectedDate) 
      : [];
    const actualMinutes = typeof getTotalStudyTime === "function"
      ? getTotalStudyTime(dateSessions)
      : (typeof getDailyStudyTime === "function" ? getDailyStudyTime(selectedDate) || 0 : 0);

    return {
      total: dayTasks.length,
      completed,
      remaining,
      plannedMinutes,
      actualMinutes,
      pct: dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0
    };
  }, [allTasks, selectedDate, sessions, getStudySessionsByDate, getTotalStudyTime, getDailyStudyTime]);

  // Date Navigation Handlers
  const handlePrevDay = () => {
    const prev = new Date(new Date(selectedDate).getTime() - 86400000).toISOString().split("T")[0];
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(new Date(selectedDate).getTime() + 86400000).toISOString().split("T")[0];
    setSelectedDate(next);
  };

  const handleToday = () => {
    setSelectedDate(todayStr);
  };

  // Open Add Task Modal
  const handleOpenAddTask = () => {
    setTaskModal({
      mode: "add",
      data: {
        title: "",
        subjectId: "cs-cn",
        moduleId: "",
        topicId: "",
        date: selectedDate || todayStr,
        startTime: "19:00",
        durationMinutes: 45,
        type: "study",
        source: "manual",
        status: "pending",
        notes: ""
      }
    });
  };

  // Open Edit Task Modal
  const handleOpenEditTask = (task) => {
    setTaskModal({
      mode: "edit",
      data: {
        id: task.id,
        title: task.title,
        subjectId: task.subjectId || "cs-cn",
        moduleId: task.moduleId || "",
        topicId: task.topicId || "",
        date: task.date || todayStr,
        startTime: task.startTime || "19:00",
        durationMinutes: task.durationMinutes || 45,
        type: task.type || "study",
        source: task.source || "manual",
        status: task.status || "pending",
        notes: task.notes || ""
      }
    });
  };

  // Save Add/Edit Task Form
  const handleSaveTaskForm = (e) => {
    e.preventDefault();
    if (!taskModal || !taskModal.data) return;

    const data = taskModal.data;
    if (!data.title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    if (taskModal.mode === "add") {
      addStudyTask(data);
    } else {
      editStudyTask(data.id, data);
    }

    setTaskModal(null);
  };

  // Confirm Delete Task
  const handleConfirmDelete = () => {
    if (!deleteConfirmModal) return;
    removeStudyTask(deleteConfirmModal.id);
    setDeleteConfirmModal(null);
  };

  // Handle AI Plan Generation
  const handleExecuteCreatePlan = () => {
    const subjectIds = selectedSubjectFilter === "all" ? null : [selectedSubjectFilter];
    generatePlan({
      availableMinutes: availableHours * 60,
      preferredLength: preferredLength,
      selectedSubjectIds: subjectIds,
      targetDate: selectedDate
    });
    setShowCreateAIPlanModal(false);
  };

  // Handle Missed Session Dialog Actions
  const handleMissedAction = (action) => {
    if (!missedItemModal) return;

    if (action === "study_now") {
      if (missedItemModal.topicId) {
        startFocusForTopic(missedItemModal.topicId, missedItemModal.durationMinutes || 25, missedItemModal.id);
      }
      editStudyTask(missedItemModal.id, { status: "in_progress" });
    } else if (action === "move_tomorrow") {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      rescheduleStudyTask(missedItemModal.id, tomorrow, missedItemModal.startTime || "19:00");
    } else if (action === "skip") {
      editStudyTask(missedItemModal.id, { status: "skipped" });
    }

    setMissedItemModal(null);
  };

  // Helper date formatter
  const formatDateDisplay = (dateString) => {
    try {
      const [y, m, d] = dateString.split("-");
      const dt = new Date(Number(y), Number(m) - 1, Number(d));
      return dt.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric"
      });
    } catch {
      return dateString;
    }
  };

  // Nearest exam approaching calculation
  const nearestExam = [...exams].sort((a, b) => (a.daysRemaining || 99) - (b.daysRemaining || 99))[0];

  return (
    <div className="page-container study-plan-page animate-fade-in">
      {/* ================= HEADER & TOP ACTIONS ================= */}
      <div className="plan-page-header">
        <div>
          <h1 className="plan-main-title">Study Plan</h1>
          <p className="plan-subtitle">
            Plan, organize, and manage your personal study schedule with AI recommendations.
          </p>
        </div>

        <div className="plan-top-actions">
          <button
            className="btn btn-outline"
            onClick={() => setShowCreateAIPlanModal(true)}
            title="Generate AI-recommended study sessions"
          >
            <Sparkles size={16} className="text-primary" />
            <span>Suggest Plan</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={handleOpenAddTask}
            title="Add a custom manual study task"
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* ================= UPCOMING EXAM ALERT BANNER ================= */}
      {nearestExam && (
        <div className="card exam-approaching-banner animate-fade-in">
          <div className="exam-banner-icon">
            <AlertCircle size={20} />
          </div>
          <div className="exam-banner-text">
            <h4 className="exam-banner-title">
              {nearestExam.name} exam is approaching ({nearestExam.daysRemaining} days left).
            </h4>
            <p className="exam-banner-sub">
              Your study plan prioritizes high-yield topics and weak areas for this subject.
            </p>
          </div>
          <button
            className="btn btn-outline btn-sm exam-view-btn"
            onClick={() => navigateTo("exams")}
          >
            <span>View Exam Details</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ================= VIEW NAVIGATION TABS ================= */}
      <div className="plan-views-nav">
        <button
          className={`view-nav-tab ${activeView === "day" ? "active" : ""}`}
          onClick={() => setActiveView("day")}
        >
          <CalendarDays size={16} />
          <span>Day Planner</span>
        </button>

        <button
          className={`view-nav-tab ${activeView === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveView("upcoming")}
        >
          <Clock3 size={16} />
          <span>Upcoming</span>
        </button>

        <button
          className={`view-nav-tab ${activeView === "overdue" ? "active" : ""}`}
          onClick={() => setActiveView("overdue")}
        >
          <AlertCircle size={16} />
          <span>Overdue</span>
          {overdueTasksCount > 0 && (
            <span className="badge badge-danger badge-sm" style={{ marginLeft: "4px" }}>
              {overdueTasksCount}
            </span>
          )}
        </button>

        <button
          className={`view-nav-tab ${activeView === "completed" ? "active" : ""}`}
          onClick={() => setActiveView("completed")}
        >
          <CheckSquare size={16} />
          <span>Completed History</span>
          {completedTasksCount > 0 && (
            <span className="badge badge-success badge-sm" style={{ marginLeft: "4px" }}>
              {completedTasksCount}
            </span>
          )}
        </button>
      </div>

      {/* ================= DAY VIEW CONTROLS & MINI WEEK STRIP ================= */}
      {activeView === "day" && (
        <div className="card day-controls-card">
          {/* Date Navigator Row */}
          <div className="date-nav-row">
            <div className="date-nav-controls">
              <button
                className="btn btn-outline btn-sm nav-arrow-btn"
                onClick={handlePrevDay}
                title="Previous Day"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className={`btn btn-sm ${selectedDate === todayStr ? "btn-primary" : "btn-outline"}`}
                onClick={handleToday}
              >
                Today
              </button>
              <button
                className="btn btn-outline btn-sm nav-arrow-btn"
                onClick={handleNextDay}
                title="Next Day"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="current-date-heading">
              <h2 className="selected-date-text">
                {formatDateDisplay(selectedDate)}
              </h2>
              {selectedDate === todayStr && (
                <span className="badge badge-primary badge-sm">Today</span>
              )}
            </div>

            <div className="date-picker-wrapper">
              <input
                type="date"
                className="date-input-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-label="Select Date"
              />
            </div>
          </div>

          {/* Mini Calendar Week Strip */}
          <div className="week-strip-row">
            {weekDays.map((dStr) => {
              const [y, m, d] = dStr.split("-");
              const dt = new Date(Number(y), Number(m) - 1, Number(d));
              const dayName = dt.toLocaleDateString(undefined, { weekday: "short" });
              const dayNum = dt.getDate();
              const isSelected = dStr === selectedDate;
              const isToday = dStr === todayStr;
              const count = allTasks.filter((t) => t.date === dStr && !t.isBreak).length;

              return (
                <button
                  key={dStr}
                  type="button"
                  className={`week-day-pill ${isSelected ? "selected" : ""} ${isToday ? "is-today" : ""}`}
                  onClick={() => setSelectedDate(dStr)}
                >
                  <span className="week-day-name">{dayName}</span>
                  <span className="week-day-num">{dayNum}</span>
                  {count > 0 ? (
                    <span className="week-day-badge">{count}</span>
                  ) : (
                    <span className="week-day-empty">·</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Daily Progress & Time Summary Bar */}
          <div className="plan-summary-bar">
            <div className="summary-metric-item">
              <span className="metric-num-val">
                {daySummary.completed} of {daySummary.total}
              </span>
              <span className="metric-sub-label">
                {daySummary.remaining === 0 && daySummary.total > 0
                  ? "All completed 🎉"
                  : `${daySummary.remaining} task${daySummary.remaining === 1 ? "" : "s"} remaining`}
              </span>
            </div>
            <div className="summary-metric-divider" />
            <div className="summary-metric-item">
              <span className="metric-num-val">
                {Math.floor(daySummary.plannedMinutes / 60)}h {daySummary.plannedMinutes % 60}m
              </span>
              <span className="metric-sub-label">Planned Study Time</span>
            </div>
            <div className="summary-metric-divider" />
            <div className="summary-metric-item">
              <span className="metric-num-val" style={{ color: "var(--success)" }}>
                {Math.floor(daySummary.actualMinutes / 60)}h {daySummary.actualMinutes % 60}m
              </span>
              <span className="metric-sub-label">Actual Active Study</span>
            </div>
            <div className="summary-metric-divider" />
            <div className="summary-metric-item">
              <span className="metric-num-val">{daySummary.pct}%</span>
              <span className="metric-sub-label">Day Progress</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= SEARCH & FILTER CONTROLS ================= */}
      <div className="card search-filter-card">
        <div className="search-box-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-text-input"
            placeholder="Search tasks by title, subject, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="btn-icon-subtle"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-dropdowns-row">
          {activeView === "day" && (
            <div className="filter-select-group">
              <span className="filter-label">Status:</span>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          )}

          <div className="filter-select-group">
            <span className="filter-label">Subject:</span>
            <select
              className="filter-select"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              <option value="all">All Subjects</option>
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ================= TASK CARDS STREAM ================= */}
      <div className="card plan-schedule-card">
        <div className="schedule-card-header">
          <div className="schedule-header-left">
            {activeView === "day" && <CalendarDays size={18} className="text-primary" />}
            {activeView === "upcoming" && <Clock3 size={18} className="text-primary" />}
            {activeView === "overdue" && <AlertCircle size={18} className="text-danger" />}
            {activeView === "completed" && <CheckSquare size={18} className="text-success" />}
            <h2 className="schedule-date-title">
              {activeView === "day"
                ? selectedDate === todayStr
                  ? "Today's Plan"
                  : `Plan for ${formatDateDisplay(selectedDate)}`
                : activeView === "upcoming"
                ? "Upcoming Scheduled Tasks"
                : activeView === "overdue"
                ? "Overdue Study Tasks"
                : "Completed Study Tasks History"}
            </h2>
          </div>
          <span className="schedule-count-pill">
            {displayedTasks.length} task{displayedTasks.length === 1 ? "" : "s"}
          </span>
        </div>

        {displayedTasks.length === 0 ? (
          <div className="plan-empty-state">
            <Target size={36} className="text-secondary" />
            <h3>
              {activeView === "day"
                ? "Nothing planned yet for this day."
                : activeView === "upcoming"
                ? "No upcoming tasks."
                : activeView === "overdue"
                ? "No overdue tasks. You're all caught up!"
                : "No completed tasks recorded yet."}
            </h3>
            <p>
              {activeView === "day"
                ? "Add a task or let StudySense suggest one calibrated to your upcoming exams and weak areas."
                : activeView === "upcoming"
                ? "Create manual study blocks or let AI populate upcoming dates."
                : activeView === "overdue"
                ? "Great discipline! All your scheduled tasks are on track."
                : "Complete tasks in your daily plan to record historical progress."}
            </p>

            {activeView === "day" && (
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                <button className="btn btn-primary" onClick={handleOpenAddTask}>
                  <Plus size={16} />
                  <span>Add Task</span>
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setShowCreateAIPlanModal(true)}
                >
                  <Sparkles size={16} className="text-primary" />
                  <span>Suggest Plan</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="plan-items-stream">
            {displayedTasks.map((item, idx) => {
              if (item.isBreak) {
                return (
                  <div key={item.id || idx} className="plan-break-row">
                    <div className="break-icon-box">
                      <Coffee size={16} />
                    </div>
                    <div className="break-info">
                      <span className="break-title">{item.title || "Rest Break"}</span>
                      <span className="break-duration">{item.durationMinutes || item.duration || 5} min</span>
                    </div>
                    <span className="break-time">{item.startTime || item.time}</span>
                  </div>
                );
              }

              const isCompleted = item.status === "completed";
              const isOverdue = item.date < todayStr && item.status === "pending";
              const isPracticeType = item.type === "practice" || item.type === "quiz";
              const subObj = SUBJECTS.find((s) => s.id === item.subjectId);

              return (
                <div
                  key={item.id || idx}
                  className={`plan-task-card card ${isCompleted ? "task-completed" : ""} ${isOverdue ? "task-overdue" : ""}`}
                >
                  <div className="task-card-inner">
                    {/* Completion Checkbox Button */}
                    <button
                      type="button"
                      className={`task-check-circle ${isCompleted ? "checked" : ""}`}
                      onClick={() => toggleStudyTaskComplete(item.id)}
                      title={isCompleted ? "Mark incomplete" : "Mark completed"}
                      aria-label="Toggle task status"
                    >
                      {isCompleted ? <Check size={14} /> : null}
                    </button>

                    {/* Task Content Block */}
                    <div className="task-content-block">
                      <div className="task-top-badges-line">
                        <span
                          className="task-subject-tag"
                          style={{
                            backgroundColor: subObj?.color ? `${subObj.color}15` : "rgba(99, 102, 241, 0.1)",
                            color: subObj?.color || "var(--primary)"
                          }}
                        >
                          {item.subjectName || subObj?.name || "Subject"}
                        </span>

                        <span className="task-type-badge">
                          {item.type || "study"}
                        </span>

                        {item.source === "recommended" || item.source === "ai" ? (
                          <span className="task-source-badge ai-badge" title="Suggested by StudySense AI">
                            <Sparkles size={11} />
                            Recommended
                          </span>
                        ) : (
                          <span className="task-source-badge manual-badge">
                            Your task
                          </span>
                        )}

                        {isOverdue && (
                          <span className="badge badge-danger badge-sm">
                            Overdue ({item.date})
                          </span>
                        )}

                        {isCompleted && (
                          <span className="badge badge-success badge-sm">
                            Completed
                          </span>
                        )}
                      </div>

                      <h3 className={`task-headline-title ${isCompleted ? "strikethrough" : ""}`}>
                        {item.title}
                      </h3>

                      <div className="task-time-meta-line">
                        <span className="task-time-chip">
                          <Clock size={12} />
                          {item.startTime} · {item.durationMinutes || item.duration || 25} min planned
                        </span>

                        {activeView !== "day" && (
                          <span className="task-date-chip">
                            <Calendar size={12} />
                            {formatDateDisplay(item.date)}
                          </span>
                        )}

                        {item.topicTitle && item.topicTitle !== item.title && (
                          <span className="task-topic-chip">
                            <BookOpen size={12} />
                            {item.topicTitle}
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="task-notes-text">
                          {item.source === "recommended" ? "💡 " : "📝 "}
                          {item.notes}
                        </p>
                      )}

                      {/* Completed Task History Note */}
                      {isCompleted && (
                        <div className="task-completed-history-note">
                          <CheckCircle2 size={13} className="text-success" />
                          <span>
                            {item.durationMinutes || 25} min planned
                            {item.date ? ` · Completed for ${item.date}` : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Task Actions Menu Cluster */}
                    <div className="task-card-actions-cluster">
                      {/* Open Topic in Learn */}
                      {item.topicId && !isCompleted && (
                        <button
                          className="btn btn-outline btn-sm action-btn"
                          onClick={() => {
                            selectTopic(item.topicId);
                            navigateTo("learn", item.topicId);
                          }}
                          title="Open lesson for this topic"
                        >
                          <BookOpen size={13} />
                          <span>Open Topic</span>
                        </button>
                      )}

                      {/* Practice Action */}
                      {isPracticeType && !isCompleted && item.topicId && (
                        <button
                          className="btn btn-primary btn-sm action-btn"
                          onClick={() => {
                            selectTopic(item.topicId);
                            navigateTo("practice", item.topicId);
                          }}
                          title="Practice interactive quizzes"
                        >
                          <HelpCircle size={13} />
                          <span>Practice</span>
                        </button>
                      )}

                      {/* Start Focus Timer */}
                      {item.topicId && !isCompleted && (
                        <button
                          className="btn btn-subtle btn-sm action-btn"
                          onClick={() => startFocusForTopic(item.topicId, item.durationMinutes || 25, item.id)}
                          title="Start dedicated Pomodoro focus session"
                        >
                          <Play size={13} />
                          <span>Focus</span>
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        className="btn btn-subtle btn-sm action-btn"
                        onClick={() => handleOpenEditTask(item)}
                        title="Edit task details"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        className="btn btn-subtle btn-sm action-btn text-danger"
                        onClick={() => setDeleteConfirmModal(item)}
                        title="Delete task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= ADD / EDIT TASK MODAL ================= */}
      {taskModal && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setTaskModal(null)}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Edit2 size={20} className="text-primary" />
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                  {taskModal.mode === "add" ? "Add Study Task" : "Edit Study Task"}
                </h3>
              </div>
              <button
                className="btn-icon-subtle"
                onClick={() => setTaskModal(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTaskForm} style={{ padding: "1rem 0", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Task Title */}
              <div className="form-group-block">
                <label className="form-label">
                  Task Title <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  type="text"
                  className="modal-text-input"
                  placeholder="e.g. Revise Logistic Regression"
                  value={taskModal.data.title}
                  onChange={(e) =>
                    setTaskModal({
                      ...taskModal,
                      data: { ...taskModal.data, title: e.target.value }
                    })
                  }
                  required
                />
              </div>

              {/* Subject Cascade */}
              <div className="grid-2" style={{ gap: "0.75rem" }}>
                <div className="form-group-block">
                  <label className="form-label">Subject:</label>
                  <select
                    className="modal-select-input"
                    value={taskModal.data.subjectId}
                    onChange={(e) => {
                      const newSub = e.target.value;
                      setTaskModal({
                        ...taskModal,
                        data: {
                          ...taskModal.data,
                          subjectId: newSub,
                          moduleId: "",
                          topicId: ""
                        }
                      });
                    }}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-block">
                  <label className="form-label">Module (optional):</label>
                  <select
                    className="modal-select-input"
                    value={taskModal.data.moduleId}
                    onChange={(e) => {
                      const newMod = e.target.value;
                      setTaskModal({
                        ...taskModal,
                        data: {
                          ...taskModal.data,
                          moduleId: newMod,
                          topicId: ""
                        }
                      });
                    }}
                  >
                    <option value="">All Modules / General</option>
                    {MODULES.filter((m) => m.subjectId === taskModal.data.subjectId).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic Cascade */}
              <div className="form-group-block">
                <label className="form-label">Topic (optional):</label>
                <select
                  className="modal-select-input"
                  value={taskModal.data.topicId}
                  onChange={(e) => {
                    const chosenTopicId = e.target.value;
                    const chosenTopic = TOPICS.find((t) => t.id === chosenTopicId);
                    setTaskModal({
                      ...taskModal,
                      data: {
                        ...taskModal.data,
                        topicId: chosenTopicId,
                        title: taskModal.data.title.trim() === "" && chosenTopic ? chosenTopic.title : taskModal.data.title
                      }
                    });
                  }}
                >
                  <option value="">(No specific topic / General study)</option>
                  {(taskModal.data.moduleId
                    ? TOPICS.filter((t) => t.moduleId === taskModal.data.moduleId)
                    : TOPICS.filter((t) => t.subjectId === taskModal.data.subjectId)
                  ).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Start Time */}
              <div className="grid-2" style={{ gap: "0.75rem" }}>
                <div className="form-group-block">
                  <label className="form-label">Date:</label>
                  <input
                    type="date"
                    className="modal-text-input"
                    value={taskModal.data.date}
                    onChange={(e) =>
                      setTaskModal({
                        ...taskModal,
                        data: { ...taskModal.data, date: e.target.value }
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group-block">
                  <label className="form-label">Start Time:</label>
                  <input
                    type="time"
                    className="modal-text-input"
                    value={taskModal.data.startTime}
                    onChange={(e) =>
                      setTaskModal({
                        ...taskModal,
                        data: { ...taskModal.data, startTime: e.target.value }
                      })
                    }
                    required
                  />
                </div>
              </div>

              {/* Duration with quick presets */}
              <div className="form-group-block">
                <label className="form-label">
                  Duration: <strong>{taskModal.data.durationMinutes} minutes</strong>
                </label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                  {[15, 25, 30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      className={`option-pill ${taskModal.data.durationMinutes === mins ? "active" : ""}`}
                      onClick={() =>
                        setTaskModal({
                          ...taskModal,
                          data: { ...taskModal.data, durationMinutes: mins }
                        })
                      }
                      style={{ fontSize: "0.78rem", padding: "4px 10px" }}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Type */}
              <div className="form-group-block">
                <label className="form-label">Task Type:</label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[
                    { id: "study", label: "Study" },
                    { id: "revision", label: "Revision" },
                    { id: "practice", label: "Practice" },
                    { id: "quiz", label: "Quiz" },
                    { id: "assignment", label: "Assignment" },
                    { id: "other", label: "Other" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`option-pill ${taskModal.data.type === t.id ? "active" : ""}`}
                      onClick={() =>
                        setTaskModal({
                          ...taskModal,
                          data: { ...taskModal.data, type: t.id }
                        })
                      }
                      style={{ fontSize: "0.78rem", padding: "4px 10px" }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="form-group-block">
                <label className="form-label">Notes (optional):</label>
                <textarea
                  className="modal-textarea-input"
                  rows={2}
                  placeholder="Review formulas, practice 5 questions, check textbook diagrams..."
                  value={taskModal.data.notes}
                  onChange={(e) =>
                    setTaskModal({
                      ...taskModal,
                      data: { ...taskModal.data, notes: e.target.value }
                    })
                  }
                />
              </div>

              {/* Actions */}
              <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-light)", paddingTop: "0.75rem" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setTaskModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {taskModal.mode === "add" ? "Save Task" : "Update Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deleteConfirmModal && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setDeleteConfirmModal(null)}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Trash2 size={20} className="text-danger" />
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
                  Delete this task?
                </h3>
              </div>
              <button
                className="btn-icon-subtle"
                onClick={() => setDeleteConfirmModal(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "1rem 0" }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-main)", lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>"{deleteConfirmModal.title}"</strong>?
              </p>
              <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                Scheduled for {deleteConfirmModal.date} at {deleteConfirmModal.startTime}. This action cannot be undone.
              </span>
            </div>

            <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-light)", paddingTop: "0.75rem" }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDeleteConfirmModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ backgroundColor: "var(--danger)", borderColor: "var(--danger)" }}
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ================= AI PLAN SUGGESTION MODAL ================= */}
      {showCreateAIPlanModal && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setShowCreateAIPlanModal(false)}>
          <div className="modal-card create-plan-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-lockup">
                <Sparkles size={20} className="text-primary" />
                <h3>Suggest Study Plan</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowCreateAIPlanModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-form">
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 1rem 0" }}>
                Generate balanced study tasks for <strong>{formatDateDisplay(selectedDate)}</strong>.
                Your existing manual tasks will not be deleted or duplicated.
              </p>

              {/* Available Time Selector */}
              <div className="form-group-block">
                <label className="form-label">Available Study Time:</label>
                <div className="options-pill-grid">
                  {[1, 2, 3, 4].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      className={`option-pill ${availableHours === hrs ? "active" : ""}`}
                      onClick={() => setAvailableHours(hrs)}
                    >
                      {hrs} {hrs === 1 ? "Hour" : "Hours"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Session Length */}
              <div className="form-group-block">
                <label className="form-label">Preferred Session Length:</label>
                <div className="options-pill-grid">
                  {[15, 25, 45, 60].map((len) => (
                    <button
                      key={len}
                      type="button"
                      className={`option-pill ${preferredLength === len ? "active" : ""}`}
                      onClick={() => setPreferredLength(len)}
                    >
                      {len} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Filter */}
              <div className="form-group-block">
                <label className="form-label">Subject Focus:</label>
                <select
                  className="modal-select-input"
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                >
                  <option value="all">All Subjects (Balanced Curriculum)</option>
                  {SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority explanation */}
              <div className="plan-priority-explainer">
                <span className="explainer-title">How recommendations are selected:</span>
                <p className="explainer-text">
                  Prioritizes weak topics with low quiz scores, upcoming exam subjects, and incomplete topics.
                  Generated tasks are labeled as <strong>Recommended</strong> and remain fully editable.
                </p>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowCreateAIPlanModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handleExecuteCreatePlan}
                >
                  <Sparkles size={16} />
                  <span>Generate Plan ({availableHours} hrs)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STYLES ================= */}
      <style>{`
        .study-plan-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 1.5rem 1rem 3rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .plan-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .plan-main-title {
          font-size: 1.875rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          margin: 0;
          color: var(--text-main);
        }

        .plan-subtitle {
          color: var(--text-muted);
          font-size: 0.9375rem;
          margin: 0.25rem 0 0;
        }

        .plan-top-actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        /* View Navigation Tabs */
        .plan-views-nav {
          display: flex;
          gap: 0.4rem;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 0.25rem;
          overflow-x: auto;
        }

        .view-nav-tab {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 0.9rem;
          border-radius: 8px 8px 0 0;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .view-nav-tab:hover {
          color: var(--text-main);
          background: var(--bg-subtle);
        }

        .view-nav-tab.active {
          color: var(--primary);
          background: rgba(99, 102, 241, 0.08);
          border-bottom: 2px solid var(--primary);
        }

        /* Day Controls Card */
        .day-controls-card {
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .date-nav-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .date-nav-controls {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .nav-arrow-btn {
          padding: 4px 8px;
        }

        .current-date-heading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .selected-date-text {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-main);
        }

        .date-input-control {
          padding: 5px 9px;
          border: 1px solid var(--border-light);
          border-radius: 6px;
          background: var(--bg-surface);
          color: var(--text-main);
          font-size: 0.82rem;
          cursor: pointer;
        }

        /* Week Strip */
        .week-strip-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.4rem;
        }

        .week-day-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.5rem 0.2rem;
          border-radius: 8px;
          border: 1px solid var(--border-light);
          background: var(--bg-surface);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .week-day-pill:hover {
          border-color: var(--primary);
        }

        .week-day-pill.selected {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .week-day-pill.selected .week-day-name,
        .week-day-pill.selected .week-day-num {
          color: white;
        }

        .week-day-pill.is-today:not(.selected) {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.05);
        }

        .week-day-name {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .week-day-num {
          font-size: 1.05rem;
          font-weight: 700;
          margin: 2px 0;
          color: var(--text-main);
        }

        .week-day-badge {
          font-size: 0.68rem;
          font-weight: 700;
          background: rgba(99, 102, 241, 0.18);
          color: var(--primary);
          padding: 1px 6px;
          border-radius: 9999px;
        }

        .week-day-pill.selected .week-day-badge {
          background: rgba(255, 255, 255, 0.25);
          color: white;
        }

        .week-day-empty {
          font-size: 0.8rem;
          color: var(--text-dim);
          line-height: 1;
        }

        /* Summary Bar */
        .plan-summary-bar {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 0.85rem 1rem;
          background: var(--bg-subtle);
          border-radius: 8px;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .summary-metric-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .metric-num-val {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-main);
          font-family: var(--font-display);
        }

        .metric-sub-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .summary-metric-divider {
          width: 1px;
          height: 28px;
          background: var(--border-light);
        }

        /* Search & Filter Card */
        .search-filter-card {
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .search-box-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          min-width: 220px;
          background: var(--bg-subtle);
          padding: 5px 10px;
          border-radius: 6px;
          border: 1px solid var(--border-light);
        }

        .search-icon {
          color: var(--text-muted);
        }

        .search-text-input {
          border: none;
          background: transparent;
          color: var(--text-main);
          font-size: 0.84rem;
          width: 100%;
          outline: none;
        }

        .filter-dropdowns-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .filter-select-group {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .filter-select {
          padding: 4px 8px;
          border: 1px solid var(--border-light);
          border-radius: 6px;
          background: var(--bg-surface);
          color: var(--text-main);
          font-size: 0.82rem;
          cursor: pointer;
        }

        /* Schedule Card & Items Stream */
        .plan-schedule-card {
          padding: 1.25rem;
        }

        .schedule-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 1rem;
        }

        .schedule-header-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .schedule-date-title {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-main);
        }

        .schedule-count-pill {
          font-size: 0.78rem;
          color: var(--text-muted);
          background: var(--bg-subtle);
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .plan-items-stream {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        /* Task Card */
        .plan-task-card {
          padding: 1rem;
          border: 1px solid var(--border-light);
          transition: all 0.2s ease;
        }

        .plan-task-card:hover {
          border-color: rgba(99, 102, 241, 0.35);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .task-card-inner {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }

        .task-check-circle {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 2px solid var(--border-color, #cbd5e1);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          margin-top: 2px;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .task-check-circle.checked {
          background: var(--success);
          border-color: var(--success);
        }

        .task-content-block {
          flex: 1;
        }

        .task-top-badges-line {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
          margin-bottom: 0.3rem;
        }

        .task-subject-tag {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 1px 7px;
          border-radius: 4px;
        }

        .task-type-badge {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: capitalize;
          background: var(--bg-subtle);
          color: var(--text-muted);
          padding: 1px 6px;
          border-radius: 4px;
        }

        .task-source-badge {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .task-source-badge.ai-badge {
          background: rgba(99, 102, 241, 0.12);
          color: var(--primary);
        }

        .task-source-badge.manual-badge {
          background: var(--bg-subtle);
          color: var(--text-dim);
        }

        .task-headline-title {
          font-size: 1.05rem;
          font-weight: 700;
          margin: 0 0 0.35rem 0;
          color: var(--text-main);
          line-height: 1.35;
        }

        .task-headline-title.strikethrough {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .task-time-meta-line {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.78rem;
          color: var(--text-muted);
          flex-wrap: wrap;
          margin-bottom: 0.35rem;
        }

        .task-time-chip, .task-date-chip, .task-topic-chip {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .task-notes-text {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0.25rem 0 0;
          line-height: 1.4;
          background: var(--bg-subtle);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .task-completed-history-note {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--success);
          margin-top: 4px;
          font-weight: 600;
        }

        .task-card-actions-cluster {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-wrap: wrap;
        }

        .action-btn {
          font-size: 0.75rem;
          padding: 3px 8px;
        }

        /* Breaks */
        .plan-break-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.85rem;
          background: rgba(245, 158, 11, 0.06);
          border: 1px dashed rgba(245, 158, 11, 0.3);
          border-radius: 6px;
        }

        .break-icon-box {
          color: #d97706;
        }

        .break-info {
          flex: 1;
        }

        .break-title {
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text-main);
          display: block;
        }

        .break-duration {
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .break-time {
          font-size: 0.76rem;
          color: var(--text-muted);
        }

        /* Empty State */
        .plan-empty-state {
          text-align: center;
          padding: 2.5rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .plan-empty-state h3 {
          font-size: 1.15rem;
          margin: 0.4rem 0 0;
          color: var(--text-main);
        }

        .plan-empty-state p {
          font-size: 0.86rem;
          color: var(--text-muted);
          max-width: 440px;
          margin: 0 0 0.5rem 0;
        }

        /* Exam banner */
        .exam-approaching-banner {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 0.875rem;
          color: var(--text-main);
          flex-wrap: wrap;
        }

        .exam-banner-icon {
          color: #d97706;
        }

        .exam-banner-text {
          flex: 1;
        }

        .exam-banner-title {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0;
          color: #b45309;
        }

        .exam-banner-sub {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin: 2px 0 0;
        }

        /* Form Controls */
        .form-group-block {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .form-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .modal-text-input, .modal-select-input, .modal-textarea-input {
          padding: 8px 10px;
          border: 1px solid var(--border-light);
          border-radius: 6px;
          background: var(--bg-surface);
          color: var(--text-main);
          font-size: 0.86rem;
          width: 100%;
          outline: none;
        }

        .modal-text-input:focus, .modal-select-input:focus, .modal-textarea-input:focus {
          border-color: var(--primary);
        }

        .options-pill-grid {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .option-pill {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid var(--border-light);
          background: var(--bg-surface);
          color: var(--text-main);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .option-pill:hover {
          border-color: var(--primary);
        }

        .option-pill.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .plan-priority-explainer {
          background: var(--bg-subtle);
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .explainer-title {
          font-weight: 700;
          color: var(--text-main);
          display: block;
          margin-bottom: 2px;
        }

        .explainer-text {
          margin: 0;
          line-height: 1.4;
        }

        .modal-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        @media (max-width: 640px) {
          .task-card-inner {
            flex-direction: column;
          }
          .task-card-actions-cluster {
            width: 100%;
            justify-content: flex-start;
            margin-top: 0.5rem;
            padding-top: 0.5rem;
            border-top: 1px solid var(--border-light);
          }
          .week-strip-row {
            gap: 2px;
          }
        }
      `}</style>
    </div>
  );
}
