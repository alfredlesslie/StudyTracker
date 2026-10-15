/**
 * StudySense AI - Centralized Prediction Service
 * 
 * Interacts with backend ML prediction endpoints for genuine score estimates.
 * Respects strict data sufficiency rules: never fabricates or hallucinates numbers.
 */

import { apiGet, apiPost } from "./apiClient.js";

/**
 * Fetch genuine prediction history from the backend database
 * @param {string} [subjectId]
 * @returns {Promise<Array>}
 */
export async function getPredictionHistoryAsync(subjectId = null) {
  const query = subjectId ? { subject_id: subjectId } : {};
  const res = await apiGet("/api/predictions", query);
  if (res.ok && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

/**
 * Generate or retrieve genuine prediction for a specific subject
 * @param {string} subjectId
 * @param {string} [examId]
 * @returns {Promise<Object>}
 */
export async function getSubjectPredictionAsync(subjectId, examId = null) {
  const query = examId ? { exam_id: examId } : {};
  const res = await apiGet(`/api/predictions/subject/${subjectId}`, query);
  if (res.ok && res.data) {
    return res.data;
  }
  return {
    available: false,
    subject_id: subjectId,
    data_status: "error",
    message: res.error || "Unable to reach prediction service.",
    predicted_score: null
  };
}

/**
 * Direct feature prediction preserving Prompt 9 microservice API contract
 * @param {Object} featureRecord
 * @returns {Promise<Object>}
 */
export async function predictFeaturesDirectAsync(featureRecord) {
  const res = await apiPost("/predict", featureRecord);
  if (res.ok && res.data) {
    return res.data;
  }
  return {
    error: res.error || "Prediction request failed",
    predictedScore: null
  };
}
