/**
 * Test Suite: Active Study Tracking Verification
 * Covers Scenarios A through F as specified in the requirements.
 */

import {
  normalizeStudySession
} from "../src/services/sessionService.js";
import {
  getStudySessionsByDate,
  getTodayStudySessions,
  getTotalStudyTime,
  getDailyStudyTime
} from "../src/services/storageService.js";

async function runTests() {
  console.log("==================================================");
  console.log("STARTING ACTIVE STUDY TRACKING TEST SUITE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = "") {
    if (condition) {
      console.log(`[PASS] ${testName} ${detail ? "- " + detail : ""}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${detail ? "- " + detail : ""}`);
      failed++;
    }
  }

  const todayStr = "2026-10-15";
  const yesterdayStr = "2026-10-14";

  // Base sample tasks
  let tasks = [
    { id: "task-1", title: "Study Network Layer", date: todayStr, durationMinutes: 45, status: "pending", isBreak: false },
    { id: "task-2", title: "Practice Routing Algorithms", date: todayStr, durationMinutes: 30, status: "pending", isBreak: false }
  ];

  // Base sessions (1 session of 30 mins recorded earlier today, 1 session from yesterday of 60 mins)
  let sessions = [
    normalizeStudySession({
      id: "sess-yesterday-1",
      started_at: `${yesterdayStr} 15:00:00`,
      durationMinutes: 60,
      completed: true,
      activity_type: "focus"
    }),
    normalizeStudySession({
      id: "sess-today-1",
      started_at: `${todayStr} 10:00:00`,
      durationMinutes: 30,
      completed: true,
      activity_type: "focus"
    })
  ];

  // Calculation helpers mimicking StudyPlan and Home
  function computeStudyPlanSummary(taskList, sessionList, selectedDate) {
    const dayTasks = taskList.filter((t) => t.date === selectedDate && !t.isBreak);
    const completed = dayTasks.filter((t) => t.status === "completed").length;
    const remaining = dayTasks.length - completed;
    const plannedMinutes = dayTasks.reduce((acc, t) => acc + (Number(t.durationMinutes) || 0), 0);
    const dateSessions = getStudySessionsByDate(selectedDate, sessionList);
    const actualMinutes = getTotalStudyTime(dateSessions);
    return {
      total: dayTasks.length,
      completed,
      remaining,
      plannedMinutes,
      actualMinutes,
      pct: dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0
    };
  }

  function computeHomeTelemetry(sessionList) {
    const todaySessions = getTodayStudySessions(sessionList);
    const totalMinutesToday = getTotalStudyTime(todaySessions);
    return {
      totalMinutesToday,
      todaySessionsCount: todaySessions.length,
      todaySessions
    };
  }

  // --------------------------------------------------
  // TEST A: Complete a task without a Focus session
  // --------------------------------------------------
  console.log("\n--- TEST A: Complete task without Focus session ---");
  const planBeforeA = computeStudyPlanSummary(tasks, sessions, todayStr);
  const homeBeforeA = computeHomeTelemetry(sessions);

  // User ticks task-1 checkbox
  tasks = tasks.map((t) => (t.id === "task-1" ? { ...t, status: "completed" } : t));
  const planAfterA = computeStudyPlanSummary(tasks, sessions, todayStr);
  const homeAfterA = computeHomeTelemetry(sessions);

  assert(planAfterA.completed === planBeforeA.completed + 1, "TEST A1: Completed task count increased", `from ${planBeforeA.completed} to ${planAfterA.completed}`);
  assert(planAfterA.pct === 50, "TEST A2: Day progress updated correctly", `50% (${planAfterA.completed}/${planAfterA.total})`);
  assert(planAfterA.actualMinutes === planBeforeA.actualMinutes, "TEST A3: Actual Active Study did NOT increase artificially", `${planAfterA.actualMinutes}m === ${planBeforeA.actualMinutes}m (did not add 45m planned duration)`);
  assert(homeAfterA.totalMinutesToday === homeBeforeA.totalMinutesToday, "TEST A4: Home dashboard study time unchanged", `${homeAfterA.totalMinutesToday}m`);

  // --------------------------------------------------
  // TEST B: Complete a genuine Focus session
  // --------------------------------------------------
  console.log("\n--- TEST B: Complete a genuine Focus session ---");
  const knownDuration = 25;
  const newFocusSession = normalizeStudySession({
    id: "sess-focus-test-b",
    started_at: `${todayStr} 14:00:00`,
    durationMinutes: knownDuration,
    completed: true,
    activity_type: "focus",
    topicId: "cn-m1-t1",
    taskId: "task-2"
  });

  sessions = [newFocusSession, ...sessions];

  const planAfterB = computeStudyPlanSummary(tasks, sessions, todayStr);
  const homeAfterB = computeHomeTelemetry(sessions);

  assert(planAfterB.actualMinutes === planBeforeA.actualMinutes + knownDuration, "TEST B1: Actual Active Study increased by recorded duration", `from ${planBeforeA.actualMinutes}m to ${planAfterB.actualMinutes}m (+${knownDuration}m)`);
  assert(homeAfterB.totalMinutesToday === homeBeforeA.totalMinutesToday + knownDuration, "TEST B2: Home dashboard study time increased by same duration", `from ${homeBeforeA.totalMinutesToday}m to ${homeAfterB.totalMinutesToday}m (+${knownDuration}m)`);
  assert(homeAfterB.todaySessionsCount === homeBeforeA.todaySessionsCount + 1, "TEST B3: Home session count incremented", `from ${homeBeforeA.todaySessionsCount} to ${homeAfterB.todaySessionsCount}`);
  assert(planAfterB.actualMinutes === homeAfterB.totalMinutesToday, "TEST B4: Both pages use identical study time source of truth", `StudyPlan: ${planAfterB.actualMinutes}m === Home: ${homeAfterB.totalMinutesToday}m`);

  // --------------------------------------------------
  // TEST C: Complete a task after studying
  // --------------------------------------------------
  console.log("\n--- TEST C: Complete task after studying ---");
  const actualMinutesBeforeC = planAfterB.actualMinutes;
  // User ticks task-2 (planned 30 mins)
  tasks = tasks.map((t) => (t.id === "task-2" ? { ...t, status: "completed" } : t));
  const planAfterC = computeStudyPlanSummary(tasks, sessions, todayStr);
  const homeAfterC = computeHomeTelemetry(sessions);

  assert(planAfterC.completed === 2 && planAfterC.pct === 100, "TEST C1: Task 2 marked complete and day progress is 100%", `completed: ${planAfterC.completed}/${planAfterC.total}`);
  assert(planAfterC.actualMinutes === actualMinutesBeforeC, "TEST C2: Focus session counted once, planned duration NOT added again", `${planAfterC.actualMinutes}m (expected ${actualMinutesBeforeC}m, NOT ${actualMinutesBeforeC + 30}m)`);
  assert(homeAfterC.totalMinutesToday === actualMinutesBeforeC, "TEST C3: Home study time remains consistent and not double-counted", `${homeAfterC.totalMinutesToday}m`);

  // --------------------------------------------------
  // TEST D: Refresh application
  // --------------------------------------------------
  console.log("\n--- TEST D: Refresh application simulation ---");
  // Simulate JSON serialization and reload
  const serialized = JSON.stringify(sessions);
  const reloadedSessions = JSON.parse(serialized).map(normalizeStudySession);

  const planAfterD = computeStudyPlanSummary(tasks, reloadedSessions, todayStr);
  const homeAfterD = computeHomeTelemetry(reloadedSessions);

  assert(reloadedSessions.length === sessions.length, "TEST D1: Session count matches after reload", `${reloadedSessions.length} sessions`);
  assert(planAfterD.actualMinutes === planAfterC.actualMinutes, "TEST D2: Study Plan actual study time matches before and after reload", `${planAfterD.actualMinutes}m`);
  assert(homeAfterD.totalMinutesToday === homeAfterC.totalMinutesToday, "TEST D3: Home dashboard study time matches before and after reload", `${homeAfterD.totalMinutesToday}m`);
  assert(new Set(reloadedSessions.map((s) => s.id)).size === reloadedSessions.length, "TEST D4: No duplicate session IDs exist", `Unique IDs: ${reloadedSessions.length}`);

  // --------------------------------------------------
  // TEST E: Date boundaries
  // --------------------------------------------------
  console.log("\n--- TEST E: Date boundaries ---");
  const yesterdaySessions = getStudySessionsByDate(yesterdayStr, sessions);
  const todaySessions = getStudySessionsByDate(todayStr, sessions);
  const todayFromHelper = getTodayStudySessions(sessions);

  assert(!todaySessions.some((s) => s.id === "sess-yesterday-1"), "TEST E1: Yesterday session NOT included in today total", "sess-yesterday-1 excluded from today");
  assert(yesterdaySessions.length === 1 && yesterdaySessions[0].id === "sess-yesterday-1", "TEST E2: Yesterday session correctly isolated to yesterday", `yesterday count: ${yesterdaySessions.length}`);
  assert(todaySessions.length === 2, "TEST E3: Only today's 2 sessions appear in today's total", `today count: ${todaySessions.length}`);
  assert(todayFromHelper.length === todaySessions.length, "TEST E4: getTodayStudySessions strictly matches today date boundary", `count: ${todayFromHelper.length}`);

  // --------------------------------------------------
  // TEST F: Existing functionality preserved
  // --------------------------------------------------
  console.log("\n--- TEST F: Existing functionality preserved ---");
  const rawSQLiteSession = {
    id: "sess-sqlite-space",
    started_at: "2026-10-14 09:30:00",
    active_duration_seconds: 1800,
    activity_type: "learn",
    completed: true
  };
  const normalizedSQLite = normalizeStudySession(rawSQLiteSession);
  assert(normalizedSQLite.date === "2026-10-14", "TEST F1: SQLite space-separated timestamps extract date without falling back to today", `date: ${normalizedSQLite.date}`);
  assert(normalizedSQLite.durationMinutes === 30, "TEST F2: active_duration_seconds converts accurately to durationMinutes", `${normalizedSQLite.durationMinutes}m`);
  assert(normalizedSQLite.activity_type === "learn", "TEST F3: activity_type preserved", normalizedSQLite.activity_type);

  console.log("\n==================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
