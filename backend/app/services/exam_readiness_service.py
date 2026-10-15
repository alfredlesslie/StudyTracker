"""
StudySense AI - Exam Readiness Estimation Service
Computes transparent, preparation-based score estimates for scoped module exams.

Baseline Formula (Configurable Heuristic Weights):
- 40% Module Syllabus Topic Completion (0-100)
- 35% Module Quiz Accuracy (0-100, neutral baseline 50.0 if unattempted)
- 15% Module Active Study Consistency (0-100, neutral baseline 50.0 if unattempted)
- 10% Previous Relevant Exam Performance (0-100, neutral baseline 65.0 if unavailable)

Guarantees:
- Output strictly bounded in [0.0, 100.0]
- Zero NaN, zero division by zero
- Explicit assumption disclosures
- Non-ML experimental label
"""

from typing import Dict, Any, List, Optional


# Configurable Default Weights
DEFAULT_WEIGHTS = {
    "completion": 0.40,
    "quiz": 0.35,
    "consistency": 0.15,
    "previous_exam": 0.10,
}

# Configurable Neutral Baselines for Missing Signals
DEFAULT_BASELINES = {
    "quiz": 50.0,            # Neutral baseline for unattempted quizzes (never 0)
    "consistency": 50.0,     # Neutral baseline for unrecorded study sessions
    "previous_exam": 65.0,   # Historical class average prior for first-time examinees
}


def calculate_readiness_estimate(
    total_selected_topics: int,
    completed_selected_topics: int,
    selected_modules_count: int = 1,
    completed_modules_count: int = 0,
    total_quiz_questions: int = 0,
    total_quiz_correct: int = 0,
    recent_quiz_accuracy: Optional[float] = None,
    previous_quiz_accuracy: Optional[float] = None,
    quiz_attempts_count: int = 0,
    active_study_minutes: int = 0,
    previous_exam_score: Optional[float] = None,
    weights: Optional[Dict[str, float]] = None,
    baselines: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:
    """
    Calculates the preparation-based score estimate for an exam covering selected modules.
    
    Returns a dictionary containing:
    - estimated_score: float (0.0 to 100.0)
    - score_label: str
    - is_experimental: bool (True)
    - reliability_level: str ("High", "Moderate", "Limited", "Initial Baseline")
    - why_prediction_changed: str
    - assumed_inputs: List[str]
    - components: Dict with detailed sub-scores, weights, and contributions
    """
    w = {**DEFAULT_WEIGHTS, **(weights or {})}
    b = {**DEFAULT_BASELINES, **(baselines or {})}

    assumed_inputs: List[str] = []

    # 1. Exam Preparation Progress (0-100)
    # Reflects both exam-specific module review status and detailed topic completion in scope
    if completed_modules_count > 0 and total_selected_topics > 0:
        mod_comp_pct = (completed_modules_count / max(1, selected_modules_count)) * 100.0
        topic_comp_pct = (completed_selected_topics / total_selected_topics) * 100.0
        prep_score = max(0.0, min(100.0, (0.50 * mod_comp_pct) + (0.50 * topic_comp_pct)))
    elif completed_modules_count > 0:
        prep_score = (completed_modules_count / max(1, selected_modules_count)) * 100.0
    elif total_selected_topics > 0:
        prep_score = (completed_selected_topics / total_selected_topics) * 100.0
    else:
        prep_score = 0.0
    assumed_comp = False

    # 2. Scoped Practice Quiz Performance (0-100)
    # Responsive to recent quiz performance with exponential smoothing to prevent extreme jumps
    if recent_quiz_accuracy is not None:
        if previous_quiz_accuracy is not None and quiz_attempts_count >= 2:
            # 65% recent quiz + 35% previous quiz baseline: responsive yet damped against outlier swings
            quiz_score = max(0.0, min(100.0, (0.65 * recent_quiz_accuracy) + (0.35 * previous_quiz_accuracy)))
        else:
            quiz_score = max(0.0, min(100.0, recent_quiz_accuracy))
        assumed_quiz = False
    elif total_quiz_questions > 0:
        quiz_pct = (total_quiz_correct / total_quiz_questions) * 100.0
        quiz_score = max(0.0, min(100.0, quiz_pct))
        assumed_quiz = False
    else:
        quiz_score = b["quiz"]
        assumed_quiz = True
        assumed_inputs.append("quiz_accuracy")

    # 3. Active Study Consistency (0-100)
    if active_study_minutes > 0:
        expected_minutes = max(60, selected_modules_count * 120)
        time_ratio = min(1.0, active_study_minutes / expected_minutes)
        cons_score = max(0.0, min(100.0, 30.0 + (time_ratio * 70.0)))
        assumed_cons = False
    else:
        cons_score = b["consistency"]
        assumed_cons = True
        assumed_inputs.append("study_consistency")

    # 4. Previous Relevant Exam Performance (0-100)
    if previous_exam_score is not None and 0.0 <= previous_exam_score <= 100.0:
        prev_score = max(0.0, min(100.0, float(previous_exam_score)))
        assumed_prev = False
    else:
        prev_score = b["previous_exam"]
        assumed_prev = True
        assumed_inputs.append("previous_exam_performance")

    # 5. Weighted Score Calculation
    w_comp = w["completion"]
    w_quiz = w["quiz"]
    w_cons = w["consistency"]
    w_prev = w["previous_exam"]

    raw_score = (
        (w_comp * prep_score) +
        (w_quiz * quiz_score) +
        (w_cons * cons_score) +
        (w_prev * prev_score)
    )
    bounded_score = round(max(0.0, min(100.0, raw_score)), 1)

    # 6. Explanation for prediction state / why it changed
    if recent_quiz_accuracy is not None and previous_quiz_accuracy is not None and quiz_attempts_count >= 2:
        diff = round(recent_quiz_accuracy - previous_quiz_accuracy, 1)
        if diff > 0:
            why_changed = f"Your recent quiz accuracy improved from {previous_quiz_accuracy:.0f}% to {recent_quiz_accuracy:.0f}% (+{diff}%)."
        elif diff < 0:
            why_changed = f"Your recent quiz accuracy declined from {previous_quiz_accuracy:.0f}% to {recent_quiz_accuracy:.0f}% ({diff}%)."
        else:
            why_changed = f"Your recent quiz accuracy remained steady at {recent_quiz_accuracy:.0f}% across fresh attempts."
    elif recent_quiz_accuracy is not None:
        why_changed = f"Latest practice quiz scored {recent_quiz_accuracy:.0f}%, establishing an authentic baseline."
    elif completed_modules_count > 0:
        mod_pct_val = (completed_modules_count / max(1, selected_modules_count)) * 100.0
        why_changed = f"Exam preparation is at {round(mod_pct_val, 1)}% with {completed_modules_count} of {selected_modules_count} selected modules completed."
    elif completed_selected_topics > 0 and total_selected_topics > 0:
        top_pct_val = (completed_selected_topics / total_selected_topics) * 100.0
        why_changed = f"Exam preparation is at {round(top_pct_val, 1)}% with {completed_selected_topics} of {total_selected_topics} topics prepared."
    elif active_study_minutes > 0:
        why_changed = f"Recorded {active_study_minutes} minutes of dedicated study time in exam modules."
    else:
        why_changed = "Baseline score estimate based on curriculum structure and neutral preparation priors."

    # 7. Qualitative Reliability Level based on authentic data completeness
    num_assumed = len(assumed_inputs)
    if num_assumed == 0:
        reliability_level = "High"
    elif num_assumed == 1:
        reliability_level = "Moderate"
    elif num_assumed == 2:
        reliability_level = "Limited"
    else:
        reliability_level = "Initial Baseline"

    # Dynamic explanation of information used to generate estimate
    has_authentic_quiz = (recent_quiz_accuracy is not None) or (quiz_attempts_count > 0)
    has_authentic_study = active_study_minutes > 0
    has_prep = prep_score > 0

    if has_authentic_study and (has_authentic_quiz or has_prep):
        basis_explanation = "Based on available study and performance data."
    elif has_prep and has_authentic_quiz:
        basis_explanation = "Based on preparation progress and previous quiz results."
    elif has_authentic_quiz:
        basis_explanation = "Based on previous quiz results."
    elif has_prep:
        basis_explanation = "Based on preparation progress."
    else:
        basis_explanation = "Based on available study and performance data."

    data_status = "authentic" if quiz_attempts_count > 0 else "preparation_based"

    return {
        "estimated_score": bounded_score,
        "score_label": "Preparation-Based Estimate",
        "is_experimental": True,
        "reliability_level": reliability_level,
        "confidence_label": None,
        "basis_explanation": basis_explanation,
        "data_status": data_status,
        "completed_exam_attempts": quiz_attempts_count,
        "why_prediction_changed": why_changed,
        "assumed_inputs": assumed_inputs,
        "has_assumptions": len(assumed_inputs) > 0,
        "components": {
            "syllabus_completion": {
                "score": round(prep_score, 1),
                "weight": w_comp,
                "contribution": round(w_comp * prep_score, 2),
                "assumed": assumed_comp,
                "is_assumed": assumed_comp,
                "raw_value": round(prep_score, 1),
                "label": "Exam Preparation Progress (40%)"
            },
            "quiz_accuracy": {
                "score": round(quiz_score, 1),
                "weight": w_quiz,
                "contribution": round(w_quiz * quiz_score, 2),
                "assumed": assumed_quiz,
                "is_assumed": assumed_quiz,
                "raw_value": round(quiz_score, 1) if not assumed_quiz else None,
                "label": "Module Quiz Accuracy (35%)"
            },
            "study_consistency": {
                "score": round(cons_score, 1),
                "weight": w_cons,
                "contribution": round(w_cons * cons_score, 2),
                "assumed": assumed_cons,
                "is_assumed": assumed_cons,
                "raw_value": round(cons_score, 1),
                "label": "Active Study Consistency (15%)"
            },
            "previous_exam": {
                "score": round(prev_score, 1),
                "weight": w_prev,
                "contribution": round(w_prev * prev_score, 2),
                "assumed": assumed_prev,
                "is_assumed": assumed_prev,
                "raw_value": round(prev_score, 1) if not assumed_prev else None,
                "label": "Previous Exam Result (10%)"
            },
            "previous_exam_performance": {
                "score": round(prev_score, 1),
                "weight": w_prev,
                "contribution": round(w_prev * prev_score, 2),
                "assumed": assumed_prev,
                "is_assumed": assumed_prev,
                "raw_value": round(prev_score, 1) if not assumed_prev else None,
                "label": "Previous Exam Result (10%)"
            },
        }
    }
