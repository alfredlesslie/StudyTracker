import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { useApp } from "../context/AppContext";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Sparkles,
  CheckCircle2,
  Brain,
  Volume2,
  VolumeX,
  Flame,
  Check
} from "lucide-react";

// Preset Mode Durations in Seconds
const MODES = {
  focus: {
    id: "focus",
    label: "Focus",
    minutes: 25,
    duration: 25 * 60,
    color: "#4f46e5",
    accentBg: "rgba(79, 70, 229, 0.08)",
    description: "Deep, uninterrupted concentration block."
  },
  shortBreak: {
    id: "shortBreak",
    label: "Short Break",
    minutes: 5,
    duration: 5 * 60,
    color: "#10b981",
    accentBg: "rgba(16, 185, 129, 0.08)",
    description: "Quick rest to stretch, hydrate, and relax your eyes."
  },
  longBreak: {
    id: "longBreak",
    label: "Long Break",
    minutes: 15,
    duration: 15 * 60,
    color: "#06b6d4",
    accentBg: "rgba(6, 182, 212, 0.08)",
    description: "Extended recharge after four focus blocks."
  }
};

// Play synthesized pleasant chime using Web Audio API
function playCompletionChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First tone (587.33 Hz - D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.6);

    // Second tone (880.00 Hz - A5) slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.2);
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.2);
    osc2.stop(ctx.currentTime + 0.9);
  } catch (e) {
    // Graceful fallback if AudioContext is blocked
  }
}

export default function Focus() {
  const {
    activeTopicId,
    topics,
    logStudySession,
    startActiveSession,
    stopActiveSession,
    focusConfig,
    navigateTo
  } = useApp();

  const currentTopic = (topics || []).find((t) => t.id === activeTopicId) || (topics || [])[0];

  const [currentMode, setCurrentMode] = useState("focus");
  const focusDuration = focusConfig?.durationMinutes
    ? focusConfig.durationMinutes * 60
    : MODES.focus.duration;
  const [timeLeft, setTimeLeft] = useState(focusDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedBlocks, setCompletedBlocks] = useState(0);

  // Target end timestamp for accurate interval calculations that resist tab suspension
  const targetEndTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const sessionLoggedRef = useRef(false);

  const activeModeConfig = MODES[currentMode] || MODES.focus;
  const totalDuration = currentMode === "focus" ? focusDuration : activeModeConfig.duration;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopActiveSession();
    };
  }, []);

  // Update timer duration if focusConfig changes
  useEffect(() => {
    if (!isRunning && !isCompleted && currentMode === "focus") {
      setTimeLeft(focusDuration);
    }
  }, [focusConfig, currentMode, isRunning, isCompleted, focusDuration]);

  // Complete session handler: logs session strictly once
  const handleCompleteSession = () => {
    if (sessionLoggedRef.current) return;
    sessionLoggedRef.current = true;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setIsCompleted(true);
    setTimeLeft(0);
    stopActiveSession();

    if (soundEnabled) {
      playCompletionChime();
    }

    if (currentMode === "focus") {
      setCompletedBlocks((prev) => prev + 1);
      const recordedDuration = focusConfig?.durationMinutes || 25;
      logStudySession({
        sessionType: "focus",
        topicId: currentTopic?.id || activeTopicId || "cn-m1-t1",
        subjectId: currentTopic?.subjectId || "cs-cn",
        moduleId: currentTopic?.moduleId || "cn-m1",
        taskId: focusConfig?.taskId || null,
        durationMinutes: recordedDuration,
        plannedDuration: recordedDuration,
        completed: true,
        difficulty: "okay",
        confidence: "confident"
      });
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  };

  // Timer Tick Mechanism (Timestamp-anchored for drift resistance)
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (!targetEndTimeRef.current) return;

        const remainingMs = targetEndTimeRef.current - Date.now();
        const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

        setTimeLeft(remainingSec);

        if (remainingSec <= 0) {
          handleCompleteSession();
        }
      }, 250);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, soundEnabled, currentMode, focusDuration, focusConfig, currentTopic, activeTopicId]);

  // Mode Switch Handler
  const handleSwitchMode = (modeKey) => {
    if (currentMode === modeKey && !isCompleted) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    sessionLoggedRef.current = false;
    setCurrentMode(modeKey);
    const newDuration = modeKey === "focus" ? focusDuration : MODES[modeKey].duration;
    setTimeLeft(newDuration);
    setIsRunning(false);
    setIsCompleted(false);
    targetEndTimeRef.current = null;
  };

  // Start / Pause / Resume Controls
  const handleToggleStartPause = () => {
    if (isCompleted) {
      // Reset first if completed
      sessionLoggedRef.current = false;
      setTimeLeft(totalDuration);
      setIsCompleted(false);
      targetEndTimeRef.current = Date.now() + totalDuration * 1000;
      setIsRunning(true);
      if (currentMode === "focus") {
        startActiveSession("focus", {
          topicId: currentTopic?.id || activeTopicId,
          subjectId: currentTopic?.subjectId,
          moduleId: currentTopic?.moduleId
        });
      }
      return;
    }

    if (isRunning) {
      // Pause: capture exact remaining seconds
      setIsRunning(false);
      targetEndTimeRef.current = null;
      stopActiveSession();
    } else {
      // Start or Resume
      sessionLoggedRef.current = false;
      const currentRemaining = timeLeft > 0 ? timeLeft : totalDuration;
      targetEndTimeRef.current = Date.now() + currentRemaining * 1000;
      setTimeLeft(currentRemaining);
      setIsRunning(true);
      setIsCompleted(false);
      if (currentMode === "focus") {
        startActiveSession("focus", {
          topicId: currentTopic?.id || activeTopicId,
          subjectId: currentTopic?.subjectId,
          moduleId: currentTopic?.moduleId
        });
      }
    }
  };

  // Reset Control
  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopActiveSession();
    setIsRunning(false);
    setTimeLeft(totalDuration);
    setIsCompleted(false);
    targetEndTimeRef.current = null;
    sessionLoggedRef.current = false;
  };

  // Helper formatting MM:SS
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Circular progress calculations
  const radius = 115;
  const circumference = 2 * Math.PI * radius; // ~722.57
  const progressRatio = Math.min(1, Math.max(0, (totalDuration - timeLeft) / (totalDuration || 1)));
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="page-container focus-page-container animate-fade-in">
      {/* ================= PAGE HEADER ================= */}
      <div className="focus-header-section">
        <h1 className="focus-title">Focus Mode</h1>
        <p className="focus-subtitle">
          {currentTopic ? (
            <span>Focus block for <strong>{currentTopic.title}</strong> ({currentTopic.subjectId?.toUpperCase() || "Study"})</span>
          ) : (
            "Distraction-free Pomodoro timer to help you stay in the zone."
          )}
        </p>
      </div>

      {/* ================= MAIN POMODORO CARD ================= */}
      <div className="card focus-timer-main-card">
        {/* Mode Selector Tabs (Focus, Short Break, Long Break) */}
        <div className="pomodoro-mode-tabs" role="tablist" aria-label="Timer modes">
          <button
            role="tab"
            aria-selected={currentMode === "focus"}
            className={`pomodoro-tab-btn ${currentMode === "focus" ? "active focus-active" : ""}`}
            onClick={() => handleSwitchMode("focus")}
          >
            <Brain size={18} />
            <span>Focus (25m)</span>
          </button>

          <button
            role="tab"
            aria-selected={currentMode === "shortBreak"}
            className={`pomodoro-tab-btn ${currentMode === "shortBreak" ? "active break-active" : ""}`}
            onClick={() => handleSwitchMode("shortBreak")}
          >
            <Coffee size={18} />
            <span>Short Break (5m)</span>
          </button>

          <button
            role="tab"
            aria-selected={currentMode === "longBreak"}
            className={`pomodoro-tab-btn ${currentMode === "longBreak" ? "active long-break-active" : ""}`}
            onClick={() => handleSwitchMode("longBreak")}
          >
            <Sparkles size={18} />
            <span>Long Break (15m)</span>
          </button>
        </div>

        {/* Circular Progress Indicator & Countdown Display */}
        <div className="pomodoro-timer-stage">
          <div className="circular-clock-wrapper">
            <svg
              className="timer-svg-ring"
              viewBox="0 0 260 260"
              aria-hidden="true"
            >
              {/* Background Ring Track */}
              <circle
                className="timer-track-circle"
                cx="130"
                cy="130"
                r={radius}
                strokeWidth="10"
              />
              {/* Dynamic Progress Fill Ring */}
              <circle
                className={`timer-progress-circle mode-${currentMode}`}
                cx="130"
                cy="130"
                r={radius}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Centered Countdown Numbers & Status */}
            <div className="clock-digits-center">
              <span
                className="big-time-display"
                aria-label={`Remaining time: ${formatTime(timeLeft)}`}
              >
                {formatTime(timeLeft)}
              </span>

              <div className="clock-status-caption">
                {isCompleted ? (
                  <span className="status-badge-completed">
                    <CheckCircle2 size={14} />
                    <span>Finished!</span>
                  </span>
                ) : isRunning ? (
                  <span className="status-badge-running">
                    <span className="pulsing-status-dot" />
                    <span>{currentMode === "focus" ? "Focusing" : "Resting"}</span>
                  </span>
                ) : timeLeft < totalDuration ? (
                  <span className="status-badge-paused">Paused</span>
                ) : (
                  <span className="status-badge-ready">{activeModeConfig.label}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Completion Announcement Banner */}
        {isCompleted && (
          <div className="completion-alert-banner animate-fade-in" role="alert">
            <div className="alert-content">
              <CheckCircle2 size={20} className="icon-success" />
              <div>
                <h4 className="alert-headline">
                  {currentMode === "focus"
                    ? "Focus session complete! 🎉"
                    : "Break finished!"}
                </h4>
                <p className="alert-subtext">
                  {currentMode === "focus"
                    ? "Great work staying locked in. Ready for a well-deserved break?"
                    : "Feeling refreshed? Switch back to Focus when you're ready to continue."}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleSwitchMode(currentMode === "focus" ? "shortBreak" : "focus")}
              >
                {currentMode === "focus" ? "Take a Break" : "Start Focus"}
              </button>
              {focusConfig?.taskId && (
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => navigateTo("planner")}
                >
                  Return to Study Plan
                </button>
              )}
            </div>
          </div>
        )}

        {/* Primary Timer Controls */}
        <div className="pomodoro-controls-row">
          {/* Reset Button */}
          <button
            className="btn btn-outline btn-lg reset-btn"
            onClick={handleReset}
            title="Reset timer to mode full duration"
            aria-label="Reset timer"
          >
            <RotateCcw size={18} />
            <span>Reset</span>
          </button>

          {/* Start / Pause / Resume Button */}
          <button
            className={`btn btn-lg main-action-btn ${isRunning ? "btn-pause" : "btn-primary"}`}
            onClick={handleToggleStartPause}
            aria-label={isRunning ? "Pause timer" : (timeLeft < totalDuration ? "Resume timer" : "Start timer")}
          >
            {isRunning ? (
              <>
                <Pause size={20} />
                <span>Pause</span>
              </>
            ) : timeLeft < totalDuration && timeLeft > 0 ? (
              <>
                <Play size={20} />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Play size={20} />
                <span>Start</span>
              </>
            )}
          </button>

          {/* Complete Early Button (Focus Mode) */}
          {currentMode === "focus" && isRunning && (
            <button
              className="btn btn-outline btn-lg complete-early-btn"
              onClick={handleCompleteSession}
              title="Finish focus session and record study time"
              aria-label="Complete session"
              style={{ borderColor: "var(--success)", color: "var(--success)" }}
            >
              <CheckCircle2 size={18} />
              <span>Complete</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            className={`btn btn-subtle sound-toggle-btn ${soundEnabled ? "sound-on" : "sound-off"}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute completion chime" : "Enable completion chime"}
            aria-label={soundEnabled ? "Mute chime" : "Enable chime"}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>

        {/* Completed Blocks Counter */}
        <div className="completed-sessions-footer">
          <div className="blocks-counter">
            <Flame size={16} className="text-warning" />
            <span>
              Focus sessions completed: <strong>{completedBlocks}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ================= INFORMATIVE POMODORO GUIDE ================= */}
      <div className="card pomodoro-guide-card">
        <h3 className="guide-title">How to use the Pomodoro technique</h3>
        <div className="guide-steps-grid">
          <div className="guide-step-item">
            <span className="step-num">1</span>
            <div className="step-text">
              <h4>Start 25 min Focus</h4>
              <p>Work on a single task without interruptions until the timer chimes.</p>
            </div>
          </div>

          <div className="guide-step-item">
            <span className="step-num">2</span>
            <div className="step-text">
              <h4>Take a 5 min Break</h4>
              <p>Step away from the screen, stretch, grab water, and relax.</p>
            </div>
          </div>

          <div className="guide-step-item">
            <span className="step-num">3</span>
            <div className="step-text">
              <h4>Repeat & Recharge</h4>
              <p>After 4 focus blocks, take a restorative 15-minute Long Break.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FOCUS PAGE CSS STYLES ================= */}
      <style>{`
        .focus-page-container {
          max-width: 680px;
          margin: 0 auto;
          padding-bottom: 40px;
        }

        .focus-header-section {
          text-align: center;
          margin-bottom: 24px;
        }

        .focus-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }

        .focus-subtitle {
          font-size: 1rem;
          color: var(--text-muted);
          margin: 0 auto;
        }

        /* ================= MAIN POMODORO CARD ================= */
        .focus-timer-main-card {
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 24px;
          border-radius: var(--radius-xl);
          background: var(--bg-surface);
          border: 1px solid var(--border);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }

        /* Mode Selector Tabs */
        .pomodoro-mode-tabs {
          display: flex;
          gap: 8px;
          padding: 6px;
          background: var(--bg-surface-hover);
          border-radius: var(--radius-full);
          border: 1px solid var(--border);
          margin-bottom: 28px;
          max-width: 100%;
          overflow-x: auto;
        }

        .pomodoro-tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: var(--radius-full);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pomodoro-tab-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.6);
        }

        .pomodoro-tab-btn.active {
          background: var(--bg-surface);
          color: var(--text-main);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .pomodoro-tab-btn.active.focus-active {
          color: #4f46e5;
        }

        .pomodoro-tab-btn.active.break-active {
          color: #059669;
        }

        .pomodoro-tab-btn.active.long-break-active {
          color: #0891b2;
        }

        /* ================= CIRCULAR TIMER ================= */
        .pomodoro-timer-stage {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 28px;
        }

        .circular-clock-wrapper {
          position: relative;
          width: 260px;
          height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .timer-svg-ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .timer-track-circle {
          fill: none;
          stroke: var(--border);
          opacity: 0.8;
        }

        .timer-progress-circle {
          fill: none;
          transition: stroke-dashoffset 0.3s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease;
        }

        .timer-progress-circle.mode-focus {
          stroke: #4f46e5;
        }

        .timer-progress-circle.mode-shortBreak {
          stroke: #10b981;
        }

        .timer-progress-circle.mode-longBreak {
          stroke: #06b6d4;
        }

        .clock-digits-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .big-time-display {
          font-family: var(--font-display, var(--font-sans));
          font-size: 3.6rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-main);
          line-height: 1;
          margin-bottom: 8px;
          font-variant-numeric: tabular-nums;
        }

        .clock-status-caption {
          min-height: 24px;
        }

        .status-badge-running {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .pulsing-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4f46e5;
          animation: pulseDot 1.5s infinite;
        }

        @keyframes pulseDot {
          0% { transform: scale(0.95); opacity: 0.6; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.6; }
        }

        .status-badge-paused {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-badge-ready {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .status-badge-completed {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.85rem;
          font-weight: 700;
          color: #059669;
        }

        /* ================= COMPLETION BANNER ================= */
        .completion-alert-banner {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: var(--radius-lg);
          margin-bottom: 24px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .alert-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .alert-headline {
          font-size: 0.95rem;
          font-weight: 700;
          color: #065f46;
          margin-bottom: 2px;
        }

        .alert-subtext {
          font-size: 0.82rem;
          color: #047857;
          margin: 0;
        }

        /* ================= CONTROLS ROW ================= */
        .pomodoro-controls-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          width: 100%;
          margin-bottom: 24px;
        }

        .main-action-btn {
          min-width: 160px;
          padding: 14px 28px;
          font-size: 1.05rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: var(--radius-full);
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.25);
          transition: all 0.2s ease;
        }

        .main-action-btn:hover {
          transform: translateY(-1px);
        }

        .btn-pause {
          background: #f1f5f9;
          color: #0f172a;
          border: 1px solid var(--border);
          box-shadow: none;
        }

        .btn-pause:hover {
          background: #e2e8f0;
        }

        .reset-btn {
          padding: 14px 20px;
          border-radius: var(--radius-full);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .sound-toggle-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          border: 1px solid var(--border);
        }

        .sound-toggle-btn.sound-on {
          color: var(--primary);
        }

        /* Completed Sessions Footer */
        .completed-sessions-footer {
          padding-top: 18px;
          border-top: 1px solid var(--border);
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .blocks-counter {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.86rem;
          color: var(--text-secondary);
        }

        /* ================= GUIDE CARD ================= */
        .pomodoro-guide-card {
          padding: 24px 28px;
          border-radius: var(--radius-lg);
        }

        .guide-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 16px;
        }

        .guide-steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 18px;
        }

        .guide-step-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .step-num {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--primary-subtle);
          color: var(--primary);
          font-weight: 800;
          font-size: 0.82rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .step-text h4 {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 2px;
        }

        .step-text p {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.45;
          margin: 0;
        }

        /* Mobile Adjustments */
        @media (max-width: 640px) {
          .focus-title {
            font-size: 1.6rem;
          }

          .pomodoro-mode-tabs {
            width: 100%;
          }

          .pomodoro-tab-btn {
            padding: 8px 12px;
            font-size: 0.82rem;
          }

          .circular-clock-wrapper {
            width: 220px;
            height: 220px;
          }

          .big-time-display {
            font-size: 3rem;
          }

          .pomodoro-controls-row {
            flex-direction: column;
            width: 100%;
          }

          .main-action-btn, .reset-btn {
            width: 100%;
          }

          .sound-toggle-btn {
            width: 100%;
            border-radius: var(--radius-md);
          }
        }
      `}</style>
    </div>
  );
}
