/**
 * StudySense AI - ML Debug & Evaluation Service
 * 
 * Provides model inspection, telemetry logging, and evaluation metric frameworks
 * for academic demonstration and system evaluation.
 * 
 * Evaluation metrics:
 * Classification: Accuracy, Precision, Recall, F1-Score
 * Regression: MAE (Mean Absolute Error), RMSE (Root Mean Squared Error), R² (Coefficient of Determination)
 */

const PREDICTION_LOGS_KEY = "studysense_ml_logs_v2";
const MAX_LOGS = 50;

/**
 * Log an internal ML inference event
 * @param {Object} logEntry
 * @param {string} logEntry.task - e.g. "mastery_prediction", "exam_readiness", "performance_prediction"
 * @param {string} logEntry.modelType - e.g. "logistic_regression_baseline", "linear_ridge_baseline", "decision_tree"
 * @param {Object} logEntry.featuresUsed - snapshot of feature vector
 * @param {any} logEntry.prediction - prediction result
 * @param {number} [logEntry.dataPoints] - number of records used
 */
export function logMLPrediction(logEntry) {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return;
    const existing = getMLPredictionLogs();
    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      date: new Date().toISOString().split("T")[0],
      ...logEntry
    };
    const updated = [entry, ...existing].slice(0, MAX_LOGS);
    window.sessionStorage.setItem(PREDICTION_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {}
}

/**
 * Retrieve recent ML prediction debug logs
 * @returns {Array}
 */
export function getMLPredictionLogs() {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return [];
    const raw = window.sessionStorage.getItem(PREDICTION_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Clear prediction logs
 */
export function clearMLPredictionLogs() {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.removeItem(PREDICTION_LOGS_KEY);
    }
  } catch (e) {}
}

/**
 * Classification Evaluation Metrics
 * Calculates Accuracy, Precision, Recall, and F1-Score
 * 
 * @param {Array<string|number>} yTrue - Ground truth classes
 * @param {Array<string|number>} yPred - Predicted classes
 * @returns {{ accuracy: number, precision: number, recall: number, f1: number, support: number }}
 */
export function evaluateClassification(yTrue = [], yPred = []) {
  if (!yTrue || !yPred || yTrue.length === 0 || yTrue.length !== yPred.length) {
    return { accuracy: 0, precision: 0, recall: 0, f1: 0, support: 0 };
  }

  const n = yTrue.length;
  let correct = 0;
  const classes = Array.from(new Set([...yTrue, ...yPred]));

  // Calculate overall accuracy
  for (let i = 0; i < n; i++) {
    if (yTrue[i] === yPred[i]) correct++;
  }
  const accuracy = Math.round((correct / n) * 1000) / 10;

  // Macro-averaged Precision and Recall
  let sumPrecision = 0;
  let sumRecall = 0;

  classes.forEach((cls) => {
    let tp = 0;
    let fp = 0;
    let fn = 0;

    for (let i = 0; i < n; i++) {
      if (yPred[i] === cls && yTrue[i] === cls) tp++;
      else if (yPred[i] === cls && yTrue[i] !== cls) fp++;
      else if (yPred[i] !== cls && yTrue[i] === cls) fn++;
    }

    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;

    sumPrecision += precision;
    sumRecall += recall;
  });

  const avgPrecision = Math.round((sumPrecision / classes.length) * 1000) / 10;
  const avgRecall = Math.round((sumRecall / classes.length) * 1000) / 10;
  const f1 = avgPrecision + avgRecall > 0
    ? Math.round(((2 * avgPrecision * avgRecall) / (avgPrecision + avgRecall)) * 10) / 10
    : 0;

  return {
    accuracy,
    precision: avgPrecision,
    recall: avgRecall,
    f1,
    support: n
  };
}

/**
 * Regression Evaluation Metrics
 * Calculates MAE (Mean Absolute Error), RMSE (Root Mean Squared Error), and R² (Coefficient of Determination)
 * 
 * @param {Array<number>} yTrue - Ground truth numerical values
 * @param {Array<number>} yPred - Predicted numerical values
 * @returns {{ mae: number, rmse: number, r2: number, count: number }}
 */
export function evaluateRegression(yTrue = [], yPred = []) {
  if (!yTrue || !yPred || yTrue.length === 0 || yTrue.length !== yPred.length) {
    return { mae: 0, rmse: 0, r2: 0, count: 0 };
  }

  const n = yTrue.length;
  let sumAbsErr = 0;
  let sumSqErr = 0;
  let sumY = 0;

  for (let i = 0; i < n; i++) {
    const err = yPred[i] - yTrue[i];
    sumAbsErr += Math.abs(err);
    sumSqErr += err * err;
    sumY += yTrue[i];
  }

  const meanY = sumY / n;
  let totalSumSquares = 0;
  for (let i = 0; i < n; i++) {
    const diff = yTrue[i] - meanY;
    totalSumSquares += diff * diff;
  }

  const mae = Math.round((sumAbsErr / n) * 100) / 100;
  const rmse = Math.round(Math.sqrt(sumSqErr / n) * 100) / 100;
  const r2 = totalSumSquares > 0
    ? Math.round((1 - sumSqErr / totalSumSquares) * 1000) / 1000
    : 1.0;

  return { mae, rmse, r2, count: n };
}

/**
 * Compile a comprehensive diagnostics summary for the Academic ML Demo Dashboard
 * @param {Object} context
 * @returns {Object}
 */
export function getMLDiagnostics(context = {}) {
  const { topics = [], sessions = [], quizAttempts = [], exams = [] } = context;

  // Active records
  const topicsWithQuizzes = topics.filter((t) => (t.quizAttempts || 0) > 0).length;
  const topicsWithStudy = topics.filter((t) => (t.completion || 0) > 0).length;
  const totalSessions = sessions.length;
  const totalQuizzes = quizAttempts.length;

  let modelStatus = "insufficient_data";
  if (totalQuizzes >= 6 || totalSessions >= 8) {
    modelStatus = "trained";
  } else if (totalQuizzes >= 2 || totalSessions >= 3) {
    modelStatus = "baseline";
  }

  const logs = getMLPredictionLogs();

  return {
    modelStatus, // "insufficient_data" | "baseline" | "trained"
    activeModelArchitecture: {
      type: modelStatus === "trained" ? "Logistic / Ridge Regressor (Trained Weights)" : "Transparent Baseline (Deterministic Weights)",
      backendTarget: "Ready for Python/scikit-learn REST API (FastAPI / Flask)",
      endpointPrepared: "POST /api/v1/predict/mastery",
      privacyStatus: "100% Local Inference (Zero data leaves browser)"
    },
    datasetMetrics: {
      totalTopics: topics.length,
      topicsWithQuizzes,
      topicsWithStudy,
      totalSessionsRecorded: totalSessions,
      totalQuizAttempts: totalQuizzes,
      examsTracked: exams.length
    },
    featuresVectorSchema: [
      "studyMinutes",
      "studySessions",
      "completedSessions",
      "missedSessions",
      "quizAttempts",
      "averageQuizScore",
      "recentQuizScore",
      "topicCompletion",
      "daysSinceLastStudy",
      "revisionCount",
      "averageConfidence",
      "averageDifficulty",
      "examDaysRemaining"
    ],
    recentLogs: logs.slice(0, 10),
    totalLogsRecorded: logs.length
  };
}
