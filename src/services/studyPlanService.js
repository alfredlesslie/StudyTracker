/**
 * StudySense AI - Centralized Study Plan Service
 * 
 * Provides CRUD operations for study plans and scheduled tasks connected to the backend database.
 * Authoritative source: Backend Database.
 * Local fallback: LocalStorage via storageService.
 */

import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient.js";
import {
  getStudyTasks as getLocalTasks,
  saveStudyTask as saveLocalTask,
  updateStudyTask as updateLocalTask,
  deleteStudyTask as deleteLocalTask,
  normalizeStudyTask
} from "./storageService.js";

/**
 * Fetch study plans with scheduled items from backend, converting backend plan items
 * to normalized frontend study tasks. Fallback to local tasks if backend is offline.
 * @returns {Promise<Array>} Normalized tasks array
 */
export async function getStudyPlansAsync() {
  const res = await apiGet("/api/study-plans");
  if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
    const extractedTasks = [];
    res.data.forEach((plan) => {
      (plan.items || []).forEach((item) => {
        const dateStr = item.planned_datetime
          ? item.planned_datetime.split("T")[0]
          : new Date().toISOString().split("T")[0];
        const timeStr = item.planned_datetime && item.planned_datetime.includes("T")
          ? item.planned_datetime.split("T")[1].substring(0, 5)
          : "19:00";

        extractedTasks.push(
          normalizeStudyTask({
            id: item.id,
            planId: plan.id,
            topicId: item.topic_id,
            subjectId: item.subject_id,
            title: item.title,
            date: dateStr,
            startTime: timeStr,
            durationMinutes: item.planned_duration_minutes,
            status: item.status || "pending",
            notes: item.notes || "",
            completedAt: item.completed_at
          })
        );
      });
    });

    if (extractedTasks.length > 0) {
      return extractedTasks;
    }
  }
  return getLocalTasks();
}

/**
 * Synchronize full list of study tasks with backend study plan.
 * Uses existing backend plan or creates a new one.
 * @param {Array} tasks
 * @returns {Promise<Object>}
 */
export async function syncStudyPlanAsync(tasks) {
  const itemsPayload = (tasks || []).map((item) => {
    const dateStr = item.date || new Date().toISOString().split("T")[0];
    const timeStr = item.startTime || item.time || "19:00";
    return {
      id: item.id,
      topic_id: item.topicId || null,
      subject_id: item.subjectId || null,
      title: item.title || item.topicTitle || "Study Session",
      planned_datetime: `${dateStr}T${timeStr.includes(":") ? timeStr : "19:00"}:00Z`,
      planned_duration_minutes: Math.max(1, Number(item.durationMinutes || item.duration || 25)),
      status: item.status || "pending",
      notes: item.notes || ""
    };
  });

  const payload = {
    title: "Semester V Study Plan",
    items: itemsPayload
  };

  const listRes = await apiGet("/api/study-plans");
  if (listRes.ok && Array.isArray(listRes.data) && listRes.data.length > 0) {
    const planId = listRes.data[0].id;
    const putRes = await apiPut(`/api/study-plans/${planId}`, payload);
    if (putRes.ok) return putRes.data;
  } else {
    const postRes = await apiPost("/api/study-plans", payload);
    if (postRes.ok) return postRes.data;
  }

  return { synced: false, localItems: tasks };
}

/**
 * Create a new study plan with scheduled items
 * @param {Object} planData - { title, items }
 * @returns {Promise<Object>}
 */
export async function createStudyPlanAsync(planData) {
  const payload = {
    title: planData.title || "Daily Study Plan",
    items: (planData.items || []).map((item) => ({
      id: item.id,
      topic_id: item.topicId || null,
      subject_id: item.subjectId || null,
      title: item.title || item.topicTitle || "Study Session",
      planned_datetime: item.plannedDatetime || `${item.date || new Date().toISOString().split("T")[0]}T${item.startTime || item.time || "19:00"}:00Z`,
      planned_duration_minutes: Math.max(1, Number(item.durationMinutes || item.duration || 25)),
      status: item.status || "pending",
      notes: item.notes || ""
    }))
  };

  const res = await apiPost("/api/study-plans", payload);
  if (res.ok) {
    return res.data;
  }

  (planData.items || []).forEach(saveLocalTask);
  return { ...planData, id: `local-plan-${Date.now()}`, synced: false, syncError: res.error };
}

/**
 * Update an existing study plan
 * @param {string} planId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateStudyPlanAsync(planId, updates) {
  const res = await apiPut(`/api/study-plans/${planId}`, updates);
  if (res.ok) {
    return res.data;
  }
  return { ...updates, id: planId, synced: false, syncError: res.error };
}

/**
 * Delete a study plan
 * @param {string} planId
 * @returns {Promise<boolean>}
 */
export async function deleteStudyPlanAsync(planId) {
  const res = await apiDelete(`/api/study-plans/${planId}`);
  return res.ok;
}
