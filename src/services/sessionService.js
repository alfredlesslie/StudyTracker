/**
 * StudySense AI - Centralized Study Sessions Service
 * 
 * Logs actual active study sessions to the backend database and retrieves summary statistics.
 * Authoritative source: Backend Database.
 * Local fallback: LocalStorage via storageService.
 */

import { apiGet, apiPost } from "./apiClient.js";
import { getStudySessions, saveStudySession as saveSessionLocal } from "./storageService.js";

/**
 * Normalizes any study session (backend snake_case or frontend camelCase)
 * into a consistent, robust frontend model with both sets of attributes.
 * 
 * @param {Object} raw
 * @returns {Object} normalized session
 */
export function normalizeStudySession(raw) {
  if (!raw) return null;
  const now = new Date();
  const nowIso = now.toISOString();
  const todayStr = nowIso.split("T")[0];

  const startedAt = raw.started_at || raw.startTime || raw.createdAt || nowIso;
  
  // Extract date correctly: handle YYYY-MM-DD from raw.date, ISO strings with 'T', or SQLite strings with ' '
  let date = null;
  if (raw.date && typeof raw.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.date)) {
    date = raw.date;
  } else if (startedAt && typeof startedAt === "string") {
    const candidate = startedAt.split("T")[0].split(" ")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
      date = candidate;
    }
  } else if (startedAt instanceof Date) {
    date = startedAt.toISOString().split("T")[0];
  }
  if (!date) {
    date = todayStr;
  }

  let durationMinutes = 0;
  if (raw.durationMinutes !== undefined && raw.durationMinutes !== null) {
    durationMinutes = Number(raw.durationMinutes) || 0;
  } else if (raw.active_duration_seconds !== undefined && raw.active_duration_seconds !== null) {
    durationMinutes = Math.round((Number(raw.active_duration_seconds) || 0) / 60);
  } else if (raw.activeDurationSeconds !== undefined && raw.activeDurationSeconds !== null) {
    durationMinutes = Math.round((Number(raw.activeDurationSeconds) || 0) / 60);
  }

  const activeDurationSeconds =
    raw.active_duration_seconds !== undefined && raw.active_duration_seconds !== null
      ? Number(raw.active_duration_seconds)
      : Math.round(durationMinutes * 60);

  const topicId = raw.topicId || raw.topic_id || null;
  const subjectId = raw.subjectId || raw.subject_id || "cs-cn";
  const moduleId = raw.moduleId || raw.module_id || null;
  const taskId = raw.taskId || raw.task_id || null;
  const sessionType = raw.sessionType || raw.activity_type || raw.type || "focus";
  const completed = raw.completed !== false;

  return {
    id: raw.id || `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    studentId: raw.studentId || raw.student_id || "student-001",
    topicId,
    subjectId,
    moduleId,
    taskId,
    startTime: raw.startTime || startedAt,
    endTime: raw.endTime || raw.ended_at || null,
    durationMinutes,
    plannedDuration: Number(raw.plannedDuration || raw.planned_duration) || durationMinutes || 25,
    completed,
    difficulty: raw.difficulty || "okay",
    confidence: raw.confidence || "somewhat_confident",
    sessionType,
    date,
    notes: raw.notes || null,

    // Backend compatibility attributes
    topic_id: topicId,
    subject_id: subjectId,
    module_id: moduleId,
    task_id: taskId,
    activity_type: sessionType,
    started_at: startedAt,
    ended_at: raw.ended_at || raw.endTime || null,
    active_duration_seconds: activeDurationSeconds
  };
}

/**
 * Fetch study sessions from backend or fallback to local storage
 * @param {Object} [filters] - { subject_id, topic_id, activity_type, limit }
 * @returns {Promise<Array>}
 */
export async function getStudySessionsAsync(filters = {}) {
  const res = await apiGet("/api/study-sessions", filters);
  if (res.ok && Array.isArray(res.data)) {
    return res.data.map(normalizeStudySession);
  }
  return getStudySessions().map(normalizeStudySession);
}

/**
 * Log an active study session to the backend database, also caching locally
 * @param {Object} sessionData
 * @returns {Promise<Object>}
 */
export async function logStudySessionAsync(sessionData) {
  // Always update local storage cache for offline responsiveness
  const localSaved = saveSessionLocal(sessionData);

  const payload = {
    id: localSaved.id,
    topic_id: sessionData.topicId || sessionData.topic_id || null,
    subject_id: sessionData.subjectId || sessionData.subject_id || null,
    activity_type: sessionData.type || sessionData.sessionType || sessionData.activity_type || "learn",
    started_at: sessionData.startTime || sessionData.started_at || new Date().toISOString(),
    ended_at: sessionData.endTime || sessionData.ended_at || null,
    active_duration_seconds: Math.round(
      (sessionData.durationMinutes || (sessionData.activeDurationSeconds ? sessionData.activeDurationSeconds / 60 : 1)) * 60
    ),
    completed: sessionData.completed !== false,
    confidence: sessionData.confidence || null,
    difficulty: sessionData.difficulty || null,
    notes: sessionData.notes || (sessionData.taskId ? `Task: ${sessionData.taskId}` : null)
  };

  const res = await apiPost("/api/study-sessions", payload);
  if (res.ok && res.data) {
    const normalized = normalizeStudySession({ ...localSaved, ...res.data });
    return normalized;
  }
  // Return local saved session with offline indicator
  return normalizeStudySession({ ...localSaved, synced: false, syncError: res.error });
}

/**
 * Fetch study session summary metrics from backend
 * @returns {Promise<Object>}
 */
export async function getStudySessionsSummaryAsync() {
  const res = await apiGet("/api/study-sessions/summary");
  if (res.ok && res.data) {
    return res.data;
  }

  // Calculate local fallback summary
  const sessions = getStudySessions();
  const totalSec = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0) * 60, 0);
  return {
    student_id: "student-001",
    total_active_seconds: totalSec,
    total_active_minutes: Math.round(totalSec / 60),
    total_sessions_count: sessions.length,
    by_activity_type: {},
    by_subject: {}
  };
}
