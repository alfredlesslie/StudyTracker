import {
  calculateTopicMasteryStatus,
  calculateAggregateStatus,
  MASTERY_STATUS,
  MASTERY_THRESHOLDS
} from "./mastery.js";

console.log("=== TESTING TOPIC MASTERY RULES & PRECEDENCE ===");

// Scenario 1: Topic with no learning activity and no completion
const t1 = { id: "t1", completion: 0, status: "not_started", lastStudied: null, quizAttempts: 0, averageQuizScore: null };
const s1 = calculateTopicMasteryStatus(t1);
console.assert(s1.label === MASTERY_STATUS.NOT_STARTED, `Expected Not Started, got ${s1.label}`);
console.log("✓ Rule 1 Passed: No activity -> Not Started");

// Scenario 2: Topic started (progress > 0) but not completed, no quiz
const t2 = { id: "t2", completion: 35, status: "learning", lastStudied: "2026-10-10", quizAttempts: 0, averageQuizScore: null };
const s2 = calculateTopicMasteryStatus(t2);
console.assert(s2.label === MASTERY_STATUS.IN_PROGRESS, `Expected In Progress, got ${s2.label}`);
console.log("✓ Rule 2 Passed: Started but incomplete -> In Progress");

// Scenario 3: Topic with quiz attempts and score < 60% (e.g. 50%) -> Need Practice
const t3 = { id: "t3", completion: 100, status: "learned", lastStudied: "2026-10-12", quizAttempts: 2, averageQuizScore: 50 };
const s3 = calculateTopicMasteryStatus(t3);
console.assert(s3.label === MASTERY_STATUS.NEED_PRACTICE, `Expected Need Practice, got ${s3.label}`);
console.log("✓ Rule 3 Passed: Quiz score < 60% -> Need Practice (even when completed)");

// Scenario 4: Topic completed with quiz score between 60% and 79% (e.g. 70%) -> Needs Review
const t4 = { id: "t4", completion: 100, status: "learned", lastStudied: "2026-10-12", quizAttempts: 1, averageQuizScore: 70 };
const s4 = calculateTopicMasteryStatus(t4);
console.assert(s4.label === MASTERY_STATUS.NEEDS_REVIEW, `Expected Needs Review, got ${s4.label}`);
console.log("✓ Rule 4 Passed: Completed with score 70% (<75%) -> Needs Review");

// Scenario 5: Topic completed with quiz score >= 80% (e.g. 85%) -> Mastered
const t5 = { id: "t5", completion: 100, status: "learned", lastStudied: "2026-10-12", quizAttempts: 3, averageQuizScore: 85 };
const s5 = calculateTopicMasteryStatus(t5);
console.assert(s5.label === MASTERY_STATUS.MASTERED, `Expected Mastered, got ${s5.label}`);
console.log("✓ Rule 5 Passed: Completed with score >= 80% -> Mastered");

// Scenario 6: Incomplete topic with score >= 80% -> In Progress (Mastered requires completion)
const t6 = { id: "t6", completion: 50, status: "learning", lastStudied: "2026-10-12", quizAttempts: 1, averageQuizScore: 85 };
const s6 = calculateTopicMasteryStatus(t6);
console.assert(s6.label === MASTERY_STATUS.IN_PROGRESS, `Expected In Progress, got ${s6.label}`);
console.log("✓ Mastered Gatekeeper Passed: Incomplete topic with high quiz score cannot be Mastered -> In Progress");

// Scenario 7: Completed topic with NO quiz assessment data -> Completed — Not Assessed
const t7 = { id: "t7", completion: 100, status: "learned", lastStudied: "2026-10-12", quizAttempts: 0, averageQuizScore: null };
const s7 = calculateTopicMasteryStatus(t7);
console.assert(s7.label === MASTERY_STATUS.COMPLETED_NOT_ASSESSED, `Expected Completed — Not Assessed, got ${s7.label}`);
console.log("✓ No Fake Score Gatekeeper Passed: Completed topic with 0 quizzes -> Completed — Not Assessed");

// Scenario 8: Topic-linked quiz attempts list overriding topic cached fields
const t8 = { id: "t8", completion: 100, status: "learned", quizAttempts: 0, averageQuizScore: null };
const attempts = [{ topicId: "t8", percentage: 90, date: "2026-10-14" }];
const s8 = calculateTopicMasteryStatus(t8, attempts);
console.assert(s8.label === MASTERY_STATUS.MASTERED, `Expected Mastered with linked attempt, got ${s8.label}`);
console.log("✓ Topic-linked quiz array evaluation passed");

// Scenario 9: Aggregate status tests
console.log("\n=== TESTING AGGREGATE SUMMARY CALCULATIONS ===");
// All topics not started -> Not Started
const agg1 = calculateAggregateStatus([t1, { ...t1, id: "t1_b" }]);
console.assert(agg1.label === MASTERY_STATUS.NOT_STARTED, `Expected Not Started, got ${agg1.label}`);
console.log("✓ All untouched -> Not Started");

// Incomplete topics -> In Progress
const agg2 = calculateAggregateStatus([t1, t2]);
console.assert(agg2.label === MASTERY_STATUS.IN_PROGRESS, `Expected In Progress, got ${agg2.label}`);
console.log("✓ Some untouched, some started -> In Progress");

// All completed with no quiz evidence -> Completed — Not Assessed
const agg3 = calculateAggregateStatus([t7, { ...t7, id: "t7_b" }]);
console.assert(agg3.label === MASTERY_STATUS.COMPLETED_NOT_ASSESSED, `Expected Completed — Not Assessed, got ${agg3.label}`);
console.log("✓ All completed with 0 quizzes -> Completed — Not Assessed");

// All completed with strong quiz evidence -> Mastered
const agg4 = calculateAggregateStatus([t5, { ...t5, id: "t5_b" }]);
console.assert(agg4.label === MASTERY_STATUS.MASTERED, `Expected Mastered, got ${agg4.label}`);
console.log("✓ All completed with 80%+ quiz -> Mastered");

// Incomplete with weak quiz results -> Need Practice
const agg5 = calculateAggregateStatus([t2, t3]);
console.assert(agg5.label === MASTERY_STATUS.NEED_PRACTICE, `Expected Need Practice, got ${agg5.label}`);
console.log("✓ Incomplete with weak quiz -> Need Practice");

// Summary text verification
console.log("Aggregate summary text:", agg5.summaryText);
console.assert(agg5.summaryLines[0] === "1 of 2 topics completed");
console.assert(agg5.summaryLines[1] === "1 topic needs practice");

console.log("\nALL TOPIC MASTERY & AGGREGATE TESTS PASSED SUCCESSFULLY!");
