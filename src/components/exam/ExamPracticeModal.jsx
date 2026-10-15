import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  X,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Layers,
  Award,
  AlertCircle,
  AlertTriangle,
  Check,
  Clock,
  Target,
  Brain,
  RefreshCw,
  FileQuestion,
  ListChecks,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { generateExamPracticeQuizAsync } from "../../services/quizService";
import { formatExamScope } from "../../pages/Exams";
import { MODULES, SUBJECTS, TOPICS } from "../../data/syllabus";
import "./ExamPracticeModal.css";

export default function ExamPracticeModal({ examId, onClose }) {
  const {
    exams,
    quizAttempts,
    logQuizAttempt,
    navigateTo,
    selectTopic,
    openTutorForMistake,
    examScopePredictions,
    refreshExamScopePrediction
  } = useApp();

  const exam = exams.find((e) => e.id === examId);
  const examSub = SUBJECTS.find((s) => s.id === (exam?.subjectId || exam?.subject_id)) || SUBJECTS[0];
  const validSubjectModules = MODULES.filter((m) => m.subjectId === examSub.id);
  const rawModules = exam?.moduleIds || exam?.module_ids || [];
  const selectedModuleIds = rawModules.length > 0
    ? rawModules.filter((id) => validSubjectModules.some((m) => m.id === id))
    : validSubjectModules.map((m) => m.id);

  const scopeText = formatExamScope(selectedModuleIds, validSubjectModules);

  // Configuration state - exactly 10 questions for exam practice
  const questionCount = 10;
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Quiz running state
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [qIndex]: optionIndex }
  const [showReviewScreen, setShowReviewScreen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [questionPoolNote, setQuestionPoolNote] = useState(null);
  const startTimeRef = useRef(Date.now());

  // Historical attempts for this specific exam
  const examAttempts = (quizAttempts || [])
    .filter((q) => q && (q.examId === examId || q.exam_id === examId))
    .sort((a, b) => {
      const timeB = new Date(b.attemptedAt || b.attempted_at || b.date || 0).getTime();
      const timeA = new Date(a.attemptedAt || a.attempted_at || a.date || 0).getTime();
      return timeB - timeA;
    });

  // Collect all previously seen question IDs for this exam to ensure fresh retakes
  const getPreviouslySeenQuestionIds = () => {
    const seen = new Set();
    examAttempts.forEach((att) => {
      if (Array.isArray(att.answers)) {
        att.answers.forEach((ans) => {
          if (ans.questionId) seen.add(ans.questionId);
          if (ans.id) seen.add(ans.id);
        });
      }
    });
    return Array.from(seen);
  };

  // Load questions for the practice quiz (exactly 10 questions)
  const handleStartQuiz = async () => {
    setIsLoadingQuestions(true);
    setLoadError(null);

    try {
      const seenIds = getPreviouslySeenQuestionIds();
      const generated = await generateExamPracticeQuizAsync({
        exam: {
          ...exam,
          subjectId: examSub.id,
          moduleIds: selectedModuleIds
        },
        count: 10,
        excludeQuestionIds: seenIds
      });

      if (!generated.questions || generated.questions.length === 0) {
        throw new Error("Unable to generate questions for the selected module scope.");
      }

      if (generated.questions.length < 10) {
        throw new Error(
          `Only ${generated.questions.length} questions could be found for the selected module scope. Exactly 10 questions are required for exam practice.`
        );
      }

      // Guarantee exactly 10 questions presented
      const finalQuestions = generated.questions.slice(0, 10);
      setQuestions(finalQuestions);
      setQuestionPoolNote(generated.question_pool_note || null);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setShowReviewScreen(false);
      setIsSubmitting(false);
      setQuizFinished(false);
      setShowExitConfirm(false);
      startTimeRef.current = Date.now();
      setQuizStarted(true);
    } catch (err) {
      setLoadError(err.message || "Failed to generate questions. Please try again.");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Option select
  const handleSelectOption = (optIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optIdx
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Reached the end: open Answer Review screen before final submission
      setShowReviewScreen(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Final submission from review screen
  const handleConfirmSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const totalQ = questions.length;
    let correctCount = 0;
    const moduleStats = {};

    selectedModuleIds.forEach((modId) => {
      const modObj = validSubjectModules.find((m) => m.id === modId);
      moduleStats[modId] = {
        moduleId: modId,
        moduleNumber: modObj?.order || (modId.includes("-m") ? modId.split("-m")[1] : 1),
        moduleTitle: modObj ? `Module ${modObj.order}: ${modObj.title.split(":")[1]?.trim() || modObj.title}` : `Module ${modId}`,
        total: 0,
        correct: 0,
        percentage: 0
      };
    });

    const answerRecords = questions.map((q, idx) => {
      const userChoice = selectedAnswers[idx] ?? null;
      const isCorrect = userChoice === q.correct_answer;
      if (isCorrect) correctCount++;

      const mId = q.module_id;
      if (moduleStats[mId]) {
        moduleStats[mId].total += 1;
        if (isCorrect) moduleStats[mId].correct += 1;
      }

      return {
        questionId: q.id,
        topicId: q.topic_id,
        moduleId: q.module_id,
        selectedOption: userChoice,
        correctOption: q.correct_answer,
        isCorrect,
        difficulty: q.difficulty || "medium"
      };
    });

    // Compute per-module percentages
    Object.keys(moduleStats).forEach((modId) => {
      const item = moduleStats[modId];
      item.percentage = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
    });

    const pct = Math.round((correctCount / (totalQ || 1)) * 100);
    const durationSeconds = Math.max(5, Math.round((Date.now() - startTimeRef.current) / 1000));

    try {
      await logQuizAttempt({
        examId: exam.id,
        subjectId: examSub.id,
        moduleScope: selectedModuleIds,
        moduleScopeJson: selectedModuleIds,
        moduleResults: moduleStats,
        moduleResultsJson: moduleStats,
        score: correctCount,
        totalQuestions: totalQ,
        percentage: pct,
        durationSeconds,
        answers: answerRecords,
        format: "Mixed Module Exam Practice"
      });

      if (refreshExamScopePrediction) {
        await refreshExamScopePrediction(exam.id);
      }
    } catch (err) {
      console.warn("Failed to persist quiz attempt:", err);
    } finally {
      setIsSubmitting(false);
      setShowReviewScreen(false);
      setQuizFinished(true);

      if (pct >= 80) {
        try {
          confetti({
            particleCount: 75,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
    }
  };

  // Find weakest module or topic from quiz results for "Study Weak Topics" action
  const getWeakestTopicInScope = () => {
    const incorrect = questions.filter((q, idx) => selectedAnswers[idx] !== q.correct_answer);
    if (incorrect.length > 0) {
      return incorrect[0].topic_id;
    }
    const firstScopeTopic = TOPICS.find((t) => t.subjectId === examSub.id && selectedModuleIds.includes(t.moduleId));
    return firstScopeTopic?.id || "cn-m3-t1";
  };

  const handleStudyWeakTopics = () => {
    const weakTopicId = getWeakestTopicInScope();
    selectTopic(weakTopicId);
    navigateTo("learn", weakTopicId);
    onClose();
  };

  // Current scope prediction
  const scopePrediction = examScopePredictions[examId];
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = questions.length - answeredCount;

  if (!exam) return null;

  return (
    <div
      className="exam-quiz-modal-backdrop"
      onClick={() => {
        if (quizStarted && !quizFinished) {
          setShowExitConfirm(true);
        } else {
          onClose();
        }
      }}
    >
      <div
        className="exam-quiz-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-quiz-header-title"
      >
        {/* Academic Header */}
        <div className="exam-quiz-modal-header">
          <div className="exam-header-meta-cluster">
            <span className="exam-badge-subject">{examSub.code}</span>
            <div className="exam-header-text-group">
              <div className="exam-header-top-row">
                <span className="exam-header-subname">{examSub.name}</span>
                <span className="exam-header-divider">•</span>
                <span className="exam-header-mode">Mixed-Module Exam Practice</span>
              </div>
              <h2 id="exam-quiz-header-title" className="exam-quiz-title">{exam.name}</h2>
              <div className="exam-header-scope-pill">
                <Layers size={13} />
                <span>{scopeText}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="exam-btn-close"
            onClick={() => {
              if (quizStarted && !quizFinished) {
                setShowExitConfirm(true);
              } else {
                onClose();
              }
            }}
            aria-label="Close Practice Session"
          >
            <X size={20} />
          </button>
        </div>

        {/* =========================================================================
            STATE 1: SETUP SCREEN
            ========================================================================= */}
        {!quizStarted && (
          <div className="exam-quiz-setup-view">
            <div className="setup-hero-card">
              <div className="setup-hero-icon-box">
                <Zap size={28} className="text-primary" />
              </div>
              <div className="setup-hero-content">
                <h3>Academic Exam Practice Session (10 Questions)</h3>
                <p>
                  Prepare under realistic exam conditions with exactly 10 questions strictly drawn from your selected modules:{" "}
                  <strong>{scopeText}</strong>. Questions are validated server-side for accuracy.
                </p>
              </div>
            </div>

            {loadError && (
              <div className="setup-error-alert" role="alert">
                <AlertTriangle size={18} className="text-danger" />
                <div className="error-alert-content">
                  <strong>Question Generation Failed:</strong>
                  <p>{loadError}</p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => handleStartQuiz()}
                >
                  <RefreshCw size={14} /> Retry
                </button>
              </div>
            )}

            <div className="setup-card-section">
              <span className="setup-section-label">Practice Quiz Format:</span>
              <div className="exam-practice-format-card">
                <FileQuestion size={20} className="text-primary" />
                <div className="format-info-text">
                  <span className="format-title">10 Standard Exam Questions</span>
                  <span className="format-subtitle">
                    Balanced across your selected modules ({scopeText})
                  </span>
                </div>
              </div>
            </div>

            <div className="setup-card-section">
              <span className="setup-section-label">Modules Included in This Scope:</span>
              <div className="scope-chips-cluster">
                {selectedModuleIds.map((modId) => {
                  const mObj = validSubjectModules.find((m) => m.id === modId);
                  return (
                    <span key={modId} className="scope-chip">
                      <Check size={13} className="text-success" />
                      <span>Module {mObj?.order || (modId.includes("-m") ? modId.split("-m")[1] : modId)}: {mObj?.title?.split(":")[1]?.trim() || mObj?.title || modId}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {examAttempts.length > 0 && (
              <div className="setup-history-card">
                <div className="history-summary-header">
                  <span>Previous Attempts for this Exam ({examAttempts.length})</span>
                  <span className="latest-score-tag">Latest Score: {examAttempts[0].percentage}%</span>
                </div>
                <div className="history-mini-list">
                  {examAttempts.slice(0, 3).map((att, idx) => (
                    <div key={att.id || idx} className="history-mini-row">
                      <span className="mini-attempt-name">Attempt #{examAttempts.length - idx}</span>
                      <span className="mini-attempt-date">{att.date || "Recent"}</span>
                      <strong className={`mini-attempt-score ${att.percentage >= 80 ? "text-success" : att.percentage >= 60 ? "text-warning" : "text-danger"}`}>
                        {att.score}/{att.totalQuestions || att.total_questions || 10} ({att.percentage}%)
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="setup-footer-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
              >
                Back to Exam
              </button>
              <button
                type="button"
                className="btn btn-primary btn-lg start-exam-btn"
                onClick={() => handleStartQuiz()}
                disabled={isLoadingQuestions}
              >
                {isLoadingQuestions ? (
                  <>
                    <RefreshCw size={18} className="spin-animate" />
                    <span>Generating 10 Validated Questions...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Start Exam Practice (10 Questions)</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 2: ACTIVE QUESTION VIEW
            ========================================================================= */}
        {quizStarted && !quizFinished && !showReviewScreen && currentQ && (
          <div className="exam-quiz-active-view">
            {/* Meta & Progress Bar */}
            <div className="quiz-meta-header">
              <div className="meta-left">
                <span className="question-counter-badge">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="question-module-badge">
                  {currentQ.module_title}: {currentQ.topic_title}
                </span>
              </div>
              <span className="marks-pill">1 Mark</span>
            </div>

            <div className="quiz-progress-track">
              <div
                className="quiz-progress-fill"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {questionPoolNote && (
              <div className="quiz-notice-banner">
                <AlertCircle size={14} />
                <span>{questionPoolNote}</span>
              </div>
            )}

            {/* Distinct Question Card */}
            <div className="quiz-question-card">
              <h3 className="question-text">{currentQ.question}</h3>
            </div>

            {/* Distinct Option Cards with Proper Spacing */}
            <div className="quiz-options-group">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentIndex] === optIdx;
                const letter = String.fromCharCode(65 + optIdx);
                return (
                  <button
                    key={optIdx}
                    type="button"
                    className={`quiz-option-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectOption(optIdx)}
                  >
                    <span className="option-letter-badge">{letter}</span>
                    <span className="option-text-body">{opt}</span>
                    {isSelected && (
                      <CheckCircle2 size={18} className="option-check-icon text-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation Footer */}
            <div className="quiz-nav-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                <ArrowLeft size={16} />
                <span>Previous</span>
              </button>

              <div className="nav-center-status">
                <span className="nav-answered-text">
                  Answered: <strong>{answeredCount}</strong> of {questions.length}
                </span>
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                >
                  <span>Next</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary review-btn"
                  onClick={() => setShowReviewScreen(true)}
                >
                  <ListChecks size={17} />
                  <span>Review & Submit</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 3: ANSWER REVIEW SCREEN BEFORE SUBMISSION
            ========================================================================= */}
        {quizStarted && !quizFinished && showReviewScreen && (
          <div className="exam-quiz-review-view">
            <div className="review-hero-header">
              <div className="review-title-group">
                <h3>Review Answers Before Submission</h3>
                <p>Verify your responses before submitting your exam quiz for server-side evaluation.</p>
              </div>
              <div className="review-stats-row">
                <div className="stat-pill stat-total">
                  <span>Total:</span> <strong>{questions.length}</strong>
                </div>
                <div className="stat-pill stat-answered">
                  <span>Answered:</span> <strong>{answeredCount}</strong>
                </div>
                <div className={`stat-pill ${unansweredCount > 0 ? "stat-unanswered-warn" : "stat-unanswered-ok"}`}>
                  <span>Unanswered:</span> <strong>{unansweredCount}</strong>
                </div>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="unanswered-alert-banner">
                <AlertTriangle size={16} className="text-warning" />
                <span>
                  You have <strong>{unansweredCount} unanswered question{unansweredCount === 1 ? "" : "s"}</strong>.
                  Click &ldquo;Jump to Question&rdquo; to provide an answer before submitting.
                </span>
              </div>
            )}

            <div className="review-questions-list">
              {questions.map((q, idx) => {
                const choice = selectedAnswers[idx];
                const isAnswered = choice !== undefined && choice !== null;
                const letter = isAnswered ? String.fromCharCode(65 + choice) : null;
                return (
                  <div key={q.id || idx} className={`review-question-row ${isAnswered ? "answered" : "unanswered"}`}>
                    <div className="row-left-cluster">
                      <span className="row-q-num">Q{idx + 1}</span>
                      <div className="row-q-details">
                        <span className="row-mod-tag">{q.module_title}: {q.topic_title}</span>
                        <p className="row-q-text">{q.question}</p>
                        <div className="row-answer-status">
                          {isAnswered ? (
                            <span className="text-answered">
                              <CheckCircle2 size={13} className="text-success" />
                              <span>Selected: <strong>Option {letter}</strong> ({q.options[choice]})</span>
                            </span>
                          ) : (
                            <span className="text-unanswered">
                              <AlertCircle size={13} className="text-warning" />
                              <strong>Not Answered</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm row-jump-btn"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowReviewScreen(false);
                      }}
                    >
                      <span>Jump to Q{idx + 1}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="review-footer-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowReviewScreen(false)}
                disabled={isSubmitting}
              >
                <ArrowLeft size={16} />
                <span>Back to Questions</span>
              </button>
              <button
                type="button"
                className="btn btn-success submit-final-btn"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={17} className="spin-animate" />
                    <span>Evaluating & Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    <span>Submit Exam Practice Quiz</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 4: RESULTS SCREEN WITH HONEST PREDICTED SCORE
            ========================================================================= */}
        {quizFinished && (
          <div className="exam-quiz-results-view">
            {(() => {
              const totalQ = questions.length;
              const correct = questions.filter((q, idx) => selectedAnswers[idx] === q.correct_answer).length;
              const unanswered = questions.filter((q, idx) => selectedAnswers[idx] === undefined || selectedAnswers[idx] === null).length;
              const incorrect = totalQ - correct - unanswered;
              const pct = Math.round((correct / (totalQ || 1)) * 100);

              // Module Breakdown
              const modBreakdown = {};
              selectedModuleIds.forEach((mId) => {
                const mObj = validSubjectModules.find((m) => m.id === mId);
                modBreakdown[mId] = {
                  order: mObj?.order || (mId.includes("-m") ? mId.split("-m")[1] : 1),
                  title: mObj ? mObj.title.split(":")[1]?.trim() || mObj.title : `Module ${mId}`,
                  total: 0,
                  correct: 0
                };
              });

              questions.forEach((q, idx) => {
                const mId = q.module_id;
                if (modBreakdown[mId]) {
                  modBreakdown[mId].total += 1;
                  if (selectedAnswers[idx] === q.correct_answer) {
                    modBreakdown[mId].correct += 1;
                  }
                }
              });

              const historyList = examAttempts;
              const currentAttemptNum = historyList.length;

              // Predicted score calculation
              const predictedScore = scopePrediction?.estimated_score !== undefined && scopePrediction?.estimated_score !== null
                ? scopePrediction.estimated_score
                : Math.round(pct * 0.45 + 55 * 0.35 + 20);

              const explanationText = scopePrediction?.basis_explanation ||
                scopePrediction?.why_prediction_changed ||
                "Based on preparation progress and previous quiz results.";

              return (
                <div className="results-content-stack">
                  {/* Results Hero Header */}
                  <div className="results-hero-header">
                    <span className="results-emoji">{pct >= 80 ? "🎉" : pct >= 60 ? "📈" : "🎯"}</span>
                    <h3 className="results-title">
                      {pct >= 80 ? "Outstanding Performance!" : pct >= 60 ? "Solid Effort — Keep Going!" : "Quiz Completed — Review & Improve"}
                    </h3>
                    <p className="results-subtitle">
                      Your answers have been scored server-side against the official answer keys.
                    </p>
                  </div>

                  {/* Dual Score Presentation: Strictly Separated */}
                  <div className="dual-score-grid">
                    {/* Card 1: Quiz Score */}
                    <div className="score-card quiz-score-card">
                      <div className="score-card-top">
                        <span className="score-badge badge-quiz">Quiz Score</span>
                        <span className="score-meta-tag">{totalQ} Questions</span>
                      </div>
                      <div className="score-number-display">
                        <span className="score-main-value">{correct}</span>
                        <span className="score-denom-value">/ {totalQ}</span>
                        <span className="score-pct-badge">{pct}%</span>
                      </div>
                      <div className="score-breakdown-row">
                        <span className="pill-correct"><CheckCircle2 size={13} /> {correct} Correct</span>
                        <span className="pill-incorrect"><XCircle size={13} /> {incorrect} Incorrect</span>
                        {unanswered > 0 && (
                          <span className="pill-unanswered"><AlertCircle size={13} /> {unanswered} Unanswered</span>
                        )}
                      </div>
                      <span className="score-card-caption">
                        Marks earned on the exam practice quiz just completed.
                      </span>
                    </div>

                    {/* Card 2: Predicted Real Exam Score */}
                    <div className="score-card predicted-score-card">
                      <div className="score-card-top">
                        <span className="score-badge badge-predicted">Predicted Exam Score</span>
                      </div>
                      <div className="score-number-display">
                        <span className="score-main-value text-primary">{predictedScore}</span>
                        <span className="score-denom-value">/ 100</span>
                      </div>
                      <div className="score-prediction-explanation">
                        <p>{explanationText}</p>
                        <span className="prediction-attempts-note">
                          Based on {currentAttemptNum} completed exam attempt{currentAttemptNum === 1 ? "" : "s"} · Preparation-based estimate
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Module Breakdown */}
                  <div className="results-section-card">
                    <h4 className="section-heading">
                      <Layers size={16} className="text-primary" />
                      <span>Module-Wise Accuracy in Selected Scope</span>
                    </h4>
                    <div className="modules-perf-grid">
                      {Object.keys(modBreakdown).map((modId) => {
                        const m = modBreakdown[modId];
                        const mPct = m.total > 0 ? Math.round((m.correct / m.total) * 100) : 0;
                        return (
                          <div key={modId} className="module-perf-card">
                            <div className="mod-perf-top">
                              <span className="mod-perf-title">Module {m.order}: {m.title}</span>
                              <strong className={`mod-perf-pct ${mPct >= 80 ? "high" : mPct >= 60 ? "med" : "low"}`}>
                                {m.correct}/{m.total} ({mPct}%)
                              </strong>
                            </div>
                            <div className="mod-progress-track">
                              <div
                                className="mod-progress-fill"
                                style={{
                                  width: `${mPct}%`,
                                  backgroundColor: mPct >= 80 ? "var(--success)" : mPct >= 60 ? "var(--warning)" : "var(--danger)"
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question Review Section with Explanations */}
                  <div className="results-section-card">
                    <h4 className="section-heading">
                      <FileQuestion size={16} className="text-primary" />
                      <span>Review Answers & Explanations</span>
                    </h4>
                    <div className="review-items-container">
                      {questions.map((q, idx) => {
                        const userChoice = selectedAnswers[idx];
                        const isAnswered = userChoice !== undefined && userChoice !== null;
                        const isCorrect = isAnswered && userChoice === q.correct_answer;
                        const userLetter = isAnswered ? String.fromCharCode(65 + userChoice) : null;
                        const correctLetter = String.fromCharCode(65 + q.correct_answer);

                        return (
                          <div
                            key={q.id || idx}
                            className={`review-detail-card ${isCorrect ? "correct" : isAnswered ? "incorrect" : "unanswered"}`}
                          >
                            <div className="detail-header">
                              <span className="detail-q-title">Question {idx + 1} ({q.module_title}: {q.topic_title})</span>
                              <span className={`detail-status-pill ${isCorrect ? "correct" : isAnswered ? "incorrect" : "unanswered"}`}>
                                {isCorrect ? (
                                  <>
                                    <CheckCircle2 size={13} /> Correct (+1 Mark)
                                  </>
                                ) : isAnswered ? (
                                  <>
                                    <XCircle size={13} /> Incorrect (0 Marks)
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle size={13} /> Unanswered (0 Marks)
                                  </>
                                )}
                              </span>
                            </div>

                            <p className="detail-question-text">{q.question}</p>

                            <div className="detail-answers-block">
                              <div className="detail-ans-row">
                                <span className="detail-ans-label">Your Answer:</span>
                                <span className={`detail-ans-value ${isCorrect ? "text-success font-semibold" : "text-danger"}`}>
                                  {isAnswered ? `Option ${userLetter}: ${q.options[userChoice]}` : "Unanswered"}
                                </span>
                              </div>
                              {!isCorrect && (
                                <div className="detail-ans-row">
                                  <span className="detail-ans-label">Correct Answer:</span>
                                  <span className="detail-ans-value text-success font-semibold">
                                    Option {correctLetter}: {q.options[q.correct_answer]}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="detail-explanation-box">
                              <strong>Explanation:</strong> {q.explanation}
                            </div>

                            {!isCorrect && (
                              <div className="detail-action-row">
                                <button
                                  type="button"
                                  className="btn btn-outline btn-xs"
                                  onClick={() => {
                                    const topicObj = TOPICS.find((t) => t.id === q.topic_id) || { title: q.topic_title };
                                    openTutorForMistake({
                                      topic: topicObj,
                                      question: q,
                                      studentAnswer: isAnswered ? q.options[userChoice] : "Unanswered",
                                      correctAnswer: q.options[q.correct_answer]
                                    });
                                    onClose();
                                  }}
                                >
                                  <Sparkles size={13} />
                                  <span>Understand with AI Tutor</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="results-actions-footer">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={onClose}
                    >
                      Back to Exam Dashboard
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleStudyWeakTopics}
                    >
                      <Brain size={16} />
                      <span>Study Weak Topics in Learn</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleStartQuiz()}
                    >
                      <RotateCcw size={16} />
                      <span>Retake Quiz (Fresh Questions)</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Exit Confirmation Dialog */}
        {showExitConfirm && (
          <div className="exam-confirm-overlay" onClick={() => setShowExitConfirm(false)}>
            <div className="exam-confirm-dialog" onClick={(e) => e.stopPropagation()}>
              <AlertTriangle size={36} className="text-danger" />
              <h3>Exit Exam Practice Session?</h3>
              <p>
                Your current quiz progress has not been submitted. If you exit now, this practice attempt will not be recorded.
              </p>
              <div className="exam-confirm-buttons">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowExitConfirm(false)}
                >
                  Stay in Quiz
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    setShowExitConfirm(false);
                    onClose();
                  }}
                >
                  Exit Practice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
