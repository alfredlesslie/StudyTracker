import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";

// Pages
import Home from "./pages/Home";
import Syllabus from "./pages/Syllabus";
import StudyPlan from "./pages/StudyPlan";
import Learn from "./pages/Learn";
import Practice from "./pages/Practice";
import Focus from "./pages/Focus";
import Progress from "./pages/Progress";
import Exams from "./pages/Exams";
import Settings from "./pages/Settings";
import AITutor from "./pages/AITutor";

// Modals
import ExamPracticeModal from "./components/exam/ExamPracticeModal";

// Mobile Quick Navigation Bar Icons
import { Home as HomeIcon, BookOpen, Brain, Edit3, Timer, Sparkles, Settings as SettingsNavIcon } from "lucide-react";

function MainAppShell() {
  const { currentPage, navigateTo, examPracticeModal, examPracticeModalState, closeExamPractice } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Render current view
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return <Home />;
      case "syllabus":
        return <Syllabus />;
      case "planner":
        return <StudyPlan />;
      case "learn":
      case "example":
        return <Learn />;
      case "tutor":
      case "ai-tutor":
        return <AITutor />;
      case "practice":
        return <Practice />;
      case "focus":
        return <Focus />;
      case "progress":
        return <Progress />;
      case "exams":
        return <Exams />;
      case "settings":
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="app-layout">
      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Navbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="main-scroll-view" role="main">
          {renderCurrentPage()}
        </main>

        {/* Mobile Bottom Navigation Bar (High Frequency Quick Actions) */}
        <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
          <button
            className={`bottom-nav-item ${currentPage === "home" ? "active" : ""}`}
            onClick={() => navigateTo("home")}
          >
            <HomeIcon size={18} />
            <span>Home</span>
          </button>
          <button
            className={`bottom-nav-item ${currentPage === "syllabus" ? "active" : ""}`}
            onClick={() => navigateTo("syllabus")}
          >
            <BookOpen size={18} />
            <span>Syllabus</span>
          </button>
          <button
            className={`bottom-nav-item ${currentPage === "learn" ? "active" : ""}`}
            onClick={() => navigateTo("learn")}
          >
            <Brain size={18} />
            <span>Learn</span>
          </button>
          <button
            className={`bottom-nav-item ${currentPage === "practice" ? "active" : ""}`}
            onClick={() => navigateTo("practice")}
          >
            <Edit3 size={18} />
            <span>Practice</span>
          </button>
          <button
            className={`bottom-nav-item ${currentPage === "focus" ? "active" : ""}`}
            onClick={() => navigateTo("focus")}
          >
            <Timer size={18} />
            <span>Focus</span>
          </button>
          <button
            className={`bottom-nav-item ${currentPage === "settings" ? "active" : ""}`}
            onClick={() => navigateTo("settings")}
          >
            <SettingsNavIcon size={18} />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Dedicated Exam Practice Quiz Modal */}
      {(examPracticeModalState?.isOpen || examPracticeModal?.isOpen) && (
        <ExamPracticeModal
          examId={examPracticeModalState?.examId || examPracticeModal?.examId}
          onClose={closeExamPractice}
        />
      )}

      <style>{`
        .main-scroll-view {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .mobile-bottom-bar {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background-color: var(--bg-surface);
          border-top: 1px solid var(--border);
          z-index: 35;
          align-items: center;
          justify-content: space-around;
          padding: 0 10px;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
        }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 500;
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          transition: color 0.15s;
        }

        .bottom-nav-item.active {
          color: var(--primary);
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .mobile-bottom-bar {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}
