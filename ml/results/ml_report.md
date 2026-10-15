# StudySense AI — Machine Learning Model Validation & Quality Report
**Model Version:** v1.0  
**Trained At:** 2026-10-08 21:09:23 UTC  
**Evaluation Target:** `finalExamScore` (0–100 continuous score scale)

---

## 1. Executive Summary & Objective
StudySense AI predicts the expected numerical exam score for each student based on learning behavior telemetry collected prior to the examination. This validation audit verifies the model's predictive reliability, quantifies generalization performance against baseline models, checks for overfitting, and analyzes residual error patterns using the real **UCI Student Performance Benchmark** dataset (1,044 historical records).

---

## 2. Dataset Quality Audit
* **Total Records Ingested:** 1044
* **Input Features:** 9 raw features (11 transformed dimensions)
* **Duplicate Rows:** 0 (Zero duplicates)
* **Missing Values:** 0 (Handled via training-median/mode imputation in Pipeline)
* **Target Variable:** `finalExamScore`
* **Target Score Range:** [0.0, 100.0]
* **Subject Distribution:**
  * Portuguese Language: 649 records (62.2%)
  * Mathematics: 395 records (37.8%)

---

## 3. Target Distribution Analysis
* **Sample Count:** 1044
* **Mean Score:** 56.71
* **Median Score:** 55.00
* **Minimum Score:** 0.00
* **Maximum Score:** 100.00
* **Standard Deviation:** 19.32
* **Skewness:** -0.986

The target distribution exhibits a bell-shaped distribution with a slight left tail corresponding to students with extreme attendance gaps or multiple prior backlogs.

---

## 4. Baseline Comparison & Overfitting Analysis

| Model | Train MAE | Train RMSE | Train R² | Test MAE | Test RMSE | Test R² | 5-Fold CV MAE | 5-Fold CV RMSE | 5-Fold CV R² | Overfitting Detected |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Baseline (Mean)** | 14.02 | 19.21 | 0.0000 | 14.69 | 19.74 | -0.0082 | 14.02 | 19.21 | 0.0000 | No |
| **Linear Regression** | 4.58 | 7.42 | 0.8507 | 4.58 | 8.33 | 0.8203 | 4.67 | 7.54 | 0.8395 | No |
| **Decision Tree** | 0.54 | 1.46 | 0.9942 | 5.28 | 9.94 | 0.7445 | 5.40 | 9.96 | 0.7105 | Yes (Train R² >> Test R²) |
| **Random Forest** | 1.89 | 2.97 | 0.9761 | 5.02 | 8.42 | 0.8166 | 4.53 | 7.43 | 0.8367 | Yes (Train R² >> Test R²) |

### Overfitting Assessment:
1. **Decision Tree Regressor:** Memorizes the training partition perfectly (Train R² = 0.9942), but drops sharply on unseen test data (Test R² = 0.7445). **High overfitting confirmed.**
2. **Random Forest Regressor:** Displays moderate overfitting (Train R² = 0.9761 vs Test R² = 0.8166).
3. **Linear Regression:** Train R² (0.8507) and Test R² (0.8203) are closely balanced and align with the 5-Fold CV score (0.8395). **No overfitting detected.**

---

## 5. Selected Best Model & Validation Metrics
* **Selected Model:** **Linear Regression**
* **Selection Criteria:** Lowest test error (MAE: 4.58, RMSE: 8.33) and highest coefficient of determination (Test R²: 0.8203) without overfitting.
* **Test MAE:** 4.58 marks
* **Test RMSE:** 8.33 marks
* **Test R²:** 0.8203
* **5-Fold Cross-Validation Mean R²:** 0.8395 (± 0.038)

---

## 6. Error & Residual Analysis
* **Mean Error (Bias):** -0.162 (Centered near zero; no systematic over/under-prediction bias).
* **Mean Absolute Error:** 4.58 marks
* **Error Standard Deviation:** 8.33
* **Worst-Case Underprediction:** +16.7 marks
* **Worst-Case Overprediction:** -43.8 marks

---

## 7. Most Important Predictive Features
Features ranked by standardized influence on predicted exam marks:
1. **`averageQuizScore`** (Coefficient: `+14.9847`)
2. **`studyDays`** (Coefficient: `+2.8342`)
3. **`totalStudyMinutes`** (Coefficient: `-2.6935`)
4. **`previousScore`** (Coefficient: `+2.4547`)
5. **`studyConsistency`** (Coefficient: `-1.9840`)
6. **`subject_mathematics`** (Coefficient: `-1.5077`)
7. **`subject_portuguese`** (Coefficient: `+1.5077`)

*Notice: Statistical correlation does NOT imply causation. Formative quiz accuracy and spaced study sessions serve as diagnostic signals, not guaranteed causal levers.*

---

## 8. Subject-Wise Breakdown

| Subject | Test Samples | Test MAE | Test RMSE | Test R² | Data Quality Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Mathematics** | 83 | 4.97 | 9.44 | 0.8269 | `good` |
| **Portuguese** | 126 | 4.32 | 7.51 | 0.8033 | `good` |

---

## 9. Prediction Confidence & Data Quality Protocol
To maintain ethical academic AI standards and prevent deceptive confidence numbers:
* **No Artificial Confidence Percentages:** The application never outputs percentages like "Confidence: 94%".
* **Data Quality States (`dataStatus`):**
  * `good`: Student has active study minutes, formative quiz attempts, and topic progress.
  * `limited`: Student has recorded partial telemetry (e.g. only study time, but zero quiz data).
  * `insufficient`: New student or zero telemetry; prediction returns `available: false` with supportive encouragement.
