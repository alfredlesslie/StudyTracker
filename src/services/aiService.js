/**
 * StudySense AI - AI Service Architecture
 * 
 * Provides intelligent, pedagogically sound AI tutoring, concept breakdowns,
 * step-by-step walkthroughs, bilingual (Malayalam/English) explanations,
 * answer mistake diagnostics, and dynamic practice question generation.
 * 
 * ARCHITECTURE PRINCIPLES:
 * 1. AI teaches & explains; ML (future) predicts & prioritizes.
 * 2. Works 100% offline via realistic contextual Mock AI engine.
 * 3. Architecture is fully prepared to hook into a secure backend LLM proxy / Gemini API.
 * 4. NEVER exposes secret API keys directly in client-side code.
 */

import { SUBJECTS, MODULES, TOPICS } from "../data/syllabus.js";
import { LEARNING_CONTENT } from "../data/learningContent.js";
import { apiGet, apiPost } from "./apiClient.js";


// ============================================================================
// 1. COMPREHENSIVE CURATED KNOWLEDGE BASE FOR REPRESENTATIVE TOPICS
// ============================================================================

const CURATED_TUTOR_KNOWLEDGE = {
  // COMPUTER NETWORKS
  "cn-m1-t1": {
    simple: {
      idea: "The OSI and TCP/IP models are standardized blueprints that allow different computers to talk to each other without needing to know each other's hardware details.",
      howItWorks: "Communication is split into independent layers. When sending, data moves down from the Application layer to Physical bits (encapsulation). When receiving, it moves up (de-encapsulation).",
      example: "Sending an email is like mailing a postal letter: you write the message (Application), put it in an addressed envelope (Transport/Network), and the postal carrier ships it via plane or truck (Physical).",
      whyItMatters: "Without layering, every software update or new cable type would require rewriting all web browsers and operating systems from scratch."
    },
    steps: [
      "Step 1: Application Layer (OSI 7/6/5, TCP/IP 4) — Generates user data (HTTP, DNS, SMTP).",
      "Step 2: Transport Layer (OSI 4, TCP/IP 3) — Segments data, provides reliability (TCP) or speed (UDP), adds port numbers.",
      "Step 3: Network Layer (OSI 3, TCP/IP 2) — Packages segments into packets, assigns IP addresses, computes routes.",
      "Step 4: Data Link & Physical Layers (OSI 2/1, TCP/IP 1) — Frames packets with MAC addresses and transmits electrical/optical bits."
    ],
    example: "Suppose a browser fetches `index.html`. The HTTP request (Application) is encapsulated into a TCP segment with Port 80 (Transport), wrapped into an IP packet with destination 142.250.190.46 (Network), converted into an Ethernet frame with router's MAC address (Data Link), and beamed across a Wi-Fi radio wave (Physical).",
    malayalam: "OSI Model-ഉം TCP/IP Model-ഉം കമ്പ്യൂട്ടറുകൾ തമ്മിൽ ആശയവിനിമയം നടത്താൻ ഉപയോഗിക്കുന്ന layered network architectures ആണ്.\n\nഒരു കമ്പ്യൂട്ടർ മറ്റൊരു കമ്പ്യൂട്ടറിലേക്ക് data അയക്കുമ്പോൾ, ആ complex process-നെ പല layers ആയി വിഭജിക്കുന്നു. OSI model-ൽ 7 layers ഉണ്ട് (Physical മുതൽ Application വരെ). എന്നാൽ practical internet-ൽ ഉപയോഗിക്കുന്ന TCP/IP model-ൽ 4 layers മാത്രമാണുള്ളത് (Network Access, Internet, Transport, Application).\n\nഓരോ layer-നും കൃത്യമായ responsibilities ഉണ്ട്. Data അയക്കുമ്പോൾ മുകളിൽ നിന്ന് താഴേക്ക് (Encapsulation) സഞ്ചരിക്കുകയും, സ്വീകരിക്കുമ്പോൾ താഴെ നിന്ന് മുകളിലേക്ക് (De-encapsulation) സഞ്ചരിക്കുകയും ചെയ്യുന്നു.",
    keyPoints: [
      "OSI has 7 theoretical layers; TCP/IP has 4 practical internet layers.",
      "OSI combines Session, Presentation, and Application into TCP/IP's single Application layer.",
      "PDU progression: Data → Segment (Transport) → Packet (Network) → Frame (Data Link) → Bits (Physical).",
      "Routers operate up to Layer 3 (Network); Switches operate at Layer 2 (Data Link)."
    ],
    examFocus: "Focus on comparing the OSI 7 layers with the TCP/IP 4 layers. Draw the layer mapping table and explain the functions of the Transport and Network layers."
  },

  "cn-m2-t2": {
    simple: {
      idea: "Routing algorithms determine the most efficient mathematical path for data packets to travel from a source computer to a destination computer across multiple routers.",
      howItWorks: "Routers exchange topology and link-cost information with neighboring routers, calculate shortest paths using graph algorithms, and store the next hop in a forwarding table.",
      example: "Like Google Maps finding the fastest driving route based on distance, traffic delays, and road closures.",
      whyItMatters: "Prevents network bottlenecks, ensures packets don't circle in endless loops, and keeps the global internet resilient when links fail."
    },
    steps: [
      "Step 1: Network Graph Representation — Routers are nodes; physical links with delay/bandwidth costs are weighted edges.",
      "Step 2: Information Exchange — Link State routers flood the entire topology (OSPF); Distance Vector routers exchange cost vectors only with direct neighbors (RIP).",
      "Step 3: Shortest Path Calculation — Run Dijkstra's algorithm (Link State) or the Bellman-Ford recurrence (Distance Vector).",
      "Step 4: Forwarding Table Construction — Map destination IP subnets to optimal output interfaces and next-hop router IPs."
    ],
    example: "In Dijkstra's algorithm on a 4-router mesh (A, B, C, D): Router A knows Link(A-B)=2 and Link(A-C)=5. If Link(B-D)=1 and Link(C-D)=2, path A→B→D costs 2+1=3, which is shorter than A→C→D (5+2=7). Router A assigns all packets destined for D to output interface towards B.",
    malayalam: "Routing Algorithms എന്നത് ഒരു network-ൽ source-ൽ നിന്ന് destination-ലേക്ക് data packets ഏറ്റവും മികച്ച path-ലൂടെ അയക്കാൻ routers ഉപയോഗിക്കുന്ന algorithms ആണ്.\n\nപ്രധാനമായും രണ്ട് types ഉണ്ട്:\n1. Link State Routing: ഓരോ router-ഉം മുഴുവൻ network topology-യും മനസ്സിലാക്കി Dijkstra's Algorithm ഉപയോഗിച്ച് shortest path കണ്ടെത്തുന്നു (ഉദാ: OSPF).\n2. Distance Vector Routing: Routers അടുത്തുള്ള direct neighbors-മായി മാത്രം വിവരങ്ങൾ പങ്കുവെച്ച് Bellman-Ford equation ഉപയോഗിച്ച് route കണ്ടെത്തുന്നു (ഉദാ: RIP).\n\nDelay, bandwidth, distance എന്നിവ അടിസ്ഥാനമാക്കിയാണ് cost കണക്കാക്കുന്നത്.",
    keyPoints: [
      "Link State uses Dijkstra's algorithm with global topology knowledge (faster convergence, no routing loops).",
      "Distance Vector uses Bellman-Ford with localized neighbor updates (susceptible to Count-to-Infinity problem).",
      "Routing chooses the route (control plane); Forwarding moves the packet from input to output interface (data plane).",
      "Split Horizon and Poison Reverse are techniques used to prevent Distance Vector loops."
    ],
    examFocus: "Prepare the complete step-by-step trace of Dijkstra's algorithm given a weighted graph. Be able to contrast Distance Vector vs. Link State in a 5-mark comparison table."
  },

  "cn-m2-t4": {
    simple: {
      idea: "Subnetting is the process of splitting one large physical IP network into multiple smaller, logically independent subnetworks.",
      howItWorks: "Bits are 'borrowed' from the Host ID portion of an IP address and assigned to the Network portion, defined by a Subnet Mask.",
      example: "Think of an apartment building with one main street address: subnetting is assigning individual apartment room numbers so mail goes directly to the right tenant.",
      whyItMatters: "It conserves scarce IPv4 addresses, isolates network security domains, and reduces unnecessary broadcast traffic across the organization."
    },
    steps: [
      "Step 1: Identify Required Subnets — Calculate $2^s \\ge N$, where $s$ is borrowed subnet bits and $N$ is required subnetworks.",
      "Step 2: Determine Required Hosts Per Subnet — Ensure $2^h - 2 \\ge H$, where $h$ is remaining host bits (subtracting 2 for Network ID and Broadcast Address).",
      "Step 3: Calculate New Subnet Mask — Add $s$ bits to the default prefix (e.g., /24 + 2 bits = /26, or 255.255.255.192).",
      "Step 4: Find Block Size / Interval — Block size = $256 - \\text{mask octet}$ (e.g., $256 - 192 = 64$). Subnet ranges begin at multiples of 64: .0, .64, .128, .192."
    ],
    example: "Splitting `192.168.1.0/24` into 4 subnets: Borrow 2 bits ($2^2=4$). New mask is `/26` (255.255.255.192). Block size = 64.\n• Subnet 1: Network `192.168.1.0`, Usable Hosts `192.168.1.1` to `.62`, Broadcast `192.168.1.63`.\n• Subnet 2: Network `192.168.1.64`, Usable Hosts `192.168.1.65` to `.126`, Broadcast `192.168.1.127`.",
    malayalam: "Subnetting എന്നത് ഒരു വലിയ network-നെ ചെറിയ logical networks ആയി വിഭജിക്കുന്ന process ആണ്.\n\nഇതിലൂടെ IP address-കളുടെ waste കുറയ്ക്കാനും, network traffic നിയന്ത്രിക്കാനും, security കൂട്ടാനും സാധിക്കും. Subnet mask ഉപയോഗിച്ചാണ് Network ID ഏതാണ് Host ID ഏതാണ് എന്ന് router തിരിച്ചറിയുന്നത്.\n\nHost bits-ൽ നിന്ന് bits 'borrow' ചെയ്താണ് subnet bits ഉണ്ടാക്കുന്നത്. ഓരോ subnet-ലും ആദ്യത്തെ address Network Address ആയും അവസാനത്തെ address Broadcast Address ആയും മാറ്റിവെക്കുന്നു, അതിനാൽ usable hosts = $2^h - 2$ ആയിരിക്കും.",
    keyPoints: [
      "Number of subnets created = $2^{\\text{borrowed bits}}$.",
      "Usable hosts per subnet = $2^{\\text{host bits}} - 2$ (Network address and Broadcast address cannot be assigned to hosts).",
      "CIDR notation (e.g., /26) represents the total count of 1s in the subnet mask.",
      "Supernetting (CIDR aggregation) combines contiguous small subnets to reduce routing table entries."
    ],
    examFocus: "Numerical problems are high-yield: given an IP like 200.10.20.0/24, find the subnet mask, valid host ranges, and broadcast address for a given number of subnets."
  },

  // SOFTWARE ENGINEERING
  "se-m1-t2": {
    simple: {
      idea: "SDLC (Software Development Life Cycle) models are structured workflows that outline how software is conceived, designed, coded, tested, and maintained.",
      howItWorks: "Each model balances planning, flexibility, customer feedback, and delivery speed through distinct developmental phases.",
      example: "Constructing a house: you need architectural blueprints before laying the foundation, framing walls, and painting (traditional Waterfall); whereas furnishing an apartment can be iterative room by room.",
      whyItMatters: "Prevents costly development chaos, ensures quality control, and helps engineering teams meet deadlines and budgets."
    },
    steps: [
      "Step 1: Requirement Analysis — Gather what the customer and business actually need.",
      "Step 2: System & Architectural Design — Define data models, APIs, and component boundaries.",
      "Step 3: Implementation / Coding — Developers write source code following design specs.",
      "Step 4: Testing & Verification — QA tests for bugs, security vulnerabilities, and functional compliance.",
      "Step 5: Deployment & Maintenance — Release to production and provide bug fixes and patches."
    ],
    example: "Waterfall Model: Requirements are completely locked at the beginning. If the client changes their mind about the UI during testing, reworking it requires restarting previous phases. In contrast, Spiral Model assesses risk before every incremental cycle.",
    malayalam: "SDLC (Software Development Life Cycle) എന്നത് ഒരു software കൃത്യമായ പ്ലാനിംഗോടെ, ഉയർന്ന ഗുണനിലവാരത്തിൽ നിർമ്മിക്കാൻ ഉപയോഗിക്കുന്ന step-by-step framework ആണ്.\n\nഇതിൽ Requirements Gathering, Design, Implementation (Coding), Testing, Deployment, Maintenance എന്നീ ഘട്ടങ്ങളുണ്ട്.\n\nപ്രൊജക്റ്റിന്റെ സ്വഭാവം അനുസരിച്ച് Waterfall, Iterative, Spiral, Agile തുടങ്ങിയ മോഡലുകൾ തിരഞ്ഞെടുക്കുന്നു. ഉദാഹരണത്തിന് requirements പൂർണ്ണമായി അറിയാമെങ്കിൽ Waterfall അനുയോജ്യമാണ്; എന്നാൽ risks കൂടുതലുള്ള വലിയ പ്രൊജക്റ്റുകൾക്ക് Spiral model മികച്ചതാണ്.",
    keyPoints: [
      "Waterfall is linear-sequential; best for stable, well-defined requirements.",
      "V-Model pairs each development phase directly with an associated testing phase (Verification & Validation).",
      "Spiral Model is risk-driven and iterative, combining waterfall with prototyping.",
      "RAD (Rapid Application Development) emphasizes active prototyping over extensive planning."
    ],
    examFocus: "Focus on drawing the classic Waterfall diagram, V-Model diagram, and explaining the 4 quadrants of the Spiral Model (Planning, Risk Analysis, Engineering, Evaluation)."
  },

  "se-m1-t3": {
    simple: {
      idea: "Agile is an iterative mindset that prioritizes rapid delivery of working software and continuous collaboration over rigid documentation and upfront plans.",
      howItWorks: "Work is divided into small, manageable cycles (typically 1–4 weeks). After each cycle, working software is reviewed with stakeholders to incorporate feedback.",
      example: "Instead of writing an entire 500-page book over two years before showing anyone, an author publishes one polished chapter every two weeks and refines the plot based on reader reactions.",
      whyItMatters: "Modern technology and user needs evolve too quickly for traditional multi-year planning cycles."
    },
    steps: [
      "Step 1: Backlog Grooming — Maintain a prioritized list of user stories representing customer value.",
      "Step 2: Sprint Iteration — The team commits to a small subset of stories for a 2-week cycle.",
      "Step 3: Continuous Delivery — Build, test, and integrate code daily.",
      "Step 4: Sprint Review & Retrospective — Demonstrate working software to stakeholders and discuss process improvements."
    ],
    example: "A college marks portal: In Sprint 1, deploy basic student login. In Sprint 2, add internal marks viewing. In Sprint 3, add grade export to PDF. The college gets working value every fortnight rather than waiting an entire year.",
    malayalam: "Agile എന്നത് വേഗത്തിലും മാറ്റങ്ങൾക്ക് അനുയോജ്യമായും software വികസിപ്പിച്ചെടുക്കാനുള്ള ഒരു modern approach ആണ്.\n\n2001-ൽ രൂപീകരിച്ച Agile Manifesto-ൽ 4 core values ഉം 12 principles ഉം ഉണ്ട്. ഇതിലെ 4 പ്രധാന തത്വങ്ങൾ:\n1. Individuals and interactions over processes and tools\n2. Working software over comprehensive documentation\n3. Customer collaboration over contract negotiation\n4. Responding to change over following a plan\n\nചെറിയ iterations (Sprints) ആയി working software നിരന്തരം ഉപഭോക്താവിന് നൽകുന്നതിനാണ് Agile മുൻഗണന നൽകുന്നത്.",
    keyPoints: [
      "4 Core Values: Individuals > Processes, Working Software > Documentation, Customer Collaboration > Contract, Responding to Change > Following a Plan.",
      "Promotes sustainable development pace, face-to-face communication, and daily collaboration.",
      "User Stories follow the format: 'As a [role], I want [feature], so that [benefit]'.",
      "Agile is an umbrella methodology encompassing Scrum, Kanban, Extreme Programming (XP), and Lean."
    ],
    examFocus: "Memorize the 4 core values and key principles of the Agile Manifesto. Be ready to explain how Agile differs from the traditional Waterfall model in a comparative table."
  },

  "se-m1-t4": {
    simple: {
      idea: "Scrum is an agile project management framework using timed sprints and specific roles, while DevOps bridges software development (Dev) and IT operations (Ops) through automated CI/CD pipelines.",
      howItWorks: "Scrum organizes cross-functional teams around sprints, standups, and retrospectives. DevOps automates code testing, building, and deployment into production environments continuously.",
      example: "Scrum is the chef team agreeing on tonight's menu and cooking dishes in 30-minute orders; DevOps is the conveyor belt system and automated dishwashing line delivering food seamlessly to diners.",
      whyItMatters: "Reduces release cycles from months to minutes, minimizing deployment failures and maximizing developer productivity."
    },
    steps: [
      "Step 1: Product Backlog creation by the Product Owner.",
      "Step 2: Sprint Planning — Team commits to user stories for a 1–4 week Sprint.",
      "Step 3: Daily Scrum — 15-minute sync answering: What did I do? What will I do? What blockers exist?",
      "Step 4: CI/CD Pipeline (DevOps) — Git push triggers automated unit testing, container build (Docker), and cloud deployment (Kubernetes)."
    ],
    example: "A Spotify developer pushes a bug fix to GitHub at 10 AM. Automated unit tests pass in 2 minutes. The code is compiled into a container and deployed to 1% of users (canary release). By 10:15 AM, it is safely in production without downtime.",
    malayalam: "Scrum എന്നത് Agile implementation-നായി ഉപയോഗിക്കുന്ന ഒരു popular framework ആണ്. ഇതിൽ മൂന്ന് പ്രധാന റോളുകൾ ഉണ്ട്: Product Owner, Scrum Master, Development Team. പ്രധാന ചടങ്ങുകൾ: Sprint Planning, Daily Standup, Sprint Review, Sprint Retrospective.\n\nDevOps എന്നത് Development ടീമും Operations ടീമും ഒന്നിച്ച് പ്രവർത്തിച്ച് automated CI/CD (Continuous Integration & Continuous Deployment) pipeline വഴി വളരെ വേഗത്തിലും സുരക്ഷിതമായും software release ചെയ്യാൻ സഹായിക്കുന്ന ഒരു methodology ആണ്.",
    keyPoints: [
      "Scrum Roles: Product Owner (manages backlog), Scrum Master (removes blockers), Developers (build increments).",
      "Scrum Artifacts: Product Backlog, Sprint Backlog, Increment.",
      "DevOps Core: CI/CD (Continuous Integration, Continuous Delivery/Deployment), Infrastructure as Code (IaC), Monitoring.",
      "DevOps tools: Git, Jenkins, Docker, Kubernetes, Prometheus."
    ],
    examFocus: "Be prepared to describe Scrum ceremonies and artifacts, and define the CI/CD pipeline lifecycle in DevOps with a neat diagram."
  },

  // ADVANCED MATHEMATICS FOR DATA SCIENCE
  "math-m1-t4": {
    simple: {
      idea: "Eigenvalues and Eigenvectors describe the axes along which a transformation stretches space without rotating it; PCA and SVD use this to compress high-dimensional data while retaining maximum variance.",
      howItWorks: "For a matrix $A$, if $A v = \\lambda v$, then vector $v$ only scales by factor $\\lambda$. In PCA, eigenvectors of the data covariance matrix point along the directions of greatest data spread.",
      example: "Taking a 2D photograph of a 3D person: you choose the viewing angle that captures the widest posture (maximum variance) rather than a narrow angle where limbs overlap.",
      whyItMatters: "High-dimensional datasets suffer from the 'Curse of Dimensionality'. PCA and SVD compress thousands of features into a handful of principal components without losing significant information."
    },
    steps: [
      "Step 1: Characteristic Equation — Solve $\\det(A - \\lambda I) = 0$ to find eigenvalues $\\lambda$.",
      "Step 2: Eigenvector Calculation — For each $\\lambda$, solve $(A - \\lambda I)v = 0$.",
      "Step 3: PCA Pipeline — Center data ($X - \\mu$), compute covariance matrix $\\Sigma = \\frac{1}{n} X^T X$, extract eigenvectors sorted by decreasing eigenvalue.",
      "Step 4: Singular Value Decomposition — Factorize any matrix $X = U \\Sigma V^T$, where singular values $\\sigma_i = \\sqrt{\\lambda_i}$ represent energy along principal axes."
    ],
    example: "For matrix $A = \\begin{pmatrix} 4 & 1 \\\\ 2 & 3 \\end{pmatrix}$, $\\det(A - \\lambda I) = (4-\\lambda)(3-\\lambda) - 2 = \\lambda^2 - 7\\lambda + 10 = 0$. Factoring gives $\\lambda_1 = 5$ and $\\lambda_2 = 2$. For $\\lambda_1=5$, solving $(A-5I)v=0$ gives eigenvector $v_1 = \\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}$.",
    malayalam: "Linear Algebra-ൽ ഒരു matrix ഒരു vector-ൽ പ്രവർത്തിക്കുമ്പോൾ അതിന്റെ direction മാറ്റാതെ magnitude മാത്രം scale ചെയ്യുകയാണെങ്കിൽ, ആ vector-നെ Eigenvector എന്നും ആ scaling factor-നെ Eigenvalue ($\\\\lambda$) എന്നും വിളിക്കുന്നു: $A v = \\lambda v$.\n\nData Science-ൽ high-dimensional data-യെ പ്രധാനപ്പെട്ട features മാത്രം നിലനിർത്തി compress ചെയ്യാൻ PCA (Principal Component Analysis)-ലും SVD (Singular Value Decomposition)-ലും ഇവ ഉപയോഗിക്കുന്നു. Covariance matrix-ന്റെ ഏറ്റവും വലിയ Eigenvalue ഉള്ള Eigenvector ആണ് ഒന്നാമത്തെ Principal Component (PC1), ഇത് ഡാറ്റയിലെ ഏറ്റവും കൂടുതൽ variance പ്രതിനിധീകരിക്കുന്നു.",
    keyPoints: [
      "Equation: $A v = \\lambda v$ where $v \\neq 0$.",
      "Sum of eigenvalues equals the trace of $A$; Product of eigenvalues equals $\\det(A)$.",
      "PCA projects data onto orthogonal eigenvectors of the covariance matrix with largest eigenvalues.",
      "SVD generalizes eigendecomposition to non-square matrices: $A = U \\Sigma V^T$."
    ],
    examFocus: "Solve numerical problems finding eigenvalues and eigenvectors for 2x2 and 3x3 matrices. Explain the theoretical steps of PCA for dimensionality reduction."
  },

  "math-m2-t1": {
    simple: {
      idea: "Probability measures the likelihood of events, conditional probability assesses likelihood given existing evidence, and Bayes' Theorem updates our belief when new evidence appears.",
      howItWorks: "Bayes' Theorem balances our prior belief, how likely the evidence is under the hypothesis (likelihood), and the overall likelihood of the evidence.",
      example: "A medical test: if a rare disease affects 1 in 1,000 people and a test is 99% accurate, testing positive doesn't mean you have a 99% chance of being sick! Because the disease is rare (prior is tiny), most positives are false alarms.",
      whyItMatters: "Forms the mathematical foundation of Naive Bayes classifiers, spam filters, recommendation systems, and uncertainty estimation in machine learning."
    },
    steps: [
      "Step 1: Conditional Probability Definition — $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$ given $P(B) > 0$.",
      "Step 2: Multiplication Rule — $P(A \\cap B) = P(A|B) \\cdot P(B) = P(B|A) \\cdot P(A)$.",
      "Step 3: Total Probability Theorem — $P(B) = \\sum_{i} P(B|A_i) P(A_i)$ for mutually disjoint partitions $A_i$.",
      "Step 4: Bayes' Theorem Formula — $P(A_i|B) = \\frac{P(B|A_i) P(A_i)}{\\sum_j P(B|A_j) P(A_j)}$."
    ],
    example: "Spam filtering: Prior probability an email is spam $P(\\text{Spam}) = 0.3$. Word 'Prize' appears in 80% of spam ($P(\\text{Prize}|\\text{Spam})=0.8$) and only 5% of legitimate emails ($P(\\text{Prize}|\\text{Ham})=0.05$). If an incoming email has 'Prize', $P(\\text{Spam}|\\text{Prize}) = \\frac{0.8 \\times 0.3}{(0.8 \\times 0.3) + (0.05 \\times 0.7)} = \\frac{0.24}{0.24 + 0.035} \\approx 87.3\\%$.",
    malayalam: "Probability എന്നത് ഒരു സംഭവം നടക്കാനുള്ള സാധ്യതയാണ്. Conditional Probability $P(A|B)$ എന്നാൽ സംഭവം $B$ സംഭവിച്ചു എന്ന് അറിഞ്ഞതിനു ശേഷം $A$ സംഭവിക്കാനുള്ള സാധ്യതയാണ്.\n\nBayes' Theorem ഉപയോഗിച്ച് മുൻപുള്ള അറിവുകളുടെ (Prior Probability) വെളിച്ചത്തിൽ, പുതിയ തെളിവുകൾ (Evidence) ലഭിക്കുമ്പോൾ നമ്മുടെ വിശ്വാസ്യത (Posterior Probability) അപ്ഡേറ്റ് ചെയ്യാൻ സാധിക്കുന്നു:\n\n$$P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}$$\n\nമെഷീൻ ലേണിംഗിലെ Naive Bayes classifier, spam filtering, medical diagnosis എന്നിവയിൽ ഇത് വ്യാപകമായി ഉപയോഗിക്കുന്നു.",
    keyPoints: [
      "Bayes' formula: $\\text{Posterior} = \\frac{\\text{Likelihood} \\times \\text{Prior}}{\\text{Evidence}}$.",
      "Independent events satisfy $P(A \\cap B) = P(A) \\cdot P(B)$ and $P(A|B) = P(A)$.",
      "Mutually exclusive events satisfy $P(A \\cap B) = 0$.",
      "Naive Bayes assumes conditional independence of all features given the class label."
    ],
    examFocus: "Direct numericals on Bayes' theorem involving medical testing, factory defective components (Machines A, B, C), or card/marble scenarios."
  },

  "math-m3-t3": {
    simple: {
      idea: "Optimization algorithms search for the lowest point of a mathematical function (the cost or loss function) to find the best model parameters.",
      howItWorks: "Gradient Descent takes small iterative steps opposite to the first derivative (gradient). Newton's Method uses both the gradient and curvature (second derivative / Hessian matrix) to take direct, faster steps.",
      example: "Walking down a foggy hill to find the valley bottom: Gradient Descent checks which direction slopes downward underfoot and takes a small step; Newton's Method fits a parabola to the hill and jumps straight to the estimated bottom.",
      whyItMatters: "Almost all machine learning models (linear regression, logistic regression, deep neural networks) train by minimizing a loss function via gradient-based optimization."
    },
    steps: [
      "Step 1: Compute the Gradient — $\\nabla f(w)$, the vector of partial derivatives pointing in the direction of steepest ascent.",
      "Step 2: Gradient Descent Update Rule — $w_{t+1} = w_t - \\eta \\nabla f(w_t)$, where $\\eta$ is the learning rate.",
      "Step 3: Newton's Method Update Rule — $w_{t+1} = w_t - [H f(w_t)]^{-1} \\nabla f(w_t)$, where $H$ is the Hessian matrix of second derivatives.",
      "Step 4: Convergence Check — Stop when $|\\nabla f(w)| < \\epsilon$ or when loss stops changing."
    ],
    example: "Minimize $f(x) = x^2 - 4x + 7$. Gradient is $f'(x) = 2x - 4$. If start at $x_0 = 0$ with learning rate $\\eta = 0.1$:\n• $x_1 = 0 - 0.1(2(0) - 4) = 0.4$\n• $x_2 = 0.4 - 0.1(2(0.4) - 4) = 0.72$\nAfter multiple steps it converges to minimum at $x = 2$. Newton's method with $f''(x) = 2$ finds $x_1 = 0 - \\frac{-4}{2} = 2$ in a single step!",
    malayalam: "Machine Learning-ൽ Loss Function കുറയ്ക്കാനും model parameters (weights) ഏറ്റവും മികച്ചതാക്കാനും (optimize) ഉപയോഗിക്കുന്ന optimization algorithms ആണ് Gradient Descent-ഉം Newton's Method-ഉം.\n\nGradient Descent first-order derivative (gradient) ഉപയോഗിച്ച് ചരിവ് നോക്കി താഴേക്ക് നീങ്ങുമ്പോൾ ($w = w - \\eta \\nabla f(w)$), Newton's Method second-order derivative (Hessian matrix) ഉപയോഗിച്ച് function-ന്റെ curvature മനസ്സിലാക്കി കൂടുതൽ വേഗത്തിൽ minimum കണ്ടെത്തുന്നു.\n\nGradient Descent-ൽ learning rate $\\eta$ വളരെ വലുതായാൽ overshoot ചെയ്യും; ചെറുതായാൽ converge ചെയ്യാൻ ഒരുപാട് സമയമെടുക്കും.",
    keyPoints: [
      "Gradient Descent update: $w \\leftarrow w - \\eta \\nabla J(w)$. First-order convergence (linear).",
      "Newton's Method update: $w \\leftarrow w - H^{-1} \\nabla J(w)$. Second-order convergence (quadratic).",
      "Gradient Descent is computationally cheaper per step ($O(n)$) than Newton's Method ($O(n^3)$ matrix inversion for Hessian).",
      "Variants: Batch Gradient Descent, Stochastic Gradient Descent (SGD), Mini-batch Gradient Descent, and Adam."
    ],
    examFocus: "Be able to derive one step of Gradient Descent for a given quadratic function. Compare Gradient Descent vs. Newton's Method in terms of computational complexity, rate of convergence, and sensitivity to initial values."
  },

  // MACHINE LEARNING
  "ml-m1-t1": {
    simple: {
      idea: "Artificial Intelligence is the broad vision of creating smart machines; Machine Learning is the subset that enables computers to learn from data without explicit manual programming.",
      howItWorks: "Systems ingest past examples (features and labels), adjust mathematical weights using an optimization algorithm, and generalize patterns to make accurate predictions on unseen data.",
      example: "Traditional software is like a recipe book where the programmer writes every rule; Machine Learning is like showing an apprentice 1,000 photos of cakes until they can recognize a cake on their own.",
      whyItMatters: "Human programmers cannot manually write rules for complex tasks like facial recognition, speech translation, or autonomous vehicle navigation."
    },
    steps: [
      "Step 1: Supervised Learning — Learns from labeled datasets $(X, y)$ to predict targets (e.g., Regression for continuous values, Classification for discrete categories).",
      "Step 2: Unsupervised Learning — Discovers hidden structures and groupings in unlabeled data $X$ (e.g., Clustering, Dimensionality Reduction).",
      "Step 3: Semi-Supervised Learning — Combines a small set of labeled data with a large amount of unlabeled data to reduce annotation costs.",
      "Step 4: Reinforcement Learning — An agent learns optimal policy actions through trial, error, state observations, and reward signals."
    ],
    example: "Predicting house prices given square footage and bedrooms is Supervised Regression. Grouping customer shopping carts into marketing personas is Unsupervised Clustering. Training an AI agent to beat human chess grandmasters is Reinforcement Learning.",
    malayalam: "Artificial Intelligence (AI) എന്നത് മനുഷ്യരെപ്പോലെ ചിന്തിക്കാനും തീരുമാനങ്ങളെടുക്കാനും മെഷീനുകളെ പ്രാപ്തമാക്കുന്ന വിശാലമായ മേഖലയാണ്. അതിനുള്ളിൽ വരുന്ന ഒരു ഉപവിഭാഗമാണ് Machine Learning (ML).\n\nML-ൽ പ്രധാനമായും മൂന്ന് Learning Paradigms ഉണ്ട്:\n1. Supervised Learning: Labeled data ഉപയോഗിച്ച് പഠിക്കുന്നു (ഉദാ: spam detection, house price prediction).\n2. Unsupervised Learning: Labels ഇല്ലാതെ ഡാറ്റയിലെ hidden patterns അല്ലെങ്കിൽ clusters കണ്ടെത്തുന്നു (ഉദാ: customer segmentation via k-means).\n3. Reinforcement Learning: ഒരു agent കൃത്യമായ environment-ൽ actions ചെയ്ത് rewards & penalties വഴി പഠിക്കുന്നു (ഉദാ: robotics, game playing).",
    keyPoints: [
      "AI is the superset; ML is a subset; Deep Learning is a specialized subfield of ML using multi-layer neural networks.",
      "Supervised: maps input $X$ to labeled output $y$.",
      "Unsupervised: finds inherent patterns $p(X)$ without targets.",
      "Reinforcement: learns policy $\\pi(a|s)$ via reward maximization.",
      "Inductive Bias is the set of assumptions an algorithm uses to predict outputs on unseen inputs."
    ],
    examFocus: "Clear definition of AI vs. ML vs. DL. Detailed classification of Machine Learning Paradigms with standard examples and a taxonomy chart."
  },

  "ml-m2-t3": {
    simple: {
      idea: "Logistic Regression is a foundational classification algorithm that calculates the probability that an input belongs to a specific category (such as Spam vs. Not Spam).",
      howItWorks: "It passes a standard linear equation ($z = w^T x + b$) through a non-linear S-shaped Sigmoid function, which squashes any real value into a valid probability between 0 and 1.",
      example: "Predicting if a patient has diabetes based on blood glucose level: if the calculated probability is 0.82 (above the 0.5 decision threshold), the system classifies the result as Positive.",
      whyItMatters: "It provides clear probabilistic confidence and interpretable feature weights, making it a staple in healthcare, credit scoring, and industry analytics."
    },
    steps: [
      "Step 1: Linear Combination — Compute $z = w_1 x_1 + w_2 x_2 + \\dots + b = w^T x + b$.",
      "Step 2: Sigmoid Activation — Pass $z$ through $\\sigma(z) = \\frac{1}{1 + e^{-z}}$, giving probability $\\hat{y} \\in (0, 1)$.",
      "Step 3: Decision Boundary — If $\\sigma(z) \\ge 0.5$ (meaning $z \\ge 0$), classify as class 1; otherwise class 0.",
      "Step 4: Loss Function — Minimize Binary Cross-Entropy Loss: $J(w) = -\\frac{1}{m} \\sum [y \\log(\\hat{y}) + (1-y) \\log(1-\\hat{y})]$ via Gradient Descent."
    ],
    example: "Suppose for loan approval, $z = 0.5(\\text{Income}) - 2(\\text{Debt}) + 1$. For an applicant with Income=6 and Debt=2: $z = 0.5(6) - 2(2) + 1 = 3 - 4 + 1 = 0$. Sigmoid $\\sigma(0) = \\frac{1}{1 + e^{-0}} = 0.5$. The applicant sits exactly on the Decision Boundary!",
    malayalam: "Logistic Regression എന്നത് classification പ്രശ്നങ്ങൾ പരിഹരിക്കാൻ ഉപയോഗിക്കുന്ന ഒരു supervised machine learning algorithm ആണ്. ഇതിൽ outcome ഒരു discrete value (ഉദാ: 0 അല്ലെങ്കിൽ 1, Yes അല്ലെങ്കിൽ No) ആയിരിക്കും.\n\nLinear regression-ൽ output $(-\\infty, \\infty)$ ആകാം; എന്നാൽ Logistic regression-ൽ Sigmoid function $(\\sigma(z) = \\frac{1}{1 + e^{-z}})$ ഉപയോഗിച്ച് output-നെ 0-നും 1-നും ഇടയിലുള്ള ഒരു probability ആക്കി മാറ്റുന്നു.\n\nഈ probability 0.5-ൽ കൂടുതൽ ആണെങ്കിൽ class 1 ആയും, കുറവാണെങ്കിൽ class 0 ആയും Decision Boundary വെച്ച് classify ചെയ്യുന്നു. Error കണക്കാക്കാൻ Binary Cross-Entropy Loss ഉപയോഗിക്കുന്നു.",
    keyPoints: [
      "Sigmoid formula: $\\sigma(z) = \\frac{1}{1 + e^{-z}}$, with derivative $\\sigma'(z) = \\sigma(z)(1 - \\sigma(z))$.",
      "The decision boundary is linear: $w^T x + b = 0$ (at threshold probability 0.5).",
      "Does NOT use Mean Squared Error because MSE produces a non-convex loss surface with local minima when paired with Sigmoid.",
      "Uses Binary Cross-Entropy (Log Loss) which is convex and guarantees convergence to global minimum."
    ],
    examFocus: "Draw the Sigmoid curve, derive the decision boundary condition ($w^T x + b = 0$), and explain why Binary Cross-Entropy is preferred over Mean Squared Error for classification."
  },

  "ml-m3-t2": {
    simple: {
      idea: "k-Means is an unsupervised clustering algorithm that partitions unlabeled data points into 'k' distinct clusters based on similarity and geometric distance.",
      howItWorks: "It places $k$ center points (centroids), assigns each data point to its nearest centroid, recalculates centroids as the average of assigned points, and repeats until centroids stop moving.",
      example: "Setting up 3 pizza delivery hubs across a city: you want each customer assigned to their closest store, and you reposition the stores so total travel distance across all deliveries is minimized.",
      whyItMatters: "Widely used for customer market segmentation, document clustering, image compression, and anomaly detection."
    },
    steps: [
      "Step 1: Choose $k$ & Initialize Centroids — Pick $k$ initial cluster centroids (randomly or using k-Means++).",
      "Step 2: Assignment Step — Assign every data point $x_i$ to its nearest centroid using Euclidean distance: $\\text{argmin}_j \\|x_i - \\mu_j\\|^2$.",
      "Step 3: Update Step — Recalculate each centroid $\\mu_j$ as the arithmetic mean of all points assigned to that cluster.",
      "Step 4: Convergence — Repeat Steps 2 and 3 until centroids stabilize (no reassignments) or maximum iterations reached."
    ],
    example: "For points (2, 2), (2, 4), (10, 8), (10, 10) with $k=2$: Centroid 1 at (2, 3) captures the first pair; Centroid 2 at (10, 9) captures the second pair. The total Within-Cluster Sum of Squares (WCSS) is minimized.",
    malayalam: "k-Means എന്നത് unlabeled data-യെ സമാനതകളുടെ അടിസ്ഥാനത്തിൽ 'k' ഗ്രൂപ്പുകളായി (clusters) തിരിക്കുന്ന ഒരു Unsupervised Learning algorithm ആണ്.\n\nപ്രവർത്തനം 4 ലളിതമായ ഘട്ടങ്ങളിലാണ്:\n1. $k$ centroids ക്രമീകരിക്കുക.\n2. ഓരോ data point-നെയും ഏറ്റവും അടുത്തുള്ള centroid-ലേക്ക് assign ചെയ്യുക (Euclidean distance ഉപയോഗിച്ച്).\n3. ഓരോ cluster-ലെയും points-ന്റെ ശരാശരി (mean) എടുത്ത് centroids update ചെയ്യുക.\n4. Centroids മാറാതെ വരുന്നതുവരെ (convergence) ഇത് ആവർത്തിക്കുക.\n\nഏറ്റവും അനുയോജ്യമായ $k$ കണ്ടെത്താൻ 'Elbow Method' ഉപയോഗിക്കുന്നു.",
    keyPoints: [
      "Objective: Minimize Within-Cluster Sum of Squares (WCSS) / Inertia: $\\sum_{j=1}^k \\sum_{x \\in C_j} \\|x - \\mu_j\\|^2$.",
      "Optimal $k$ is determined using the Elbow Method or Silhouette Score.",
      "Sensitive to initial centroid placement (can get trapped in local minima); solved by k-Means++.",
      "Sensitive to outliers and assumes clusters are spherical and equal in size."
    ],
    examFocus: "Work out one manual iteration of k-Means clustering on a 1D or 2D dataset with $k=2$. Explain the Elbow method for choosing $k$."
  },

  "ml-m4-t4": {
    simple: {
      idea: "A Perceptron is the fundamental building block of artificial neural networks, and Backpropagation is the training algorithm that teaches multi-layer networks by adjusting weights in reverse based on errors.",
      howItWorks: "During forward propagation, inputs multiply by weights, sum up, and pass through an activation function to generate an output. During backpropagation, the chain rule of calculus passes the error backward to adjust every weight.",
      example: "Like learning to play darts: you throw a dart (forward pass), see it landed 4 inches to the left (compute error), and adjust your shoulder and elbow muscle tension accordingly for the next throw (backpropagation).",
      whyItMatters: "Backpropagation enabled the training of deep neural networks, laying the foundation for modern computer vision, natural language processing, and generative AI."
    },
    steps: [
      "Step 1: Forward Pass — Compute net inputs $z^{(l)} = W^{(l)} a^{(l-1)} + b^{(l)}$ and activations $a^{(l)} = g(z^{(l)})$.",
      "Step 2: Error Calculation — Compute loss at output layer (e.g., $L = \\frac{1}{2} (y - \\hat{y})^2$).",
      "Step 3: Backward Pass via Chain Rule — Calculate gradients $\\frac{\\partial L}{\\partial W^{(l)}} = \\delta^{(l)} (a^{(l-1)})^T$, propagating error terms $\\delta$ from output to input.",
      "Step 4: Weight Update — Adjust weights: $W^{(l)} \\leftarrow W^{(l)} - \\eta \\frac{\\partial L}{\\partial W^{(l)}}$."
    ],
    example: "Single Perceptron cannot solve the XOR problem because XOR is not linearly separable. A Multi-Layer Perceptron (MLP) with at least one hidden non-linear layer solves XOR, and Backpropagation calculates how to adjust both hidden and output weights simultaneously.",
    malayalam: "Perceptron എന്നത് biological neuron-നെ മാതൃകയാക്കി നിർമ്മിച്ച ഏറ്റവും ലളിതമായ artificial neural network unit ആണ്. ഇതിൽ inputs-നെ weights കൊണ്ട് multiply ചെയ്ത് activation function വഴി output കണ്ടെത്തുന്നു.\n\nഒരു single perceptron-ന് linear separation മാത്രമേ ചെയ്യാൻ കഴിയൂ (XOR problem പരിഹരിക്കാൻ കഴിയില്ല). അതിനായി ഒന്നിൽക്കൂടുതൽ layers ഉള്ള Multi-Layer Perceptron (MLP) വേണം.\n\nBackpropagation എന്നത് output-ൽ ഉണ്ടാകുന്ന error തിരിച്ചറിഞ്ഞ്, calculus-ലെ Chain Rule ഉപയോഗിച്ച് output layer-ൽ നിന്ന് input layer-ലേക്ക് backward ആയി സഞ്ചരിച്ച് weights update ചെയ്യുന്ന algorithm ആണ്.",
    keyPoints: [
      "Perceptron equation: $y = f\\left(\\sum w_i x_i + b\\right)$.",
      "Single-layer Perceptrons can only represent linearly separable logic functions (AND, OR), not non-linear ones (XOR).",
      "Backpropagation computes $\\nabla_W L$ using the calculus chain rule.",
      "Vanishing Gradient problem can occur in deep networks using Sigmoid/Tanh activations; mitigated by using ReLU activations."
    ],
    examFocus: "Derive the weight update rule for a 2-layer neural network using the Chain Rule of calculus. Explain the XOR limitation of the single-layer perceptron."
  }
};

// ============================================================================
// 2. HELPER GENERATOR FOR ANY OF THE 64 SYLLABUS TOPICS
// ============================================================================

/**
 * Fallback contextual knowledge synthesizer for any syllabus topic
 */
function getTopicSynthesizedKnowledge(topic) {
  if (!topic) return null;
  const curated = CURATED_TUTOR_KNOWLEDGE[topic.id];
  if (curated) return curated;

  const title = topic.title || "this topic";
  const desc = topic.description || "A core academic topic in the Semester V syllabus.";
  const keyConcepts = topic.keyConcepts || ["Core Architecture", "Working Principles", "Application Areas"];

  return {
    simple: {
      idea: `${title} is an essential concept designed to solve specific challenges in computer science and data systems.`,
      howItWorks: `It establishes clear structural rules and algorithmic workflows: ${desc}`,
      example: `Consider a real-world scenario where multiple inputs require processing: ${title} coordinates the components to produce verified outputs.`,
      whyItMatters: `Mastering this enables you to tackle both theoretical university questions and practical software engineering problems.`
    },
    steps: [
      `Step 1: Understand the Core Objective — Identify what problem ${title} solves.`,
      `Step 2: Key Components — Review the primary components: ${keyConcepts.slice(0, 2).join(", ")}.`,
      `Step 3: Operational Flow — Walk through how data traverses the system.`,
      `Step 4: Output & Evaluation — Measure performance, efficiency, and verify edge cases.`
    ],
    example: `In a standard engineering system implementing ${title}, the input is structured into formal parameters, evaluated through the rules of ${keyConcepts[0] || "the algorithm"}, and stored or transmitted reliably.`,
    malayalam: `${title} എന്നത് നിങ്ങളുടെ Semester V സിലബസിലെ പ്രധാനപ്പെട്ട ഒരു വിഷയമാണ്.\n\nഇതിന്റെ പ്രധാന തത്വം: ${desc}\n\nഈ കോൺസെപ്റ്റിലെ പ്രധാന കാര്യങ്ങൾ:\n` +
      keyConcepts.map(c => `• ${c}`).join("\n") +
      `\n\nപരീക്ഷയ്ക്ക് ഈ വിഷയത്തിന്റെ definition, പ്രധാന ഘട്ടങ്ങൾ, ഒരു ഉദാഹരണം എന്നിവ വ്യക്തമായി എഴുതുന്നത് ഉയർന്ന മാർക്ക് നേടാൻ സഹായിക്കും.`,
    keyPoints: [
      `Definition: ${desc}`,
      `Key element: ${keyConcepts[0] || "Structured protocol/algorithm execution"}`,
      `Operational factor: ${keyConcepts[1] || "Computational complexity and reliability"}`,
      `Standard university evaluation: Focus on diagrams and comparative analysis.`
    ],
    examFocus: `Be ready to define ${title}, outline its key steps (${keyConcepts.slice(0, 3).join(", ")}), and draw a clean architectural diagram for 5 or 7 mark questions.`
  };
}

// ============================================================================
// 3. CORE EXPORTED SERVICE FUNCTIONS (MATCHING PROMPT SPECIFICATION)
// ============================================================================

/**
 * 1. askTutor - Context-aware multi-turn conversational tutor
 * 
 * Supports queries like:
 * - "Explain this simply"
 * - "Give me an example"
 * - "Explain this in Malayalam"
 * - "What is the difference between these?"
 * - "Why is this important?"
 * - "Give me practice questions"
 * - "Explain my mistake"
 * - "Summarize this topic"
 * - "Quiz me"
 * - Follow-up questions resolving pronouns like "this", "it"
 */
/**
 * Check Gemini AI Tutor backend status and configuration
 * @returns {Promise<{ configured: boolean, model: string, status: string, message: string }>}
 */
export async function getTutorBackendStatus() {
  const res = await apiGet("/api/tutor/status");
  if (res.ok && res.data) {
    return res.data;
  }
  return {
    configured: false,
    model: "gemini-3.5-flash",
    status: "offline",
    message: res.error || "Backend server not responding",
    instructions: "Ensure backend is running (python -m uvicorn backend.app.main:app) and GEMINI_API_KEY is configured in backend/.env."
  };
}

/**
 * 1. askTutor - Context-aware multi-turn conversational tutor calling real Gemini API
 */
export async function askTutor({ subject, module, topic, prompt, history = [], actionMode = null, quizContext = null }) {
  if (!topic) {
    return {
      reply: "Please select a topic first so I can provide accurate, contextual guidance!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestions: ["Choose a topic", "Browse syllabus"]
    };
  }

  // Detect requested mode from prompt keywords if not explicitly specified
  let mode = actionMode;
  const promptLower = (prompt || "").toLowerCase();
  if (!mode) {
    if (promptLower.includes("malayalam")) mode = "malayalam";
    else if (promptLower.includes("step by step") || promptLower.includes("teach me")) mode = "step_by_step";
    else if (promptLower.includes("simply") || promptLower.includes("simple")) mode = "simple";
    else if (promptLower.includes("example") || promptLower.includes("analogy")) mode = "example";
    else if (promptLower.includes("exam") || promptLower.includes("university")) mode = "exam_prep";
    else if (promptLower.includes("summary") || promptLower.includes("summarize")) mode = "summary";
  }

  const payload = {
    message: prompt,
    history: (history || []).slice(-6).map((h) => ({
      role: h.sender === "student" || h.role === "user" ? "user" : "model",
      content: h.text || h.content || ""
    })),
    context: {
      subject_id: subject?.id || topic?.subjectId,
      subject_name: subject?.name,
      subject_code: subject?.code,
      module_id: module?.id || topic?.moduleId,
      module_title: module?.title,
      topic_id: topic?.id,
      topic_title: topic?.title,
      topic_explanation: topic?.explanation || topic?.why_it_matters,
      exam_focus: topic?.exam_focus,
      action_mode: mode,
      question_text: quizContext?.questionText,
      student_answer: quizContext?.studentAnswer,
      correct_answer: quizContext?.correctAnswer,
      question_explanation: quizContext?.explanation
    }
  };

  try {
    const res = await apiPost("/api/tutor/chat", payload, { timeout: 60000 });

    if (res.ok && res.data) {
      return {
        reply: res.data.reply,
        model: res.data.model || "gemini-3.5-flash",
        timestamp: res.data.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestions: res.data.suggestions || [
          "Explain step by step",
          "Give me an example",
          "Prepare an exam answer",
          "Explain in Malayalam",
          "Quiz me on this topic"
        ],
        isGemini: true,
        contextGrounded: res.data.context_grounded
      };
    }

    // Backend returned an error - classify accurately
    const errText = res.error || "";
    const errLower = errText.toLowerCase();

    // 1. Invalid or missing API key
    const isKeyUnsetOrInvalid =
      res.status === 401 ||
      (errLower.includes("not configured") && !errLower.includes("overload")) ||
      (errText.includes("GEMINI_API_KEY") && errLower.includes("not set")) ||
      errLower.includes("invalid gemini api key") ||
      errLower.includes("permission denied") ||
      errLower.includes("api_key_invalid");

    // 2. Model overload / high demand (503)
    const isModelOverloaded =
      res.status === 503 ||
      errLower.includes("high demand") ||
      errLower.includes("unavailable") ||
      errLower.includes("overloaded") ||
      errLower.includes("demand spikes");

    // 3. Rate limit / quota (429)
    const isRateLimited =
      res.status === 429 ||
      errLower.includes("rate limit") ||
      errLower.includes("quota") ||
      errLower.includes("resource_exhausted") ||
      errLower.includes("too many requests");

    // 4. Timeout / gateway timeout (504)
    const isTimeout =
      res.status === 504 ||
      errLower.includes("timed out") ||
      errLower.includes("timeout") ||
      errLower.includes("deadline exceeded");

    if (isKeyUnsetOrInvalid) {
      return {
        reply: "### ⚠️ Gemini AI Tutor Configuration Required\n\n" +
          "Your question reached the StudySense AI backend, but **`GEMINI_API_KEY`** is not configured or was rejected by Google in `backend/.env`.\n\n" +
          "**To activate your Gemini AI Tutor:**\n" +
          "1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).\n" +
          "2. Open `backend/.env` in your project.\n" +
          "3. Set your key:\n" +
          "```env\nGEMINI_API_KEY=your_gemini_api_key_here\nGEMINI_MODEL=gemini-3.5-flash\n```\n" +
          "4. Click **Retry** below to chat with Gemini!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestions: ["How to configure Gemini API key", "Retry connection"],
        isError: true,
        errorType: "missing_api_key",
        rawError: errText
      };
    }

    if (isModelOverloaded) {
      return {
        reply: "### ⏳ Gemini Model High Demand\n\n" +
          "Google's Gemini model servers are currently experiencing high global traffic spikes. " +
          "The backend automatically attempted retries and model fallbacks, but the upstream model remains temporarily unavailable.\n\n" +
          "Please click **Try Again** in a few moments.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestions: ["Try Again", "Explain step by step", "Give me an example"],
        isError: true,
        errorType: "model_overloaded",
        rawError: errText
      };
    }

    if (isRateLimited) {
      return {
        reply: "### 🚦 Rate Limit Exceeded\n\n" +
          "Your Gemini API rate limit or request quota has been reached. Please pause a moment before asking another question.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestions: ["Try Again", "Summarize topic"],
        isError: true,
        errorType: "rate_limited",
        rawError: errText
      };
    }

    if (isTimeout) {
      return {
        reply: "### ⏱️ Request Timed Out\n\n" +
          "The request to Google's Gemini servers timed out while waiting for a response. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestions: ["Try Again", "Give me an example"],
        isError: true,
        errorType: "timeout",
        rawError: errText
      };
    }

    return {
      reply: `### ⚠️ Gemini Tutor Service Notice\n\n${errText || "Backend service encountered an unexpected error."}\n\nPlease click **Try Again** below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestions: ["Try Again"],
      isError: true,
      errorType: "provider_error",
      rawError: errText
    };
  } catch (err) {
    return {
      reply: `### 🔌 Backend Connection Issue\n\nCould not reach the StudySense AI backend. Please verify that the backend server is running on port 8000.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestions: ["Retry connection"],
      isError: true,
      errorType: "network_error"
    };
  }
}

/**
 * 2. explainTopic - General academic overview
 */
export async function explainTopic(topic, subject) {
  return askTutor({ subject, topic, prompt: "Explain this topic thoroughly", actionMode: "exam_prep" });
}

/**
 * 3. explainSimply - Beginner-friendly breakdown
 */
export async function explainSimply(topic) {
  return askTutor({ topic, prompt: "Explain this topic simply with an analogy", actionMode: "simple" });
}

/**
 * 4. giveExample - Concrete practical example
 */
export async function giveExample(topic) {
  return askTutor({ topic, prompt: "Give me a real-world engineering example of this topic", actionMode: "example" });
}

/**
 * 5. explainStepByStep - Algorithmic / sequential explanation
 */
export async function explainStepByStep(topic) {
  return askTutor({ topic, prompt: "Explain this topic step by step", actionMode: "step_by_step" });
}

/**
 * 6. getKeyPoints - Concise revision bullet points
 */
export async function getKeyPoints(topic) {
  return askTutor({ topic, prompt: "Give me the key revision points for this topic", actionMode: "summary" });
}

/**
 * 7. getExamFocus - University exam preparation advice
 */
export async function getExamFocus(topic) {
  return askTutor({ topic, prompt: "Prepare an exam answer format for this topic", actionMode: "exam_prep" });
}

/**
 * 8. generateSummary - High-yield short revision summary
 */
export async function generateSummary(topic) {
  return askTutor({ topic, prompt: "Summarize this topic concisely", actionMode: "summary" });
}

/**
 * 9. explainInMalayalam - Bilingual explanation
 */
export async function explainInMalayalam(topic) {
  return askTutor({ topic, prompt: "Explain this topic in Malayalam (മലയാളത്തിൽ വിശദീകരിക്കുക)", actionMode: "malayalam" });
}

/**
 * 10. explainAnswer - Connects AI Tutor with Quiz mistake diagnosis
 */
export async function explainAnswer({ topic, question, studentAnswer, correctAnswer }) {
  const prompt = `Explain why my answer was wrong for the question: "${question?.question || ''}". My choice was: "${studentAnswer || ''}". The correct answer is: "${correctAnswer || ''}".`;
  return askTutor({
    topic,
    prompt,
    actionMode: "mistake_diagnosis",
    quizContext: {
      questionText: question?.question,
      studentAnswer,
      correctAnswer,
      explanation: question?.explanation
    }
  });
}


/**
 * 11. generateQuestions - AI Question Generator
 * 
 * Generates questions matching the exact schema of the Practice & Quiz Engine:
 * {
 *   id,
 *   topicId,
 *   subjectId,
 *   moduleId,
 *   question,
 *   type,
 *   marks,
 *   options,
 *   correctAnswer,
 *   explanation,
 *   difficulty,
 *   source: "ai"
 * }
 */
export async function generateQuestions(topic, count = 5, format = "Quick Practice", options = {}) {
  if (!topic) return [];
  const safeCount = Math.min(10, Math.max(1, Number(count) || 5));

  // Attempt real Gemini question generation via backend first
  try {
    const res = await apiPost("/api/tutor/generate-questions", {
      topic_id: topic.id,
      subject_id: topic.subjectId,
      module_id: topic.moduleId,
      count: safeCount,
      format
    }, { timeout: 60000 });

    if (res.ok && res.data && Array.isArray(res.data.questions) && res.data.questions.length > 0) {
      return res.data.questions.map((q) => ({
        id: q.id,
        topicId: q.topic_id || topic.id,
        subjectId: q.subject_id || topic.subjectId,
        moduleId: q.module_id || topic.moduleId,
        question: q.question,
        type: q.type || "multiple_choice",
        marks: q.marks || 1,
        options: q.options,
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty || "medium",
        source: "gemini_ai"
      }));
    }

    if (!res.ok) {
      const errMsg = res.error || `Question generation failed (HTTP ${res.status}).`;
      if (!options.fallbackToLocal) {
        throw new Error(errMsg);
      }
    }
  } catch (err) {
    if (!options.fallbackToLocal) {
      throw err;
    }
  }

  const topicId = topic.id;
  const subjectId = topic.subjectId || "cs-cn";
  const moduleId = topic.moduleId || "cn-m1";
  const title = topic.title || "Topic";
  const difficulty = topic.difficulty || "medium";

  // Mark weight based on practice format
  let marks = 1;
  if (format.includes("3 Mark")) marks = 3;
  else if (format.includes("5 Mark")) marks = 5;
  else if (format.includes("7 Mark")) marks = 7;
  else if (format.includes("10 Mark")) marks = 10;

  // Synthesize customized AI-generated question items
  const generated = [];
  const templates = [

    {
      q: `Which of the following best defines the primary objective of ${title}?`,
      opts: [
        `To coordinate structured execution and enforce system constraints in ${title}`,
        `To bypass lower-level protocols without state verification`,
        `To execute arbitrary hardware interruptions regardless of system safety`,
        `To replace physical transmission media with purely theoretical abstractions`
      ],
      correct: 0,
      why: `${title} is fundamentally designed to provide deterministic coordination and structured protocol guarantees.`
    },
    {
      q: `True or False: In ${title}, performance optimization can be achieved while completely ignoring boundary error states.`,
      opts: [`False`, `True`],
      correct: 0,
      type: "true_false",
      why: `False. Robust implementations of ${title} must explicitly handle edge conditions and error boundaries.`
    },
    {
      q: `What is the most critical operational factor when evaluating the efficiency of ${title}?`,
      opts: [
        `Minimizing computational overhead and maintaining consistency`,
        `Maximizing random latency variations`,
        `Ignoring resource contention across parallel nodes`,
        `Permanently hardcoding fixed network addresses`
      ],
      correct: 0,
      why: `Efficiency hinges on minimizing overhead while ensuring operational convergence and consistency.`
    },
    {
      q: `In a standard engineering scenario, what happens when ${title} encounters an unexpected input deviation?`,
      opts: [
        `It triggers structured fallback or boundary rejection`,
        `It silently outputs corrupted states without error notification`,
        `It permanently halts all subsequent system operations`,
        `It inverts the entire system architecture`
      ],
      correct: 0,
      why: `Standard specifications require graceful boundary handling and exception signaling.`
    },
    {
      q: `Which parameter directly influences convergence or optimal output in ${title}?`,
      opts: [
        `The calibrated adjustment rate and state initialization`,
        `The physical color of the host enclosure`,
        `The arbitrary font selected for system logs`,
        `The clock speed of unrelated peripheral devices`
      ],
      correct: 0,
      why: `Accurate calibration and valid initial state conditions are essential for optimal convergence.`
    },
    {
      q: `True or False: The principles governing ${title} are exclusive to one vendor and cannot be standardized.`,
      opts: [`False`, `True`],
      correct: 0,
      type: "true_false",
      why: `False. The syllabus topics represent standardized, open computer science and mathematical principles.`
    },
    {
      q: `When structuring an exam answer for a ${marks}-mark question on ${title}, what should always be included?`,
      opts: [
        `Formal definition, key working mechanism, and a relevant diagram or formula`,
        `Personal opinions without technical definitions`,
        `Only non-technical metaphors without equations or protocols`,
        `Empty bullet points without explanatory text`
      ],
      correct: 0,
      why: `University evaluators award top marks for a clear definition, working mechanism, and architectural diagram.`
    },
    {
      q: `What trade-off is commonly encountered when scaling ${title}?`,
      opts: [
        `Balancing execution speed against algorithmic / memory complexity`,
        `Infinite speed without any energy or memory requirement`,
        `Complete immunity to all hardware failure modes`,
        `Zero reliance on input data quality`
      ],
      correct: 0,
      why: `Engineering solutions inherently balance execution throughput with memory and processing overhead.`
    },
    {
      q: `How does ${title} maintain integrity across multi-stage execution?`,
      opts: [
        `Through continuous verification and state checkpointing`,
        `By discarding previous stage results without validation`,
        `By randomizing intermediate data outputs`,
        `By preventing all logging mechanisms`
      ],
      correct: 0,
      why: `Multi-stage reliability requires deterministic state validation at each transition.`
    },
    {
      q: `In the context of the Semester V curriculum, which subject area does ${title} primarily contribute to?`,
      opts: [
        `Core theoretical foundations and practical system implementation`,
        `Recreational gaming and informal chat platforms`,
        `Commercial print advertising layout`,
        `Non-technical administrative filing`
      ],
      correct: 0,
      why: `This topic forms a core pillar of your academic computer science degree curriculum.`
    }
  ];

  const targetCount = Math.min(count, templates.length);
  for (let i = 0; i < targetCount; i++) {
    const tmpl = templates[i];
    generated.push({
      id: `ai-gen-${topicId}-${Date.now()}-${i + 1}`,
      topicId,
      subjectId,
      moduleId,
      question: tmpl.q,
      type: tmpl.type || "multiple_choice",
      marks,
      options: tmpl.opts,
      correctAnswer: tmpl.correct,
      explanation: tmpl.why,
      difficulty,
      source: "ai"
    });
  }

  return generated;
}

// ============================================================================
// 4. FUTURE REAL AI API INTEGRATION ARCHITECTURE (ZERO CLIENT API KEYS)
// ============================================================================

/**
 * Architectural placeholder demonstrating how StudySense AI will connect to
 * a secure backend proxy or Gemini API in future phases.
 * 
 * Flow:
 * Client UI -> aiService -> /api/tutor (Backend Proxy) -> LLM Provider (Gemini 1.5)
 * 
 * SECURITY GUARANTEE: No secret API keys are ever stored or exposed in client frontend code.
 */
export async function _callBackendLLMProxy({ prompt, context, endpoint = "/api/tutor" }) {
  /*
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, context })
  });
  if (!response.ok) throw new Error("Backend AI service error");
  return await response.json();
  */
  throw new Error("Backend LLM endpoint not configured in prototype mode. Using Mock AI engine.");
}
