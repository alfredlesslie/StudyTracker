/**
 * StudySense AI - Centralized Progress Service
 * 
 * Synchronizes topic completion, mastery, and quiz performance metrics with the database.
 * Authoritative source: Backend Database.
 * Fallback / Offline cache: LocalStorage.
 */

import { apiGet, apiPut } from "./apiClient.js";
import { getTopics } from "./storageService.js";

/**
 * Fetch topic progress records from backend or fallback to local storage
 * @param {string} [subjectId]
 * @returns {Promise<Array>}
 */
export async function getProgressAsync(subjectId = null) {
  const query = subjectId ? { subject_id: subjectId } : {};
  const res = await apiGet("/api/progress", query);
  if (res.ok && Array.isArray(res.data)) {
    return res.data;
  }
  return getTopics();
}

/**
 * Update topic progress on the server and update local cache
 * @param {string} topicId
 * @param {Object} updateData - { completion, mastery, status, quiz_attempts, average_quiz_score }
 * @returns {Promise<Object>}
 */
export async function updateTopicProgressAsync(topicId, updateData) {
  const res = await apiPut(`/api/topics/${topicId}/progress`, updateData);
  if (res.ok) {
    return res.data;
  }
  // If backend rejected or was offline, report error without claiming successful remote save
  return { error: res.error, localFallback: true };
}
