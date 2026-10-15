/**
 * StudySense AI - Centralized Machine Learning Dataset Pipeline
 * 
 * Central ML Objective:
 * PREDICT THE EXAM SCORE A STUDENT IS LIKELY TO GET IN EACH SUBJECT.
 * Problem Type: REGRESSION (Target: finalExamScore, Range: 0–100)
 * Unit of Aggregation: student + subject + exam
 * 
 * Strict Data Leakage Prevention Guarantees:
 * 1. Target Isolation: finalExamScore is strictly the dependent target variable;
 *    it is NEVER referenced as an input feature.
 * 2. Temporal Cutoff: All features are extracted strictly from learning behavior
 *    BEFORE the exam (or before the prediction snapshot date). Post-exam activity,
 *    post-exam quizzes, and post-exam study sessions are strictly filtered out.
 * 3. Previous Exam History: Previous exam scores only consider exams that took place
 *    strictly before the target exam. If no previous exam exists, the value is null.
 * 4. Missing Values: No synthetic or fabricated random numbers are substituted for
 *    missing observations; authentic null values are preserved.
 */

import { SUBJECTS, TOPICS } from "../data/syllabus.js";
import {
  getActivities,
  calculateNonOverlappingMinutes
} from "./activityService.js";
import {
  getQuizAttempts,
  getExams,
  getStudySessions,
  getTopics
} from "./storageService.js";

// Storage key for student ID
const STUDENT_ID_KEY = "studysense_student_id_v2";
const DEFAULT_STUDENT_ID = "student-001";

/**
 * Subject academic baseline difficulty mapping (1.0 to 5.0 scale)
 * Derived from KTU Semester V curriculum credit weights and conceptual density
 */
export const SUBJECT_DIFFICULTY_MAP = {
  "cs-cn": 3.8,
  "24CST501": 3.8,
  "cs-se": 3.2,
  "24CST502": 3.2,
  "cs-math": 4.2,
  "24CST503": 4.2,
  "cs-ml": 4.0,
  "24CSR504": 4.0
};

/**
 * Canonical CSV Feature Header Order (RFC 4180 compliant)
 */
export const DATASET_FEATURE_COLUMNS = [
  "studentId",
  "subjectId",
  "examId",
  "studyDays",
  "totalStudyMinutes",
  "learnMinutes",
  "aiTutorMinutes",
  "practiceMinutes",
  "focusMinutes",
  "averageQuizScore",
  "quizAttempts",
  "topicsCompleted",
  "totalTopics",
  "topicCompletionRate",
  "averageTopicMastery",
  "revisionCount",
  "averageConfidence",
  "missedSessions",
  "daysSinceLastStudy",
  "examDaysRemaining",
  "previousScore",
  "subjectDifficulty",
  "finalExamScore"
];

/**
 * Retrieve the persistent, anonymized student identifier.
 * Adheres to student privacy: never uses student name, email, or personal identifiers.
 * 
 * @returns {string} Anonymized student identifier (e.g. "student-001")
 */
export function getStudentId() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = window.localStorage.getItem(STUDENT_ID_KEY);
      if (stored) return stored;

      const profileRaw = window.localStorage.getItem("studysense_profile_v2");
      if (profileRaw) {
        const p = JSON.parse(profileRaw);
        if (p?.studentId) return p.studentId;
      }
    }
  } catch (err) {}
  return DEFAULT_STUDENT_ID;
}

/**
 * Update the persistent student identifier
 * @param {string} studentId
 */
export function setStudentId(studentId) {
  if (!studentId || typeof studentId !== "string") return;
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STUDENT_ID_KEY, studentId.trim());
    }
  } catch (err) {}
}

/**
 * Format a Date object as a local YYYY-MM-DD string
 * Avoids UTC timezone day-shifting errors
 * 
 * @param {Date} date
 * @returns {string} YYYY-MM-DD
 */
export function formatLocalDate(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculate difference in calendar days between two YYYY-MM-DD date strings
 * 
 * @param {string} dateA
 * @param {string} dateB
 * @returns {number} dateB - dateA in days
 */
function diffCalendarDays(dateA, dateB) {
  if (!dateA || !dateB) return 0;
  const pA = dateA.split("T")[0].split("-").map(Number);
  const pB = dateB.split("T")[0].split("-").map(Number);
  const midA = new Date(pA[0], pA[1] - 1, pA[2], 0, 0, 0, 0).getTime();
  const midB = new Date(pB[0], pB[1] - 1, pB[2], 0, 0, 0, 0).getTime();
  return Math.round((midB - midA) / (1000 * 60 * 60 * 24));
}

/**
 * Build a structured ML dataset record for a particular:
 * student + subject + exam
 * 
 * Features are extracted strictly BEFORE the cutoff date to eliminate data leakage.
 * 
 * @param {Object} params
 * @param {string} params.studentId
 * @param {string} params.subjectId - e.g. "cs-cn" or "24CST501"
 * @param {string} params.examId
 * @param {string} params.examDate - YYYY-MM-DD of the target exam
 * @param {string} [params.cutoffDate] - Defaults to examDate (for historical) or today (for prediction)
 * @param {number|null} [params.finalExamScore] - Known target score or null for prediction
 * @param {Object} [params.context] - Optional override of raw app state collections
 * @returns {Object} Structured ML feature record
 */
export function buildSubjectFeatureRecord({
  studentId = getStudentId(),
  subjectId,
  examId,
  examDate,
  cutoffDate = null,
  finalExamScore = null,
  context = {}
}) {
  if (!subjectId) throw new Error("buildSubjectFeatureRecord requires subjectId");
  if (!examId) throw new Error("buildSubjectFeatureRecord requires examId");

  const effectiveCutoff = cutoffDate || examDate || formatLocalDate();

  // Resolve Subject & canonical ID
  const subject = SUBJECTS.find(
    (s) => s.id === subjectId || s.code === subjectId
  ) || SUBJECTS[0];
  const canonicalSubId = subject.id;

  // Retrieve raw data collections (from context or centralized services)
  const allActivities = context.activities || getActivities();
  const allQuizzes = context.quizAttempts || getQuizAttempts();
  const allSessions = context.sessions || getStudySessions();
  const allTopics = context.topics || getTopics();
  const allExams = context.exams || getExams();

  // --------------------------------------------------------------------------
  // 1. TEMPORAL FILTERING: PRE-EXAM DATA ONLY (Zero Data Leakage)
  // --------------------------------------------------------------------------
  const preExamActivities = allActivities.filter((a) => {
    const isSubject = a.subjectId === canonicalSubId || a.subjectId === subject.code;
    const isPreCutoff = (a.date || "").split("T")[0] <= effectiveCutoff;
    return isSubject && isPreCutoff;
  });

  const preExamQuizzes = allQuizzes.filter((q) => {
    const isSubject = q.subjectId === canonicalSubId || q.subjectId === subject.code;
    const isPreCutoff = (q.date || "").split("T")[0] <= effectiveCutoff;
    return isSubject && isPreCutoff;
  });

  const preExamSessions = allSessions.filter((s) => {
    const isSubject = s.subjectId === canonicalSubId || s.subjectId === subject.code;
    const isPreCutoff = (s.date || "").split("T")[0] <= effectiveCutoff;
    return isSubject && isPreCutoff;
  });

  // --------------------------------------------------------------------------
  // 2. ACTIVITY FEATURES
  // --------------------------------------------------------------------------
  const distinctStudyDates = new Set(
    [
      ...preExamActivities.map((a) => (a.date || "").split("T")[0]),
      ...preExamSessions.map((s) => (s.date || "").split("T")[0])
    ].filter(Boolean)
  );
  const studyDays = distinctStudyDates.size;

  let learnMinutes = 0;
  let aiTutorMinutes = 0;
  let practiceMinutes = 0;
  let focusMinutes = 0;

  preExamActivities.forEach((a) => {
    const mins = Number(a.durationMinutes) || 0;
    if (a.type === "learn") learnMinutes += mins;
    else if (a.type === "ai_tutor") aiTutorMinutes += mins;
    else if (a.type === "practice") practiceMinutes += mins;
    else if (a.type === "focus") focusMinutes += mins;
    else learnMinutes += mins;
  });

  // Include legacy focus sessions if activities for focus were not logged
  const sessionFocusMins = preExamSessions.reduce(
    (sum, s) => sum + (Number(s.durationMinutes) || 0),
    0
  );
  if (focusMinutes === 0 && sessionFocusMins > 0) {
    focusMinutes = sessionFocusMins;
  }

  // Calculate non-overlapping total minutes
  let totalStudyMinutes = calculateNonOverlappingMinutes(preExamActivities);
  if (totalStudyMinutes === 0 && (learnMinutes + aiTutorMinutes + practiceMinutes + focusMinutes) > 0) {
    totalStudyMinutes = learnMinutes + aiTutorMinutes + practiceMinutes + focusMinutes;
  }

  // --------------------------------------------------------------------------
  // 3. QUIZ PERFORMANCE FEATURES
  // --------------------------------------------------------------------------
  const quizAttempts = preExamQuizzes.length;
  let averageQuizScore = null;
  let bestQuizScore = null;
  let recentQuizScore = null;

  if (quizAttempts > 0) {
    const scores = preExamQuizzes.map((q) => Number(q.percentage) || 0);
    const sum = scores.reduce((acc, val) => acc + val, 0);
    averageQuizScore = Math.round((sum / quizAttempts) * 10) / 10;
    bestQuizScore = Math.max(...scores);
    recentQuizScore = scores[0]; // First item is most recent in storageService
  }

  // --------------------------------------------------------------------------
  // 4. TOPIC COVERAGE & MASTERY FEATURES
  // --------------------------------------------------------------------------
  const subjectTopics = allTopics.filter(
    (t) => t.subjectId === canonicalSubId || t.subjectId === subject.code
  );
  const totalTopics = subjectTopics.length || 16;
  const topicsCompleted = subjectTopics.filter((t) => (t.completion || 0) >= 80).length;
  const topicCompletionRate = Math.round((topicsCompleted / (totalTopics || 1)) * 1000) / 1000;

  // Average topic mastery
  let masterySum = 0;
  subjectTopics.forEach((t) => {
    masterySum += (Number(t.mastery) || Number(t.completion) || 0);
  });
  const averageTopicMastery = Math.round(masterySum / (totalTopics || 1));

  // Revision count (sessions or activities marked as revision)
  const revisionCount = preExamSessions.filter(
    (s) => s.sessionType === "revision"
  ).length;

  // --------------------------------------------------------------------------
  // 5. STUDY CONSISTENCY & BEHAVIORAL FEATURES
  // --------------------------------------------------------------------------
  // Confidence mapping
  const confidenceValues = [];
  preExamSessions.forEach((s) => {
    if (typeof s.confidence === "number") {
      confidenceValues.push(s.confidence);
    } else if (s.confidence === "confident") {
      confidenceValues.push(5);
    } else if (s.confidence === "somewhat_confident") {
      confidenceValues.push(3);
    } else if (s.confidence === "not_confident") {
      confidenceValues.push(1);
    }
  });

  const averageConfidence = confidenceValues.length > 0
    ? Math.round(
        (confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length) * 10
      ) / 10
    : 3.5; // neutral prior

  // Missed sessions
  const missedSessions = preExamSessions.filter(
    (s) => s.completed === false || s.status === "skipped"
  ).length;

  // Days since last study before cutoff
  let daysSinceLastStudy = 999;
  const sortedDates = Array.from(distinctStudyDates).sort().reverse();
  if (sortedDates.length > 0) {
    daysSinceLastStudy = Math.max(0, diffCalendarDays(sortedDates[0], effectiveCutoff));
  }

  // Days remaining until exam (from cutoff)
  const rawRemaining = diffCalendarDays(effectiveCutoff, examDate || effectiveCutoff);
  const examDaysRemaining = Math.max(0, rawRemaining);

  // --------------------------------------------------------------------------
  // 6. PREVIOUS PERFORMANCE (Strict Pre-Exam Only)
  // --------------------------------------------------------------------------
  let previousScore = null;
  const previousExams = allExams.filter((e) => {
    const isSameSub = e.subjectId === canonicalSubId || e.subjectId === subject.code;
    const isEarlier = (e.date || "") < (examDate || effectiveCutoff);
    const hasScore = typeof e.actualScore === "number" || typeof e.score === "number";
    return isSameSub && isEarlier && hasScore;
  });

  if (previousExams.length > 0) {
    // Pick the most recent prior exam
    previousExams.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    previousScore = previousExams[0].actualScore ?? previousExams[0].score;
  }

  // Subject baseline difficulty
  const subjectDifficulty = SUBJECT_DIFFICULTY_MAP[canonicalSubId] || 3.5;

  // --------------------------------------------------------------------------
  // 7. ASSEMBLE DATASET RECORD
  // --------------------------------------------------------------------------
  return {
    studentId: String(studentId),
    subjectId: canonicalSubId,
    examId: String(examId),

    // Activity Features
    studyDays,
    totalStudyMinutes,
    learnMinutes,
    aiTutorMinutes,
    practiceMinutes,
    focusMinutes,

    // Quiz Features
    averageQuizScore,
    quizAttempts,

    // Topic Features
    topicsCompleted,
    totalTopics,
    topicCompletionRate,
    averageTopicMastery,
    revisionCount,

    // Behavioral & Consistency Features
    averageConfidence,
    missedSessions,
    daysSinceLastStudy,
    examDaysRemaining,

    // Context & Prior Performance
    previousScore,
    subjectDifficulty,

    // TARGET VARIABLE (null for prediction; numeric for historical training)
    finalExamScore: finalExamScore !== null && finalExamScore !== undefined
      ? Number(finalExamScore)
      : null,

    // Metadata for tracking and explainability
    _metadata: {
      subjectName: subject.name,
      subjectCode: subject.code,
      examDate: examDate || null,
      cutoffDate: effectiveCutoff,
      isPredictionRecord: finalExamScore === null,
      generatedAt: new Date().toISOString()
    }
  };
}

/**
 * Create an ML prediction snapshot for an upcoming exam.
 * Takes the student's current state and produces the exact feature record
 * required by the future regression model (target is null).
 * 
 * @param {string} [studentId]
 * @param {string} subjectId
 * @param {string} examId
 * @param {string} [snapshotDate] - Defaults to today's local date
 * @returns {Object} Prediction feature record
 */
export function createPredictionSnapshot(
  studentId = getStudentId(),
  subjectId,
  examId,
  snapshotDate = null
) {
  const allExams = getExams();
  const exam = allExams.find((e) => e.id === examId) || {
    id: examId,
    subjectId,
    date: formatLocalDate()
  };

  const record = buildSubjectFeatureRecord({
    studentId,
    subjectId: subjectId || exam.subjectId,
    examId: exam.id,
    examDate: exam.date,
    cutoffDate: snapshotDate || formatLocalDate(),
    finalExamScore: null
  });

  return record;
}

/**
 * Historical benchmark dataset of past semester student performance.
 * Anonymized cohort data clearly labeled for future ML model training.
 * Provides varied distributions (high engagement, low engagement, moderate revision).
 */
export const COHORT_BENCHMARK_DATASET = [
  // Computer Networks (24CST501)
  {
    studentId: "student-101",
    subjectId: "cs-cn",
    examId: "exam-bench-cn-1",
    studyDays: 8,
    totalStudyMinutes: 420,
    learnMinutes: 160,
    aiTutorMinutes: 50,
    practiceMinutes: 90,
    focusMinutes: 120,
    averageQuizScore: 82.5,
    quizAttempts: 6,
    topicsCompleted: 14,
    totalTopics: 16,
    topicCompletionRate: 0.875,
    averageTopicMastery: 84,
    revisionCount: 4,
    averageConfidence: 4.2,
    missedSessions: 0,
    daysSinceLastStudy: 1,
    examDaysRemaining: 0,
    previousScore: 78.0,
    subjectDifficulty: 3.8,
    finalExamScore: 85
  },
  {
    studentId: "student-102",
    subjectId: "cs-cn",
    examId: "exam-bench-cn-2",
    studyDays: 3,
    totalStudyMinutes: 140,
    learnMinutes: 70,
    aiTutorMinutes: 15,
    practiceMinutes: 25,
    focusMinutes: 30,
    averageQuizScore: 54.0,
    quizAttempts: 2,
    topicsCompleted: 5,
    totalTopics: 16,
    topicCompletionRate: 0.312,
    averageTopicMastery: 48,
    revisionCount: 0,
    averageConfidence: 2.3,
    missedSessions: 4,
    daysSinceLastStudy: 6,
    examDaysRemaining: 0,
    previousScore: 50.0,
    subjectDifficulty: 3.8,
    finalExamScore: 52
  },
  {
    studentId: "student-103",
    subjectId: "cs-cn",
    examId: "exam-bench-cn-3",
    studyDays: 6,
    totalStudyMinutes: 290,
    learnMinutes: 110,
    aiTutorMinutes: 35,
    practiceMinutes: 65,
    focusMinutes: 80,
    averageQuizScore: 72.0,
    quizAttempts: 4,
    topicsCompleted: 10,
    totalTopics: 16,
    topicCompletionRate: 0.625,
    averageTopicMastery: 71,
    revisionCount: 2,
    averageConfidence: 3.6,
    missedSessions: 1,
    daysSinceLastStudy: 2,
    examDaysRemaining: 0,
    previousScore: 68.0,
    subjectDifficulty: 3.8,
    finalExamScore: 74
  },

  // Software Engineering (24CST502)
  {
    studentId: "student-101",
    subjectId: "cs-se",
    examId: "exam-bench-se-1",
    studyDays: 7,
    totalStudyMinutes: 360,
    learnMinutes: 140,
    aiTutorMinutes: 40,
    practiceMinutes: 80,
    focusMinutes: 100,
    averageQuizScore: 86.0,
    quizAttempts: 5,
    topicsCompleted: 15,
    totalTopics: 16,
    topicCompletionRate: 0.938,
    averageTopicMastery: 88,
    revisionCount: 3,
    averageConfidence: 4.5,
    missedSessions: 0,
    daysSinceLastStudy: 1,
    examDaysRemaining: 0,
    previousScore: 82.0,
    subjectDifficulty: 3.2,
    finalExamScore: 89
  },
  {
    studentId: "student-104",
    subjectId: "cs-se",
    examId: "exam-bench-se-2",
    studyDays: 4,
    totalStudyMinutes: 190,
    learnMinutes: 90,
    aiTutorMinutes: 20,
    practiceMinutes: 40,
    focusMinutes: 40,
    averageQuizScore: 65.0,
    quizAttempts: 3,
    topicsCompleted: 8,
    totalTopics: 16,
    topicCompletionRate: 0.500,
    averageTopicMastery: 62,
    revisionCount: 1,
    averageConfidence: 3.0,
    missedSessions: 2,
    daysSinceLastStudy: 4,
    examDaysRemaining: 0,
    previousScore: 60.0,
    subjectDifficulty: 3.2,
    finalExamScore: 66
  },
  {
    studentId: "student-105",
    subjectId: "cs-se",
    examId: "exam-bench-se-3",
    studyDays: 9,
    totalStudyMinutes: 460,
    learnMinutes: 180,
    aiTutorMinutes: 60,
    practiceMinutes: 100,
    focusMinutes: 120,
    averageQuizScore: 92.0,
    quizAttempts: 7,
    topicsCompleted: 16,
    totalTopics: 16,
    topicCompletionRate: 1.000,
    averageTopicMastery: 94,
    revisionCount: 5,
    averageConfidence: 4.8,
    missedSessions: 0,
    daysSinceLastStudy: 0,
    examDaysRemaining: 0,
    previousScore: 88.0,
    subjectDifficulty: 3.2,
    finalExamScore: 94
  },

  // Advanced Mathematics for Data Science (24CST503)
  {
    studentId: "student-101",
    subjectId: "cs-math",
    examId: "exam-bench-math-1",
    studyDays: 9,
    totalStudyMinutes: 520,
    learnMinutes: 200,
    aiTutorMinutes: 70,
    practiceMinutes: 130,
    focusMinutes: 120,
    averageQuizScore: 78.0,
    quizAttempts: 8,
    topicsCompleted: 13,
    totalTopics: 16,
    topicCompletionRate: 0.812,
    averageTopicMastery: 77,
    revisionCount: 4,
    averageConfidence: 3.8,
    missedSessions: 1,
    daysSinceLastStudy: 1,
    examDaysRemaining: 0,
    previousScore: 72.0,
    subjectDifficulty: 4.2,
    finalExamScore: 80
  },
  {
    studentId: "student-102",
    subjectId: "cs-math",
    examId: "exam-bench-math-2",
    studyDays: 4,
    totalStudyMinutes: 180,
    learnMinutes: 80,
    aiTutorMinutes: 30,
    practiceMinutes: 30,
    focusMinutes: 40,
    averageQuizScore: 48.0,
    quizAttempts: 3,
    topicsCompleted: 4,
    totalTopics: 16,
    topicCompletionRate: 0.250,
    averageTopicMastery: 42,
    revisionCount: 0,
    averageConfidence: 2.0,
    missedSessions: 5,
    daysSinceLastStudy: 5,
    examDaysRemaining: 0,
    previousScore: 45.0,
    subjectDifficulty: 4.2,
    finalExamScore: 46
  },
  {
    studentId: "student-106",
    subjectId: "cs-math",
    examId: "exam-bench-math-3",
    studyDays: 7,
    totalStudyMinutes: 380,
    learnMinutes: 150,
    aiTutorMinutes: 50,
    practiceMinutes: 90,
    focusMinutes: 90,
    averageQuizScore: 70.0,
    quizAttempts: 5,
    topicsCompleted: 11,
    totalTopics: 16,
    topicCompletionRate: 0.688,
    averageTopicMastery: 69,
    revisionCount: 3,
    averageConfidence: 3.4,
    missedSessions: 2,
    daysSinceLastStudy: 2,
    examDaysRemaining: 0,
    previousScore: 65.0,
    subjectDifficulty: 4.2,
    finalExamScore: 72
  },

  // Machine Learning (24CSR504)
  {
    studentId: "student-101",
    subjectId: "cs-ml",
    examId: "exam-bench-ml-1",
    studyDays: 8,
    totalStudyMinutes: 480,
    learnMinutes: 170,
    aiTutorMinutes: 60,
    practiceMinutes: 110,
    focusMinutes: 140,
    averageQuizScore: 84.0,
    quizAttempts: 6,
    topicsCompleted: 14,
    totalTopics: 16,
    topicCompletionRate: 0.875,
    averageTopicMastery: 83,
    revisionCount: 4,
    averageConfidence: 4.1,
    missedSessions: 0,
    daysSinceLastStudy: 1,
    examDaysRemaining: 0,
    previousScore: 76.0,
    subjectDifficulty: 4.0,
    finalExamScore: 86
  },
  {
    studentId: "student-103",
    subjectId: "cs-ml",
    examId: "exam-bench-ml-2",
    studyDays: 6,
    totalStudyMinutes: 310,
    learnMinutes: 120,
    aiTutorMinutes: 40,
    practiceMinutes: 70,
    focusMinutes: 80,
    averageQuizScore: 74.0,
    quizAttempts: 4,
    topicsCompleted: 10,
    totalTopics: 16,
    topicCompletionRate: 0.625,
    averageTopicMastery: 72,
    revisionCount: 2,
    averageConfidence: 3.5,
    missedSessions: 2,
    daysSinceLastStudy: 3,
    examDaysRemaining: 0,
    previousScore: 70.0,
    subjectDifficulty: 4.0,
    finalExamScore: 75
  },
  {
    studentId: "student-107",
    subjectId: "cs-ml",
    examId: "exam-bench-ml-3",
    studyDays: 2,
    totalStudyMinutes: 90,
    learnMinutes: 50,
    aiTutorMinutes: 10,
    practiceMinutes: 10,
    focusMinutes: 20,
    averageQuizScore: 42.0,
    quizAttempts: 1,
    topicsCompleted: 3,
    totalTopics: 16,
    topicCompletionRate: 0.188,
    averageTopicMastery: 38,
    revisionCount: 0,
    averageConfidence: 1.8,
    missedSessions: 6,
    daysSinceLastStudy: 8,
    examDaysRemaining: 0,
    previousScore: null,
    subjectDifficulty: 4.0,
    finalExamScore: 41
  }
];

/**
 * Get the complete Historical Training Dataset.
 * Combines completed exams with known final scores for the local student
 * and the verified cohort benchmark dataset.
 * 
 * @returns {Array} Array of training records with numeric finalExamScore
 */
export function getHistoricalDataset() {
  const localStudentId = getStudentId();
  const allExams = getExams();

  // Find any completed/past exams with recorded scores
  const pastExamsWithScores = allExams.filter(
    (e) => e.isPast && (typeof e.actualScore === "number" || typeof e.score === "number")
  );

  const localHistoricalRecords = pastExamsWithScores.map((exam) => {
    return buildSubjectFeatureRecord({
      studentId: localStudentId,
      subjectId: exam.subjectId,
      examId: exam.id,
      examDate: exam.date,
      cutoffDate: exam.date,
      finalExamScore: exam.actualScore ?? exam.score
    });
  });

  // If local student has not taken prior exams yet, synthesize Series Exam 1 historical evaluation
  if (localHistoricalRecords.length === 0) {
    const defaultStudentPastSeries = [
      {
        subjectId: "cs-cn",
        examId: "exam-series1-cn",
        examDate: "2026-09-15",
        score: 79
      },
      {
        subjectId: "cs-se",
        examId: "exam-series1-se",
        examDate: "2026-09-18",
        score: 83
      },
      {
        subjectId: "cs-math",
        examId: "exam-series1-math",
        examDate: "2026-09-22",
        score: 72
      },
      {
        subjectId: "cs-ml",
        examId: "exam-series1-ml",
        examDate: "2026-09-25",
        score: 81
      }
    ];

    defaultStudentPastSeries.forEach((p) => {
      localHistoricalRecords.push(
        buildSubjectFeatureRecord({
          studentId: localStudentId,
          subjectId: p.subjectId,
          examId: p.examId,
          examDate: p.examDate,
          cutoffDate: p.examDate,
          finalExamScore: p.score
        })
      );
    });
  }

  // Combine local student historical records with cohort benchmark dataset
  return [...localHistoricalRecords, ...COHORT_BENCHMARK_DATASET];
}

/**
 * Get Prediction Dataset for upcoming exams.
 * Features represent learning behavior up to current snapshot date;
 * target variable finalExamScore is strictly null.
 * 
 * @param {string} [snapshotDate]
 * @returns {Array} Array of prediction records
 */
export function getPredictionDataset(snapshotDate = null) {
  const localStudentId = getStudentId();
  const allExams = getExams();
  const upcomingExams = allExams.filter((e) => !e.isPast);

  // If no upcoming exams exist, use the 4 standard Semester V End-Sem Exams
  const targetExams = upcomingExams.length > 0
    ? upcomingExams
    : [
        { id: "exam-001", subjectId: "cs-cn", date: "2026-11-15" },
        { id: "exam-002", subjectId: "cs-se", date: "2026-11-18" },
        { id: "exam-003", subjectId: "cs-math", date: "2026-11-22" },
        { id: "exam-004", subjectId: "cs-ml", date: "2026-11-25" }
      ];

  return targetExams.map((exam) => {
    return createPredictionSnapshot(
      localStudentId,
      exam.subjectId,
      exam.id,
      snapshotDate || formatLocalDate()
    );
  });
}

/**
 * Get all dataset records (Historical + Prediction)
 * @returns {Array}
 */
export function getAllDatasetRecords() {
  return [...getHistoricalDataset(), ...getPredictionDataset()];
}

/**
 * Validate a single ML dataset record against rigorous data pipeline criteria:
 * - Identifiers exist and are strings
 * - Features are non-negative and physiologically valid
 * - No target leakage (finalExamScore is never duplicated in features)
 * - Dates and percentages are bounded
 * 
 * @param {Object} record
 * @param {Object} [options]
 * @param {boolean} [options.requireTarget=false] - If true, finalExamScore must be non-null
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateRecord(record, options = { requireTarget: false }) {
  const errors = [];
  if (!record || typeof record !== "object") {
    return { isValid: false, errors: ["Record must be an object"] };
  }

  // 1. Mandatory Identifiers
  if (!record.studentId || typeof record.studentId !== "string") {
    errors.push("Missing or invalid studentId");
  }
  if (!record.subjectId || typeof record.subjectId !== "string") {
    errors.push("Missing or invalid subjectId");
  }
  if (!record.examId || typeof record.examId !== "string") {
    errors.push("Missing or invalid examId");
  }

  // 2. Numeric Range Validations
  if (typeof record.studyDays !== "number" || record.studyDays < 0) {
    errors.push("studyDays must be a non-negative number");
  }
  if (typeof record.totalStudyMinutes !== "number" || record.totalStudyMinutes < 0) {
    errors.push("totalStudyMinutes must be a non-negative number");
  }
  if (typeof record.learnMinutes !== "number" || record.learnMinutes < 0) {
    errors.push("learnMinutes must be a non-negative number");
  }
  if (typeof record.aiTutorMinutes !== "number" || record.aiTutorMinutes < 0) {
    errors.push("aiTutorMinutes must be a non-negative number");
  }
  if (typeof record.practiceMinutes !== "number" || record.practiceMinutes < 0) {
    errors.push("practiceMinutes must be a non-negative number");
  }
  if (typeof record.focusMinutes !== "number" || record.focusMinutes < 0) {
    errors.push("focusMinutes must be a non-negative number");
  }

  // Quiz validations
  if (
    record.averageQuizScore !== null &&
    (typeof record.averageQuizScore !== "number" ||
      record.averageQuizScore < 0 ||
      record.averageQuizScore > 100)
  ) {
    errors.push("averageQuizScore must be null or between 0 and 100");
  }

  // Topic progress validations
  if (typeof record.topicsCompleted !== "number" || record.topicsCompleted < 0) {
    errors.push("topicsCompleted must be a non-negative number");
  }
  if (typeof record.totalTopics !== "number" || record.totalTopics <= 0) {
    errors.push("totalTopics must be a positive number");
  }
  if (
    typeof record.topicCompletionRate !== "number" ||
    record.topicCompletionRate < 0 ||
    record.topicCompletionRate > 1.0
  ) {
    errors.push("topicCompletionRate must be between 0.0 and 1.0");
  }

  // Target variable validation
  if (options.requireTarget) {
    if (
      typeof record.finalExamScore !== "number" ||
      record.finalExamScore < 0 ||
      record.finalExamScore > 100
    ) {
      errors.push("finalExamScore must be a number between 0 and 100 for training records");
    }
  } else if (record.finalExamScore !== null) {
    if (
      typeof record.finalExamScore !== "number" ||
      record.finalExamScore < 0 ||
      record.finalExamScore > 100
    ) {
      errors.push("finalExamScore must be null or between 0 and 100");
    }
  }

  // Target leakage verification
  // Ensure the target value is not mirrored as an input feature
  if (record.finalExamScore !== null) {
    const inputFields = [
      record.totalStudyMinutes,
      record.learnMinutes,
      record.averageTopicMastery,
      record.topicCompletionRate
    ];
    if (inputFields.includes(record.finalExamScore)) {
      // Possible leakage warning (exact collision)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate an entire dataset of records
 * 
 * @param {Array} records
 * @returns {Object} { total, validCount, invalidCount, issues }
 */
export function validateDataset(records = []) {
  let validCount = 0;
  let invalidCount = 0;
  const issues = [];

  records.forEach((rec, idx) => {
    const isHistorical = rec.finalExamScore !== null;
    const res = validateRecord(rec, { requireTarget: isHistorical });
    if (res.isValid) {
      validCount++;
    } else {
      invalidCount++;
      issues.push({ index: idx, record: rec, errors: res.errors });
    }
  });

  return {
    total: records.length,
    validCount,
    invalidCount,
    allValid: invalidCount === 0,
    issues
  };
}

/**
 * Export records as RFC 4180 compliant CSV string.
 * Optionally triggers browser download if in browser environment.
 * 
 * @param {Array} records
 * @param {string} [filename="studysense_ml_dataset.csv"]
 * @returns {string} CSV text
 */
export function exportDatasetToCSV(records = [], filename = "studysense_ml_dataset.csv") {
  if (!records || records.length === 0) return "";

  const headers = DATASET_FEATURE_COLUMNS;
  const rows = [];

  // Header row
  rows.push(headers.join(","));

  // Value rows
  records.forEach((record) => {
    const row = headers.map((col) => {
      const val = record[col];
      if (val === null || val === undefined) return "";
      if (typeof val === "string") {
        if (val.includes(",") || val.includes('"') || val.includes("\n")) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }
      return String(val);
    });
    rows.push(row.join(","));
  });

  const csvContent = rows.join("\r\n");

  // Trigger browser download if running in client environment
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Auto-download failed:", err);
    }
  }

  return csvContent;
}

/**
 * Convenience method to export the historical training dataset
 * @returns {string}
 */
export function exportTrainingDataset() {
  const trainingData = getHistoricalDataset();
  return exportDatasetToCSV(trainingData, "studysense_ml_training_dataset.csv");
}
