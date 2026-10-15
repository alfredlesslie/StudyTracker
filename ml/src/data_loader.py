"""
StudySense AI - Machine Learning Data Loader
Loads, inspects, and prepares real historical student performance data for regression training.

Dataset Source:
UCI Machine Learning Repository - Student Performance Data Set
Paper: P. Cortez and A. Silva. "Using Data Mining to Predict Secondary School Student Performance",
Proceedings of FUBUTEC 2008, pp. 5-12, Porto, Portugal.
URL: https://archive.ics.uci.edu/dataset/320/student+performance
"""

import os
import pandas as pd
import numpy as np

# Path definitions
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
RAW_DATA_DIR = os.path.join(DATA_DIR, "raw")
PROCESSED_DATA_DIR = os.path.join(DATA_DIR, "processed")

# Canonical StudySense AI target variable
TARGET_VARIABLE = "finalExamScore"

# Feature definitions
NUMERICAL_FEATURES = [
    "totalStudyMinutes",
    "studyDays",
    "averageQuizScore",
    "previousScore",
    "missedSessions",
    "failures",
    "studyConsistency"
]

CATEGORICAL_FEATURES = [
    "subject",
    "extraSupport"
]

ALL_FEATURE_COLUMNS = NUMERICAL_FEATURES + CATEGORICAL_FEATURES


def prepare_processed_dataset(force_recreate=False):
    """
    Load raw UCI benchmark datasets (student-mat.csv and student-por.csv),
    map public features to the standardized StudySense AI schema,
    and save the combined processed dataset.
    
    Mapping Justification (documented in docs/ml-data-pipeline.md):
    - G3 (0-20 scale) * 5 -> finalExamScore (0-100 scale, Target Variable)
    - G1 (0-20 scale) * 5 -> previousScore (First period exam score)
    - G2 (0-20 scale) * 5 -> averageQuizScore (Second period evaluation score)
    - studytime (1:<2h, 2:2-5h, 3:5-10h, 4:>10h) -> totalStudyMinutes (approx 90, 210, 450, 720 mins)
    - absences -> missedSessions (count of uncompleted/absent study sessions)
    - failures -> failures (academic struggle indicator)
    - schoolsup/paid -> extraSupport (extra academic tutoring/AI tutor equivalent)
    """
    os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
    processed_path = os.path.join(PROCESSED_DATA_DIR, "training_dataset.csv")

    if os.path.exists(processed_path) and not force_recreate:
        return processed_path

    mat_path = os.path.join(RAW_DATA_DIR, "student-mat.csv")
    por_path = os.path.join(RAW_DATA_DIR, "student-por.csv")

    records = []

    # Map studytime index to minutes
    studytime_to_minutes = {1: 90, 2: 210, 3: 450, 4: 720}
    studytime_to_days = {1: 2, 2: 3, 3: 5, 4: 6}

    # Process Math dataset (395 records)
    if os.path.exists(mat_path):
        df_mat = pd.read_csv(mat_path, sep=";")
        for idx, row in df_mat.iterrows():
            st = int(row.get("studytime", 2))
            absences = int(row.get("absences", 0))
            g1 = float(row.get("G1", 10))
            g2 = float(row.get("G2", 10))
            g3 = float(row.get("G3", 10))

            records.append({
                "studentId": f"uci-mat-{idx+1:03d}",
                "subject": "mathematics",
                "subjectId": "cs-math",
                "examId": f"exam-mat-final-{idx+1:03d}",
                "studyDays": studytime_to_days.get(st, 3),
                "totalStudyMinutes": studytime_to_minutes.get(st, 210),
                "averageQuizScore": round(g2 * 5.0, 1),
                "previousScore": round(g1 * 5.0, 1),
                "missedSessions": absences,
                "failures": int(row.get("failures", 0)),
                "extraSupport": "yes" if (row.get("schoolsup") == "yes" or row.get("paid") == "yes") else "no",
                "studyConsistency": round(max(0.1, min(1.0, (st * 2.5) / (st * 2.5 + absences * 0.2))), 3),
                "finalExamScore": round(g3 * 5.0, 1)
            })

    # Process Portuguese / Language dataset (649 records)
    if os.path.exists(por_path):
        df_por = pd.read_csv(por_path, sep=";")
        for idx, row in df_por.iterrows():
            st = int(row.get("studytime", 2))
            absences = int(row.get("absences", 0))
            g1 = float(row.get("G1", 10))
            g2 = float(row.get("G2", 10))
            g3 = float(row.get("G3", 10))

            records.append({
                "studentId": f"uci-por-{idx+1:03d}",
                "subject": "portuguese",
                "subjectId": "cs-se",
                "examId": f"exam-por-final-{idx+1:03d}",
                "studyDays": studytime_to_days.get(st, 3),
                "totalStudyMinutes": studytime_to_minutes.get(st, 210),
                "averageQuizScore": round(g2 * 5.0, 1),
                "previousScore": round(g1 * 5.0, 1),
                "missedSessions": absences,
                "failures": int(row.get("failures", 0)),
                "extraSupport": "yes" if (row.get("schoolsup") == "yes" or row.get("paid") == "yes") else "no",
                "studyConsistency": round(max(0.1, min(1.0, (st * 2.5) / (st * 2.5 + absences * 0.2))), 3),
                "finalExamScore": round(g3 * 5.0, 1)
            })

    df_combined = pd.DataFrame(records)
    df_combined.to_csv(processed_path, index=False)
    print(f"[DataLoader] Created processed dataset with {len(df_combined)} rows at {processed_path}")
    return processed_path


def load_dataset(filepath=None):
    """
    Load student performance dataset and return (X, y, dataset_info).
    
    Returns:
        X (pd.DataFrame): Features dataframe
        y (pd.Series): Continuous target variable (finalExamScore)
        info (dict): Metadata describing columns, shapes, nulls, and types
    """
    if filepath is None:
        filepath = prepare_processed_dataset()

    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Dataset file not found at: {filepath}")

    df = pd.read_csv(filepath)

    if TARGET_VARIABLE not in df.columns:
        raise ValueError(f"Target variable '{TARGET_VARIABLE}' not found in dataset columns: {df.columns.tolist()}")

    # Isolate Target
    y = df[TARGET_VARIABLE].copy()

    # Isolate Features (drop identifiers and target)
    drop_cols = [TARGET_VARIABLE]
    for id_col in ["studentId", "examId", "subjectId"]:
        if id_col in df.columns:
            drop_cols.append(id_col)

    X = df.drop(columns=drop_cols).copy()

    # Identify feature types
    num_cols = [c for c in NUMERICAL_FEATURES if c in X.columns]
    cat_cols = [c for c in CATEGORICAL_FEATURES if c in X.columns]

    # Dataset inspection info
    info = {
        "filepath": filepath,
        "total_records": len(df),
        "total_features": len(X.columns),
        "target_variable": TARGET_VARIABLE,
        "target_mean": float(round(y.mean(), 2)),
        "target_std": float(round(y.std(), 2)),
        "target_min": float(round(y.min(), 2)),
        "target_max": float(round(y.max(), 2)),
        "numerical_features": num_cols,
        "categorical_features": cat_cols,
        "missing_values": df.isnull().sum().to_dict(),
        "columns": df.columns.tolist()
    }

    return X, y, info


if __name__ == "__main__":
    print("=== Testing DataLoader ===")
    X, y, info = load_dataset()
    print(f"Dataset loaded successfully: {info['total_records']} samples, {info['total_features']} features.")
    print(f"Target variable '{info['target_variable']}': Mean={info['target_mean']}, Min={info['target_min']}, Max={info['target_max']}")
    print(f"Numerical features ({len(info['numerical_features'])}): {info['numerical_features']}")
    print(f"Categorical features ({len(info['categorical_features'])}): {info['categorical_features']}")
    print("\nFeature matrix head:")
    print(X.head())
