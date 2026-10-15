import React from "react";
import { Menu, Moon, Sun, Timer, Sparkles, BookOpen, Settings as SettingsIcon } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { NAV_ITEMS } from "./Sidebar";

export default function Navbar({ onOpenMobileMenu }) {
  const { currentPage, navigateTo, studentProfile, updateProfile } = useApp();

  const currentNav = NAV_ITEMS.find((item) => item.id === currentPage);

  const toggleTheme = () => {
    const nextTheme = studentProfile?.theme === "dark" ? "light" : "dark";
    updateProfile({ theme: nextTheme });
  };

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="view-title-group">
          <span className="view-title">{currentNav?.label || "StudySense"}</span>
          <span className="view-subtitle desktop-only">
            {currentPage === "home" && "Your academic command center"}
            {currentPage === "syllabus" && "Semester V Modules & Topics"}
            {currentPage === "planner" && "Daily Timetable & Tasks"}
            {currentPage === "learn" && "Deep Concept Learning & Revision"}
            {currentPage === "tutor" && "Interactive Gemini AI Study Partner"}
            {currentPage === "practice" && "Self-Assessment & Concept Quizzes"}
            {currentPage === "focus" && "Pomodoro Study Sessions"}
            {currentPage === "progress" && "Consistency & Performance"}
            {currentPage === "exams" && "Countdown & Readiness"}
            {currentPage === "settings" && "Preferences & Configuration"}
          </span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Quick Pomodoro Launch */}
        {currentPage !== "focus" && (
          <button
            className="btn btn-outline btn-sm quick-focus-btn"
            onClick={() => navigateTo("focus")}
            title="Start Focus Session"
          >
            <Timer size={15} />
            <span className="btn-label">Quick Focus</span>
          </button>
        )}

        {/* AI Tutor Dedicated Page Quick Link */}
        {currentPage !== "tutor" && (
          <button
            className="btn btn-subtle btn-sm quick-learn-btn"
            onClick={() => navigateTo("tutor")}
            title="Open AI Study Tutor"
          >
            <Sparkles size={15} />
            <span className="btn-label">AI Tutor</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          className="icon-action-btn"
          onClick={toggleTheme}
          title={
            studentProfile?.theme === "dark"
              ? "Switch to Light Mode"
              : "Switch to Dark Mode"
          }
          aria-label="Toggle theme"
        >
          {studentProfile?.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Settings Quick Action */}
        <button
          className={`icon-action-btn ${currentPage === "settings" ? "active" : ""}`}
          onClick={() => navigateTo("settings")}
          title="Settings & Preferences"
          aria-label="Settings & Preferences"
        >
          <SettingsIcon size={18} />
        </button>

        {/* User Pill */}
        <div
          className="user-profile-pill"
          onClick={() => navigateTo("settings")}
          title="Account & Settings"
        >
          <div className="pill-avatar">
            {studentProfile?.name ? studentProfile.name.charAt(0) : "S"}
          </div>
          <span className="pill-name desktop-only">
            {studentProfile?.name || "Student"}
          </span>
        </div>
      </div>

      <style>{`
        .app-topbar {
          height: var(--topbar-height);
          background-color: var(--bg-surface);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 30;
          backdrop-filter: blur(8px);
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .mobile-menu-btn {
          display: none;
          color: var(--text-main);
          padding: 6px;
          border-radius: var(--radius-sm);
        }

        .mobile-menu-btn:hover {
          background-color: var(--bg-surface-hover);
        }

        .view-title-group {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }

        .view-title {
          font-family: var(--font-display);
          font-size: 1.18rem;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }

        .view-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .icon-action-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
        }

        .icon-action-btn:hover {
          background-color: var(--bg-surface-hover);
          color: var(--text-main);
        }

        .user-profile-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px 4px 4px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-light);
          cursor: pointer;
          transition: background-color 0.15s;
        }

        .user-profile-pill:hover {
          background-color: var(--bg-surface-hover);
        }

        .pill-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pill-name {
          font-size: 0.86rem;
          font-weight: 600;
          color: var(--text-main);
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex;
          }

          .desktop-only {
            display: none !important;
          }

          .app-topbar {
            padding: 0 16px;
          }

          .quick-focus-btn .btn-label,
          .quick-learn-btn .btn-label {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
