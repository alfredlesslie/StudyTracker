import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Play,
  RotateCcw,
  Check
} from "lucide-react";

export default function SelfCheckSection({
  selfCheck,
  topic,
  onConfidenceSelect,
  confidenceLevel,
  confidenceSavedMessage,
  onStartPractice,
  onCompleteSection
}) {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  if (!selfCheck) return null;

  // Support array of questions or single selfCheck object
  const questions = Array.isArray(selfCheck) ? selfCheck : [selfCheck];
  const q = questions[0];

  if (!q) return null;

  // Resolve correct answer index
  let correctIndex = 0;
  if (typeof q.correctIndex === "number") {
    correctIndex = q.correctIndex;
  } else if (typeof q.correctAnswer === "number") {
    correctIndex = q.correctAnswer;
  } else if (q.answer && Array.isArray(q.options)) {
    const idx = q.options.indexOf(q.answer);
    correctIndex = idx !== -1 ? idx : 0;
  }

  const handleChoose = (idx) => {
    if (hasAnswered) return;
    setSelectedOptionIndex(idx);
    setHasAnswered(true);
    if (onCompleteSection) {
      onCompleteSection();
    }
  };

  const handleReset = () => {
    setSelectedOptionIndex(null);
    setHasAnswered(false);
  };

  const isCorrect = selectedOptionIndex === correctIndex;

  return (
    <div className="learning-sub-content animate-fade-in self-check-container">
      <div className="card self-check-card">
        <div className="self-check-header">
          <div className="check-badge">
            <HelpCircle size={18} />
            <span>Self-Check Diagnostic</span>
          </div>
          {hasAnswered && (
            <button className="btn-subtle btn-xs reset-btn" onClick={handleReset}>
              <RotateCcw size={13} />
              <span>Try Again</span>
            </button>
          )}
        </div>

        <h3 className="self-check-question-text">{q.question}</h3>

        {/* Options list */}
        <div className="self-check-options-list">
          {q.options &&
            q.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              let optionClass = "option-btn";

              if (hasAnswered) {
                if (idx === correctIndex) {
                  optionClass += " option-correct";
                } else if (idx === selectedOptionIndex) {
                  optionClass += " option-incorrect";
                } else {
                  optionClass += " option-muted";
                }
              }

              return (
                <button
                  key={idx}
                  className={optionClass}
                  onClick={() => handleChoose(idx)}
                  disabled={hasAnswered}
                >
                  <span className="option-letter-badge">{letter}</span>
                  <span className="option-text">{opt}</span>
                  {hasAnswered && idx === correctIndex && (
                    <CheckCircle2 size={18} className="option-status-icon text-success" />
                  )}
                  {hasAnswered && idx === selectedOptionIndex && idx !== correctIndex && (
                    <XCircle size={18} className="option-status-icon text-danger" />
                  )}
                </button>
              );
            })}
        </div>

        {/* Result & Explanation Feedback */}
        {hasAnswered && (
          <div
            className={`self-check-explanation-box animate-fade-in ${
              isCorrect ? "feedback-success" : "feedback-warning"
            }`}
          >
            <div className="feedback-status-row">
              {isCorrect ? (
                <>
                  <CheckCircle2 size={18} className="text-success" />
                  <span className="feedback-status-label text-success">
                    Correct! Great conceptual grasp.
                  </span>
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-danger" />
                  <span className="feedback-status-label text-danger">
                    Incorrect. Let's understand why:
                  </span>
                </>
              )}
            </div>

            <p className="explanation-text">{q.explanation}</p>
          </div>
        )}
      </div>

      {/* Confidence Capture Section */}
      <div className="card confidence-capture-card">
        <h4 className="confidence-heading">How confident do you feel about this topic?</h4>
        <p className="confidence-sub">
          Your feedback helps customize your revision plan and focus topics.
        </p>

        <div className="confidence-buttons-cluster">
          <button
            className={`conf-btn conf-low ${confidenceLevel === "low" ? "selected" : ""}`}
            onClick={() => {
              if (onConfidenceSelect) onConfidenceSelect("low");
              if (onCompleteSection) onCompleteSection();
            }}
          >
            <span className="conf-emoji">😕</span>
            <span className="conf-label">Not sure</span>
          </button>
          <button
            className={`conf-btn conf-medium ${confidenceLevel === "medium" ? "selected" : ""}`}
            onClick={() => {
              if (onConfidenceSelect) onConfidenceSelect("medium");
              if (onCompleteSection) onCompleteSection();
            }}
          >
            <span className="conf-emoji">😐</span>
            <span className="conf-label">Almost</span>
          </button>
          <button
            className={`conf-btn conf-high ${confidenceLevel === "high" ? "selected" : ""}`}
            onClick={() => {
              if (onConfidenceSelect) onConfidenceSelect("high");
              if (onCompleteSection) onCompleteSection();
            }}
          >
            <span className="conf-emoji">🙂</span>
            <span className="conf-label">I understand</span>
          </button>
        </div>

        {confidenceSavedMessage && (
          <div className="conf-saved-feedback animate-fade-in">
            <Check size={16} />
            <span>{confidenceSavedMessage}</span>
          </div>
        )}
      </div>

      {/* Topic Completed / Next Practice Action Card */}
      <div className="card lesson-completion-cta-card">
        <div className="cta-left">
          <span className="celebration-emoji">🎯</span>
          <div>
            <h4 className="cta-title">Test Your Mastery</h4>
            <p className="cta-sub">
              Take practice questions on <strong>{topic?.title || "this topic"}</strong> to cement
              your understanding.
            </p>
          </div>
        </div>
        <button
          className="btn btn-primary btn-md"
          onClick={() => {
            if (onCompleteSection) onCompleteSection();
            if (onStartPractice) onStartPractice();
          }}
        >
          <Play size={16} />
          <span>Start Topic Practice</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
