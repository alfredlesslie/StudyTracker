import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { SUBJECTS, MODULES, TOPICS } from "../data/syllabus";
import {
  INITIAL_STUDENT_PROFILE,
  INITIAL_TODAY_TASKS,
  INITIAL_STUDY_SESSIONS,
  INITIAL_QUIZ_ATTEMPTS
} from "../data/sampleData";
import {
  saveQuizAttempt,
  updateTopicPerformance,
  saveStudySession,
  getStudySessions,
  calculateStudyStreak,
  getDailyGoal,
  setDailyGoal as persistDailyGoal,
  getStudyPlan,
  saveStudyPlan,
  getStudyTasks,
  saveStudyTask,
  updateStudyTask,
  deleteStudyTask,
  getTasksForDate,
  getUpcomingTasks,
  getOverdueTasks,
  getCompletedTasks,
  generateDailyStudyPlan,
  updateStudyPlanItem,
  getExams,
  saveExam,
  updateExam,
  deleteExam,
  startActiveSession,
  stopActiveSession,
  recordCompletedActivity,
  getTopicStudyTime,
  getSubjectStudyTime,
  getDailyStudyTime,
  getWeeklyStudyTime,
  getStudyTimeBreakdown,
  getStudySessionsByDate,
  getTodayStudySessions,
  getTotalStudyTime
} from "../services/storageService";
import { checkBackendReachable } from "../services/apiClient";
import { isMigrationCompleted, runInitialDataMigration } from "../services/migrationService";
import {
  getExamsAsync,
  createExamAsync,
  updateExamAsync,
  deleteExamAsync,
  toggleExamModuleCompletionAsync,
  toggleExamTopicCompletionAsync
} from "../services/examService";
import {
  getProgressAsync,
  updateTopicProgressAsync
} from "../services/progressService";
import {
  getStudySessionsAsync,
  logStudySessionAsync,
  normalizeStudySession
} from "../services/sessionService";
import {
  getQuizHistoryAsync,
  submitQuizAttemptAsync,
  normalizeQuizAttempt
} from "../services/quizService";
import {
  getStudyPlansAsync,
  createStudyPlanAsync,
  updateStudyPlanAsync,
  deleteStudyPlanAsync,
  syncStudyPlanAsync
} from "../services/studyPlanService";
import { getExamScopePrediction } from "../services/mlService";

const AppContext = createContext();

const STORAGE_KEYS = {
  PAGE: "studysense_page_v2",
  PROFILE: "studysense_profile_v2",
  TOPICS: "studysense_topics_v2",
  TASKS: "studysense_tasks_v2",
  SESSIONS: "studysense_sessions_v2",
  QUIZZES: "studysense_quizzes_v2",
  ACTIVE_TOPIC: "studysense_active_topic_v2",
  EXAMS: "studysense_exams_v2"
};

export function AppProvider({ children }) {
  // Sync page with hash if present, else localStorage or "home"
  const getInitialPage = () => {
    const fullHash = typeof window !== "undefined" ? window.location.hash || "" : "";
    const hash = fullHash
      .replace(/^#\/?/, "")
      .split("?")[0]
      .replace(/\/$/, "");
    const queryString = fullHash.includes("?") ? fullHash.split("?")[1] : "";
    if (queryString) {
      const params = new URLSearchParams(queryString);
      const topicParam = params.get("topic");
      if (topicParam && TOPICS.some((t) => t.id === topicParam)) {
        try {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_TOPIC, topicParam);
        } catch (e) {}
      }
    }
    const validPages = [
      "home",
      "syllabus",
      "planner",
      "learn",
      "practice",
      "focus",
      "progress",
      "exams",
      "settings",
      "tutor",
      "ai-tutor",
      "example"
    ];
    if (hash === "example") return "learn";
    if (validPages.includes(hash)) return hash;
    return localStorage.getItem(STORAGE_KEYS.PAGE) || "home";
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [tutorSessionContext, setTutorSessionContext] = useState(null);
  const [customPracticeQuestions, setCustomPracticeQuestions] = useState(null);
  const [activeTopicId, setActiveTopicId] = useState(() => {
    const fullHash = typeof window !== "undefined" ? window.location.hash || "" : "";
    if (fullHash.includes("?")) {
      const params = new URLSearchParams(fullHash.split("?")[1]);
      const topicParam = params.get("topic");
      if (topicParam && TOPICS.some((t) => t.id === topicParam)) {
        return topicParam;
      }
    }
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TOPIC);
    const exists = TOPICS.some(t => t.id === saved);
    return exists ? saved : "cn-m2-t2";
  });

  const [studentProfile, setStudentProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch (e) {}
    return INITIAL_STUDENT_PROFILE;
  });

  const [topics, setTopics] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TOPICS);
    if (!saved) return TOPICS;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 64 && parsed[0]?.subjectId === "cs-cn") {
        return parsed;
      }
    } catch (e) {}
    return TOPICS;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : INITIAL_TODAY_TASKS;
  });

  const [sessions, setSessions] = useState(() => {
    const stored = getStudySessions();
    const list = stored.length > 0 ? stored : INITIAL_STUDY_SESSIONS;
    return list.map(normalizeStudySession);
  });

  const [dailyGoal, setDailyGoalState] = useState(getDailyGoal);
  const updateDailyGoal = (mins) => {
    setDailyGoalState(mins);
    persistDailyGoal(mins);
  };

  const [studyPlan, setStudyPlanState] = useState(() => {
    const stored = getStudyPlan();
    return stored.length > 0 ? stored : [];
  });

  const [quizAttempts, setQuizAttempts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUIZZES);
    const parsed = saved ? JSON.parse(saved) : INITIAL_QUIZ_ATTEMPTS;
    return Array.isArray(parsed) ? parsed.map(normalizeQuizAttempt) : [];
  });

  const [exams, setExams] = useState(() => {
    return getExams();
  });

  // Dedicated Exam Practice Quiz Modal State
  const [examPracticeModal, setExamPracticeModal] = useState({
    isOpen: false,
    examId: null
  });

  // Dedicated focus session configuration when launched from study plan tasks or recommendations
  const [focusConfig, setFocusConfig] = useState(null);

  // Authoritative scope-aware exam predictions shared across Home, Exams, and Progress
  const [examScopePredictions, setExamScopePredictions] = useState({});

  const refreshExamScopePrediction = async (examId) => {
    if (!examId) return null;
    try {
      const pred = await getExamScopePrediction(examId, true);
      if (pred) {
        setExamScopePredictions((prev) => ({
          ...prev,
          [examId]: pred
        }));
      }
      return pred;
    } catch (e) {
      return null;
    }
  };

  const startExamPractice = (examId) => {
    setExamPracticeModal({
      isOpen: true,
      examId
    });
  };

  const closeExamPractice = () => {
    const currentId = examPracticeModal.examId;
    setExamPracticeModal({
      isOpen: false,
      examId: null
    });
    if (currentId) {
      refreshExamScopePrediction(currentId);
    }
  };

  // Synchronize scope predictions whenever exams change
  useEffect(() => {
    if (exams && exams.length > 0) {
      exams.forEach((exam) => {
        getExamScopePrediction(exam.id).then((pred) => {
          if (pred) {
            setExamScopePredictions((prev) => ({
              ...prev,
              [exam.id]: pred
            }));
          }
        }).catch(() => {});
      });
    }
  }, [exams]);

  // Backend connection & synchronization state
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync hash and page
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAGE, currentPage);
    const currentHashBase = (window.location.hash || "").replace(/^#\/?/, "").split("?")[0].replace(/\/$/, "");
    if (currentHashBase !== currentPage) {
      window.location.hash = `#/${currentPage}`;
    }
  }, [currentPage]);

  useEffect(() => {
    const handleHashChange = () => {
      const fullHash = typeof window !== "undefined" ? window.location.hash || "" : "";
      const hash = fullHash
        .replace(/^#\/?/, "")
        .split("?")[0]
        .replace(/\/$/, "");
      const queryString = fullHash.includes("?") ? fullHash.split("?")[1] : "";
      if (queryString) {
        const params = new URLSearchParams(queryString);
        const topicParam = params.get("topic");
        if (topicParam && TOPICS.some((t) => t.id === topicParam)) {
          setActiveTopicId(topicParam);
        }
      }
      const validPages = [
        "home",
        "syllabus",
        "planner",
        "learn",
        "practice",
        "focus",
        "progress",
        "exams",
        "settings",
        "tutor",
        "ai-tutor",
        "example"
      ];
      if (hash === "example") {
        if (currentPage !== "learn") setCurrentPage("learn");
      } else if (validPages.includes(hash) && hash !== currentPage) {
        setCurrentPage(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [currentPage]);

  // Persist states to local storage cache
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TOPIC, activeTopicId);
  }, [activeTopicId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(studentProfile));
    if (studentProfile?.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [studentProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizAttempts));
  }, [quizAttempts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  }, [exams]);

  // INITIAL BACKEND CONNECTION & BI-DIRECTIONAL SYNCHRONIZATION
  useEffect(() => {
    let isMounted = true;

    async function syncWithBackend() {
      const online = await checkBackendReachable(true);
      if (!isMounted) return;
      setIsBackendOnline(online);

      if (!online) {
        return;
      }

      setIsSyncing(true);

      // 1. Run safe migration for existing local storage data if not yet migrated
      if (!isMigrationCompleted()) {
        try {
          await runInitialDataMigration();
        } catch (err) {
          console.warn("[AppContext] Initial migration warning:", err);
        }
      }

      // 2. Fetch authoritative records from backend database
      try {
        const [serverExams, serverProgress, serverSessions, serverQuizzes, serverPlans] =
          await Promise.all([
            getExamsAsync().catch(() => null),
            getProgressAsync().catch(() => null),
            getStudySessionsAsync().catch(() => null),
            getQuizHistoryAsync().catch(() => null),
            getStudyPlansAsync().catch(() => null)
          ]);

        if (!isMounted) return;

        if (Array.isArray(serverExams) && serverExams.length > 0) {
          setExams(serverExams);
        }

        if (Array.isArray(serverSessions) && serverSessions.length > 0) {
          setSessions(serverSessions.map(normalizeStudySession));
        }

        if (Array.isArray(serverQuizzes) && serverQuizzes.length > 0) {
          setQuizAttempts(serverQuizzes.map(normalizeQuizAttempt));
        }

        if (Array.isArray(serverPlans) && serverPlans.length > 0) {
          setStudyPlanState(serverPlans);
        }

        if (Array.isArray(serverProgress) && serverProgress.length > 0) {
          setTopics((prevTopics) => {
            const progressMap = new Map(
              serverProgress.map((p) => [p.topic_id || p.id, p])
            );
            return prevTopics.map((t) => {
              const p = progressMap.get(t.id);
              if (!p) return t;
              return {
                ...t,
                completion: p.completion !== undefined ? p.completion : t.completion,
                mastery: p.mastery || t.mastery,
                status: p.status || t.status,
                quizAttempts: p.quiz_attempts !== undefined ? p.quiz_attempts : t.quizAttempts,
                averageQuizScore:
                  p.average_quiz_score !== undefined ? p.average_quiz_score : t.averageQuizScore,
                lastStudied: p.last_studied
                  ? new Date(p.last_studied).toLocaleDateString()
                  : t.lastStudied
              };
            });
          });
        }
      } catch (err) {
        console.warn("[AppContext] Backend sync error:", err);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    }

    syncWithBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  // Navigation action
  const navigateTo = (page, topicId = null, extraParam = null) => {
    if (page === "example") {
      const targetId = topicId || activeTopicId;
      if (targetId) setActiveTopicId(targetId);
      window.location.hash = targetId
        ? `#/learn?topic=${targetId}&section=example`
        : `#/learn?section=example`;
      setCurrentPage("learn");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (topicId) {
      setActiveTopicId(topicId);
      const extraQuery = extraParam ? `&${extraParam}` : "";
      window.location.hash = `#/${page}?topic=${topicId}${extraQuery}`;
    } else {
      window.location.hash = `#/${page}`;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectTopic = (topicId) => {
    if (!topicId) return;
    setActiveTopicId(topicId);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TOPIC, topicId);
    } catch (e) {}

    // Synchronize URL hash query param immediately so refreshes and bookmarks work without triggering hashchange loops
    if (typeof window !== "undefined") {
      const fullHash = window.location.hash || "";
      const page = fullHash.replace(/^#\/?/, "").split("?")[0].replace(/\/$/, "");
      if (["learn", "example", "practice", "focus", "tutor", "ai-tutor"].includes(page)) {
        const queryPart = fullHash.includes("?") ? fullHash.split("?")[1] : "";
        const params = new URLSearchParams(queryPart);
        params.set("topic", topicId);
        const newHash = `#/${page}?${params.toString()}`;
        if (window.location.hash !== newHash) {
          window.history.replaceState(null, "", newHash);
        }
      }
    }
  };

  // Helper selectors
  const getActiveTopic = () => {
    return topics.find((t) => t.id === activeTopicId) || topics[0];
  };

  const getActiveSubject = () => {
    const currentTopic = getActiveTopic();
    return SUBJECTS.find((s) => s.id === currentTopic?.subjectId) || SUBJECTS[0];
  };

  const getActiveModule = () => {
    const currentTopic = getActiveTopic();
    return MODULES.find((m) => m.id === currentTopic?.moduleId) || MODULES[0];
  };

  // State mutators
  const updateTopic = (topicId, partialData) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, ...partialData } : t))
    );

    // Asynchronously synchronize with backend TopicProgress
    if (
      partialData.completion !== undefined ||
      partialData.mastery !== undefined ||
      partialData.status !== undefined ||
      partialData.quizAttempts !== undefined ||
      partialData.averageQuizScore !== undefined
    ) {
      updateTopicProgressAsync(topicId, {
        completion: partialData.completion,
        mastery: partialData.mastery,
        status: partialData.status,
        quiz_attempts: partialData.quizAttempts,
        average_quiz_score: partialData.averageQuizScore
      }).catch(() => {});
    }
  };

  const toggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const addTask = (newTask) => {
    const task = {
      id: `task-${Date.now()}`,
      time: newTask.time || "8:00 PM",
      title: newTask.title,
      subjectName: newTask.subjectName || "Self Study",
      duration: Number(newTask.duration) || 30,
      type: newTask.type || "Revision",
      completed: false,
      isBreak: Boolean(newTask.isBreak),
      topicId: newTask.topicId || null
    };
    setTasks((prev) => [...prev, task]);
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const logStudySession = async (sessionData) => {
    const activeTop =
      topics.find((t) => t.id === (sessionData.topicId || activeTopicId)) || getActiveTopic();
    const activeSub =
      SUBJECTS.find((s) => s.id === (sessionData.subjectId || activeTop?.subjectId)) ||
      getActiveSubject();
    const activeMod =
      MODULES.find((m) => m.id === (sessionData.moduleId || activeTop?.moduleId)) ||
      getActiveModule();

    // Log to backend & local storage
    const saved = await logStudySessionAsync({
      topicId: activeTop?.id || "cn-m1-t1",
      subjectId: activeSub?.id || "cs-cn",
      moduleId: activeMod?.id || "cn-m1",
      taskId: sessionData.taskId || sessionData.task_id || focusConfig?.taskId || null,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      durationMinutes: Number(sessionData.durationMinutes) || 0,
      plannedDuration: Number(sessionData.plannedDuration) || 25,
      completed: sessionData.completed !== undefined ? Boolean(sessionData.completed) : true,
      difficulty: sessionData.difficulty || "okay",
      confidence: sessionData.confidence || "somewhat_confident",
      sessionType: sessionData.sessionType || "focus",
      date: sessionData.date
    });

    const normalizedSaved = normalizeStudySession(saved);
    setSessions((prev) => [normalizedSaved, ...prev.filter((s) => s.id !== normalizedSaved.id)]);

    // Update topic lastStudied without inflating syllabus completion
    if (activeTop) {
      updateTopic(activeTop.id, {
        lastStudied: "Today",
        status:
          activeTop.status === "not_started"
            ? "learning"
            : activeTop.status
      });
    }

    // Record unified activity (Focus modality)
    recordCompletedActivity({
      type: "focus",
      subjectId: activeSub?.id,
      moduleId: activeMod?.id,
      topicId: activeTop?.id,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      durationMinutes: Number(sessionData.durationMinutes) || 0,
      date: sessionData.date
    });

    return saved;
  };

  const logQuizAttempt = async (attemptData) => {
    const isExamQuiz = Boolean(attemptData.examId || attemptData.exam_id);
    const targetTopicId = attemptData.topicId || (isExamQuiz ? null : activeTopicId);
    const targetSubject = attemptData.subjectId || getActiveSubject().id;
    const targetModule = attemptData.moduleId || (isExamQuiz ? null : getActiveModule().id);
    const targetExamId = attemptData.examId || attemptData.exam_id || null;

    // Submit to backend & local storage
    const savedAttempt = await submitQuizAttemptAsync({
      examId: targetExamId,
      topicId: targetTopicId,
      subjectId: targetSubject,
      moduleId: targetModule,
      moduleScope: attemptData.moduleScope || attemptData.moduleScopeJson,
      moduleScopeJson: attemptData.moduleScopeJson || attemptData.moduleScope,
      moduleResults: attemptData.moduleResults || attemptData.moduleResultsJson,
      moduleResultsJson: attemptData.moduleResultsJson || attemptData.moduleResults,
      score: attemptData.score,
      totalQuestions: attemptData.totalQuestions,
      answers: attemptData.answers || [],
      questions: attemptData.questions || [],
      unansweredCount: attemptData.unansweredCount,
      correctCount: attemptData.correctCount,
      incorrectCount: attemptData.incorrectCount,
      difficulty: attemptData.difficulty || "medium",
      format: attemptData.format || (isExamQuiz ? "Mixed Module Exam Practice" : "Quick Practice"),
      percentage: attemptData.percentage,
      durationSeconds: attemptData.durationSeconds || 0
    });

    // Record unified activity (Practice modality)
    recordCompletedActivity({
      type: "practice",
      subjectId: targetSubject,
      moduleId: targetModule,
      topicId: targetTopicId,
      durationMinutes: Math.max(1, Math.round((attemptData.totalQuestions || 5) * 1.5)),
      date: new Date().toISOString().split("T")[0]
    });

    const normalizedSaved = normalizeQuizAttempt(savedAttempt);

    setQuizAttempts((prev) => [
      normalizedSaved,
      ...prev.filter((a) => a.id !== normalizedSaved.id)
    ]);

    // STRICT SEPARATION: Only update TopicProgress for single-topic quizzes (never exam-wide practice quizzes)
    if (!isExamQuiz && targetTopicId) {
      const updated = updateTopicPerformance(
        topics,
        savedAttempt.topicId,
        savedAttempt.score,
        savedAttempt.totalQuestions
      );
      setTopics(updated);

      // Sync updated topic progress to backend
      const updatedTopic = updated.find((t) => t.id === targetTopicId);
      if (updatedTopic) {
        updateTopicProgressAsync(targetTopicId, {
          completion: updatedTopic.completion,
          mastery: updatedTopic.mastery,
          status: updatedTopic.status,
          quiz_attempts: updatedTopic.quizAttempts,
          average_quiz_score: updatedTopic.averageQuizScore
        }).catch(() => {});
      }
    } else if (isExamQuiz && targetExamId) {
      // Automatically refresh the scope-aware prediction for this exam
      refreshExamScopePrediction(targetExamId);
    }

    return savedAttempt;
  };

  // Learning experience helpers
  const startTopicLearning = (topicId) => {
    setTopics((prev) => {
      const target = prev.find((t) => t.id === topicId);
      if (!target) return prev;
      const newStatus = target.status === "not_started" ? "learning" : target.status;
      if (target.status === newStatus && target.lastStudied === "Just now") {
        return prev;
      }
      return prev.map((t) => {
        if (t.id !== topicId) return t;
        return {
          ...t,
          status: newStatus,
          lastStudied: "Just now",
          learningProgress: t.learningProgress || 0
        };
      });
    });
  };

  const updateTopicLearningProgress = (topicId, progress, isCompleted = false) => {
    let targetTopicUpdates = null;

    setTopics((prev) => {
      const target = prev.find((t) => t.id === topicId);
      if (!target) return prev;
      const newProgress = Math.max(0, Math.min(100, Number(progress) || 0));
      let newCompletion = newProgress;
      let newStatus = target.status;

      if (isCompleted || newCompletion >= 100) {
        // Completed the learn session -> syllabus completion is 100%
        newCompletion = 100;
        newStatus = "learned";
      } else if (newCompletion > 0) {
        newStatus = "learning";
      } else {
        newStatus = target.status === "learned" ? "learned" : "not_started";
      }

      // If progress and status are unchanged, skip re-render and backend dispatch
      if (
        (target.completion || 0) === newCompletion &&
        (target.learningProgress || 0) === newProgress &&
        target.status === newStatus
      ) {
        return prev;
      }

      targetTopicUpdates = {
        learningProgress: newProgress,
        completion: newCompletion,
        status: newStatus,
        lastStudied: newCompletion > 0 ? "Just now" : target.lastStudied
      };

      return prev.map((t) => (t.id === topicId ? { ...t, ...targetTopicUpdates } : t));
    });

    // Persist to backend only when updates actually occurred
    if (targetTopicUpdates) {
      updateTopicProgressAsync(topicId, {
        completion: targetTopicUpdates.completion,
        status: targetTopicUpdates.status
      }).catch(() => {});
    }
  };

  const completeTopicLearning = (topicId, markAs = true) => {
    let targetTopicUpdates = null;

    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        const newCompletion = markAs ? 100 : 0;
        const newStatus = markAs ? "learned" : "not_started";
        const newProgress = markAs ? 100 : 0;

        targetTopicUpdates = {
          learningProgress: newProgress,
          completion: newCompletion,
          status: newStatus,
          lastStudied: markAs ? "Just now" : t.lastStudied
        };

        return {
          ...t,
          ...targetTopicUpdates
        };
      })
    );

    // Persist to backend
    if (targetTopicUpdates) {
      updateTopicProgressAsync(topicId, {
        completion: targetTopicUpdates.completion,
        status: targetTopicUpdates.status
      }).catch(() => {});
    }
  };

  const setTopicConfidence = (topicId, confidenceLevel) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        return {
          ...t,
          confidence: confidenceLevel
        };
      })
    );
  };

  const updateProfile = (partial) => {
    setStudentProfile((prev) => ({ ...prev, ...partial }));
  };

  const resetAllData = () => {
    localStorage.clear();
    setTopics(TOPICS);
    setTasks(INITIAL_TODAY_TASKS);
    setSessions(INITIAL_STUDY_SESSIONS);
    setQuizAttempts(INITIAL_QUIZ_ATTEMPTS);
    setStudentProfile(INITIAL_STUDENT_PROFILE);
    setActiveTopicId("cn-m2-t2");
    setCurrentPage("home");
  };

  // AI Tutor Navigation & Context Helpers
  const openTutorWithTopic = (topicId, initialAction = null) => {
    if (topicId) setActiveTopicId(topicId);
    setTutorSessionContext({
      topicId: topicId || activeTopicId,
      initialAction,
      mistakeDetails: null
    });
    navigateTo("tutor", topicId);
  };

  const openTutorForMistake = ({ topic, question, studentAnswer, correctAnswer }) => {
    const targetId = topic?.id || activeTopicId;
    setActiveTopicId(targetId);
    setTutorSessionContext({
      topicId: targetId,
      initialAction,
      mistakeDetails: { topic, question, studentAnswer, correctAnswer }
    });
    navigateTo("tutor", targetId);
  };

  const startPracticeWithQuestions = (topicId, questions, format = "Quick Practice") => {
    if (topicId) setActiveTopicId(topicId);
    setCustomPracticeQuestions({ topicId, questions, format });
    navigateTo("practice", topicId);
  };

  const clearCustomPracticeQuestions = () => {
    setCustomPracticeQuestions(null);
  };

  const startFocusForTopic = (topicId, durationMinutes = 25, taskId = null) => {
    if (topicId) setActiveTopicId(topicId);
    setFocusConfig({
      topicId: topicId || activeTopicId,
      durationMinutes: Number(durationMinutes) || 25,
      taskId: taskId || null
    });
    navigateTo("focus", topicId);
  };

  const generatePlan = (params = {}) => {
    const generated = generateDailyStudyPlan({
      ...params,
      topics,
      exams,
      sessions,
      quizAttempts
    });
    setStudyPlanState(generated);
    syncStudyPlanAsync(generated).catch(() => {});
    return generated;
  };

  const updatePlanItem = (itemId, updates) => {
    const updated = updateStudyTask(itemId, updates);
    setStudyPlanState(updated);
    syncStudyPlanAsync(updated).catch(() => {});
    return updated;
  };

  // Study Plan Task CRUD handlers connected to backend
  const addStudyTask = async (taskData) => {
    const created = saveStudyTask(taskData);
    const all = getStudyTasks();
    setStudyPlanState(all);
    syncStudyPlanAsync(all).catch(() => {});
    return created;
  };

  const editStudyTask = async (taskId, partialUpdates) => {
    const updated = updateStudyTask(taskId, partialUpdates);
    setStudyPlanState(updated);
    syncStudyPlanAsync(updated).catch(() => {});
    return updated;
  };

  const removeStudyTask = async (taskId) => {
    const updated = deleteStudyTask(taskId);
    setStudyPlanState(updated);
    syncStudyPlanAsync(updated).catch(() => {});
    return updated;
  };

  const toggleStudyTaskComplete = (taskId) => {
    const current = (studyPlan || []).find((t) => t.id === taskId);
    if (!current) return;
    const nextStatus = current.status === "completed" ? "pending" : "completed";
    return editStudyTask(taskId, { status: nextStatus });
  };

  const rescheduleStudyTask = (taskId, newDate, newStartTime) => {
    return editStudyTask(taskId, {
      date: newDate,
      startTime: newStartTime || "19:00",
      status: "pending"
    });
  };

  // Exam CRUD handlers connected to backend
  const addExam = async (examData) => {
    const saved = await createExamAsync(examData);
    setExams((prev) => [saved, ...prev.filter((e) => e.id !== saved.id)]);
    return saved;
  };

  const editExam = async (examId, partialUpdates) => {
    const updated = await updateExamAsync(examId, partialUpdates);
    setExams((prev) => prev.map((e) => (e.id === examId ? { ...e, ...updated } : e)));
    return updated;
  };

  const removeExam = async (examId) => {
    await deleteExamAsync(examId);
    setExams((prev) => prev.filter((e) => e.id !== examId));
  };

  const refreshExams = async () => {
    const loaded = await getExamsAsync();
    setExams(loaded);
    return loaded;
  };

  const toggleExamModuleCompletion = async (examId, moduleId, completed = undefined) => {
    let targetStatus = completed;
    setExams((prev) =>
      prev.map((e) => {
        if (e.id !== examId) return e;
        const currentCompleted = e.completedModuleIds || e.completed_module_ids || [];
        const isNowComplete = completed !== undefined ? completed : !currentCompleted.includes(moduleId);
        targetStatus = isNowComplete;
        const nextCompleted = isNowComplete
          ? Array.from(new Set([...currentCompleted, moduleId]))
          : currentCompleted.filter((id) => id !== moduleId);

        return {
          ...e,
          completedModuleIds: nextCompleted,
          completed_module_ids: nextCompleted
        };
      })
    );

    const updated = await toggleExamModuleCompletionAsync(examId, moduleId, targetStatus);
    if (updated) {
      setExams((prev) => prev.map((e) => (e.id === examId ? { ...e, ...updated } : e)));
    }

    // Refresh the scope prediction for this exam so cards and dashboard reflect the new completion state
    refreshExamScopePrediction(examId);

    return updated;
  };

  const toggleExamTopicCompletion = async (examId, topicId, completed = undefined) => {
    let targetStatus = completed;
    setExams((prev) =>
      prev.map((e) => {
        if (e.id !== examId) return e;
        const currentCompleted = e.completedTopicIds || e.completed_topic_ids || [];
        const isNowComplete = completed !== undefined ? completed : !currentCompleted.includes(topicId);
        targetStatus = isNowComplete;
        const nextCompleted = isNowComplete
          ? Array.from(new Set([...currentCompleted, topicId]))
          : currentCompleted.filter((id) => id !== topicId);

        return {
          ...e,
          completedTopicIds: nextCompleted,
          completed_topic_ids: nextCompleted
        };
      })
    );

    const updated = await toggleExamTopicCompletionAsync(examId, topicId, targetStatus);
    if (updated) {
      setExams((prev) => prev.map((e) => (e.id === examId ? { ...e, ...updated } : e)));
    }

    // Refresh the scope prediction for this exam so cards and dashboard reflect the new completion state
    refreshExamScopePrediction(examId);

    return updated;
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        navigateTo,
        activeTopicId,
        selectTopic,
        getActiveTopic,
        getActiveSubject,
        getActiveModule,
        studentProfile,
        updateProfile,
        topics,
        updateTopic,
        tasks,
        setTasks,
        toggleTask,
        addTask,
        deleteTask,
        sessions,
        logStudySession,
        quizAttempts,
        logQuizAttempt,
        exams,
        setExams,
        addExam,
        editExam,
        removeExam,
        refreshExams,
        toggleExamModuleCompletion,
        toggleExamTopicCompletion,
        examScopePredictions,
        refreshExamScopePrediction,
        examPracticeModal,
        examPracticeModalState: examPracticeModal,
        startExamPractice,
        closeExamPractice,
        startTopicLearning,
        updateTopicLearningProgress,
        completeTopicLearning,
        setTopicConfidence,
        resetAllData,
        tutorSessionContext,
        setTutorSessionContext,
        openTutorWithTopic,
        openTutorForMistake,
        customPracticeQuestions,
        setCustomPracticeQuestions,
        startPracticeWithQuestions,
        clearCustomPracticeQuestions,
        startFocusForTopic,
        focusConfig,
        setFocusConfig,
        dailyGoal,
        updateDailyGoal,
        studyPlan,
        setStudyPlan: (p) => {
          setStudyPlanState(p);
          saveStudyPlan(p);
          syncStudyPlanAsync(p).catch(() => {});
        },
        generatePlan,
        updatePlanItem,
        addStudyTask,
        editStudyTask,
        removeStudyTask,
        toggleStudyTaskComplete,
        rescheduleStudyTask,
        // Centralized Unified Activity Tracking & Session Helpers
        startActiveSession,
        stopActiveSession,
        recordCompletedActivity,
        getTopicStudyTime,
        getSubjectStudyTime,
        getDailyStudyTime: (dateStr) => getDailyStudyTime(dateStr, sessions),
        getWeeklyStudyTime,
        getStudyTimeBreakdown,
        getStudySessionsByDate: (dateStr) => getStudySessionsByDate(dateStr, sessions),
        getTodayStudySessions: () => getTodayStudySessions(sessions),
        getTotalStudyTime: (list) => getTotalStudyTime(list || sessions),
        // Full-Stack Connectivity & Synchronization
        isBackendOnline,
        isSyncing
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
