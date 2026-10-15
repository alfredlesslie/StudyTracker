import { LEARNING_CONTENT } from "../src/data/learningContent.js";

Object.entries(LEARNING_CONTENT).forEach(([id, val]) => {
  if (val.example && typeof val.example === "object") {
    console.log("=== " + id + " ===");
    console.log("Keys:", Object.keys(val.example));
    console.log({
      title: val.example.title,
      scenario: val.example.scenario ? val.example.scenario.slice(0, 60) + "..." : null,
      stepsCount: val.example.steps ? val.example.steps.length : null,
      firstStep: val.example.steps ? val.example.steps[0] : null,
      keyInsight: val.example.keyInsight ? val.example.keyInsight.slice(0, 60) + "..." : null
    });
  }
});
