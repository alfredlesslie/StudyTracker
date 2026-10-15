/**
 * StudySense AI - Centralized Practice & Performance Storage Service
 * 
 * ARCHITECTURAL PRINCIPLE & DATA SOVEREIGNTY:
 * - Authoritative Source of Truth: Python FastAPI Backend + Database (PostgreSQL / SQLite).
 * - Client-Side LocalStorage: Transient local cache and offline fallback.
 *   Ensures the prototype remains responsive even when offline, while syncing with the server.
 * - Migration Pathway: Local items contain unique UUID/timestamp keys (`attempt-*`, `session-*`, `exam-*`)
 *   that map directly to backend database entities for seamless bi-directional synchronization.
 */

import { TOPICS, SUBJECTS } from "../data/syllabus.js";
import { INITIAL_QUIZ_ATTEMPTS } from "../data/sampleData.js";
import { calculateStudyPriority } from "./mlService.js";

const STORAGE_KEYS = {
  QUIZZES: "studysense_quizzes_v2",
  TOPICS: "studysense_topics_v2"
};

/**
 * Get all stored quiz attempts
 * @returns {Array}
 */
export function getQuizAttempts() {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return INITIAL_QUIZ_ATTEMPTS;
    }
    const raw = window.localStorage.getItem(STORAGE_KEYS.QUIZZES);
    if (!raw) return INITIAL_QUIZ_ATTEMPTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_QUIZ_ATTEMPTS;
  } catch (err) {
    return INITIAL_QUIZ_ATTEMPTS;
  }
}

/**
 * Save a newly completed quiz attempt and persist to localStorage
 * @param {Object} attemptData
 * @param {string} attemptData.topicId
 * @param {string} attemptData.subjectId
 * @param {string} attemptData.moduleId
 * @param {number} attemptData.score
 * @param {number} attemptData.totalQuestions
 * @param {number} attemptData.percentage
 * @param {Array} attemptData.answers
 * @param {string} [attemptData.difficulty]
 * @param {string} [attemptData.format]
 * @returns {Object} saved attempt
 */
export function saveQuizAttempt(attemptData) {
  const attempts = getQuizAttempts();
  const currentTopic = TOPICS.find((t) => t.id === attemptData.topicId);
  const currentSubject = SUBJECTS.find((s) => s.id === attemptData.subjectId);

  const percentage = Math.round(
    (attemptData.score / (attemptData.totalQuestions || 1)) * 100
  );

  const newAttempt = {
    id: attemptData.id || `attempt-${Date.now()}`,
    examId: attemptData.examId || attemptData.exam_id || null,
    topicId: attemptData.topicId || null,
    topicTitle: currentTopic?.title || (attemptData.examId ? "Exam Practice Quiz" : "Topic Practice"),
    subjectId: attemptData.subjectId || currentTopic?.subjectId || "cs-cn",
    subjectName: currentSubject?.name || "Subject",
    moduleId: attemptData.moduleId || currentTopic?.moduleId || null,
    moduleScope: attemptData.moduleScope || attemptData.moduleScopeJson || null,
    moduleResults: attemptData.moduleResults || attemptData.moduleResultsJson || null,
    score: attemptData.score,
    totalQuestions: attemptData.totalQuestions,
    percentage: percentage,
    date: attemptData.date || new Date().toISOString().split("T")[0],
    attemptedAt: attemptData.attemptedAt || new Date().toISOString(),
    difficulty: attemptData.difficulty || "medium",
    format: attemptData.format || (attemptData.examId ? "Mixed Module Exam Practice" : "Quick Practice"),
    answers: attemptData.answers || [],
    questions: attemptData.questions || [],
    unansweredCount: attemptData.unansweredCount ?? Math.max(0, (attemptData.totalQuestions || 0) - (attemptData.answers?.length || 0)),
    correctCount: attemptData.correctCount ?? Number(attemptData.score || 0),
    incorrectCount: attemptData.incorrectCount ?? Math.max(0, (attemptData.totalQuestions || 0) - Number(attemptData.score || 0) - (attemptData.unansweredCount || 0)),
    needsWork: percentage < 60
  };

  const updatedAttempts = [newAttempt, ...attempts];
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(updatedAttempts));
    }
  } catch (err) {}

  return newAttempt;
}

/**
 * Get all standalone general practice quiz attempts (strictly excluding exam-linked attempts)
 * @returns {Array}
 */
export function getPracticeAttempts() {
  const attempts = getQuizAttempts();
  return attempts.filter((a) => !a.examId && !a.exam_id);
}

/**
 * Get a specific standalone practice attempt by its unique identifier
 * @param {string} attemptId
 * @returns {Object|null}
 */
export function getPracticeAttemptById(attemptId) {
  const attempts = getQuizAttempts();
  return attempts.find((a) => a.id === attemptId) || null;
}

/**
 * Get all quiz attempts for a specific topic
 * @param {string} topicId
 * @returns {Array}
 */
export function getQuizAttemptsByTopic(topicId) {
  const attempts = getQuizAttempts();
  return attempts.filter((a) => a.topicId === topicId);
}

/**
 * Get the most recent standalone practice attempts across all topics
 * Strictly isolates practice from exam-specific attempts
 * @param {number} limit
 * @returns {Array}
 */
export function getRecentPractice(limit = 10) {
  const attempts = getPracticeAttempts();
  return attempts.slice(0, limit);
}

/**
 * Update a topic's performance statistics following a quiz attempt
 * Rule-based status mapping (Strictly prototype, not ML):
 * 0–39: "needs_practice"
 * 40–59: "learning"
 * 60–79: "learned"
 * 80–100: "mastered"
 * 
 * @param {Array} currentTopics
 * @param {string} topicId
 * @param {number} score
 * @param {number} totalQuestions
 * @returns {Array} updated topics array
 */
export function updateTopicPerformance(currentTopics, topicId, score, totalQuestions) {
  const percentage = Math.round((score / (totalQuestions || 1)) * 100);

  const updated = currentTopics.map((topic) => {
    if (topic.id !== topicId) return topic;

    const prevAttempts = topic.quizAttempts || 0;
    const newAttempts = prevAttempts + 1;
    const prevScore = topic.averageQuizScore ?? percentage;
    const newAvg = Math.round((prevScore * prevAttempts + percentage) / newAttempts);

    // Rule-based status mapping requested by prompt
    let newStatus = "learning";
    if (newAvg < 40) newStatus = "needs_practice";
    else if (newAvg < 60) newStatus = "learning";
    else if (newAvg < 80) newStatus = "learned";
    else newStatus = "mastered";

    // Mastery label for UI
    let mastery = "Review soon";
    if (newAvg >= 80) mastery = "Doing well";
    else if (newAvg < 60) mastery = "Needs Practice";

    return {
      ...topic,
      quizAttempts: newAttempts,
      averageQuizScore: newAvg,
      mastery: mastery,
      status: newStatus,
      lastStudied: "Just now",
      completion: topic.completion || 0
    };
  });

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(updated));
    }
  } catch (err) {}

  return updated;
}

/**
 * Retrieve all topics from storage, or fallback to syllabus default 64 topics
 * @returns {Array} Array of topic objects
 */
export function getTopics() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_KEYS.TOPICS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 64) {
          return parsed;
        }
      }
    }
  } catch (err) {}
  return TOPICS;
}

/**
 * Retrieve weak topics requiring additional practice
 * Criteria: average quiz score < 60, or status === "needs_practice"
 * 
 * @param {Array} topics
 * @param {Array} [attempts]
 * @returns {Array}
 */
export function getWeakTopics(topics = [], attempts = null) {
  const quizList = attempts || getQuizAttempts();

  // Find topics that have recorded quiz performance < 60%
  const weakFromQuizzes = topics.filter((t) => {
    const topicAttempts = quizList.filter((a) => a.topicId === t.id);
    if (topicAttempts.length === 0) {
      return t.status === "needs_practice";
    }
    const latestScore = topicAttempts[0]?.percentage ?? 100;
    const avgScore = t.averageQuizScore ?? latestScore;
    return avgScore < 60 || latestScore < 60;
  });

  if (weakFromQuizzes.length > 0) {
    return weakFromQuizzes;
  }

  // Fallback to topics explicitly flagged as Needs Practice
  return topics.filter(
    (t) => t.mastery === "Needs Practice" || t.status === "needs_practice"
  );
}

/**
 * Retrieve strong topics where the student is performing well
 * Criteria: average quiz score >= 80, or status === "mastered"
 * 
 * @param {Array} topics
 * @param {Array} [attempts]
 * @returns {Array}
 */
export function getStrongTopics(topics = [], attempts = null) {
  const quizList = attempts || getQuizAttempts();

  return topics.filter((t) => {
    const topicAttempts = quizList.filter((a) => a.topicId === t.id);
    if (topicAttempts.length === 0) {
      return t.status === "mastered" || t.mastery === "Doing well";
    }
    const avgScore = t.averageQuizScore ?? topicAttempts[0]?.percentage;
    return avgScore >= 80 || t.status === "mastered";
  });
}

// ============================================================================
// STUDY SESSIONS & FOCUS TIMER STORAGE ARCHITECTURE
// ============================================================================

const SESSION_STORAGE_KEYS = {
  SESSIONS: "studysense_sessions_v2",
  PLAN: "studysense_study_plan_v2",
  DAILY_GOAL: "studysense_daily_goal_v2",
  ACTIVE_TIMER: "studysense_active_timer_v2"
};

/**
 * Get all stored study sessions
 * @returns {Array}
 */
export function getStudySessions() {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return [];
    }
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEYS.SESSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

/**
 * Save a study session (completed or partial)
 * 
 * Reusable StudySession model:
 * {
 *   id,
 *   subjectId,
 *   moduleId,
 *   topicId,
 *   startTime,
 *   endTime,
 *   durationMinutes,
 *   plannedDuration,
 *   completed,
 *   difficulty, // "easy" | "okay" | "difficult"
 *   confidence, // "not_confident" | "somewhat_confident" | "confident"
 *   sessionType, // "study" | "revision" | "practice" | "focus"
 *   date
 * }
 * 
 * @param {Object} sessionData
 * @returns {Object} saved session
 */
export function saveStudySession(sessionData) {
  const sessions = getStudySessions();
  const now = new Date();
  let dateStr = sessionData.date;
  if (!dateStr) {
    const rawStart = sessionData.startTime || sessionData.started_at;
    if (rawStart && typeof rawStart === "string") {
      const part = rawStart.split("T")[0].split(" ")[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(part)) {
        dateStr = part;
      }
    }
  }
  if (!dateStr) {
    dateStr = now.toISOString().split("T")[0];
  }

  const newSession = {
    id: sessionData.id || `session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    subjectId: sessionData.subjectId || "cs-cn",
    moduleId: sessionData.moduleId || "cn-m1",
    topicId: sessionData.topicId || "cn-m1-t1",
    taskId: sessionData.taskId || sessionData.task_id || null,
    startTime: sessionData.startTime || now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    endTime: sessionData.endTime || now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    durationMinutes: Number(sessionData.durationMinutes) || 0,
    plannedDuration: Number(sessionData.plannedDuration) || 25,
    completed: sessionData.completed !== false,
    difficulty: sessionData.difficulty || "okay",
    confidence: sessionData.confidence || "somewhat_confident",
    sessionType: sessionData.sessionType || "focus",
    date: dateStr,
    createdAt: now.toISOString()
  };

  const updated = [newSession, ...sessions];

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(SESSION_STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
    }
  } catch (err) {}

  return newSession;
}

/**
 * Get study sessions for a specific topic
 * @param {string} topicId
 * @returns {Array}
 */
export function getStudySessionsByTopic(topicId) {
  return getStudySessions().filter((s) => s.topicId === topicId);
}

/**
 * Get study sessions on a specific date (YYYY-MM-DD)
 * Filters strictly by completed !== false and extracts date consistently
 * @param {string} dateStr
 * @param {Array} [sessionList]
 * @returns {Array}
 */
export function getStudySessionsByDate(dateStr, sessionList = null) {
  const targetDate = dateStr || new Date().toISOString().split("T")[0];
  const list = sessionList || getStudySessions();
  return list.filter((s) => {
    if (s.completed === false) return false;
    let sDate = s.date;
    if (!sDate) {
      const rawStart = s.started_at || s.startTime || s.createdAt;
      if (rawStart && typeof rawStart === "string") {
        const part = rawStart.split("T")[0].split(" ")[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(part)) {
          sDate = part;
        }
      } else if (rawStart instanceof Date) {
        sDate = rawStart.toISOString().split("T")[0];
      }
    }
    return sDate === targetDate;
  });
}

/**
 * Get all study sessions completed today
 * @param {Array} [sessionList]
 * @returns {Array}
 */
export function getTodayStudySessions(sessionList = null) {
  const today = new Date().toISOString().split("T")[0];
  return getStudySessionsByDate(today, sessionList);
}

/**
 * Get all study sessions for the current week (last 7 days)
 * @param {Array} [sessionList]
 * @returns {Array}
 */
export function getWeeklyStudySessions(sessionList = null) {
  const sessions = sessionList || getStudySessions();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const cutoff = sevenDaysAgo.toISOString().split("T")[0];

  return sessions.filter((s) => {
    if (s.completed === false) return false;
    let sDate = s.date;
    if (!sDate) {
      const rawStart = s.started_at || s.startTime || s.createdAt;
      if (rawStart && typeof rawStart === "string") {
        const part = rawStart.split("T")[0].split(" ")[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(part)) {
          sDate = part;
        }
      } else if (rawStart instanceof Date) {
        sDate = rawStart.toISOString().split("T")[0];
      }
    }
    return Boolean(sDate && sDate >= cutoff);
  });
}

/**
 * Calculate total study time in minutes from a session list
 * @param {Array} [sessionList]
 * @returns {number} minutes
 */
export function getTotalStudyTime(sessionList = null) {
  const list = sessionList || getStudySessions();
  return list.reduce((sum, s) => {
    if (s.completed === false) return sum;
    const mins =
      s.durationMinutes !== undefined && s.durationMinutes !== null
        ? Number(s.durationMinutes) || 0
        : s.active_duration_seconds !== undefined && s.active_duration_seconds !== null
        ? Math.round(Number(s.active_duration_seconds) / 60)
        : s.activeDurationSeconds !== undefined && s.activeDurationSeconds !== null
        ? Math.round(Number(s.activeDurationSeconds) / 60)
        : 0;
    return sum + mins;
  }, 0);
}

/**
 * Get daily actual active study time in minutes for a specific date (defaults to today)
 * Authoritative single source: recorded completed study sessions
 * @param {string} [dateStr] - YYYY-MM-DD
 * @param {Array} [sessionList]
 * @returns {number} minutes
 */
export function getDailyStudyTime(dateStr = null, sessionList = null) {
  const targetDate = dateStr || new Date().toISOString().split("T")[0];
  const dateSessions = getStudySessionsByDate(targetDate, sessionList);
  return getTotalStudyTime(dateSessions);
}

/**
 * Calculate study streak: consecutive days with at least 1 completed study session
 * @param {Array} [sessionList]
 * @returns {number} streak in days
 */
export function calculateStudyStreak(sessionList = null) {
  const rawList = sessionList || getStudySessions();
  const sessions = rawList.filter((s) => {
    const isCompleted = s.completed !== false;
    const mins =
      s.durationMinutes !== undefined
        ? Number(s.durationMinutes) || 0
        : s.active_duration_seconds
        ? Math.round(Number(s.active_duration_seconds) / 60)
        : 0;
    return isCompleted && mins > 0;
  });
  if (sessions.length === 0) return 0;

  // Set of unique dates
  const uniqueDates = Array.from(
    new Set(
      sessions
        .map((s) => s.date || (s.started_at ? s.started_at.split("T")[0] : ""))
        .filter(Boolean)
    )
  ).sort().reverse();
  if (uniqueDates.length === 0) return 0;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // If the user hasn't studied today or yesterday, streak is broken
  const latestDate = uniqueDates[0];
  if (latestDate !== today && latestDate !== yesterday) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date(latestDate);

  for (const dStr of uniqueDates) {
    const expected = checkDate.toISOString().split("T")[0];
    if (dStr === expected) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get daily study goal in minutes (default 120 minutes = 2 hours)
 * @returns {number}
 */
export function getDailyGoal() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return 120;
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEYS.DAILY_GOAL);
    return raw ? Number(raw) : 120;
  } catch (e) {
    return 120;
  }
}

/**
 * Set daily study goal in minutes
 * @param {number} minutes
 */
export function setDailyGoal(minutes) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(SESSION_STORAGE_KEYS.DAILY_GOAL, String(minutes));
    }
  } catch (e) {}
}

/**
 * Get active timer recovery state from localStorage
 * @returns {Object|null}
 */
export function getActiveTimerState() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEYS.ACTIVE_TIMER);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Save active timer recovery state
 * @param {Object} state
 */
export function saveActiveTimerState(state) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(SESSION_STORAGE_KEYS.ACTIVE_TIMER, JSON.stringify(state));
    }
  } catch (e) {}
}

/**
 * Clear active timer recovery state
 */
export function clearActiveTimerState() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(SESSION_STORAGE_KEYS.ACTIVE_TIMER);
    }
  } catch (e) {}
}

// ============================================================================
// STUDY PLAN STORAGE & GENERATION ARCHITECTURE
// ============================================================================

/**
 * =========================================================================
 * STUDY PLAN TASK MANAGEMENT SERVICE (PROMPT 12)
 * =========================================================================
 * 
 * Supports both:
 * 1. AI-generated/recommended study tasks (source: "recommended" | "ai")
 * 2. Student-created manual tasks (source: "manual")
 * 
 * Task Data Model:
 * {
 *   id,
 *   studentId,
 *   title,
 *   subjectId,
 *   moduleId,
 *   topicId,
 *   date,             // YYYY-MM-DD
 *   startTime,        // e.g. "19:00" or "07:00 PM"
 *   durationMinutes,  // number e.g. 45
 *   type,             // "study" | "revision" | "practice" | "quiz" | "assignment" | "other"
 *   source,           // "manual" | "recommended" | "ai"
 *   status,           // "pending" | "in_progress" | "completed" | "skipped"
 *   notes,            // string
 *   createdAt,        // ISO string
 *   updatedAt,        // ISO string
 *   completedAt       // ISO string or null
 * }
 */

/**
 * Normalizes any task (legacy or new) to adhere strictly to the Prompt 12 data model
 * while preserving backward-compatible fields.
 * 
 * @param {Object} raw 
 * @returns {Object} normalized task
 */
export function normalizeStudyTask(raw) {
  if (!raw) return null;
  const now = new Date().toISOString();
  const todayStr = now.split("T")[0];

  const sub = SUBJECTS.find((s) => s.id === raw.subjectId);
  const topic = TOPICS.find((t) => t.id === raw.topicId);
  const duration = Number(raw.durationMinutes || raw.duration || 25);
  const date = raw.date || todayStr;
  const startTime = raw.startTime || raw.time || "19:00";

  // Map legacy status "upcoming" to Prompt 12 standard "pending"
  let status = raw.status || "pending";
  if (status === "upcoming") status = "pending";

  const isCompleted = status === "completed";

  // Determine type
  let type = raw.type;
  if (!type) {
    if (raw.isBreak) type = "other";
    else if (topic?.status === "needs_practice" || (topic?.averageQuizScore && topic.averageQuizScore < 60)) {
      type = "practice";
    } else {
      type = "study";
    }
  }

  // Determine source
  let source = raw.source;
  if (!source) {
    source = (raw.reason || raw.recommendationReason || raw.isBreak) ? "recommended" : "manual";
  }

  return {
    id: raw.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    studentId: raw.studentId || "student_001",
    title: raw.title || raw.topicTitle || topic?.title || "Study Session",
    subjectId: raw.subjectId || topic?.subjectId || "cs-cn",
    moduleId: raw.moduleId || topic?.moduleId || null,
    topicId: raw.topicId || null,
    date,
    startTime,
    durationMinutes: duration,
    type,
    source,
    status,
    notes: raw.notes || raw.reason || raw.recommendationReason || "",
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || raw.createdAt || now,
    completedAt: raw.completedAt || (isCompleted ? (raw.updatedAt || now) : null),

    // Backward-compatibility properties:
    duration,
    time: startTime,
    topicTitle: raw.topicTitle || topic?.title || raw.title,
    subjectName: sub?.name || raw.subjectName || "Computer Science",
    isBreak: Boolean(raw.isBreak),
    reason: raw.reason || raw.notes || ""
  };
}

/**
 * Retrieve all study tasks from localStorage with automatic migration/normalization
 * @returns {Array<Object>}
 */
export function getStudyTasks() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return [];
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEYS.PLAN);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeStudyTask).filter(Boolean);
  } catch (e) {
    return [];
  }
}

/**
 * Save full study tasks array to localStorage
 * @param {Array<Object>} tasks 
 */
export function saveStudyTasks(tasks) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(SESSION_STORAGE_KEYS.PLAN, JSON.stringify(tasks));
    }
  } catch (e) {}
}

/**
 * Save a newly created study task (Manual or AI)
 * @param {Object} taskData 
 * @returns {Object} newly created task
 */
export function saveStudyTask(taskData) {
  const tasks = getStudyTasks();
  const now = new Date().toISOString();

  const newTask = normalizeStudyTask({
    ...taskData,
    id: taskData.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    source: taskData.source || "manual",
    status: taskData.status || "pending",
    createdAt: now,
    updatedAt: now
  });

  tasks.push(newTask);
  saveStudyTasks(tasks);
  return newTask;
}

/**
 * Update an existing study task by ID
 * @param {string} taskId 
 * @param {Object} partialUpdates 
 * @returns {Array<Object>} updated full tasks array
 */
export function updateStudyTask(taskId, partialUpdates) {
  const tasks = getStudyTasks();
  const now = new Date().toISOString();

  const updatedTasks = tasks.map((task) => {
    if (task.id === taskId) {
      const merged = {
        ...task,
        ...partialUpdates,
        updatedAt: now
      };

      // Handle completion timestamp transitions
      if (partialUpdates.status === "completed") {
        merged.completedAt = merged.completedAt || now;
      } else if (partialUpdates.status && partialUpdates.status !== "completed") {
        merged.completedAt = null;
      }

      return normalizeStudyTask(merged);
    }
    return task;
  });

  saveStudyTasks(updatedTasks);
  return updatedTasks;
}

/**
 * Delete a study task by ID
 * @param {string} taskId 
 * @returns {Array<Object>} remaining tasks array
 */
export function deleteStudyTask(taskId) {
  const tasks = getStudyTasks();
  const filtered = tasks.filter((t) => t.id !== taskId);
  saveStudyTasks(filtered);
  return filtered;
}

/**
 * Get all tasks for a specific date (YYYY-MM-DD)
 * @param {string} [dateStr] 
 * @returns {Array<Object>}
 */
export function getTasksForDate(dateStr = null) {
  const target = dateStr || new Date().toISOString().split("T")[0];
  const tasks = getStudyTasks();
  return tasks
    .filter((t) => t.date === target)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

/**
 * Get all upcoming tasks beyond today
 * @param {string} [fromDateStr] 
 * @returns {Array<Object>}
 */
export function getUpcomingTasks(fromDateStr = null) {
  const today = fromDateStr || new Date().toISOString().split("T")[0];
  const tasks = getStudyTasks();
  return tasks
    .filter((t) => t.date > today && t.status !== "completed" && t.status !== "skipped")
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
}

/**
 * Get all overdue tasks (date in past and status is pending)
 * @param {string} [todayStr] 
 * @returns {Array<Object>}
 */
export function getOverdueTasks(todayStr = null) {
  const today = todayStr || new Date().toISOString().split("T")[0];
  const tasks = getStudyTasks();
  return tasks
    .filter((t) => t.date < today && t.status === "pending" && !t.isBreak)
    .sort((a, b) => b.date.localeCompare(a.date) || a.startTime.localeCompare(b.startTime));
}

/**
 * Get all completed tasks
 * @returns {Array<Object>}
 */
export function getCompletedTasks() {
  const tasks = getStudyTasks();
  return tasks
    .filter((t) => t.status === "completed" && !t.isBreak)
    .sort((a, b) => (b.completedAt || b.date).localeCompare(a.completedAt || a.date));
}

/**
 * Backward-compatible wrappers for existing components
 */
export function getStudyPlan() {
  return getStudyTasks();
}

export function saveStudyPlan(planItems) {
  const normalized = (planItems || []).map(normalizeStudyTask).filter(Boolean);
  saveStudyTasks(normalized);
}

export function updateStudyPlanItem(itemId, partialUpdates) {
  return updateStudyTask(itemId, partialUpdates);
}

/**
 * Generate a rule-based daily study plan with duplicate prevention.
 * 
 * Preserves student-created manual tasks on the target date.
 * If a topic is already scheduled for that day, it will NOT be duplicated.
 * 
 * Priority order:
 * 1. Topics needing practice (low quiz score / status === needs_practice)
 * 2. Incomplete topics
 * 3. Topics not studied recently
 * 4. Upcoming exam subjects
 * 5. Normal remaining topics
 * 
 * @param {Object} params
 * @param {string} [params.targetDate] - Date to schedule for (default today)
 * @param {number} [params.availableMinutes] - Total study time (e.g. 60, 120, 180)
 * @param {number} [params.preferredLength] - Preferred session length (15, 25, 45, 60)
 * @param {Array} [params.topics] - Syllabus topics
 * @param {Array} [params.exams] - Upcoming exams
 * @param {Array} [params.selectedSubjectIds] - Optional subject filter
 * @returns {Array} full updated tasks array
 */
export function generateDailyStudyPlan(
  paramsOrTopics = {},
  maybeExams = [],
  maybeAvailableMinutes = 120,
  maybePreferredLength = 25
) {
  let availableMinutes = 120;
  let preferredLength = 25;
  let topics = [];
  let exams = [];
  let selectedSubjectIds = null;
  let targetDate = new Date().toISOString().split("T")[0];

  if (Array.isArray(paramsOrTopics)) {
    topics = paramsOrTopics;
    exams = maybeExams || [];
    availableMinutes = Number(maybeAvailableMinutes) || 120;
    preferredLength = Number(maybePreferredLength) || 25;
  } else {
    const p = paramsOrTopics || {};
    availableMinutes = Number(p.availableMinutes) || 120;
    preferredLength = Number(p.preferredLength) || 25;
    topics = Array.isArray(p.topics) ? p.topics : [];
    exams = Array.isArray(p.exams) ? p.exams : [];
    selectedSubjectIds = p.selectedSubjectIds || null;
    if (p.targetDate) targetDate = p.targetDate;
  }

  // Load existing tasks from storage to avoid duplicate suggestions and preserve manual tasks
  const allExistingTasks = getStudyTasks();
  const scheduledTopicIdsForDay = new Set(
    allExistingTasks
      .filter((t) => t.date === targetDate && t.status !== "skipped")
      .map((t) => t.topicId)
      .filter(Boolean)
  );

  const candidates = topics.filter((t) => {
    if (!selectedSubjectIds || selectedSubjectIds.length === 0) return true;
    return selectedSubjectIds.includes(t.subjectId);
  });

  // Score candidates using ML priority engine (with transparent fallback to rule-based prioritization)
  let scored = [];
  try {
    const mlPrioritized = calculateStudyPriority({
      topics: candidates,
      exams,
      sessions: (Array.isArray(paramsOrTopics?.sessions) ? paramsOrTopics.sessions : getStudySessions()),
      quizAttempts: (Array.isArray(paramsOrTopics?.quizAttempts) ? paramsOrTopics.quizAttempts : getQuizAttempts())
    });

    if (mlPrioritized && mlPrioritized.length > 0) {
      scored = mlPrioritized.map((item) => ({
        topic: item.topic || candidates.find((c) => c.id === item.topicId) || item,
        score: item.priority || 50,
        reason: item.reason || "Recommended for today"
      }));
    }
  } catch (err) {}

  // Fallback to rule-based prioritization
  if (scored.length === 0) {
    const weakTopics = getWeakTopics(candidates);
    const weakIds = new Set(weakTopics.map((w) => w.id));
    const nearestExam = [...exams].sort((a, b) => (a.daysRemaining || 99) - (b.daysRemaining || 99))[0];
    const examSubjectId = nearestExam?.subjectId || "cs-cn";

    scored = candidates.map((topic) => {
      let score = 0;
      let reason = "Recommended for today";

      if (weakIds.has(topic.id) || topic.status === "needs_practice" || topic.averageQuizScore < 60) {
        score += 100;
        reason = "Recommended because you need more practice here";
      } else if ((topic.completion || 0) < 100 && topic.status !== "mastered") {
        score += 50;
        reason = "Recommended to complete your syllabus";
      }
      if (topic.subjectId === examSubjectId) {
        score += 40;
        if (score < 100) {
          reason = `Recommended because ${nearestExam?.name || "exam"} is approaching`;
        }
      }
      if (!topic.lastStudied || topic.lastStudied === "Not yet") {
        score += 20;
      }

      return { topic, score, reason };
    });

    scored.sort((a, b) => b.score - a.score);
  }

  // Filter out any candidates already scheduled for that day (Section 17: AVOID DUPLICATE TASKS)
  const filteredCandidates = scored.filter((item) => !scheduledTopicIdsForDay.has(item.topic.id));

  // Allocate slots based on availableMinutes and preferredLength
  const newRecommendedTasks = [];
  let remainingMin = availableMinutes;
  let slotIndex = 0;

  // Typical evening study start time calculation
  let currentHour = 19;
  let currentMinute = 0;

  for (const item of filteredCandidates) {
    if (remainingMin < 15) break;

    const duration = Math.min(preferredLength, remainingMin);
    const sub = SUBJECTS.find((s) => s.id === item.topic.subjectId);

    const timeLabel = `${((currentHour % 12) || 12)}:${String(currentMinute).padStart(2, "0")} ${currentHour >= 12 ? "PM" : "AM"}`;

    const isPractice = item.topic.status === "needs_practice" || (item.topic.averageQuizScore && item.topic.averageQuizScore < 60);

    const taskObj = normalizeStudyTask({
      id: `task-rec-${Date.now()}-${slotIndex}`,
      title: item.topic.title,
      topicId: item.topic.id,
      moduleId: item.topic.moduleId,
      subjectId: item.topic.subjectId,
      date: targetDate,
      startTime: timeLabel,
      durationMinutes: duration,
      type: isPractice ? "practice" : "study",
      source: "recommended",
      status: "pending",
      notes: item.reason || "Recommended by StudySense AI based on upcoming exam readiness and practice needs.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null
    });

    newRecommendedTasks.push(taskObj);

    remainingMin -= duration;
    currentMinute += duration;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }

    // Add a 5 min break if more study remains
    if (remainingMin >= 20) {
      const breakTimeLabel = `${((currentHour % 12) || 12)}:${String(currentMinute).padStart(2, "0")} ${currentHour >= 12 ? "PM" : "AM"}`;
      newRecommendedTasks.push(normalizeStudyTask({
        id: `break-${Date.now()}-${slotIndex}`,
        title: "Rest & Stretch Break",
        durationMinutes: 5,
        startTime: breakTimeLabel,
        type: "other",
        source: "recommended",
        status: "pending",
        notes: "5 min Pomodoro recovery break",
        date: targetDate,
        isBreak: true
      }));
      remainingMin -= 5;
      currentMinute += 5;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }

    slotIndex++;
  }

  // Combine existing tasks with newly generated recommended tasks (preserves manual student tasks!)
  const combinedTasks = [...allExistingTasks, ...newRecommendedTasks];
  saveStudyTasks(combinedTasks);
  return combinedTasks;
}

/**
 * =========================================================================
 * EXAMS CRUD MANAGEMENT SERVICE
 * =========================================================================
 */

export const INITIAL_EXAMS = [
  {
    id: "exam-001",
    subjectId: "cs-cn",
    name: "Computer Networks — Internal Examination",
    date: "2026-11-15",
    time: "10:00 AM",
    notes: "Mid-semester internal evaluation covering Modules 1 to 4: Physical & Data Link, Network Layer, Transport Layer, and Application Layer.",
    moduleIds: ["cn-m1", "cn-m2", "cn-m3", "cn-m4"],
    completedModuleIds: ["cn-m3"],
    completedTopicIds: ["cn-m1-t1", "cn-m1-t2", "cn-m1-t4", "cn-m2-t1", "cn-m2-t2", "cn-m3-t1", "cn-m3-t2", "cn-m3-t3", "cn-m3-t4"],
    actualScore: null,
    createdAt: "2026-10-01T09:00:00.000Z"
  },
  {
    id: "exam-002",
    subjectId: "cs-se",
    name: "Software Engineering — Internal Examination",
    date: "2026-11-18",
    time: "10:00 AM",
    notes: "Review Agile methodologies, Software requirements, System modeling, and Testing strategies.",
    moduleIds: ["se-m1", "se-m2", "se-m3", "se-m4"],
    completedModuleIds: [],
    completedTopicIds: ["se-m1-t1", "se-m1-t2"],
    actualScore: null,
    createdAt: "2026-10-01T09:00:00.000Z"
  },
  {
    id: "exam-003",
    subjectId: "cs-math",
    name: "Advanced Mathematics — Internal Examination",
    date: "2026-11-22",
    time: "01:30 PM",
    notes: "Linear algebra foundations, Matrix decompositions, Probability distributions, and Multivariate calculus.",
    moduleIds: ["math-m1", "math-m2", "math-m3", "math-m4"],
    completedModuleIds: [],
    completedTopicIds: ["math-m1-t1"],
    actualScore: null,
    createdAt: "2026-10-01T09:00:00.000Z"
  },
  {
    id: "exam-004",
    subjectId: "cs-ml",
    name: "Machine Learning — Internal Examination",
    date: "2026-11-25",
    time: "10:00 AM",
    notes: "Supervised learning algorithms, Linear & Logistic regression, Decision trees, and Evaluation metrics.",
    moduleIds: ["ml-m1", "ml-m2", "ml-m3", "ml-m4"],
    completedModuleIds: [],
    completedTopicIds: ["ml-m1-t1", "ml-m1-t2"],
    actualScore: null,
    createdAt: "2026-10-01T09:00:00.000Z"
  }
];

const EXAM_STORAGE_KEY = "studysense_exams_v2";

/**
 * Calculate dynamic countdown values for an exam date.
 * Handles:
 * - Exam today (0 days)
 * - 1 day remaining / Tomorrow
 * - N days remaining
 * - Exam completed (past dates, never negative)
 * 
 * @param {string} examDate - YYYY-MM-DD
 * @returns {Object} { daysRemaining, statusText, isPast, isToday }
 */
export function calculateExamCountdown(examDate) {
  if (!examDate) {
    return { daysRemaining: 0, statusText: "No date set", isPast: false, isToday: false };
  }
  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);

  let targetMid;
  if (typeof examDate === "string" && examDate.includes("-")) {
    const parts = examDate.split("T")[0].split("-").map(Number);
    targetMid = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  } else {
    const t = new Date(examDate);
    targetMid = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0, 0);
  }

  const diffMs = targetMid.getTime() - todayMid.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      daysRemaining: 0,
      statusText: "Exam completed",
      isPast: true,
      isToday: false
    };
  } else if (diffDays === 0) {
    return {
      daysRemaining: 0,
      statusText: "Exam today",
      isPast: false,
      isToday: true
    };
  } else if (diffDays === 1) {
    return {
      daysRemaining: 1,
      statusText: "1 day remaining",
      isPast: false,
      isToday: false
    };
  } else {
    return {
      daysRemaining: diffDays,
      statusText: `${diffDays} days remaining`,
      isPast: false,
      isToday: false
    };
  }
}

/**
 * Get all stored exams from localStorage enriched with dynamic countdown
 * @returns {Array} Array of exam objects
 */
export function getExams() {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return INITIAL_EXAMS.map((e) => ({
        ...e,
        ...calculateExamCountdown(e.date)
      }));
    }
    const raw = window.localStorage.getItem(EXAM_STORAGE_KEY);
    if (!raw) {
      return INITIAL_EXAMS.map((e) => ({
        ...e,
        ...calculateExamCountdown(e.date)
      }));
    }
    const parsed = JSON.parse(raw);
    let list = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_EXAMS;

    // Filter out obsolete automated test artifacts if present in local cache
    list = list.filter(
      (e) =>
        e &&
        !e.name?.includes("Test Exam") &&
        !e.name?.includes("Responsiveness") &&
        !e.name?.includes("Single Module Exam") &&
        !e.name?.includes("Two Modules Exam") &&
        !e.id?.startsWith("exam-cs-cn-") &&
        !e.id?.startsWith("exam-cs-se-") &&
        !e.id?.startsWith("exam-cs-math-") &&
        !e.id?.startsWith("exam-cs-ml-")
    );
    if (list.length === 0) {
      list = INITIAL_EXAMS;
    }

    return list.map((e) => ({
      ...e,
      ...calculateExamCountdown(e.date)
    }));
  } catch (err) {
    return INITIAL_EXAMS.map((e) => ({
      ...e,
      ...calculateExamCountdown(e.date)
    }));
  }
}

/**
 * Save a newly added exam
 * @param {Object} examData
 * @param {string} examData.subjectId - Required subject ID from syllabus
 * @param {string} examData.name - Exam title
 * @param {string} examData.date - YYYY-MM-DD
 * @param {string} [examData.time] - e.g. "10:00 AM"
 * @param {string} [examData.notes] - Additional notes/revision targets
 * @returns {Object} Saved exam
 */
export function saveExam(examData) {
  const current = getExams();
  const sub = SUBJECTS.find((s) => s.id === (examData.subjectId || examData.subject_id)) || SUBJECTS[0];

  const newExam = {
    id: examData.id || `exam-${Date.now()}`,
    subjectId: examData.subjectId || examData.subject_id || sub.id,
    subjectCode: sub?.code || "",
    subjectName: sub?.name || "",
    name: examData.name || `${sub?.name || "Subject"} Exam`,
    date: examData.date || (examData.exam_datetime ? examData.exam_datetime.split("T")[0] : new Date().toISOString().split("T")[0]),
    time: examData.time || "10:00 AM",
    notes: examData.notes || "",
    moduleIds: examData.moduleIds || examData.module_ids || [],
    completedModuleIds: examData.completedModuleIds || examData.completed_module_ids || [],
    actualScore: examData.actualScore !== undefined ? examData.actualScore : (examData.actual_score ?? null),
    createdAt: examData.createdAt || new Date().toISOString()
  };

  const updated = [newExam, ...current.filter((e) => e.id !== newExam.id)];
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {}

  return {
    ...newExam,
    ...calculateExamCountdown(newExam.date)
  };
}

/**
 * Update an existing exam
 * @param {string} examId
 * @param {Object} partialUpdates
 * @returns {Array} Updated exams list
 */
export function updateExam(examId, partialUpdates) {
  const current = getExams();
  const updated = current.map((item) => {
    if (item.id === examId) {
      const merged = { ...item, ...partialUpdates };
      const subId = partialUpdates.subjectId || partialUpdates.subject_id || item.subjectId;
      if (subId && subId !== item.subjectId) {
        const sub = SUBJECTS.find((s) => s.id === subId);
        if (sub) {
          merged.subjectId = sub.id;
          merged.subjectCode = sub.code;
          merged.subjectName = sub.name;
        }
      }
      if (partialUpdates.moduleIds || partialUpdates.module_ids) {
        merged.moduleIds = partialUpdates.moduleIds || partialUpdates.module_ids;
      }
      if (partialUpdates.completedModuleIds || partialUpdates.completed_module_ids) {
        merged.completedModuleIds = partialUpdates.completedModuleIds || partialUpdates.completed_module_ids;
      }
      if (partialUpdates.actualScore !== undefined || partialUpdates.actual_score !== undefined) {
        merged.actualScore = partialUpdates.actualScore !== undefined ? partialUpdates.actualScore : partialUpdates.actual_score;
      }
      return merged;
    }
    return item;
  });

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {}

  return updated.map((e) => ({
    ...e,
    ...calculateExamCountdown(e.date)
  }));
}

/**
 * Delete an exam
 * @param {string} examId
 * @returns {Array} Remaining exams list
 */
export function deleteExam(examId) {
  const current = getExams();
  const updated = current.filter((item) => item.id !== examId);

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {}

  return updated.map((e) => ({
    ...e,
    ...calculateExamCountdown(e.date)
  }));
}

/**
 * Re-export centralized activity tracking functions
 */
export {
  saveActivity,
  getActivities,
  startActiveSession,
  stopActiveSession,
  recordCompletedActivity,
  getTopicStudyTime,
  getSubjectStudyTime,
  getWeeklyStudyTime,
  getStudyTimeBreakdown
} from "./activityService.js";


