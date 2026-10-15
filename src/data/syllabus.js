/**
 * StudySense AI - Semester V Prototype Syllabus
 * 
 * Representative grouping from the official syllabus:
 * - 4 Subjects (24CST501, 24CST502, 24CST503, 24CSR504)
 * - 4 Modules per Subject
 * - 4 Topics per Module
 * Total: 64 prototype topics.
 * 
 * Note: These 64 topics are representative prototype groupings, not the complete university syllabus.
 */

export const SYLLABUS_LABEL = "Semester V Prototype Syllabus";

export const SUBJECTS = [
  {
    id: "cs-cn",
    code: "24CST501",
    name: "Computer Networks",
    semester: "Semester V",
    credits: 4,
    description: "Physical & data link layers, network layer routing, IP addressing, transport protocols, and emerging network paradigms.",
    icon: "Network",
    color: "#6366f1",
    examDate: "2026-10-16",
    daysRemaining: 8,
    syllabusCovered: 0,
    preparationStatus: "Not started"
  },
  {
    id: "cs-se",
    code: "24CST502",
    name: "Software Engineering",
    semester: "Semester V",
    credits: 3,
    description: "Software crisis, SDLC models, Agile/Scrum, requirements engineering, SRS, testing, Git, and project scheduling.",
    icon: "Code2",
    color: "#10b981",
    examDate: "2026-10-21",
    daysRemaining: 13,
    syllabusCovered: 0,
    preparationStatus: "Not started"
  },
  {
    id: "cs-math",
    code: "24CST503",
    name: "Advanced Mathematics for Data Science",
    semester: "Semester V",
    credits: 4,
    description: "Linear algebra, matrix factorizations, probability, Bayes' theorem, multivariate calculus, optimization, and information theory.",
    icon: "Binary",
    color: "#8b5cf6",
    examDate: "2026-10-26",
    daysRemaining: 18,
    syllabusCovered: 0,
    preparationStatus: "Not started"
  },
  {
    id: "cs-ml",
    code: "24CSR504",
    name: "Machine Learning",
    semester: "Semester V",
    credits: 4,
    description: "Machine learning workflows, regression, classification, clustering, dimensionality reduction, and neural network foundations.",
    icon: "Cpu",
    color: "#f59e0b",
    examDate: "2026-11-02",
    daysRemaining: 25,
    syllabusCovered: 0,
    preparationStatus: "Not started"
  }
];

export const MODULES = [
  // ================= 1. Computer Networks (24CST501) =================
  {
    id: "cn-m1",
    subjectId: "cs-cn",
    order: 1,
    title: "Module I: Introduction to Physical and Data Link Layers",
    description: "OSI & TCP/IP architectures, transmission topologies, media metrics, framing, and flow control."
  },
  {
    id: "cn-m2",
    subjectId: "cs-cn",
    order: 2,
    title: "Module II: Network Layer",
    description: "Design issues, routing algorithms, IPv4/IPv6 architectures, subnetting, and supernetting."
  },
  {
    id: "cn-m3",
    subjectId: "cs-cn",
    order: 3,
    title: "Module III: Transport and Application Layers",
    description: "Transport primitives, TCP vs UDP, congestion control mechanisms, and application protocols."
  },
  {
    id: "cn-m4",
    subjectId: "cs-cn",
    order: 4,
    title: "Module IV: Emerging Networking Technologies",
    description: "Li-Fi, Software-Defined Networking (SDN), Internet of Things (IoT), and security firewalls."
  },

  // ================= 2. Software Engineering (24CST502) =================
  {
    id: "se-m1",
    subjectId: "cs-se",
    order: 1,
    title: "Module I: Introduction to Software Engineering",
    description: "Software engineering concepts, software crisis, SDLC paradigms, Agile manifesto, Scrum, and DevOps."
  },
  {
    id: "se-m2",
    subjectId: "cs-se",
    order: 2,
    title: "Module II: Requirements Engineering and Design",
    description: "Requirements process, functional & non-functional requirements, IEEE SRS standard, and UML modeling."
  },
  {
    id: "se-m3",
    subjectId: "cs-se",
    order: 3,
    title: "Module III: Implementation, Testing and Configuration Management",
    description: "Coding standards, testing strategies, black-box vs white-box verification, Git, and configuration control."
  },
  {
    id: "se-m4",
    subjectId: "cs-se",
    order: 4,
    title: "Module IV: Software Project Management, Software Quality and Process Improvement",
    description: "Project scheduling, Gantt & CPM, COCOMO estimation, risk management, CMMI, and ISO 9001."
  },

  // ================= 3. Advanced Mathematics for Data Science (24CST503) =================
  {
    id: "math-m1",
    subjectId: "cs-math",
    order: 1,
    title: "Module I: Linear Algebra for Data Representation",
    description: "Vectors, matrices, rank, vector spaces, linear independence, eigenvalues, eigenvectors, PCA, and SVD."
  },
  {
    id: "math-m2",
    subjectId: "cs-math",
    order: 2,
    title: "Module II: Probability, Statistics and Random Processes",
    description: "Probability axioms, Bayes' theorem, distributions, moments, hypothesis testing, and Markov chains."
  },
  {
    id: "math-m3",
    subjectId: "cs-math",
    order: 3,
    title: "Module III: Calculus and Optimization for Learning Algorithms",
    description: "Derivatives, gradients, gradient descent, Newton's method, SGD, Adam, and constrained optimization."
  },
  {
    id: "math-m4",
    subjectId: "cs-math",
    order: 4,
    title: "Module IV: Advanced Mathematical Modeling and Machine Learning Foundations",
    description: "Curve fitting, least squares, bias-variance tradeoff, entropy, cross-entropy, and KL divergence."
  },

  // ================= 4. Machine Learning (24CSR504) =================
  {
    id: "ml-m1",
    subjectId: "cs-ml",
    order: 1,
    title: "Module I: Introduction to Machine Learning",
    description: "Learning paradigms, pipeline workflows, feature preprocessing, and cross-validation evaluation metrics."
  },
  {
    id: "ml-m2",
    subjectId: "cs-ml",
    order: 2,
    title: "Module II: Regression and Classification",
    description: "Linear & multiple regression, logistic decision boundary, cost functions, k-NN, decision trees, and Naïve Bayes."
  },
  {
    id: "ml-m3",
    subjectId: "cs-ml",
    order: 3,
    title: "Module III: Unsupervised Learning and Dimensionality Reduction",
    description: "Supervised vs unsupervised paradigms, k-Means, hierarchical clustering, DBSCAN, PCA, LDA, and t-SNE."
  },
  {
    id: "ml-m4",
    subjectId: "cs-ml",
    order: 4,
    title: "Module IV: Introduction to Neural Networks",
    description: "Biological vs artificial neurons, activation functions, McCulloch-Pitts model, Perceptrons, and Backpropagation."
  }
];

export const TOPICS = [
  // =========================================================================
  // 1. COMPUTER NETWORKS (24CST501) - 16 Topics
  // =========================================================================

  // Module I
  {
    id: "cn-m1-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    title: "OSI and TCP/IP Reference Models",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started",
    explanation: "The OSI model is a 7-layer theoretical architectural framework (Physical, Data Link, Network, Transport, Session, Presentation, Application) defining network communication standards. The TCP/IP model is a 4-layer pragmatic suite (Network Access, Internet, Transport, Application) that actually powers the modern global Internet.",
    whyItMatters: "Layering enables modular network design, allowing hardware and protocol upgrades (e.g., swapping Wi-Fi for Ethernet) without breaking upper application software.",
    stepByStepExample: "Step 1: Application layer creates payload (HTTP GET).\\nStep 2: Transport adds TCP header with port numbers.\\nStep 3: Network adds IP header with logical addresses.\\nStep 4: Data link encapsulates with MAC framing and sends physical bits.",
    keyPoints: [
      "OSI has 7 conceptual layers; TCP/IP has 4 functional layers",
      "Encapsulation appends protocol headers going down the stack",
      "De-encapsulation strips headers as data ascends the receiving stack"
    ],
    examFocus: "Frequently asked for 5 marks: 'Compare the OSI and TCP/IP models highlighting layer mapping, connectionless vs connection-oriented services'."
  },
  {
    id: "cn-m1-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    title: "Transmission Modes and Physical Topologies",
    difficulty: "easy",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "cn-m1-t3",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    title: "Transmission Media and Performance Metrics",
    difficulty: "easy",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "cn-m1-t4",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    title: "Framing, Error Detection and Flow Control",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },

  // Module II
  {
    id: "cn-m2-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    title: "Network Layer Functions and Design Issues",
    difficulty: "easy",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "cn-m2-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    title: "Routing Algorithms",
    difficulty: "hard",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started",
    explanation: "Routing algorithms determine the optimal mathematical path for packets traveling from source to destination across multiple router hops. Distance Vector (Bellman-Ford) shares metric tables with adjacent neighbors, while Link State (Dijkstra's shortest path) floods link state packets so every node builds a complete topology graph.",
    whyItMatters: "Routing algorithms keep global packet delivery fast, avoid infinite routing loops, and dynamically navigate around broken physical links.",
    stepByStepExample: "Step 1: In Link State, routers discover neighbors and measure link costs.\\nStep 2: Flood Link State Packets (LSP) across network.\\nStep 3: Run Dijkstra's algorithm to compute shortest path tree rooted at self.",
    keyPoints: [
      "Distance Vector: Bellman-Ford, slow convergence, count-to-infinity problem",
      "Link State: Dijkstra's algorithm, fast convergence, complete topology database",
      "Mitigations: Split horizon and poison reverse prevent 2-node routing loops"
    ],
    examFocus: "High priority 10-mark university question: 'Differentiate between Distance Vector and Link State routing. Explain the Count-to-Infinity problem and solutions'."
  },
  {
    id: "cn-m2-t3",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    title: "IPv4/IPv6 Addressing",
    difficulty: "medium",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "cn-m2-t4",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    title: "Subnetting and Supernetting",
    difficulty: "hard",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started",
    explanation: "Subnetting divides a single large network into smaller sub-networks by borrowing host bits for the network ID, reducing broadcast domains. Supernetting (CIDR aggregation) combines multiple contiguous Class C networks into a single larger route entry to compress global router forwarding tables.",
    whyItMatters: "Prevents exhaustion of IPv4 address spaces and reduces the memory footprint of core Internet routing tables.",
    stepByStepExample: "Given 192.168.1.0/24: Borrow 2 bits -> mask /26 (255.255.255.192). Yields 4 subnets with 64 addresses each (62 usable host addresses per subnet).",
    keyPoints: [
      "Usable hosts per subnet = 2^h - 2 (network address and broadcast address excluded)",
      "Subnet mask has contiguous binary 1s followed by 0s",
      "CIDR allows arbitrary slash prefixes (/24, /26, /27)"
    ],
    examFocus: "Standard 7-mark numerical: 'Given network 200.10.20.0/24, create 4 subnets and state the subnet mask, network address, and usable IP range for each'."
  },

  // Module III
  {
    id: "cn-m3-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m3",
    title: "Transport Layer Services and Primitives",
    difficulty: "medium",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "cn-m3-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m3",
    title: "TCP and UDP",
    difficulty: "easy",
    estimatedMinutes: 20,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "cn-m3-t3",
    subjectId: "cs-cn",
    moduleId: "cn-m3",
    title: "Congestion Control",
    difficulty: "hard",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "cn-m3-t4",
    subjectId: "cs-cn",
    moduleId: "cn-m3",
    title: "QoS Parameters and Application Layer Protocols",
    difficulty: "medium",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },

  // Module IV
  {
    id: "cn-m4-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m4",
    title: "Li-Fi and Programmable MAC",
    difficulty: "medium",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "cn-m4-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m4",
    title: "Software-Defined Networking (SDN)",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "cn-m4-t3",
    subjectId: "cs-cn",
    moduleId: "cn-m4",
    title: "Internet of Things (IoT) and IoT Protocols",
    difficulty: "easy",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "cn-m4-t4",
    subjectId: "cs-cn",
    moduleId: "cn-m4",
    title: "Network Security — Encryption, Authentication and Firewalls",
    difficulty: "hard",
    estimatedMinutes: 60,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },

  // =========================================================================
  // 2. SOFTWARE ENGINEERING (24CST502) - 16 Topics
  // =========================================================================

  // Module I
  {
    id: "se-m1-t1",
    subjectId: "cs-se",
    moduleId: "se-m1",
    title: "Software Engineering Concepts and Software Crisis",
    difficulty: "easy",
    estimatedMinutes: 20,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "se-m1-t2",
    subjectId: "cs-se",
    moduleId: "se-m1",
    title: "SDLC Models",
    difficulty: "medium",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started",
    explanation: "Software Development Life Cycle (SDLC) models define the structured phases of building software: Requirements, Design, Implementation, Testing, Deployment, and Maintenance. Traditional models include Waterfall (linear, sequential), V-Model (verification-validation), and Spiral (risk-driven iterative).",
    whyItMatters: "Selecting the right lifecycle model ensures projects finish within budget, manage requirement volatility, and minimize development risks.",
    stepByStepExample: "Step 1: Feasibility analysis -> Step 2: Requirements engineering -> Step 3: Architectural design -> Step 4: Coding & testing -> Step 5: Operations & maintenance.",
    keyPoints: [
      "Waterfall is ideal when requirements are locked and well-understood",
      "Spiral model explicitly integrates risk analysis into every cycle",
      "V-model pairs each development phase with a corresponding testing phase"
    ],
    examFocus: "5-mark question: 'Compare Waterfall model with Spiral model highlighting risk management and suitability'."
  },
  {
    id: "se-m1-t3",
    subjectId: "cs-se",
    moduleId: "se-m1",
    title: "Agile and Agile Manifesto",
    difficulty: "easy",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started",
    explanation: "The Agile methodology emphasizes iterative delivery, customer collaboration, and rapid responsiveness to change. The Agile Manifesto states 4 core values: Individuals and interactions over processes and tools, working software over comprehensive documentation, customer collaboration over contract negotiation, and responding to change over following a plan.",
    whyItMatters: "Agile prevents building the wrong product by validating small working increments with real customers every 1 to 4 weeks.",
    stepByStepExample: "Instead of spending 6 months writing specifications, an Agile team builds an MVP user story in Sprint 1, gathers client feedback, and adapts Sprint 2 backlog accordingly.",
    keyPoints: [
      "4 core values and 12 supporting principles",
      "Prioritizes working software and frequent delivery",
      "Embraces changing requirements even late in development"
    ],
    examFocus: "3 or 5-mark question: 'State the four core values of the Agile Manifesto and contrast with traditional plan-driven development'."
  },
  {
    id: "se-m1-t4",
    subjectId: "cs-se",
    moduleId: "se-m1",
    title: "Scrum and DevOps",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },

  // Module II
  {
    id: "se-m2-t1",
    subjectId: "cs-se",
    moduleId: "se-m2",
    title: "Requirements Engineering Process",
    difficulty: "medium",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "se-m2-t2",
    subjectId: "cs-se",
    moduleId: "se-m2",
    title: "Functional and Non-Functional Requirements",
    difficulty: "easy",
    estimatedMinutes: 20,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "se-m2-t3",
    subjectId: "cs-se",
    moduleId: "se-m2",
    title: "Software Requirement Specification (SRS)",
    difficulty: "medium",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "se-m2-t4",
    subjectId: "cs-se",
    moduleId: "se-m2",
    title: "UML Diagrams and Software Design Concepts",
    difficulty: "hard",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started",
    explanation: "Unified Modeling Language (UML) provides standard structural and behavioral diagrams for object-oriented systems. Structural diagrams include Class and Object diagrams; behavioral diagrams include Use Case, Sequence, and State Machine diagrams.",
    whyItMatters: "Provides an unambiguous visual architecture blueprints that engineers use to implement maintainable, loosely coupled software systems.",
    stepByStepExample: "Step 1: Identify actors and use cases (Use Case diagram).\\nStep 2: Define entity classes, attributes, methods, and relationships (Class diagram).\\nStep 3: Trace runtime message invocation sequence over time (Sequence diagram).",
    keyPoints: [
      "Class diagrams depict associations, aggregations, and inheritances",
      "Use cases use <<include>> for mandatory steps and <<extend>> for optional extensions",
      "Sequence diagrams visualize lifeline activations chronologically"
    ],
    examFocus: "7 or 10-mark question: 'Draw a complete Class and Sequence Diagram for an ATM Cash Withdrawal or Library Management System'."
  },

  // Module III
  {
    id: "se-m3-t1",
    subjectId: "cs-se",
    moduleId: "se-m3",
    title: "Coding Standards, Documentation and Code Review",
    difficulty: "easy",
    estimatedMinutes: 20,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "se-m3-t2",
    subjectId: "cs-se",
    moduleId: "se-m3",
    title: "Software Testing Strategies",
    difficulty: "medium",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "se-m3-t3",
    subjectId: "cs-se",
    moduleId: "se-m3",
    title: "Black-Box and White-Box Testing",
    difficulty: "hard",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "se-m3-t4",
    subjectId: "cs-se",
    moduleId: "se-m3",
    title: "Version Control, Git, GitHub and Configuration Management",
    difficulty: "medium",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },

  // Module IV
  {
    id: "se-m4-t1",
    subjectId: "cs-se",
    moduleId: "se-m4",
    title: "Project Management and Project Scheduling",
    difficulty: "medium",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "se-m4-t2",
    subjectId: "cs-se",
    moduleId: "se-m4",
    title: "Gantt Charts, CPM and COCOMO",
    difficulty: "hard",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "se-m4-t3",
    subjectId: "cs-se",
    moduleId: "se-m4",
    title: "Risk Management and Mitigation",
    difficulty: "medium",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "se-m4-t4",
    subjectId: "cs-se",
    moduleId: "se-m4",
    title: "Software Quality Assurance, CMMI and ISO 9001",
    difficulty: "easy",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },

  // =========================================================================
  // 3. ADVANCED MATHEMATICS FOR DATA SCIENCE (24CST503) - 16 Topics
  // =========================================================================

  // Module I
  {
    id: "math-m1-t1",
    subjectId: "cs-math",
    moduleId: "math-m1",
    title: "Scalars, Vectors, Matrices and Tensors",
    difficulty: "easy",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "math-m1-t2",
    subjectId: "cs-math",
    moduleId: "math-m1",
    title: "Matrix Operations, Rank, Trace and Inverse",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "math-m1-t3",
    subjectId: "cs-math",
    moduleId: "math-m1",
    title: "Vector Spaces, Linear Independence, Basis and Dimension",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "math-m1-t4",
    subjectId: "cs-math",
    moduleId: "math-m1",
    title: "Eigenvalues, Eigenvectors, PCA and SVD",
    difficulty: "hard",
    estimatedMinutes: 60,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started",
    explanation: "For a square matrix A, an eigenvector v and eigenvalue lambda satisfy Av = lambda * v, meaning transformation A merely scales v without changing its direction. Principal Component Analysis (PCA) and Singular Value Decomposition (SVD, A = U Sigma V^T) use these eigenvectors to project high-dimensional data onto axes of maximum variance.",
    whyItMatters: "Forms the mathematical backbone of dimensionality reduction, feature compression, recommendation engines, and facial recognition.",
    stepByStepExample: "Step 1: Compute covariance matrix of zero-centered data X.\\nStep 2: Calculate eigenvalues solving det(C - lambda * I) = 0.\\nStep 3: Sort eigenvectors by descending eigenvalues to pick top principal components.",
    keyPoints: [
      "Eigenvectors point in directions of invariant transformation",
      "SVD generalizes eigendecomposition to non-square m x n matrices",
      "Top eigenvectors of covariance matrix capture maximum data variance"
    ],
    examFocus: "10-mark question: 'Find eigenvalues and eigenvectors of given 2x2 matrix. Explain how SVD is utilized for dimensionality reduction'."
  },

  // Module II
  {
    id: "math-m2-t1",
    subjectId: "cs-math",
    moduleId: "math-m2",
    title: "Probability, Conditional Probability and Bayes' Theorem",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started",
    explanation: "Bayes' Theorem updates the prior probability of a hypothesis H upon observing evidence E: P(H|E) = [P(E|H) * P(H)] / P(E). It relates the posterior probability to the likelihood, prior probability, and marginal evidence probability.",
    whyItMatters: "Foundational formula behind probabilistic machine learning, Naïve Bayes text classifiers, spam filtering, and medical diagnostic inferences.",
    stepByStepExample: "Disease test with 99% sensitivity in a population where 1% have disease. Bayes formula combines true positives and false positives to compute actual probability of having disease given a positive test.",
    keyPoints: [
      "Posterior = (Likelihood * Prior) / Marginal Evidence",
      "Total probability law calculates P(E) = sum(P(E|Hi) * P(Hi))",
      "Independence assumption simplifies joint probabilities"
    ],
    examFocus: "7-mark numerical: 'Apply Bayes theorem to compute posterior probability given conditional disease test rates and prior population distribution'."
  },
  {
    id: "math-m2-t2",
    subjectId: "cs-math",
    moduleId: "math-m2",
    title: "Random Variables and Probability Distributions",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "math-m2-t3",
    subjectId: "cs-math",
    moduleId: "math-m2",
    title: "Expectation, Variance, Covariance and Correlation",
    difficulty: "medium",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "math-m2-t4",
    subjectId: "cs-math",
    moduleId: "math-m2",
    title: "Hypothesis Testing, Estimation and Markov Models",
    difficulty: "hard",
    estimatedMinutes: 60,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },

  // Module III
  {
    id: "math-m3-t1",
    subjectId: "cs-math",
    moduleId: "math-m3",
    title: "Functions, Limits, Continuity and Derivatives",
    difficulty: "easy",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "math-m3-t2",
    subjectId: "cs-math",
    moduleId: "math-m3",
    title: "Partial Derivatives, Chain Rule and Gradients",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "math-m3-t3",
    subjectId: "cs-math",
    moduleId: "math-m3",
    title: "Gradient Descent and Newton's Method",
    difficulty: "hard",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started",
    explanation: "Gradient descent is a first-order iterative optimization algorithm that finds local minima of differentiable cost functions by taking steps in the direction of the negative gradient: theta = theta - alpha * grad(J(theta)). Newton's method is a second-order method using the Hessian matrix (second derivatives) for quadratic convergence.",
    whyItMatters: "Directly optimizes model parameters across nearly all machine learning models, from simple linear regression to multi-billion parameter neural networks.",
    stepByStepExample: "Step 1: Compute gradient of loss with respect to parameters.\\nStep 2: Multiply gradient by learning rate alpha.\\nStep 3: Subtract from current parameters and iterate until convergence.",
    keyPoints: [
      "Learning rate alpha governs step size; too large diverges, too small converges slowly",
      "Gradient vector points in direction of steepest ascent",
      "Newton's method converges faster but calculating Hessian inverse is computationally expensive O(d^3)"
    ],
    examFocus: "5 or 7-mark question: 'Derive the gradient descent update rule for a simple loss function and compare first-order vs second-order Newton optimization'."
  },
  {
    id: "math-m3-t4",
    subjectId: "cs-math",
    moduleId: "math-m3",
    title: "Constrained Optimization, SGD, Adam and RMSProp",
    difficulty: "hard",
    estimatedMinutes: 60,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },

  // Module IV
  {
    id: "math-m4-t1",
    subjectId: "cs-math",
    moduleId: "math-m4",
    title: "Mathematical Modeling, Function Approximation and Curve Fitting",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "math-m4-t2",
    subjectId: "cs-math",
    moduleId: "math-m4",
    title: "Least Squares Methods and Model Complexity",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "math-m4-t3",
    subjectId: "cs-math",
    moduleId: "math-m4",
    title: "Bias-Variance Tradeoff and Overfitting",
    difficulty: "medium",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "math-m4-t4",
    subjectId: "cs-math",
    moduleId: "math-m4",
    title: "Entropy, Cross-Entropy, KL Divergence and Mutual Information",
    difficulty: "hard",
    estimatedMinutes: 60,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },

  // =========================================================================
  // 4. MACHINE LEARNING (24CSR504) - 16 Topics
  // =========================================================================

  // Module I
  {
    id: "ml-m1-t1",
    subjectId: "cs-ml",
    moduleId: "ml-m1",
    title: "AI, Machine Learning and Learning Paradigms",
    difficulty: "easy",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started",
    explanation: "Machine learning allows algorithms to learn patterns from historical data without explicit rule programming. The primary paradigms are Supervised Learning (labeled target data), Unsupervised Learning (discovering hidden patterns without labels), Semi-supervised, and Reinforcement Learning (reward-penalty agent feedback).",
    whyItMatters: "Underpins modern technology from autonomous driving and conversational AI to predictive medical analytics.",
    stepByStepExample: "Supervised: Predicting house price from square footage (regression) or classifying tumor as benign/malignant. Unsupervised: Customer segment clustering.",
    keyPoints: [
      "Supervised uses labeled pairs (X, y)",
      "Unsupervised analyzes unlabeled data structure X",
      "Reinforcement learning optimizes actions via environment rewards"
    ],
    examFocus: "5-mark question: 'Compare Supervised, Unsupervised, and Reinforcement Learning with suitable application examples'."
  },
  {
    id: "ml-m1-t2",
    subjectId: "cs-ml",
    moduleId: "ml-m1",
    title: "Machine Learning Pipeline and Workflow",
    difficulty: "easy",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "ml-m1-t3",
    subjectId: "cs-ml",
    moduleId: "ml-m1",
    title: "Data Preprocessing",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "ml-m1-t4",
    subjectId: "cs-ml",
    moduleId: "ml-m1",
    title: "Model Evaluation and Validation",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },

  // Module II
  {
    id: "ml-m2-t1",
    subjectId: "cs-ml",
    moduleId: "ml-m2",
    title: "Linear Regression and Multiple Regression",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "ml-m2-t2",
    subjectId: "cs-ml",
    moduleId: "ml-m2",
    title: "Gradient Descent and Cost Function",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "ml-m2-t3",
    subjectId: "cs-ml",
    moduleId: "ml-m2",
    title: "Logistic Regression and Decision Boundary",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started",
    explanation: "Logistic Regression is a supervised classification model that predicts the probability of a binary outcome by passing a linear combination of inputs through the Sigmoid activation function: sigma(z) = 1 / (1 + e^(-z)). The decision boundary separates classes when sigma(z) >= threshold (typically 0.5, where z = 0).",
    whyItMatters: "Provides well-calibrated probabilities for binary classification tasks like spam filtering, credit default risk, and disease diagnosis.",
    stepByStepExample: "Step 1: Compute z = w^T * x + b.\\nStep 2: Calculate probability p = 1 / (1 + exp(-z)).\\nStep 3: Classify as 1 if p >= 0.5, otherwise 0.",
    keyPoints: [
      "Sigmoid function maps real numbers to range (0, 1)",
      "Optimized using binary cross-entropy (log loss), not mean squared error",
      "Decision boundary is linear in feature space unless polynomial features added"
    ],
    examFocus: "7-mark question: 'Why is linear regression unsuitable for classification? Explain the working of Logistic Regression and derive its log loss function'."
  },
  {
    id: "ml-m2-t4",
    subjectId: "cs-ml",
    moduleId: "ml-m2",
    title: "k-NN, Decision Trees and Naïve Bayes",
    difficulty: "hard",
    estimatedMinutes: 60,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },

  // Module III
  {
    id: "ml-m3-t1",
    subjectId: "cs-ml",
    moduleId: "ml-m3",
    title: "Supervised vs Unsupervised Learning",
    difficulty: "easy",
    estimatedMinutes: 20,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "ml-m3-t2",
    subjectId: "cs-ml",
    moduleId: "ml-m3",
    title: "k-Means Clustering",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started",
    explanation: "k-Means is an unsupervised partition-based clustering algorithm that groups n observations into k clusters. It iteratively alternates between: 1) Assignment step (assigning each point to its closest centroid via Euclidean distance), and 2) Update step (recalculating centroids as the arithmetic mean of all assigned points) until convergence.",
    whyItMatters: "Standard algorithm for customer market segmentation, image compression (color quantization), and anomaly detection.",
    stepByStepExample: "Step 1: Randomly initialize k centroids.\\nStep 2: Measure Euclidean distance from each sample to centroids and assign to nearest.\\nStep 3: Recompute each centroid's coordinates as the mean of its cluster members.\\nStep 4: Repeat until centroid movement drops below threshold.",
    keyPoints: [
      "Requires pre-specifying number of clusters k (chosen via Elbow method)",
      "Sensitive to initial centroid locations (k-means++ addresses this)",
      "Assumes spherical, equally-sized clusters with similar variance"
    ],
    examFocus: "7 or 10-mark question: 'Explain the k-Means clustering algorithm step by step. What is the Elbow method for choosing k?'"
  },
  {
    id: "ml-m3-t3",
    subjectId: "cs-ml",
    moduleId: "ml-m3",
    title: "Hierarchical Clustering and DBSCAN",
    difficulty: "hard",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "ml-m3-t4",
    subjectId: "cs-ml",
    moduleId: "ml-m3",
    title: "PCA, LDA and t-SNE",
    difficulty: "hard",
    estimatedMinutes: 60,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },

  // Module IV
  {
    id: "ml-m4-t1",
    subjectId: "cs-ml",
    moduleId: "ml-m4",
    title: "Biological vs Artificial Neurons",
    difficulty: "easy",
    estimatedMinutes: 20,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "ml-m4-t2",
    subjectId: "cs-ml",
    moduleId: "ml-m4",
    title: "Neural Network Connections, Learning and Activation Functions",
    difficulty: "medium",
    estimatedMinutes: 30,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "ml-m4-t3",
    subjectId: "cs-ml",
    moduleId: "ml-m4",
    title: "McCulloch-Pitts Neuron and Hebbian Learning",
    difficulty: "medium",
    estimatedMinutes: 45,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started"
  },
  {
    id: "ml-m4-t4",
    subjectId: "cs-ml",
    moduleId: "ml-m4",
    title: "Perceptron and Backpropagation",
    difficulty: "hard",
    estimatedMinutes: 60,
    completion: 0,
    mastery: null,
    lastStudied: null,
    quizAttempts: 0,
    averageQuizScore: null,
    status: "not_started",
    explanation: "The Single-Layer Perceptron computes a linear combination of inputs with weights and bias, passed through a step activation; it can only learn linearly separable functions (failing on XOR). Multi-Layer Perceptrons (MLPs) overcome this using hidden layers and non-linear activations. Backpropagation computes error gradients using the calculus chain rule backward from output to input layers.",
    whyItMatters: "The core foundational algorithm that enabled the modern deep learning revolution.",
    stepByStepExample: "Forward pass: Calculate activations from input to output layer.\\nCompute loss: Compare predicted output against true label.\\nBackward pass: Apply chain rule to compute partial derivatives dLoss/dWeight for each layer and update weights via gradient descent.",
    keyPoints: [
      "Perceptron learning rule converges only if data is linearly separable",
      "XOR problem proved need for multi-layer non-linear architectures",
      "Backpropagation efficiently computes gradient of loss via dynamic programming / chain rule"
    ],
    examFocus: "10-mark question: 'Explain the working of a Single-Layer Perceptron. State why it cannot solve the XOR problem, and derive the Backpropagation weight update rule'."
  }
];
