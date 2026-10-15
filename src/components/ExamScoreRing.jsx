import React, { useId } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import "./ExamScoreRing.css";

/**
 * ExamScoreRing — Accessible, Responsive SVG Circular Progress Ring
 * 
 * Used for displaying estimated exam performance and syllabus completion.
 * Pure SVG implementation with smooth entrance animations, rounded arc ends,
 * and accessible ARIA attributes.
 * 
 * @param {Object} props
 * @param {number|null} props.score - Actual score value between 0 and 100
 * @param {number} [props.maxScore=100] - Maximum score scale
 * @param {number} [props.size=190] - Diameter in pixels
 * @param {number} [props.strokeWidth=14] - Width of progress stroke
 * @param {string} [props.label] - Accessible label for screen readers
 * @param {string} [props.statusLabel] - Performance label (e.g., "Doing well", "Getting there")
 * @param {boolean} [props.isLoading=false] - Whether prediction is loading
 * @param {boolean} [props.isInsufficient=false] - Whether data is insufficient for prediction
 * @param {boolean} [props.hasError=false] - Whether prediction request failed
 * @param {string} [props.errorMessage] - Optional error description
 * @param {Function} [props.onRetry] - Retry callback on error
 * @param {string} [props.variant="prediction"] - "prediction" | "completion"
 * @param {boolean} [props.isCompact=false] - Compact layout sizing
 * @param {boolean} [props.showScale=true] - Show "/100" scale indicator
 */
export default function ExamScoreRing({
  score = null,
  maxScore = 100,
  size = 190,
  strokeWidth = 14,
  label = "Estimated Exam Score",
  statusLabel = null,
  isLoading = false,
  isInsufficient = false,
  hasError = false,
  errorMessage = null,
  onRetry = null,
  variant = "prediction",
  isCompact = false,
  showScale = true,
  emptyMessage = "Not enough data yet"
}) {
  const gradientId = useId();

  // Validate and clamp numerical score
  const validScore =
    typeof score === "number" && !isNaN(score)
      ? Math.max(0, Math.min(maxScore, Math.round(score)))
      : null;

  // Geometry calculations
  const center = size / 2;
  const radius = Math.max(1, (size - strokeWidth) / 2);
  const circumference = 2 * Math.PI * radius;

  // Progress percentage (0 to 1)
  const percentage = validScore !== null ? validScore / maxScore : 0;
  const strokeDashoffset = circumference - percentage * circumference;

  // Semantic color and gradient styling
  let strokeGradientStart = "#6366f1"; // Indigo
  let strokeGradientEnd = "#8b5cf6";   // Violet
  let badgeClass = "badge-primary";

  if (variant === "completion") {
    strokeGradientStart = "#10b981"; // Emerald
    strokeGradientEnd = "#059669";
    badgeClass = "badge-success";
  } else if (validScore !== null) {
    if (validScore >= 80) {
      strokeGradientStart = "#10b981"; // Emerald
      strokeGradientEnd = "#14b8a6";   // Teal
      badgeClass = "badge-success";
    } else if (validScore >= 60) {
      strokeGradientStart = "#6366f1"; // Indigo
      strokeGradientEnd = "#8b5cf6";   // Purple
      badgeClass = "badge-warning";
    } else {
      strokeGradientStart = "#f59e0b"; // Amber
      strokeGradientEnd = "#ef4444";   // Coral
      badgeClass = "badge-danger";
    }
  }

  // Derive human status label if none supplied
  const displayStatusLabel =
    statusLabel ||
    (validScore !== null
      ? validScore >= 80
        ? "Doing well"
        : validScore >= 60
        ? "Getting there"
        : "Needs attention"
      : null);

  return (
    <div
      className={`score-ring-container ${isCompact ? "score-ring-compact" : ""}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={label}
      aria-valuenow={validScore !== null ? validScore : undefined}
      aria-valuemin={0}
      aria-valuemax={maxScore}
    >
      <div className="score-ring-svg-wrap" style={{ width: size, height: size }}>
        <svg
          className="score-ring-svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={strokeGradientStart} />
              <stop offset="100%" stopColor={strokeGradientEnd} />
            </linearGradient>
          </defs>

          {/* Background Track Circle */}
          <circle
            className="score-ring-track"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />

          {/* Foreground Animated Value Arc */}
          {!isLoading && !hasError && !isInsufficient && validScore !== null && (
            <circle
              className="score-ring-progress"
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
              stroke={`url(#${gradientId})`}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
            />
          )}
        </svg>

        {/* Center Content Overlay */}
        <div className="score-ring-center">
          {isLoading ? (
            <div className="score-ring-loading">
              <div className="score-ring-spinner" />
              <span className="score-ring-loading-label">Estimating...</span>
            </div>
          ) : hasError ? (
            <div className="score-ring-error">
              <AlertCircle size={22} className="text-warning" />
              <span className="score-ring-error-msg">
                {errorMessage || "Prediction offline"}
              </span>
              {onRetry && (
                <button
                  type="button"
                  className="score-ring-retry-btn"
                  onClick={onRetry}
                  aria-label="Retry prediction"
                >
                  <RefreshCw size={12} />
                  <span>Retry</span>
                </button>
              )}
            </div>
          ) : isInsufficient || validScore === null ? (
            <div className="score-ring-insufficient">
              <span className="score-ring-insufficient-dash">—</span>
              <span className="score-ring-insufficient-msg">
                {emptyMessage}
              </span>
            </div>
          ) : (
            <>
              <div className="score-ring-value-row">
                <span className="score-ring-number">{validScore}</span>
                {showScale && <span className="score-ring-max">/{maxScore}</span>}
              </div>
              {displayStatusLabel && !isCompact && (
                <span className={`badge ${badgeClass} score-ring-status-pill`}>
                  {displayStatusLabel}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
