import { SUBJECTS, MODULES, TOPICS } from "../src/data/syllabus.js";
import { LEARNING_CONTENT } from "../src/data/learningContent.js";

console.log("Total subjects:", SUBJECTS.length);
console.log("Total modules:", MODULES.length);
console.log("Total topics in syllabus:", TOPICS.length);

let withExample = 0;
let withoutExample = 0;
let emptyExample = 0;
const report = [];

TOPICS.forEach((t) => {
  const sub = SUBJECTS.find(s => s.id === t.subjectId);
  const mod = MODULES.find(m => m.id === t.moduleId);
  const lc = LEARNING_CONTENT[t.id];
  let status = "missing";
  let details = "";

  if (!lc) {
    status = "missing_content";
    withoutExample++;
  } else if (!lc.example) {
    status = "missing_example";
    withoutExample++;
  } else if (typeof lc.example === "object") {
    if (lc.example.title && (lc.example.scenario || (lc.example.steps && lc.example.steps.length > 0))) {
      status = "rich_example";
      withExample++;
      details = lc.example.title;
    } else {
      status = "incomplete_rich_example";
      emptyExample++;
    }
  } else if (typeof lc.example === "string" && lc.example.trim()) {
    status = "string_example";
    withExample++;
    details = lc.example.slice(0, 40) + "...";
  } else {
    status = "empty_example";
    emptyExample++;
  }

  report.push({
    id: t.id,
    subjectCode: sub?.code,
    subjectName: sub?.name,
    moduleTitle: mod?.title,
    topicTitle: t.title,
    status,
    details
  });
});

console.log("\nSummary:");
console.log({ withExample, withoutExample, emptyExample, total: TOPICS.length });

const missingList = report.filter(r => r.status !== "rich_example");
console.log("\nTopics needing attention (" + missingList.length + "):");
missingList.forEach(r => {
  console.log(`[${r.subjectCode}] ${r.id} - ${r.topicTitle} -> ${r.status} (${r.details})`);
});
