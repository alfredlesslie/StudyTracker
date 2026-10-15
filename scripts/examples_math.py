# -*- coding: utf-8 -*-
"""
Advanced Mathematics for Data Science (24CST503) - 16 Topics Examples
"""

MATH_EXAMPLES = {
    "math-m1-t1": {
        "title": "Vector Dot Product, Cosine Similarity & Tensor Dimensions in NLP",
        "scenario": "A search engine represents two text documents as word count vectors: Document A vector u = [2, 1, 0, 3] and Document B vector v = [1, 2, 0, 1]. Compute their dot product, Euclidean norms, and cosine similarity.",
        "formula": "Dot Product u·v = Sum(u_i * v_i) | Cosine Similarity = (u·v) / (||u|| * ||v||)",
        "steps": [
            {
                "stage": "Step 1: Compute Vector Dot Product",
                "details": "u·v = (2 × 1) + (1 × 2) + (0 × 0) + (3 × 1) = 2 + 2 + 0 + 3 = 7."
            },
            {
                "stage": "Step 2: Compute Euclidean Norms (Magnitudes)",
                "details": "||u|| = sqrt(2^2 + 1^2 + 0^2 + 3^2) = sqrt(4 + 1 + 0 + 9) = sqrt(14) ≈ 3.742.\n||v|| = sqrt(1^2 + 2^2 + 0^2 + 1^2) = sqrt(1 + 4 + 0 + 1) = sqrt(6) ≈ 2.449."
            },
            {
                "stage": "Step 3: Calculate Cosine Similarity",
                "details": "Cosine Similarity = 7 / (3.742 × 2.449) = 7 / 9.164 ≈ 0.7638 (76.4% directional alignment)."
            },
            {
                "stage": "Step 4: Tensor Dimensionality in Deep Learning",
                "details": "Scalar: 0D tensor (rank 0, e.g. loss = 0.24). Vector: 1D tensor (rank 1, e.g. embedding [300]). Matrix: 2D tensor (rank 2, e.g. [500 words, 300 dim]). Mini-batch: 3D tensor (rank 3, e.g. [64 batch_size, 500 seq_len, 300 embedding_dim])."
            }
        ],
        "expectedResult": "Cosine similarity of 0.764 indicates strong semantic similarity between the two documents despite differing lengths, while tensor indexing structures multi-dimensional training batches.",
        "practicalApplication": "Vector search in ChromaDB/Pinecone, document recommendation engines, and computer vision tensor transformations in PyTorch.",
        "keyInsight": "The dot product measures directional alignment scaled by magnitude; dividing by the norms yields cosine similarity, which is invariant to document length."
    },
    "math-m1-t2": {
        "title": "Matrix Determinant, Rank, Trace & Inverse Calculation",
        "scenario": "Given a 2×2 data transformation matrix A = [[3, 2], [1, 4]], compute its determinant, trace, matrix inverse A^(-1), and verify that A × A^(-1) = Identity matrix I.",
        "formula": "det(A) = ad - bc | trace(A) = a + d | A^(-1) = (1 / det(A)) * [[d, -b], [-c, a]]",
        "steps": [
            {
                "stage": "Step 1: Compute Determinant & Trace",
                "details": "det(A) = (3 × 4) - (2 × 1) = 12 - 2 = 10. Since det(A) ≠ 0, A is non-singular and invertible (full rank = 2). Trace(A) = 3 + 4 = 7."
            },
            {
                "stage": "Step 2: Construct Adjugate Matrix",
                "details": "Swap main diagonal elements (3 and 4) and negate off-diagonal elements (2 and 1): adj(A) = [[4, -2], [-1, 3]]."
            },
            {
                "stage": "Step 3: Multiply by Scalar (1 / det)",
                "details": "A^(-1) = (1 / 10) * [[4, -2], [-1, 3]] = [[0.4, -0.2], [-0.1, 0.3]]."
            },
            {
                "stage": "Step 4: Verification of Inverse",
                "details": "A × A^(-1) = [[3, 2], [1, 4]] × [[0.4, -0.2], [-0.1, 0.3]]:\nRow 1: [3(0.4) + 2(-0.1), 3(-0.2) + 2(0.3)] = [1.2 - 0.2, -0.6 + 0.6] = [1, 0].\nRow 2: [1(0.4) + 4(-0.1), 1(-0.2) + 4(0.3)] = [0.4 - 0.4, -0.2 + 1.2] = [0, 1].\nResult = [[1, 0], [0, 1]] = I."
            }
        ],
        "expectedResult": "det(A) = 10, trace(A) = 7, rank = 2. The inverse matrix [[0.4, -0.2], [-0.1, 0.3]] perfectly undoes the transformation applied by matrix A.",
        "practicalApplication": "Solving Normal Equations in Ordinary Least Squares (OLS) regression w = (X^T * X)^(-1) * X^T * y, and Kalman filtering.",
        "keyInsight": "The determinant measures how much a linear transformation scales area; if det(A) = 0, the transformation collapses space onto a line (rank deficit) and information cannot be recovered."
    },
    "math-m1-t3": {
        "title": "Testing Linear Independence & Basis in Vector Space R^3",
        "scenario": "Determine whether the set of three vectors v1 = [1, 2, 1], v2 = [2, 9, 0], and v3 = [3, 3, 4] forms a linearly independent basis for R^3 using Gaussian Elimination.",
        "formula": "c1*v1 + c2*v2 + c3*v3 = 0. Linearly independent iff the only solution is c1 = c2 = c3 = 0.",
        "steps": [
            {
                "stage": "Step 1: Set Up Augmented Matrix",
                "details": "Form matrix with vectors as columns: M = [[1, 2, 3], [2, 9, 3], [1, 0, 4]]."
            },
            {
                "stage": "Step 2: Row Operations (Row Echelon Form)",
                "details": "Operation R2 <- R2 - 2*R1: [2-2, 9-4, 3-6] = [0, 5, -3].\nOperation R3 <- R3 - R1: [1-1, 0-2, 4-3] = [0, -2, 1].\nIntermediate matrix: [[1, 2, 3], [0, 5, -3], [0, -2, 1]]."
            },
            {
                "stage": "Step 3: Eliminate Third Row",
                "details": "Operation R3 <- R3 + (2/5)*R2: [0, -2 + 2, 1 + (2/5)(-3)] = [0, 0, 1 - 6/5] = [0, 0, -0.2].\nResulting Row Echelon Form has 3 non-zero pivot positions (rank = 3)."
            },
            {
                "stage": "Step 4: Alternative Determinant Check",
                "details": "det(M) = 1*(9*4 - 0*3) - 2*(2*4 - 1*3) + 3*(2*0 - 1*9) = 1(36) - 2(5) + 3(-9) = 36 - 10 - 27 = -1. Since det(M) = -1 ≠ 0, vectors are linearly independent."
            }
        ],
        "expectedResult": "Since rank = 3 and the vectors are linearly independent in R^3, they span R^3 and constitute a valid basis (dimension = 3). None of the vectors can be expressed as a linear combination of the others.",
        "practicalApplication": "Detecting multicollinearity in regression feature spaces, preventing rank deficiency in covariance matrices, and autoencoder latent dimension design.",
        "keyInsight": "If n vectors in R^n have a non-zero determinant, they are guaranteed to be linearly independent and span the entire space."
    },
    "math-m1-t4": {
        "title": "Worked Numerical: Eigenvalues & Eigenvectors for a 2×2 Matrix",
        "scenario": "Find the eigenvalues and eigenvectors of matrix A = [[4, 2], [1, 3]], and demonstrate how they define the principal axes of variance.",
        "formula": "Characteristic Equation: det(A - lambda*I) = 0 | (A - lambda*I)v = 0",
        "steps": [
            {
                "stage": "Step 1: Characteristic Equation Setup",
                "details": "A = [[4, 2], [1, 3]]. det(A - λI) = det([[4-λ, 2], [1, 3-λ]]) = (4-λ)(3-λ) - (2)(1) = 0."
            },
            {
                "stage": "Step 2: Solve Characteristic Polynomial",
                "details": "λ^2 - 7λ + 12 - 2 = λ^2 - 7λ + 10 = 0. Factoring gives (λ - 5)(λ - 2) = 0. Eigenvalues: λ1 = 5, λ2 = 2."
            },
            {
                "stage": "Step 3: Eigenvector for λ1 = 5",
                "details": "(A - 5I)v = [[-1, 2], [1, -2]][v1, v2]^T = [0, 0]^T. Equation: -v1 + 2v2 = 0 => v1 = 2v2. Choosing v2 = 1 yields eigenvector v1 = [2, 1]^T (Normalized: [2/√5, 1/√5]^T)."
            },
            {
                "stage": "Step 4: Eigenvector for λ2 = 2",
                "details": "(A - 2I)v = [[2, 2], [1, 1]][v1, v2]^T = [0, 0]^T. Equation: 2v1 + 2v2 = 0 => v1 = -v2. Choosing v2 = 1 yields eigenvector v2 = [-1, 1]^T."
            }
        ],
        "expectedResult": "Eigenvalues are λ1 = 5 and λ2 = 2 with corresponding eigenvectors [2, 1]^T and [-1, 1]^T. Multiplying A by [2, 1]^T gives [10, 5]^T = 5 × [2, 1]^T (scaled exactly by eigenvalue 5).",
        "practicalApplication": "Principal Component Analysis (PCA) dimensionality reduction, Google PageRank algorithm, and spectral graph clustering.",
        "keyInsight": "Eigenvectors identify directions where a linear transformation acts as simple scalar stretching; eigenvalues quantify the magnitude of that stretch."
    },
    "math-m2-t1": {
        "title": "Worked Numerical: Medical Diagnostic Test Accuracy using Bayes' Theorem",
        "scenario": "A rare disease affects 1% of the population (prior probability P(D) = 0.01). A medical test has 95% sensitivity (P(T+|D) = 0.95) and a 5% false positive rate (P(T+|D^c) = 0.05). If a randomly selected patient tests positive, calculate the true probability that the patient actually has the disease.",
        "formula": "Bayes' Rule: P(D|T+) = [P(T+|D) * P(D)] / [P(T+|D)*P(D) + P(T+|D^c)*P(D^c)]",
        "steps": [
            {
                "stage": "Step 1: Identify Given Probabilities",
                "details": "P(D) = 0.01 => P(D^c) = 1 - 0.01 = 0.99 (Healthy population).\nP(T+|D) = 0.95 (True Positive Rate / Sensitivity).\nP(T+|D^c) = 0.05 (False Positive Rate)."
            },
            {
                "stage": "Step 2: Compute Total Probability of Positive Test (Denominator)",
                "details": "P(T+) = P(T+|D)*P(D) + P(T+|D^c)*P(D^c) = (0.95 × 0.01) + (0.05 × 0.99) = 0.0095 + 0.0495 = 0.0590 (5.9% of all tests will be positive)."
            },
            {
                "stage": "Step 3: Calculate Posterior Probability P(D|T+)",
                "details": "P(D|T+) = 0.0095 / 0.0590 = 95 / 590 ≈ 0.1610 (16.1%)."
            },
            {
                "stage": "Step 4: Intuitive Frequency Walkthrough (Per 10,000 People)",
                "details": "Out of 10,000 people: 100 have disease (95 test positive, 5 false negative). 9,900 are healthy (5% of 9,900 = 495 false positives). Total positive tests = 95 + 495 = 590. True positives = 95 / 590 = 16.1%."
            }
        ],
        "expectedResult": "Despite the test being 95% accurate in isolation, a positive test result yields only a 16.1% probability of actually having the disease due to the low base rate of the disease in the population.",
        "practicalApplication": "Naïve Bayes spam filtering, clinical diagnostics, rare-event fraud detection, and biometric security false accept rate analysis.",
        "keyInsight": "When the prior base rate of a condition is low, false positives from the large healthy population easily swamp true positives from the small diseased group (Base Rate Fallacy)."
    },
    "math-m2-t2": {
        "title": "Discrete Binomial vs Continuous Normal Distribution Modeling",
        "scenario": "A hardware quality control unit tests microchips where the probability of a defect is p = 0.1. A batch of n = 5 chips is sampled. Calculate the probability of finding exactly 2 defective chips, and compare with a continuous Gaussian distribution.",
        "formula": "Binomial: P(X = k) = nCk * p^k * (1 - p)^(n - k)",
        "steps": [
            {
                "stage": "Step 1: Set Up Binomial Parameters",
                "details": "Number of independent trials n = 5, probability of defect p = 0.1, number of successes k = 2."
            },
            {
                "stage": "Step 2: Compute Combinations nCk",
                "details": "5C2 = 5! / (2! * 3!) = (5 × 4) / (2 × 1) = 10."
            },
            {
                "stage": "Step 3: Compute Probability Terms",
                "details": "p^k = (0.1)^2 = 0.01.\n(1 - p)^(n - k) = (0.9)^3 = 0.729.\nP(X = 2) = 10 × 0.01 × 0.729 = 0.0729 (7.29%)."
            },
            {
                "stage": "Step 4: Continuous Normal Distribution Comparison",
                "details": "For continuous variable X ~ N(μ = 50, σ^2 = 25): P(X = 50) = 0 exactly. Probability is evaluated across an interval: P(45 <= X <= 55) = P(-1 <= Z <= 1) ≈ 0.6827 (68.3% by Empirical Rule)."
            }
        ],
        "expectedResult": "The probability of exactly 2 defects in 5 chips is 7.29%. Unlike discrete distributions where single points have mass, continuous distributions assign probability only to non-zero intervals.",
        "practicalApplication": "A/B testing click-through conversion rates, semiconductor yield estimation, and financial risk value-at-risk (VaR) modeling.",
        "keyInsight": "Discrete random variables utilize Probability Mass Functions (PMF) where P(X = x) > 0; continuous random variables utilize Probability Density Functions (PDF) where individual points have measure zero."
    },
    "math-m2-t3": {
        "title": "Expectation, Variance, Covariance & Pearson Correlation Walkthrough",
        "scenario": "A study records hours studied (X) and exam marks (Y) for 3 students: (2 hrs, 40 marks), (4 hrs, 60 marks), and (6 hrs, 80 marks). Compute the sample means E[X], E[Y], variances Var(X), Var(Y), Covariance Cov(X, Y), and Pearson correlation coefficient r.",
        "formula": "Cov(X, Y) = E[(X - μ_X)(Y - μ_Y)] | r = Cov(X, Y) / (σ_X * σ_Y)",
        "steps": [
            {
                "stage": "Step 1: Compute Means (Expectations)",
                "details": "E[X] = (2 + 4 + 6) / 3 = 12 / 3 = 4.0 hours.\nE[Y] = (40 + 60 + 80) / 3 = 180 / 3 = 60.0 marks."
            },
            {
                "stage": "Step 2: Compute Variances & Standard Deviations",
                "details": "Deviations for X: (2 - 4) = -2, (4 - 4) = 0, (6 - 4) = +2.\nVar(X) = [(-2)^2 + 0^2 + 2^2] / 3 = (4 + 0 + 4) / 3 = 8 / 3 ≈ 2.667. σ_X = sqrt(8/3) ≈ 1.633.\nDeviations for Y: (40 - 60) = -20, (60 - 60) = 0, (80 - 60) = +20.\nVar(Y) = [(-20)^2 + 0^2 + 20^2] / 3 = (400 + 0 + 400) / 3 = 800 / 3 ≈ 266.67. σ_Y = sqrt(800/3) ≈ 16.33."
            },
            {
                "stage": "Step 3: Compute Covariance Cov(X, Y)",
                "details": "Cross-products: [(-2 × -20) + (0 × 0) + (2 × 20)] / 3 = (40 + 0 + 40) / 3 = 80 / 3 ≈ 26.667."
            },
            {
                "stage": "Step 4: Compute Pearson Correlation r",
                "details": "r = Cov(X, Y) / (σ_X × σ_Y) = (80 / 3) / [sqrt(8/3) × sqrt(800/3)] = (80 / 3) / (80 / 3) = +1.000."
            }
        ],
        "expectedResult": "Var(X) = 2.67, Var(Y) = 266.67, Cov(X,Y) = 26.67, and r = +1.0 (perfect positive linear correlation). Every 1 additional study hour reliably increases marks by 10 points.",
        "practicalApplication": "Feature selection in machine learning, multicollinearity detection in linear regression, and portfolio diversification in finance.",
        "keyInsight": "Covariance indicates the direction of linear relationship but depends on measurement units; correlation normalizes covariance between -1 and +1, making it scale-invariant."
    },
    "math-m2-t4": {
        "title": "Two-State Weather Markov Chain Transition & Steady-State Prediction",
        "scenario": "A weather system has two states: Sunny (S) and Rainy (R). If it is Sunny today, it will be Sunny tomorrow with probability 0.8 and Rainy with probability 0.2. If it is Rainy today, it will be Sunny tomorrow with probability 0.4 and Rainy with probability 0.6. If today (Day 0) is 100% Sunny, compute state probabilities on Day 2.",
        "formula": "P = [[0.8, 0.2], [0.4, 0.6]] | State Vector v_(t+1) = v_t * P",
        "steps": [
            {
                "stage": "Step 1: Set Up Initial State & Transition Matrix",
                "details": "Initial state vector v_0 = [P(S), P(R)] = [1.0, 0.0].\nTransition Matrix P = [[0.8, 0.2], [0.4, 0.6]]."
            },
            {
                "stage": "Step 2: Compute Day 1 State Probabilities",
                "details": "v_1 = v_0 * P = [1.0, 0.0] * [[0.8, 0.2], [0.4, 0.6]] = [(1.0*0.8 + 0), (1.0*0.2 + 0)] = [0.80, 0.20]."
            },
            {
                "stage": "Step 3: Compute Day 2 State Probabilities",
                "details": "v_2 = v_1 * P = [0.80, 0.20] * [[0.8, 0.2], [0.4, 0.6]]:\nP(S on Day 2) = (0.80 × 0.8) + (0.20 × 0.4) = 0.64 + 0.08 = 0.72 (72%).\nP(R on Day 2) = (0.80 × 0.2) + (0.20 × 0.6) = 0.16 + 0.12 = 0.28 (28%).\nv_2 = [0.72, 0.28]."
            },
            {
                "stage": "Step 4: Compute Long-Term Stationary Distribution π",
                "details": "π * P = π => [π_S, π_R] * [[0.8, 0.2], [0.4, 0.6]] = [π_S, π_R].\n0.8*π_S + 0.4*π_R = π_S => 0.4*π_R = 0.2*π_S => π_S = 2*π_R.\nSince π_S + π_R = 1: 2*π_R + π_R = 1 => π_R = 1/3 (33.3%), π_S = 2/3 (66.7%)."
            }
        ],
        "expectedResult": "On Day 2, probability of Sunny is 72% and Rainy is 28%. In the long-term equilibrium, 66.7% of days will be Sunny and 33.3% will be Rainy, regardless of today's initial weather.",
        "practicalApplication": "Google PageRank random surfer model, Hidden Markov Models (HMM) for speech recognition, and customer churn Markov transitions.",
        "keyInsight": "The Markov Property states that the future state depends strictly on the current state, not on the sequence of prior events (memoryless property)."
    },
    "math-m3-t1": {
        "title": "Derivatives, Stationary Points & Critical Point Analysis in Machine Learning",
        "scenario": "An AI model loss function is given by the single-variable quadratic f(w) = 3w^2 - 12w + 7. Find its critical point using differentiation, verify whether it is a minimum or maximum using the second derivative test, and evaluate the minimum loss value.",
        "formula": "First Derivative f'(w) = 0 for critical point | Second Derivative f''(w) > 0 for Local Minimum",
        "steps": [
            {
                "stage": "Step 1: Compute First Derivative (Gradient)",
                "details": "Apply power rule: d/dw(3w^2) = 6w; d/dw(-12w) = -12; d/dw(7) = 0.\nf'(w) = 6w - 12."
            },
            {
                "stage": "Step 2: Solve for Stationary Point",
                "details": "Set f'(w) = 0:\n6w - 12 = 0 => 6w = 12 => w* = 2.0."
            },
            {
                "stage": "Step 3: Second Derivative Test",
                "details": "f''(w) = d/dw(6w - 12) = +6.\nSince f''(w) = +6 > 0 for all w, the function is strictly convex, confirming that w* = 2.0 is a global minimum."
            },
            {
                "stage": "Step 4: Compute Minimum Loss Value",
                "details": "f(2) = 3(2)^2 - 12(2) + 7 = 3(4) - 24 + 7 = 12 - 24 + 7 = -5."
            }
        ],
        "expectedResult": "The loss function reaches its optimal minimum of f(w) = -5 at parameter weight w = 2.0. The positive second derivative (+6) guarantees positive curvature.",
        "practicalApplication": "Analytical solutions in Ridge regression, finding optimal thresholds, and loss function convexity checking.",
        "keyInsight": "The derivative measures instantaneous rate of change; setting the derivative to zero locates flat stationary points where the gradient slope vanishes."
    },
    "math-m3-t2": {
        "title": "Partial Derivatives, Chain Rule & Gradient Vector ∇f in 2D",
        "scenario": "Consider the two-variable function f(x, y) = x^2 * y + 3*y^3. Compute the partial derivatives ∂f/∂x and ∂f/∂y, evaluate the gradient vector ∇f at point (2, 1), and find the directional derivative in the direction of unit vector u = [3/5, 4/5].",
        "formula": "Gradient ∇f(x, y) = [∂f/∂x, ∂f/∂y]^T | Directional Derivative D_u(f) = ∇f · u",
        "steps": [
            {
                "stage": "Step 1: Compute Partial Derivative with respect to x",
                "details": "Treat y as a constant: ∂/∂x(x^2 * y) = 2x*y; ∂/∂x(3y^3) = 0.\n∂f/∂x = 2xy."
            },
            {
                "stage": "Step 2: Compute Partial Derivative with respect to y",
                "details": "Treat x as a constant: ∂/∂y(x^2 * y) = x^2; ∂/∂y(3y^3) = 9y^2.\n∂f/∂y = x^2 + 9y^2."
            },
            {
                "stage": "Step 3: Evaluate Gradient Vector at Point (2, 1)",
                "details": "∂f/∂x |_(2, 1) = 2(2)(1) = 4.\n∂f/∂y |_(2, 1) = (2)^2 + 9(1)^2 = 4 + 9 = 13.\nGradient ∇f(2, 1) = [4, 13]^T."
            },
            {
                "stage": "Step 4: Directional Derivative along u = [0.6, 0.8]",
                "details": "D_u(f) = ∇f · u = (4 × 0.6) + (13 × 0.8) = 2.4 + 10.4 = 12.8."
            }
        ],
        "expectedResult": "The gradient vector at (2, 1) is [4, 13]^T with magnitude ||∇f|| = sqrt(4^2 + 13^2) = sqrt(185) ≈ 13.60. The function increases fastest in the direction of [4, 13]^T.",
        "practicalApplication": "Backpropagation chain rule in multi-layer perceptrons, computing Jacobian matrices, and gradient ascent in reinforcement learning.",
        "keyInsight": "The gradient vector always points in the direction of steepest ascent; taking the negative gradient (-∇f) moves in the direction of steepest descent."
    },
    "math-m3-t3": {
        "title": "Worked Numerical: 1D Gradient Descent on J(w) = w^2 - 4w + 5",
        "scenario": "Perform 3 iterations of Gradient Descent to minimize loss function J(w) = w^2 - 4w + 5 starting from initial weight w_0 = 0 with learning rate alpha = 0.1. Track the trajectory toward the analytical minimum w* = 2.",
        "formula": "Gradient: dJ/dw = 2w - 4 | Update Rule: w_(t+1) = w_t - alpha * (dJ/dw)",
        "steps": [
            {
                "stage": "Iteration 0 (Initialization)",
                "details": "Initial weight w_0 = 0. Loss J(0) = 0^2 - 4(0) + 5 = 5.0. Gradient dJ/dw |_(w=0) = 2(0) - 4 = -4.0."
            },
            {
                "stage": "Iteration 1",
                "details": "w_1 = w_0 - alpha * (dJ/dw) = 0 - 0.1(-4.0) = 0 + 0.4 = 0.40.\nNew Loss J(0.4) = (0.4)^2 - 4(0.4) + 5 = 0.16 - 1.6 + 5 = 3.56.\nNew Gradient dJ/dw |_(w=0.4) = 2(0.4) - 4 = 0.8 - 4 = -3.20."
            },
            {
                "stage": "Iteration 2",
                "details": "w_2 = w_1 - alpha * (dJ/dw) = 0.4 - 0.1(-3.20) = 0.4 + 0.32 = 0.72.\nNew Loss J(0.72) = (0.72)^2 - 4(0.72) + 5 = 0.5184 - 2.88 + 5 = 2.638.\nNew Gradient dJ/dw |_(w=0.72) = 2(0.72) - 4 = 1.44 - 4 = -2.56."
            },
            {
                "stage": "Iteration 3",
                "details": "w_3 = w_2 - alpha * (dJ/dw) = 0.72 - 0.1(-2.56) = 0.72 + 0.256 = 0.976.\nNew Loss J(0.976) = (0.976)^2 - 4(0.976) + 5 = 0.9526 - 3.904 + 5 = 2.049."
            }
        ],
        "expectedResult": "Weight updates progressively: 0.0 -> 0.40 -> 0.72 -> 0.976 -> ... -> 2.00. The loss steadily decreases from 5.00 to 2.05 toward global minimum J(2) = 1.0.",
        "practicalApplication": "Training linear regression, neural network backpropagation, and logistic regression parameter updates.",
        "keyInsight": "Notice how step size naturally shrinks as w approaches the minimum: 0.40 -> 0.32 -> 0.256. As the slope flattens, the gradient shrinks, preventing overshoot without manual learning rate decay."
    },
    "math-m3-t4": {
        "title": "Adam Optimizer: First & Second Moment Updates with Bias Correction",
        "scenario": "Execute one update step of the Adam (Adaptive Moment Estimation) optimizer for a weight parameter w with initial learning rate alpha = 0.01, beta1 = 0.9, beta2 = 0.999, epsilon = 10^-8, current gradient g_1 = 4.0, and initial moments m_0 = 0, v_0 = 0.",
        "formula": "m_t = beta1*m_(t-1) + (1-beta1)*g_t | v_t = beta2*v_(t-1) + (1-beta2)*g_t^2 | w_(t+1) = w_t - alpha * m_hat / (sqrt(v_hat) + eps)",
        "steps": [
            {
                "stage": "Step 1: Compute First Moment (Momentum)",
                "details": "m_1 = beta1 * m_0 + (1 - beta1) * g_1 = 0.9(0) + (1 - 0.9)(4.0) = 0.40."
            },
            {
                "stage": "Step 2: Compute Second Moment (RMSProp)",
                "details": "v_1 = beta2 * v_0 + (1 - beta2) * (g_1)^2 = 0.999(0) + (1 - 0.999)*(16.0) = 0.001 × 16.0 = 0.016."
            },
            {
                "stage": "Step 3: Bias Corrections (Time Step t = 1)",
                "details": "m_hat_1 = m_1 / (1 - beta1^1) = 0.40 / (1 - 0.9) = 0.40 / 0.1 = 4.0.\nv_hat_1 = v_1 / (1 - beta2^1) = 0.016 / (1 - 0.999) = 0.016 / 0.001 = 16.0."
            },
            {
                "stage": "Step 4: Compute Parameter Update Step",
                "details": "Delta_w = alpha * m_hat_1 / (sqrt(v_hat_1) + epsilon) = 0.01 × [4.0 / (sqrt(16.0) + 10^-8)] = 0.01 × (4.0 / 4.0) = 0.010.\nw_1 = w_0 - 0.010."
            }
        ],
        "expectedResult": "Because bias correction compensates for the initial zero values of m and v, the effective step size is exactly alpha = 0.01 on the first step, preventing cold-start sluggishness.",
        "practicalApplication": "Default optimizer for deep neural networks, transformer models (GPT/BERT), and computer vision CNNs.",
        "keyInsight": "Adam combines the benefits of Momentum (smoothing directional oscillation via m_t) and RMSProp (adapting learning rates for individual parameters based on historical gradient magnitudes via v_t)."
    },
    "math-m4-t1": {
        "title": "Mathematical Curve Fitting: Degree-2 Polynomial Approximation",
        "scenario": "Fit a quadratic polynomial y = a*x^2 + b*x + c to three observed engineering points (0, 1), (1, 3), and (2, 7) by formulating and solving a system of linear equations.",
        "steps": [
            {
                "stage": "Step 1: Set Up Equations from Data Points",
                "details": "Point (0, 1): a(0)^2 + b(0) + c = 1 => c = 1.\nPoint (1, 3): a(1)^2 + b(1) + 1 = 3 => a + b = 2.\nPoint (2, 7): a(2)^2 + b(2) + 1 = 7 => 4a + 2b = 6."
            },
            {
                "stage": "Step 2: Solve the 2x2 System for a and b",
                "details": "From equation 1: b = 2 - a.\nSubstitute into equation 2: 4a + 2(2 - a) = 6 => 4a + 4 - 2a = 6 => 2a = 2 => a = 1.0.\nb = 2 - 1 = 1.0."
            },
            {
                "stage": "Step 3: State Fitted Function",
                "details": "Quadratic Model: y = 1*x^2 + 1*x + 1 (i.e., y = x^2 + x + 1)."
            },
            {
                "stage": "Step 4: Model Interpolation & Extrapolation",
                "details": "Verify at x = 1: 1^2 + 1 + 1 = 3 (Exact match).\nPredict at x = 3: 3^2 + 3 + 1 = 9 + 3 + 1 = 13."
            }
        ],
        "expectedResult": "The unique quadratic curve y = x^2 + x + 1 passes exactly through all three coordinate points with zero residual error (R^2 = 1.0).",
        "practicalApplication": "Trajectory planning in robotics, sensor calibration interpolation, and stock price trend curve smoothing.",
        "keyInsight": "A polynomial of degree (N - 1) can uniquely and exactly interpolate any N distinct points; however, high-degree polynomials suffer from Runge's phenomenon (wild oscillations between data points)."
    },
    "math-m4-t2": {
        "title": "Ordinary Least Squares (OLS) Normal Equation Walkthrough",
        "scenario": "Fit a best-fit line y = w1*x + w0 through three data points (1, 2), (2, 3), and (3, 5) using the analytical Normal Equation w = (X^T * X)^(-1) * X^T * y.",
        "formula": "w = (X^T * X)^(-1) * X^T * y",
        "steps": [
            {
                "stage": "Step 1: Construct Design Matrix X and Target Vector y",
                "details": "Include intercept column of 1s:\nX = [[1, 1], [1, 2], [1, 3]]. y = [2, 3, 5]^T."
            },
            {
                "stage": "Step 2: Compute X^T * X",
                "details": "X^T = [[1, 1, 1], [1, 2, 3]].\nX^T * X = [[(1+1+1), (1+2+3)], [(1+2+3), (1^2+2^2+3^2)]] = [[3, 6], [6, 14]]."
            },
            {
                "stage": "Step 3: Compute (X^T * X)^(-1)",
                "details": "det = (3 × 14) - (6 × 6) = 42 - 36 = 6.\n(X^T * X)^(-1) = (1/6) * [[14, -6], [-6, 3]] = [[14/6, -1], [-1, 0.5]]."
            },
            {
                "stage": "Step 4: Compute X^T * y and Final Weights w",
                "details": "X^T * y = [1(2)+1(3)+1(5), 1(2)+2(3)+3(5)] = [10, 23]^T.\nw = (1/6) * [[14, -6], [-6, 3]] * [10, 23]^T = (1/6) * [14(10) - 6(23), -6(10) + 3(23)] = (1/6) * [140 - 138, -60 + 69] = (1/6) * [2, 9]^T = [2/6, 9/6]^T = [0.333, 1.500]^T."
            }
        ],
        "expectedResult": "Best-fit line equation is y = 1.50*x + 0.33. Intercept w0 = 0.33, slope w1 = 1.50. Predicts y(1)=1.83, y(2)=3.33, y(3)=4.83, minimizing the sum of squared vertical residuals.",
        "practicalApplication": "Linear regression fitting in Scikit-Learn (LinearRegression), econometrics, and sensor drift compensation.",
        "keyInsight": "The Normal Equation finds the exact closed-form global minimum in a single matrix operation without iterative gradient descent; however, inverting (X^T * X) scales with O(d^3) computation."
    },
    "math-m4-t3": {
        "title": "Bias-Variance Decomposition & Model Complexity Trade-Off",
        "scenario": "A dataset generated from true function f(x) = sin(pi * x) + noise is evaluated across three model classes: Model 1 (Constant line y = c), Model 2 (Cubic spline), Model 3 (Degree-15 polynomial). Analyze their error components.",
        "formula": "Expected Test MSE = (Bias)^2 + Variance + Irreducible Error (sigma^2)",
        "steps": [
            {
                "stage": "Model 1: High Bias / Underfitting (Constant Model)",
                "details": "The model is too simplistic to capture curvature. Across different training sample draws, the predicted line barely shifts (Low Variance ≈ 0.02), but the systematic error from the true sine wave is massive (High Bias^2 = 0.50). Total Error = 0.52."
            },
            {
                "stage": "Model 3: High Variance / Overfitting (Degree-15 Polynomial)",
                "details": "The model has 16 free parameters. It achieves 0 training error by interpolating noise. However, on different training sample draws, predictions swing wildly (High Variance = 0.65) despite low structural bias (Bias^2 = 0.01). Total Error = 0.66."
            },
            {
                "stage": "Model 2: Optimal Trade-Off (Cubic Spline / L2 Regularization)",
                "details": "Balances model flexibility: Bias^2 = 0.06, Variance = 0.07. Total Error = 0.13 + sigma^2 (Minimum test error achievable)."
            },
            {
                "stage": "Mitigation Strategy",
                "details": "High Bias -> Increase model capacity, add polynomial features, reduce regularization. High Variance -> Collect more training data, apply L1/L2 regularization (Ridge/Lasso), prune tree depth."
            }
        ],
        "expectedResult": "Optimal generalization occurs at the sweet spot where the sum of squared bias and model variance is minimized on unobserved validation data.",
        "practicalApplication": "Hyperparameter tuning (max_depth in XGBoost), choosing regularization parameter lambda in Ridge regression, and early stopping in neural networks.",
        "keyInsight": "You cannot simultaneously eliminate both bias and variance; modern machine learning seeks architectures with high capacity (low bias) constrained by regularization (controlled variance)."
    },
    "math-m4-t4": {
        "title": "Shannon Entropy, Cross-Entropy & KL Divergence Calculation",
        "scenario": "A language model classifies an image into two classes: Cat (C) and Dog (D). The ground-truth true label distribution is p = [1.0, 0.0]. The model outputs predicted probabilities q = [0.80, 0.20]. Compute the Shannon Entropy H(p), Binary Cross-Entropy H(p, q), and Kullback-Leibler (KL) Divergence D_KL(p || q).",
        "formula": "H(p) = -Sum p(x)*log2(p(x)) | Cross-Entropy H(p, q) = -Sum p(x)*log2(q(x)) | D_KL(p || q) = H(p, q) - H(p)",
        "steps": [
            {
                "stage": "Step 1: Compute Ground-Truth Entropy H(p)",
                "details": "p = [1.0, 0.0]. H(p) = -[1.0 * log2(1.0) + 0 * log2(0)] = -[1.0(0) + 0] = 0 bits (Complete certainty, zero randomness)."
            },
            {
                "stage": "Step 2: Compute Cross-Entropy H(p, q)",
                "details": "H(p, q) = -[p_Cat * log2(q_Cat) + p_Dog * log2(q_Dog)]\n= -[1.0 * log2(0.80) + 0 * log2(0.20)] = -log2(0.80).\nSince log2(0.80) = ln(0.80) / ln(2) = -0.2231 / 0.6931 ≈ -0.3219 bits.\nH(p, q) = -(-0.3219) = 0.3219 bits (or in natural nats: -ln(0.8) = 0.2231 nats)."
            },
            {
                "stage": "Step 3: Compute KL Divergence D_KL(p || q)",
                "details": "D_KL(p || q) = H(p, q) - H(p) = 0.3219 - 0 = 0.3219 bits.\nAlternatively: p_Cat * log2(p_Cat / q_Cat) = 1.0 * log2(1.0 / 0.8) = log2(1.25) ≈ 0.3219 bits."
            },
            {
                "stage": "Step 4: Comparison with Confident Mistake (q = [0.10, 0.90])",
                "details": "If model wrongly predicts Cat with q_Cat = 0.10: Cross-Entropy = -log2(0.10) = 3.32 bits. The loss penalty increases by 10x!"
            }
        ],
        "expectedResult": "Cross-Entropy loss is 0.322 bits (0.223 nats). Minimizing Cross-Entropy during training directly minimizes the KL divergence between true labels and model predictions.",
        "practicalApplication": "Loss function in neural network classification (nn.CrossEntropyLoss in PyTorch), variational autoencoders (VAE KL loss term), and decision tree information gain.",
        "keyInsight": "Cross-Entropy measures the average number of bits required to identify an event from distribution p using a coding scheme optimized for distribution q; it is always greater than or equal to true entropy H(p)."
    }
}
