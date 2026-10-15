/**
 * StudySense AI - Default Prototype Sample Data & Practice Bank
 * Aligned with Semester V Prototype Syllabus
 */

export const INITIAL_STUDENT_PROFILE = {
  studentId: "student-001",
  name: "Alex Morgan",
  email: "alex.morgan@university.edu",
  semester: "Semester V",
  branch: "Computer Science & Engineering",
  targetDailyHours: 3.5,
  pomodoroFocusMin: 25,
  pomodoroBreakMin: 5,
  availableStart: "19:00",
  availableEnd: "22:30",
  theme: "light",
  soundEnabled: true,
  dailyGoalReminder: true,
  breakAlerts: true
};

export const INITIAL_TODAY_TASKS = [
  {
    id: "task-1",
    time: "7:00 PM",
    topicId: "cn-m2-t2",
    title: "Routing Algorithms",
    subjectName: "Computer Networks",
    subjectId: "cs-cn",
    duration: 45,
    type: "Learn + Practice",
    completed: false,
    priority: "High",
    isBreak: false
  },
  {
    id: "task-2",
    time: "7:45 PM",
    title: "Rest & Hydration Break",
    subjectName: "Break",
    duration: 10,
    type: "Break",
    completed: false,
    isBreak: true
  },
  {
    id: "task-3",
    time: "7:55 PM",
    topicId: "cn-m2-t4",
    title: "Subnetting and Supernetting",
    subjectName: "Computer Networks",
    subjectId: "cs-cn",
    duration: 30,
    type: "Revision",
    completed: false,
    priority: "Medium",
    isBreak: false
  },
  {
    id: "task-4",
    time: "8:25 PM",
    title: "Quick Walk & Stretch Break",
    subjectName: "Break",
    duration: 10,
    type: "Break",
    completed: false,
    isBreak: true
  },
  {
    id: "task-5",
    time: "8:35 PM",
    topicId: "math-m3-t3",
    title: "Gradient Descent and Newton's Method",
    subjectName: "Advanced Mathematics for Data Science",
    subjectId: "cs-math",
    duration: 35,
    type: "Problem Solving",
    completed: false,
    priority: "Medium",
    isBreak: false
  }
];

export const INITIAL_WEEKLY_TASKS = [
  { day: "Monday", completed: 4, total: 5 },
  { day: "Tuesday", completed: 5, total: 5 },
  { day: "Wednesday", completed: 3, total: 4 },
  { day: "Thursday", completed: 4, total: 4 },
  { day: "Friday", completed: 5, total: 5 },
  { day: "Saturday", completed: 2, total: 4 },
  { day: "Sunday (Today)", completed: 2, total: 5 }
];

// Dynamic dates so prototype works consistently on any calendar day
const _todayStr = new Date().toISOString().split("T")[0];
const _pastDate = (daysAgo) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

export const INITIAL_STUDY_SESSIONS = [
  {
    id: "sess-today-1",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    topicId: "cn-m1-t1",
    startTime: "09:00 AM",
    endTime: "09:25 AM",
    durationMinutes: 25,
    plannedDuration: 25,
    completed: true,
    difficulty: "okay",
    confidence: "confident",
    sessionType: "study",
    date: _todayStr
  },
  {
    id: "sess-today-2",
    subjectId: "cs-se",
    moduleId: "se-m1",
    topicId: "se-m1-t3",
    startTime: "10:00 AM",
    endTime: "10:25 AM",
    durationMinutes: 25,
    plannedDuration: 25,
    completed: true,
    difficulty: "easy",
    confidence: "confident",
    sessionType: "study",
    date: _todayStr
  },
  {
    id: "sess-today-3",
    subjectId: "cs-ml",
    moduleId: "ml-m1",
    topicId: "ml-m1-t1",
    startTime: "11:30 AM",
    endTime: "11:55 AM",
    durationMinutes: 25,
    plannedDuration: 25,
    completed: true,
    difficulty: "easy",
    confidence: "confident",
    sessionType: "study",
    date: _todayStr
  },
  {
    id: "sess-past-1",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    topicId: "cn-m2-t2",
    startTime: "04:00 PM",
    endTime: "04:45 PM",
    durationMinutes: 45,
    plannedDuration: 45,
    completed: true,
    difficulty: "difficult",
    confidence: "somewhat_confident",
    sessionType: "focus",
    date: _pastDate(1)
  },
  {
    id: "sess-past-2",
    subjectId: "cs-math",
    moduleId: "math-m3",
    topicId: "math-m3-t3",
    startTime: "07:00 PM",
    endTime: "07:35 PM",
    durationMinutes: 35,
    plannedDuration: 35,
    completed: true,
    difficulty: "okay",
    confidence: "somewhat_confident",
    sessionType: "study",
    date: _pastDate(2)
  },
  {
    id: "sess-past-3",
    subjectId: "cs-se",
    moduleId: "se-m2",
    topicId: "se-m2-t1",
    startTime: "05:15 PM",
    endTime: "05:40 PM",
    durationMinutes: 25,
    plannedDuration: 25,
    completed: true,
    difficulty: "easy",
    confidence: "confident",
    sessionType: "revision",
    date: _pastDate(3)
  },
  {
    id: "sess-past-4",
    subjectId: "cs-ml",
    moduleId: "ml-m2",
    topicId: "ml-m2-t1",
    startTime: "06:30 PM",
    endTime: "07:10 PM",
    durationMinutes: 40,
    plannedDuration: 45,
    completed: true,
    difficulty: "okay",
    confidence: "confident",
    sessionType: "study",
    date: _pastDate(4)
  }
];

export const INITIAL_QUIZ_ATTEMPTS = [
  {
    id: "attempt-1",
    topicId: "cn-m2-t2",
    topicTitle: "Routing Algorithms",
    subjectId: "cs-cn",
    score: 3,
    totalQuestions: 5,
    percentage: 60,
    date: "2026-10-07",
    needsWork: true
  },
  {
    id: "attempt-2",
    topicId: "se-m1-t2",
    topicTitle: "SDLC Models",
    subjectId: "cs-se",
    score: 4,
    totalQuestions: 5,
    percentage: 80,
    date: "2026-10-06",
    needsWork: false
  },
  {
    id: "attempt-3",
    topicId: "math-m2-t1",
    topicTitle: "Bayes' Theorem",
    subjectId: "cs-math",
    score: 2,
    totalQuestions: 4,
    percentage: 50,
    date: "2026-10-05",
    needsWork: true
  }
];

/**
 * Curated practice question database for prototype topics.
 * Supports: Quick Quiz (MCQ), 3 Mark, 5 Mark, 7 Mark, 10 Mark, and Weak Topics.
 */
export const PRACTICE_QUESTIONS = [
  // ================= 1. Computer Networks =================
  // OSI and TCP/IP Reference Models (cn-m1-t1)
  {
    id: "q-cn-osi-1",
    topicId: "cn-m1-t1",
    subjectId: "cs-cn",
    type: "Quick Quiz",
    marks: 1,
    difficulty: "medium",
    question: "In the 7-layer OSI model, which layer is directly responsible for end-to-end communication, error recovery, and flow control across different host processes?",
    options: [
      "Network Layer",
      "Data Link Layer",
      "Transport Layer",
      "Session Layer"
    ],
    correctAnswer: 2,
    explanation: "The Transport Layer provides process-to-process delivery, flow control, and reliable end-to-end data transfer between source and destination applications.",
    recommendation: "Review the distinct responsibilities of Network vs Transport layers."
  },
  {
    id: "q-cn-osi-2",
    topicId: "cn-m1-t1",
    subjectId: "cs-cn",
    type: "Quick Quiz",
    marks: 1,
    difficulty: "easy",
    question: "How many layers are present in the standard TCP/IP architecture?",
    options: ["4 Layers", "5 Layers", "7 Layers", "3 Layers"],
    correctAnswer: 0,
    explanation: "The standard TCP/IP reference model comprises 4 layers: Network Access, Internet, Transport, and Application.",
    recommendation: "Review layer mapping between OSI 7 layers and TCP/IP 4 layers."
  },

  // Routing Algorithms (cn-m2-t2)
  {
    id: "q-cn-rt-1",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    type: "Quick Quiz",
    marks: 1,
    difficulty: "medium",
    question: "Which routing algorithm uses the Bellman-Ford equation and shares distance tables with direct neighbors periodically?",
    options: [
      "Link State Routing",
      "Distance Vector Routing",
      "Path Vector Routing",
      "Flooding"
    ],
    correctAnswer: 1,
    explanation: "Distance Vector Routing uses the Bellman-Ford algorithm where each router sends its routing table to only directly connected neighbors.",
    recommendation: "Review Distance Vector vs Link State principles."
  },
  {
    id: "q-cn-rt-2",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    type: "Quick Quiz",
    marks: 1,
    difficulty: "hard",
    question: "What critical issue arises in standard Distance Vector routing when a link fails and routers exchange stale metric updates?",
    options: [
      "Split Horizon deadlock",
      "Count-to-Infinity problem",
      "Excessive Dijkstra CPU computation",
      "Buffer overflow in receiver queue"
    ],
    correctAnswer: 1,
    explanation: "When a link fails, neighbors increment metrics slowly back and forth until reaching infinity (RIP infinity = 16), known as the Count-to-Infinity problem.",
    recommendation: "Review how Split Horizon and Poison Reverse address count-to-infinity."
  },
  {
    id: "q-cn-rt-3m",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    type: "3 Mark",
    marks: 3,
    difficulty: "medium",
    question: "What is the 'Count-to-Infinity' problem in Distance Vector routing? State two ways it is mitigated.",
    modelAnswer: "The Count-to-Infinity problem occurs when a link breaks, causing neighboring routers to exchange outdated metric updates in loops, incrementing cost until reaching infinity (typically 16 in RIP).\\n\\nMitigations:\\n1. Split Horizon: Do not advertise a route out the interface from which it was learned.\\n2. Poison Reverse: Advertise unreachable routes back with metric set to infinity.\\n3. Hold-down timers.",
    keyRubric: [
      "Definition of loop increments on link failure",
      "Mention of metric reaching infinity",
      "List Split Horizon or Poison Reverse"
    ]
  },

  // Subnetting and Supernetting (cn-m2-t4)
  {
    id: "q-cn-sub-1",
    topicId: "cn-m2-t4",
    subjectId: "cs-cn",
    type: "Quick Quiz",
    marks: 1,
    difficulty: "medium",
    question: "Given the subnet mask 255.255.255.192 (/26), how many usable host addresses are available in each subnet?",
    options: ["64", "62", "30", "126"],
    correctAnswer: 1,
    explanation: "Total addresses per /26 subnet = 2^(32-26) = 2^6 = 64. Usable host addresses = 64 - 2 (subtracting network and broadcast addresses) = 62.",
    recommendation: "Remember the 2^h - 2 formula for usable host addresses."
  },
  {
    id: "q-cn-sub-2",
    topicId: "cn-m2-t4",
    subjectId: "cs-cn",
    type: "Quick Quiz",
    marks: 1,
    difficulty: "hard",
    question: "What is the primary objective of Supernetting (CIDR route aggregation)?",
    options: [
      "To increase broadcast domain size",
      "To combine multiple contiguous network addresses into a single routing table entry",
      "To enforce static encryption keys",
      "To eliminate physical collision domains"
    ],
    correctAnswer: 1,
    explanation: "Supernetting aggregates multiple contiguous classful network prefixes into a single summarized route entry, drastically shrinking core router forwarding tables.",
    recommendation: "Contrast subnetting (dividing) with supernetting (aggregating)."
  },

  // ================= 2. Software Engineering =================
  // SDLC Models (se-m1-t2)
  {
    id: "q-se-sdlc-1",
    topicId: "se-m1-t2",
    subjectId: "cs-se",
    type: "Quick Quiz",
    marks: 1,
    difficulty: "medium",
    question: "Which SDLC model is characterized by an explicit risk-driven approach rotating through four quadrants per loop?",
    options: [
      "Waterfall Model",
      "V-Model",
      "Spiral Model",
      "Big Bang Model"
    ],
    correctAnswer: 2,
    explanation: "Boehm's Spiral Model is risk-driven, combining iterative development with systematic risk assessment in every spiral cycle.",
    recommendation: "Review the 4 quadrants of the Spiral Model."
  },

  // Agile and Agile Manifesto (se-m1-t3)
  {
    id: "q-se-agile-1",
    topicId: "se-m1-t3",
    subjectId: "cs-se",
    type: "Quick Quiz",
    marks: 1,
    difficulty: "easy",
    question: "According to the Agile Manifesto, which of the following is valued more?",
    options: [
      "Processes and tools over individuals",
      "Comprehensive documentation over working software",
      "Responding to change over following a plan",
      "Contract negotiation over customer collaboration"
    ],
    correctAnswer: 2,
    explanation: "The Agile Manifesto values 'Responding to change over following a plan'.",
    recommendation: "Memorize the 4 core values of the Agile Manifesto."
  },

  // UML Diagrams (se-m2-t4)
  {
    id: "q-se-uml-1",
    topicId: "se-m2-t4",
    subjectId: "cs-se",
    type: "Quick Quiz",
    marks: 1,
    difficulty: "hard",
    question: "In a UML Use Case diagram, what is the difference between an <<include>> and an <<extend>> relationship?",
    options: [
      "<<include>> is optional, <<extend>> is mandatory",
      "<<include>> represents mandatory common behavior; <<extend>> adds optional behavior conditional on an extension point",
      "Both represent identical inheritance relationships",
      "<<extend>> is used only in Class diagrams"
    ],
    correctAnswer: 1,
    explanation: "<<include>> behavior is executed unconditionally every time the base use case runs. <<extend>> is conditional and optional.",
    recommendation: "Review UML use case relationship stereotypes."
  },

  // ================= 3. Advanced Mathematics for Data Science =================
  // Eigenvalues and Eigenvectors (math-m1-t4)
  {
    id: "q-math-eig-1",
    topicId: "math-m1-t4",
    subjectId: "cs-math",
    type: "Quick Quiz",
    marks: 1,
    difficulty: "hard",
    question: "For a square matrix A and non-zero vector v, if Av = λv, what does λ represent geometrically?",
    options: [
      "The rotational angle of vector v",
      "The scalar factor by which vector v is stretched or squished",
      "The Euclidean norm of matrix A",
      "The determinant of matrix A"
    ],
    correctAnswer: 1,
    explanation: "An eigenvector v maintains its spatial direction under linear transformation A, and eigenvalue λ is the scalar factor by which its magnitude changes.",
    recommendation: "Review geometric intuition of eigendecomposition and PCA axes."
  },

  // Bayes' Theorem (math-m2-t1)
  {
    id: "q-math-bayes-1",
    topicId: "math-m2-t1",
    subjectId: "cs-math",
    type: "Quick Quiz",
    marks: 1,
    difficulty: "medium",
    question: "In Bayes' formula P(A|B) = [P(B|A) * P(A)] / P(B), what is the term P(B|A) called?",
    options: [
      "Prior probability",
      "Posterior probability",
      "Likelihood",
      "Marginal evidence"
    ],
    correctAnswer: 2,
    explanation: "P(B|A) is the Likelihood: the probability of observing evidence B given that hypothesis A holds true.",
    recommendation: "Remember: Posterior = (Likelihood * Prior) / Evidence."
  },

  // Gradient Descent and Newton's Method (math-m3-t3)
  {
    id: "q-math-gd-1",
    topicId: "math-m3-t3",
    subjectId: "cs-math",
    type: "Quick Quiz",
    marks: 1,
    difficulty: "hard",
    question: "How does Newton's optimization method differ from standard First-Order Gradient Descent?",
    options: [
      "Newton's method uses random sub-sampling",
      "Newton's method incorporates the second-order Hessian matrix for quadratic convergence",
      "Newton's method does not require function differentiability",
      "Gradient descent converges faster in all convex problems"
    ],
    correctAnswer: 1,
    explanation: "Newton's method uses second derivatives (Hessian matrix H) alongside the gradient vector to achieve quadratic convergence, taking optimal curvature into account.",
    recommendation: "Review tradeoffs between first-order (O(d)) and second-order (O(d^3)) optimization."
  },

  // ================= 4. Machine Learning =================
  // Learning Paradigms (ml-m1-t1)
  {
    id: "ml-q-par-1",
    topicId: "ml-m1-t1",
    subjectId: "cs-ml",
    type: "Quick Quiz",
    marks: 1,
    difficulty: "easy",
    question: "Which machine learning paradigm learns an optimal policy through trial-and-error interactions and reward signals from an environment?",
    options: [
      "Supervised Learning",
      "Unsupervised Learning",
      "Reinforcement Learning",
      "Semi-supervised Learning"
    ],
    correctAnswer: 2,
    explanation: "Reinforcement Learning trains an agent to take actions in an environment to maximize cumulative rewards without explicit target labels.",
    recommendation: "Review the three core learning paradigms."
  },

  // Logistic Regression (ml-m2-t3)
  {
    id: "ml-q-log-1",
    topicId: "ml-m2-t3",
    subjectId: "cs-ml",
    type: "Quick Quiz",
    marks: 1,
    difficulty: "medium",
    question: "What activation function is applied to the linear combination z = w^T * x + b in standard binary Logistic Regression?",
    options: [
      "ReLU function",
      "Sigmoid (Logistic) function",
      "Softmax function",
      "Step function"
    ],
    correctAnswer: 1,
    explanation: "The Sigmoid function σ(z) = 1 / (1 + e^(-z)) squashes any real value into the interval (0, 1), representing output probability.",
    recommendation: "Review sigmoid curve properties and cross-entropy loss."
  },

  // k-Means Clustering (ml-m3-t2)
  {
    id: "ml-q-km-1",
    topicId: "ml-m3-t2",
    subjectId: "cs-ml",
    type: "Quick Quiz",
    marks: 1,
    difficulty: "medium",
    question: "In the k-Means clustering algorithm, how are cluster centroids updated in each iteration?",
    options: [
      "By selecting the point with highest gradient",
      "By calculating the arithmetic mean of all data points currently assigned to that cluster",
      "By taking the median absolute deviation of boundary points",
      "By drawing random coordinates from the bounding box"
    ],
    correctAnswer: 1,
    explanation: "Each cluster centroid is updated by computing the mean coordinate across all points assigned to that cluster during the assignment step.",
    recommendation: "Understand the alternate assignment and update steps of k-Means."
  },

  // Perceptron and Backpropagation (ml-m4-t4)
  {
    id: "ml-q-nn-1",
    topicId: "ml-m4-t4",
    subjectId: "cs-ml",
    type: "Quick Quiz",
    marks: 1,
    difficulty: "hard",
    question: "What famous limitation of the Single-Layer Perceptron was highlighted by Minsky and Papert in 1969?",
    options: [
      "It cannot compute the AND boolean function",
      "It cannot compute the non-linearly separable XOR (exclusive OR) function",
      "It requires infinite training samples",
      "It cannot operate on binary inputs"
    ],
    correctAnswer: 1,
    explanation: "A Single-Layer Perceptron can only solve linearly separable problems and provably fails to solve the XOR function, motivating multi-layer networks.",
    recommendation: "Review linear separability and the XOR proof."
  }
];
