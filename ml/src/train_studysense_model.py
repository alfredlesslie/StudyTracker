"""
StudySense AI - Genuine Module-Aware Regression Model Trainer
Trains a scikit-learn regressor once sufficient verified student preparation records
and actual exam marks are available.
Enforces the zero-fabrication policy: refuses to train on synthetic labels.
"""

import os
import sys
import json
import pandas as pd
import numpy as np

# Path definitions
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "studysense_module_exam_records.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_OUTPUT_PATH = os.path.join(MODELS_DIR, "studysense_module_model.joblib")
METADATA_OUTPUT_PATH = os.path.join(MODELS_DIR, "studysense_module_model_metadata.json")

MINIMUM_SAMPLES_REQUIRED = 20


def inspect_dataset():
    """
    Check if authentic labeled data exists.
    """
    if not os.path.exists(DATA_PATH):
        return None, 0

    df = pd.read_csv(DATA_PATH)
    # Genuine ground truth requires non-null actual_exam_score
    labeled_df = df[df["ground_truth_ready"] == True].copy()
    return labeled_df, len(labeled_df)


def run_pipeline():
    print("=" * 70)
    print("StudySense AI - Module-Aware Exam Regression Pipeline")
    print("=" * 70)

    labeled_df, count = inspect_dataset()
    print(f"Dataset path: {DATA_PATH}")
    print(f"Verified labeled records found: {count}")
    print(f"Minimum required for statistically sound training: {MINIMUM_SAMPLES_REQUIRED}")

    if count < MINIMUM_SAMPLES_REQUIRED:
        print("\n[STATUS: DATA COLLECTION ACTIVE]")
        print(f"Currently {count} verified post-exam outcomes are recorded.")
        print("To maintain strict scientific integrity and avoid fabricated predictions:")
        print("1. Synthetic labels will NOT be generated.")
        print("2. The application uses the transparent 40/35/15/10 preparation baseline.")
        print("3. As students record actual exam marks, the dataset accumulates genuine samples.")
        print(f"4. Retrain this pipeline once >= {MINIMUM_SAMPLES_REQUIRED} actual exam marks are logged.")
        return {
            "status": "data_collection_active",
            "labeled_samples": count,
            "required_samples": MINIMUM_SAMPLES_REQUIRED,
            "trained": False
        }

    # If >= 20 samples exist, train Ridge / Random Forest
    from sklearn.model_selection import train_test_split
    from sklearn.linear_model import Ridge
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
    import joblib

    features = [
        "module_count",
        "topic_completion_pct",
        "quiz_accuracy_pct",
        "total_quiz_attempts",
        "active_study_minutes",
        "study_consistency_score",
        "heuristic_readiness_score"
    ]
    # Impute missing quiz accuracy with neutral 50.0
    labeled_df["quiz_accuracy_pct"] = labeled_df["quiz_accuracy_pct"].fillna(50.0)

    X = labeled_df[features]
    y = labeled_df["actual_exam_score"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = Ridge(alpha=1.0)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = root_mean_squared_error(y_test, preds)
    r2 = r2_score(y_test, preds)

    # Heuristic baseline comparison on test set
    base_preds = X_test["heuristic_readiness_score"]
    base_mae = mean_absolute_error(y_test, base_preds)

    print("\n[TRAINING RESULTS]")
    print(f"Model MAE: {mae:.2f} (Baseline MAE: {base_mae:.2f})")
    print(f"Model RMSE: {rmse:.2f}")
    print(f"Model R²: {r2:.4f}")

    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(model, MODEL_OUTPUT_PATH)

    metadata = {
        "modelName": "Ridge Regression (Module-Scoped)",
        "sampleCount": count,
        "features": features,
        "target": "actual_exam_score",
        "testMae": round(mae, 2),
        "testRmse": round(rmse, 2),
        "testR2": round(r2, 4),
        "baselineMae": round(base_mae, 2)
    }
    with open(METADATA_OUTPUT_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    return {
        "status": "trained_successfully",
        "labeled_samples": count,
        "metrics": metadata,
        "trained": True
    }


if __name__ == "__main__":
    run_pipeline()
