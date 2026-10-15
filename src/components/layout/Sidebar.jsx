import React from "react";
import {
  Home,
  BookOpen,
  Target,
  Brain,
  Edit3,
  Timer,
  BarChart3,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "syllabus", label: "My Syllabus", icon: BookOpen },
  { id: "planner", label: "Study Plan", icon: Target },
  { id: "learn", label: "Learn", icon: Brain },
  { id: "tutor", label: "AI Tutor", icon: Sparkles },
  { id: "practice", label: "Practice", icon: Edit3 },
  { id: "focus", label: "Focus", icon: Timer },
  { id: "progress", label: "My Progress", icon: BarChart3 },
  { id: "exams", label: "Exams", icon: Calendar },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) {
  const { currentPage, navigateTo, studentProfile } = useApp();

  const handleNavClick = (id) => {
    navigateTo(id);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="brand-lockup" onClick={() => handleNavClick("home")}>
            <div className="brand-logo">
              <Sparkles size={18} className="brand-icon" />
            </div>
            {!collapsed && (
              <div className="brand-text">
                <span className="brand-title">StudySense</span>
                <span className="brand-badge">AI</span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            className="collapse-toggle-btn desktop-only"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Mobile close button */}
          <button
            className="mobile-close-btn mobile-only"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    className={`nav-link ${isActive ? "active" : ""}`}
                    onClick={() => handleNavClick(item.id)}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={20} className="nav-icon" />
                    {!collapsed && <span className="nav-label">{item.label}</span>}
                    {isActive && <span className="active-indicator" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Compact User / Semester Footer */}
        <div className="sidebar-footer">
          <div
            className="student-preview-card"
            onClick={() => handleNavClick("settings")}
            title="Open Settings"
          >
            <div className="avatar-circle">
              {studentProfile?.name ? studentProfile.name.charAt(0) : "S"}
            </div>
            {!collapsed && (
              <div className="student-info">
                <span className="student-name">{studentProfile?.name || "Student"}</span>
                <span className="student-sem">{studentProfile?.semester || "Semester V"}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      <style>{`
        .sidebar-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(2px);
          z-index: 40;
          display: none;
        }

        .app-sidebar {
          width: var(--sidebar-width);
          background-color: var(--bg-sidebar);
          border-right: 1px solid var(--border);
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          z-index: 50;
          transition: width 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s ease;
          flex-shrink: 0;
        }

        .app-sidebar.collapsed {
          width: var(--sidebar-collapsed-width);
        }

        .sidebar-header {
          height: var(--topbar-height);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border-bottom: 1px solid var(--border-light);
        }

        .brand-lockup {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        }

        .brand-logo {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.35);
          flex-shrink: 0;
        }

        .brand-text {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .brand-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.15rem;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }

        .brand-badge {
          background-color: var(--primary-subtle);
          color: var(--primary);
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
        }

        .collapse-toggle-btn {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          border: 1px solid var(--border-light);
        }

        .collapse-toggle-btn:hover {
          background-color: var(--bg-surface-hover);
          color: var(--text-main);
        }

        .mobile-only {
          display: none;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 10px;
          overflow-y: auto;
        }

        .nav-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-link {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.92rem;
          position: relative;
          transition: background-color 0.15s, color 0.15s;
        }

        .nav-link:hover {
          background-color: var(--bg-surface-hover);
          color: var(--text-main);
        }

        .nav-link.active {
          background-color: var(--primary-subtle);
          color: var(--primary);
          font-weight: 600;
        }

        .nav-icon {
          flex-shrink: 0;
        }

        .nav-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .active-indicator {
          position: absolute;
          right: 8px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: var(--primary);
        }

        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid var(--border-light);
        }

        .student-preview-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background-color 0.15s;
        }

        .student-preview-card:hover {
          background-color: var(--bg-surface-hover);
        }

        .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #e2e8f0;
          color: var(--text-main);
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .student-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .student-name {
          font-size: 0.86rem;
          font-weight: 600;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .student-sem {
          font-size: 0.74rem;
          color: var(--text-muted);
          white-space: nowrap;
        }

        /* Mobile Breakpoint */
        @media (max-width: 768px) {
          .desktop-only {
            display: none;
          }

          .mobile-only {
            display: flex;
          }

          .sidebar-backdrop {
            display: block;
          }

          .app-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
            box-shadow: var(--shadow-lg);
            width: 260px !important;
          }

          .app-sidebar.mobile-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
