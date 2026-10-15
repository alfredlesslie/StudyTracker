/**
 * StudySense AI - Centralized Syllabus Service
 * 
 * Fetches curriculum subjects, modules, and topics from the backend REST API
 * with transparent fallback to local syllabus constants when backend is offline.
 * Backend database is the authoritative source of truth.
 */

import { apiGet } from "./apiClient.js";
import { SUBJECTS as LOCAL_SUBJECTS, TOPICS as LOCAL_TOPICS } from "../data/syllabus.js";

/**
 * Fetch all 4 subjects
 * @returns {Promise<Array>}
 */
export async function getSubjectsAsync() {
  const res = await apiGet("/api/subjects");
  if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
    return res.data;
  }
  return LOCAL_SUBJECTS;
}

/**
 * Fetch topics for a specific subject
 * @param {string} subjectId
 * @returns {Promise<Array>}
 */
export async function getSubjectTopicsAsync(subjectId) {
  const res = await apiGet(`/api/subjects/${subjectId}/topics`);
  if (res.ok && Array.isArray(res.data)) {
    return res.data;
  }
  return LOCAL_TOPICS.filter((t) => t.subjectId === subjectId);
}

/**
 * Fetch a single topic by ID
 * @param {string} topicId
 * @returns {Promise<Object>}
 */
export async function getTopicAsync(topicId) {
  const res = await apiGet(`/api/topics/${topicId}`);
  if (res.ok && res.data) {
    return res.data;
  }
  return LOCAL_TOPICS.find((t) => t.id === topicId) || null;
}
