import { TOPICS, SUBJECTS, MODULES } from "../src/data/syllabus.js";
import { LEARNING_CONTENT, TOPIC_EXAMPLES } from "../src/data/learningContent.js";

console.log("=================================================");
console.log("STUDYSENSE AI - ROUTE & FALLBACK SIMULATION TEST");
console.log("=================================================\n");

let testsPassed = 0;
let testsFailed = 0;

function assert(cond, msg) {
  if (cond) {
    testsPassed++;
  } else {
    testsFailed++;
    console.error(`FAILED: ${msg}`);
  }
}

// 1. Test route parsing for #/example and #/learn?section=example
const testHash1 = "#/example?topic=cn-m1-t1";
const hash1Base = testHash1.replace(/^#\/?/, "").split("?")[0].replace(/\/$/, "");
const params1 = new URLSearchParams(testHash1.split("?")[1]);
assert(hash1Base === "example", "Route #/example base parsed correctly");
assert(params1.get("topic") === "cn-m1-t1", "Topic param parsed from #/example");

const testHash2 = "#/learn?topic=math-m2-t1&section=example";
const params2 = new URLSearchParams(testHash2.split("?")[1]);
assert(params2.get("section") === "example", "Section param parsed as example");
assert(params2.get("topic") === "math-m2-t1", "Topic param parsed from #/learn");

// 2. Test fallback behavior for missing/invalid topic ID
const invalidTopicId = "non-existent-topic-999";
const fallbackTopic = TOPICS.find((t) => t.id === invalidTopicId) || TOPICS[0];
assert(fallbackTopic && fallbackTopic.id === "cn-m1-t1", "Invalid topic ID cleanly falls back to TOPICS[0]");

// 3. Test fallback behavior if content is null in ExampleSection
function simulateExampleSection(content, topic) {
  if (!content) {
    return {
      type: "fallback_view",
      title: "Example Walkthrough Available via AI Tutor",
      hasBackBtn: true,
      hasAiTutorBtn: true,
      isBlank: false
    };
  }
  const isRich = typeof content === "object" && content !== null;
  const title = isRich ? content.title || "Practical Walkthrough" : "Worked Scenario";
  const scenario = isRich ? content.scenario : content;
  const steps = isRich && Array.isArray(content.steps) ? content.steps : [];
  
  // Verify all steps produce safe strings
  const renderedSteps = steps.map((st, idx) => {
    const stepLabel = typeof st === "object" && st !== null ? (st.stage || st.title || `Step ${idx+1}`) : `Step ${idx+1}`;
    let stepText = "";
    if (typeof st === "string") stepText = st;
    else if (typeof st === "object" && st !== null) {
      stepText = st.details || st.detail || st.content || st.description || st.text || "";
    }
    // Critical React safety: stepText must be string, NOT object
    if (typeof stepText !== "string") {
      throw new Error(`React child error: stepText is ${typeof stepText}`);
    }
    return { stepLabel, stepText };
  });

  return {
    type: "rich_view",
    title,
    scenario,
    stepsCount: renderedSteps.length,
    expectedResult: content.expectedResult || null,
    practicalApplication: content.practicalApplication || null,
    keyInsight: content.keyInsight || null,
    isBlank: false
  };
}

// Test null content fallback
const nullRender = simulateExampleSection(null, { title: "Test Topic" });
assert(!nullRender.isBlank && nullRender.type === "fallback_view", "Null content renders fallback view, NOT blank page");

// 4. Test rendering simulation for all 64 topics
console.log("Simulating ExampleSection render for all 64 topics...");
TOPICS.forEach((t) => {
  const example = TOPIC_EXAMPLES[t.id];
  try {
    const rendered = simulateExampleSection(example, t);
    assert(!rendered.isBlank, `Topic ${t.id} rendered non-blank view`);
    assert(rendered.stepsCount >= 2, `Topic ${t.id} has at least 2 steps`);
    assert(Boolean(rendered.expectedResult), `Topic ${t.id} has expected result`);
  } catch (err) {
    assert(false, `Topic ${t.id} crashed with error: ${err.message}`);
  }
});

console.log("\n=================================================");
console.log(`ROUTE & FALLBACK SIMULATION: ${testsPassed} passed, ${testsFailed} failed.`);
console.log("=================================================");

if (testsFailed > 0) process.exit(1);
