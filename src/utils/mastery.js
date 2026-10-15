/**
 * StudySense AI - Syllabus Topic Status & Aggregate Evaluation Utility
 *
 * Exact Progress-Based Rules:
 * - 0% progress: Not Started
 * - Greater than 0% and less than 50%: Need Practice
 * - 50% to less than 100%: In Progress
 * - 100%: Completed
 *
 * These rules are strictly derived from actual topic progress percentage.
 * Quiz scores, estimated marks, ML predictions, or mastery assumptions
 * do not alter or override these statuses.
 */

export const SYLLABUS_STATUS = {
  NOT_STARTED: "Not Started",
  NEED_PRACTICE: "Need Practice",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed"
};

// Backwards compatibility alias
export const MASTERY_STATUS = SYLLABUS_STATUS;

/**
 * Resolves genuine topic progress percentage (clamped strictly to 0 - 100).
 * Handles null, undefined, invalid, missing values safely without defaulting to 100%.
 *
 * @param {Object|number} topicOrProgress
 * @returns {number} Clamped progress percentage between 0 and 100.
 */
export function getTopicProgress(topicOrProgress) {
  if (topicOrProgress === null || topicOrProgress === undefined) {
    return 0;
  }

  // If already a number
  if (typeof topicOrProgress === "number") {
    if (isNaN(topicOrProgress) || !isFinite(topicOrProgress)) return 0;
    return Math.max(0, Math.min(100, topicOrProgress));
  }

  // If a topic object
  if (typeof topicOrProgress === "object") {
    if (topicOrProgress.isCompleted === true) {
      return 100;
    }

    const val = topicOrProgress.completion ?? topicOrProgress.progress ?? topicOrProgress.learningProgress;
    if (val === null || val === undefined) {
      if (topicOrProgress.status === "learned" || topicOrProgress.status === "mastered") {
        return 100;
      }
      return 0;
    }

    const num = Number(val);
    if (isNaN(num) || !isFinite(num)) {
      if (topicOrProgress.status === "learned" || topicOrProgress.status === "mastered") {
        return 100;
      }
      return 0;
    }

    const clamped = Math.max(0, Math.min(100, num));
    // If genuine completion recorded
    if (clamped >= 100 || topicOrProgress.status === "learned" || topicOrProgress.status === "mastered") {
      return 100;
    }

    return clamped;
  }

  return 0;
}

/**
 * Calculates topic status strictly from actual topic progress percentage.
 *
 * Exact rules:
 * - 0% -> Not Started
 * - Greater than 0% and less than 50% -> Need Practice
 * - 50% to less than 100% -> In Progress
 * - 100% -> Completed
 *
 * @param {Object|number} topicOrProgress
 * @returns {Object} { id, label, badgeClass, iconName, description, progress, isCompleted }
 */
export function calculateTopicStatus(topicOrProgress) {
  const progress = getTopicProgress(topicOrProgress);

  if (progress === 0) {
    return {
      id: "not_started",
      label: SYLLABUS_STATUS.NOT_STARTED,
      badgeClass: "badge-neutral",
      iconName: "Circle",
      description: "0% progress — Not started yet.",
      progress: 0,
      isCompleted: false
    };
  }

  if (progress > 0 && progress < 50) {
    return {
      id: "need_practice",
      label: SYLLABUS_STATUS.NEED_PRACTICE,
      badgeClass: "badge-danger",
      iconName: "AlertCircle",
      description: "Above 0% and below 50% progress — Need practice.",
      progress,
      isCompleted: false
    };
  }

  if (progress >= 50 && progress < 100) {
    return {
      id: "in_progress",
      label: SYLLABUS_STATUS.IN_PROGRESS,
      badgeClass: "badge-info",
      iconName: "Timer",
      description: "50% to less than 100% progress — In progress.",
      progress,
      isCompleted: false
    };
  }

  // Exactly 100%
  return {
    id: "completed",
    label: SYLLABUS_STATUS.COMPLETED,
    badgeClass: "badge-success",
    iconName: "CheckCircle2",
    description: "100% progress — Fully completed.",
    progress: 100,
    isCompleted: true
  };
}

// Aliases for seamless drop-in compatibility
export const calculateTopicMasteryStatus = (topic, _quizAttempts = []) => calculateTopicStatus(topic);

/**
 * Calculates aggregate status for a module or subject based on its topics.
 * Evaluates aggregate completion percentage and applies the exact same status thresholds:
 * - 0% -> Not Started
 * - Above 0% and below 50% -> Need Practice
 * - 50% to below 100% -> In Progress
 * - 100% -> Completed
 *
 * @param {Array} topicsList
 * @returns {Object} Aggregate status summary
 */
export function calculateAggregateStatus(topicsList = []) {
  if (!topicsList || topicsList.length === 0) {
    return {
      statusId: "not_started",
      label: SYLLABUS_STATUS.NOT_STARTED,
      badgeClass: "badge-neutral",
      iconName: "Circle",
      progress: 0,
      completedCount: 0,
      totalCount: 0,
      needPracticeCount: 0,
      inProgressCount: 0,
      notStartedCount: 0,
      summaryText: "0 of 0 topics completed",
      topicStatuses: []
    };
  }

  const topicStatuses = topicsList.map((t) => ({
    topic: t,
    status: calculateTopicStatus(t)
  }));

  const totalCount = topicsList.length;
  const completedCount = topicStatuses.filter((ts) => ts.status.id === "completed").length;
  const notStartedCount = topicStatuses.filter((ts) => ts.status.id === "not_started").length;
  const needPracticeCount = topicStatuses.filter((ts) => ts.status.id === "need_practice").length;
  const inProgressCount = topicStatuses.filter((ts) => ts.status.id === "in_progress").length;

  const totalProgress = topicsList.reduce((acc, t) => acc + getTopicProgress(t), 0);
  const avgProgress = totalCount > 0 ? Math.round(totalProgress / totalCount) : 0;
  const overallStatus = calculateTopicStatus(avgProgress);

  return {
    statusId: overallStatus.id,
    label: overallStatus.label,
    badgeClass: overallStatus.badgeClass,
    iconName: overallStatus.iconName,
    progress: avgProgress,
    completedCount,
    totalCount,
    needPracticeCount,
    inProgressCount,
    notStartedCount,
    summaryText: `${completedCount} of ${totalCount} topics completed`,
    topicStatuses
  };
}

/**
 * Optional auxiliary helper: extracts authentic topic-linked quiz evidence strictly
 * for quiz performance display (does NOT override progress-based topic status).
 *
 * @param {Object} topic
 * @param {Array} quizAttempts
 * @returns {Object} { hasEvidence, score, recentScore, avgScore, attemptsCount }
 */
export function getTopicQuizEvidence(topic, quizAttempts = []) {
  if (!topic) {
    return { hasEvidence: false, score: null, recentScore: null, avgScore: null, attemptsCount: 0 };
  }

  const linkedAttempts = Array.isArray(quizAttempts)
    ? quizAttempts.filter((a) => {
        if (!a) return false;
        const matchesTopic = a.topicId === topic.id || a.topic_id === topic.id;
        if (!matchesTopic) return false;

        // Strictly exclude exam practice attempts
        if (a.examId || a.exam_id) return false;
        if (typeof a.format === "string" && a.format.toLowerCase().includes("exam")) return false;

        const hasPct = typeof a.percentage === "number" && !isNaN(a.percentage);
        const hasScoreWithTotal =
          typeof a.score === "number" &&
          !isNaN(a.score) &&
          ((typeof a.totalQuestions === "number" && a.totalQuestions > 0) ||
           (typeof a.total_questions === "number" && a.total_questions > 0));

        return hasPct || hasScoreWithTotal;
      })
    : [];

  if (linkedAttempts.length > 0) {
    const sorted = [...linkedAttempts].sort((a, b) => {
      const timeA = new Date(a.attemptedAt || a.attempted_at || a.date || a.created_at || 0).getTime();
      const timeB = new Date(b.attemptedAt || b.attempted_at || b.date || b.created_at || 0).getTime();
      return timeB - timeA;
    });

    const recent = sorted[0];
    const totalQ = recent.totalQuestions ?? recent.total_questions;
    const recentScore =
      typeof recent.percentage === "number" && !isNaN(recent.percentage)
        ? Math.round(recent.percentage)
        : typeof recent.score === "number" && !isNaN(recent.score) && typeof totalQ === "number" && totalQ > 0
        ? Math.round((recent.score / totalQ) * 100)
        : null;

    let scoreSum = 0;
    let validCount = 0;
    sorted.forEach((a) => {
      const tq = a.totalQuestions ?? a.total_questions;
      const pct =
        typeof a.percentage === "number" && !isNaN(a.percentage)
          ? a.percentage
          : typeof a.score === "number" && !isNaN(a.score) && typeof tq === "number" && tq > 0
          ? (a.score / tq) * 100
          : null;
      if (pct !== null && !isNaN(pct)) {
        scoreSum += pct;
        validCount += 1;
      }
    });

    const avgScore = validCount > 0 ? Math.round(scoreSum / validCount) : recentScore;
    const effectiveScore = recentScore !== null ? recentScore : avgScore;

    return {
      hasEvidence: effectiveScore !== null,
      score: effectiveScore,
      recentScore,
      avgScore,
      attemptsCount: sorted.length
    };
  }

  if (
    typeof topic.quizAttempts === "number" &&
    topic.quizAttempts > 0 &&
    typeof topic.averageQuizScore === "number" &&
    !isNaN(topic.averageQuizScore) &&
    topic.averageQuizScore > 0
  ) {
    const rounded = Math.round(topic.averageQuizScore);
    return {
      hasEvidence: true,
      score: rounded,
      recentScore: rounded,
      avgScore: rounded,
      attemptsCount: topic.quizAttempts
    };
  }

  return { hasEvidence: false, score: null, recentScore: null, avgScore: null, attemptsCount: 0 };
}
