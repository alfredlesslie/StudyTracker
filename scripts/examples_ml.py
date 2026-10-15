# -*- coding: utf-8 -*-
"""
Machine Learning (24CSR504) - 16 Topics Examples
"""

ML_EXAMPLES = {
    "ml-m1-t1": {
        "title": "Real-World Industry Mapping: Machine Learning Paradigms",
        "scenario": "A technology consultancy categorizes 4 client business problems into their correct Machine Learning paradigms: (A) Predicting patient hospital readmission risk; (B) Segmenting e-commerce customers into persona clusters; (C) Training an autonomous drone to navigate wind turbulence; (D) Transcribing doctor audio dictation into medical records.",
        "steps": [
            {
                "stage": "Problem A: Patient Readmission Risk (Supervised Regression/Classification)",
                "details": "Data contains historical patient records (age, blood glucose, diagnosis) labeled with whether they were readmitted within 30 days (ground-truth y in {0, 1}). Model learns mapping f: X -> y."
            },
            {
                "stage": "Problem B: Customer Persona Segmentation (Unsupervised Clustering)",
                "details": "Data contains transaction amounts and browsing patterns without pre-existing labels. Algorithm (k-Means/DBSCAN) discovers natural structural groupings based on feature similarity."
            },
            {
                "stage": "Problem C: Autonomous Drone Navigation (Reinforcement Learning)",
                "details": "No static dataset. An agent interacts with a physical/simulated environment, takes actions (motor thrust), and receives reward signals (+10 for maintaining altitude, -100 for crash) to learn optimal policy pi(s)."
            },
            {
                "stage": "Problem D: Speech-to-Text Transcription (Supervised Sequence-to-Sequence)",
                "details": "Audio waveforms (inputs X) paired with human ground-truth text transcripts (targets Y) trained using connectionist temporal classification (CTC) or encoder-decoder transformers (Whisper)."
            }
        ],
        "expectedResult": "Clear architectural taxonomy: Supervised learning requires ground-truth labels (X, y); Unsupervised requires only features (X); Reinforcement Learning operates via trial-and-error reward feedback.",
        "practicalApplication": "Enterprise ML project scoping, pipeline architecture selection, and identifying labeling budget requirements.",
        "keyInsight": "Always ask: 'Do we have verified historical ground-truth answers for every training sample?' If yes -> Supervised; if no -> Unsupervised; if an agent is learning an interactive policy -> Reinforcement Learning."
    },
    "ml-m1-t2": {
        "title": "End-to-End Loan Default Prediction ML Pipeline Workflow",
        "scenario": "A digital lending startup builds an automated production ML pipeline to predict loan default risk on 10,000 credit applications. Trace the 6 modular stages of the machine learning lifecycle.",
        "diagram": "[Raw SQL DB] -> [Data Cleaning & Imputation] -> [Feature Engineering & Scaling] -> [Train/Val/Test Split] -> [XGBoost Training] -> [Evaluation & Monitoring]",
        "steps": [
            {
                "stage": "Stage 1: Ingestion & Validation",
                "details": "Ingest tabular dataset (Income, Credit Score, Debt-to-Income, Employment Years, Default_Flag). Check schema: detect that 'Employment Years' has 4.2% missing values."
            },
            {
                "stage": "Stage 2: Preprocessing & Leakage-Free Splitting",
                "details": "CRITICAL: Split data into 80% Train (8,000) and 20% Test (2,000) BEFORE any preprocessing to prevent data leakage. Impute missing employment with median calculated strictly from the training split."
            },
            {
                "stage": "Stage 3: Feature Engineering & One-Hot Encoding",
                "details": "One-hot encode categorical feature 'Home_Ownership' (Rent, Own, Mortgage). Apply StandardScaler to continuous numerical features (Income, Debt)."
            },
            {
                "stage": "Stage 4: Model Training with 5-Fold Cross-Validation",
                "details": "Train an XGBoost Classifier on training folds using Optuna Bayesian hyperparameter search (learning_rate = 0.05, max_depth = 4, n_estimators = 300)."
            },
            {
                "stage": "Stage 5: Independent Evaluation on Holdout Test Set",
                "details": "Evaluate on untouched test set: ROC-AUC = 0.88, Precision = 82%, Recall = 76% at probability threshold 0.45."
            },
            {
                "stage": "Stage 6: Deployment & Drift Monitoring",
                "details": "Wrap pipeline in FastAPI container with Prometheus metrics tracking data distribution drift (Kolmogorov-Smirnov test on input features) in production."
            }
        ],
        "expectedResult": "A reproducible, production-ready scikit-learn Pipeline object that processes raw JSON applicant data and outputs calibrated default probabilities in under 20 ms.",
        "practicalApplication": "Fintech credit scoring, insurance claims fraud pipelines, and automated ML platforms (Databricks / Vertex AI).",
        "keyInsight": "Data leakage occurs when information from outside the training dataset is used to train the model; always compute imputation and scaling statistics exclusively on the training split."
    },
    "ml-m1-t3": {
        "title": "Data Preprocessing: StandardScaler vs MinMaxScaler & Imputation",
        "scenario": "A customer dataset contains feature 'Salary' with values [20000, 40000, 60000, 80000, 100000] and one missing value NaN. Walk through median imputation, StandardScaler (Z-Score), and MinMaxScaler normalization.",
        "formula": "Z-score: z = (x - mu) / sigma | Min-Max: x_norm = (x - x_min) / (x_max - x_min)",
        "steps": [
            {
                "stage": "Step 1: Median Imputation",
                "details": "Values: [20k, 40k, 60k, 80k, 100k]. If a 6th customer has NaN, impute with the median = 60,000 (resistant to extreme outliers compared to the mean)."
            },
            {
                "stage": "Step 2: StandardScaler (Z-Score Normalization)",
                "details": "Mean mu = (20 + 40 + 60 + 80 + 100) / 5 = 60,000. Variance sigma^2 = [(-40k)^2 + (-20k)^2 + 0^2 + (20k)^2 + (40k)^2] / 5 = 400,000,000. Standard deviation sigma = 20,000 * sqrt(2) ≈ 28,284.\nFor 20,000: z = (20,000 - 60,000) / 28,284 = -1.414.\nFor 60,000: z = (60,000 - 60,000) / 28,284 = 0.000.\nFor 100,000: z = (100,000 - 60,000) / 28,284 = +1.414."
            },
            {
                "stage": "Step 3: MinMaxScaler ([0, 1] Rescaling)",
                "details": "x_min = 20,000, x_max = 100,000. Range = 80,000.\nFor 20,000: (20k - 20k) / 80k = 0.000.\nFor 60,000: (60k - 20k) / 80k = 40k / 80k = 0.500.\nFor 100,000: (100k - 20k) / 80k = 80k / 80k = 1.000."
            },
            {
                "stage": "Step 4: Algorithm Compatibility",
                "details": "Gradient descent algorithms (Linear/Logistic Regression, Neural Networks) and distance-based algorithms (k-NN, SVM, k-Means) require scaling so high-magnitude features (Salary in thousands) do not dwarf small features (Age in years)."
            }
        ],
        "expectedResult": "All features are scaled to compatible zero-mean unit-variance or bounded [0, 1] intervals, accelerating gradient descent convergence and preventing distance metric distortion.",
        "practicalApplication": "scikit-learn ColumnTransformer pipelines, preprocessing tabular data for PyTorch/TensorFlow, and image pixel normalization (dividing by 255.0).",
        "keyInsight": "MinMaxScaler bounds values strictly to [0, 1] but is vulnerable to extreme outliers; StandardScaler does not bound to a fixed range but handles outliers much more gracefully."
    },
    "ml-m1-t4": {
        "title": "Model Evaluation: Confusion Matrix, Precision, Recall & F1-Score",
        "scenario": "An AI model classifies 1,000 medical scans for a rare tumor. The confusion matrix results are: True Positives (TP) = 85, False Positives (FP) = 15, False Negatives (FN) = 5, True Negatives (TN) = 895. Calculate Accuracy, Precision, Recall, Specificity, and F1-Score.",
        "formula": "Accuracy = (TP + TN) / Total | Precision = TP / (TP + FP) | Recall = TP / (TP + FN) | F1 = 2*(P*R)/(P + R)",
        "steps": [
            {
                "stage": "Step 1: Compute Accuracy",
                "details": "Accuracy = (85 + 895) / 1,000 = 980 / 1,000 = 0.980 (98.0%). Note: A naive dummy classifier that always predicts 'No Tumor' would achieve 90% accuracy, showing why accuracy is misleading on imbalanced data."
            },
            {
                "stage": "Step 2: Compute Precision (Positive Predictive Value)",
                "details": "Out of all patients flagged by the model as having a tumor, how many actually had it?\nPrecision = TP / (TP + FP) = 85 / (85 + 15) = 85 / 100 = 0.850 (85.0%)."
            },
            {
                "stage": "Step 3: Compute Recall (Sensitivity)",
                "details": "Out of all patients who genuinely had a tumor, how many did the model correctly detect?\nRecall = TP / (TP + FN) = 85 / (85 + 5) = 85 / 90 = 0.944 (94.4%). Only 5 cases missed."
            },
            {
                "stage": "Step 4: Compute Harmonic Mean F1-Score",
                "details": "F1 = 2 × (Precision × Recall) / (Precision + Recall) = 2 × (0.850 × 0.944) / (0.850 + 0.944) = 2 × (0.8024) / (1.794) = 1.6048 / 1.794 ≈ 0.8945 (89.5%)."
            }
        ],
        "expectedResult": "Model achieves 94.4% Recall, capturing almost all sick patients, with an 85.0% Precision and 89.5% F1-score, providing a balanced assessment that overall accuracy hides.",
        "practicalApplication": "Medical diagnostic screening, credit card fraud detection, search engine relevance, and spam filtering.",
        "keyInsight": "The harmonic mean F1-Score punishes extreme disparity between precision and recall; if either metric approaches zero, the F1-Score collapses."
    },
    "ml-m2-t1": {
        "title": "Simple Linear Regression: Closed-Form Slope & Intercept Calculation",
        "scenario": "A dataset contains years of experience (X) and salary in lakhs (Y) for 4 software developers: (1 yr, 4 lakhs), (2 yrs, 6 lakhs), (3 yrs, 7 lakhs), (4 yrs, 11 lakhs). Compute the optimal slope w1, intercept w0, and predict salary for a developer with 5 years experience.",
        "formula": "w1 = Sum((X - x_bar)(Y - y_bar)) / Sum((X - x_bar)^2) | w0 = y_bar - w1 * x_bar",
        "steps": [
            {
                "stage": "Step 1: Compute Means of X and Y",
                "details": "x_bar = (1 + 2 + 3 + 4) / 4 = 10 / 4 = 2.5 years.\ny_bar = (4 + 6 + 7 + 11) / 4 = 28 / 4 = 7.0 lakhs."
            },
            {
                "stage": "Step 2: Compute Numerator (Covariance sum)",
                "details": "Deviations for X: [1 - 2.5 = -1.5, 2 - 2.5 = -0.5, 3 - 2.5 = 0.5, 4 - 2.5 = 1.5].\nDeviations for Y: [4 - 7 = -3, 6 - 7 = -1, 7 - 7 = 0, 11 - 7 = +4].\nSum: (-1.5 × -3) + (-0.5 × -1) + (0.5 × 0) + (1.5 × 4) = 4.5 + 0.5 + 0 + 6.0 = 11.0."
            },
            {
                "stage": "Step 3: Compute Denominator (Variance sum of X)",
                "details": "Sum((X - x_bar)^2) = (-1.5)^2 + (-0.5)^2 + (0.5)^2 + (1.5)^2 = 2.25 + 0.25 + 0.25 + 2.25 = 5.0."
            },
            {
                "stage": "Step 4: Compute Slope w1 & Intercept w0",
                "details": "Slope w1 = 11.0 / 5.0 = 2.20 lakhs/year.\nIntercept w0 = y_bar - w1 * x_bar = 7.0 - (2.20 × 2.5) = 7.0 - 5.5 = 1.50 lakhs.\nFitted Model: Salary = 2.20 * (Years) + 1.50."
            },
            {
                "stage": "Step 5: Prediction for 5 Years Experience",
                "details": "Salary(5) = 2.20 × 5 + 1.50 = 11.00 + 1.50 = 12.50 lakhs."
            }
        ],
        "expectedResult": "Regression model Salary = 2.2*Experience + 1.5 predicts a starting base of 1.5 lakhs plus 2.2 lakhs per year of experience, predicting 12.5 lakhs for 5 years of experience.",
        "practicalApplication": "House price estimation based on square footage, crop yield forecasting, and financial trend regression.",
        "keyInsight": "Simple linear regression minimizes the sum of squared vertical residuals (errors) between the observed data points and the fitted hyperplane."
    },
    "ml-m2-t2": {
        "title": "Batch Gradient Descent on Linear Regression Mean Squared Error (MSE)",
        "scenario": "For a simple model y_hat = w*x with zero bias and training pair (x=2, y=5), compute the MSE loss J(w), calculate the analytical gradient dJ/dw, and perform one gradient descent update step starting from initial weight w_0 = 1.0 with learning rate alpha = 0.05.",
        "formula": "Loss J(w) = 0.5 * (y_hat - y)^2 | Gradient dJ/dw = (y_hat - y) * x | w_(t+1) = w_t - alpha * (dJ/dw)",
        "steps": [
            {
                "stage": "Step 1: Compute Model Prediction & Residual Error",
                "details": "Initial weight w_0 = 1.0. Given input x = 2.0, target y = 5.0.\nPredicted y_hat = w_0 * x = 1.0 × 2.0 = 2.0.\nResidual error e = (y_hat - y) = 2.0 - 5.0 = -3.0 (model underpredicts by 3.0)."
            },
            {
                "stage": "Step 2: Compute Mean Squared Error Loss J(w)",
                "details": "J(w) = 0.5 × (y_hat - y)^2 = 0.5 × (-3.0)^2 = 0.5 × 9.0 = 4.50."
            },
            {
                "stage": "Step 3: Compute Gradient dJ/dw",
                "details": "By chain rule: dJ/dw = dJ/dy_hat * dy_hat/dw = (y_hat - y) × x = (-3.0) × 2.0 = -6.0.\nThe negative slope indicates that increasing w will decrease the loss."
            },
            {
                "stage": "Step 4: Update Weight Parameter",
                "details": "w_1 = w_0 - alpha * (dJ/dw) = 1.0 - 0.05 × (-6.0) = 1.0 + 0.30 = 1.30.\nNew prediction y_hat_new = 1.30 × 2.0 = 2.60.\nNew loss = 0.5 × (2.60 - 5.0)^2 = 0.5 × (-2.40)^2 = 2.88 (Loss dropped from 4.50 to 2.88!)."
            }
        ],
        "expectedResult": "Weight increases from 1.0 to 1.30, driving predicted output closer to target 5.0 and reducing MSE loss by 36% in a single step.",
        "practicalApplication": "Training deep learning weights in PyTorch via SGD/Adam, linear regression in streaming big data, and online learning algorithms.",
        "keyInsight": "The gradient magnitude is directly proportional to both the error residual (y_hat - y) and the input feature magnitude (x); large feature scales cause wild gradient updates unless normalized."
    },
    "ml-m2-t3": {
        "title": "Worked Numerical: Computing Probability & Class Prediction in Logistic Regression",
        "scenario": "A student exam pass prediction model uses logistic regression with weights: bias w0 = -4.0 and study hours weight w1 = 0.80. A student studies x1 = 6 hours. Calculate the linear score z, the logistic sigmoid probability p = sigma(z), and determine the final classification at threshold 0.5.",
        "formula": "z = w0 + w1*x1 | Probability p = 1 / (1 + exp(-z)) | Class = 1 if p >= 0.5 else 0",
        "steps": [
            {
                "stage": "Step 1: Compute Log-Odds Linear Combination z",
                "details": "z = w0 + w1*x1 = -4.0 + (0.80 × 6.0) = -4.0 + 4.8 = +0.80."
            },
            {
                "stage": "Step 2: Evaluate Sigmoid Activation Function sigma(z)",
                "details": "exp(-z) = e^(-0.80) ≈ 0.44933.\nsigma(0.80) = 1 / (1 + 0.44933) = 1 / 1.44933 ≈ 0.690 (69.0%)."
            },
            {
                "stage": "Step 3: Decision Boundary Threshold Application",
                "details": "Default classification threshold tau = 0.5.\nSince p = 0.690 >= 0.5, classify output as Class 1 (Pass)."
            },
            {
                "stage": "Step 4: Find Decision Boundary Study Hours",
                "details": "Decision boundary occurs where p = 0.5 => z = 0.\nz = -4.0 + 0.80(x*) = 0 => 0.80(x*) = 4.0 => x* = 5.0 hours.\nStudents studying < 5 hours have p < 0.5 (Fail); students studying > 5 hours have p > 0.5 (Pass)."
            }
        ],
        "expectedResult": "The student with 6 study hours has a 69.0% probability of passing and is classified as Pass. The decision boundary lies at exactly 5.0 study hours.",
        "practicalApplication": "Email spam classification, patient heart disease risk scoring, and customer churn likelihood estimation.",
        "keyInsight": "Linear regression fits an unbounded line (-inf to +inf); logistic regression applies the non-linear S-shaped sigmoid function to squash real values into a valid probability range between [0, 1]."
    },
    "ml-m2-t4": {
        "title": "k-Nearest Neighbors (k-NN) Classification & Naïve Bayes Posterior",
        "scenario": "A 2D dataset contains 4 points: P1(1, 1)[Class A], P2(2, 1)[Class A], P3(4, 3)[Class B], P4(5, 4)[Class B]. A query point Q is at (2, 2). Classify Q using k-NN with k = 3 and Euclidean distance.",
        "formula": "Euclidean Distance d(P, Q) = sqrt((x1 - x2)^2 + (y1 - y2)^2)",
        "steps": [
            {
                "stage": "Step 1: Compute Distances from Query Point Q(2, 2)",
                "details": "d(Q, P1) = sqrt((2 - 1)^2 + (2 - 1)^2) = sqrt(1 + 1) = sqrt(2) ≈ 1.414 [Class A].\nd(Q, P2) = sqrt((2 - 2)^2 + (2 - 1)^2) = sqrt(0 + 1) = 1.000 [Class A].\nd(Q, P3) = sqrt((2 - 4)^2 + (2 - 3)^2) = sqrt(4 + 1) = sqrt(5) ≈ 2.236 [Class B].\nd(Q, P4) = sqrt((2 - 5)^2 + (2 - 4)^2) = sqrt(9 + 4) = sqrt(13) ≈ 3.606 [Class B]."
            },
            {
                "stage": "Step 2: Rank Neighbors by Ascending Distance",
                "details": "1st Nearest: P2 (d = 1.000) -> Class A\n2nd Nearest: P1 (d = 1.414) -> Class A\n3rd Nearest: P3 (d = 2.236) -> Class B"
            },
            {
                "stage": "Step 3: Majority Voting for k = 3",
                "details": "The 3 nearest neighbors are {P2, P1, P3}. Class votes: Class A = 2 votes, Class B = 1 vote. Majority winner is Class A."
            },
            {
                "stage": "Step 4: Boundary Sensitivity to k",
                "details": "If k = 1: Nearest is P2 -> Class A. If k = 4: Tie (2 Class A, 2 Class B) -> tie-breaking required. Choosing odd k avoids ties in binary classification."
            }
        ],
        "expectedResult": "Query point Q(2, 2) is classified as Class A with 66.7% confidence (2 out of 3 neighbor votes).",
        "practicalApplication": "Handwritten digit recognition (MNIST), recommendation systems (user-user collaborative filtering), and anomaly detection.",
        "keyInsight": "k-NN is a lazy non-parametric learning algorithm: it performs zero training computation at fitting time and defers all distance calculations to query inference time."
    },
    "ml-m3-t1": {
        "title": "Supervised Learning vs Unsupervised Clustering Comparison",
        "scenario": "A university has academic data for 500 students (GPA, library hours, lab attendance). Contrast how a Supervised Learning model and an Unsupervised Clustering model analyze the exact same student dataset.",
        "steps": [
            {
                "stage": "Approach 1: Supervised Learning (Placement Prediction)",
                "details": "Input Features X = [GPA, Hours, Attendance]. Ground-Truth Labels y = {Placed = 1, Unplaced = 0}. Algorithm (Random Forest) learns decision rules that map features to known placement outcomes. Evaluated by accuracy on holdout test set."
            },
            {
                "stage": "Approach 2: Unsupervised Learning (Student Study Personas)",
                "details": "Input Features X = [GPA, Hours, Attendance]. Target labels y DO NOT EXIST. Algorithm (k-Means with k = 3) clusters students into intrinsic behavioral archetypes based on geometric proximity in feature space."
            },
            {
                "stage": "Cluster Archetype Discovery",
                "details": "Cluster 1: High lab attendance, medium GPA ('Practical Learners').\nCluster 2: High library hours, high GPA ('Academic Achievers').\nCluster 3: Low library hours, low lab attendance ('At-Risk Students')."
            },
            {
                "stage": "Key Operational Differences",
                "details": "Supervised requires expensive human annotation and learns a directional mapping X -> y. Unsupervised requires zero labeling cost and explores underlying structure, correlations, and density in X."
            }
        ],
        "expectedResult": "Supervised learning yields a targeted predictive score for placement; unsupervised learning reveals actionable student learning personas that guide tailored university intervention programs.",
        "practicalApplication": "Supervised: Credit risk scoring, self-driving car object detection. Unsupervised: Gene expression clustering, fraud ring discovery, market basket analysis.",
        "keyInsight": "Supervised learning asks: 'Can we predict known outcome y from X?'; Unsupervised learning asks: 'What patterns, clusters, or manifold structures naturally exist within X?'"
    },
    "ml-m3-t2": {
        "title": "Worked Numerical: 1D k-Means Clustering Convergence Step",
        "scenario": "Perform one complete iteration of the k-Means clustering algorithm on 1D dataset points: {2, 4, 10, 12, 3, 20} with k = 2 clusters and initial centroids mu1 = 2.0 and mu2 = 12.0.",
        "formula": "Assignment: c_i = argmin_j (||x_i - mu_j||^2) | Update: mu_j = (1 / |S_j|) * Sum_(x in S_j) x",
        "steps": [
            {
                "stage": "Step 1: Distance Calculation & Assignment to Centroids",
                "details": "Point 2: d(2, 2)=0, d(2, 12)=10 -> Assign to Cluster 1.\nPoint 3: d(3, 2)=1, d(3, 12)=9 -> Assign to Cluster 1.\nPoint 4: d(4, 2)=2, d(4, 12)=8 -> Assign to Cluster 1.\nPoint 10: d(10, 2)=8, d(10, 12)=2 -> Assign to Cluster 2.\nPoint 12: d(12, 2)=10, d(12, 12)=0 -> Assign to Cluster 2.\nPoint 20: d(20, 2)=18, d(20, 12)=8 -> Assign to Cluster 2."
            },
            {
                "stage": "Step 2: Form Resulting Cluster Member Sets",
                "details": "Cluster 1 members S1 = {2, 3, 4}.\nCluster 2 members S2 = {10, 12, 20}."
            },
            {
                "stage": "Step 3: Recompute Centroids (Mean of Members)",
                "details": "New mu1 = (2 + 3 + 4) / 3 = 9 / 3 = 3.0.\nNew mu2 = (10 + 12 + 20) / 3 = 42 / 3 = 14.0."
            },
            {
                "stage": "Step 4: Within-Cluster Sum of Squares (WCSS) Calculation",
                "details": "WCSS_1 = (2-3)^2 + (3-3)^2 + (4-3)^2 = 1 + 0 + 1 = 2.\nWCSS_2 = (10-14)^2 + (12-14)^2 + (20-14)^2 = 16 + 4 + 36 = 56.\nTotal WCSS = 2 + 56 = 58."
            }
        ],
        "expectedResult": "Centroids shift from [2.0, 12.0] to [3.0, 14.0]. Repeating assignment in Iteration 2 produces identical cluster sets, confirming algorithm convergence.",
        "practicalApplication": "Customer market segmentation, image color quantization (reducing 16M RGB colors to 16 dominant colors), and document topic grouping.",
        "keyInsight": "k-Means uses Expectation-Maximization (EM): the E-step assigns points to nearest centroids; the M-step recalculates centroid positions as member averages, monotonically minimizing WCSS."
    },
    "ml-m3-t3": {
        "title": "DBSCAN Density-Based Clustering: Core, Border & Noise Point Classification",
        "scenario": "A spatial dataset contains GPS locations of taxi pickups. DBSCAN is configured with radius epsilon = 2.0 km and MinPts = 3 points. Classify 5 sample points into Core, Border, or Noise.",
        "steps": [
            {
                "stage": "Point A (Downtown Taxi Stand)",
                "details": "Has 6 points within radius epsilon = 2.0. Since neighborhood count (6) >= MinPts (3), Point A is classified as a CORE POINT. It forms the seed of Cluster 1."
            },
            {
                "stage": "Point B (Suburban Train Station)",
                "details": "Has 4 points within radius epsilon = 2.0. Since count (4) >= MinPts (3), Point B is a CORE POINT. Since B is within epsilon of A, Cluster 1 expands to include B."
            },
            {
                "stage": "Point C (Quiet Residential Street)",
                "details": "Has only 2 points within radius epsilon = 2.0 (count < 3, so not Core). However, Point C lies within epsilon of Core Point B. Point C is classified as a BORDER POINT of Cluster 1."
            },
            {
                "stage": "Point D (Isolated Highway Breakdown)",
                "details": "Has 0 other points within radius epsilon = 2.0. Count < 3 and not within radius of any core point. Point D is classified as a NOISE POINT (Anomaly / Outlier)."
            }
        ],
        "expectedResult": "DBSCAN identifies dense clusters of arbitrary non-spherical shapes while automatically filtering out isolated noise points without needing to specify k in advance.",
        "practicalApplication": "Geospatial traffic hotspot detection, network intrusion anomaly detection, and astronomical star cluster identification.",
        "keyInsight": "Unlike k-Means (which assumes convex spherical clusters and forces every outlier into a cluster), DBSCAN identifies arbitrary shapes and explicitly handles noise."
    },
    "ml-m3-t4": {
        "title": "Principal Component Analysis (PCA): 2D to 1D Dimensionality Reduction",
        "scenario": "A 2D centered dataset has sample covariance matrix C = [[2.0, 1.0], [1.0, 2.0]]. Find the first Principal Component (PC1) vector, project data onto PC1, and calculate the percentage of total variance explained.",
        "formula": "det(C - lambda*I) = 0 | Explained Variance Ratio = lambda_1 / (lambda_1 + lambda_2)",
        "steps": [
            {
                "stage": "Step 1: Compute Eigenvalues of Covariance Matrix C",
                "details": "det([[2-λ, 1], [1, 2-λ]]) = (2-λ)^2 - 1 = λ^2 - 4λ + 4 - 1 = λ^2 - 4λ + 3 = 0.\nFactoring: (λ - 3)(λ - 1) = 0. Eigenvalues: λ1 = 3.0, λ2 = 1.0."
            },
            {
                "stage": "Step 2: Compute Eigenvector for Dominant λ1 = 3.0",
                "details": "(C - 3I)v = [[-1, 1], [1, -1]][v1, v2]^T = [0, 0]^T => -v1 + v2 = 0 => v1 = v2.\nNormalized PC1 unit vector: e1 = [1/√2, 1/√2]^T ≈ [0.707, 0.707]^T."
            },
            {
                "stage": "Step 3: Calculate Explained Variance Ratio",
                "details": "Total variance = trace(C) = λ1 + λ2 = 3.0 + 1.0 = 4.0.\nExplained Variance by PC1 = λ1 / Total = 3.0 / 4.0 = 0.75 (75.0% of all information retained in 1 dimension!)."
            },
            {
                "stage": "Step 4: Project Sample Point [2, 2]^T onto PC1",
                "details": "Projected coordinate = [2, 2] · [1/√2, 1/√2] = 2(1/√2) + 2(1/√2) = 4/√2 = 2.828."
            }
        ],
        "expectedResult": "Reducing dimensionality from 2D to 1D via PC1 captures 75% of total dataset variance while compressing data storage by 50%.",
        "practicalApplication": "Facial recognition (Eigenfaces), high-dimensional genomic microarray compression, and visualizing 100-feature datasets in 2D scatter plots.",
        "keyInsight": "The first principal component aligns with the axis of maximum variance; projecting data onto it minimizes orthogonal reconstruction error."
    },
    "ml-m4-t1": {
        "title": "Biological vs Artificial Neuron Architecture Mapping",
        "scenario": "Compare the biological neurobiology of a human brain pyramidal neuron with the mathematical formalization of an Artificial Neuron (Perceptron).",
        "diagram": "Biological:  [Dendrites: Inputs] ---> [Soma: Cell Body] ---> [Axon: Transmission] ---> [Synapse: Weight]\nArtificial:  [Inputs: x1, x2] --------> [Sum: z = w·x + b] -> [Activation: f(z)] ------> [Output: y]",
        "steps": [
            {
                "stage": "Component 1: Inputs & Reception",
                "details": "Biological: Dendrites receive incoming electrochemical signals (neurotransmitters) from neighboring neurons.\nArtificial: Input vector x = [x1, x2, ..., xn] represents numeric feature values."
            },
            {
                "stage": "Component 2: Signal Weighting & Integration",
                "details": "Biological: Synaptic junctions strengthen (long-term potentiation) or weaken based on experience.\nArtificial: Synaptic connection weights w = [w1, w2, ..., wn] scale inputs; soma accumulates weighted sum z = Sum(w_i * x_i) + b."
            },
            {
                "stage": "Component 3: Thresholding & Action Potential",
                "details": "Biological: If membrane potential at axon hillock crosses -55 mV threshold, an all-or-none action potential electrical spike fires down the axon.\nArtificial: Non-linear activation function f(z) (Sigmoid, ReLU, Step) determines output firing rate."
            },
            {
                "stage": "Operational Comparison",
                "details": "The human brain contains ~86 billion neurons operating in parallel at low frequency (~100 Hz) with high energy efficiency (~20 Watts); ANNs use floating-point tensor arithmetic executing on high-power silicon GPUs."
            }
        ],
        "expectedResult": "Complete mathematical correspondence: Biological neurotransmitter transmission is abstracted into linear weighted summation followed by non-linear threshold activation.",
        "practicalApplication": "Designing deep neural network architectures, neuromorphic computing chips (Intel Loihi), and computational neuroscience.",
        "keyInsight": "Artificial neurons are mathematical caricatures of biology; they capture the essential principle of weighted summation and threshold activation without biological biochemical complexity."
    },
    "ml-m4-t2": {
        "title": "Activation Functions: ReLU vs Sigmoid vs Softmax Numerical Evaluation",
        "scenario": "A hidden layer in a neural network produces pre-activation values z = [-2.0, 0.0, 3.0]. Compute the forward outputs of ReLU, Sigmoid, and Softmax activation functions, and evaluate their gradients.",
        "formula": "ReLU = max(0, z) | Sigmoid = 1 / (1 + exp(-z)) | Softmax = exp(z_i) / Sum(exp(z_j))",
        "steps": [
            {
                "stage": "Step 1: Compute ReLU Activation",
                "details": "ReLU(z) = max(0, z):\nReLU(-2.0) = max(0, -2.0) = 0.0.\nReLU(0.0) = max(0, 0.0) = 0.0.\nReLU(3.0) = max(0, 3.0) = 3.0.\nOutput = [0.0, 0.0, 3.0]. Gradient is 1 for z > 0, preventing vanishing gradients."
            },
            {
                "stage": "Step 2: Compute Sigmoid Activation",
                "details": "sigma(z) = 1 / (1 + exp(-z)):\nsigma(-2.0) = 1 / (1 + e^2) = 1 / (1 + 7.389) ≈ 0.119.\nsigma(0.0) = 1 / (1 + e^0) = 1 / (1 + 1) = 0.500.\nsigma(3.0) = 1 / (1 + e^-3) = 1 / (1 + 0.0498) ≈ 0.953.\nOutput = [0.119, 0.500, 0.953]. All bounded between (0, 1)."
            },
            {
                "stage": "Step 3: Compute Softmax (Multi-Class Probability Distribution)",
                "details": "Compute exponentials: e^-2.0 = 0.1353, e^0.0 = 1.0000, e^3.0 = 20.0855.\nSum of exponentials S = 0.1353 + 1.0000 + 20.0855 = 21.2208.\nSoftmax(-2.0) = 0.1353 / 21.2208 = 0.0064 (0.6%).\nSoftmax(0.0) = 1.0000 / 21.2208 = 0.0471 (4.7%).\nSoftmax(3.0) = 20.0855 / 21.2208 = 0.9465 (94.7%).\nSum = 0.0064 + 0.0471 + 0.9465 = 1.000 (100%)."
            }
        ],
        "expectedResult": "ReLU outputs sparse activations [0, 0, 3]; Sigmoid scales outputs to [0.119, 0.5, 0.953]; Softmax normalizes outputs into a valid categorical probability distribution summing to exactly 1.0.",
        "practicalApplication": "ReLU for hidden layers in CNNs/MLPs; Sigmoid for binary classification outputs; Softmax for multi-class classification (ImageNet 1000 classes).",
        "keyInsight": "ReLU solves the vanishing gradient problem in deep networks because its derivative is a constant 1 for positive inputs, whereas Sigmoid derivatives saturate to near-zero for |z| > 4."
    },
    "ml-m4-t3": {
        "title": "McCulloch-Pitts Neuron Design for Logical AND & OR Gates",
        "scenario": "Design a McCulloch-Pitts (MP) artificial neuron to implement a 2-input Boolean AND gate and a 2-input Boolean OR gate by selecting integer synaptic weights and activation threshold theta.",
        "formula": "Firing Rule: y = 1 if Sum(w_i * x_i) >= theta else 0 (Inputs x_i in {0, 1})",
        "steps": [
            {
                "stage": "Step 1: Truth Table for AND Gate",
                "details": "(0, 0) -> 0; (0, 1) -> 0; (1, 0) -> 0; (1, 1) -> 1.\nOutput fires if and only if BOTH inputs are 1."
            },
            {
                "stage": "Step 2: Parameter Selection for AND Gate",
                "details": "Set excitatory weights w1 = 1, w2 = 1. Set threshold theta = 2.\nInput (0, 0): Sum = 1(0) + 1(0) = 0 < 2 -> y = 0.\nInput (0, 1): Sum = 1(0) + 1(1) = 1 < 2 -> y = 0.\nInput (1, 0): Sum = 1(1) + 1(0) = 1 < 2 -> y = 0.\nInput (1, 1): Sum = 1(1) + 1(1) = 2 >= 2 -> y = 1 (Verified!)."
            },
            {
                "stage": "Step 3: Parameter Selection for OR Gate",
                "details": "Truth table: (0, 0) -> 0; (0, 1) -> 1; (1, 0) -> 1; (1, 1) -> 1.\nKeep weights w1 = 1, w2 = 1. Lower threshold theta = 1.\nInput (0, 0): Sum = 0 < 1 -> y = 0.\nInputs (0, 1), (1, 0), (1, 1): Sums = 1, 1, 2 >= 1 -> y = 1 (Verified!)."
            },
            {
                "stage": "Step 4: The Inherent Limitation (XOR Gate)",
                "details": "For XOR: (0, 1)->1 and (1, 0)->1 requires w1 >= theta and w2 >= theta. But (1, 1)->0 requires w1 + w2 < theta. This creates an impossible mathematical contradiction (2*theta < theta for theta > 0). A single linear MP neuron CANNOT solve XOR."
            }
        ],
        "expectedResult": "AND gate is synthesized with w=[1, 1] and threshold theta=2; OR gate with w=[1, 1] and theta=1. The XOR failure mathematically demonstrates the necessity of multi-layer networks.",
        "practicalApplication": "Digital logic synthesis in neural hardware, historical foundations of computational AI, and binary threshold units.",
        "keyInsight": "The McCulloch-Pitts neuron proved in 1943 that simple networks of artificial neurons can compute any finite logical Boolean function."
    },
    "ml-m4-t4": {
        "title": "Single Perceptron Learning Rule Update & Multi-Layer Backpropagation",
        "scenario": "A single Rosenblatt perceptron has weights w1 = 0.5, w2 = -0.3, bias b = 0.1, and learning rate alpha = 0.2. Given training sample x = [2, 1] with target label y = 1, calculate the linear sum, unit step prediction, error, and updated weights.",
        "formula": "z = w1*x1 + w2*x2 + b | y_hat = 1 if z >= 0 else 0 | w_new = w_old + alpha * (y - y_hat) * x",
        "steps": [
            {
                "stage": "Step 1: Compute Linear Combination z",
                "details": "z = w1*x1 + w2*x2 + b = (0.5 × 2) + (-0.3 × 1) + 0.1 = 1.0 - 0.3 + 0.1 = 0.80."
            },
            {
                "stage": "Step 2: Compute Predicted Activation y_hat",
                "details": "Threshold activation: y_hat = 1 if z >= 0 else 0.\nSince z = 0.80 >= 0, predicted y_hat = 1."
            },
            {
                "stage": "Step 3: Compute Error Residual",
                "details": "Target y = 1, Predicted y_hat = 1.\nError = (y - y_hat) = 1 - 1 = 0. No update required for this sample!"
            },
            {
                "stage": "Step 4: Counter-Example: Misclassified Point (Target y = 0)",
                "details": "Suppose for this same point x = [2, 1], the true label was y = 0.\nError = (0 - 1) = -1. Perceptron learning rule triggers:\nDelta_w1 = alpha * (y - y_hat) * x1 = 0.2 × (-1) × 2 = -0.40.\nw1_new = 0.5 + (-0.40) = 0.10.\nDelta_w2 = alpha * (y - y_hat) * x2 = 0.2 × (-1) × 1 = -0.20.\nw2_new = -0.3 + (-0.20) = -0.50.\nDelta_b = alpha * (y - y_hat) * 1 = 0.2 × (-1) × 1 = -0.20.\nb_new = 0.1 - 0.20 = -0.10."
            },
            {
                "stage": "Step 5: Multi-Layer Perceptron (MLP) & Backpropagation Solution",
                "details": "To solve non-linearly separable problems like XOR, an MLP introduces hidden layers with differentiable activation functions (Sigmoid/ReLU). Backpropagation applies the multivariate chain rule to calculate partial derivatives dLoss/dWeight layer by layer from output back to input."
            }
        ],
        "expectedResult": "Weights update to w1=0.10, w2=-0.50, b=-0.10. New z = (0.10*2) + (-0.50*1) - 0.10 = 0.20 - 0.50 - 0.10 = -0.40 < 0 => y_hat = 0, correcting the classification error.",
        "practicalApplication": "Training binary linear classifiers, understanding gradient backpropagation in PyTorch, and historical perceptron convergence theorem.",
        "keyInsight": "Rosenblatt's Perceptron Learning Rule only adjusts weights when an error occurs; if data is linearly separable, it is mathematically proven to converge in a finite number of steps."
    }
}
