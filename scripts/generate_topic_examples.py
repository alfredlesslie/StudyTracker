# -*- coding: utf-8 -*-
"""
Combines CN, SE, MATH, ML examples and generates src/data/topicExamples.js.
"""

import json
import os
import sys

# Import the 4 subject modules
from examples_cn import CN_EXAMPLES
from examples_se import SE_EXAMPLES
from examples_math import MATH_EXAMPLES
from examples_ml import ML_EXAMPLES

def main():
    all_examples = {}
    all_examples.update(CN_EXAMPLES)
    all_examples.update(SE_EXAMPLES)
    all_examples.update(MATH_EXAMPLES)
    all_examples.update(ML_EXAMPLES)

    print(f"Total topics with rich examples compiled: {len(all_examples)}")
    assert len(all_examples) == 64, f"Expected 64 topics, got {len(all_examples)}"

    # Generate ES Module JS file
    target_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src", "data", "topicExamples.js"))
    
    with open(target_path, "w", encoding="utf-8") as f:
        f.write("/**\n")
        f.write(" * StudySense AI - Structured Learning Examples for all 64 Prototype Topics.\n")
        f.write(" * Complete curriculum coverage across all 4 subjects & 16 modules.\n")
        f.write(" * Each topic provides:\n")
        f.write(" * - title: Specific worked scenario title\n")
        f.write(" * - scenario: Real-world engineering context or question\n")
        f.write(" * - steps: Step-by-step breakdown with stage labels and calculations\n")
        f.write(" * - expectedResult: Verified outcome / conclusion\n")
        f.write(" * - practicalApplication: Industrial & systems relevance\n")
        f.write(" * - keyInsight: High-yield pedagogical rule\n")
        f.write(" * - diagram / formula / code: (where relevant)\n")
        f.write(" */\n\n")
        f.write("export const TOPIC_EXAMPLES = ")
        f.write(json.dumps(all_examples, indent=2, ensure_ascii=False))
        f.write(";\n")

    print(f"Successfully generated {target_path} ({os.path.getsize(target_path)} bytes)")

if __name__ == "__main__":
    main()
