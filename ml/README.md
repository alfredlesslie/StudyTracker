# StudySense AI — Machine Learning Subsystem

Supervised Machine Learning Regression Service for Final Exam Score Prediction.

## 1. Overview & Objective
StudySense AI predicts the continuous final exam score ($0 - 100$) a student is likely to achieve in each university subject before the examination occurs.

* **Target Variable**: `finalExamScore` (Continuous numerical score, $0 - 100$)
* **Problem Type**: Supervised Regression
* **Primary Algorithm**: Scikit-Learn Pipeline (`ColumnTransformer` $\rightarrow$ `LinearRegression` / `RandomForestRegressor`)

---

## 2. Directory Structure

```
ml/
├── data/
│   ├── raw/                  # Original raw UCI benchmark datasets
│   │   ├── student-mat.csv   # 395 Mathematics student records
│   │   └── student-por.csv   # 649 Portuguese/Language student records
│   └── processed/            # Mapped standardized training dataset (1,044 records)
│       └── training_dataset.csv
├── models/
│   ├── best_model.joblib     # Serialized end-to-end Pipeline (preprocessor + model)
│   └── model_metadata.json   # Actual computed metrics, feature weights, and hyperparameters
├── results/
│   ├── actual_vs_predicted.png    # Evaluation scatter plot
│   ├── model_comparison.png       # Test MAE, RMSE, and R² bar charts
│   ├── feature_importance.png     # Top predictive features chart
│   └── evaluation_metrics.json    # Full evaluation metrics archive
├── src/
│   ├── data_loader.py        # Ingestion, schema mapping, and dataset inspection
│   ├── preprocessing.py      # ColumnTransformer pipeline (imputation + scaling + encoding)
│   ├── evaluate.py           # MAE, RMSE, R² calculations and 5-fold cross-validation
│   ├── train.py              # Model comparison, selection, visualization, and joblib export
│   └── predict.py            # Standalone inference engine
├── api.py                    # FastAPI microservice exposing /predict and /health
├── requirements.txt          # Python dependencies
└── README.md                 # This documentation
```

---

## 3. Dataset Documentation & Mapping

### Dataset Source
* **Dataset Name**: Student Performance Data Set
* **Origin**: UCI Machine Learning Repository (Cortez and Silva, 2008, University of Minho, Portugal)
* **Citation**: P. Cortez and A. Silva. *Using Data Mining to Predict Secondary School Student Performance*. In A. Brito and J. Teixeira Eds., Proceedings of FUBUTEC 2008, pp. 5-12, Porto, Portugal.
* **URL**: [https://archive.ics.uci.edu/dataset/320/student+performance](https://archive.ics.uci.edu/dataset/320/student+performance)
* **Sample Size**: 1,044 actual student records (395 Mathematics + 649 Portuguese Language)

### Feature Mapping Table

| Public Dataset Feature | StudySense AI Feature | Transformation / Range | Rationale |
| :--- | :--- | :--- | :--- |
| `G3` (0–20 scale) | **`finalExamScore`** | `G3 * 5` ($0 - 100$) | **Target Variable**: Final evaluation score. |
| `G1` (0–20 scale) | `previousScore` | `G1 * 5` ($0 - 100$) | First period academic baseline. |
| `G2` (0–20 scale) | `averageQuizScore` | `G2 * 5` ($0 - 100$) | Intermediate formative assessment accuracy. |
| `studytime` (1 to 4) | `totalStudyMinutes` | $90, 210, 450, 720\text{ min}$ | Estimated weekly active study duration. |
| `absences` ($0 - 93$) | `missedSessions` | Integer count | Absent or skipped study sessions. |
| `failures` ($0 - 3$) | `failures` | Integer count | Prior course struggle factor. |
| `schoolsup` / `paid` | `extraSupport` | `"yes"` / `"no"` | Extra tutoring or guided AI support. |

---

## 4. Model Training & Real Evaluation Results

The models were evaluated using an **80/20 train/test split** with `random_state=42`. Preprocessing was fitted strictly on training data through a scikit-learn `Pipeline`.

### Actual Calculated Metrics Table

| Model | Test MAE | Test RMSE | Test R² | 5-Fold CV Mean MAE | 5-Fold CV Mean RMSE | 5-Fold CV Mean R² |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Linear Regression** | **4.58** | **8.33** | **0.820** | **4.67** | **7.54** | **0.840** |
| Decision Tree | 5.28 | 9.94 | 0.745 | 5.40 | 9.96 | 0.711 |
| Random Forest | 5.02 | 8.42 | 0.817 | 4.53 | 7.43 | 0.837 |

### Selected Best Model
* **Model**: **Linear Regression** (with `ColumnTransformer` standard scaling & one-hot encoding).
* **Rationale**: Achieved the highest test set $R^2$ (**0.8203**) and the lowest test RMSE (**8.33** score points on a 100-point scale), providing a strong baseline that avoids tree overfitting on non-linear noise.
* **Top Predictive Features**:
  1. `averageQuizScore` (+14.98 coefficient): Intermediate quiz mastery is the strongest predictor of final exam performance.
  2. `studyDays` (+2.83 coefficient): Regular study consistency across multiple days boosts retention.
  3. `previousScore` (+2.45 coefficient): Prior academic baseline provides stable performance grounding.

---

## 5. Reproducibility Guide

Follow these commands to reproduce the entire training and inference pipeline from scratch:

### Step 1: Install Requirements
```bash
pip install -r ml/requirements.txt
```

### Step 2: Run Data Ingestion & Model Training
```bash
python ml/src/train.py
```
This script will:
* Load the raw UCI dataset from `ml/data/raw/`
* Prepare `ml/data/processed/training_dataset.csv`
* Split the dataset into 80% train and 20% test sets
* Train Linear Regression, Decision Tree, and Random Forest
* Perform 5-fold cross-validation
* Save `ml/models/best_model.joblib` and `ml/models/model_metadata.json`
* Save plots to `ml/results/`

### Step 3: Test Standalone Prediction
```bash
python ml/src/predict.py
```

### Step 4: Launch FastAPI Microservice
```bash
python -m uvicorn ml.api:app --host 127.0.0.1 --port 8000
```

### Step 5: Verify API Endpoints
* **Health Check**:
  ```bash
  curl http://127.0.0.1:8000/health
  ```
* **Score Prediction**:
  ```bash
  curl -X POST http://127.0.0.1:8000/predict \
    -H "Content-Type: application/json" \
    -d "{\"subject\": \"mathematics\", \"studyDays\": 5, \"totalStudyMinutes\": 450, \"averageQuizScore\": 82.0, \"previousScore\": 78.0}"
  ```

---

## 6. Frontend Integration & Student Disclaimer

The React application interfaces with this service via [`src/services/mlService.js`](file:///c:/Users/LASSLIE/Documents/STUDIO/src/services/mlService.js).
* **Display Format**: `"Estimated exam score: 78/100"`
* **Offline Fallback**: If the Python service is offline, predictions gracefully indicate unavailability without interrupting any core application features.
* **Student Disclaimer**:
  > *"This is an estimate based on your available study data, not a guaranteed score."*
