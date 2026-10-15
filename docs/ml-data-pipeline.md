# StudySense AI — Machine Learning Data Pipeline

## 1. Machine Learning Objective

The central machine learning objective of **StudySense AI** is:

> **Predict the final exam score a student is likely to achieve in each university subject.**

This is framed strictly as a **supervised regression problem**:
* **Input**: Behavioral, cognitive, consistency, and diagnostic features capturing the student's study engagement **before** the exam.
* **Output / Target**: A continuous numerical exam score between **0 and 100** (`finalExamScore`).
* **Unit of Prediction (Row Granularity)**:
  $$\text{Record} = (\text{Student}, \text{Subject}, \text{Exam})$$
  Rather than predicting isolated topic quiz scores, each ML sample aggregates a student's preparation for a specific subject exam (e.g., *Student 001 + Machine Learning + Machine Learning End-Semester Exam*).

---

## 2. Target Variable

* **Variable Name**: `finalExamScore`
* **Data Type**: Float / Integer (`0.0` to `100.0`)
* **Role**: Ground-truth target / label.
* **Separation**:
  * In **Historical Training Records**: `finalExamScore` contains the verified exam score achieved by the student (e.g., `78.0`).
  * In **Prediction Snapshots**: `finalExamScore` is strictly set to `null`, as this value is unknown and represents the future prediction target.

---

## 3. Feature Variables

Every record produced by [`src/services/datasetService.js`](file:///c:/Users/LASSLIE/Documents/STUDIO/src/services/datasetService.js) contains the following canonical features:

| Column Name | Type | Range / Domain | Description |
| :--- | :--- | :--- | :--- |
| `studentId` | String | e.g. `"student-001"` | Anonymized persistent student identifier (privacy-protected). |
| `subjectId` | String | `"cs-cn"`, `"cs-se"`, etc. | Canonical subject code matching the university syllabus. |
| `examId` | String | e.g. `"exam-001"` | Unique identifier for the evaluated exam event. |
| `studyDays` | Integer | $\ge 0$ | Number of distinct calendar days the student engaged in study for this subject before cutoff. |
| `totalStudyMinutes` | Integer | $\ge 0$ | Non-overlapping active learning minutes across all modalities. |
| `learnMinutes` | Integer | $\ge 0$ | Active time spent reading and interacting with 7-section topic lessons. |
| `aiTutorMinutes` | Integer | $\ge 0$ | Active time spent asking questions and reviewing doubts with the AI Tutor. |
| `practiceMinutes` | Integer | $\ge 0$ | Active time spent on multiple-choice questions, self-checks, and quizzes. |
| `focusMinutes` | Integer | $\ge 0$ | Time spent in focused Pomodoro deep-work blocks. |
| `averageQuizScore` | Float / Null | $0.0 - 100.0$ | Cumulative percentage accuracy across all pre-exam quiz attempts. |
| `quizAttempts` | Integer | $\ge 0$ | Total number of quizzes completed for this subject before cutoff. |
| `topicsCompleted` | Integer | $0 - 16$ | Number of syllabus topics in this subject with $\ge 80\%$ completion. |
| `totalTopics` | Integer | $16$ | Total prototype syllabus topics for this subject. |
| `topicCompletionRate`| Float | $0.0 - 1.0$ | Ratio of completed topics to total topics ($\text{topicsCompleted} / \text{totalTopics}$). |
| `averageTopicMastery`| Float | $0.0 - 100.0$ | Average mastery level across all topics in the subject. |
| `revisionCount` | Integer | $\ge 0$ | Count of deliberate revision sessions completed prior to the exam. |
| `averageConfidence` | Float | $1.0 - 5.0$ | Self-rated confidence scale ($1 = \text{not confident}$, $3 = \text{moderate}$, $5 = \text{confident}$). |
| `missedSessions` | Integer | $\ge 0$ | Count of planned sessions that were skipped or rescheduled. |
| `daysSinceLastStudy` | Integer | $\ge 0$ | Recency gap: Days between the cutoff date and the most recent study activity. |
| `examDaysRemaining` | Integer | $\ge 0$ | Days remaining between the feature cutoff date and the scheduled exam date. |
| `previousScore` | Float / Null | $0.0 - 100.0$ | Student's score in an earlier exam for the same subject (null if no prior exam). |
| `subjectDifficulty` | Float | $1.0 - 5.0$ | Subject curricular difficulty baseline derived from KTU credit weight. |
| **`finalExamScore`** | **Float / Null** | **$0.0 - 100.0$** | **Target variable** ($\text{Numeric for training}$, $\text{null for prediction}$). |

---

## 4. Data Sources

The dataset builder ingests data exclusively from the existing prototype services:
1. **Curriculum Hierarchy** ([`src/data/syllabus.js`](file:///c:/Users/LASSLIE/Documents/STUDIO/src/data/syllabus.js)): Subject codes, credits, modules, and topic metadata.
2. **Centralized Activity Service** ([`src/services/activityService.js`](file:///c:/Users/LASSLIE/Documents/STUDIO/src/services/activityService.js)): Granular records of active study time across Learn, AI Tutor, Practice, and Focus.
3. **Practice & Quiz Engine** ([`src/services/storageService.js`](file:///c:/Users/LASSLIE/Documents/STUDIO/src/services/storageService.js)): Historical attempts, scores, and accuracy percentages.
4. **Study Sessions & Pomodoro** ([`src/services/storageService.js`](file:///c:/Users/LASSLIE/Documents/STUDIO/src/services/storageService.js)): Completed focus blocks, self-reported confidence, and difficulty reflections.
5. **Exams Management** ([`src/services/storageService.js`](file:///c:/Users/LASSLIE/Documents/STUDIO/src/services/storageService.js)): Exam dates, series tests, past scores, and upcoming schedules.

---

## 5. How Activity Data Becomes Features

Raw activity records are stored at the interaction level:
```json
{
  "id": "act-101",
  "type": "learn",
  "subjectId": "cs-cn",
  "durationMinutes": 40,
  "date": "2026-10-02"
}
```

The pipeline aggregates these raw behavioral logs:
1. **Filtering by Subject & Cutoff**: Isolates records where `activity.subjectId === targetSubjectId` and `activity.date <= cutoffDate`.
2. **Modality Breakdown**: Sums active minutes individually into `learnMinutes`, `aiTutorMinutes`, `practiceMinutes`, and `focusMinutes`.
3. **Overlapping Interval Merging**: Executes `calculateNonOverlappingMinutes(activities)` to guarantee that simultaneous browser events do not inflate `totalStudyMinutes`.
4. **Study Consistency**: Extracts unique calendar dates into `studyDays`.

---

## 6. How Quiz Data Becomes Features

1. **Pre-Exam Filtering**: Only quizzes submitted on or before `cutoffDate` are included.
2. **Missing Attempt Handling**: If a student has zero quiz attempts before the cutoff date, `averageQuizScore` is preserved as `null`. No artificial synthetic average is inserted.
3. **Aggregations**: Computes `averageQuizScore`, `bestQuizScore`, `recentQuizScore`, and `quizAttempts`.

---

## 7. How Exam Data Becomes Features

1. **Temporal Horizon (`examDaysRemaining`)**: Calculates the difference in calendar days between the feature snapshot cutoff date and the exam date.
   $$\text{examDaysRemaining} = \max(0, \text{examDate} - \text{cutoffDate})$$
2. **Subject Curricular Baseline (`subjectDifficulty`)**: Maps KTU Semester V subject credits and syllabus depth (e.g., Mathematics = 4.2, Software Engineering = 3.2).

---

## 8. How Previous Performance Is Used

If a student has previously taken an earlier exam in the same subject (e.g., Continuous Internal Evaluation / Series Exam 1):
* The pipeline matches past exams where $\text{pastExam.date} < \text{targetExam.date}$ and $\text{pastExam.actualScore} \ne \text{null}$.
* If multiple previous exams exist, it selects the most recent one.
* If no prior exam exists, `previousScore` is stored as `null`.
* Under no circumstances can an exam use its own target score as `previousScore`.

---

## 9. How Data Leakage Is Strictly Prevented

Data leakage occurs when an ML model is trained on information that would not realistically be available at prediction time. StudySense AI employs four strict architectural boundaries to guarantee zero leakage:

```
Timeline:
----------------[ Activity 1 ]---[ Quiz 1 ]---[ Snapshot Date / Cutoff ]===|=== EXAM DATE ===> [ Post-Exam Activity ]
                                                           │
                                                           ▼
                                               Features Extracted Here
                                              (Post-exam data is strictly ignored)
```

1. **Target Isolation**: `finalExamScore` is never part of the feature dictionary. It is only appended as the external label.
2. **Strict Cutoff Boundary**: Every aggregation enforces `record.date <= cutoffDate`. Any study session, quiz attempt, or tutor conversation that occurred after the cutoff is discarded from the feature vector.
3. **No Future Performance**: Previous scores require `priorExam.date < targetExam.date`.
4. **Active Validation**: The `validateRecord` function explicitly checks that `finalExamScore` is not identical to or mirrored in any feature attribute.

---

## 10. Difference Between Training and Prediction Data

| Attribute | Historical Training Data | Prediction Data |
| :--- | :--- | :--- |
| **Purpose** | Training the scikit-learn regression model. | Live inference for upcoming exams. |
| **Cutoff Date** | Exam date (or 1 day before exam). | Current snapshot date (today). |
| **`finalExamScore`** | **Known Number (e.g. 84.0)** | **Strictly `null`** |
| **Data Source** | Completed exams & historical cohort benchmarks. | Active student profile & upcoming syllabus exams. |
| **Target Role** | Supervised learning label ($y$). | Prediction output ($\hat{y}$) generated by future model. |

---

## 11. Future Python Machine Learning Architecture

The application is structured to interface with a dedicated Python ML service:

```
┌──────────────────────────────────────┐
│       React StudySense AI            │
│   (State, Activities, Exams CRUD)    │
└──────────────────┬───────────────────┘
                   │
                   │ JSON Feature Vector
                   ▼
┌──────────────────────────────────────┐
│   src/services/mlService.js          │
│   (Frontend ML Abstraction Layer)    │
└──────────────────┬───────────────────┘
                   │
                   │ POST /api/predict-exam-score
                   ▼
┌──────────────────────────────────────┐
│       Python FastAPI / Flask         │
│           (ML Backend API)           │
└──────────────────┬───────────────────┘
                   │
                   │ pandas DataFrame
                   ▼
┌──────────────────────────────────────┐
│       scikit-learn Pipeline          │
│   • SimpleImputer (median for nulls) │
│   • StandardScaler                   │
│   • Ridge / Random Forest Regressor  │
└──────────────────┬───────────────────┘
                   │
                   │ {"predictedScore": 78.4, "confidence": 0.88}
                   ▼
┌──────────────────────────────────────┐
│       Student UI Dashboard           │
│   "Estimated Exam Score: 78 / 100"   │
└──────────────────────────────────────┘
```

### Decoupled Interface Methods in `mlService.js`:
* `predictExamScore(features)`: Sends an engineered feature vector to the ML API. Currently returns a truthful `{ available: false, reason: "ML model not trained yet" }`.
* `getSubjectPrediction(subjectId)`: Queries prediction for a specific subject.
* `getAllSubjectPredictions()`: Queries predictions across all 4 Semester V subjects.
* `getModelStatus()`: Provides pipeline health and training readiness.

---

## 12. Verification & CSV Export

The dataset pipeline provides:
* **`exportTrainingDataset()`**: Exports the historical training set to RFC 4180-compliant CSV (`studysense_ml_training_dataset.csv`).
* **`exportDatasetToCSV(records, filename)`**: Exports custom record subsets.
* **`validateDataset(records)`**: Automatically audits all records for schema compliance, value bounds, and leakage prevention.
