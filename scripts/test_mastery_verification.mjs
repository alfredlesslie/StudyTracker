import assert from "node:assert";
import {
  calculateTopicMasteryStatus,
  calculateAggregateStatus,
  getTopicQuizEvidence,
  MASTERY_STATUS,
  MASTERY_THRESHOLDS
} from "../src/utils/mastery.js";

console.log("=== Testing Topic Mastery Status Logic (Section 8 Verification) ===\n");

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`✓ [PASS] Test ${total}: ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ [FAIL] Test ${total}: ${name}`);
    console.error(err);
  }
}

// 1. Not-started topic with no assessment
runTest("Not-started topic with no assessment", () => {
  const topic = { id: "test-t1", completion: 0, status: "not_started" };
  const res = calculateTopicMasteryStatus(topic, []);
  assert.strictEqual(res.id, "not_started");
  assert.strictEqual(res.label, MASTERY_STATUS.NOT_STARTED);
  assert.strictEqual(res.isCompleted, false);
  assert.strictEqual(res.score, null);
  assert.strictEqual(res.attemptsCount, 0);
});

// 2. In-progress topic with no assessment
runTest("In-progress topic with no assessment", () => {
  const topic = { id: "test-t2", completion: 45, status: "learning" };
  const res = calculateTopicMasteryStatus(topic, []);
  assert.strictEqual(res.id, "in_progress");
  assert.strictEqual(res.label, MASTERY_STATUS.IN_PROGRESS);
  assert.strictEqual(res.isCompleted, false);
  assert.strictEqual(res.score, null);
});

// 3. Completed topic with no assessment
runTest("Completed topic with no assessment", () => {
  const topic = { id: "test-t3", completion: 100, status: "learned" };
  const res = calculateTopicMasteryStatus(topic, []);
  assert.strictEqual(res.id, "completed_not_assessed");
  assert.strictEqual(res.label, MASTERY_STATUS.COMPLETED_NOT_ASSESSED);
  assert.strictEqual(res.isCompleted, true);
  assert.strictEqual(res.score, null);
});

// 4. Completed topic with a reliable 45% assessment result
runTest("Completed topic with a reliable 45% assessment result", () => {
  const topic = { id: "test-t4", completion: 100, status: "learned" };
  const attempts = [
    { topicId: "test-t4", score: 4.5, totalQuestions: 10, percentage: 45, attemptedAt: "2026-10-14T10:00:00Z" }
  ];
  const res = calculateTopicMasteryStatus(topic, attempts);
  assert.strictEqual(res.id, "need_practice");
  assert.strictEqual(res.label, MASTERY_STATUS.NEED_PRACTICE);
  assert.strictEqual(res.isCompleted, true, "Completed state must be preserved");
  assert.strictEqual(res.score, 45);
  assert.strictEqual(res.attemptsCount, 1);
});

// 5. Completed topic with a reliable 70% result and evidence that review is needed
runTest("Completed topic with a reliable 70% result and evidence that review is needed", () => {
  const topic = { id: "test-t5", completion: 100, status: "learned" };
  const attempts = [
    { topicId: "test-t5", score: 7, totalQuestions: 10, percentage: 70, attemptedAt: "2026-10-14T10:00:00Z" }
  ];
  const res = calculateTopicMasteryStatus(topic, attempts);
  assert.strictEqual(res.id, "needs_review");
  assert.strictEqual(res.label, MASTERY_STATUS.NEEDS_REVIEW);
  assert.strictEqual(res.isCompleted, true);
  assert.strictEqual(res.score, 70);
  assert.strictEqual(res.attemptsCount, 1);
});

// 6. Completed topic with reliable recent 85% performance
runTest("Completed topic with reliable recent 85% performance", () => {
  const topic = { id: "test-t6", completion: 100, status: "learned" };
  const attempts = [
    { topicId: "test-t6", score: 8.5, totalQuestions: 10, percentage: 85, attemptedAt: "2026-10-14T10:00:00Z" }
  ];
  const res = calculateTopicMasteryStatus(topic, attempts);
  assert.strictEqual(res.id, "mastered");
  assert.strictEqual(res.label, MASTERY_STATUS.MASTERED);
  assert.strictEqual(res.isCompleted, true);
  assert.strictEqual(res.score, 85);
  assert.strictEqual(res.attemptsCount, 1);
});

// 7. Topic with missing assessment scores
runTest("Topic with missing assessment scores", () => {
  const completedTopic = { id: "test-t7a", completion: 100 };
  const incompleteTopic = { id: "test-t7b", completion: 30 };
  const attempts = [
    { topicId: "test-t7a", score: null, percentage: null, attemptedAt: "2026-10-14T10:00:00Z" },
    { topicId: "test-t7b", score: undefined, totalQuestions: 0 }
  ];
  const resA = calculateTopicMasteryStatus(completedTopic, attempts);
  assert.strictEqual(resA.id, "completed_not_assessed");
  assert.strictEqual(resA.score, null);

  const resB = calculateTopicMasteryStatus(incompleteTopic, attempts);
  assert.strictEqual(resB.id, "in_progress");
  assert.strictEqual(resB.score, null);
});

// 8. Topic with unrelated quiz attempts
runTest("Topic with unrelated quiz attempts", () => {
  const topic = { id: "topic-target", completion: 100 };
  const attempts = [
    { topicId: "topic-other", score: 10, totalQuestions: 10, percentage: 100 },
    { topicId: "topic-target", examId: "exam-123", format: "Exam Practice", score: 0, totalQuestions: 10, percentage: 0 },
    { topic_id: "topic-target", exam_id: "exam-456", format: "Mixed Module Exam Practice", score: 2, totalQuestions: 10, percentage: 20 }
  ];
  const res = calculateTopicMasteryStatus(topic, attempts);
  assert.strictEqual(res.id, "completed_not_assessed");
  assert.strictEqual(res.score, null);
  assert.strictEqual(res.attemptsCount, 0);
});

// 9. Topic with multiple attempts and a valid recent score
runTest("Topic with multiple attempts and a valid recent score", () => {
  const topic = { id: "topic-mult", completion: 100 };
  const attempts = [
    { topicId: "topic-mult", score: 2, totalQuestions: 10, percentage: 20, attemptedAt: "2026-10-10T08:00:00Z" },
    { topicId: "topic-mult", score: 6, totalQuestions: 10, percentage: 60, attemptedAt: "2026-10-12T09:00:00Z" },
    { topicId: "topic-mult", score: 9, totalQuestions: 10, percentage: 90, attemptedAt: "2026-10-14T11:00:00Z" }
  ];
  const res = calculateTopicMasteryStatus(topic, attempts);
  assert.strictEqual(res.id, "mastered");
  assert.strictEqual(res.score, 90, "Should use most recent valid attempt");
  assert.strictEqual(res.attemptsCount, 3);
});

// 10. Subject and module summaries matching their topic data
runTest("Subject and module summaries matching their topic data", () => {
  const topics = [
    { id: "t1", completion: 100 }, // completed, will have 90% -> Mastered
    { id: "t2", completion: 100 }, // completed, will have 40% -> Need Practice
    { id: "t3", completion: 100 }, // completed, will have 70% -> Needs Review
    { id: "t4", completion: 100 }, // completed, no quiz -> Completed — Not Assessed
  ];
  const attempts = [
    { topicId: "t1", score: 9, totalQuestions: 10, percentage: 90 },
    { topicId: "t2", score: 4, totalQuestions: 10, percentage: 40 },
    { topicId: "t3", score: 7, totalQuestions: 10, percentage: 70 }
  ];
  const agg = calculateAggregateStatus(topics, attempts);
  assert.strictEqual(agg.totalCount, 4);
  assert.strictEqual(agg.completedCount, 4);
  assert.strictEqual(agg.masteredCount, 1);
  assert.strictEqual(agg.needPracticeCount, 1);
  assert.strictEqual(agg.needsReviewCount, 1);
  assert.strictEqual(agg.completedNotAssessedCount, 1);
  assert.strictEqual(agg.statusId, "need_practice");
});

// 11. Status filters returning the correct topics
runTest("Status filters returning the correct topics", () => {
  const topics = [
    { id: "t1", title: "Topic 1", completion: 100 },
    { id: "t2", title: "Topic 2", completion: 100 },
    { id: "t3", title: "Topic 3", completion: 50 },
    { id: "t4", title: "Topic 4", completion: 0 }
  ];
  const attempts = [
    { topicId: "t1", percentage: 85 },
    { topicId: "t2", percentage: 50 }
  ];

  const filter = (filterLabel) => {
    return topics.filter((t) => {
      if (filterLabel === "All") return true;
      const status = calculateTopicMasteryStatus(t, attempts);
      return status.label === filterLabel;
    });
  };

  assert.strictEqual(filter("All").length, 4);
  assert.strictEqual(filter(MASTERY_STATUS.MASTERED).length, 1);
  assert.strictEqual(filter(MASTERY_STATUS.MASTERED)[0].id, "t1");
  assert.strictEqual(filter(MASTERY_STATUS.NEED_PRACTICE).length, 1);
  assert.strictEqual(filter(MASTERY_STATUS.NEED_PRACTICE)[0].id, "t2");
  assert.strictEqual(filter(MASTERY_STATUS.IN_PROGRESS).length, 1);
  assert.strictEqual(filter(MASTERY_STATUS.IN_PROGRESS)[0].id, "t3");
  assert.strictEqual(filter(MASTERY_STATUS.NOT_STARTED).length, 1);
  assert.strictEqual(filter(MASTERY_STATUS.NOT_STARTED)[0].id, "t4");
});

// 12. Overall syllabus completion remaining unchanged by mastery-status calculations
runTest("Overall syllabus completion remaining unchanged by mastery-status calculations", () => {
  const topics = [
    { id: "t1", completion: 100 },
    { id: "t2", completion: 100 },
    { id: "t3", completion: 50 },
    { id: "t4", completion: 0 }
  ];
  // Calculate completion before mastery evaluation
  const completionBefore = Math.round(topics.reduce((acc, t) => acc + (t.completion || 0), 0) / topics.length);
  assert.strictEqual(completionBefore, 63); // (100 + 100 + 50 + 0) / 4 = 62.5 -> 63

  // Perform mastery evaluations with weak quiz results
  const attempts = [
    { topicId: "t1", percentage: 20 },
    { topicId: "t2", percentage: 10 }
  ];
  topics.forEach((t) => calculateTopicMasteryStatus(t, attempts));
  calculateAggregateStatus(topics, attempts);

  // Completion percentage must remain exactly 63%
  const completionAfter = Math.round(topics.reduce((acc, t) => acc + (t.completion || 0), 0) / topics.length);
  assert.strictEqual(completionAfter, 63);
  assert.strictEqual(completionAfter, completionBefore);
});

// Exact legacy case: "OSI and TCP/IP Reference Models" (cn-m1-t1) with mixed attempts
runTest("Exact legacy case: cn-m1-t1 ignoring 30 exam practice attempts and using genuine topic score", () => {
  const legacyTopic = {
    id: "cn-m1-t1",
    title: "OSI and TCP/IP Reference Models",
    completion: 100,
    status: "learned"
  };

  // Simulating the 30 exam attempts (including the 0% exam attempt) plus genuine standalone attempts
  const allAttempts = [];
  // 30 exam attempts
  for (let i = 1; i <= 30; i++) {
    allAttempts.push({
      id: `exam-att-${i}`,
      topicId: "cn-m1-t1", // previously misattributed
      examId: `exam-cs-cn-${i}`,
      format: "Mixed Module Exam Practice",
      percentage: i === 15 ? 0 : 80,
      score: i === 15 ? 0 : 4,
      totalQuestions: 5,
      attemptedAt: "2026-10-14T09:33:51Z"
    });
  }
  // Genuine standalone topic attempts
  allAttempts.push({
    id: "topic-att-1",
    topicId: "cn-m1-t1",
    format: "Quick Practice",
    percentage: 80,
    score: 4,
    totalQuestions: 5,
    attemptedAt: "2026-10-14T15:47:11Z"
  });

  const res = calculateTopicMasteryStatus(legacyTopic, allAttempts);
  assert.strictEqual(res.id, "mastered", "Should be Mastered because genuine standalone attempt was 80%");
  assert.strictEqual(res.score, 80);
  assert.strictEqual(res.attemptsCount, 1, "Should only count the 1 genuine topic attempt");
  assert.strictEqual(res.isCompleted, true);
});

console.log(`\n=== Verification Results: ${passed}/${total} Tests Passed ===`);
if (passed === total) {
  console.log("ALL TESTS PASSED SUCCESSFULLY! ✓");
} else {
  process.exit(1);
}
