# -*- coding: utf-8 -*-
"""
Software Engineering (24CST502) - 16 Topics Examples
"""

SE_EXAMPLES = {
    "se-m1-t1": {
        "title": "Case Study: The Denver Airport Baggage System Failure & The Software Crisis",
        "scenario": "Analyze the classic software engineering failure of the Denver International Airport (DIA) automated baggage system, which delayed airport opening by 16 months and caused over $500 million in cost overruns.",
        "steps": [
            {
                "stage": "Step 1: Symptom Identification",
                "details": "The baggage system involved 4,000 automated electric carts traversing 21 miles of track. Software timing errors caused telemetric sensors to misjudge cart speed, resulting in carts derailing, crushing luggage, and dropping bags into open maintenance pits."
            },
            {
                "stage": "Step 2: Root Cause Analysis (Software Crisis Factors)",
                "details": "Airlines continually modified requirements mid-development without formal change control. Project management underestimated complexity, bypassed incremental integration testing, and scheduled unrealistic delivery deadlines."
            },
            {
                "stage": "Step 3: Engineering Remedy Application",
                "details": "Engineers downscoped the automated system to serve only a single airline (United) and built a traditional manual tug-and-cart backup system to allow the airport to finally open."
            },
            {
                "stage": "Step 4: Institutional Lessons Learned",
                "details": "The disaster established software engineering as a disciplined profession requiring formal requirements baselining, architectural risk assessments, continuous integration testing, and realistic schedule contingency planning."
            }
        ],
        "expectedResult": "Formal engineering processes (IEEE standards, automated regression testing, and modular decoupling) replace ad-hoc craft programming to eliminate catastrophic schedule and budget failures.",
        "practicalApplication": "Post-mortem engineering reviews in avionics, automotive software (Toyota unintended acceleration investigation), and enterprise ERP deployments.",
        "keyInsight": "The software crisis is not a shortage of coders; it is the breakdown that occurs when software complexity exceeds human ad-hoc management capacity without disciplined engineering methods."
    },
    "se-m1-t2": {
        "title": "Real-World Scenario: Choosing an SDLC Model",
        "scenario": "Compare two engineering teams selecting an SDLC strategy: Project A is an automated aircraft flight-control fly-by-wire system; Project B is a mobile social networking photo-sharing startup app.",
        "steps": [
            {
                "stage": "Project A: Flight Control System (V-Model / Waterfall)",
                "details": "Requirements are strictly dictated by aviation safety authorities (FAA/DGCA). Failure risks catastrophic loss of life. Model Chosen: V-Model with formal mathematical verification. Every specification phase directly maps to an independent verification and validation test phase."
            },
            {
                "stage": "Project B: Mobile Social Startup (Agile Scrum)",
                "details": "Market fit is unknown; user preferences change rapidly. Delaying launch by 6 months will cause competitors to capture the market. Model Chosen: Agile Scrum. Release a Minimal Viable Product (MVP) in 4 weeks, iterate in 2-week sprints based on analytics."
            },
            {
                "stage": "Trade-off Evaluation",
                "details": "Waterfall/V-Model minimizes defects at the cost of high rigidity and late delivery. Agile minimizes time-to-market and accommodates fluid requirements at the cost of less formal architectural documentation."
            }
        ],
        "expectedResult": "Project A completes formal DO-178C certification with zero safety defects. Project B pivots its user onboarding experience in Sprint 3 based on early user churn feedback without incurring major rework costs.",
        "practicalApplication": "Enterprise procurement RFPs, medical device software compliance (IEC 62304), and SaaS product management.",
        "keyInsight": "There is no universally 'superior' SDLC model; the optimal choice depends strictly on requirement stability, cost of failure, regulatory constraints, and market dynamics."
    },
    "se-m1-t3": {
        "title": "Agile Sprint Planning & Velocity Estimation Walkthrough",
        "scenario": "An Agile team of 5 developers prepares for Sprint 14 of an e-commerce platform. The Product Owner presents 4 user stories. The team estimates story points using Planning Poker and commits based on historical velocity.",
        "steps": [
            {
                "stage": "Step 1: User Story Definition & Acceptance Criteria",
                "details": "Story 1: 'As a customer, I want to filter products by rating so I can find high-quality items quickly.' Acceptance Criteria: (1) Star rating dropdown 1-5; (2) Results update within 300ms; (3) Preserves active category."
            },
            {
                "stage": "Step 2: Planning Poker Story Point Estimation",
                "details": "Team uses Fibonacci scale (1, 2, 3, 5, 8, 13). Team discusses complexity and consensus emerges: Story 1 (Rating Filter) = 3 pts; Story 2 (UPI Payment Gateway) = 8 pts; Story 3 (Push Notifications) = 5 pts; Story 4 (Dark Mode) = 2 pts. Total backlog = 18 pts."
            },
            {
                "stage": "Step 3: Velocity Comparison & Sprint Commitment",
                "details": "Historical team velocity over past 3 sprints was 16, 15, and 17 points (average = 16 pts). Team commits to Stories 1, 2, and 3 (3 + 8 + 5 = 16 pts). Story 4 is deferred to Sprint 15."
            },
            {
                "stage": "Step 4: Sprint Burndown Tracking",
                "details": "Daily progress is plotted on a Burndown Chart (Remaining Points vs Days). If line is above ideal slope at Day 6, team negotiates scope reduction with Product Owner."
            }
        ],
        "expectedResult": "Team delivers a fully tested, shippable product increment of 16 points at sprint end without overtime burnout or missed delivery deadlines.",
        "practicalApplication": "Jira Agile sprint management, commercial SaaS product cycles, and sprint retrospectives.",
        "keyInsight": "Story points measure relative effort and technical complexity, not calendar hours; historical velocity prevents teams from overcommitting."
    },
    "se-m1-t4": {
        "title": "Scrum Ceremonies & GitHub Actions CI/CD Pipeline Workflow",
        "scenario": "A development squad implements Scrum rituals for an edtech web platform and automates continuous integration and deployment using GitHub Actions.",
        "diagram": "[Dev git push] -> [GitHub Actions Runner] -> [npm test & lint] -> [Docker Build] -> [Deploy to Staging AWS ECS]",
        "steps": [
            {
                "stage": "Ritual 1: Daily Standup (15 Minutes)",
                "details": "Three questions answered by each dev: (1) What did you complete yesterday? (2) What will you work on today? (3) What blockers or impediments are in your way?"
            },
            {
                "stage": "Ritual 2: Code Commit & Automated CI Trigger",
                "details": "Dev finishes task 'STUDY-102', writes unit tests, and pushes branch to GitHub. GitHub Actions runner automatically spins up an Ubuntu container within 10 seconds."
            },
            {
                "stage": "Ritual 3: Automated Quality Gate (CI)",
                "details": "Pipeline executes ESLint (code standards), runs 48 Jest unit tests (100% pass), and checks code coverage threshold (> 85%). If any test fails, PR merge is blocked."
            },
            {
                "stage": "Ritual 4: Automated Continuous Deployment (CD)",
                "details": "Upon PR approval and merge to 'main', GitHub Actions compiles production bundle, builds Docker image, and deploys to staging AWS cluster via canary release."
            }
        ],
        "expectedResult": "Bugs are caught within 3 minutes of code push instead of weeks later during QA phase. The team achieves zero-downtime continuous delivery.",
        "practicalApplication": "Modern cloud-native engineering at Spotify, Netflix, Amazon, and GitLab.",
        "keyInsight": "Scrum organizes human coordination across sprints; DevOps automates the technical build-test-deploy pipeline to eliminate manual deployment errors."
    },
    "se-m2-t1": {
        "title": "Requirements Elicitation & Conflict Resolution for Hospital Portal",
        "scenario": "A software analyst elicits requirements for an Online Hospital Outpatient Appointment System across three conflicting stakeholders: Doctors, Patients, and Hospital Finance.",
        "steps": [
            {
                "stage": "Step 1: Stakeholder Elicitation Sessions",
                "details": "Patients request instant online cancellation up to 5 minutes before appointment. Doctors request guaranteed 15-minute consultation buffers without schedule gaps. Finance insists on non-refundable advance booking fees."
            },
            {
                "stage": "Step 2: Conflict Identification & Negotiation",
                "details": "Patient flexibility directly conflicts with doctor idle time and hospital financial revenue when last-minute cancellations occur."
            },
            {
                "stage": "Step 3: Win-Win Conflict Resolution",
                "details": "Requirement negotiated: 'Patients may cancel up to 2 hours before appointment for a 90% refund. Cancellations within 2 hours forfeit fee unless filled by an automated real-time waiting-list queue notification.'"
            },
            {
                "stage": "Step 4: Formal Requirement Validation",
                "details": "Requirement verified against SMART criteria: Specific, Measurable, Achievable, Relevant, and Time-bound. Stakeholders sign off on baseline."
            }
        ],
        "expectedResult": "A clear, unambiguous, validated requirement statement that satisfies all three parties and prevents mid-development architectural redesign.",
        "practicalApplication": "Healthcare IT systems, airline reservation platforms, and municipal citizen service portals.",
        "keyInsight": "Requirements engineering is primarily a communication and consensus-building discipline; code written from unnegotiated requirements always requires costly rework."
    },
    "se-m2-t2": {
        "title": "Categorizing Functional vs Non-Functional Requirements (FURPS+)",
        "scenario": "A fintech company specifies requirements for a Mobile UPI Money Transfer application. Categorize each requirement into Functional or Non-Functional (Performance, Security, Availability, Usability).",
        "steps": [
            {
                "stage": "Requirement 1: Fund Transfer (Functional)",
                "details": "'The system shall allow authenticated users to transfer funds between linked bank accounts via Virtual Payment Address (VPA).' -> Direct business capability (Functional)."
            },
            {
                "stage": "Requirement 2: Transaction Latency (Non-Functional - Performance)",
                "details": "'The end-to-end payment processing time shall not exceed 1.5 seconds for 99% of transactions under a load of 5,000 requests/second.' -> Measurable quality attribute."
            },
            {
                "stage": "Requirement 3: Encryption (Non-Functional - Security)",
                "details": "'All sensitive payment payload data in transit shall be encrypted using TLS 1.3 with AES-256-GCM cipher suites.' -> Security compliance constraint."
            },
            {
                "stage": "Requirement 4: System Uptime (Non-Functional - Availability)",
                "details": "'The payment backend shall maintain 99.99% availability (maximum 52.6 minutes of unplanned downtime per year) through multi-region active-active clustering.' -> Reliability constraint."
            }
        ],
        "expectedResult": "Clear separation between 'what the system does' (Functional) and 'how well the system performs its duties' (Non-Functional), ensuring backend architects allocate appropriate cloud infrastructure.",
        "practicalApplication": "Software Architecture Document (SAD), Service Level Agreements (SLAs), and non-functional load testing with JMeter.",
        "keyInsight": "Functional requirements define system behavior; non-functional requirements dictate system architecture, infrastructure cost, and user satisfaction."
    },
    "se-m2-t3": {
        "title": "Drafting an IEEE 830-Compliant SRS Specification Section",
        "scenario": "Write a formal IEEE Std 830-1998 Software Requirements Specification (SRS) section for the 'Course Registration' module of a university management system.",
        "steps": [
            {
                "stage": "Section 1.1: Purpose & Scope",
                "details": "Specifies automated semester course registration for 5,000 undergraduate engineering students, enforcing prerequisite validations and classroom seat quotas."
            },
            {
                "stage": "Section 2.2: User Characteristics",
                "details": "Primary users: Students (basic digital literacy), Academic Advisors (faculty advisors reviewing enrollment plans), and University Registrar (administrative policy oversight)."
            },
            {
                "stage": "Section 3.2.1: Specific Functional Requirement - Pre-requisite Check",
                "details": "REQ-REG-01: 'When a student selects an elective course, the system shall verify in the academic history database whether all prerequisite courses have been completed with grade >= P. If prerequisite is missing, registration shall be rejected with error code ERR_PREREQ_MISSING.'"
            },
            {
                "stage": "Section 3.3: Interface & Database Constraints",
                "details": "System shall interface with the student database via RESTful JSON API and maintain atomic ACID transactions to prevent double-booking of final available seats."
            }
        ],
        "expectedResult": "An unambiguous, verifiable, and traceable SRS document that developers can implement and QA engineers can directly translate into acceptance test cases.",
        "practicalApplication": "Government IT tenders, ISO 9001 certified development projects, and software vendor contractual deliverables.",
        "keyInsight": "Avoid ambiguous words like 'user-friendly', 'fast', or 'as soon as possible'; specify exact numeric thresholds and explicit error states in the SRS."
    },
    "se-m2-t4": {
        "title": "UML Sequence Diagram: ATM Cash Withdrawal Transaction",
        "scenario": "Trace the sequence of object interactions over time during an ATM cash withdrawal of Rs 2,000 involving User, ATM Interface, Bank Controller, and Customer Account.",
        "diagram": "User       ATM_Interface       Bank_Controller       Account_DB\n |--- Insert Card & PIN ----------> |                     |\n |                                  |--- Verify PIN -----> | \n |                                  | <--- PIN Valid ---- | \n |--- Enter Amount (2000) --------> |                     |\n |                                  |--- Check Balance -> | \n |                                  | <--- Funds OK ----- | \n |                                  |--- Debit(2000) ---> | \n | <--- Dispense Cash & Receipt --- |                     |",
        "steps": [
            {
                "stage": "Interaction 1: Authentication",
                "details": "Customer inserts debit card and inputs 4-digit PIN. ATM_UI sends verifyCredentials(cardNum, hashPIN) to Bank_Controller."
            },
            {
                "stage": "Interaction 2: Database Verification",
                "details": "Bank_Controller executes synchronized query on Account_DB. Database validates PIN hash and returns AuthToken."
            },
            {
                "stage": "Interaction 3: Balance Verification & Transaction",
                "details": "Customer requests withdrawal of 2,000 INR. Controller invokes checkBalance(accId). Account_DB verifies balance (e.g. 15,000 >= 2,000) and returns Status: APPROVED."
            },
            {
                "stage": "Interaction 4: Atomic Debit & Hardware Dispatch",
                "details": "Controller sends debitAccount(accId, 2000) with ACID transaction commit. Controller sends dispenseCash(2000) signal to physical CashDispenser mechanism, ejects card, and issues printed receipt."
            }
        ],
        "expectedResult": "The dynamic runtime sequence of function calls, parameters, and return values is formally modeled, preventing race conditions and double-spending vulnerabilities.",
        "practicalApplication": "System architecture design, microservice interaction modeling, and debugging concurrency deadlocks.",
        "keyInsight": "Sequence diagrams emphasize the chronological time ordering of messages, with vertical lifelines representing object existence and activation boxes showing active execution."
    },
    "se-m3-t1": {
        "title": "Refactoring Code Smells & Cyclomatic Complexity Reduction",
        "scenario": "A legacy e-commerce discount calculator has a deeply nested function with Cyclomatic Complexity = 8 and multiple magic numbers. Refactor it using clean coding standards.",
        "code": "// Refactored Clean Code:\nconst TIER_THRESHOLDS = { GOLD: 10000, SILVER: 5000 };\nconst DISCOUNT_RATES = { GOLD: 0.20, SILVER: 0.10, STANDARD: 0.05 };\n\nfunction calculateDiscount(cartTotal, customerTier) {\n  if (cartTotal <= 0) return 0;\n  const baseRate = DISCOUNT_RATES[customerTier] || DISCOUNT_RATES.STANDARD;\n  const bonusRate = cartTotal > TIER_THRESHOLDS.GOLD ? 0.05 : 0;\n  return cartTotal * (baseRate + bonusRate);\n}",
        "steps": [
            {
                "stage": "Step 1: Identify Code Smells",
                "details": "Legacy code contained 5 nested if/else statements (`if (tier == 1) { if (amt > 5000) ... }`), uncommunicative variable names (`c`, `t`, `disc`), and hardcoded numeric constants (magic numbers)."
            },
            {
                "stage": "Step 2: Replace Magic Numbers with Constants",
                "details": "Extracted `TIER_THRESHOLDS` and `DISCOUNT_RATES` into immutable configuration dictionaries with self-documenting semantic names."
            },
            {
                "stage": "Step 3: Flatten Nested Conditionals with Guard Clauses",
                "details": "Replaced deeply nested conditional branches with early exit guard clauses (`if (cartTotal <= 0) return 0;`), reducing Cyclomatic Complexity from 8 to 2."
            },
            {
                "stage": "Step 4: Automated Code Review Checklist",
                "details": "Peer reviewer verifies: (1) Unit tests pass; (2) Complexity < 5; (3) Follows Airbnb/Google style guide; (4) Zero SonarQube security warnings."
            }
        ],
        "expectedResult": "Function becomes readable in 5 seconds, Cyclomatic Complexity drops by 75%, and unit test coverage requires only 3 test cases instead of 8 to achieve 100% branch coverage.",
        "practicalApplication": "SonarQube static analysis, code refactoring sprints, and GitHub Pull Request reviews.",
        "keyInsight": "Cyclomatic complexity measures the number of linearly independent paths through source code; reducing it directly reduces software defect rates."
    },
    "se-m3-t2": {
        "title": "V-Model Testing Strategy for Payment Gateway Integration",
        "scenario": "Design the four-tier testing hierarchy (Unit, Integration, System, Acceptance) for a credit card checkout service integrating with Stripe API.",
        "steps": [
            {
                "stage": "Level 1: Unit Testing (Jest / JUnit)",
                "details": "Test individual internal functions in isolation using mock objects: test calculateTax(100, 'Kerala') returns 18; test validateCardNumberLuhn() correctly identifies invalid checksums."
            },
            {
                "stage": "Level 2: Integration Testing (API & Database)",
                "details": "Test communication between PaymentService and OrderRepository in a PostgreSQL test container: verify that when payment succeeds, the order status in database transitions from PENDING to PAID."
            },
            {
                "stage": "Level 3: System Testing (End-to-End)",
                "details": "Simulate complete user journey across UI, backend, Stripe sandbox, and email notification service: user adds item to cart, enters test card, sees order confirmation screen within 2 seconds."
            },
            {
                "stage": "Level 4: User Acceptance Testing (UAT)",
                "details": "Client business stakeholders execute real-world scenarios in staging environment to verify compliance with contractual business requirements before production launch."
            }
        ],
        "expectedResult": "All defects are discovered at the lowest possible level: 85% of logic bugs caught during Unit testing at negligible cost, while integration and security risks are validated before release.",
        "practicalApplication": "Continuous testing pipelines, payment compliance audits (PCI-DSS), and medical/fintech quality assurance.",
        "keyInsight": "The earlier a defect is detected in the testing pyramid, the cheaper it is to fix (finding a bug in Unit Testing costs 10x less than in System Testing and 100x less than in Production)."
    },
    "se-m3-t3": {
        "title": "Boundary Value Analysis (BVA) & Basis Path Cyclomatic Complexity",
        "scenario": "Design test cases using Boundary Value Analysis for an input field that accepts student exam age: [18 to 60 inclusive], and compute the Cyclomatic Complexity V(G) of its validation logic.",
        "formula": "Cyclomatic Complexity V(G) = E - N + 2 = P + 1 (where P = predicate decision nodes)",
        "steps": [
            {
                "stage": "Step 1: Identify Equivalence Partitions",
                "details": "Invalid Partition 1: Age < 18 (e.g. 15). Valid Partition: 18 <= Age <= 60. Invalid Partition 2: Age > 60 (e.g. 75)."
            },
            {
                "stage": "Step 2: Boundary Value Test Cases (6-Point BVA)",
                "details": "Test Case 1: Just below min (17) -> Expect: ERROR.\nTest Case 2: Exact min (18) -> Expect: VALID.\nTest Case 3: Just above min (19) -> Expect: VALID.\nTest Case 4: Nominal mid value (35) -> Expect: VALID.\nTest Case 5: Just below max (59) -> Expect: VALID.\nTest Case 6: Exact max (60) -> Expect: VALID.\nTest Case 7: Just above max (61) -> Expect: ERROR."
            },
            {
                "stage": "Step 3: Control Flow Graph (CFG) Construction",
                "details": "Validation function: `if (age >= 18 && age <= 60) { accept(); } else { reject(); }`. The graph has 2 decision predicates: P1 (age >= 18) and P2 (age <= 60)."
            },
            {
                "stage": "Step 4: Compute Basis Paths",
                "details": "V(G) = P + 1 = 2 + 1 = 3 linearly independent paths:\nPath 1: Age < 18 -> Reject\nPath 2: Age >= 18 and Age > 60 -> Reject\nPath 3: Age >= 18 and Age <= 60 -> Accept."
            }
        ],
        "expectedResult": "7 boundary value test cases and 3 basis path test cases achieve 100% statement and branch coverage with zero redundant tests.",
        "practicalApplication": "Writing comprehensive unit test suites in pytest/JUnit, software testing certification (ISTQB), and formal safety verification.",
        "keyInsight": "The majority of programming bugs occur at boundaries (off-by-one errors like using > instead of >=); testing exact boundary values catches over 80% of boundary defects."
    },
    "se-m3-t4": {
        "title": "Git Feature Branch Workflow & Merge Conflict Resolution",
        "scenario": "Two developers (Alice and Bob) edit line 24 of `config.js` concurrently on separate branches. Alice merges her branch first. Walk through how Bob identifies and resolves the merge conflict.",
        "steps": [
            {
                "stage": "Step 1: Branch Creation & Divergent Edits",
                "details": "Alice creates branch `feat-auth` and changes line 24 to: `const API_URL = 'https://auth.api.com';`. Bob creates branch `feat-payment` and changes line 24 to: `const API_URL = 'https://pay.api.com';`."
            },
            {
                "stage": "Step 2: Alice Merges to Main",
                "details": "Alice opens PR, passes CI tests, and merges `feat-auth` into `main`. The remote `main` branch now contains Alice's change."
            },
            {
                "stage": "Step 3: Bob Encounters Merge Conflict",
                "details": "Bob runs `git checkout main && git pull && git checkout feat-payment && git merge main`. Git halts auto-merging and reports: `CONFLICT (content): Merge conflict in config.js. Automatic merge failed; fix conflicts and commit the result.`"
            },
            {
                "stage": "Step 4: Inspecting Conflict Markers & Resolution",
                "details": "Bob opens `config.js` and sees conflict markers:\n<<<<<<< HEAD\nconst API_URL = 'https://pay.api.com';\n=======\nconst API_URL = 'https://auth.api.com';\n>>>>>>> main\nBob coordinates with Alice, refactors to support both domains via an environment object, deletes markers, runs `git add config.js && git commit -m 'resolve merge conflict in config.js'`."
            }
        ],
        "expectedResult": "Conflict is cleanly resolved, preserving both features, and the repository history remains consistent without overwriting team members' code.",
        "practicalApplication": "Collaborative team software development on GitHub, GitLab, and Bitbucket using trunk-based or GitFlow methodologies.",
        "keyInsight": "Never delete conflict markers without understanding both sides of the change; merge conflicts are Git's safety net preventing accidental silent code overwrites."
    },
    "se-m4-t1": {
        "title": "Work Breakdown Structure (WBS) & Activity Network for E-Commerce App",
        "scenario": "A project manager structures an e-commerce platform into a 3-level Work Breakdown Structure (WBS) and defines task dependencies for schedule planning.",
        "steps": [
            {
                "stage": "Level 1: System Level",
                "details": "1.0 E-Commerce Mobile Platform."
            },
            {
                "stage": "Level 2: Major Subsystems",
                "details": "1.1 User Authentication Module; 1.2 Product Catalog & Search; 1.3 Shopping Cart & Checkout; 1.4 Payment Gateway Integration; 1.5 Order Tracking & Notifications."
            },
            {
                "stage": "Level 3: Work Packages (Actionable Tasks)",
                "details": "Under 1.4 Payment Gateway:\n1.4.1 Design Payment API Schema (3 days, Predecessor: None)\n1.4.2 Implement UPI Gateway Integration (5 days, Predecessor: 1.4.1)\n1.4.3 Implement Credit Card Encryption Module (4 days, Predecessor: 1.4.1)\n1.4.4 Payment Sandbox Integration Testing (4 days, Predecessors: 1.4.2, 1.4.3)."
            },
            {
                "stage": "Step 4: Responsibility Assignment Matrix (RACI)",
                "details": "RACI chart created: Dev Team is Responsible (R), Lead Architect is Accountable (A), Security Team is Consulted (C), Product Manager is Informed (I)."
            }
        ],
        "expectedResult": "The project is partitioned into discrete, measurable work packages with unambiguous dependencies, enabling realistic milestone estimation.",
        "practicalApplication": "Project planning in Microsoft Project, Jira portfolio roadmaps, and PMP project management workflows.",
        "keyInsight": "A work package at the lowest WBS level should adhere to the 8/80 rule: no task should be smaller than 8 hours or larger than 80 hours of effort."
    },
    "se-m4-t2": {
        "title": "Basic COCOMO Estimation & Critical Path Method (CPM) Calculation",
        "scenario": "Estimate development effort and duration for an Organic software project estimated at 30 KLOC (30,000 lines of code) using Basic COCOMO, and determine the Critical Path across 4 dependent tasks.",
        "formula": "COCOMO Organic: Effort E = 2.4 * (KLOC)^1.05 person-months | Duration D = 2.5 * (E)^0.38 months",
        "steps": [
            {
                "stage": "Step 1: Compute COCOMO Effort (E)",
                "details": "KLOC = 30. (30)^1.05 = 35.53. Effort E = 2.4 × 35.53 = 85.28 person-months (PM)."
            },
            {
                "stage": "Step 2: Compute Project Duration (D)",
                "details": "D = 2.5 × (85.28)^0.38 = 2.5 × 5.41 = 13.52 months. Recommended team size = E / D = 85.28 / 13.52 ≈ 6.3 developers."
            },
            {
                "stage": "Step 3: Critical Path Method (CPM) Network",
                "details": "Task A (Requirements, 2 mo) -> Task B (UI Design, 3 mo) -> Task D (Deployment, 1 mo).\nTask A (Requirements, 2 mo) -> Task C (Core Engine, 6 mo) -> Task D (Deployment, 1 mo)."
            },
            {
                "stage": "Step 4: Path Duration Comparison",
                "details": "Path 1 (A -> B -> D) = 2 + 3 + 1 = 6 months.\nPath 2 (A -> C -> D) = 2 + 6 + 1 = 9 months.\nCritical Path is Path 2 (A -> C -> D) with total length = 9 months. Task B has 3 months of float/slack."
            }
        ],
        "expectedResult": "COCOMO estimates 85.3 person-months over 13.5 months with 6-7 engineers. The minimum project completion time is constrained by Critical Path A->C->D (9 months); any delay in Task C directly delays project delivery.",
        "practicalApplication": "Software cost estimation for bids, resource allocation budgeting, and project schedule risk management.",
        "keyInsight": "The Critical Path has zero slack; project managers must focus monitoring on critical path activities because non-critical activities have float buffer."
    },
    "se-m4-t3": {
        "title": "Risk Management: Exposure Matrix & RMMM Mitigation Plan",
        "scenario": "A software agency building a cloud banking application identifies a critical risk: 'Key Cloud Database Vendor increases API pricing by 400% or suffers multi-day regional outage.' Create an RMMM (Risk Mitigation, Monitoring, and Management) plan.",
        "formula": "Risk Exposure (RE) = Probability (P) * Impact (I)",
        "steps": [
            {
                "stage": "Step 1: Risk Assessment & Quantification",
                "details": "Probability P = 0.30 (30% likelihood over project lifecycle). Impact I = Rs 1,000,000 (estimated migration/outage cost). Risk Exposure RE = 0.30 × 1,000,000 = Rs 300,000. Categorized as High Priority."
            },
            {
                "stage": "Step 2: Risk Mitigation (Proactive Prevention)",
                "details": "Implement Repository Pattern and Database Abstraction Layer (Prisma/Hibernate) instead of vendor-proprietary SQL dialect, ensuring the database engine can be swapped in < 48 hours."
            },
            {
                "stage": "Step 3: Risk Monitoring (Early Warning Indicators)",
                "details": "DevOps monitors vendor status page RSS feeds, tracks monthly API quota utilization, and conducts quarterly multi-cloud pricing reviews."
            },
            {
                "stage": "Step 4: Risk Management (Contingency Action)",
                "details": "If the outage occurs or contract terms become untenable, trigger predefined automated migration scripts to spin up self-hosted PostgreSQL instances on alternate cloud provider (AWS to GCP)."
            }
        ],
        "expectedResult": "The project avoids vendor lock-in; financial exposure is capped at 15% of initial estimate, and database failover is rehearsed without panic.",
        "practicalApplication": "Disaster recovery planning, enterprise security compliance (SOC 2), and business continuity management.",
        "keyInsight": "Risk mitigation is proactive (done before the risk occurs); risk management is reactive (executed once the risk materializes into an active issue)."
    },
    "se-m4-t4": {
        "title": "SQA Process Audit: Advancing from CMMI Level 1 to Level 3",
        "scenario": "A mid-sized software firm operates at CMMI Level 1 (Initial / Ad-Hoc). Audit its defect history and map the specific process improvements required to achieve CMMI Level 3 (Defined).",
        "steps": [
            {
                "stage": "Step 1: Assess Current State (CMMI Level 1)",
                "details": "Projects succeed only through individual heroics. When lead engineer resigns, the project misses deadlines. Defect density is high (14.2 defects per KLOC in production) with zero documented organizational standards."
            },
            {
                "stage": "Step 2: Transition to CMMI Level 2 (Managed)",
                "details": "Institute project-level disciplines: (1) Formal requirements change control board; (2) Baseline project schedule tracking; (3) Standardized version control commit conventions."
            },
            {
                "stage": "Step 3: Transition to CMMI Level 3 (Defined)",
                "details": "Establish organization-wide standard engineering processes: (1) Universal peer code review policy; (2) Centralized process asset library (PAL) with reusable templates; (3) Mandatory CI automated quality gates across all projects."
            },
            {
                "stage": "Step 4: Measure Quality Outcome",
                "details": "Post-audit defect density drops from 14.2 to 2.1 defects per KLOC. On-time project delivery improves from 45% to 92% across all client accounts."
            }
        ],
        "expectedResult": "The organization institutionalizes repeatable, predictable software processes independent of individual developer turnover, meeting international ISO 9001 and CMMI Level 3 accreditation requirements.",
        "practicalApplication": "Enterprise vendor accreditation, defense contracting compliance, and institutional software quality engineering.",
        "keyInsight": "CMMI Level 1 depends on heroes; CMMI Level 3 depends on documented, repeatable organizational processes."
    }
}
