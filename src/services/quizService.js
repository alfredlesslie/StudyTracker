/**
 * StudySense AI - Centralized Quiz Service
 * 
 * Submits quiz attempts to the backend database and retrieves historical attempts.
 * Supports mixed-module exam practice quiz generation grounded strictly in selected modules.
 * Authoritative source: Backend Database.
 * Local fallback: LocalStorage via storageService.
 * Includes in-flight de-duplication to prevent accidental double-clicks.
 */

import { apiGet, apiPost } from "./apiClient.js";
import { getQuizAttempts, saveQuizAttempt as saveQuizLocal } from "./storageService.js";
import { TOPICS, SUBJECTS, MODULES } from "../data/syllabus.js";
import { QUESTION_BANK } from "../data/questionBank.js";

// In-flight submission tracking to prevent duplicate rapid submissions
const _recentSubmissions = new Map();

/**
 * Normalize quiz attempt object so that both camelCase and snake_case properties
 * are always consistently populated, regardless of whether the record came from
 * FastAPI backend or LocalStorage.
 * @param {Object} raw
 * @returns {Object}
 */
export function normalizeQuizAttempt(raw) {
  if (!raw || typeof raw !== "object") return raw;

  const examId = raw.examId || raw.exam_id || null;
  const topicId = raw.topicId || raw.topic_id || null;
  const subjectId = raw.subjectId || raw.subject_id || null;
  const moduleId = raw.moduleId || raw.module_id || null;
  const totalQuestions = Number(raw.totalQuestions ?? raw.total_questions ?? 5);
  const score = Number(raw.score ?? 0);
  const percentage = Number(
    raw.percentage ?? (totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0)
  );
  const attemptedAt = raw.attemptedAt || raw.attempted_at || raw.date || new Date().toISOString();
  const date = raw.date || (typeof attemptedAt === "string" ? attemptedAt.split("T")[0] : new Date().toISOString().split("T")[0]);

  let answers = raw.answers;
  if ((!answers || answers.length === 0) && raw.answers_json) {
    try {
      answers = typeof raw.answers_json === "string" ? JSON.parse(raw.answers_json) : raw.answers_json;
    } catch (e) {
      answers = [];
    }
  }

  let moduleScope = raw.moduleScope || raw.module_scope;
  if (!moduleScope && raw.module_scope_json) {
    try {
      moduleScope = typeof raw.module_scope_json === "string" ? JSON.parse(raw.module_scope_json) : raw.module_scope_json;
    } catch (e) {
      moduleScope = [];
    }
  }

  let moduleResults = raw.moduleResults || raw.module_results;
  if (!moduleResults && raw.module_results_json) {
    try {
      moduleResults = typeof raw.module_results_json === "string" ? JSON.parse(raw.module_results_json) : raw.module_results_json;
    } catch (e) {
      moduleResults = {};
    }
  }

  return {
    ...raw,
    // Unified camelCase properties
    examId,
    topicId,
    subjectId,
    moduleId,
    totalQuestions,
    score,
    percentage,
    attemptedAt,
    date,
    answers: Array.isArray(answers) ? answers : [],
    moduleScope: Array.isArray(moduleScope) ? moduleScope : [],
    moduleResults: moduleResults || {},
    // Unified snake_case properties for backend compatibility
    exam_id: examId,
    topic_id: topicId,
    subject_id: subjectId,
    module_id: moduleId,
    total_questions: totalQuestions,
    attempted_at: attemptedAt,
    duration_seconds: Number(raw.duration_seconds ?? raw.durationSeconds ?? 0)
  };
}

/**
 * Fetch quiz attempts history from backend or fallback to local storage
 * @param {Object} [filters] - { topic_id, subject_id, exam_id, limit }
 * @returns {Promise<Array>}
 */
export async function getQuizHistoryAsync(filters = {}) {
  const params = {};
  if (filters.topicId || filters.topic_id) params.topic_id = filters.topicId || filters.topic_id;
  if (filters.subjectId || filters.subject_id) params.subject_id = filters.subjectId || filters.subject_id;
  if (filters.examId || filters.exam_id) params.exam_id = filters.examId || filters.exam_id;
  if (filters.limit) params.limit = filters.limit;

  const res = await apiGet("/api/quizzes/history", params);
  if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
    return res.data.map(normalizeQuizAttempt);
  }

  // Local fallback
  const local = getQuizAttempts();
  const normalizedLocal = local.map(normalizeQuizAttempt);
  if (filters.examId || filters.exam_id) {
    const targetExamId = filters.examId || filters.exam_id;
    return normalizedLocal.filter((q) => q.examId === targetExamId || q.exam_id === targetExamId);
  }
  if (filters.topicId || filters.topic_id) {
    const targetTopicId = filters.topicId || filters.topic_id;
    return normalizedLocal.filter((q) => q.topicId === targetTopicId);
  }
  if (filters.subjectId || filters.subject_id) {
    const targetSubId = filters.subjectId || filters.subject_id;
    return normalizedLocal.filter((q) => q.subjectId === targetSubId);
  }
  return normalizedLocal;
}

/**
 * Submit a completed quiz attempt to the backend database, also caching locally.
 * Prevents rapid duplicate submissions and scopes correctly by exam and module.
 * @param {Object} attemptData
 * @returns {Promise<Object>}
 */
export async function submitQuizAttemptAsync(attemptData) {
  const examId = attemptData.examId || attemptData.exam_id || null;
  const topicId = attemptData.topicId || attemptData.topic_id || null;
  const dedupKey = `${examId || topicId}_${attemptData.score}_${attemptData.totalQuestions}_${attemptData.percentage}`;
  const now = Date.now();

  if (_recentSubmissions.has(dedupKey) && now - _recentSubmissions.get(dedupKey) < 3500) {
    console.warn("[QuizService] Duplicate rapid submission suppressed for:", dedupKey);
    return normalizeQuizAttempt({ duplicate: true, localFallback: true, id: `suppressed-${now}` });
  }
  _recentSubmissions.set(dedupKey, now);

  // Save locally first to guarantee no data loss on network failure
  const localSaved = saveQuizLocal(attemptData);

  const payload = {
    id: localSaved.id,
    student_id: attemptData.studentId || "student-001",
    topic_id: topicId,
    subject_id: attemptData.subjectId || attemptData.subject_id || null,
    exam_id: examId,
    score: Number(attemptData.score),
    total_questions: Number(attemptData.totalQuestions || 5),
    duration_seconds: Number(attemptData.durationSeconds || 0),
    percentage: Number(
      attemptData.percentage ??
      Math.round((attemptData.score / (attemptData.totalQuestions || 1)) * 100)
    ),
    difficulty: attemptData.difficulty || "medium",
    format: attemptData.format || "Quick Practice",
    answers_json: attemptData.answers ? JSON.stringify(attemptData.answers) : null,
    module_scope_json: attemptData.moduleScopeJson
      ? (typeof attemptData.moduleScopeJson === "string" ? attemptData.moduleScopeJson : JSON.stringify(attemptData.moduleScopeJson))
      : (attemptData.moduleScope ? JSON.stringify(attemptData.moduleScope) : null),
    module_results_json: attemptData.moduleResultsJson
      ? (typeof attemptData.moduleResultsJson === "string" ? attemptData.moduleResultsJson : JSON.stringify(attemptData.moduleResultsJson))
      : (attemptData.moduleResults ? JSON.stringify(attemptData.moduleResults) : null)
  };

  const res = await apiPost("/api/quizzes/attempts", payload);
  if (res.ok && res.data) {
    return normalizeQuizAttempt({ ...localSaved, ...res.data, synced: true });
  }
  return normalizeQuizAttempt({ ...localSaved, synced: false, syncError: res.error });
}

/**
 * Generate a mixed-module practice quiz strictly scoped to an exam's selected modules.
 * Grounded in the official KTU syllabus.
 * Distributes questions across selected modules evenly.
 * Avoids repeating questions from previous attempts where possible.
 * 
 * @param {Object} options
 * @param {Object} options.exam - The exam object containing id, subjectId, moduleIds
 * @param {number} [options.count=10] - Number of questions (5, 10, or 15)
 * @param {Array<string>} [options.excludeQuestionIds=[]] - Question IDs seen in earlier attempts
 * @returns {Promise<Object>} { exam, questions, totalQuestions, modulesRepresented, questionPoolNote }
 */
export async function generateExamPracticeQuizAsync({ exam, count = 10, excludeQuestionIds = [] }) {
  if (!exam || !exam.id) {
    throw new Error("A valid exam must be specified to generate practice questions.");
  }

  const requestedCount = Math.max(3, Math.min(25, Number(count) || 10));
  const excludeStr = (excludeQuestionIds || []).filter(Boolean).join(",");

  // 1. Try Backend Generation endpoint first
  try {
    const url = `/api/exams/${exam.id}/practice-quiz/generate?count=${requestedCount}${excludeStr ? `&exclude_ids=${encodeURIComponent(excludeStr)}` : ""}`;
    const res = await apiPost(url, {});
    if (res.ok && res.data && Array.isArray(res.data.questions) && res.data.questions.length > 0) {
      return res.data;
    }
  } catch (err) {
    console.warn("[QuizService] Backend quiz generation unavailable, falling back to local curriculum bank:", err);
  }

  // 2. Client-side grounded fallback strictly scoped to exam modules
  const subId = exam.subjectId || exam.subject_id;
  const rawModules = exam.moduleIds || exam.module_ids || [];
  const validSubjectModules = MODULES.filter((m) => m.subjectId === subId);
  const selectedModuleIds = rawModules.length > 0
    ? rawModules.filter((id) => validSubjectModules.some((m) => m.id === id))
    : validSubjectModules.map((m) => m.id);

  if (selectedModuleIds.length === 0) {
    throw new Error("The exam has no valid modules selected.");
  }

  // Topics strictly in selected modules
  const scopeTopics = TOPICS.filter(
    (t) => t.subjectId === subId && selectedModuleIds.includes(t.moduleId)
  );

  if (scopeTopics.length === 0) {
    throw new Error("No syllabus topics found for the selected module scope.");
  }

  // Calculate even distribution across selected modules
  const numModules = selectedModuleIds.length;
  const basePerMod = Math.floor(requestedCount / numModules);
  const remainder = requestedCount % numModules;

  const modQuotas = {};
  selectedModuleIds.forEach((modId, idx) => {
    modQuotas[modId] = basePerMod + (idx < remainder ? 1 : 0);
  });

  const excludedSet = new Set(excludeQuestionIds || []);
  const generatedQuestions = [];
  let repeatedCount = 0;

  selectedModuleIds.forEach((modId) => {
    const quota = modQuotas[modId] || 0;
    const modTopics = scopeTopics.filter((t) => t.moduleId === modId);
    if (modTopics.length === 0) return;

    const modObj = MODULES.find((m) => m.id === modId);
    const modOrder = modObj ? modObj.order : modId.split("-m")[1] || 1;

    // 1. Check existing questions in QUESTION_BANK for these topics
    const seedQs = QUESTION_BANK.filter(
      (q) => q.moduleId === modId && q.subjectId === subId
    );
    const unseenSeeds = seedQs.filter((q) => !excludedSet.has(q.id));

    let addedForMod = 0;

    // Add unseen seed questions first
    for (const q of unseenSeeds) {
      if (addedForMod >= quota) break;
      const tObj = modTopics.find((t) => t.id === q.topicId) || modTopics[0];
      generatedQuestions.push({
        id: q.id,
        exam_id: exam.id,
        module_id: modId,
        module_number: modOrder,
        module_title: `Module ${modOrder}`,
        topic_id: q.topicId,
        topic_title: tObj.title,
        question: q.question,
        options: q.options,
        correct_answer: q.correctAnswer,
        explanation: q.explanation,
        marks: q.marks || 1,
        difficulty: q.difficulty || "medium"
      });
      excludedSet.add(q.id);
      addedForMod++;
    }

    // 2. Generate grounded curriculum questions for any remaining quota
    let topicIdx = 0;
    while (addedForMod < quota) {
      const topic = modTopics[topicIdx % modTopics.length];
      topicIdx++;

      const templateNum = (addedForMod % 4) + 1;
      const baseId = `gen-${exam.id}-${topic.id}-t${templateNum}`;
      let qid = baseId;
      let varNum = 1;

      while (excludedSet.has(qid) && varNum < 8) {
        qid = `${baseId}-v${varNum}`;
        varNum++;
      }

      if (excludedSet.has(qid)) {
        repeatedCount++;
        qid = `${baseId}-inst-${Date.now()}-${addedForMod}`;
      }
      excludedSet.add(qid);

      let qText = "";
      let opts = [];
      let correct = 0;
      let exp = "";

      if (templateNum === 1) {
        qText = `What is the primary architectural purpose of ${topic.title} in ${exam.subjectName || "this subject"}?`;
        opts = [
          `Defines operational protocols, structural bounds, and functional execution for ${topic.title}.`,
          "Operates exclusively in legacy non-networked environments without validation.",
          "Bypasses operating system memory bounds to reduce compute cycles.",
          "Completely eliminates the requirement for system verification or error handling."
        ];
        correct = 0;
        exp = `${topic.title} provides structured algorithmic and design principles to ensure reliable system operation as covered in the KTU syllabus.`;
      } else if (templateNum === 2) {
        qText = `Which of the following is an essential design constraint or consideration when implementing ${topic.title}?`;
        opts = [
          "Ignoring all boundary parameters and corner conditions to maximize throughput.",
          `Modularity, parameter validation, and adherence to standard specifications for ${topic.title}.`,
          "Hardcoding fixed buffer addresses directly into hardware drivers.",
          "Disabling transaction rollbacks and consistency checks."
        ];
        correct = 1;
        exp = `Rigorous engineering implementations of ${topic.title} require strict boundary checking and modular specification compliance.`;
      } else if (templateNum === 3) {
        qText = `In university examination patterns, what core requirement is typically tested regarding ${topic.title}?`;
        opts = [
          "Writing proprietary binary machine code directly onto bare silicon.",
          `Defining key concepts, analyzing algorithmic trade-offs, and solving analytical problems on ${topic.title}.`,
          "Guessing unverified heuristic bounds without mathematical proof.",
          "Memorizing random dictionary definitions with no technical context."
        ];
        correct = 1;
        exp = `Academic evaluations of ${topic.title} focus on conceptual definitions, working mechanisms, step-by-step algorithms, and comparative trade-offs.`;
      } else {
        qText = `True or False: The performance characteristics of ${topic.title} depend directly on resource bounds and input complexity.`;
        opts = ["True", "False"];
        correct = 0;
        exp = `True. Real-world systems implementing ${topic.title} must account for compute complexity, memory bounds, and latency bounds.`;
      }

      generatedQuestions.push({
        id: qid,
        exam_id: exam.id,
        module_id: modId,
        module_number: modOrder,
        module_title: `Module ${modOrder}`,
        topic_id: topic.id,
        topic_title: topic.title,
        question: qText,
        options: opts,
        correct_answer: correct,
        explanation: exp,
        marks: 1,
        difficulty: topic.difficulty || "medium"
      });
      addedForMod++;
    }
  });

  // Interleave and shuffle questions so modules are cleanly mixed
  for (let i = generatedQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [generatedQuestions[i], generatedQuestions[j]] = [generatedQuestions[j], generatedQuestions[i]];
  }

  const varietyWarning = repeatedCount > 0
    ? "Some questions may repeat as the question pool for these selected modules has been extensively practiced."
    : null;

  return {
    exam_id: exam.id,
    exam_name: exam.name,
    subject_id: subId,
    selected_module_ids: selectedModuleIds,
    questions: generatedQuestions,
    total_questions: generatedQuestions.length,
    modules_represented: Array.from(new Set(generatedQuestions.map((q) => q.module_id))),
    question_pool_note: varietyWarning
  };
}
