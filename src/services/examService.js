/**
 * StudySense AI - Centralized Exam Service
 * 
 * Provides CRUD operations for examinations connected to the backend database.
 * Authoritative source: Backend Database.
 * Local fallback: LocalStorage via storageService.
 */

import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient.js";
import {
  getExams as getLocalExams,
  saveExam as saveLocalExam,
  updateExam as updateLocalExam,
  deleteExam as deleteLocalExam,
  calculateExamCountdown
} from "./storageService.js";

/**
 * Normalizes an exam record ensuring consistent property names
 * across frontend (camelCase) and backend (snake_case).
 * @param {Object} data 
 * @returns {Object}
 */
export function normalizeExam(data) {
  if (!data) return data;
  const examDatetime = data.exam_datetime || (data.date ? `${data.date}T10:00:00Z` : "");
  const date = (data.exam_datetime || data.date || "").split("T")[0];
  const subjectId = data.subject_id || data.subjectId || "cs-cn";
  const moduleIds = data.module_ids || data.moduleIds || [];
  const completedModuleIds = data.completed_module_ids || data.completedModuleIds || [];
  const completedTopicIds = data.completed_topic_ids || data.completedTopicIds || [];
  const actualScore = data.actual_score !== undefined ? data.actual_score : (data.actualScore !== undefined ? data.actualScore : null);

  return {
    ...data,
    id: data.id,
    subjectId,
    subject_id: subjectId,
    subjectCode: data.subject_code || data.subjectCode || "",
    subjectName: data.subject_name || data.subjectName || "",
    name: data.name || "Subject Exam",
    date,
    examDatetime,
    exam_datetime: examDatetime,
    notes: data.notes || "",
    moduleIds,
    module_ids: moduleIds,
    completedModuleIds,
    completed_module_ids: completedModuleIds,
    completedTopicIds,
    completed_topic_ids: completedTopicIds,
    actualScore,
    actual_score: actualScore,
    ...calculateExamCountdown(date)
  };
};

/**
 * Fetch all exams from backend or fallback to local storage
 * @returns {Promise<Array>}
 */
export async function getExamsAsync() {
  const res = await apiGet("/api/exams");
  if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
    return res.data.map(normalizeExam);
  }
  return getLocalExams().map(normalizeExam);
}

/**
 * Create a new examination
 * @param {Object} examData
 * @returns {Promise<Object>}
 */
export async function createExamAsync(examData) {
  const localSaved = saveLocalExam(examData);

  const payload = {
    id: localSaved.id,
    subject_id: examData.subjectId || examData.subject_id,
    name: examData.name || "Subject Exam",
    exam_datetime: examData.examDatetime || `${examData.date || new Date().toISOString().split("T")[0]}T10:00:00Z`,
    notes: examData.notes || "",
    module_ids: examData.moduleIds || examData.module_ids || [],
    completed_module_ids: examData.completedModuleIds || examData.completed_module_ids || [],
    completed_topic_ids: examData.completedTopicIds || examData.completed_topic_ids || []
  };

  const res = await apiPost("/api/exams", payload);
  if (res.ok && res.data) {
    return normalizeExam(res.data);
  }
  return normalizeExam({ ...localSaved, synced: false, syncError: res.error });
}

/**
 * Update an existing examination
 * @param {string} examId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateExamAsync(examId, updates) {
  const localUpdated = updateLocalExam(examId, updates);

  const payload = {
    subject_id: updates.subjectId || updates.subject_id,
    name: updates.name,
    exam_datetime: updates.date ? `${updates.date}T10:00:00Z` : (updates.examDatetime || updates.exam_datetime),
    notes: updates.notes,
    module_ids: updates.moduleIds || updates.module_ids,
    completed_module_ids: updates.completedModuleIds || updates.completed_module_ids,
    completed_topic_ids: updates.completedTopicIds || updates.completed_topic_ids
  };

  const res = await apiPut(`/api/exams/${examId}`, payload);
  if (res.ok && res.data) {
    return normalizeExam(res.data);
  }
  const fallback = localUpdated.find((e) => e.id === examId) || updates;
  return normalizeExam(fallback);
}

/**
 * Toggle module completion status for an exam
 * @param {string} examId
 * @param {string} moduleId
 * @param {boolean} [completed]
 * @returns {Promise<Object>}
 */
export async function toggleExamModuleCompletionAsync(examId, moduleId, completed = undefined) {
  // Update local storage representation
  const localExams = getLocalExams();
  const existing = localExams.find((e) => e.id === examId);
  let updatedCompleted = [];

  if (existing) {
    const prev = existing.completedModuleIds || existing.completed_module_ids || [];
    const isNowCompleted = completed !== undefined ? completed : !prev.includes(moduleId);
    if (isNowCompleted) {
      updatedCompleted = Array.from(new Set([...prev, moduleId]));
    } else {
      updatedCompleted = prev.filter((id) => id !== moduleId);
    }
    updateLocalExam(examId, {
      completedModuleIds: updatedCompleted,
      completed_module_ids: updatedCompleted
    });
  }

  // Persist to backend database
  const res = await apiPut(`/api/exams/${examId}/toggle-module-completion`, {
    module_id: moduleId,
    completed: completed
  });

  if (res.ok && res.data) {
    return normalizeExam(res.data);
  }

  return normalizeExam(existing ? { ...existing, completedModuleIds: updatedCompleted } : null);
}

/**
 * Toggle topic completion status for an exam
 * @param {string} examId
 * @param {string} topicId
 * @param {boolean} [completed]
 * @returns {Promise<Object>}
 */
export async function toggleExamTopicCompletionAsync(examId, topicId, completed = undefined) {
  // Update local storage representation
  const localExams = getLocalExams();
  const existing = localExams.find((e) => e.id === examId);
  let updatedCompleted = [];

  if (existing) {
    const prev = existing.completedTopicIds || existing.completed_topic_ids || [];
    const isNowCompleted = completed !== undefined ? completed : !prev.includes(topicId);
    if (isNowCompleted) {
      updatedCompleted = Array.from(new Set([...prev, topicId]));
    } else {
      updatedCompleted = prev.filter((id) => id !== topicId);
    }
    updateLocalExam(examId, {
      completedTopicIds: updatedCompleted,
      completed_topic_ids: updatedCompleted
    });
  }

  // Persist to backend database
  const res = await apiPut(`/api/exams/${examId}/toggle-topic-completion`, {
    topic_id: topicId,
    completed: completed
  });

  if (res.ok && res.data) {
    return normalizeExam(res.data);
  }

  return normalizeExam(existing ? { ...existing, completedTopicIds: updatedCompleted } : null);
}

/**
 * Retrieve scope analysis for an examination
 * @param {string} examId
 * @returns {Promise<Object|null>}
 */
export async function getExamScopeAnalysisAsync(examId) {
  const res = await apiGet(`/api/exams/${examId}/scope-analysis`);
  if (res.ok && res.data) {
    return res.data;
  }
  return null;
}

/**
 * Delete an examination
 * @param {string} examId
 * @returns {Promise<boolean>}
 */
export async function deleteExamAsync(examId) {
  deleteLocalExam(examId);
  const res = await apiDelete(`/api/exams/${examId}`);
  return res.ok;
}

/**
 * Record actual verified exam score achieved by the student (0-100)
 * @param {string} examId
 * @param {number} actualScore
 * @returns {Promise<Object>}
 */
export async function recordExamActualScoreAsync(examId, actualScore) {
  const numericScore = parseFloat(actualScore);
  const clampedScore = Math.max(0, Math.min(100, isNaN(numericScore) ? 0 : numericScore));
  
  // Update local copy as well
  updateLocalExam(examId, { actualScore: clampedScore, actual_score: clampedScore });

  const res = await apiPut(`/api/exams/${examId}/actual-score`, {
    actual_score: clampedScore
  });

  if (res.ok && res.data) {
    return normalizeExam(res.data);
  }
  return normalizeExam({ id: examId, actual_score: clampedScore, synced: false, syncError: res.error });
}


