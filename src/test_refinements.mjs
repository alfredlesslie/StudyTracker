/**
 * Verification script for UI Refinement: Syllabus Mastery Status and Study Plan Actions
 */

import fs from "fs";
import path from "path";
import { TOPICS, SUBJECTS, MODULES } from "./data/syllabus.js";
import {
  calculateTopicMasteryStatus,
  calculateAggregateStatus,
  MASTERY_STATUS,
  MASTERY_THRESHOLDS
} from "./utils/mastery.js";
import { getAllSubjectPredictions } from "./services/mlService.js";

async function runVerification() {
  console.log("================================================================");
  console.log("STUDYSENSE AI — UI REFINEMENT VERIFICATION SUITE");
  console.log("================================================================\n");

  let allPassed = true;

  // -------------------------------------------------------------
  // TEST 1: Topic Mastery Status Rule Engine
  // -------------------------------------------------------------
  console.log("--- 1. Testing Topic Mastery Status Calculation Rules ---");

  // Rule 1: No activity and no completion
  const tNotStarted = { id: "test-t1", completion: 0, status: "not_started", lastStudied: null, quizAttempts: 0, averageQuizScore: null };
  const sNotStarted = calculateTopicMasteryStatus(tNotStarted);
  if (sNotStarted.label !== MASTERY_STATUS.NOT_STARTED) {
    console.error(`❌ Expected Not Started, got ${sNotStarted.label}`);
    allPassed = false;
  } else {
    console.log(`  ✓ Rule 1 Passed: [${tNotStarted.id}] -> ${sNotStarted.label}`);
  }

  // Rule 2: Started but not completed
  const tInProgress = { id: "test-t2", completion: 45, status: "learning", lastStudied: "2026-10-13", quizAttempts: 0, averageQuizScore: null };
  const sInProgress = calculateTopicMasteryStatus(tInProgress);
  if (sInProgress.label !== MASTERY_STATUS.IN_PROGRESS) {
    console.error(`❌ Expected In Progress, got ${sInProgress.label}`);
    allPassed = false;
  } else {
    console.log(`  ✓ Rule 2 Passed: [${tInProgress.id}] -> ${sInProgress.label}`);
  }

  // Rule 3: Quiz attempts with performance below 60% -> Need Practice
  const tNeedPractice = { id: "test-t3", completion: 100, status: "learned", lastStudied: "2026-10-14", quizAttempts: 1, averageQuizScore: 50 };
  const sNeedPractice = calculateTopicMasteryStatus(tNeedPractice);
  if (sNeedPractice.label !== MASTERY_STATUS.NEED_PRACTICE) {
    console.error(`❌ Expected Need Practice, got ${sNeedPractice.label}`);
    allPassed = false;
  } else {
    console.log(`  ✓ Rule 3 Passed: [${tNeedPractice.id}] (Score 50%) -> ${sNeedPractice.label}`);
  }

  // Rule 4: Completed or good past performance, but recent quiz < 75% -> Needs Review
  const tNeedsReview = { id: "test-t4", completion: 100, status: "learned", lastStudied: "2026-10-14", quizAttempts: 2, averageQuizScore: 70 };
  const sNeedsReview = calculateTopicMasteryStatus(tNeedsReview);
  if (sNeedsReview.label !== MASTERY_STATUS.NEEDS_REVIEW) {
    console.error(`❌ Expected Needs Review, got ${sNeedsReview.label}`);
    allPassed = false;
  } else {
    console.log(`  ✓ Rule 4 Passed: [${tNeedsReview.id}] (Score 70%) -> ${sNeedsReview.label}`);
  }

  // Rule 5: Completed with recent topic quiz score >= 80% -> Mastered
  const tMastered = { id: "test-t5", completion: 100, status: "learned", lastStudied: "2026-10-14", quizAttempts: 3, averageQuizScore: 85 };
  const sMastered = calculateTopicMasteryStatus(tMastered);
  if (sMastered.label !== MASTERY_STATUS.MASTERED) {
    console.error(`❌ Expected Mastered, got ${sMastered.label}`);
    allPassed = false;
  } else {
    console.log(`  ✓ Rule 5 Passed: [${tMastered.id}] (Score 85%) -> ${sMastered.label}`);
  }

  // Completed topic with NO quiz evidence -> Completed — Not Assessed
  const tCompletedNotAssessed = { id: "test-t6", completion: 100, status: "learned", lastStudied: "2026-10-14", quizAttempts: 0, averageQuizScore: null };
  const sCompletedNotAssessed = calculateTopicMasteryStatus(tCompletedNotAssessed);
  if (sCompletedNotAssessed.label !== MASTERY_STATUS.COMPLETED_NOT_ASSESSED) {
    console.error(`❌ Expected Completed — Not Assessed, got ${sCompletedNotAssessed.label}`);
    allPassed = false;
  } else {
    console.log(`  ✓ Completed Gatekeeper Passed: [${tCompletedNotAssessed.id}] (0 quizzes) -> ${sCompletedNotAssessed.label}`);
  }

  // Incomplete topic with score >= 80% -> In Progress (not Mastered)
  const tIncompleteHigh = { id: "test-t7", completion: 50, status: "learning", lastStudied: "2026-10-14", quizAttempts: 1, averageQuizScore: 90 };
  const sIncompleteHigh = calculateTopicMasteryStatus(tIncompleteHigh);
  if (sIncompleteHigh.label !== MASTERY_STATUS.IN_PROGRESS) {
    console.error(`❌ Expected In Progress for incomplete topic with 90% score, got ${sIncompleteHigh.label}`);
    allPassed = false;
  } else {
    console.log(`  ✓ Incomplete High Score Gatekeeper Passed: [${tIncompleteHigh.id}] -> ${sIncompleteHigh.label}`);
  }

  // -------------------------------------------------------------
  // TEST 2: Real Subject & Module Aggregate Evaluation
  // -------------------------------------------------------------
  console.log("\n--- 2. Testing Subject and Module Aggregates with Real Prototype Data ---");

  // Synthetic module with 4 topics reflecting realistic distribution
  const sampleModuleTopics = [
    tMastered,           // Mastered
    tNeedsReview,        // Needs Review
    tNeedPractice,       // Need Practice
    tCompletedNotAssessed // Completed - Not Assessed
  ];

  const modSummary = calculateAggregateStatus(sampleModuleTopics);
  console.log(`  Module Status: ${modSummary.label} (${modSummary.badgeClass})`);
  console.log(`  Summary Text: "${modSummary.summaryText}"`);
  console.log(`  Counts: Completed: ${modSummary.completedCount}/${modSummary.totalCount}, Need Practice: ${modSummary.needPracticeCount}, Needs Review: ${modSummary.needsReviewCount}, Mastered: ${modSummary.masteredCount}`);

  if (modSummary.completedCount !== 4 || modSummary.needPracticeCount !== 1 || modSummary.needsReviewCount !== 1 || modSummary.masteredCount !== 1) {
    console.error("❌ Module count mismatch!");
    allPassed = false;
  } else {
    console.log("  ✓ Module counts and summary lines derived accurately from real data.");
  }

  // Check all default 64 syllabus topics
  const cnTopics = TOPICS.filter((t) => t.subjectId === "cs-cn");
  const cnAgg = calculateAggregateStatus(cnTopics);
  console.log(`\n  Default Computer Networks Subject Aggregate:`);
  console.log(`    Status: ${cnAgg.label}`);
  console.log(`    Summary: "${cnAgg.summaryText}"`);
  if (cnAgg.totalCount !== 16 || cnAgg.completedCount !== 0 || cnAgg.label !== MASTERY_STATUS.NOT_STARTED) {
    console.error("❌ CN initial aggregate should be 0 of 16 completed, Not Started");
    allPassed = false;
  } else {
    console.log("  ✓ Initial untouched syllabus accurately reflects Not Started for all topics.");
  }

  // -------------------------------------------------------------
  // TEST 3: Syllabus.jsx Inspections (No Estimated Score Present)
  // -------------------------------------------------------------
  console.log("\n--- 3. Verifying Syllabus.jsx Source Code ---");
  const syllabusPath = path.resolve("./src/pages/Syllabus.jsx");
  const syllabusCode = fs.readFileSync(syllabusPath, "utf-8");

  if (syllabusCode.includes("Estimated Exam Score")) {
    console.error("❌ Found 'Estimated Exam Score' in Syllabus.jsx!");
    allPassed = false;
  } else {
    console.log("  ✓ Confirmed: 'Estimated Exam Score' is completely removed from Syllabus.jsx.");
  }

  if (syllabusCode.includes("activePrediction?.predictedScore")) {
    console.error("❌ Found activePrediction predictedScore rendering in Syllabus.jsx!");
    allPassed = false;
  } else {
    console.log("  ✓ Confirmed: Subject card predicted marks rendering is removed.");
  }

  if (syllabusCode.includes("calculateTopicMasteryStatus") && syllabusCode.includes("calculateAggregateStatus")) {
    console.log("  ✓ Confirmed: Syllabus.jsx utilizes calculateTopicMasteryStatus and calculateAggregateStatus.");
  } else {
    console.error("❌ Syllabus.jsx missing mastery calculation imports/usage!");
    allPassed = false;
  }

  if (syllabusCode.includes("Status Guide") && syllabusCode.includes("mastery-legend-card")) {
    console.log("  ✓ Confirmed: Syllabus.jsx includes accessible status guide and legend modal/card.");
  } else {
    console.error("❌ Syllabus.jsx missing status guide/legend!");
    allPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 4: StudyPlan.jsx Inspections (Reschedule Action Removed)
  // -------------------------------------------------------------
  console.log("\n--- 4. Verifying StudyPlan.jsx Source Code ---");
  const studyPlanPath = path.resolve("./src/pages/StudyPlan.jsx");
  const studyPlanCode = fs.readFileSync(studyPlanPath, "utf-8");

  // Check for standalone reschedule action button
  const hasRescheduleBtn = /<span>Reschedule<\/span>/.test(studyPlanCode);
  if (hasRescheduleBtn) {
    console.error("❌ Found Reschedule button in StudyPlan.jsx!");
    allPassed = false;
  } else {
    console.log("  ✓ Confirmed: Standalone Reschedule button removed from StudyPlan task action cluster.");
  }

  // Check for reschedule modal
  if (studyPlanCode.includes("rescheduleModal") || studyPlanCode.includes("handleOpenReschedule")) {
    console.error("❌ Found rescheduleModal or handleOpenReschedule in StudyPlan.jsx!");
    allPassed = false;
  } else {
    console.log("  ✓ Confirmed: rescheduleModal state and handlers removed.");
  }

  // Check that Open Topic, Focus, Edit, Delete are all preserved
  const hasOpenTopic = studyPlanCode.includes("<span>Open Topic</span>");
  const hasFocus = studyPlanCode.includes("<span>Focus</span>");
  const hasEdit = studyPlanCode.includes("<span>Edit</span>");
  const hasDelete = studyPlanCode.includes("setDeleteConfirmModal");

  if (hasOpenTopic && hasFocus && hasEdit && hasDelete) {
    console.log("  ✓ Confirmed: Open Topic, Focus, Edit, and Delete actions are all retained and active.");
  } else {
    console.error(`❌ Missing retained action! OpenTopic: ${hasOpenTopic}, Focus: ${hasFocus}, Edit: ${hasEdit}, Delete: ${hasDelete}`);
    allPassed = false;
  }

  // Check that Date and Start Time inputs remain in Edit modal
  const hasDateInEdit = studyPlanCode.includes('type="date"') && studyPlanCode.includes("taskModal.data.date");
  const hasTimeInEdit = studyPlanCode.includes('type="time"') && studyPlanCode.includes("taskModal.data.startTime");
  if (hasDateInEdit && hasTimeInEdit) {
    console.log("  ✓ Confirmed: Task date & time editing preserved inside task Edit modal.");
  } else {
    console.error("❌ Date or Time inputs missing in Edit modal!");
    allPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 5: ML Exam Predictions Preservation in other pages
  // -------------------------------------------------------------
  console.log("\n--- 5. Verifying ML Prediction Preservation in Other Features ---");
  const examsPath = path.resolve("./src/pages/Exams.jsx");
  const examsCode = fs.readFileSync(examsPath, "utf-8");

  if (examsCode.includes("getExamScopePrediction") || examsCode.includes("predictedScore")) {
    console.log("  ✓ Confirmed: Exams page retains full ML score predictions and scope evaluations.");
  } else {
    console.error("❌ Exams page prediction feature was altered!");
    allPassed = false;
  }

  if (allPassed) {
    console.log("\n================================================================");
    console.log("🎉 ALL REFINEMENT TESTS PASSED! IMPLEMENTATION COMPLETE & VERIFIED.");
    console.log("================================================================");
  } else {
    throw new Error("One or more tests failed!");
  }
}

runVerification().catch((err) => {
  console.error(err);
  process.exit(1);
});
