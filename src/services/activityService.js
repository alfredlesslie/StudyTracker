/**
 * StudySense AI - Centralized Activity Tracking Service
 * 
 * Tracks meaningful learning time across all 4 learning modalities:
 * 1. Learn ("learn") - Reading and interacting with syllabus topic lessons
 * 2. AI Tutor ("ai_tutor") - Asking questions, reviewing concepts and explanations
 * 3. Practice / Quiz ("practice") - Testing understanding and reviewing mistakes
 * 4. Focus ("focus") - Dedicated Pomodoro study sessions
 * 
 * Features & Guarantees:
 * - Active Time Only: Listens to mouse/keyboard/scroll/touch and tab visibility.
 *   Pauses when user is inactive > 60 seconds or tab is hidden.
 * - Prevents Overlapping Sessions: Only 1 active session runs at a time.
 * - Non-Overlapping Aggregation: Aggregated study time merges overlapping intervals
 *   to ensure zero double-counting.
 * - Preserves granular behavioral activity for future ML datasets.
 */

const STORAGE_KEYS = {
  ACTIVITIES: "studysense_activities_v2"
};

import { apiPost } from "./apiClient.js";

// Inactivity threshold in milliseconds (60 seconds of zero interaction = idle/pause)
const INACTIVITY_THRESHOLD_MS = 60 * 1000;

// Internal active tracker state (singleton in browser memory)
let activeTracker = {
  isRunning: false,
  session: null, // { id, type, subjectId, moduleId, topicId, startTime, date }
  lastActiveTimestamp: Date.now(),
  accumulatedActiveMs: 0,
  isIdle: false,
  timerInterval: null
};

// Event listeners attachment flag
let listenersAttached = false;

/**
 * Handle user interactions to mark activity and resume active counting
 */
function onUserInteraction() {
  const now = Date.now();
  if (activeTracker.isRunning) {
    if (activeTracker.isIdle) {
      // User returned from idle
      activeTracker.isIdle = false;
      activeTracker.lastActiveTimestamp = now;
    } else {
      // Add elapsed time since last active touch if under threshold
      const elapsed = now - activeTracker.lastActiveTimestamp;
      if (elapsed > 0 && elapsed <= INACTIVITY_THRESHOLD_MS) {
        activeTracker.accumulatedActiveMs += elapsed;
      }
      activeTracker.lastActiveTimestamp = now;
    }
  }
}

/**
 * Handle visibility change (tab hidden/visible)
 */
function onVisibilityChange() {
  if (typeof document === "undefined") return;
  if (document.hidden) {
    // Tab lost focus - immediately pause active accumulation
    activeTracker.isIdle = true;
  } else {
    // Tab regained focus - reset timestamp, wait for user interaction to resume
    activeTracker.lastActiveTimestamp = Date.now();
  }
}

/**
 * Attach global browser listeners once
 */
function attachActivityListeners() {
  if (listenersAttached || typeof window === "undefined") return;
  const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
  events.forEach((evt) => {
    window.addEventListener(evt, onUserInteraction, { passive: true });
  });
  document.addEventListener("visibilitychange", onVisibilityChange);
  listenersAttached = true;
}

/**
 * Start periodic ticker to detect inactivity timeouts
 */
function startTrackerInterval() {
  if (activeTracker.timerInterval) clearInterval(activeTracker.timerInterval);
  activeTracker.timerInterval = setInterval(() => {
    if (!activeTracker.isRunning || activeTracker.isIdle) return;
    const now = Date.now();
    const elapsed = now - activeTracker.lastActiveTimestamp;
    if (elapsed > INACTIVITY_THRESHOLD_MS) {
      // User has been idle for more than threshold
      activeTracker.isIdle = true;
    } else if (elapsed > 0) {
      activeTracker.accumulatedActiveMs += 1000;
    }
  }, 1000);
}

const _today = new Date().toISOString().split("T")[0];
const _yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
const _twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split("T")[0];

export const INITIAL_ACTIVITIES = [
  // Today's activities
  {
    id: "act-init-1",
    type: "focus",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    topicId: "cn-m2-t2",
    startTime: `${_today}T09:00:00Z`,
    endTime: `${_today}T09:45:00Z`,
    durationMinutes: 45,
    date: _today,
    createdAt: `${_today}T09:45:00Z`
  },
  {
    id: "act-init-2",
    type: "learn",
    subjectId: "cs-ml",
    moduleId: "ml-m2",
    topicId: "ml-m2-t1",
    startTime: `${_today}T10:00:00Z`,
    endTime: `${_today}T10:40:00Z`,
    durationMinutes: 40,
    date: _today,
    createdAt: `${_today}T10:40:00Z`
  },
  {
    id: "act-init-3",
    type: "ai_tutor",
    subjectId: "cs-ml",
    moduleId: "ml-m2",
    topicId: "ml-m2-t1",
    startTime: `${_today}T10:45:00Z`,
    endTime: `${_today}T11:05:00Z`,
    durationMinutes: 20,
    date: _today,
    createdAt: `${_today}T11:05:00Z`
  },
  {
    id: "act-init-4",
    type: "practice",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    topicId: "cn-m1-t1",
    startTime: `${_today}T11:15:00Z`,
    endTime: `${_today}T11:40:00Z`,
    durationMinutes: 25,
    date: _today,
    createdAt: `${_today}T11:40:00Z`
  },
  // Yesterday's activities
  {
    id: "act-init-5",
    type: "focus",
    subjectId: "cs-math",
    moduleId: "math-m3",
    topicId: "math-m3-t3",
    startTime: `${_yesterday}T14:00:00Z`,
    endTime: `${_yesterday}T14:45:00Z`,
    durationMinutes: 45,
    date: _yesterday,
    createdAt: `${_yesterday}T14:45:00Z`
  },
  {
    id: "act-init-6",
    type: "learn",
    subjectId: "cs-se",
    moduleId: "se-m1",
    topicId: "se-m1-t1",
    startTime: `${_yesterday}T15:00:00Z`,
    endTime: `${_yesterday}T15:40:00Z`,
    durationMinutes: 40,
    date: _yesterday,
    createdAt: `${_yesterday}T15:40:00Z`
  },
  {
    id: "act-init-7",
    type: "practice",
    subjectId: "cs-se",
    moduleId: "se-m1",
    topicId: "se-m1-t3",
    startTime: `${_yesterday}T16:00:00Z`,
    endTime: `${_yesterday}T16:25:00Z`,
    durationMinutes: 25,
    date: _yesterday,
    createdAt: `${_yesterday}T16:25:00Z`
  },
  {
    id: "act-init-8",
    type: "ai_tutor",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    topicId: "cn-m2-t2",
    startTime: `${_yesterday}T16:30:00Z`,
    endTime: `${_yesterday}T16:45:00Z`,
    durationMinutes: 15,
    date: _yesterday,
    createdAt: `${_yesterday}T16:45:00Z`
  },
  // 2 days ago activities
  {
    id: "act-init-9",
    type: "learn",
    subjectId: "cs-math",
    moduleId: "math-m1",
    topicId: "math-m1-t1",
    startTime: `${_twoDaysAgo}T09:00:00Z`,
    endTime: `${_twoDaysAgo}T09:40:00Z`,
    durationMinutes: 40,
    date: _twoDaysAgo,
    createdAt: `${_twoDaysAgo}T09:40:00Z`
  }
];

/**
 * Get all stored activity records from localStorage
 * @returns {Array} Array of activity objects
 */
export function getActivities() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return INITIAL_ACTIVITIES;
    const raw = window.localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!raw) return INITIAL_ACTIVITIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ACTIVITIES;
  } catch (err) {
    console.warn("Failed to load activities from storage:", err);
    return INITIAL_ACTIVITIES;
  }
}

/**
 * Save an activity record to localStorage
 * @param {Object} activity
 * @returns {Object} Saved activity record
 */
export function saveActivity(activity) {
  const current = getActivities();
  const now = new Date();
  const dateStr = activity.date || now.toISOString().split("T")[0];

  const record = {
    id: activity.id || `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    subjectId: activity.subjectId || null,
    moduleId: activity.moduleId || null,
    topicId: activity.topicId || null,
    type: activity.type || "learn", // "learn" | "ai_tutor" | "practice" | "focus"
    startTime: activity.startTime || now.toISOString(),
    endTime: activity.endTime || now.toISOString(),
    durationMinutes: Math.max(1, Math.round(Number(activity.durationMinutes) || 1)),
    date: dateStr,
    createdAt: activity.createdAt || now.toISOString()
  };

  const updated = [record, ...current];
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn("Failed to save activity:", err);
  }

  // Synchronize to backend database
  apiPost("/api/study-sessions", {
    id: record.id,
    topic_id: record.topicId || null,
    subject_id: record.subjectId || null,
    activity_type: record.type || "learn",
    active_duration_seconds: Math.round(record.durationMinutes * 60),
    started_at: record.startTime,
    ended_at: record.endTime,
    completed: true
  }).catch(() => {});

  return record;
}

/**
 * Start an active study tracking session.
 * Automatically stops/flushes any existing active session to prevent double-counting.
 * 
 * @param {string} type - "learn" | "ai_tutor" | "practice" | "focus"
 * @param {Object} context - { subjectId, moduleId, topicId }
 */
export function startActiveSession(type, context = {}) {
  attachActivityListeners();

  // If a session is already running of the SAME type and topic, don't restart it
  if (
    activeTracker.isRunning &&
    activeTracker.session &&
    activeTracker.session.type === type &&
    activeTracker.session.topicId === context.topicId
  ) {
    activeTracker.lastActiveTimestamp = Date.now();
    activeTracker.isIdle = false;
    return;
  }

  // If another session was running, flush and stop it first (Prevents overlap)
  if (activeTracker.isRunning) {
    stopActiveSession();
  }

  const startTime = new Date().toISOString();
  activeTracker = {
    isRunning: true,
    session: {
      type: type || "learn",
      subjectId: context.subjectId || null,
      moduleId: context.moduleId || null,
      topicId: context.topicId || null,
      startTime: startTime,
      date: startTime.split("T")[0]
    },
    lastActiveTimestamp: Date.now(),
    accumulatedActiveMs: 0,
    isIdle: false,
    timerInterval: null
  };

  startTrackerInterval();
}

/**
 * Stop and flush current active tracking session to persistent storage.
 * Discards negligible sessions (< 15 seconds) to avoid spamming tiny records.
 * @returns {Object|null} Saved record or null if duration was negligible
 */
export function stopActiveSession() {
  if (!activeTracker.isRunning || !activeTracker.session) return null;

  if (activeTracker.timerInterval) {
    clearInterval(activeTracker.timerInterval);
    activeTracker.timerInterval = null;
  }

  const endTime = new Date().toISOString();
  const session = activeTracker.session;
  const totalActiveMs = activeTracker.accumulatedActiveMs;

  activeTracker.isRunning = false;
  activeTracker.session = null;
  activeTracker.accumulatedActiveMs = 0;
  activeTracker.isIdle = false;

  // If active time was less than 15 seconds, don't record to avoid tiny clutter
  if (totalActiveMs < 15 * 1000) {
    return null;
  }

  const durationMinutes = Math.max(1, Math.round(totalActiveMs / (60 * 1000)));

  return saveActivity({
    type: session.type,
    subjectId: session.subjectId,
    moduleId: session.moduleId,
    topicId: session.topicId,
    startTime: session.startTime,
    endTime: endTime,
    durationMinutes: durationMinutes,
    date: session.date
  });
}

/**
 * Directly record a completed activity (e.g. Focus Pomodoro completed or Quiz completed)
 * @param {Object} params
 */
export function recordCompletedActivity({
  type,
  subjectId,
  moduleId,
  topicId,
  startTime,
  endTime,
  durationMinutes,
  date
}) {
  // If active session was running, stop it
  if (activeTracker.isRunning) {
    stopActiveSession();
  }

  const now = new Date();
  const finalDuration = Math.max(1, Math.round(Number(durationMinutes) || 1));
  const finalDate = date || now.toISOString().split("T")[0];

  return saveActivity({
    type: type || "focus",
    subjectId: subjectId || null,
    moduleId: moduleId || null,
    topicId: topicId || null,
    startTime: startTime || now.toISOString(),
    endTime: endTime || now.toISOString(),
    durationMinutes: finalDuration,
    date: finalDate
  });
}

/**
 * Merge overlapping time intervals to calculate actual non-overlapping total minutes.
 * Prevents double-counting if two activities took place at the same time.
 * @param {Array} activities
 * @returns {number} Non-overlapping active minutes
 */
export function calculateNonOverlappingMinutes(activities) {
  if (!activities || activities.length === 0) return 0;

  const validIntervals = [];

  for (const act of activities) {
    const s = new Date(act.startTime).getTime();
    const e = new Date(act.endTime).getTime();
    if (!isNaN(s) && !isNaN(e) && e > s) {
      validIntervals.push([s, e]);
    } else {
      // Fallback: estimate from durationMinutes
      const durMs = (act.durationMinutes || 1) * 60 * 1000;
      const refTime = !isNaN(s) ? s : Date.now();
      validIntervals.push([refTime - durMs, refTime]);
    }
  }

  if (validIntervals.length === 0) {
    return activities.reduce((sum, a) => sum + (Number(a.durationMinutes) || 0), 0);
  }

  // Sort intervals by start time
  validIntervals.sort((a, b) => a[0] - b[0]);

  // Merge overlapping ranges
  const merged = [validIntervals[0]];
  for (let i = 1; i < validIntervals.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = validIntervals[i];
    if (curr[0] <= prev[1]) {
      // Overlap: extend end time
      prev[1] = Math.max(prev[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }

  // Sum merged ranges
  const totalMs = merged.reduce((sum, [start, end]) => sum + (end - start), 0);
  return Math.max(0, Math.round(totalMs / (60 * 1000)));
}

/**
 * Get total study time for a specific topic across all activity types
 * @param {string} topicId
 * @returns {number} Study minutes
 */
export function getTopicStudyTime(topicId) {
  const activities = getActivities().filter((a) => a.topicId === topicId);
  return calculateNonOverlappingMinutes(activities);
}

/**
 * Get total study time for a specific subject
 * @param {string} subjectId
 * @returns {number} Study minutes
 */
export function getSubjectStudyTime(subjectId) {
  const activities = getActivities().filter((a) => a.subjectId === subjectId);
  return calculateNonOverlappingMinutes(activities);
}

/**
 * Get daily study time for a specific date (defaults to today)
 * @param {string} [dateStr] - YYYY-MM-DD
 * @returns {number} Study minutes
 */
export function getDailyStudyTime(dateStr = null) {
  const targetDate = dateStr || new Date().toISOString().split("T")[0];
  let sessionMins = 0;
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = window.localStorage.getItem("studysense_sessions_v2");
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list)) {
          sessionMins = list
            .filter((s) => {
              if (s.completed === false) return false;
              let sDate = s.date;
              if (!sDate) {
                const rawStart = s.started_at || s.startTime || s.createdAt;
                if (rawStart && typeof rawStart === "string") {
                  const part = rawStart.split("T")[0].split(" ")[0];
                  if (/^\d{4}-\d{2}-\d{2}$/.test(part)) sDate = part;
                }
              }
              return sDate === targetDate;
            })
            .reduce((sum, s) => sum + (Number(s.durationMinutes) || Math.round((s.active_duration_seconds || 0) / 60)), 0);
        }
      }
    }
  } catch (e) {}
  const activities = getActivities().filter((a) => a.date === targetDate);
  const actMins = calculateNonOverlappingMinutes(activities);
  return Math.max(sessionMins, actMins);
}

/**
 * Get weekly study time between two dates
 * @param {string} [startDate] - YYYY-MM-DD
 * @param {string} [endDate] - YYYY-MM-DD
 * @returns {number} Study minutes
 */
export function getWeeklyStudyTime(startDate = null, endDate = null) {
  const activities = getActivities();
  let start = startDate;
  let end = endDate;

  if (!start || !end) {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diffToMonday));
    monday.setHours(0, 0, 0, 0);
    start = monday.toISOString().split("T")[0];
    end = new Date().toISOString().split("T")[0];
  }

  const filtered = activities.filter((a) => a.date >= start && a.date <= end);
  return calculateNonOverlappingMinutes(filtered);
}

/**
 * Get study time breakdown by modality (Learn, AI Tutor, Practice, Focus)
 * @param {string} [subjectId] - Optional subject filter
 * @param {string} [dateStr] - Optional date filter
 * @returns {Object} { learnMinutes, aiTutorMinutes, practiceMinutes, focusMinutes, totalMinutes }
 */
export function getStudyTimeBreakdown(subjectId = null, dateStr = null) {
  let activities = getActivities();

  if (subjectId) {
    activities = activities.filter((a) => a.subjectId === subjectId);
  }
  if (dateStr) {
    activities = activities.filter((a) => a.date === dateStr);
  }

  let learnMinutes = 0;
  let aiTutorMinutes = 0;
  let practiceMinutes = 0;
  let focusMinutes = 0;

  activities.forEach((a) => {
    const mins = Number(a.durationMinutes) || 0;
    switch (a.type) {
      case "learn":
        learnMinutes += mins;
        break;
      case "ai_tutor":
        aiTutorMinutes += mins;
        break;
      case "practice":
        practiceMinutes += mins;
        break;
      case "focus":
        focusMinutes += mins;
        break;
      default:
        learnMinutes += mins;
        break;
    }
  });

  const totalMinutes = calculateNonOverlappingMinutes(activities);

  return {
    learnMinutes,
    aiTutorMinutes,
    practiceMinutes,
    focusMinutes,
    totalMinutes
  };
}
