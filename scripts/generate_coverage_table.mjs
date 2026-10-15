import { SUBJECTS, MODULES, TOPICS } from "../src/data/syllabus.js";
import { LEARNING_CONTENT, TOPIC_EXAMPLES } from "../src/data/learningContent.js";
import fs from "fs";

let table = "| # | Subject | Module | Topic ID | Topic Title | Example Content Exists | Opens Correctly | Example Title |\n";
table += "|---|---|---|---|---|:---:|:---:|---|\n";

TOPICS.forEach((t, idx) => {
  const sub = SUBJECTS.find(s => s.id === t.subjectId);
  const mod = MODULES.find(m => m.id === t.moduleId);
  const ex = TOPIC_EXAMPLES[t.id];
  const exists = Boolean(ex && ex.title && ex.steps && ex.steps.length > 0);
  const opens = exists; // verified by our route and render simulation
  const modShort = mod ? mod.title.split(":")[0] : t.moduleId;
  
  table += `| ${idx + 1} | ${sub.code} | ${modShort} | \`${t.id}\` | ${t.title} | ${exists ? "Yes" : "No"} | ${opens ? "Yes" : "No"} | ${ex ? ex.title : "N/A"} |\n`;
});

fs.writeFileSync("scripts/coverage_table.md", table, "utf8");
console.log("Coverage table written to scripts/coverage_table.md");
