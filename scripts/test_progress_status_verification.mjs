import assert from "node:assert";
import {
  calculateTopicStatus,
  calculateAggregateStatus,
  getTopicProgress,
  SYLLABUS_STATUS
} from "../src/utils/mastery.js";

console.log("=== StudySense AI — Testing Progress-Based Status Logic (Section 10) ===\n");

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

// 1. Table Verification: exact progress values
const exactValues = [
  { progress: 0, expected: SYLLABUS_STATUS.NOT_STARTED, id: "not_started" },
  { progress: 1, expected: SYLLABUS_STATUS.NEED_PRACTICE, id: "need_practice" },
  { progress: 25, expected: SYLLABUS_STATUS.NEED_PRACTICE, id: "need_practice" },
  { progress: 49, expected: SYLLABUS_STATUS.NEED_PRACTICE, id: "need_practice" },
  { progress: 50, expected: SYLLABUS_STATUS.IN_PROGRESS, id: "in_progress" },
  { progress: 75, expected: SYLLABUS_STATUS.IN_PROGRESS, id: "in_progress" },
  { progress: 99, expected: SYLLABUS_STATUS.IN_PROGRESS, id: "in_progress" },
  { progress: 100, expected: SYLLABUS_STATUS.COMPLETED, id: "completed" },
];

exactValues.forEach(({ progress, expected, id }) => {
  runTest(`Exact Table Value: ${progress}% -> ${expected}`, () => {
    const res = calculateTopicStatus(progress);
    assert.strictEqual(res.label, expected);
    assert.strictEqual(res.id, id);
    assert.strictEqual(res.isCompleted, progress === 100);
  });
});

// 2. Quiz scores do not override progress-based statuses
runTest("Quiz scores do not override progress-based statuses", () => {
  // Topic with 30% progress, but 100% quiz score -> must remain Need Practice
  const topicWeak = { id: "t-weak", completion: 30, quizAttempts: 5, averageQuizScore: 100 };
  assert.strictEqual(calculateTopicStatus(topicWeak).label, SYLLABUS_STATUS.NEED_PRACTICE);

  // Topic with 75% progress, but 10% quiz score -> must remain In Progress
  const topicMid = { id: "t-mid", completion: 75, quizAttempts: 10, averageQuizScore: 10 };
  assert.strictEqual(calculateTopicStatus(topicMid).label, SYLLABUS_STATUS.IN_PROGRESS);

  // Topic with 100% progress, but 0% quiz score -> must remain Completed
  const topicDone = { id: "t-done", completion: 100, quizAttempts: 30, averageQuizScore: 0 };
  assert.strictEqual(calculateTopicStatus(topicDone).label, SYLLABUS_STATUS.COMPLETED);

  // Topic with 0% progress -> must be Not Started regardless of any quiz
  const topicZero = { id: "t-zero", completion: 0, quizAttempts: 2, averageQuizScore: 90 };
  assert.strictEqual(calculateTopicStatus(topicZero).label, SYLLABUS_STATUS.NOT_STARTED);
});

// 3. Module statuses match their aggregate progress
runTest("Module statuses match their aggregate progress", () => {
  // Module A: four topics at 0% -> 0% average -> Not Started
  const modA = [{ completion: 0 }, { completion: 0 }, { completion: 0 }, { completion: 0 }];
  const aggA = calculateAggregateStatus(modA);
  assert.strictEqual(aggA.progress, 0);
  assert.strictEqual(aggA.label, SYLLABUS_STATUS.NOT_STARTED);

  // Module B: topics at 20%, 30%, 40%, 10% -> 25% average -> Need Practice
  const modB = [{ completion: 20 }, { completion: 30 }, { completion: 40 }, { completion: 10 }];
  const aggB = calculateAggregateStatus(modB);
  assert.strictEqual(aggB.progress, 25);
  assert.strictEqual(aggB.label, SYLLABUS_STATUS.NEED_PRACTICE);

  // Module C: topics at 60%, 70%, 80%, 50% -> 65% average -> In Progress
  const modC = [{ completion: 60 }, { completion: 70 }, { completion: 80 }, { completion: 50 }];
  const aggC = calculateAggregateStatus(modC);
  assert.strictEqual(aggC.progress, 65);
  assert.strictEqual(aggC.label, SYLLABUS_STATUS.IN_PROGRESS);

  // Module D: topics at 100%, 100%, 100%, 100% -> 100% average -> Completed
  const modD = [{ completion: 100 }, { completion: 100 }, { completion: 100 }, { completion: 100 }];
  const aggD = calculateAggregateStatus(modD);
  assert.strictEqual(aggD.progress, 100);
  assert.strictEqual(aggD.label, SYLLABUS_STATUS.COMPLETED);
});

// 4. Missing or invalid progress values do not produce false completion
runTest("Missing or invalid progress values do not produce false completion", () => {
  assert.strictEqual(calculateTopicStatus(null).label, SYLLABUS_STATUS.NOT_STARTED);
  assert.strictEqual(calculateTopicStatus(undefined).label, SYLLABUS_STATUS.NOT_STARTED);
  assert.strictEqual(calculateTopicStatus({}).label, SYLLABUS_STATUS.NOT_STARTED);
  assert.strictEqual(calculateTopicStatus({ completion: null }).label, SYLLABUS_STATUS.NOT_STARTED);
  assert.strictEqual(calculateTopicStatus({ completion: "invalid" }).label, SYLLABUS_STATUS.NOT_STARTED);
  assert.strictEqual(calculateTopicStatus({ completion: -10 }).label, SYLLABUS_STATUS.NOT_STARTED);
  assert.strictEqual(calculateTopicStatus(NaN).label, SYLLABUS_STATUS.NOT_STARTED);
});

// 5. Do not round 99.6% to 100% just to assign Completed
runTest("Do not round 99.6% to 100% to assign Completed", () => {
  const tNear = { completion: 99.6 };
  const res = calculateTopicStatus(tNear);
  assert.strictEqual(res.label, SYLLABUS_STATUS.IN_PROGRESS, "99.6% must be In Progress, not Completed");
  assert.strictEqual(res.isCompleted, false);
});

// 6. Status filters return the correct topics
runTest("Status filters return the correct topics using normalized status function", () => {
  const topics = [
    { id: "t1", title: "Topic 1", completion: 0 },
    { id: "t2", title: "Topic 2", completion: 25 },
    { id: "t3", title: "Topic 3", completion: 75 },
    { id: "t4", title: "Topic 4", completion: 100 }
  ];

  const filter = (filterLabel) => {
    return topics.filter((t) => {
      if (filterLabel === "All") return true;
      const status = calculateTopicStatus(t);
      return status.label === filterLabel;
    });
  };

  assert.strictEqual(filter("All").length, 4);
  assert.strictEqual(filter(SYLLABUS_STATUS.NOT_STARTED).length, 1);
  assert.strictEqual(filter(SYLLABUS_STATUS.NOT_STARTED)[0].id, "t1");
  assert.strictEqual(filter(SYLLABUS_STATUS.NEED_PRACTICE).length, 1);
  assert.strictEqual(filter(SYLLABUS_STATUS.NEED_PRACTICE)[0].id, "t2");
  assert.strictEqual(filter(SYLLABUS_STATUS.IN_PROGRESS).length, 1);
  assert.strictEqual(filter(SYLLABUS_STATUS.IN_PROGRESS)[0].id, "t3");
  assert.strictEqual(filter(SYLLABUS_STATUS.COMPLETED).length, 1);
  assert.strictEqual(filter(SYLLABUS_STATUS.COMPLETED)[0].id, "t4");
});

console.log(`\n=== Verification Results: ${passed}/${total} Tests Passed ===`);
if (passed === total) {
  console.log("ALL SECTION 10 TESTS PASSED! ✓");
} else {
  process.exit(1);
}
