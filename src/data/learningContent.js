/**
 * StudySense AI - Comprehensive Learning Content Bank
 * Contains complete learning modules for all 64 Semester V Prototype Topics.
 * Every topic implements the 7 mandatory pedagogical sections:
 * 1. Understand (Core concept & definitions)
 * 2. Why It Matters (Real-world intuition & engineering significance)
 * 3. How It Works (Algorithmic / structural breakdown)
 * 4. Example (Concrete worked scenario)
 * 5. Key Points (High-yield summary bullets)
 * 6. Exam Focus (Important KTU university questions & traps)
 */
import { TOPIC_EXAMPLES } from "./topicExamples.js";

export const LEARNING_CONTENT = {
  "cn-m1-t1": {
    "topicId": "cn-m1-t1",
    "title": "OSI and TCP/IP Reference Models",
    "subjectCode": "24CST501",
    "subjectName": "Computer Networks",
    "moduleTitle": "Module I — Physical & Data Link Layers",
    "estimatedMinutes": 45,
    "difficulty": "medium",
    "understand": {
      "title": "Let's understand it",
      "headline": "The universal blueprints for how computers communicate",
      "problemSolved": "In the early days of computing, IBM computers could only communicate with other IBM machines, and DEC computers could only talk to DEC machines. To connect the world into a single cohesive network, engineers needed a universal standard so different hardware, operating systems, and media could seamlessly exchange data.",
      "routerDecision": "The solution was layering: breaking the massive, complicated problem of network communication into independent, manageable modules where each layer has a distinct responsibility.",
      "terminology": [
        {
          "term": "Layering",
          "def": "Dividing network tasks into distinct hierarchical levels where each level serves the layer above it."
        },
        {
          "term": "Encapsulation",
          "def": "Packaging data with protocol headers (metadata) as it travels downwards from the Application to Physical layer."
        },
        {
          "term": "De-encapsulation",
          "def": "Stripping off headers layer-by-layer as incoming data travels upwards on the destination computer."
        },
        {
          "term": "PDU (Protocol Data Unit)",
          "def": "The formatted packet at each layer: Data (App) → Segment (Transport) → Packet (Network) → Frame (Data Link) → Bits (Physical)."
        }
      ],
      "summaryTakeaway": "Think of reference models like international shipping regulations: whether sending letters or freight, every package follows the same standardized handling steps."
    },
    "whyItMatters": {
      "analogy": "Imagine writing an overseas letter. You write your message (Application layer), place it in an envelope with addressing (Transport/Network), and the post office puts it in a bulk sorting container (Data Link), which gets loaded onto an airplane (Physical). You don't need to know how the airplane engine works just to write a letter!",
      "academicConnection": "Modular layering allows computer scientists to invent new physical media (like 5G or fiber optics) without rewriting web browsers, video streaming protocols, or operating system apps."
    },
    "howItWorks": {
      "category": "conceptual",
      "overview": "Comparison of the theoretical 7-layer OSI model versus the practical 4-layer TCP/IP internet protocol suite.",
      "steps": [
        {
          "step": 1,
          "title": "Application & User Interaction",
          "content": "OSI Layers 7 (Application), 6 (Presentation), and 5 (Session) are consolidated into a single Application layer in TCP/IP (HTTP, DNS, SMTP, SSH)."
        },
        {
          "step": 2,
          "title": "End-to-End Transport",
          "content": "Layer 4 (Transport): Manages process-to-process delivery, flow control, and reliability via TCP (reliable, connection-oriented) or UDP (fast, connectionless)."
        },
        {
          "step": 3,
          "title": "Logical Addressing & Routing",
          "content": "Layer 3 (Network / Internet): Assigns IP addresses, routes packets across multiple networks, and resolves best paths (IP, ICMP, ARP)."
        },
        {
          "step": 4,
          "title": "Hardware Link & Physical Transmission",
          "content": "Layers 2 & 1 (Data Link & Physical): Combined into Network Access in TCP/IP. Handles MAC addressing, framing, collision detection, and electrical/optical bit signaling."
        }
      ],
      "comparison": {
        "headers": [
          "Characteristic",
          "OSI Model (ISO)",
          "TCP/IP Suite (DoD)"
        ],
        "rows": [
          [
            "Number of Layers",
            "7 Layers",
            "4 Layers"
          ],
          [
            "Nature",
            "Theoretical architectural guideline",
            "Practical, working protocol standard"
          ],
          [
            "Protocol Independence",
            "Developed before protocols were invented",
            "Protocols were invented first, model followed"
          ],
          [
            "Transport Support",
            "Connectionless & Connection-oriented",
            "Connectionless (UDP) & Connection-oriented (TCP)"
          ]
        ]
      }
    },
    "example": {
      "title": "Encapsulation Flow: Loading a Web Page (HTTP GET)",
      "scenario": "A user types 'https://example.com' into a web browser. Here is how data moves down the sender's stack:",
      "steps": [
        {
          "stage": "Layer 7 (Application)",
          "details": "Browser generates an HTTP GET request payload: 'GET /index.html'."
        },
        {
          "stage": "Layer 4 (Transport)",
          "details": "TCP adds a 20-byte header with Source Port 54321 and Destination Port 443 + Sequence Numbers."
        },
        {
          "stage": "Layer 3 (Network)",
          "details": "IP layer adds an IP header with Source IP (192.168.1.10) and Destination IP (93.184.216.34)."
        },
        {
          "stage": "Layer 2 (Data Link)",
          "details": "Ethernet adds MAC header (Source MAC, Next Router MAC) and a CRC checksum trailer."
        },
        {
          "stage": "Layer 1 (Physical)",
          "details": "Frame is converted into electromagnetic or optical pulses and transmitted over wire/air."
        }
      ],
      "keyInsight": "Each layer only talks to its peer layer on the remote system, completely oblivious to how lower layers deliver the payload."
    },
    "keyPoints": [
      "The OSI model has 7 layers: Please Do Not Throw Sausage Pizza Away (Physical, Data Link, Network, Transport, Session, Presentation, Application).",
      "The TCP/IP model has 4 layers: Network Access, Internet, Transport, Application.",
      "Encapsulation moves top-down (adding headers); de-encapsulation moves bottom-up (stripping headers).",
      "Network Layer handles host-to-host delivery (IP addresses); Transport Layer handles process-to-process delivery (Port numbers).",
      "Data Link layer uses MAC addresses for local hop-to-hop physical delivery."
    ],
    "examFocus": {
      "skills": [
        "Draw and compare the 7-layer OSI model and 4-layer TCP/IP protocol suite side-by-side.",
        "Explain the functions of each layer with representative protocols.",
        "Describe the data encapsulation and de-encapsulation cycle with a diagram.",
        "Differentiate between Host-to-Host, Process-to-Process, and Node-to-Node delivery."
      ],
      "commonTraps": "Students often swap the positions of the Session and Presentation layers. Remember that Presentation handles encryption/compression, while Session handles communication dialogs."
    },
    "selfCheck": {
      "question": "Which OSI layer is responsible for end-to-end process-to-process communication using port numbers?",
      "options": [
        "Physical Layer",
        "Data Link Layer",
        "Network Layer",
        "Transport Layer"
      ],
      "answer": "Transport Layer",
      "explanation": "The Transport Layer (Layer 4) uses port numbers (e.g. 80 for HTTP, 443 for HTTPS) to distinguish between concurrent processes on the same host and ensure reliable end-to-end data transfer."
    },
    "nextRecommendedTopic": {
      "topicId": "cn-m2-t2",
      "title": "Routing Algorithms",
      "reason": "Now that you understand the Network Layer's role in the protocol stack, dive into how routers actually discover and select optimal paths."
    }
  },
  "cn-m2-t2": {
    "topicId": "cn-m2-t2",
    "title": "Routing Algorithms",
    "subjectCode": "24CST501",
    "subjectName": "Computer Networks",
    "moduleTitle": "Module II — Network Layer",
    "estimatedMinutes": 45,
    "difficulty": "medium",
    "understand": {
      "title": "Let's understand it",
      "headline": "How routers navigate the global Internet map",
      "problemSolved": "In a network with millions of interconnected nodes, when a computer in Kochi sends data to a server in Frankfurt, there isn't a single direct wire. There are dozens of possible paths across undersea cables and regional transit networks. What problem does routing solve? Routing determines the optimal end-to-end path that packets must take to reach their destination without getting lost, delayed, or looping indefinitely.",
      "routerDecision": "How does a router decide where a packet should go? Each router looks at incoming packet headers for the destination IP address, consults its internal 'Routing Table' (like an airport departure board), and forwards the packet out through the best next-hop interface.",
      "terminology": [
        {
          "term": "Routing",
          "def": "The global process of computing end-to-end paths across an internetwork."
        },
        {
          "term": "Forwarding",
          "def": "The local action of transferring a packet from an incoming link interface to the appropriate outgoing link interface."
        },
        {
          "term": "Routing Table",
          "def": "A data table stored in router memory listing known destination networks, metric costs, and next-hop gateways."
        },
        {
          "term": "Routing Metric",
          "def": "A numeric cost value (hop count, bandwidth, delay, reliability) used to measure the efficiency of a route."
        }
      ],
      "summaryTakeaway": "Think of routing like GPS navigation computing the best highway route, while forwarding is your car actually making a turn at a specific intersection."
    },
    "whyItMatters": {
      "analogy": "Imagine sending a parcel from Kerala to Delhi. There may be multiple routes — road via Bengaluru and Hyderabad, train via Chennai, or air transit. If a major highway is flooded due to heavy rains, postal logistics automatically reroutes the parcel via rail.",
      "academicConnection": "A routing algorithm helps computer networks do the exact same thing dynamically at the speed of light. Without dynamic routing, if a single fiber optic cable is cut, entire regions would lose Internet connectivity. Routing algorithms detect link failures within milliseconds and converge on alternative healthy paths."
    },
    "howItWorks": {
      "category": "algorithmic",
      "overview": "Routing algorithms are primarily divided into two major philosophies: Distance Vector (decentralized) and Link State (global).",
      "steps": [
        {
          "step": 1,
          "title": "Input",
          "content": "Network topology parameters: Link costs, neighbor status announcements, interface metrics (delay, bandwidth), and packet destination IP addresses."
        },
        {
          "step": 2,
          "title": "Process",
          "content": "Routers periodically exchange routing packets. Distance Vector algorithms (Bellman-Ford) share vector distance tables with immediate neighbors only. Link State algorithms (Dijkstra's) flood link status advertisements across the entire network to build an identical global topology map."
        },
        {
          "step": 3,
          "title": "Decision",
          "content": "Shortest-path calculation executes: Dijkstra's algorithm computes the minimum-cost tree from source to all destinations. If a lower-cost path or broken link is detected, the lowest metric path wins."
        },
        {
          "step": 4,
          "title": "Output",
          "content": "Updated local Routing Table and Forwarding Table populated with optimal next-hop IP addresses and exit interfaces."
        }
      ],
      "comparison": {
        "headers": [
          "Feature",
          "Distance Vector (e.g. RIP)",
          "Link State (e.g. OSPF)"
        ],
        "rows": [
          [
            "Knowledge",
            "Tells neighbors about the whole world",
            "Tells the whole world about direct neighbors"
          ],
          [
            "Algorithm",
            "Bellman-Ford equation",
            "Dijkstra's Shortest Path First"
          ],
          [
            "Convergence",
            "Slower; prone to Count-to-Infinity",
            "Fast; loop-free hierarchy"
          ],
          [
            "Resource Usage",
            "Low CPU, low memory",
            "Higher CPU & memory for topology tree"
          ]
        ]
      }
    },
    "example": {
      "title": "Dijkstra's Shortest Path Walkthrough",
      "scenario": "Consider 5 routers (A, B, C, D, E). Router A needs to compute the shortest path to all nodes.",
      "steps": [
        {
          "stage": "Given",
          "details": "Direct link costs from A: A-B = 2, A-C = 5. Other nodes at infinity (∞)."
        },
        {
          "stage": "Step 1",
          "details": "Select node with minimum permanent distance: Node B (cost 2). Examine B's neighbors: B-C = 1, B-D = 4. Path to C via B is 2 + 1 = 3 (better than direct A-C = 5!). Distance to C updated to 3, distance to D updated to 6."
        },
        {
          "stage": "Step 2",
          "details": "Next lowest tentative node is C (cost 3). C's neighbors: C-D = 2, C-E = 6. Path to D via C is 3 + 2 = 5 (better than 6!). Updated D to 5. Updated E to 9."
        },
        {
          "stage": "Result",
          "details": "Permanent Shortest Path Tree from A: To B = 2, To C = 3 (A→B→C), To D = 5 (A→B→C→D), To E = 9."
        }
      ],
      "keyInsight": "At every step, Dijkstra makes a greedy local choice that guarantees a global optimum because all link costs are non-negative."
    },
    "keyPoints": [
      "Routing determines the end-to-end path packets follow across networks; forwarding moves packets across a single router switch fabric.",
      "Distance Vector (Bellman-Ford) shares distance tables with immediate neighbors; Link State (Dijkstra) floods link states to build a global map.",
      "Dijkstra's algorithm requires non-negative edge weights and operates with O(V²) or O(E log V) complexity.",
      "Count-to-Infinity is a classic Distance Vector limitation resolved with Split Horizon and Poison Reverse techniques.",
      "Autonomous Systems (AS) use Interior Gateway Protocols (OSPF, RIP) internally and BGP (Path Vector) externally."
    ],
    "examFocus": {
      "skills": [
        "Define and clearly differentiate between Routing and Forwarding (2-3 marks).",
        "Explain the working of Distance Vector vs Link State routing with comparative tables (5 marks).",
        "Apply Dijkstra's algorithm step-by-step on a given network topology graph to find the shortest path tree (7-10 marks).",
        "Explain the Count-to-Infinity problem and how Split Horizon / Poison Reverse mitigates it (5 marks)."
      ],
      "commonTraps": "Do not confuse 'Routing Table' (control plane) with 'Forwarding Table' (data plane). On numerical questions, always tabulate the step-by-step permanent and tentative distance sets."
    },
    "selfCheck": {
      "question": "Which routing algorithm relies on the Bellman-Ford equation and suffers from the Count-to-Infinity problem?",
      "options": [
        "Dijkstra Link State Algorithm",
        "Distance Vector Routing",
        "Flooding Algorithm",
        "Path Vector Routing"
      ],
      "answer": "Distance Vector Routing",
      "explanation": "Distance Vector Routing (e.g., RIP) uses the Bellman-Ford equation where routers exchange tables with immediate neighbors, making it susceptible to routing loops and count-to-infinity."
    },
    "nextRecommendedTopic": {
      "topicId": "cn-m2-t4",
      "title": "Subnetting and Supernetting",
      "reason": "These topics are closely related, and practicing subnetting will strengthen your Network Layer understanding."
    }
  },
  "cn-m2-t4": {
    "topicId": "cn-m2-t4",
    "title": "Subnetting and Supernetting",
    "subjectCode": "24CST501",
    "subjectName": "Computer Networks",
    "moduleTitle": "Module II — Network Layer",
    "estimatedMinutes": 45,
    "difficulty": "hard",
    "understand": {
      "title": "Let's understand it",
      "headline": "Partitioning and aggregating IPv4 address spaces",
      "problemSolved": "Classful IPv4 addressing (Class A, B, C) led to massive address waste. A company needing 300 IP addresses had to request a Class B block with 65,534 addresses, wasting over 65,000 IPs! Subnetting solves address wastage by carving a single network into smaller sub-networks.",
      "routerDecision": "Supernetting (CIDR) solves the reverse problem: routing table explosion. Instead of advertising hundreds of small class C routes to global internet routers, supernetting aggregates multiple contiguous blocks into one single summarized route prefix.",
      "terminology": [
        {
          "term": "Subnet Mask",
          "def": "A 32-bit number with contiguous 1s for the network/subnet prefix and 0s for host bits."
        },
        {
          "term": "CIDR Notation",
          "def": "Slash notation (e.g., /26) indicating the exact count of network bits in the mask."
        },
        {
          "term": "Network ID",
          "def": "The first address in a block (all host bits 0), identifying the sub-network itself."
        },
        {
          "term": "Broadcast ID",
          "def": "The final address in a block (all host bits 1), reserved for broadcasting to all hosts in the subnet."
        }
      ],
      "summaryTakeaway": "Subnetting borrows host bits to create more networks. Supernetting borrows network bits to aggregate routes."
    },
    "whyItMatters": {
      "analogy": "Think of an entire apartment building with a single street address. Subnetting is like assigning specific apartment numbers (Suite 101, 102) to individual families inside so mail reaches the right door. Supernetting is like a postal distribution center sorting mail by ZIP code instead of listing every single apartment.",
      "academicConnection": "Subnetting allows network administrators to enforce security boundaries, broadcast containment, and departmental isolation within an organization without acquiring expensive public IP blocks."
    },
    "howItWorks": {
      "category": "mathematical",
      "overview": "Binary bit manipulation using host bits (h) and subnet bits (s).",
      "steps": [
        {
          "step": 1,
          "title": "Subnet Sizing Formula",
          "content": "Number of subnets created = 2ˢ (where s = borrowed subnet bits). Number of usable hosts per subnet = 2ʰ - 2 (where h = remaining host bits, minus Network and Broadcast IDs)."
        },
        {
          "step": 2,
          "title": "Mask Determination",
          "content": "Convert CIDR prefix to dotted decimal. Example: /27 has 27 ones: 11111111.11111111.11111111.11100000 = 255.255.255.224."
        },
        {
          "step": 3,
          "title": "Block Size (Jump Value)",
          "content": "Block Size = 256 - interesting octet value. For /27: 256 - 224 = 32. Subnet network addresses increment by 32 (0, 32, 64, 96, ...)."
        },
        {
          "step": 4,
          "title": "Address Range Allocation",
          "content": "For each subnet: Network ID = start, First Usable = start + 1, Last Usable = next start - 2, Broadcast = next start - 1."
        }
      ]
    },
    "example": {
      "title": "Worked Numerical: Dividing 192.168.10.0/24 into 4 Subnets",
      "scenario": "A college engineering department needs 4 distinct lab subnets from their 192.168.10.0/24 address block.",
      "steps": [
        {
          "stage": "Given",
          "details": "Base Network: 192.168.10.0/24. Subnets required = 4. Base host bits = 32 - 24 = 8."
        },
        {
          "stage": "Formula",
          "details": "2ˢ ≥ 4 ⇒ s = 2 bits borrowed. New CIDR prefix = 24 + 2 = /26. Remaining host bits h = 8 - 2 = 6 bits."
        },
        {
          "stage": "Substitution",
          "details": "Hosts per subnet = 2⁶ - 2 = 64 - 2 = 62 usable hosts. Mask = 255.255.255.192 (/26). Block size = 256 - 192 = 64."
        },
        {
          "stage": "Calculation",
          "details": "Subnet 0: Net ID 192.168.10.0, Usable 192.168.10.1 - 192.168.10.62, Broadcast 192.168.10.63.\\nSubnet 1: Net ID 192.168.10.64, Usable 192.168.10.65 - 192.168.10.126, Broadcast 192.168.10.127.\\nSubnet 2: Net ID 192.168.10.128, Usable 192.168.10.129 - 192.168.10.190, Broadcast 192.168.10.191.\\nSubnet 3: Net ID 192.168.10.192, Usable 192.168.10.193 - 192.168.10.254, Broadcast 192.168.10.255."
        },
        {
          "stage": "Answer",
          "details": "Four subnets created with /26 mask, each supporting 62 usable host devices."
        }
      ],
      "keyInsight": "Always subtract 2 from the total host capacity: one for the network wire address and one for the all-hosts broadcast."
    },
    "keyPoints": [
      "Subnetting borrows host bits to create multiple smaller logical sub-networks.",
      "Usable host calculation is always 2ʰ - 2 (excluding Network ID and Broadcast ID).",
      "Block size in any octet can be quickly calculated as: 256 - Mask Value in that octet.",
      "Supernetting (CIDR aggregation) combines contiguous power-of-2 network blocks to shrink routing tables.",
      "Supernetting requires contiguous networks of equal size that align on binary bit boundaries."
    ],
    "examFocus": {
      "skills": [
        "Calculate the subnet mask, subnets, and valid host ranges given an IP and requirement (7-10 marks).",
        "Determine which subnet a given IP address belongs to using bitwise AND operation.",
        "Aggregate multiple contiguous network prefixes into a single CIDR supernet route (5 marks).",
        "Explain the limitations of Classful addressing that prompted CIDR."
      ],
      "commonTraps": "Remembering to exclude the Network ID (.0) and Broadcast ID (.63, .127, etc.) when stating usable host IP ranges."
    },
    "selfCheck": {
      "question": "What is the usable number of host addresses in a /28 IPv4 subnet?",
      "options": [
        "16",
        "14",
        "30",
        "28"
      ],
      "answer": "14",
      "explanation": "A /28 subnet leaves 32 - 28 = 4 host bits. 2^4 = 16 total IP addresses, minus the network ID and broadcast address = 14 usable host IPs."
    },
    "nextRecommendedTopic": {
      "topicId": "cn-m3-t2",
      "title": "TCP and UDP",
      "reason": "Now that you understand network routing and addressing, learn how the Transport Layer delivers packets reliably to applications."
    }
  },
  "se-m1-t2": {
    "topicId": "se-m1-t2",
    "title": "SDLC Models",
    "subjectCode": "24CST502",
    "subjectName": "Software Engineering",
    "moduleTitle": "Module I — Intro to Software Engineering",
    "estimatedMinutes": 45,
    "difficulty": "medium",
    "understand": {
      "title": "Let's understand it",
      "headline": "The lifecycle of turning an idea into working software",
      "problemSolved": "Building software without a disciplined process leads to the classic 'Software Crisis': projects run over budget, miss deadlines, deliver bug-ridden features, or build the wrong system entirely. SDLC (Software Development Life Cycle) provides a structured framework that guides engineering teams from requirements gathering through retirement.",
      "routerDecision": "Different projects face different risks. A medical ventilator firmware needs zero tolerance for error (Waterfall / V-Model), while a startup mobile app needs weekly user feedback (Agile / Iterative). SDLC models help teams pick the right balance of flexibility and control.",
      "terminology": [
        {
          "term": "SDLC",
          "def": "A systematic process consisting of Requirements, Design, Implementation, Testing, Deployment, and Maintenance."
        },
        {
          "term": "Waterfall Model",
          "def": "A linear sequential model where each phase must finish completely before the next begins."
        },
        {
          "term": "Iterative Model",
          "def": "Developing a basic version first and progressively adding features over successive iterations."
        },
        {
          "term": "Spiral Model",
          "def": "A risk-driven meta-model combining iterative development with systematic risk assessment cycles."
        },
        {
          "term": "V-Model",
          "def": "A verification and validation model pairing every development phase with an explicit testing level."
        }
      ],
      "summaryTakeaway": "An SDLC model is like a building blueprint: you don't construct the roof before laying the foundation, but how you scaffold depends on the building type."
    },
    "whyItMatters": {
      "analogy": "Think of baking a custom wedding cake. If you bake the entire 5-tier cake and decorate it before showing the client (Waterfall), finding out they hate strawberry means throwing away the entire cake! If you let them taste cupcakes first (Iterative/Agile), you adjust the recipe with minimal waste.",
      "academicConnection": "SDLC models define team deliverables, quality gates, risk checkpoints, and contractual milestones. Selecting the appropriate model directly determines project success."
    },
    "howItWorks": {
      "category": "conceptual",
      "overview": "Comparing classical SDLC models based on requirements volatility, risk level, and team structure.",
      "steps": [
        {
          "step": 1,
          "title": "Requirements Analysis & Specification",
          "content": "Gather functional and non-functional requirements from stakeholders; produce the formal Software Requirement Specification (SRS) document."
        },
        {
          "step": 2,
          "title": "Architecture & System Design",
          "content": "High-level design (system architecture, database schema) and low-level design (class diagrams, module interfaces)."
        },
        {
          "step": 3,
          "title": "Implementation (Coding)",
          "content": "Writing clean, documented, modular source code following organizational coding standards and version control guidelines."
        },
        {
          "step": 4,
          "title": "Verification & Validation (Testing)",
          "content": "Unit testing, integration testing, system testing, and User Acceptance Testing (UAT) to ensure conformance to requirements."
        },
        {
          "step": 5,
          "title": "Deployment & Maintenance",
          "content": "Releasing to production environments; performing corrective, adaptive, perfective, and preventive maintenance over time."
        }
      ],
      "comparison": {
        "headers": [
          "Parameter",
          "Waterfall",
          "Spiral",
          "V-Model"
        ],
        "rows": [
          [
            "Requirements",
            "Must be fixed upfront",
            "Can evolve per spiral turn",
            "Fixed upfront with explicit test cases"
          ],
          [
            "Risk Handling",
            "Very poor; risks found late",
            "Excellent; explicit risk analysis",
            "Good for verification gaps"
          ],
          [
            "Client Involvement",
            "Only at start and delivery",
            "Continuous evaluation per cycle",
            "High at requirements & UAT phases"
          ],
          [
            "Best For",
            "Well-understood, stable systems",
            "Large, high-risk, expensive projects",
            "Safety-critical, compliance-heavy systems"
          ]
        ]
      }
    },
    "example": {
      "title": "Real-World Scenario: Choosing an SDLC Model",
      "scenario": "Compare two engineering teams choosing their SDLC strategy:",
      "steps": [
        {
          "stage": "Project A: Flight Control System",
          "details": "Requirements are strictly defined by aviation authorities. Cost of failure is catastrophic. Model Chosen: V-Model or Waterfall with formal verification. Every specification maps to an acceptance test."
        },
        {
          "stage": "Project B: Campus Social Dating App",
          "details": "Market trends are uncertain; user preferences change rapidly. Model Chosen: Agile / Iterative. Team ships an MVP in 3 weeks, tracks engagement, and iterates weekly based on student feedback."
        }
      ],
      "keyInsight": "There is no single 'best' SDLC model; the optimal choice depends strictly on requirement stability, project risk, and delivery urgency."
    },
    "keyPoints": [
      "SDLC encompasses 6 fundamental phases: Requirements → Design → Coding → Testing → Deployment → Maintenance.",
      "Waterfall is linear-sequential; simple to manage but highly inflexible to changing requirements.",
      "Spiral Model is risk-driven, designed by Barry Boehm, with 4 quadrants per loop: Objectives, Risk Analysis, Development, Review.",
      "The V-Model pairs development phases directly with corresponding testing phases (e.g., Requirements ↔ Acceptance Testing).",
      "Maintenance represents over 60-70% of the total lifetime cost of most enterprise software systems."
    ],
    "examFocus": {
      "skills": [
        "Draw and explain the Waterfall model with its strengths and limitations (5 marks).",
        "Draw the Spiral model diagram and explain Barry Boehm's 4 quadrants (7-10 marks).",
        "Compare Waterfall, Prototype, Spiral, and Agile models in a structured comparative table.",
        "Explain the V-Model and show how verification corresponds to validation levels."
      ],
      "commonTraps": "In the Spiral model, students often forget the 'Risk Analysis' quadrant. Risk analysis is the core defining feature of the Spiral model."
    },
    "selfCheck": {
      "question": "In Boehm's Spiral Model, what is the crucial activity performed at the end of each spiral cycle before proceeding?",
      "options": [
        "Customer billing and invoicing",
        "Risk analysis and prototype evaluation",
        "Writing user manuals",
        "Complete code refactoring"
      ],
      "answer": "Risk analysis and prototype evaluation",
      "explanation": "The hallmark of the Spiral Model is risk analysis; each cycle explicitly assesses technological and project risks before committing further resources."
    },
    "nextRecommendedTopic": {
      "topicId": "se-m1-t3",
      "title": "Agile and Agile Manifesto",
      "reason": "Now that you understand traditional sequential SDLCs, see how modern software teams transitioned to Agile iterations."
    }
  },
  "se-m1-t3": {
    "topicId": "se-m1-t3",
    "title": "Agile and Agile Manifesto",
    "subjectCode": "24CST502",
    "subjectName": "Software Engineering",
    "moduleTitle": "Module I — Intro to Software Engineering",
    "estimatedMinutes": 30,
    "difficulty": "easy",
    "understand": {
      "title": "Let's understand it",
      "headline": "Iterative development powered by customer collaboration",
      "problemSolved": "Traditional development models treated software engineering like civil engineering: write 500 pages of requirements, spend 18 months building, and deliver a finished product. But software requirements change almost weekly. Agile was created in 2001 by 17 developers in Snowbird, Utah, to prioritize working software and adaptability over rigid plans.",
      "routerDecision": "Agile is not a single methodology; it is a philosophy. Teams deliver software in small, working increments called sprints (typically 1-4 weeks), getting real feedback after each sprint to steer development.",
      "terminology": [
        {
          "term": "Agile Manifesto",
          "def": "A proclamation of 4 core values and 12 guiding principles for lightweight software development."
        },
        {
          "term": "Sprint / Iteration",
          "def": "A fixed timebox (usually 2 weeks) during which a cross-functional team completes a potentially shippable increment."
        },
        {
          "term": "Product Backlog",
          "def": "A prioritized list of user stories, features, bug fixes, and technical debt maintained by the Product Owner."
        },
        {
          "term": "User Story",
          "def": "A lightweight requirement written from the user's perspective: 'As a [user], I want [feature], so that [benefit]'."
        }
      ],
      "summaryTakeaway": "Agile values responding to change over following a predetermined plan."
    },
    "whyItMatters": {
      "analogy": "Driving with a steering wheel vs riding a train on fixed tracks. Waterfall is like laying railroad tracks: fast if straight, but fatal if an unexpected mountain appears. Agile gives your team a car with a responsive steering wheel: you adjust your heading whenever the terrain changes.",
      "academicConnection": "Over 85% of modern tech companies use Agile frameworks (Scrum, Kanban, XP). Understanding Agile values is fundamental to modern software engineering interviews and university exams."
    },
    "howItWorks": {
      "category": "conceptual",
      "overview": "The 4 core values of the Agile Manifesto and the Scrum operational loop.",
      "steps": [
        {
          "step": 1,
          "title": "Individuals & Interactions over Processes and Tools",
          "content": "Empowered, self-organizing teams communicating face-to-face solve problems faster than teams locked behind bureaucracy."
        },
        {
          "step": 2,
          "title": "Working Software over Comprehensive Documentation",
          "content": "A working prototype demonstrates true progress; documentation is valuable but should be lean and purposeful."
        },
        {
          "step": 3,
          "title": "Customer Collaboration over Contract Negotiation",
          "content": "Customers work directly with developers as continuous partners rather than adversaries debating contract clauses."
        },
        {
          "step": 4,
          "title": "Responding to Change over Following a Plan",
          "content": "Changing requirements are welcomed, even late in development, giving the customer a competitive advantage."
        }
      ],
      "comparison": {
        "headers": [
          "Agile Value",
          "Left (Prioritized)",
          "Right (Valued less)"
        ],
        "rows": [
          [
            "Value 1",
            "Individuals and Interactions",
            "Processes and Tools"
          ],
          [
            "Value 2",
            "Working Software",
            "Comprehensive Documentation"
          ],
          [
            "Value 3",
            "Customer Collaboration",
            "Contract Negotiation"
          ],
          [
            "Value 4",
            "Responding to Change",
            "Following a Plan"
          ]
        ]
      }
    },
    "example": {
      "title": "Scrum Sprint Cycle Example: E-Commerce Search Feature",
      "scenario": "A 2-week sprint for a student book marketplace application:",
      "steps": [
        {
          "stage": "Sprint Planning (Day 1)",
          "details": "Team selects 3 user stories from the Product Backlog: 'Search by author', 'Filter by price', 'Sort by edition'. Estimated at 20 story points."
        },
        {
          "stage": "Daily Scrum (Days 2-9)",
          "details": "15-minute daily standup: What did you do yesterday? What are you doing today? Any blockers?"
        },
        {
          "stage": "Sprint Review (Day 10)",
          "details": "Team demos the live working search filter to the marketing team and students. Feedback gathered."
        },
        {
          "stage": "Sprint Retrospective (Day 10)",
          "details": "Internal team reflection: What went well? What can we improve next sprint?"
        }
      ],
      "keyInsight": "Agile ensures that working software is delivered at the end of every single sprint, eliminating the risk of a zero-value project failure."
    },
    "keyPoints": [
      "The 4 core values prioritize people, working code, collaboration, and adaptability.",
      "Scrum defines 3 roles: Product Owner (vision), Scrum Master (coach & blocker remover), Developers.",
      "Scrum has 4 primary ceremonies: Sprint Planning, Daily Standup, Sprint Review, Sprint Retrospective.",
      "User stories capture requirements in standard format: 'As a... I want... So that...'.",
      "Velocity is the amount of work (story points) a team completes during a typical sprint."
    ],
    "examFocus": {
      "skills": [
        "State and explain the 4 values and key principles of the Agile Manifesto (5 marks).",
        "Explain the Scrum lifecycle, roles (PO, SM, Devs), and ceremonies (7-10 marks).",
        "Compare Traditional Waterfall vs Agile across scope, cost, time, and quality dimensions.",
        "Write sample User Stories with Acceptance Criteria for a given system requirement."
      ],
      "commonTraps": "Agile does NOT mean 'no documentation'. It means documentation should be lean and directly useful, without delaying working software delivery."
    },
    "selfCheck": {
      "question": "Which of the following is a core principle explicitly stated in the Agile Manifesto?",
      "options": [
        "Comprehensive documentation over working software",
        "Contract negotiation over customer collaboration",
        "Responding to change over following a plan",
        "Following rigid processes over individual interactions"
      ],
      "answer": "Responding to change over following a plan",
      "explanation": "The Agile Manifesto prioritizes 'Responding to change over following a plan', recognizing that customer needs and market realities evolve during development."
    },
    "nextRecommendedTopic": {
      "topicId": "se-m2-t4",
      "title": "UML Diagrams and Software Design Concepts",
      "reason": "Take your software engineering understanding to the design phase by learning standard architectural UML modeling."
    }
  },
  "math-m1-t4": {
    "topicId": "math-m1-t4",
    "title": "Eigenvalues, Eigenvectors, PCA and SVD",
    "subjectCode": "24CST503",
    "subjectName": "Advanced Mathematics for Data Science",
    "moduleTitle": "Module I — Linear Algebra for Data Representation",
    "estimatedMinutes": 60,
    "difficulty": "hard",
    "understand": {
      "title": "Let's understand it",
      "headline": "Special directions where matrix transformations only stretch, never rotate",
      "problemSolved": "When a matrix multiplies a vector, it typically does two things: it changes the vector's length (stretches or shrinks it) and changes its direction (rotates it). However, for any square matrix, there exist special privileged directions that do NOT rotate. Along these directions, multiplying by the matrix is mathematically equivalent to multiplying by a simple scalar number. These vectors are Eigenvectors, and their stretching factors are Eigenvalues.",
      "routerDecision": "Why do data scientists care? Real-world datasets often have thousands of correlated features (dimensions). Eigenvectors identify the principal axes of maximum variance, allowing techniques like PCA (Principal Component Analysis) to compress 1,000 columns into 10 without losing important patterns.",
      "terminology": [
        {
          "term": "Eigenvector (v)",
          "def": "A non-zero vector that satisfies Av = λv for a square matrix A."
        },
        {
          "term": "Eigenvalue (λ)",
          "def": "The scalar stretch factor associated with the eigenvector v."
        },
        {
          "term": "Characteristic Equation",
          "def": "det(A - λI) = 0, used to compute eigenvalues."
        },
        {
          "term": "PCA",
          "def": "Dimensionality reduction technique that projects data onto the eigenvectors of the covariance matrix."
        },
        {
          "term": "SVD",
          "def": "Factorization of any m × n matrix into A = U Σ Vᵀ using singular values."
        }
      ],
      "summaryTakeaway": "Eigenvectors are the natural structural axes of a transformation; eigenvalues tell you the importance of each axis."
    },
    "whyItMatters": {
      "analogy": "Imagine an oblong American football floating in space. If you squeeze it from all sides, points along its longest spine and points along its shortest circumference stay pointing along their original lines — they just get compressed. Those two axes are its eigenvectors. The amount of compression along each axis is its eigenvalue.",
      "academicConnection": "Google's PageRank algorithm, facial recognition (Eigenfaces), quantum mechanics wave functions, and latent semantic indexing in search engines are all built directly upon eigenvalues and eigenvectors."
    },
    "howItWorks": {
      "category": "mathematical",
      "overview": "Finding eigenvalues and corresponding eigenvectors for a square matrix A.",
      "steps": [
        {
          "step": 1,
          "title": "Setup Characteristic Equation",
          "content": "Subtract λ along the main diagonal: Matrix (A - λI). Compute its determinant: det(A - λI) = 0."
        },
        {
          "step": 2,
          "title": "Solve Characteristic Polynomial",
          "content": "Solve the resulting polynomial equation for roots λ₁, λ₂, ..., λₙ to obtain the eigenvalues."
        },
        {
          "step": 3,
          "title": "Substitute λ into (A - λI)v = 0",
          "content": "For each eigenvalue λᵢ, solve the homogeneous linear system (A - λᵢI)v = 0 using Gaussian elimination."
        },
        {
          "step": 4,
          "title": "Extract Eigenvector Basis",
          "content": "Express the solution in parametric vector form to find the non-zero basis vector v."
        }
      ]
    },
    "example": {
      "title": "Worked Numerical: Eigenvalues & Eigenvectors for a 2×2 Matrix",
      "scenario": "Find the eigenvalues and eigenvectors of matrix A = [[4, 2], [1, 3]].",
      "steps": [
        {
          "stage": "Given",
          "details": "A = [[4, 2], [1, 3]]. Characteristic equation: det(A - λI) = 0."
        },
        {
          "stage": "Formula",
          "details": "det([[4 - λ, 2], [1, 3 - λ]]) = (4 - λ)(3 - λ) - (2 × 1) = 0."
        },
        {
          "stage": "Substitution",
          "details": "λ² - 7λ + 12 - 2 = 0 ⇒ λ² - 7λ + 10 = 0."
        },
        {
          "stage": "Calculation",
          "details": "Factoring: (λ - 5)(λ - 2) = 0. Therefore, eigenvalues are λ₁ = 5, λ₂ = 2.\\n\\nFor λ₁ = 5: Solve (A - 5I)v = 0:\\n[[-1, 2], [1, -2]] [x₁, x₂]ᵀ = [0, 0]ᵀ ⇒ -x₁ + 2x₂ = 0 ⇒ x₁ = 2x₂.\\nEigenvector v₁ = [2, 1]ᵀ.\\n\\nFor λ₂ = 2: Solve (A - 2I)v = 0:\\n[[2, 2], [1, 1]] [x₁, x₂]ᵀ = [0, 0]ᵀ ⇒ 2x₁ + 2x₂ = 0 ⇒ x₁ = -x₂.\\nEigenvector v₂ = [-1, 1]ᵀ."
        },
        {
          "stage": "Answer",
          "details": "Eigenvalues: λ₁ = 5 with v₁ = [2, 1]ᵀ; λ₂ = 2 with v₂ = [-1, 1]ᵀ."
        }
      ],
      "keyInsight": "Notice that multiplying A by [2, 1]ᵀ gives [10, 5]ᵀ = 5 × [2, 1]ᵀ. The direction did not change; it was stretched by exactly 5!"
    },
    "keyPoints": [
      "The defining eigenvalue relation is Av = λv (where v ≠ 0).",
      "Eigenvalues are the roots of the characteristic polynomial: det(A - λI) = 0.",
      "The sum of eigenvalues equals the trace of matrix A (sum of main diagonal elements).",
      "The product of eigenvalues equals the determinant of matrix A: det(A) = ∏ λᵢ.",
      "PCA uses the eigenvectors of the data covariance matrix to find directions of maximum variance."
    ],
    "examFocus": {
      "skills": [
        "Calculate the characteristic equation, eigenvalues, and eigenvectors of 2×2 and 3×3 matrices (7-10 marks).",
        "Verify trace and determinant properties against computed eigenvalues.",
        "Explain the geometric significance of eigenvalues and eigenvectors with a sketch.",
        "Describe how PCA uses eigenvectors for dimensionality reduction."
      ],
      "commonTraps": "Always remember that the zero vector [0, 0]ᵀ is never considered an eigenvector by definition, even though A(0) = λ(0)."
    },
    "selfCheck": {
      "question": "If a 2x2 matrix has trace = 7 and determinant = 10, what are its eigenvalues?",
      "options": [
        "λ = 2 and λ = 5",
        "λ = 1 and λ = 10",
        "λ = 3 and λ = 4",
        "λ = -2 and λ = -5"
      ],
      "answer": "λ = 2 and λ = 5",
      "explanation": "The characteristic equation is λ² - trace(A)λ + det(A) = 0 ⇒ λ² - 7λ + 10 = 0. Factoring gives (λ - 2)(λ - 5) = 0, so λ = 2 and λ = 5."
    },
    "nextRecommendedTopic": {
      "topicId": "math-m2-t1",
      "title": "Probability, Conditional Probability and Bayes' Theorem",
      "reason": "Transition from linear data representation to probabilistic modeling and inference for machine learning."
    }
  },
  "math-m2-t1": {
    "topicId": "math-m2-t1",
    "title": "Probability, Conditional Probability and Bayes' Theorem",
    "subjectCode": "24CST503",
    "subjectName": "Advanced Mathematics for Data Science",
    "moduleTitle": "Module II — Probability & Statistics",
    "estimatedMinutes": 45,
    "difficulty": "medium",
    "understand": {
      "title": "Let's understand it",
      "headline": "Updating our beliefs when new evidence arrives",
      "problemSolved": "In machine learning and statistics, we rarely possess absolute certainty. We only observe noisy evidence — like medical lab test results, email keywords, or sensor readings. What problem does Bayes' Theorem solve? It gives us a mathematically rigorous way to update our initial belief (prior probability) about a hypothesis after observing new evidence, producing a revised belief (posterior probability).",
      "routerDecision": "The core formula balances how rare a condition is overall against how reliable the evidence is.",
      "terminology": [
        {
          "term": "Prior P(A)",
          "def": "The initial probability of hypothesis A before observing any evidence."
        },
        {
          "term": "Likelihood P(B|A)",
          "def": "The probability of observing evidence B given that hypothesis A is true."
        },
        {
          "term": "Posterior P(A|B)",
          "def": "The updated probability that hypothesis A is true after seeing evidence B."
        },
        {
          "term": "Evidence P(B)",
          "def": "The total probability of observing evidence B under all possible hypotheses (marginal probability)."
        }
      ],
      "summaryTakeaway": "Posterior = (Likelihood × Prior) / Evidence. Bayes' rule turns P(B given A) into P(A given B)."
    },
    "whyItMatters": {
      "analogy": "Imagine waking up with a cough during allergy season. Even though 95% of people with COVID cough (high likelihood), the base rate of COVID in your city today might be only 0.1% while pollen allergy is 40%. You don't immediately panic because your prior probability for allergy is much higher.",
      "academicConnection": "Bayes' Theorem powers Naïve Bayes spam filters, medical diagnostic AI, Bayesian Neural Networks, Kalman filters for robotics, and recommendation ranking algorithms."
    },
    "howItWorks": {
      "category": "mathematical",
      "overview": "Derivation from conditional probability definitions.",
      "steps": [
        {
          "step": 1,
          "title": "Conditional Probability Formula",
          "content": "P(A ∩ B) = P(A|B) · P(B) and P(A ∩ B) = P(B|A) · P(A)."
        },
        {
          "step": 2,
          "title": "Equating Joint Probabilities",
          "content": "P(A|B) · P(B) = P(B|A) · P(A)."
        },
        {
          "step": 3,
          "title": "Bayes' Theorem Formulation",
          "content": "P(A|B) = [P(B|A) · P(A)] / P(B)."
        },
        {
          "step": 4,
          "title": "Total Probability Expansion",
          "content": "P(B) = P(B|A)·P(A) + P(B|Aᶜ)·P(Aᶜ) where Aᶜ represents the complement of A (not A)."
        }
      ]
    },
    "example": {
      "title": "Worked Numerical: Medical Diagnostic Test Accuracy",
      "scenario": "A rare disease affects 1% of the population (P(D) = 0.01). A diagnostic test is 95% accurate (True Positive = 0.95), with a 5% false positive rate (P(T+|Dᶜ) = 0.05). If a patient tests positive (T+), what is the actual probability they have the disease?",
      "steps": [
        {
          "stage": "Given",
          "details": "P(D) = 0.01 ⇒ P(Dᶜ) = 0.99.\\nP(T+|D) = 0.95 (Likelihood).\\nP(T+|Dᶜ) = 0.05 (False Positive Rate)."
        },
        {
          "stage": "Formula",
          "details": "P(D|T+) = [P(T+|D) · P(D)] / P(T+)."
        },
        {
          "stage": "Substitution",
          "details": "Total Probability P(T+) = P(T+|D)·P(D) + P(T+|Dᶜ)·P(Dᶜ)\\nP(T+) = (0.95 × 0.01) + (0.05 × 0.99) = 0.0095 + 0.0495 = 0.059."
        },
        {
          "stage": "Calculation",
          "details": "P(D|T+) = 0.0095 / 0.059 ≈ 0.161 (or 16.1%)."
        },
        {
          "stage": "Answer",
          "details": "Even after testing positive on a 95% accurate test, there is only a 16.1% chance the patient actually has the disease, because the base rate (prior) is so low!"
        }
      ],
      "keyInsight": "When base rates are rare, false positives from the large healthy population often outnumber true positives from the small sick population."
    },
    "keyPoints": [
      "Bayes' Theorem updates prior beliefs with new observational evidence to compute posterior probabilities.",
      "Formula: P(A|B) = [P(B|A) · P(A)] / P(B).",
      "Law of Total Probability expands denominator P(B) across all mutually exclusive hypotheses.",
      "Base Rate Fallacy occurs when people ignore the prior P(A) and focus only on the likelihood P(B|A).",
      "Naïve Bayes classifier assumes all features are conditionally independent given the class label."
    ],
    "examFocus": {
      "skills": [
        "State and derive Bayes' Theorem from conditional probability axioms (3-5 marks).",
        "Solve numerical problems involving disease testing, factory defect rates, and ball urns (7-10 marks).",
        "Explain the Law of Total Probability and use it in denominator expansions.",
        "Explain the Naïve Bayes independence assumption and its computational benefits."
      ],
      "commonTraps": "Forgetting to multiply the false positive rate by the healthy population probability P(Aᶜ) when computing total evidence P(B)."
    },
    "selfCheck": {
      "question": "In Bayes' Theorem P(A|B) = [P(B|A) * P(A)] / P(B), what does P(A) represent?",
      "options": [
        "Posterior probability",
        "Likelihood",
        "Prior probability",
        "Marginal evidence"
      ],
      "answer": "Prior probability",
      "explanation": "P(A) is the prior probability — your baseline belief about hypothesis A before seeing new evidence B."
    },
    "nextRecommendedTopic": {
      "topicId": "math-m3-t3",
      "title": "Gradient Descent and Newton's Method",
      "reason": "Now explore optimization algorithms that minimize loss functions in machine learning models."
    }
  },
  "math-m3-t3": {
    "topicId": "math-m3-t3",
    "title": "Gradient Descent and Newton's Method",
    "subjectCode": "24CST503",
    "subjectName": "Advanced Mathematics for Data Science",
    "moduleTitle": "Module III — Calculus & Optimization",
    "estimatedMinutes": 60,
    "difficulty": "hard",
    "understand": {
      "title": "Let's understand it",
      "headline": "How algorithms walk downhill to find minimum error",
      "problemSolved": "In machine learning, every model (from linear regression to ChatGPT) starts out making terrible predictions. We measure how wrong it is using a Loss Function (Cost Function). But how does the model know which way to adjust its millions of internal weights to reduce that error? Calculating the exact analytical solution directly is impossible for deep models. Gradient Descent solves this by iteratively taking small steps in the direction that reduces error fastest.",
      "routerDecision": "The gradient is a vector of partial derivatives pointing in the direction of steepest ascent (fastest increase). Therefore, stepping in the negative gradient direction guarantees walking downhill towards the minimum.",
      "terminology": [
        {
          "term": "Loss / Cost Function J(w)",
          "def": "A function measuring the discrepancy between model predictions and actual ground truth labels."
        },
        {
          "term": "Gradient (∇J)",
          "def": "The vector of all partial derivatives of the loss function with respect to each model parameter."
        },
        {
          "term": "Learning Rate (α)",
          "def": "A hyperparameter controlling the step size taken along the negative gradient during each iteration."
        },
        {
          "term": "Newton's Method",
          "def": "A second-order optimization method using both gradients and curvature (Hessian matrix) to jump directly toward extrema."
        }
      ],
      "summaryTakeaway": "Gradient Descent is like walking down a mountain in thick fog: feel the slope beneath your feet and take a step downhill."
    },
    "whyItMatters": {
      "analogy": "Imagine standing on a foggy mountain peak and trying to reach the valley floor with zero visibility. You can't see the whole mountain. All you can do is feel the slope directly under your boots with a walking stick. If the ground slopes downward to your left, you take a cautious step to your left. Repeat until every direction slopes upward — you have reached the valley bottom!",
      "academicConnection": "Gradient Descent and its variants (SGD, Adam, RMSProp) are the universal training engine behind virtually every modern AI and neural network architecture."
    },
    "howItWorks": {
      "category": "mathematical",
      "overview": "Iterative parameter update rule using partial derivatives.",
      "steps": [
        {
          "step": 1,
          "title": "Weight Initialization",
          "content": "Initialize model weights w randomly or near zero."
        },
        {
          "step": 2,
          "title": "Compute Gradient",
          "content": "Calculate the gradient vector ∇J(w) = [∂J/∂w₁, ∂J/∂w₂, ..., ∂J/∂wₙ]ᵀ evaluating partial derivatives on current predictions."
        },
        {
          "step": 3,
          "title": "Update Parameters",
          "content": "Update weights: w_new = w_old - α · ∇J(w_old), where α is the learning rate."
        },
        {
          "step": 4,
          "title": "Convergence Check",
          "content": "Repeat steps 2-3 until the change in loss |J_new - J_old| < ε or gradient magnitude ||∇J|| is nearly zero."
        }
      ]
    },
    "example": {
      "title": "Worked Numerical: 1D Gradient Descent on J(w) = w² - 4w + 5",
      "scenario": "Find the minimum of J(w) = w² - 4w + 5 starting from w₀ = 0 with learning rate α = 0.1 for 3 iterations.",
      "steps": [
        {
          "stage": "Given",
          "details": "J(w) = w² - 4w + 5. Gradient dJ/dw = 2w - 4. Initial w₀ = 0, α = 0.1."
        },
        {
          "stage": "Iteration 1",
          "details": "Gradient at w₀: 2(0) - 4 = -4.\\nw₁ = w₀ - α(dJ/dw) = 0 - 0.1(-4) = +0.4.\\nCost J(0.4) = (0.4)² - 4(0.4) + 5 = 0.16 - 1.6 + 5 = 3.56 (decreased from 5.0!)."
        },
        {
          "stage": "Iteration 2",
          "details": "Gradient at w₁: 2(0.4) - 4 = 0.8 - 4 = -3.2.\\nw₂ = 0.4 - 0.1(-3.2) = 0.4 + 0.32 = 0.72.\\nCost J(0.72) = (0.72)² - 4(0.72) + 5 = 0.5184 - 2.88 + 5 = 2.638."
        },
        {
          "stage": "Iteration 3",
          "details": "Gradient at w₂: 2(0.72) - 4 = 1.44 - 4 = -2.56.\\nw₃ = 0.72 - 0.1(-2.56) = 0.72 + 0.256 = 0.976."
        },
        {
          "stage": "Answer",
          "details": "After 3 steps, w moves from 0 toward the true minimum w* = 2 (where dJ/dw = 2(2)-4 = 0)."
        }
      ],
      "keyInsight": "Notice how the step size naturally shrinks as w approaches the minimum, because the gradient magnitude |2w - 4| gets smaller!"
    },
    "keyPoints": [
      "The update rule is: w := w - α ∇J(w). The negative sign ensures movement against the direction of steepest increase.",
      "Learning rate α is critical: too large causes overshoot and divergence; too small makes training painfully slow.",
      "Batch Gradient Descent uses the entire dataset per update; Stochastic (SGD) uses 1 sample; Mini-batch uses 32-256 samples.",
      "Newton's Method uses second-order curvature via the Hessian matrix: w := w - [H(w)]⁻¹ ∇J(w) (converges in 1 step for quadratics!).",
      "Gradient descent can get stuck in local minima or saddle points in complex non-convex neural network loss landscapes."
    ],
    "examFocus": {
      "skills": [
        "State the Gradient Descent update equation and explain the physical meaning of each term (3 marks).",
        "Perform manual numerical iterations of 1D and 2D gradient descent for a given quadratic cost function (7 marks).",
        "Compare Batch Gradient Descent, Stochastic Gradient Descent (SGD), and Mini-Batch Gradient Descent in a table (5 marks).",
        "Explain Newton's method and why computing the Hessian inverse is computationally prohibitive for high-dimensional models."
      ],
      "commonTraps": "Forgetting the minus sign in the update rule w - α∇J(w). A positive sign results in Gradient Ascent, which maximizes error!"
    },
    "selfCheck": {
      "question": "What is the primary danger of setting the learning rate α too high in Gradient Descent?",
      "options": [
        "Training takes too many epochs to converge",
        "The algorithm overshoots the minimum and diverges",
        "The gradients become exactly zero at step one",
        "The loss function becomes non-convex"
      ],
      "answer": "The algorithm overshoots the minimum and diverges",
      "explanation": "An excessively large learning rate causes step updates that overshoot the valleys of the loss surface, oscillating wildly and diverging."
    },
    "nextRecommendedTopic": {
      "topicId": "ml-m1-t1",
      "title": "AI, Machine Learning and Learning Paradigms",
      "reason": "Connect optimization mathematics to real-world machine learning algorithms and paradigms."
    }
  },
  "ml-m1-t1": {
    "topicId": "ml-m1-t1",
    "title": "AI, Machine Learning and Learning Paradigms",
    "subjectCode": "24CSR504",
    "subjectName": "Machine Learning",
    "moduleTitle": "Module I — Intro to Machine Learning",
    "estimatedMinutes": 30,
    "difficulty": "easy",
    "understand": {
      "title": "Let's understand it",
      "headline": "Teaching computers from patterns rather than writing explicit rules",
      "problemSolved": "In classical programming, a human programmer writes explicit rules: 'If customer age > 60 and credit score > 700, approve loan.' But for complex tasks like recognizing handwritten digits, translating speech, or detecting fraud, the possible edge cases run into billions. Humans cannot write enough rules. Machine Learning solves this by reversing the paradigm: we feed data and desired answers into the computer, and the computer extracts the rules.",
      "routerDecision": "Tom Mitchell's formal definition: 'A computer program is said to learn from experience E with respect to some class of tasks T and performance measure P, if its performance at tasks in T, as measured by P, improves with experience E.'",
      "terminology": [
        {
          "term": "Supervised Learning",
          "def": "Learning from labeled training data containing input features (X) and ground truth targets (y)."
        },
        {
          "term": "Unsupervised Learning",
          "def": "Discovering hidden structures, clusters, or patterns in unlabeled data (features X only)."
        },
        {
          "term": "Reinforcement Learning",
          "def": "An agent learns by interacting with an environment, maximizing cumulative numerical rewards through trial and error."
        },
        {
          "term": "Semi-Supervised Learning",
          "def": "Training with a small set of labeled data combined with a large corpus of unlabeled data."
        }
      ],
      "summaryTakeaway": "Traditional programming: Rules + Data = Answers. Machine Learning: Data + Answers = Rules."
    },
    "whyItMatters": {
      "analogy": "How do humans learn? Supervised learning is like studying with a teacher who checks every answer on your quiz. Unsupervised learning is like exploring an unfamiliar city on foot without a map, noticing that food stalls cluster together and offices cluster elsewhere. Reinforcement learning is like learning to ride a bicycle: skin your knee (negative penalty) or stay balanced (positive reward).",
      "academicConnection": "Categorizing problems into the correct learning paradigm is the essential first step before choosing models, loss functions, evaluation metrics, and data preprocessing steps."
    },
    "howItWorks": {
      "category": "conceptual",
      "overview": "The taxonomy of machine learning paradigms and their distinct problem formulations.",
      "steps": [
        {
          "step": 1,
          "title": "Supervised Learning: Classification vs Regression",
          "content": "Classification predicts discrete categorical class labels (Spam / Not Spam, Benign / Malignant). Regression predicts continuous real-valued numbers (House price, Stock index, Temperature)."
        },
        {
          "step": 2,
          "title": "Unsupervised Learning: Clustering & Association",
          "content": "Clustering groups similar samples (Customer market segmentation, Gene clustering). Dimensionality reduction compresses features (PCA, t-SNE)."
        },
        {
          "step": 3,
          "title": "Reinforcement Learning: Agent-Environment Loop",
          "content": "Agent observes state S, takes action A, environment transitions to state S' and emits reward R. Agent optimizes policy π to maximize future discounted returns."
        }
      ],
      "comparison": {
        "headers": [
          "Paradigm",
          "Input Data",
          "Feedback Signal",
          "Primary Tasks"
        ],
        "rows": [
          [
            "Supervised",
            "Labeled pairs (X, y)",
            "Direct error against true label",
            "Classification, Regression"
          ],
          [
            "Unsupervised",
            "Unlabeled features (X)",
            "None; self-similarity metrics",
            "Clustering, Dimensionality Reduction"
          ],
          [
            "Reinforcement",
            "States & Actions (S, A)",
            "Delayed scalar reward signal",
            "Game playing, Robotics, Autonomous driving"
          ]
        ]
      }
    },
    "example": {
      "title": "Real-World Industry Mapping",
      "scenario": "Classifying four real-world business problems into learning paradigms:",
      "steps": [
        {
          "stage": "Problem A: Predicting Patient Hospital Readmission Risk (0% to 100%)",
          "details": "Paradigm: Supervised Regression (continuous percentage prediction trained on historic patient records with readmission outcomes)."
        },
        {
          "stage": "Problem B: Segmenting Bank Customers into Behavioral Personas",
          "details": "Paradigm: Unsupervised Clustering (k-Means grouping credit card holders by spending habits without prior labels)."
        },
        {
          "stage": "Problem C: Training an Autonomous Drone to Land on a Moving Boat",
          "details": "Paradigm: Reinforcement Learning (drone agent learns flight control policy through simulator trial-and-error rewards)."
        },
        {
          "stage": "Problem D: Email Spam Filtering",
          "details": "Paradigm: Supervised Classification (discrete binary classification: Spam vs Ham)."
        }
      ],
      "keyInsight": "Always ask: 'Do we have ground-truth correct answers for every past record?' If yes, it is Supervised. If no, look at Unsupervised or Reinforcement."
    },
    "keyPoints": [
      "Machine learning extracts patterns from experience E to improve performance P on task T.",
      "Supervised learning requires ground truth labels (Classification for discrete, Regression for continuous).",
      "Unsupervised learning uncovers latent geometry and groupings without external teacher labels.",
      "Reinforcement learning optimizes decision policies through environmental rewards and penalties.",
      "Overfitting occurs when a model memorizes training noise instead of generalizing to unseen real-world data."
    ],
    "examFocus": {
      "skills": [
        "Quote and dissect Tom Mitchell's definition of machine learning with task, experience, and performance terms (3 marks).",
        "Compare Supervised, Unsupervised, and Reinforcement Learning across inputs, feedback, and applications (5 marks).",
        "Differentiate between Classification and Regression with concrete examples.",
        "Categorize a set of given real-world problem scenarios into their proper ML paradigms."
      ],
      "commonTraps": "Do not confuse 'Unsupervised Learning' with 'Reinforcement Learning'. Unsupervised learning finds static data clusters; Reinforcement learning learns dynamic sequential action policies."
    },
    "selfCheck": {
      "question": "In Tom Mitchell's machine learning definition: 'A computer program is said to learn from experience E with respect to task T and performance measure P', predicting credit card fraud from historical transactions is an example of which component?",
      "options": [
        "Performance measure P",
        "Task T",
        "Experience E",
        "Hyperparameter"
      ],
      "answer": "Task T",
      "explanation": "Classifying whether a transaction is fraudulent or legitimate is the specific Task T being performed by the machine learning algorithm."
    },
    "nextRecommendedTopic": {
      "topicId": "ml-m2-t3",
      "title": "Logistic Regression and Decision Boundary",
      "reason": "Build upon supervised classification by exploring the foundational binary classification algorithm."
    }
  },
  "ml-m2-t3": {
    "topicId": "ml-m2-t3",
    "title": "Logistic Regression and Decision Boundary",
    "subjectCode": "24CSR504",
    "subjectName": "Machine Learning",
    "moduleTitle": "Module II — Regression & Classification",
    "estimatedMinutes": 45,
    "difficulty": "medium",
    "understand": {
      "title": "Let's understand it",
      "headline": "Squashing linear equations into calibrated probabilities",
      "problemSolved": "Linear regression predicts continuous values: y = wᵀx + b. But what if we try to use linear regression for binary classification (e.g. Tumor Malignant: 1 vs Benign: 0)? Linear regression produces predictions like -3.5 or +14.8! Probabilities cannot be negative or greater than 1.0. Furthermore, adding extreme outlier data points tilts the linear regression line, ruining the classification threshold. Logistic Regression solves this by wrapping the linear equation inside a Sigmoid function that smoothly squashes any real number into a valid probability between 0 and 1.",
      "routerDecision": "If the output probability P(y=1|x) ≥ 0.5, predict Class 1. Otherwise, predict Class 0. The surface where P(y=1|x) = 0.5 is the Decision Boundary.",
      "terminology": [
        {
          "term": "Sigmoid / Logistic Function σ(z)",
          "def": "σ(z) = 1 / (1 + e⁻ᶻ), mapping (-∞, +∞) strictly into (0, 1)."
        },
        {
          "term": "Log-Odds / Logit",
          "def": "z = ln(p / (1 - p)) = wᵀx + b, showing that log-odds are linear in features."
        },
        {
          "term": "Decision Boundary",
          "def": "The geometric hyperplane where wᵀx + b = 0 separating the two classes."
        },
        {
          "term": "Binary Cross-Entropy Loss",
          "def": "J(w) = -1/m ∑ [y·log(h(x)) + (1-y)·log(1 - h(x))], a convex loss function for logistic regression."
        }
      ],
      "summaryTakeaway": "Logistic Regression is a classification algorithm that models the probability of a binary outcome using a linear decision boundary."
    },
    "whyItMatters": {
      "analogy": "Think of a dimmer switch on a light bulb. A regular light switch is digital: either 0 or 1. A linear slider might try to turn dial to 500% power and blow the bulb! The Sigmoid curve is like an S-shaped soft dimmer: smoothly transitioning between completely dark (0.0) and fully illuminated (1.0) without ever jumping out of bounds.",
      "academicConnection": "Logistic Regression remains the gold standard baseline for classification across medicine, finance, advertising click-through rate (CTR) prediction, and credit scoring due to its interpretability and calibrated probability outputs."
    },
    "howItWorks": {
      "category": "mathematical",
      "overview": "Mathematical formulation from hypothesis to cross-entropy optimization.",
      "steps": [
        {
          "step": 1,
          "title": "Linear Combination (Logit)",
          "content": "Compute z = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ = wᵀx."
        },
        {
          "step": 2,
          "title": "Sigmoid Activation",
          "content": "Pass z through the logistic function: h_w(x) = σ(z) = 1 / (1 + e⁻ʷᵀˣ) = P(y=1|x; w)."
        },
        {
          "step": 3,
          "title": "Decision Thresholding",
          "content": "Predict ŷ = 1 if h_w(x) ≥ 0.5 (which occurs whenever wᵀx ≥ 0). Predict ŷ = 0 otherwise."
        },
        {
          "step": 4,
          "title": "Cross-Entropy Loss & Gradient Descent",
          "content": "Mean Squared Error produces non-convex local minima with sigmoid. We use convex Cross-Entropy Loss J(w) and update weights using gradient: ∂J/∂wⱼ = 1/m ∑ (h(x⁽ⁱ⁾) - y⁽ⁱ⁾) xⱼ⁽ⁱ⁾."
        }
      ]
    },
    "example": {
      "title": "Worked Numerical: Computing Probability & Class Prediction",
      "scenario": "A logistic model for student exam passing has weights w₀ (bias) = -4, w₁ (hours studied) = 0.8. A student studies for 6 hours (x₁ = 6).",
      "steps": [
        {
          "stage": "Given",
          "details": "Model: z = w₀ + w₁x₁ = -4 + 0.8(6). Threshold = 0.5."
        },
        {
          "stage": "Formula",
          "details": "h(x) = 1 / (1 + e⁻ᶻ)."
        },
        {
          "stage": "Substitution",
          "details": "z = -4 + 4.8 = +0.8.\\nh(x) = 1 / (1 + e⁻⁰·⁸)."
        },
        {
          "stage": "Calculation",
          "details": "e⁻⁰·⁸ ≈ 0.4493.\\nh(x) = 1 / (1 + 0.4493) = 1 / 1.4493 ≈ 0.690 (69.0%)."
        },
        {
          "stage": "Answer",
          "details": "Since 0.690 ≥ 0.5, the model predicts the student will PASS (Class 1) with 69.0% confidence."
        }
      ],
      "keyInsight": "At exactly 5 hours of study, z = -4 + 0.8(5) = 0. h(0) = 1/(1+1) = 0.5. Thus, 5 hours is the exact decision boundary!"
    },
    "keyPoints": [
      "Despite its name containing 'Regression', Logistic Regression is used for Classification.",
      "The Sigmoid function σ(z) = 1 / (1 + e⁻ᶻ) maps the real line (-∞, ∞) into probability interval (0, 1).",
      "The decision boundary is the surface where wᵀx = 0 (corresponding to σ(0) = 0.5).",
      "Binary Cross-Entropy (Log Loss) is used instead of MSE because it guarantees a convex loss curve with a single global minimum.",
      "Regularization (L1 Lasso or L2 Ridge) is added to prevent weights from growing infinitely when classes are linearly separable."
    ],
    "examFocus": {
      "skills": [
        "State the hypothesis equation of logistic regression and sketch the Sigmoid curve (3 marks).",
        "Explain why Mean Squared Error is unsuitable for logistic regression and write the Binary Cross-Entropy loss formula (5 marks).",
        "Derive the equation of the linear decision boundary for given weight values (5-7 marks).",
        "Compute class probability and predict labels for given numerical feature values."
      ],
      "commonTraps": "Confusing linear regression with logistic regression on exam theory questions. Always emphasize that the Sigmoid function provides a probabilistic classification boundary."
    },
    "selfCheck": {
      "question": "What is the output range of the Sigmoid activation function σ(z) = 1 / (1 + e^-z)?",
      "options": [
        "[-1, 1]",
        "(0, 1)",
        "[0, ∞)",
        "(-∞, ∞)"
      ],
      "answer": "(0, 1)",
      "explanation": "The Sigmoid function maps any real-valued number into the open interval (0, 1), making its output conveniently interpretable as a probability."
    },
    "nextRecommendedTopic": {
      "topicId": "ml-m3-t2",
      "title": "k-Means Clustering",
      "reason": "Shift from supervised classification to unsupervised clustering techniques."
    }
  },
  "ml-m3-t2": {
    "topicId": "ml-m3-t2",
    "title": "k-Means Clustering",
    "subjectCode": "24CSR504",
    "subjectName": "Machine Learning",
    "moduleTitle": "Module III — Unsupervised Learning",
    "estimatedMinutes": 45,
    "difficulty": "medium",
    "understand": {
      "title": "Let's understand it",
      "headline": "Partitioning unlabeled data into k compact spatial clusters",
      "problemSolved": "Imagine an online retail company with 10 million customer profiles containing purchase frequency and average basket size. The marketing team wants to design customized marketing campaigns, but they have no prior customer categories or labels. What problem does k-Means solve? It discovers natural groupings in the data by partitioning points into k distinct clusters where points in the same cluster are as close as possible to each other.",
      "routerDecision": "k-Means works by alternating between two simple steps: 1) Assign every data point to its nearest centroid; 2) Move each centroid to the geometric mean of all points assigned to it. Repeat until centroids stop moving.",
      "terminology": [
        {
          "term": "Centroid",
          "def": "The center point (mean vector) representing a specific cluster."
        },
        {
          "term": "k",
          "def": "The predetermined number of clusters to form (a user-specified hyperparameter)."
        },
        {
          "term": "WCSS (Within-Cluster Sum of Squares)",
          "def": "The objective loss function: ∑ ∑ ||xᵢ - μⱼ||², measuring total cluster dispersion."
        },
        {
          "term": "Elbow Method",
          "def": "A heuristic method for choosing optimal k by plotting WCSS against k and identifying the sharp bend (elbow)."
        }
      ],
      "summaryTakeaway": "k-Means is an expectation-maximization algorithm: assign points to nearest centers, recalculate centers, repeat until stable."
    },
    "whyItMatters": {
      "analogy": "Imagine three political candidates opening campaign offices in a city. Voters naturally register at the office closest to their homes. After seeing where their voters live, each candidate relocates their office to the exact center of their registered voter population. Voters re-check distances, and candidates nudge their offices again until nobody needs to switch.",
      "academicConnection": "k-Means is universally utilized for customer segmentation, image color quantization (compressing 24-bit images to 16 colors), document clustering, and astronomical star classification."
    },
    "howItWorks": {
      "category": "algorithmic",
      "overview": "Lloyd's algorithm: iterative minimization of Within-Cluster Sum of Squares (WCSS).",
      "steps": [
        {
          "step": 1,
          "title": "Centroid Initialization",
          "content": "Choose k initial centroid positions randomly from data points (or using k-Means++ to spread centroids apart)."
        },
        {
          "step": 2,
          "title": "Assignment Step (Expectation)",
          "content": "Compute the Euclidean distance from every point xᵢ to each centroid μⱼ. Assign each point to its closest centroid: c⁽ⁱ⁾ = argmin_j ||x⁽ⁱ⁾ - μⱼ||²."
        },
        {
          "step": 3,
          "title": "Update Step (Maximization)",
          "content": "Recalculate each centroid position as the arithmetic mean of all data points currently assigned to that cluster: μⱼ = (1 / |Cⱼ|) ∑_{i ∈ Cⱼ} x⁽ⁱ⁾."
        },
        {
          "step": 4,
          "title": "Convergence Check",
          "content": "Repeat steps 2 and 3 until centroid coordinates do not change (or change is below tolerance ε), or max iterations reached."
        }
      ]
    },
    "example": {
      "title": "Worked Numerical: 1D k-Means Clustering Step",
      "scenario": "Given 1D data points: [2, 4, 10, 12, 3, 20]. We want k = 2 clusters. Initial centroids chosen: μ₁ = 2, μ₂ = 12.",
      "steps": [
        {
          "stage": "Given",
          "details": "Points: {2, 3, 4, 10, 12, 20}. Initial centroids: μ₁ = 2, μ₂ = 12."
        },
        {
          "stage": "Step 1: Distance & Assignment",
          "details": "• Point 2: dist to μ₁(2) = 0, dist to μ₂(12) = 10 → Cluster 1\\n• Point 3: dist to μ₁(2) = 1, dist to μ₂(12) = 9 → Cluster 1\\n• Point 4: dist to μ₁(2) = 2, dist to μ₂(12) = 8 → Cluster 1\\n• Point 10: dist to μ₁(2) = 8, dist to μ₂(12) = 2 → Cluster 2\\n• Point 12: dist to μ₁(2) = 10, dist to μ₂(12) = 0 → Cluster 2\\n• Point 20: dist to μ₁(2) = 18, dist to μ₂(12) = 8 → Cluster 2\\n\\nCluster 1: {2, 3, 4}; Cluster 2: {10, 12, 20}."
        },
        {
          "stage": "Step 2: Recalculate Centroids",
          "details": "New μ₁ = (2 + 3 + 4) / 3 = 9 / 3 = 3.0.\\nNew μ₂ = (10 + 12 + 20) / 3 = 42 / 3 = 14.0."
        },
        {
          "stage": "Step 3: Re-Assignment Check",
          "details": "Check with new centroids μ₁ = 3, μ₂ = 14:\\nMidpoint between centroids is (3 + 14) / 2 = 8.5.\\nPoints < 8.5 ({2, 3, 4}) belong to Cluster 1.\\nPoints > 8.5 ({10, 12, 20}) belong to Cluster 2.\\nAssignments did not change!"
        },
        {
          "stage": "Answer",
          "details": "Algorithm has converged in 2 iterations! Cluster 1 centered at 3.0, Cluster 2 centered at 14.0."
        }
      ],
      "keyInsight": "k-Means is guaranteed to converge because the objective function (WCSS) decreases or stays constant at every single step."
    },
    "keyPoints": [
      "k-Means is an iterative unsupervised algorithm that minimizes Within-Cluster Sum of Squares (WCSS).",
      "Requires pre-specifying hyperparameter k (often selected using the Elbow Method or Silhouette Score).",
      "Sensitive to initial centroid locations; k-Means++ initialization spreads starting centroids to avoid poor local minima.",
      "Assumes spherical, equally-sized clusters; struggles with elongated shapes or varying cluster densities.",
      "Sensitive to outliers, because arithmetic means are pulled dramatically by extreme data points."
    ],
    "examFocus": {
      "skills": [
        "Explain the step-by-step algorithm of k-Means clustering with flowcharts (5 marks).",
        "Manually trace 1 or 2 iterations of k-Means on a given numerical dataset (7-10 marks).",
        "Describe the Elbow Method and Silhouette Analysis for finding the optimal value of k (5 marks).",
        "Discuss the limitations of k-Means (sensitivity to initialization, outliers, non-spherical shapes)."
      ],
      "commonTraps": "Centroids do not have to be actual data points after the first update step; they are mathematical averages of the points in each cluster."
    },
    "selfCheck": {
      "question": "What is the key improvement of k-Means++ initialization over standard random centroid initialization?",
      "options": [
        "It automatically discovers the optimal number of clusters k",
        "It spaces out initial centroids by sampling with probability proportional to squared distance",
        "It eliminates the need for Euclidean distance calculations",
        "It removes outlier points before clustering"
      ],
      "answer": "It spaces out initial centroids by sampling with probability proportional to squared distance",
      "explanation": "k-Means++ selects subsequent centroids with probability proportional to their squared Euclidean distance from existing centroids, preventing centroids from clustering tightly together."
    },
    "nextRecommendedTopic": {
      "topicId": "ml-m4-t4",
      "title": "Perceptron and Backpropagation",
      "reason": "Advance from traditional ML algorithms to foundational artificial neural networks."
    }
  },
  "ml-m4-t4": {
    "topicId": "ml-m4-t4",
    "title": "Perceptron and Backpropagation",
    "subjectCode": "24CSR504",
    "subjectName": "Machine Learning",
    "moduleTitle": "Module IV — Neural Networks",
    "estimatedMinutes": 60,
    "difficulty": "hard",
    "understand": {
      "title": "Let's understand it",
      "headline": "The artificial brain cell and the engine of deep learning",
      "problemSolved": "In 1957, Frank Rosenblatt created the Perceptron, inspired by biological brain neurons. A single perceptron computes a weighted sum of inputs and fires an output if that sum exceeds a threshold. However, in 1969, Minsky and Papert proved that a single-layer perceptron cannot even solve the simple XOR problem because XOR is not linearly separable! Neural network research froze until the 1980s, when Backpropagation showed how to train multi-layer networks by propagating error gradients backward through hidden layers using the calculus chain rule.",
      "routerDecision": "A neural network operates in two passes: 1) Forward Pass (calculate predictions from inputs to outputs); 2) Backward Pass (propagate loss gradients from outputs back to inputs to update weights).",
      "terminology": [
        {
          "term": "Perceptron",
          "def": "The fundamental artificial neuron computing y = f(∑ wᵢxᵢ + b)."
        },
        {
          "term": "Activation Function",
          "def": "Non-linear function (Sigmoid, ReLU, Tanh) applied to neuron outputs, enabling networks to learn non-linear patterns."
        },
        {
          "term": "Hidden Layers",
          "def": "Intermediate layers between input and output that extract hierarchical feature representations."
        },
        {
          "term": "Backpropagation",
          "def": "Algorithm calculating the gradient of the loss function with respect to every weight using the chain rule of calculus."
        }
      ],
      "summaryTakeaway": "Forward pass computes predictions. Loss function measures mistakes. Backpropagation calculates blame. Gradient descent updates weights."
    },
    "whyItMatters": {
      "analogy": "Imagine an assembly line of factory workers building a watch. The final watch has a loose gear. The supervisor (loss function) notices the defect at the final inspection. The supervisor tells the last worker what went wrong, that worker points out which part came loose from the previous worker, and each worker adjusts their screwdriver tension. That blame-assignment chain is Backpropagation.",
      "academicConnection": "Backpropagation is the universal algorithm powering all modern deep learning — from convolutional vision networks (CNNs) to massive language models (LLMs like Gemini and GPT)."
    },
    "howItWorks": {
      "category": "mathematical",
      "overview": "The two-phase execution cycle: Forward Propagation and Backward Chain-Rule Propagation.",
      "steps": [
        {
          "step": 1,
          "title": "Forward Propagation",
          "content": "For each layer l: compute linear combination z^[l] = W^[l] a^[l-1] + b^[l], then apply activation a^[l] = g(z^[l]). Repeat until output layer y_hat is produced."
        },
        {
          "step": 2,
          "title": "Compute Output Error",
          "content": "Evaluate Loss J(y_hat, y). Calculate derivative of loss with respect to output activation: dL/da^[L]."
        },
        {
          "step": 3,
          "title": "Backward Error Propagation (Chain Rule)",
          "content": "For each layer moving backwards: δ^[l] = dL/dz^[l] = (W^[l+1]ᵀ δ^[l+1]) ⊙ g'(z^[l]). Gradient for weights: dL/dW^[l] = δ^[l] (a^[l-1])ᵀ."
        },
        {
          "step": 4,
          "title": "Weight Update",
          "content": "Adjust all weights using gradient descent: W^[l] := W^[l] - α (dL/dW^[l])."
        }
      ]
    },
    "example": {
      "title": "Worked Numerical: Single Perceptron Forward Pass & Update",
      "scenario": "A perceptron has weights w₁ = 0.5, w₂ = -0.3, bias b = 0.1, learning rate α = 0.2, step activation (output 1 if z ≥ 0, else 0). Input is x₁ = 2, x₂ = 1, target y = 1.",
      "steps": [
        {
          "stage": "Given",
          "details": "w = [0.5, -0.3], b = 0.1, x = [2, 1], Target y = 1, α = 0.2."
        },
        {
          "stage": "Forward Pass",
          "details": "z = w₁x₁ + w₂x₂ + b = (0.5 × 2) + (-0.3 × 1) + 0.1\\nz = 1.0 - 0.3 + 0.1 = 0.8.\\nSince z = 0.8 ≥ 0, predicted output ŷ = 1."
        },
        {
          "stage": "Error Evaluation",
          "details": "Error = Target - Output = 1 - 1 = 0.\\nSince error is 0, the prediction was correct!"
        },
        {
          "stage": "Counter-Example (Target = 0)",
          "details": "If target had been y = 0: Error = 0 - 1 = -1.\\nPerceptron Update Rule: w_new = w_old + α · (y - ŷ) · x\\nw₁_new = 0.5 + 0.2(-1)(2) = 0.5 - 0.4 = 0.1.\\nw₂_new = -0.3 + 0.2(-1)(1) = -0.3 - 0.2 = -0.5.\\nb_new = 0.1 + 0.2(-1) = -0.1."
        },
        {
          "stage": "Answer",
          "details": "Weights successfully updated to penalize the false positive activation."
        }
      ],
      "keyInsight": "Rosenblatt's perceptron learning rule only modifies weights when the perceptron makes a mistake; correct predictions trigger zero update."
    },
    "keyPoints": [
      "A single-layer perceptron can only learn linearly separable functions; it cannot solve the XOR problem.",
      "Multi-Layer Perceptrons (MLPs) with non-linear activation functions are Universal Function Approximators.",
      "Activation functions must be differentiable for backpropagation (e.g., Sigmoid, ReLU, Leaky ReLU, Tanh).",
      "Backpropagation is an efficient application of the multivariate chain rule from calculus.",
      "Vanishing Gradient Problem occurs with deep Sigmoid networks when gradients shrink exponentially near saturation."
    ],
    "examFocus": {
      "skills": [
        "Draw and explain the architecture of an artificial neuron (Perceptron) with mathematical equations (5 marks).",
        "Demonstrate why a single perceptron fails to solve the XOR logic function with a diagram (5 marks).",
        "Derive the backpropagation weight update equations using the chain rule for a 2-layer network (10 marks).",
        "Compare activation functions: Sigmoid vs Tanh vs ReLU, highlighting gradient saturation."
      ],
      "commonTraps": "Claiming that backpropagation updates weights directly. Backpropagation ONLY computes the gradients (derivatives); the optimizer (e.g., SGD or Adam) uses those gradients to update weights."
    },
    "selfCheck": {
      "question": "Why is a single-layer perceptron mathematically incapable of learning the XOR function?",
      "options": [
        "XOR outputs continuous real values",
        "The XOR truth table is not linearly separable in 2D space",
        "Perceptrons cannot compute logical AND operations",
        "Gradient descent does not converge for binary inputs"
      ],
      "answer": "The XOR truth table is not linearly separable in 2D space",
      "explanation": "The XOR function has inputs (0,1) and (1,0) mapping to 1, while (0,0) and (1,1) map to 0. No single straight line (hyperplane) can divide these classes."
    },
    "nextRecommendedTopic": {
      "topicId": "ml-m1-t2",
      "title": "Machine Learning Pipeline and Workflow",
      "reason": "Now that you understand algorithms and neural networks, learn how to build complete production ML pipelines."
    }
  },
  "cn-m1-t2": {
    "topicId": "cn-m1-t2",
    "title": "Transmission Modes and Physical Topologies",
    "subjectCode": "24CST501",
    "subjectName": "Computer Networks",
    "moduleTitle": "Module I — Physical & Data Link Layers",
    "estimatedMinutes": 30,
    "difficulty": "easy",
    "understand": "Transmission modes define the direction of signal flow between two devices (Simplex, Half-Duplex, Full-Duplex), while network topologies define the physical geometric arrangement of links and nodes (Star, Mesh, Ring, Bus, and Hybrid).",
    "whyItMatters": "Choosing the wrong topology leads to single-point failures and excessive cabling costs. For example, modern office Ethernet and Wi-Fi utilize star topologies via switches/access points for fault isolation.",
    "howItWorks": [
      "Simplex mode allows unidirectional communication (e.g. keyboard to monitor).",
      "Half-Duplex mode allows bidirectional communication but only one direction at a time (e.g. walkie-talkie).",
      "Full-Duplex mode allows simultaneous bidirectional transmission (e.g. telephone system).",
      "In a Star topology, all devices connect to a central hub/switch; failure of a cable only affects that node.",
      "In a Mesh topology, every node connects to every other node with n*(n-1)/2 links, providing high redundancy."
    ],
    "example": "In a company LAN with 10 computers: A Star topology requires 10 patch cables connected to a central switch. A fully connected Mesh topology would require 10*(9)/2 = 45 separate dedicated cables.",
    "keyPoints": [
      "Simplex = 1-way; Half-Duplex = 2-way sequential; Full-Duplex = 2-way simultaneous.",
      "Star topology is the dominant LAN standard due to ease of troubleshooting and node isolation.",
      "Mesh provides the highest fault tolerance and security but has O(n²) cabling cost.",
      "Bus topology uses a single backbone cable terminated with resistors, prone to single-point failure."
    ],
    "examFocus": [
      "Compare Star vs Mesh topology with connection formulas and trade-offs (5 marks).",
      "Differentiate Simplex, Half-Duplex, and Full-Duplex transmission with examples (3 marks)."
    ],
    "selfCheck": {
      "question": "How many physical links are required to connect 8 computers in a fully meshed network topology?",
      "options": [
        "16 links",
        "28 links",
        "56 links",
        "8 links"
      ],
      "answer": "28 links",
      "correctIndex": 1,
      "explanation": "A fully connected mesh topology requires n*(n-1)/2 duplex links. For 8 nodes: (8 * 7) / 2 = 56 / 2 = 28 physical links."
    }
  },
  "cn-m1-t3": {
    "topicId": "cn-m1-t3",
    "title": "Transmission Media and Performance Metrics",
    "subjectCode": "24CST501",
    "subjectName": "Computer Networks",
    "moduleTitle": "Module I — Physical & Data Link Layers",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "Transmission media form the physical pathway carrying communication signals between sender and receiver. They are categorized as Guided (Twisted Pair, Coaxial, Fiber Optics) and Unguided (Radio waves, Microwaves, Infrared). Network performance is evaluated using Bandwidth, Latency, Throughput, and Jitter.",
    "whyItMatters": "Fiber optic cables use total internal reflection to transmit data at the speed of light in glass, enabling global internet backbones with gigabit speeds over thousands of kilometers without electromagnetic interference.",
    "howItWorks": [
      "Twisted Pair cables twist wire pairs to cancel out electromagnetic crosstalk from external sources.",
      "Fiber Optic cables transmit optical pulses through a glass core surrounded by cladding with lower refractive index.",
      "Bandwidth is the maximum data carrying capacity of a link in bits per second (bps).",
      "Total Latency = Propagation Delay (d/s) + Transmission Delay (L/R) + Queuing Delay + Processing Delay.",
      "Throughput is the actual rate of successful data delivery, always bounded by the bottleneck link."
    ],
    "example": "Sending a 1 MB packet over a 10 Mbps link: Transmission delay = (1 * 8 * 10^6 bits) / (10 * 10^6 bps) = 0.8 seconds.",
    "keyPoints": [
      "Fiber optics offer the highest bandwidth and immune to EMI, but are brittle and costlier to splice.",
      "Transmission delay = Packet Length / Bandwidth (L/R).",
      "Propagation delay = Distance / Signal Speed (d/s).",
      "Throughput is actual measured performance, whereas Bandwidth is theoretical maximum capacity."
    ],
    "examFocus": [
      "Derive total latency components and calculate transmission vs propagation delay (5 marks).",
      "Compare Guided vs Unguided transmission media characteristics (3 marks)."
    ],
    "selfCheck": {
      "question": "Which delay component directly depends on the length of the physical transmission cable and the speed of light in the medium?",
      "options": [
        "Transmission Delay",
        "Propagation Delay",
        "Queuing Delay",
        "Processing Delay"
      ],
      "answer": "Propagation Delay",
      "correctIndex": 1,
      "explanation": "Propagation delay is the time required for a bit to travel from sender to receiver across the physical distance: Propagation Delay = Distance / Propagation Speed."
    }
  },
  "cn-m1-t4": {
    "topicId": "cn-m1-t4",
    "title": "Framing, Error Detection and Flow Control",
    "subjectCode": "24CST501",
    "subjectName": "Computer Networks",
    "moduleTitle": "Module I — Physical & Data Link Layers",
    "estimatedMinutes": 40,
    "difficulty": "medium",
    "understand": "The Data Link Layer transforms raw physical bit streams into structured frames, checks for bit errors caused by channel noise (Parity, Checksum, CRC), and regulates transmission speed between fast senders and slow receivers using Flow Control protocols.",
    "whyItMatters": "Without framing and error detection, receivers would misinterpret scrambled bits as valid data. Flow control prevents buffer overflows in resource-constrained IoT devices and routers.",
    "howItWorks": [
      "Framing demarcates frame boundaries using character count, byte stuffing (flag bytes), or bit stuffing (01111110 flag).",
      "In Bit Stuffing, the sender automatically inserts a 0 after five consecutive 1s to prevent false flag detection.",
      "Cyclic Redundancy Check (CRC) treats binary strings as polynomial coefficients and computes the remainder via modulo-2 division.",
      "Stop-and-Wait protocol requires the sender to wait for an ACK before transmitting the next frame.",
      "Sliding Window protocols (Go-Back-N and Selective Repeat) allow pipelining multiple frames up to window size W."
    ],
    "example": "Bit stuffing rule: If the data is '01111110', after five 1s the sender inserts a 0 to produce '011111010'. The receiver strips the inserted 0.",
    "keyPoints": [
      "Bit stuffing inserts a 0 bit after any sequence of five consecutive 1 bits.",
      "CRC provides robust burst error detection using polynomial modulo-2 arithmetic.",
      "Stop-and-Wait has poor link utilization over long distances (Bandwidth-Delay Product).",
      "Go-Back-N retransmits all subsequent frames upon error; Selective Repeat retransmits only the corrupted frame."
    ],
    "examFocus": [
      "Compute CRC checksum given data bit string and generator polynomial (7 marks).",
      "Explain Bit Stuffing and Byte Stuffing with example bit streams (5 marks).",
      "Compare Go-Back-N and Selective Repeat flow control protocols (5 marks)."
    ],
    "selfCheck": {
      "question": "In bit stuffing with flag 01111110, what does the transmitter insert whenever it detects five consecutive 1s in the data stream?",
      "options": [
        "A 1 bit",
        "A 0 bit",
        "An ESC byte",
        "A parity bit"
      ],
      "answer": "A 0 bit",
      "correctIndex": 1,
      "explanation": "To prevent the data from accidentally creating a flag byte (01111110), the transmitter automatically stuffs a 0 bit after five consecutive 1s."
    }
  },
  "cn-m2-t1": {
    "topicId": "cn-m2-t1",
    "title": "Network Layer Functions and Design Issues",
    "subjectCode": "24CST501",
    "subjectName": "Computer Networks",
    "moduleTitle": "Module II — Network Layer",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "The Network Layer is responsible for host-to-host packet delivery across heterogeneous networks. Its primary tasks include routing (determining the best path), forwarding (relaying packets from input to output link), logical addressing, and managing subnet congestion.",
    "whyItMatters": "While Data Link Layer handles hops between adjacent neighbors, the Network layer enables end-to-end communication from a client in India to a web server in California traversing dozens of intermediate routers.",
    "howItWorks": [
      "Store-and-forward packet switching: Routers accept packets, buffer them, verify checksums, and forward them along the outbound link.",
      "Connectionless Service (Datagram subnet): Each packet is routed independently with full destination IP; paths may differ.",
      "Connection-Oriented Service (Virtual-Circuit subnet): A logical circuit path is established before data transfer; all packets follow this pre-determined route.",
      "Forwarding tables in routers map destination address prefixes to specific physical outgoing interfaces."
    ],
    "example": "In the internet (Datagram network), if Router R1 becomes congested, subsequent packets of the same video stream can be rerouted through Router R2 seamlessly.",
    "keyPoints": [
      "Routing = Control Plane (building the path table). Forwarding = Data Plane (switching packet to interface).",
      "Datagram subnets are robust to router failures because subsequent packets adapt dynamically.",
      "Virtual Circuits provide guaranteed in-order delivery and QoS reservation, but setup latency is higher.",
      "Network Layer headers contain logical 32-bit (IPv4) or 128-bit (IPv6) source and destination addresses."
    ],
    "examFocus": [
      "Compare Virtual Circuit subnets vs Datagram subnets (5 marks).",
      "Explain the store-and-forward packet switching mechanism (3 marks)."
    ],
    "selfCheck": {
      "question": "In a datagram (connectionless) network subnet, which of the following is true?",
      "options": [
        "A connection must be setup before transmitting packets",
        "Every packet is routed independently and may take different paths",
        "All packets are guaranteed to arrive in strict sequential order",
        "Routers maintain per-connection state tables"
      ],
      "answer": "Every packet is routed independently and may take different paths",
      "correctIndex": 1,
      "explanation": "In datagram networks (like IP), each packet contains full destination addressing and is routed independently, meaning packets may take different routes and arrive out-of-order."
    }
  },
  "cn-m2-t3": {
    "topicId": "cn-m2-t3",
    "title": "IPv4/IPv6 Addressing",
    "subjectCode": "24CST501",
    "subjectName": "Computer Networks",
    "moduleTitle": "Module II — Network Layer",
    "estimatedMinutes": 40,
    "difficulty": "medium",
    "understand": "IP addresses are globally unique logical identifiers assigned to network interfaces. IPv4 uses 32-bit addresses divided into network and host portions. Due to address exhaustion, IPv6 was introduced with 128-bit addresses, hierarchical routing, simplified headers, and native security.",
    "whyItMatters": "With billions of smartphones, cloud containers, and IoT sensors online, IPv4's 4.3 billion addresses were exhausted. IPv6 provides 2^128 addresses—enough for sextillions of addresses per person.",
    "howItWorks": [
      "IPv4 addresses are written in dotted-decimal notation: 4 bytes (e.g. 192.168.1.1).",
      "Classful IPv4: Class A (/8), Class B (/16), Class C (/24), Class D (Multicast), Class E (Experimental).",
      "IPv4 header contains Version, IHL, Type of Service, Total Length, Identification, Flags, Fragment Offset, TTL, Protocol, Header Checksum, Source IP, Destination IP.",
      "Time to Live (TTL) decrements by 1 at each router hop to prevent packets from looping endlessly.",
      "IPv6 addresses are written in 8 groups of 4 hexadecimal digits separated by colons (e.g. 2001:0db8:85a3::8a2e:0370:7334)."
    ],
    "example": "Compressing an IPv6 address: 2001:0db8:0000:0000:0000:0000:0000:0001 compresses to 2001:db8::1 using zero compression ('::' can only be used once).",
    "keyPoints": [
      "IPv4 is 32 bits (4 bytes); IPv6 is 128 bits (16 bytes).",
      "TTL field in IPv4 prevents infinite routing loops.",
      "IPv6 removes the header checksum to speed up router processing (delegates error checking to L4).",
      "Private IPv4 ranges (RFC 1918): 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16."
    ],
    "examFocus": [
      "Draw and explain the IPv4 header format with function of each field (7 marks).",
      "Compare IPv4 and IPv6 features, header differences and address notation (5 marks)."
    ],
    "selfCheck": {
      "question": "What is the primary purpose of the Time to Live (TTL) field in an IPv4 packet header?",
      "options": [
        "To measure latency between source and destination",
        "To prevent packets from looping endlessly in routing loops",
        "To guarantee packet delivery within a fixed deadline",
        "To negotiate transmission window size"
      ],
      "answer": "To prevent packets from looping endlessly in routing loops",
      "correctIndex": 1,
      "explanation": "Each router that forwards an IPv4 packet decrements the TTL field by 1. When TTL reaches 0, the packet is dropped and an ICMP Time Exceeded message is sent back, preventing infinite loops."
    }
  },
  "cn-m3-t1": {
    "topicId": "cn-m3-t1",
    "title": "Transport Layer Services and Primitives",
    "subjectCode": "24CST501",
    "subjectName": "Computer Networks",
    "moduleTitle": "Module III — Transport & Application Layers",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "The Transport Layer provides logical process-to-process communication between running applications on different hosts. It achieves this using 16-bit Port numbers to multiplex multiple application data streams over a single network connection.",
    "whyItMatters": "Without the Transport layer, your computer would receive packets from the web but wouldn't know whether to route them to your Spotify music player, Chrome tab, or Zoom call.",
    "howItWorks": [
      "Multiplexing at sender: Gathers data from various application sockets, adds port numbers, and passes to Network layer.",
      "Demultiplexing at receiver: Reads destination port in transport header and delivers segment to corresponding socket.",
      "Port ranges: Well-known (0-1023, e.g., HTTP 80, HTTPS 443, DNS 53), Registered (1024-49151), Ephemeral/Dynamic (49152-65535).",
      "Transport primitives (LISTEN, CONNECT, SEND, RECEIVE, DISCONNECT) define standard API socket calls.",
      "A Socket Address is defined as (IP Address, Port Number)."
    ],
    "example": "Your laptop running two browser tabs opens dynamic ports 54321 and 54322 to connect to a web server at 93.184.216.34:443. The combination of IP and Port keeps each tab's session isolated.",
    "keyPoints": [
      "Transport layer delivers process-to-process, while Network layer delivers host-to-host.",
      "Socket address = IP address + Port number.",
      "Well-known ports (0–1023) are reserved for standard core internet protocols.",
      "Transport services include connection management, error control, and congestion control."
    ],
    "examFocus": [
      "Explain Transport Layer multiplexing and demultiplexing with socket addressing (5 marks).",
      "List standard transport service primitives and their functions (3 marks)."
    ],
    "selfCheck": {
      "question": "Which layer of the protocol stack is responsible for process-to-process communication using port numbers?",
      "options": [
        "Network Layer",
        "Transport Layer",
        "Data Link Layer",
        "Session Layer"
      ],
      "answer": "Transport Layer",
      "correctIndex": 1,
      "explanation": "The Transport Layer provides process-to-process communication. Port numbers identify the specific process or socket on the host."
    }
  },
  "cn-m3-t2": {
    "topicId": "cn-m3-t2",
    "title": "TCP and UDP",
    "subjectCode": "24CST501",
    "subjectName": "Computer Networks",
    "moduleTitle": "Module III — Transport & Application Layers",
    "estimatedMinutes": 40,
    "difficulty": "medium",
    "understand": "TCP (Transmission Control Protocol) and UDP (User Datagram Protocol) are the two core transport protocols of the Internet. TCP is connection-oriented, reliable, and byte-stream oriented; UDP is connectionless, lightweight, and datagram-oriented.",
    "whyItMatters": "Web banking, file transfers, and emails use TCP because no data loss can be tolerated. Online gaming, live video streaming, and DNS lookups use UDP because low latency is prioritized over retransmission delay.",
    "howItWorks": [
      "TCP 3-Way Handshake: Client sends SYN -> Server responds SYN-ACK -> Client sends ACK.",
      "TCP Connection Teardown: 4-way termination with FIN and ACK flags.",
      "TCP guarantees reliability using Sequence numbers, Cumulative Acknowledgments, and Retransmission Timers (RTO).",
      "UDP is a thin wrapper over IP: adds only 8 bytes of header (Source Port, Destination Port, Length, Checksum).",
      "UDP does not perform flow control, handshaking, or retransmission of lost packets."
    ],
    "example": "Watching a YouTube live stream: Audio/video frames are sent over UDP. If 2 video frames drop, the player renders the next frame instead of freezing to wait for retransmission.",
    "keyPoints": [
      "TCP header is 20 bytes (min); UDP header is exactly 8 bytes.",
      "TCP uses 3-way handshake (SYN, SYN-ACK, ACK) for connection setup.",
      "TCP provides reliable, in-order byte stream; UDP provides unreliable datagram delivery.",
      "TCP features flow control (sliding window) and congestion control; UDP does not."
    ],
    "examFocus": [
      "Draw TCP 3-way handshake connection establishment diagram with sequence numbers (5 marks).",
      "Compare TCP and UDP in terms of reliability, header overhead, and use cases (5 marks)."
    ],
    "selfCheck": {
      "question": "What is the minimum header size of a User Datagram Protocol (UDP) segment?",
      "options": [
        "20 bytes",
        "8 bytes",
        "16 bytes",
        "40 bytes"
      ],
      "answer": "8 bytes",
      "correctIndex": 1,
      "explanation": "UDP has a fixed 8-byte header consisting of four 16-bit fields: Source Port (2B), Destination Port (2B), Length (2B), and Checksum (2B)."
    }
  },
  "cn-m3-t3": {
    "topicId": "cn-m3-t3",
    "title": "Congestion Control",
    "subjectCode": "24CST501",
    "subjectName": "Computer Networks",
    "moduleTitle": "Module III — Transport & Application Layers",
    "estimatedMinutes": 40,
    "difficulty": "hard",
    "understand": "Congestion occurs when network load (offered traffic) exceeds the processing capacity of intermediate routers, causing packet loss, long queue delays, and throughput collapse. Congestion control mechanisms throttle traffic to maintain network stability.",
    "whyItMatters": "Without congestion control, every computer would retransmit lost packets aggressively, causing total internet gridlock (Congestion Collapse) where network throughput drops to near zero.",
    "howItWorks": [
      "Open-Loop Control: Prevents congestion proactively (Traffic Policing, Leaky Bucket, Token Bucket).",
      "Closed-Loop Control: Detects and reacts to congestion dynamically (Feedback, packet drop detection).",
      "Leaky Bucket algorithm shapes bursty traffic into a smooth constant-rate output stream.",
      "Token Bucket algorithm allows traffic bursts up to token capacity while enforcing an average rate.",
      "TCP Congestion Control phases: Slow Start (exponential cwnd increase), Congestion Avoidance (Additive Increase), Fast Retransmit, and Fast Recovery (Multiplicative Decrease — AIMD)."
    ],
    "example": "Token Bucket with capacity 10 tokens: If a 10-packet burst arrives when bucket is full, all 10 packets transmit immediately. Subsequent packets must wait for tokens to regenerate.",
    "keyPoints": [
      "Leaky Bucket provides constant output rate; Token Bucket accommodates bursts up to bucket size.",
      "TCP uses AIMD (Additive Increase, Multiplicative Decrease) to ensure fairness and efficiency.",
      "In Slow Start, cwnd doubles every RTT until it hits ssthresh (slow start threshold).",
      "Packet loss is treated by TCP as a signal of router buffer overflow."
    ],
    "examFocus": [
      "Explain Leaky Bucket vs Token Bucket traffic shaping algorithms with diagrams (7 marks).",
      "Explain TCP Slow Start and AIMD congestion control phases (5 marks)."
    ],
    "selfCheck": {
      "question": "In TCP congestion control, what happens to the congestion window (cwnd) during the Congestion Avoidance phase upon receiving successful acknowledgments?",
      "options": [
        "It doubles every RTT (exponential growth)",
        "It increases by 1 MSS per RTT (linear additive increase)",
        "It resets to 1 MSS immediately",
        "It remains completely constant"
      ],
      "answer": "It increases by 1 MSS per RTT (linear additive increase)",
      "correctIndex": 1,
      "explanation": "During Congestion Avoidance (once cwnd reaches ssthresh), TCP increases cwnd linearly by 1 Maximum Segment Size (MSS) per RTT (Additive Increase) to gently probe for available bandwidth."
    }
  },
  "cn-m3-t4": {
    "topicId": "cn-m3-t4",
    "title": "QoS Parameters and Application Layer Protocols",
    "subjectCode": "24CST501",
    "subjectName": "Computer Networks",
    "moduleTitle": "Module III — Transport & Application Layers",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "Quality of Service (QoS) guarantees specific performance levels for network traffic based on Bandwidth, Delay, Jitter (delay variation), and Packet Loss. The Application Layer provides user-facing network protocols like DNS, HTTP/HTTPS, FTP, and SMTP.",
    "whyItMatters": "Voice over IP (VoIP) calls can tolerate minor packet loss but sound robotic if jitter is high. Video streaming needs high throughput and buffering to smooth out jitter.",
    "howItWorks": [
      "Jitter is the variance in packet arrival delay; jitter buffers smooth playout at the destination.",
      "DNS (Domain Name System) translates human-readable hostnames (e.g. google.com) to IP addresses using hierarchical distributed servers over port 53 (UDP/TCP).",
      "HTTP/1.1 introduced persistent connections; HTTP/2 added multiplexed binary streams; HTTP/3 runs over QUIC (UDP) to eliminate head-of-line blocking.",
      "FTP uses two separate connections: Control (Port 21) and Data (Port 20).",
      "SMTP (Port 25) sends emails; POP3 (Port 110) and IMAP (Port 143) retrieve emails from mail servers."
    ],
    "example": "Typing 'ktu.edu.in' in your browser triggers a recursive DNS query to root servers -> .in TLD servers -> KTU authoritative name server to resolve the web server IP address.",
    "keyPoints": [
      "QoS metrics: Throughput, Delay, Jitter, Packet Loss Ratio.",
      "DNS uses port 53; translates domain names to IP addresses.",
      "HTTP/HTTPS use port 80 and 443; REST APIs and web applications.",
      "FTP is out-of-band: separate control connection (21) and data connection (20)."
    ],
    "examFocus": [
      "Explain the DNS resolution process (Iterative vs Recursive queries) (5 marks).",
      "Define QoS parameters: Latency, Jitter, Bandwidth, Loss (3 marks)."
    ],
    "selfCheck": {
      "question": "Which application layer protocol translates domain names like 'wikipedia.org' into numeric IP addresses?",
      "options": [
        "HTTP",
        "DNS",
        "DHCP",
        "SNMP"
      ],
      "answer": "DNS",
      "correctIndex": 1,
      "explanation": "The Domain Name System (DNS) is the distributed database and protocol that maps human-friendly domain names to machine-routable IP addresses."
    }
  },
  "cn-m4-t1": {
    "topicId": "cn-m4-t1",
    "title": "Li-Fi and Programmable MAC",
    "subjectCode": "24CST501",
    "subjectName": "Computer Networks",
    "moduleTitle": "Module IV — Advanced Topics in Networking",
    "estimatedMinutes": 30,
    "difficulty": "easy",
    "understand": "Li-Fi (Light Fidelity) is a high-speed bidirectional wireless communication technology that uses Visible Light Communication (VLC) through LED light bulbs instead of radio frequency waves. Programmable MAC enables software-defined customization of Media Access Control rules for specialized environments.",
    "whyItMatters": "Radio spectrum is severely congested and forbidden in RF-sensitive zones like hospital operation theaters, petrochemical plants, and aircraft cabins. Li-Fi operates in optical spectrum, offering huge bandwidth with zero RF interference.",
    "howItWorks": [
      "LEDs switch on and off at nanosecond speeds undetectable by the human eye to transmit binary 1s and 0s.",
      "A photodetector receiver captures light pulses and converts them back into electrical signals.",
      "Because light cannot pass through opaque walls, Li-Fi provides natural physical boundary security against eavesdropping.",
      "Programmable MAC uses software-configurable FPGA/SoC architectures to switch between CSMA/CA, TDMA, or custom MAC timing without hardware redesign."
    ],
    "example": "Overhead LED lighting in an underground mining tunnel provides illumination while concurrently streaming telemetry data to miner safety helmets at gigabit speeds.",
    "keyPoints": [
      "Li-Fi uses visible light spectrum (400–800 THz), which is 10,000 times broader than RF spectrum.",
      "Inherently secure: optical signals cannot penetrate walls, eliminating outdoor wireless interception.",
      "Programmable MAC allows dynamic optimization of latency, throughput, and duty cycles via software."
    ],
    "examFocus": [
      "Compare Li-Fi vs Wi-Fi in terms of spectrum, speed, security, and coverage (5 marks).",
      "Explain the working principle of Visible Light Communication (3 marks)."
    ],
    "selfCheck": {
      "question": "Why does Li-Fi offer inherently superior physical communication security compared to Wi-Fi?",
      "options": [
        "It uses 256-bit encryption by default",
        "Light waves cannot penetrate opaque walls, preventing eavesdropping from outside the room",
        "It operates at lower radio frequencies",
        "It requires physical copper cabling"
      ],
      "answer": "Light waves cannot penetrate opaque walls, preventing eavesdropping from outside the room",
      "correctIndex": 1,
      "explanation": "Because visible light cannot pass through opaque walls, Li-Fi signals are confined to the room, preventing outside listeners from intercepting the data."
    }
  },
  "cn-m4-t2": {
    "topicId": "cn-m4-t2",
    "title": "Software-Defined Networking (SDN)",
    "subjectCode": "24CST501",
    "subjectName": "Computer Networks",
    "moduleTitle": "Module IV — Advanced Topics in Networking",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "Software-Defined Networking (SDN) is an architectural approach that decouples the network control plane (decision-making) from the data plane (packet forwarding). A centralized software controller manages traffic flows across network switches globally.",
    "whyItMatters": "Traditional routers run proprietary firmware and require individual manual command-line configuration. SDN enables cloud operators like Google and AWS to reconfigure routing across thousands of data center switches with a single API call.",
    "howItWorks": [
      "Data Plane: Hardware switches that inspect packet headers and match against flow table entries to forward, drop, or rewrite packets.",
      "Control Plane: Centralized software controller (e.g. OpenDaylight, ONOS) running routing logic and computing shortest paths globally.",
      "Southbound Interface: Standardized protocol (such as OpenFlow) between the SDN controller and physical forwarding switches.",
      "Northbound Interface: RESTful APIs connecting the SDN controller to user network applications and business logic.",
      "East-West Interface: Protocols for communication between multiple SDN controllers in large distributed clouds."
    ],
    "example": "During a peak video traffic event, an SDN controller detects congested links and dynamically programs OpenFlow switches to reroute bulk backup traffic over secondary paths.",
    "keyPoints": [
      "Decouples Control Plane (routing decision) from Data Plane (packet forwarding).",
      "OpenFlow is the premier Southbound protocol standard.",
      "Centralized global network view enables optimal traffic engineering and fast fault recovery.",
      "Northbound APIs allow software developers to program network behaviors dynamically."
    ],
    "examFocus": [
      "Draw and explain the 3-tier architecture of SDN with Northbound and Southbound APIs (7 marks).",
      "Compare traditional networking vs Software-Defined Networking (5 marks)."
    ],
    "selfCheck": {
      "question": "In Software-Defined Networking (SDN), what is the function of the Southbound Interface (such as OpenFlow)?",
      "options": [
        "It connects enterprise business applications to the cloud",
        "It connects the centralized SDN controller to physical data-plane forwarding switches",
        "It authenticates end-user web traffic",
        "It converts IPv4 packets to IPv6"
      ],
      "answer": "It connects the centralized SDN controller to physical data-plane forwarding switches",
      "correctIndex": 1,
      "explanation": "The Southbound interface (e.g. OpenFlow) allows the SDN controller in the control plane to communicate with and install flow rules onto data-plane switches."
    }
  },
  "cn-m4-t3": {
    "topicId": "cn-m4-t3",
    "title": "Internet of Things (IoT) and IoT Protocols",
    "subjectCode": "24CST501",
    "subjectName": "Computer Networks",
    "moduleTitle": "Module IV — Advanced Topics in Networking",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "The Internet of Things (IoT) interconnects billions of physical devices (sensors, actuators, smart meters) that collect and exchange data over networks. Because IoT devices operate under strict memory, compute, and battery constraints, lightweight specialized protocols like MQTT and CoAP are used.",
    "whyItMatters": "Standard HTTP headers (hundreds of bytes) and TCP handshakes drain tiny coin-cell batteries in minutes. Lightweight IoT protocols transmit telemetry with minimal byte overhead and sleep states.",
    "howItWorks": [
      "MQTT (Message Queuing Telemetry Transport): Publish/Subscribe messaging protocol over TCP; broker routes messages between publishers and subscribers with minimal 2-byte header overhead.",
      "MQTT QoS levels: QoS 0 (At most once), QoS 1 (At least once), QoS 2 (Exactly once).",
      "CoAP (Constrained Application Protocol): RESTful client-server protocol over UDP designed as a lightweight binary equivalent of HTTP.",
      "6LoWPAN: Adapts IPv6 packets for transmission over low-power IEEE 802.15.4 wireless personal area networks via header compression.",
      "RPL: Distance-vector routing protocol for Low-Power and Lossy Networks (LLNs) using Destination-Oriented DAGs (DODAGs)."
    ],
    "example": "A soil moisture sensor in a farm publishes readings to MQTT topic 'farm/soil/moisture' through a central broker. Weather stations and irrigation pumps subscribed to that topic react in real time.",
    "keyPoints": [
      "MQTT is Pub/Sub over TCP; CoAP is Request/Response over UDP.",
      "MQTT has 3 QoS levels (0, 1, 2) to balance reliability and battery consumption.",
      "6LoWPAN compresses IPv6 headers to fit 128-byte IEEE 802.15.4 frame limits."
    ],
    "examFocus": [
      "Compare MQTT vs CoAP protocols for constrained IoT environments (5 marks).",
      "Explain the MQTT Publish-Subscribe architecture and QoS levels (5 marks)."
    ],
    "selfCheck": {
      "question": "Which architecture pattern does the MQTT protocol use for lightweight message distribution?",
      "options": [
        "Peer-to-Peer file sharing",
        "Publish / Subscribe architecture through a central broker",
        "Master-Slave polling loop",
        "Client-Server RPC over HTTP"
      ],
      "answer": "Publish / Subscribe architecture through a central broker",
      "correctIndex": 1,
      "explanation": "MQTT uses a Publish/Subscribe pattern: clients publish messages to topics on a central message broker, which immediately dispatches them to all clients subscribed to those topics."
    }
  },
  "cn-m4-t4": {
    "topicId": "cn-m4-t4",
    "title": "Network Security — Encryption, Authentication and Firewalls",
    "subjectCode": "24CST501",
    "subjectName": "Computer Networks",
    "moduleTitle": "Module IV — Advanced Topics in Networking",
    "estimatedMinutes": 40,
    "difficulty": "medium",
    "understand": "Network Security encompasses the policies, cryptographic algorithms, and security devices deployed to protect communication data from unauthorized access, modification, or denial of service. Core pillars include Confidentiality, Integrity, and Authentication (CIA triad).",
    "whyItMatters": "Public internet traffic passes through dozens of untrusted third-party routers. Encryption and digital certificates ensure your banking credentials cannot be intercepted by packet sniffers or man-in-the-middle attackers.",
    "howItWorks": [
      "Symmetric Encryption: Sender and receiver share a single secret key for encryption and decryption (e.g. AES, DES); very fast.",
      "Asymmetric Encryption: Uses a public key for encryption and a private key for decryption (e.g. RSA, ECC); solves key distribution.",
      "Cryptographic Hash Functions (SHA-256) generate fixed-size digests to guarantee data integrity.",
      "Digital Signatures combine asymmetric crypto and hashing to provide non-repudiation and sender authentication.",
      "Firewalls inspect incoming and outgoing traffic based on security rules: Packet filtering (L3/L4), Stateful inspection, and Application-level proxy firewalls."
    ],
    "example": "When you open an HTTPS website, TLS uses asymmetric RSA/ECDH key exchange to securely agree on a session key, then switches to symmetric AES-256 for fast data payload encryption.",
    "keyPoints": [
      "Symmetric key crypto (AES) is fast; Asymmetric key crypto (RSA) solves key distribution.",
      "Digital signatures provide authenticity, integrity, and non-repudiation.",
      "Stateful firewalls track TCP connection states (SYN, ESTABLISHED), blocking unsolicited inbound traffic.",
      "IPSec provides encryption and authentication at the Network Layer (AH and ESP modes)."
    ],
    "examFocus": [
      "Differentiate Symmetric vs Asymmetric encryption with algorithms and key counts (5 marks).",
      "Explain Packet Filtering vs Stateful Inspection firewalls (5 marks).",
      "Explain the working of Digital Signatures (3 marks)."
    ],
    "selfCheck": {
      "question": "In asymmetric public-key cryptography (like RSA), which key is used by the sender to encrypt a confidential message meant only for Alice?",
      "options": [
        "Sender's private key",
        "Alice's public key",
        "Alice's private key",
        "A shared symmetric pre-shared key"
      ],
      "answer": "Alice's public key",
      "correctIndex": 1,
      "explanation": "Anyone who wants to send confidential data to Alice encrypts it with Alice's Public Key. Only Alice, who possesses the matching Private Key, can decrypt the message."
    }
  },
  "se-m1-t1": {
    "topicId": "se-m1-t1",
    "title": "Software Engineering Concepts and Software Crisis",
    "subjectCode": "24CST502",
    "subjectName": "Software Engineering",
    "moduleTitle": "Module I — Software Process & Agile",
    "estimatedMinutes": 30,
    "difficulty": "easy",
    "understand": "Software Engineering is the systematic, disciplined, and quantifiable approach to the development, operation, and maintenance of software. The Software Crisis of the late 1960s highlighted severe project failures, budget overruns, and unreliable software, prompting the emergence of software engineering as a formal discipline.",
    "whyItMatters": "Large-scale software cannot be built through ad-hoc hacking. Engineering principles prevent multi-million dollar failures like software bugs in medical radiation machines or space missions.",
    "howItWorks": [
      "In 1968, the NATO Software Engineering conference identified the Software Crisis: projects were consistently over budget, behind schedule, and full of defects.",
      "Root causes: rapid hardware advancements outpaced software engineering methods, lack of formal processes, and increasing system complexity.",
      "Software Engineering introduced layered technologies: Quality Focus -> Process -> Methods -> Tools.",
      "Software Characteristics: Software is engineered, not manufactured; software does not 'wear out' (bathtub curve vs hardware bathtub curve); most software is custom-built."
    ],
    "example": "The failure of the Denver International Airport baggage system software delayed the airport opening by 16 months and cost $560 million, a textbook example of software crisis due to poor requirements engineering.",
    "keyPoints": [
      "Software Crisis (1968 NATO conference): Cost overruns, missed deadlines, unmaintainable code.",
      "Software does not wear out; it deteriorates due to frequent unmanaged changes and design erosion.",
      "Software Engineering layered approach: Quality commitment, Process, Methods, and Tools."
    ],
    "examFocus": [
      "Define Software Crisis. Discuss its causes and how software engineering principles address it (5 marks).",
      "Explain the layered technology approach of software engineering (3 marks)."
    ],
    "selfCheck": {
      "question": "Which of the following describes why software deteriorates over time rather than wearing out like hardware?",
      "options": [
        "Physical wear and tear of electronic circuits",
        "Frequent unmanaged changes and design erosion introducing unforeseen bugs",
        "Magnetic degradation of storage media",
        "Natural friction inside software memory"
      ],
      "answer": "Frequent unmanaged changes and design erosion introducing unforeseen bugs",
      "correctIndex": 1,
      "explanation": "Hardware wears out due to physical stress and friction (bathtub curve). Software does not wear out, but deteriorates because repeated changes and patches degrade its architectural integrity."
    }
  },
  "se-m1-t4": {
    "topicId": "se-m1-t4",
    "title": "Scrum and DevOps",
    "subjectCode": "24CST502",
    "subjectName": "Software Engineering",
    "moduleTitle": "Module I — Software Process & Agile",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "Scrum is an Agile management framework based on cross-functional teams, short fixed-duration iterations (Sprints), and continuous feedback. DevOps bridges the gap between Software Development (Dev) and IT Operations (Ops) through automated Continuous Integration and Continuous Deployment (CI/CD) pipelines.",
    "whyItMatters": "Traditional release cycles took 6 months to deploy updates. With Scrum and DevOps, modern tech teams ship tested features, security patches, and bug fixes to users multiple times per day.",
    "howItWorks": [
      "Scrum Roles: Product Owner (manages Product Backlog), Scrum Master (removes blockers, facilitates process), Development Team (self-organizing engineers).",
      "Scrum Artifacts: Product Backlog (prioritized feature list), Sprint Backlog (tasks for current sprint), Increment (shippable product), Sprint Burndown Chart.",
      "Scrum Ceremonies: Sprint Planning, Daily Standup (15-min sync), Sprint Review (demo), Sprint Retrospective (process improvement).",
      "DevOps Lifecycle: Plan -> Code -> Build -> Test -> Release -> Deploy -> Operate -> Monitor.",
      "CI/CD Pipeline: Developers commit code to Git; automated builds compile, run unit tests, and deploy containerized code to staging/production."
    ],
    "example": "In a 2-week Sprint: On Day 1, the team pulls 5 user stories from the Product Backlog into the Sprint Backlog. Every morning, they spend 15 minutes answering: What did I do yesterday? What will I do today? What is blocking me?",
    "keyPoints": [
      "Scrum 3 Roles: Product Owner, Scrum Master, Developers.",
      "Sprint duration is typically 1 to 4 weeks, resulting in a potentially shippable product increment.",
      "Sprint Burndown Chart tracks remaining hours/story points against time.",
      "DevOps combines development and operations via automation, CI/CD pipelines, and infrastructure as code."
    ],
    "examFocus": [
      "Explain Scrum roles, artifacts, and ceremonies with diagrams (7 marks).",
      "Explain the DevOps lifecycle and the role of CI/CD pipelines (5 marks)."
    ],
    "selfCheck": {
      "question": "In the Scrum framework, who is responsible for prioritizing the Product Backlog based on business value?",
      "options": [
        "Scrum Master",
        "Product Owner",
        "Lead Developer",
        "Project Sponsor"
      ],
      "answer": "Product Owner",
      "correctIndex": 1,
      "explanation": "The Product Owner is solely responsible for maximizing product value and managing/prioritizing items in the Product Backlog."
    }
  },
  "se-m2-t1": {
    "topicId": "se-m2-t1",
    "title": "Requirements Engineering Process",
    "subjectCode": "24CST502",
    "subjectName": "Software Engineering",
    "moduleTitle": "Module II — Requirements Engineering & Design",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "Requirements Engineering is the disciplined process of discovering, analyzing, documenting, and validating the services that customers require from a software system and the operational constraints under which it must operate.",
    "whyItMatters": "Fixing a requirement defect during coding or post-release costs up to 100 times more than discovering it during the requirements phase. Clear requirements prevent building the wrong system.",
    "howItWorks": [
      "1. Requirements Inception: Initial problem statement and business feasibility study.",
      "2. Requirements Elicitation: Gathering requirements from stakeholders via interviews, surveys, workshops, user stories, and FAST meetings.",
      "3. Requirements Elaboration & Analysis: Structuring, classifying, and resolving conflicting requirements.",
      "4. Requirements Negotiation: Prioritizing requirements within budget and schedule constraints.",
      "5. Requirements Specification: Formalizing requirements into a structured Software Requirement Specification (SRS).",
      "6. Requirements Validation: Inspecting the SRS with stakeholders to ensure correctness, completeness, consistency, and feasibility.",
      "7. Requirements Management: Tracking changes to requirements using traceability matrices."
    ],
    "example": "Interviewing banking tellers reveals that while managers want facial recognition for login, tellers need a fallback barcode card reader because cameras fail under poor counter lighting.",
    "keyPoints": [
      "Steps: Inception -> Elicitation -> Elaboration -> Negotiation -> Specification -> Validation -> Management.",
      "Cost of fixing requirement errors increases exponentially across the SDLC.",
      "Validation ensures we are building the 'Right Product' according to actual user needs."
    ],
    "examFocus": [
      "Explain the major phases of the Requirements Engineering process (7 marks).",
      "Discuss various requirements elicitation techniques with their pros and cons (5 marks)."
    ],
    "selfCheck": {
      "question": "Which phase of requirements engineering focuses on reviewing the specification with stakeholders to verify consistency, completeness, and feasibility?",
      "options": [
        "Requirements Elicitation",
        "Requirements Validation",
        "Requirements Inception",
        "Requirements Negotiation"
      ],
      "answer": "Requirements Validation",
      "correctIndex": 1,
      "explanation": "Requirements Validation checks the documented SRS against real stakeholder needs to verify completeness, consistency, and technical feasibility before architecture begins."
    }
  },
  "se-m2-t2": {
    "topicId": "se-m2-t2",
    "title": "Functional and Non-Functional Requirements",
    "subjectCode": "24CST502",
    "subjectName": "Software Engineering",
    "moduleTitle": "Module II — Requirements Engineering & Design",
    "estimatedMinutes": 30,
    "difficulty": "easy",
    "understand": "Functional Requirements (FR) define what the system should do—the specific features, services, and calculations. Non-Functional Requirements (NFR) define how well the system should perform—the quality attributes, security constraints, and operational standards.",
    "whyItMatters": "A banking application might have perfect functional features (transfer money), but if it takes 45 seconds to load or has weak encryption (failing NFRs), customers will abandon it.",
    "howItWorks": [
      "Functional Requirements: Input-to-output behaviors (e.g. 'The system shall allow users to search books by author').",
      "Non-Functional Requirements (FURPS+ model): Functionality, Usability, Reliability, Performance, Supportability.",
      "Performance NFR: Response time (e.g. < 2 seconds for 95% of queries), throughput (transactions/sec).",
      "Reliability & Availability: Uptime percentage (e.g. 99.9% uptime, MTBF, MTTR).",
      "Security NFR: Data encryption at rest and in transit, multi-factor authentication, RBAC authorization."
    ],
    "example": "Functional: 'User can reset password by email.' Non-Functional: 'The password reset token must expire after 15 minutes and the reset email must be delivered within 30 seconds.'",
    "keyPoints": [
      "Functional = What the software does (Features, services, behaviors).",
      "Non-Functional = Quality constraints (Speed, security, availability, portability).",
      "NFRs must be quantified and verifiable (avoid vague words like 'system must be fast')."
    ],
    "examFocus": [
      "Differentiate Functional vs Non-Functional requirements with 3 examples each (5 marks).",
      "Explain the FURPS+ classification model for requirements (5 marks)."
    ],
    "selfCheck": {
      "question": "'The payment gateway must process checkout transactions in less than 1.5 seconds under 1,000 concurrent users.' What type of requirement is this?",
      "options": [
        "Functional Requirement",
        "Performance Non-Functional Requirement",
        "Legal Requirement",
        "Interface Requirement"
      ],
      "answer": "Performance Non-Functional Requirement",
      "correctIndex": 1,
      "explanation": "This specifies a quantified operational quality constraint (response time under concurrent load) rather than a discrete feature, making it a Performance Non-Functional Requirement."
    }
  },
  "se-m2-t3": {
    "topicId": "se-m2-t3",
    "title": "Software Requirement Specification (SRS)",
    "subjectCode": "24CST502",
    "subjectName": "Software Engineering",
    "moduleTitle": "Module II — Requirements Engineering & Design",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "A Software Requirement Specification (SRS) is a formal contract between software clients and development teams that describes the functional, non-functional, and interface requirements of the intended system. The IEEE 830 standard outlines the standard structure of a quality SRS.",
    "whyItMatters": "The SRS acts as the single source of truth. Software architects use it to design schemas, developers use it to write code, and QA engineers use it to design test acceptance suites.",
    "howItWorks": [
      "IEEE 830 Standard Structure: 1. Introduction (Purpose, Scope, Definitions), 2. Overall Description (Product perspective, User classes, Constraints), 3. Specific Requirements (FRs, NFRs, external interfaces).",
      "Characteristics of a Good SRS: Correct, Unambiguous (single interpretation), Complete, Consistent (no contradictions), Ranked for importance, Verifiable (testable), Modifiable, Traceable.",
      "Requirements Traceability Matrix (RTM): Maps each requirement to its design module, source code file, and test case ID."
    ],
    "example": "Vague requirement: 'System must load fast.' IEEE 830 compliant SRS requirement: 'The search results page shall render within 1.2 seconds on a 4G mobile connection for queries matching under 10,000 records.'",
    "keyPoints": [
      "IEEE 830 provides standard structure for SRS documents.",
      "Every requirement must be verifiable (able to write a pass/fail test).",
      "Traceability connects requirements forward to code/tests and backward to stakeholder requests."
    ],
    "examFocus": [
      "Explain the IEEE 830 standard structure of an SRS document (7 marks).",
      "List and explain the 8 desirable characteristics of a good SRS (5 marks)."
    ],
    "selfCheck": {
      "question": "Which characteristic of a good SRS ensures that every stated requirement can be cost-effectively proven true or false through testing or demonstration?",
      "options": [
        "Traceable",
        "Verifiable",
        "Modifiable",
        "Consistent"
      ],
      "answer": "Verifiable",
      "correctIndex": 1,
      "explanation": "A requirement is 'Verifiable' if and only if there exists some finite, cost-effective process by which a person or machine can prove that the software product meets the requirement."
    }
  },
  "se-m2-t4": {
    "topicId": "se-m2-t4",
    "title": "UML Diagrams and Software Design Concepts",
    "subjectCode": "24CST502",
    "subjectName": "Software Engineering",
    "moduleTitle": "Module II — Requirements Engineering & Design",
    "estimatedMinutes": 40,
    "difficulty": "medium",
    "understand": "Unified Modeling Language (UML) is a standard visual modeling language used to specify, visualize, construct, and document software blueprints. Software Design concepts translate requirements into modular software blueprints using principles like Cohesion, Coupling, Abstraction, and Information Hiding.",
    "whyItMatters": "High coupling and low cohesion create fragile code where changing a line in the billing module breaks user authentication. Good modular design ensures maintainable, reusable software.",
    "howItWorks": [
      "Structural UML Diagrams: Class Diagram (classes, attributes, methods, relationships), Object Diagram, Component Diagram, Deployment Diagram.",
      "Behavioral UML Diagrams: Use Case Diagram (actors, use cases, include/extend), Sequence Diagram (chronological message passing between objects), Activity Diagram (flowchart with concurrency).",
      "Cohesion: The degree to which elements inside a module belong together. Target: High Cohesion (Functional cohesion is best).",
      "Coupling: The degree of interdependence between separate modules. Target: Low Coupling (Data coupling is best; Content coupling is worst).",
      "Information Hiding: Encapsulates internal data structures behind clean public interfaces (Parnas principle)."
    ],
    "example": "In a Sequence Diagram for an ATM withdrawal: Actor inserts card -> ATM Screen requests PIN -> User enters PIN -> Bank Server validates PIN -> Cash Dispenser dispenses bills.",
    "keyPoints": [
      "Design Golden Rule: High Cohesion, Low Coupling.",
      "Use Case diagrams model system functional scope from the user/actor perspective.",
      "Sequence diagrams capture chronological message lifelines between object instances.",
      "Functional cohesion performs a single well-defined task; Data coupling shares only primitive arguments."
    ],
    "examFocus": [
      "Draw and explain Class Diagram and Sequence Diagram for an online shopping or ATM system (7 marks).",
      "Explain Cohesion vs Coupling with various levels of each (7 marks)."
    ],
    "selfCheck": {
      "question": "In software engineering design, what is the ideal relationship between Cohesion and Coupling for good modularity?",
      "options": [
        "Low Cohesion and High Coupling",
        "High Cohesion and Low Coupling",
        "High Cohesion and High Coupling",
        "Low Cohesion and Low Coupling"
      ],
      "answer": "High Cohesion and Low Coupling",
      "correctIndex": 1,
      "explanation": "High Cohesion ensures modules focus on a single, tightly-knit responsibility, while Low Coupling minimizes interdependencies between modules, making changes safe and maintainable."
    }
  },
  "se-m3-t1": {
    "topicId": "se-m3-t1",
    "title": "Coding Standards, Documentation and Code Review",
    "subjectCode": "24CST502",
    "subjectName": "Software Engineering",
    "moduleTitle": "Module III — Implementation, Testing & SCM",
    "estimatedMinutes": 30,
    "difficulty": "easy",
    "understand": "Coding standards establish uniform naming, formatting, and structural guidelines across a development team. Code documentation ensures codebases are understandable to maintainers. Formal code reviews and peer inspections identify logic flaws, security vulnerabilities, and standard violations prior to testing.",
    "whyItMatters": "Software spends 80% of its lifetime in maintenance. Clean code following standardized conventions saves engineering teams hundreds of hours when onboarding or refactoring.",
    "howItWorks": [
      "Coding Guidelines: Consistent indentation, meaningful identifier naming (camelCase, PascalCase), limiting function length, avoiding magic numbers.",
      "Internal Documentation: Docstrings, meaningful comments explaining 'Why' not 'What', API documentation generation (e.g. Javadoc, Swagger).",
      "Code Review Process: Author raises Pull Request (PR) -> Reviewers inspect diff -> Reviewers comment or request changes -> Automated CI tests pass -> PR merged.",
      "Fagan Inspection: Formal 6-stage inspection meeting (Planning, Overview, Preparation, Inspection Meeting, Rework, Follow-up)."
    ],
    "example": "Replacing `if (status == 3)` with `const STATUS_PAYMENT_PENDING = 3; if (status == STATUS_PAYMENT_PENDING)` prevents hard-to-debug numeric mistakes.",
    "keyPoints": [
      "Coding standards improve readability, maintainability, and reduce bug density.",
      "Code reviews detect defects earlier than unit tests and facilitate team knowledge sharing.",
      "Fagan Inspection is a formal, metrics-driven defect detection meeting."
    ],
    "examFocus": [
      "Discuss the importance of coding standards and code review practices in software quality (5 marks).",
      "Explain the Fagan Inspection process and its benefits (5 marks)."
    ],
    "selfCheck": {
      "question": "What is the primary objective of peer code reviews before merging code into the main branch?",
      "options": [
        "To replace unit testing entirely",
        "To identify defects early, enforce coding standards, and improve code maintainability",
        "To measure developer typing speed",
        "To automatically generate binary executables"
      ],
      "answer": "To identify defects early, enforce coding standards, and improve code maintainability",
      "correctIndex": 1,
      "explanation": "Peer code reviews help catch edge-case bugs, security vulnerabilities, enforce design patterns, and ensure clean maintainable code across the engineering team."
    }
  },
  "se-m3-t2": {
    "topicId": "se-m3-t2",
    "title": "Software Testing Strategies",
    "subjectCode": "24CST502",
    "subjectName": "Software Engineering",
    "moduleTitle": "Module III — Implementation, Testing & SCM",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "Software testing is the process of executing a program with the intent of finding errors. A testing strategy organizes testing into hierarchical levels corresponding to SDLC phases: Unit Testing, Integration Testing, System Testing, and Acceptance Testing.",
    "whyItMatters": "Testing proves the presence of defects, not their absence. A systematic layered testing strategy catches errors at the lowest possible cost before software reaches real customers.",
    "howItWorks": [
      "1. Unit Testing: Tests individual modules, functions, or classes in isolation using stubs and drivers.",
      "2. Integration Testing: Tests interactions and interfaces between integrated modules (Top-Down, Bottom-Up, Big-Bang, Sandwich).",
      "3. System Testing: Tests the entire integrated system against original functional and non-functional requirements (Security, Stress, Performance).",
      "4. Acceptance Testing: Performed by customers/end users (Alpha testing at developer site; Beta testing in real user environment).",
      "Regression Testing: Re-executing existing test suites after code changes to confirm that new edits have not broken existing functionality."
    ],
    "example": "Testing an e-commerce checkout: Unit tests check tax calculation logic; Integration tests verify cart-to-payment API calls; System tests verify 10,000 users ordering at once; Acceptance tests let store owners place test orders.",
    "keyPoints": [
      "Testing levels: Unit -> Integration -> System -> Acceptance.",
      "Stubs replace called submodules (Top-Down); Drivers replace calling modules (Bottom-Up).",
      "Alpha testing is developer-site testing; Beta testing is live end-user environment testing.",
      "Regression testing ensures bug fixes don't introduce new side-effects."
    ],
    "examFocus": [
      "Explain the levels of software testing with the V-Model testing diagram (7 marks).",
      "Compare Top-Down vs Bottom-Up integration testing with stubs and drivers (5 marks).",
      "Differentiate Alpha Testing and Beta Testing (3 marks)."
    ],
    "selfCheck": {
      "question": "In Top-Down integration testing, what auxiliary software component is created to simulate the behavior of lower-level modules that are not yet implemented?",
      "options": [
        "Driver",
        "Stub",
        "Mock Server",
        "Proxy"
      ],
      "answer": "Stub",
      "correctIndex": 1,
      "explanation": "Stubs are dummy code modules that simulate the behavior and return values of lower-level submodules called by higher-level modules during Top-Down integration testing."
    }
  },
  "se-m3-t3": {
    "topicId": "se-m3-t3",
    "title": "Black-Box and White-Box Testing",
    "subjectCode": "24CST502",
    "subjectName": "Software Engineering",
    "moduleTitle": "Module III — Implementation, Testing & SCM",
    "estimatedMinutes": 40,
    "difficulty": "hard",
    "understand": "Black-Box Testing (Functional testing) tests system functionality without looking at internal source code structures, focusing on input-output specifications. White-Box Testing (Structural testing) tests internal code logic, paths, branches, and conditions using control flow graphs.",
    "whyItMatters": "Black-box testing ensures user requirements work as expected, while white-box testing verifies that edge-case error branches and loops inside the code execute correctly without dead code.",
    "howItWorks": [
      "Black-Box Technique 1 — Equivalence Partitioning (EP): Divides input domain into valid and invalid equivalence classes; tests 1 representative from each class.",
      "Black-Box Technique 2 — Boundary Value Analysis (BVA): Tests values on and near the boundaries (min, min+1, nominal, max-1, max) where errors cluster.",
      "White-Box Technique 1 — Basis Path Testing: Constructs a Control Flow Graph (CFG) and computes Cyclomatic Complexity V(G).",
      "Cyclomatic Complexity formula: V(G) = E - N + 2 (E = edges, N = nodes) or V(G) = P + 1 (P = predicate decision nodes).",
      "Coverage levels: Statement Coverage, Branch/Decision Coverage, Condition Coverage, Path Coverage."
    ],
    "example": "Input field accepts age 18 to 60: BVA test values are 17 (invalid), 18 (min boundary), 19, 59, 60 (max boundary), and 61 (invalid).",
    "keyPoints": [
      "Black-Box = specification based (Equivalence Partitioning, Boundary Value Analysis).",
      "White-Box = internal code logic based (Control Flow Graph, Basis Path Testing).",
      "Cyclomatic complexity V(G) gives the upper bound on the number of linearly independent paths.",
      "Formula: V(G) = E - N + 2 = Predicate nodes + 1."
    ],
    "examFocus": [
      "Calculate Cyclomatic Complexity V(G) from code snippet/flow graph and list basis paths (7 marks).",
      "Apply Boundary Value Analysis and Equivalence Partitioning on an input range problem (5 marks)."
    ],
    "selfCheck": {
      "question": "If a program's Control Flow Graph has 14 edges, 11 nodes, and 4 predicate decision nodes, what is its Cyclomatic Complexity V(G)?",
      "options": [
        "3",
        "5",
        "7",
        "4"
      ],
      "answer": "5",
      "correctIndex": 1,
      "explanation": "V(G) = E - N + 2 = 14 - 11 + 2 = 5. Alternatively, V(G) = P + 1 = 4 + 1 = 5."
    }
  },
  "se-m3-t4": {
    "topicId": "se-m3-t4",
    "title": "Version Control, Git, GitHub and Configuration Management",
    "subjectCode": "24CST502",
    "subjectName": "Software Engineering",
    "moduleTitle": "Module III — Implementation, Testing & SCM",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "Software Configuration Management (SCM) is the discipline of controlling and tracking software changes across time, artifacts, and releases. Git is a distributed version control system (DVCS) that records changes to files as a directed acyclic graph (DAG) of immutable commits.",
    "whyItMatters": "Without version control, team members would overwrite each other's code, lose working backups, and be unable to determine which change introduced a bug.",
    "howItWorks": [
      "SCM Core Tasks: Identification of configuration items, Version control, Change control (CCB boards), Configuration auditing, Status reporting.",
      "Git Architecture: Working Directory -> Staging Area (Index) -> Local Repository (Commit) -> Remote Repository (Push).",
      "Branching & Merging: Branches allow isolated feature development; Merge integrates branches (Fast-Forward or 3-way merge).",
      "Baseline: A formally reviewed and agreed specification or product version that serves as the basis for further development."
    ],
    "example": "A developer creates feature branch `feature/payment-upi`, commits 3 atomic changes, pushes to GitHub, opens a pull request, and merges into `main` after CI checks pass.",
    "keyPoints": [
      "Distributed VCS: Every developer clone contains the entire project history repository.",
      "Git 3-tree model: Working Directory, Staging Area (git add), Repository (git commit).",
      "SCM Baselines ensure stability before moving to subsequent development phases."
    ],
    "examFocus": [
      "Explain the key activities of Software Configuration Management (SCM) (5 marks).",
      "Explain Git branching, merging, and distributed version control workflow (5 marks)."
    ],
    "selfCheck": {
      "question": "In Git, which command moves modified files from the Working Directory into the Staging Area (Index)?",
      "options": [
        "git commit",
        "git add",
        "git push",
        "git checkout"
      ],
      "answer": "git add",
      "correctIndex": 1,
      "explanation": "The command `git add <file>` stages changes from the working directory into the staging area (index) in preparation for the next commit."
    }
  },
  "se-m4-t1": {
    "topicId": "se-m4-t1",
    "title": "Project Management and Project Scheduling",
    "subjectCode": "24CST502",
    "subjectName": "Software Engineering",
    "moduleTitle": "Module IV — Project Management & Quality",
    "estimatedMinutes": 30,
    "difficulty": "easy",
    "understand": "Software Project Management involves planning, monitoring, and controlling people, process, and product to deliver software on time and within budget. Project Scheduling breaks a project into discrete tasks, allocates resources, and maps dependencies over a project timeline.",
    "whyItMatters": "Software projects notoriously suffer from the '90% done' syndrome. Formal project management and scheduling prevent uncontrolled scope creep and team burnout.",
    "howItWorks": [
      "Work Breakdown Structure (WBS): Hierarchical decomposition of total project scope into manageable, deliverable work packages.",
      "Task Dependency Mapping: Determining predecessors and successors (Finish-to-Start, Start-to-Start).",
      "Effort & Duration Estimation: Converting task size (LOC, Function Points) into person-months and calendar days.",
      "Milestones: Significant verifiable synchronization points in a project timeline with zero duration (e.g. 'SRS Approved').",
      "Tracking: Comparing planned vs actual task progress using Earned Value Analysis."
    ],
    "example": "Developing an app: WBS Level 1 = E-Commerce App; Level 2 = Authentication, Catalog, Payment; Level 3 = Google OAuth, Database Schema, Unit Tests.",
    "keyPoints": [
      "WBS decomposes high-level scope into granular measurable work packages.",
      "Milestones represent major event checkpoints (deliverables approved, zero duration).",
      "Project Triangle: Balancing Scope, Time, and Cost without compromising Quality."
    ],
    "examFocus": [
      "Explain Work Breakdown Structure (WBS) with an example software project hierarchy (5 marks).",
      "Discuss project scheduling principles and task network representations (5 marks)."
    ],
    "selfCheck": {
      "question": "What is a project milestone in software project scheduling?",
      "options": [
        "A long 6-month development phase",
        "A significant verifiable event or deliverable with zero calendar duration",
        "The total financial budget of the software",
        "A software bug discovered during testing"
      ],
      "answer": "A significant verifiable event or deliverable with zero calendar duration",
      "correctIndex": 1,
      "explanation": "A milestone marks a significant checkpoint or completion of a major deliverable (e.g. 'SRS Signed Off') and has zero elapsed duration."
    }
  },
  "se-m4-t2": {
    "topicId": "se-m4-t2",
    "title": "Gantt Charts, CPM and COCOMO",
    "subjectCode": "24CST502",
    "subjectName": "Software Engineering",
    "moduleTitle": "Module IV — Project Management & Quality",
    "estimatedMinutes": 40,
    "difficulty": "hard",
    "understand": "Gantt charts provide horizontal bar-chart representations of project schedules. Critical Path Method (CPM) calculates the longest sequence of dependent tasks to determine minimum project completion time. COCOMO (Constructive Cost Model) by Barry Boehm is an algorithmic cost estimation model.",
    "whyItMatters": "If a task on the critical path is delayed by 3 days, the entire multi-million dollar software launch is delayed by 3 days. COCOMO provides objective mathematical effort formulas rather than guessing.",
    "howItWorks": [
      "Gantt Chart: Displays tasks along a timeline with start/end dates, duration bars, milestones, and dependencies.",
      "CPM Network Analysis: Forward Pass computes Earliest Start (ES) and Earliest Finish (EF); Backward Pass computes Latest Start (LS) and Latest Finish (LF).",
      "Slack (Float) = LS - ES = LF - EF. Tasks with zero slack lie on the Critical Path.",
      "Basic COCOMO Formula: Effort = a * (KLOC)^b [Person-Months]; Development Time = c * (Effort)^d [Months].",
      "COCOMO Project Modes: Organic (small, familiar, a=2.4, b=1.05), Semi-Detached (intermediate, a=3.0, b=1.12), Embedded (tight constraints, hardware coupled, a=3.6, b=1.20)."
    ],
    "example": "If KLOC = 20 for Organic mode: Effort = 2.4 * (20)^1.05 = 2.4 * 23.3 = 55.9 Person-Months.",
    "keyPoints": [
      "Critical Path has zero slack; any delay on this path directly delays project completion.",
      "Slack (Float) = Latest Start - Earliest Start.",
      "COCOMO 3 modes: Organic (small/flexible), Semi-Detached (medium), Embedded (complex/strict).",
      "Effort is measured in Person-Months (PM); Tdev is calendar time in months."
    ],
    "examFocus": [
      "Calculate project duration and identify Critical Path using forward/backward pass (7 marks).",
      "Solve COCOMO effort and duration estimation numericals for Organic/Embedded modes (7 marks)."
    ],
    "selfCheck": {
      "question": "In Critical Path Method (CPM) project scheduling, what is the total slack (float) of any activity that lies on the Critical Path?",
      "options": [
        "Positive non-zero",
        "Exactly Zero",
        "Negative",
        "Equal to the activity duration"
      ],
      "answer": "Exactly Zero",
      "correctIndex": 1,
      "explanation": "Activities on the critical path have zero slack (Float = LS - ES = 0). Any delay in these activities delays the completion of the entire project."
    }
  },
  "se-m4-t3": {
    "topicId": "se-m4-t3",
    "title": "Risk Management and Mitigation",
    "subjectCode": "24CST502",
    "subjectName": "Software Engineering",
    "moduleTitle": "Module IV — Project Management & Quality",
    "estimatedMinutes": 30,
    "difficulty": "medium",
    "understand": "A software risk is an uncertain future event that, if it occurs, has an adverse impact on project cost, schedule, or quality. Risk Management systematically identifies, assesses, prioritizes, mitigates, and monitors potential risks using an RMMM (Risk Mitigation, Monitoring, and Management) plan.",
    "whyItMatters": "Proactive risk management prepares contingency plans before disaster strikes (e.g. key senior developer leaving, database provider outage), transforming potential catastrophes into managed events.",
    "howItWorks": [
      "1. Risk Identification: Identifying technical, project, business, and resource risks via checklists.",
      "2. Risk Projection (Analysis): Estimating Probability (P) and Impact (I) for each risk; Risk Exposure = P * I.",
      "3. Risk Prioritization: Ranking risks using a Risk Matrix (Likelihood vs Consequence).",
      "4. RMMM Plan: Mitigation (proactive avoidance actions), Monitoring (tracking trigger indicators), Management (reactive contingency plan if risk occurs)."
    ],
    "example": "Risk: Key cloud database vendor pricing increases by 40%. Mitigation: Design an abstract database adapter layer so the app can switch to PostgreSQL within 3 days if necessary.",
    "keyPoints": [
      "Risk Exposure (RE) = Risk Probability * Risk Impact.",
      "RMMM: Risk Mitigation (avoidance), Monitoring (tracking triggers), Management (contingency response).",
      "Proactive risk management prevents project paralysis."
    ],
    "examFocus": [
      "Explain the RMMM strategy (Risk Mitigation, Monitoring, and Management) with an example (5 marks).",
      "Explain Risk Projection and calculate Risk Exposure (RE = P * I) (5 marks)."
    ],
    "selfCheck": {
      "question": "If a software security breach risk has a probability of 0.20 and would cost the company $50,000 in recovery, what is the Risk Exposure (RE)?",
      "options": [
        "$250,000",
        "$10,000",
        "$5,000",
        "$50,000"
      ],
      "answer": "$10,000",
      "correctIndex": 1,
      "explanation": "Risk Exposure (RE) = Probability * Impact = 0.20 * $50,000 = $10,000."
    }
  },
  "se-m4-t4": {
    "topicId": "se-m4-t4",
    "title": "Software Quality Assurance, CMMI and ISO 9001",
    "subjectCode": "24CST502",
    "subjectName": "Software Engineering",
    "moduleTitle": "Module IV — Project Management & Quality",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "Software Quality Assurance (SQA) is the planned and systematic pattern of actions required to ensure that software complies with established standards. CMMI (Capability Maturity Model Integration) and ISO 9001 provide international frameworks for assessing and improving an organization's software process maturity.",
    "whyItMatters": "Quality cannot be 'tested in' at the end of a project; it must be built in across every phase. High-maturity organizations (CMMI Level 5) have predictable delivery dates and low defect rates.",
    "howItWorks": [
      "McCall's Quality Factors: Product Operation (Correctness, Reliability, Efficiency), Product Revision (Maintainability, Flexibility, Testability), Product Transition (Portability, Reusability).",
      "CMMI 5 Maturity Levels: Level 1: Initial (ad-hoc, chaotic); Level 2: Managed (project-level discipline); Level 3: Defined (organization-wide standard processes); Level 4: Quantitatively Managed (measured metrics, control charts); Level 5: Optimizing (continuous process improvement).",
      "ISO 9001: International quality standard focused on customer satisfaction, process approach, and continuous improvement."
    ],
    "example": "At CMMI Level 1, a project succeeds only because of individual heroics of a developer. At CMMI Level 5, statistical process control prevents defects even if team members change.",
    "keyPoints": [
      "CMMI 5 Levels: Initial -> Managed -> Defined -> Quantitatively Managed -> Optimizing.",
      "Level 4 introduces statistical and quantitative management.",
      "ISO 9001 certifies process quality management systems, not the specific software product."
    ],
    "examFocus": [
      "Explain the 5 maturity levels of CMMI with their characteristics (7 marks).",
      "Discuss McCall's software quality factors with classification (5 marks)."
    ],
    "selfCheck": {
      "question": "Which CMMI maturity level is characterized by an organization using statistical and quantitative metrics to control process variation and quality?",
      "options": [
        "Level 2 Managed",
        "Level 3 Defined",
        "Level 4 Quantitatively Managed",
        "Level 5 Optimizing"
      ],
      "answer": "Level 4 Quantitatively Managed",
      "correctIndex": 2,
      "explanation": "At CMMI Level 4 (Quantitatively Managed), the organization controls processes using statistical and quantitative measurement techniques to predict performance."
    }
  },
  "math-m1-t1": {
    "topicId": "math-m1-t1",
    "title": "Scalars, Vectors, Matrices and Tensors",
    "subjectCode": "24CST503",
    "subjectName": "Advanced Mathematics for Data Science",
    "moduleTitle": "Module I — Linear Algebra & Vector Spaces",
    "estimatedMinutes": 30,
    "difficulty": "easy",
    "understand": "Scalars, Vectors, Matrices, and Tensors are the fundamental data structures of linear algebra and machine learning. A scalar is a single real number (0-D tensor); a vector is a 1-D array with magnitude and direction; a matrix is a 2-D array of numbers; and a tensor is an n-dimensional generalization.",
    "whyItMatters": "Every digital image is stored as a 3D tensor (Height x Width x RGB Channels), and every batch of training images in PyTorch or TensorFlow is processed as a 4D tensor (Batch x Height x Width x Channels).",
    "howItWorks": [
      "Scalar: a in R (rank 0 tensor).",
      "Vector: v in R^n (rank 1 tensor), represents a point or displacement in n-dimensional space.",
      "Matrix: A in R^(m x n) (rank 2 tensor), represents linear transformations between vector spaces.",
      "Tensor: Multi-dimensional array where order/rank is the number of indices required to identify an element.",
      "Dot Product: u · v = sum(u_i * v_i) = ||u|| ||v|| cos(theta); fundamental to cosine similarity and neural activations.",
      "Norms: L1 Norm (Manhattan distance, sum of absolute values); L2 Norm (Euclidean distance, sqrt of sum of squares)."
    ],
    "example": "For vectors u = [1, 3] and v = [4, 2]: Dot product = (1*4) + (3*2) = 4 + 6 = 10. L2 Norm of u = sqrt(1^2 + 3^2) = sqrt(10) ≈ 3.16.",
    "keyPoints": [
      "Tensor rank corresponds to dimensions: Scalar (0D), Vector (1D), Matrix (2D), Tensor (nD).",
      "Dot product u · v = 0 indicates that non-zero vectors u and v are orthogonal (perpendicular).",
      "L2 norm measures Euclidean length; L1 norm induces sparsity in regularization (Lasso)."
    ],
    "examFocus": [
      "Define Tensor, Matrix, and Vector. Explain L1, L2, and Frobenius norms with formulas (5 marks).",
      "Compute dot product, angle between vectors, and vector projection (5 marks)."
    ],
    "selfCheck": {
      "question": "If the dot product between two non-zero vectors u and v is equal to zero, what geometric relationship exists between them?",
      "options": [
        "They are parallel and point in the same direction",
        "They are orthogonal (perpendicular) to each other",
        "They have identical magnitude",
        "They are collinear"
      ],
      "answer": "They are orthogonal (perpendicular) to each other",
      "correctIndex": 1,
      "explanation": "Since u · v = ||u|| ||v|| cos(theta), a dot product of 0 implies cos(theta) = 0, meaning the angle theta between them is 90 degrees (orthogonal)."
    }
  },
  "math-m1-t2": {
    "topicId": "math-m1-t2",
    "title": "Matrix Operations, Rank, Trace and Inverse",
    "subjectCode": "24CST503",
    "subjectName": "Advanced Mathematics for Data Science",
    "moduleTitle": "Module I — Linear Algebra & Vector Spaces",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "Matrix operations (addition, multiplication, transpose) provide the computational engine of linear algebra. The Rank of a matrix is the maximum number of linearly independent row or column vectors. The Trace is the sum of diagonal elements. A square matrix is invertible if and only if its determinant is non-zero (full rank).",
    "whyItMatters": "If a dataset's feature matrix has rank less than the number of features, multicollinearity exists (redundant features), making the Ordinary Least Squares normal equation singular and unsolvable without regularization.",
    "howItWorks": [
      "Matrix Multiplication: For A (m x k) and B (k x n), product C = AB has dimensions m x n where C_ij = sum(A_ik * B_kj).",
      "Trace: tr(A) = sum(A_ii) for a square matrix; tr(AB) = tr(BA).",
      "Determinant: det(A) measures the volume scaling factor of the linear transformation; det(A) = 0 means singular (non-invertible).",
      "Row Echelon Form (REF): Computed via Gaussian elimination using elementary row operations.",
      "Rank(A): Count of non-zero rows in Row Echelon Form.",
      "Matrix Inverse: A^(-1) exists if and only if det(A) ≠ 0; A * A^(-1) = I."
    ],
    "example": "For matrix A = [[2, 1], [4, 2]]: Row 2 is 2 * Row 1. Determinant = (2*2) - (1*4) = 0. Therefore Rank = 1, and A is singular (no inverse exists).",
    "keyPoints": [
      "Matrix multiplication is associative (A(BC) = (AB)C) but NOT commutative (AB ≠ BA in general).",
      "A square matrix A is invertible if and only if det(A) ≠ 0 and rank(A) = n.",
      "Trace is the sum of main diagonal elements and equals the sum of eigenvalues."
    ],
    "examFocus": [
      "Find the rank of a 3x3 matrix by reducing it to Row Echelon Form (5 marks).",
      "Calculate matrix inverse using the Gauss-Jordan elimination method (5 marks)."
    ],
    "selfCheck": {
      "question": "Under what condition does a square matrix A have a valid multiplicative inverse A^(-1)?",
      "options": [
        "When its determinant is equal to 0",
        "When its determinant is non-zero (det(A) ≠ 0)",
        "When all its off-diagonal elements are 0",
        "When its trace is positive"
      ],
      "answer": "When its determinant is non-zero (det(A) ≠ 0)",
      "correctIndex": 1,
      "explanation": "A square matrix is invertible (non-singular) if and only if its determinant is non-zero, meaning it has full rank and its column vectors are linearly independent."
    }
  },
  "math-m1-t3": {
    "topicId": "math-m1-t3",
    "title": "Vector Spaces, Linear Independence, Basis and Dimension",
    "subjectCode": "24CST503",
    "subjectName": "Advanced Mathematics for Data Science",
    "moduleTitle": "Module I — Linear Algebra & Vector Spaces",
    "estimatedMinutes": 40,
    "difficulty": "hard",
    "understand": "A Vector Space V over a field F is a set of vectors closed under vector addition and scalar multiplication satisfying 8 axioms. A set of vectors is linearly independent if no vector can be written as a linear combination of the others. A Basis is a linearly independent set that spans the entire space, and Dimension is the number of basis vectors.",
    "whyItMatters": "In machine learning feature spaces, finding a basis allows us to represent high-dimensional data points in the most compact coordinate system without redundant information.",
    "howItWorks": [
      "Linear Combination: v = c1*v1 + c2*v2 + ... + ck*vk.",
      "Span: Span{v1, ..., vk} is the set of all possible linear combinations of the vectors.",
      "Linear Independence: c1*v1 + c2*v2 + ... + ck*vk = 0 has ONLY the trivial solution c1 = c2 = ... = ck = 0.",
      "Basis of V: A subset B of V such that: 1. B is linearly independent, and 2. Span(B) = V.",
      "Dimension: dim(V) is the unique number of vectors in any basis of V (e.g. dim(R^n) = n).",
      "Standard Basis of R^3: e1 = [1, 0, 0]^T, e2 = [0, 1, 0]^T, e3 = [0, 0, 1]^T."
    ],
    "example": "Testing independence for v1 = [1, 0] and v2 = [0, 1]: c1*[1,0] + c2*[0,1] = [c1, c2] = [0, 0] requires c1=0, c2=0. Thus, {v1, v2} is linearly independent and forms a basis for R^2.",
    "keyPoints": [
      "Linearly independent vectors contain zero redundancy; none is a linear combination of others.",
      "A Basis is a minimal spanning set and a maximal linearly independent set.",
      "Dimension is the cardinal number of vectors in any basis for that vector space."
    ],
    "examFocus": [
      "Test whether a given set of vectors in R^3 is linearly independent or dependent (5 marks).",
      "Define Vector Space, Subspace, Basis, and Dimension with formal mathematical conditions (7 marks)."
    ],
    "selfCheck": {
      "question": "What is a Basis for a vector space V?",
      "options": [
        "Any set of vectors that contains the zero vector",
        "A linearly independent subset of V that spans V",
        "Any two perpendicular vectors",
        "The collection of all unit vectors in the space"
      ],
      "answer": "A linearly independent subset of V that spans V",
      "correctIndex": 1,
      "explanation": "A basis for a vector space V is defined as a subset of vectors that is both linearly independent and spans the entire vector space V."
    }
  },
  "math-m2-t2": {
    "topicId": "math-m2-t2",
    "title": "Random Variables and Probability Distributions",
    "subjectCode": "24CST503",
    "subjectName": "Advanced Mathematics for Data Science",
    "moduleTitle": "Module II — Probability & Random Processes",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "A Random Variable X is a function that maps outcomes of a random experiment to real numbers. Discrete random variables are characterized by a Probability Mass Function (PMF), while continuous random variables are characterized by a Probability Density Function (PDF) and Cumulative Distribution Function (CDF).",
    "whyItMatters": "Almost all machine learning algorithms assume data generation follows probability distributions (e.g. Gaussian errors in linear regression, Bernoulli trials in binary classification).",
    "howItWorks": [
      "Discrete Random Variable: Takes countable values. PMF: P(X = x) >= 0 and sum(P(X = x)) = 1.",
      "Continuous Random Variable: Takes uncountably infinite values. PDF f(x) >= 0 and integral(-inf to inf) f(x) dx = 1.",
      "CDF: F(x) = P(X <= x) for both discrete and continuous variables; monotonically increasing from 0 to 1.",
      "Key Discrete Distributions: Bernoulli (single binary trial), Binomial (n independent Bernoulli trials), Poisson (event counts in fixed interval).",
      "Key Continuous Distributions: Uniform, Exponential (memoryless waiting times), Normal/Gaussian (bell curve N(mu, sigma^2)).",
      "Standard Normal: Z = (X - mu) / sigma ~ N(0, 1)."
    ],
    "example": "Height of adult students: Modeled as Normal distribution N(170 cm, 25). The probability of a student being between 165 cm and 175 cm is the area under the bell curve between -1 and +1 standard deviations (≈ 68.2%).",
    "keyPoints": [
      "PMF applies to discrete variables; PDF applies to continuous variables.",
      "For a continuous random variable, the probability of any exact single point is 0: P(X = a) = 0.",
      "Central Limit Theorem: Sums/averages of independent random variables tend toward a Gaussian distribution.",
      "Z-Score standardization: Z = (X - mu) / sigma."
    ],
    "examFocus": [
      "Explain the properties of PDF and CDF with mathematical definitions and sketches (5 marks).",
      "Solve numerical problems on Binomial and Poisson distributions (7 marks).",
      "Explain the Normal (Gaussian) distribution and empirical 68-95-99.7 rule (5 marks)."
    ],
    "selfCheck": {
      "question": "For a continuous random variable X with probability density function f(x), what is the probability that X takes on an exact single value, P(X = 3.5)?",
      "options": [
        "f(3.5)",
        "0",
        "1",
        "0.5"
      ],
      "answer": "0",
      "correctIndex": 1,
      "explanation": "For any continuous random variable, the probability of taking on any exact point value is precisely 0, because probability is defined as the area under the PDF curve over an interval (dx = 0)."
    }
  },
  "math-m2-t3": {
    "topicId": "math-m2-t3",
    "title": "Expectation, Variance, Covariance and Correlation",
    "subjectCode": "24CST503",
    "subjectName": "Advanced Mathematics for Data Science",
    "moduleTitle": "Module II — Probability & Random Processes",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "Expectation E[X] measures the central tendency (mean) of a random variable. Variance Var(X) measures the spread or dispersion around the mean. Covariance Cov(X, Y) measures the joint directional variability of two variables, while Pearson Correlation Coefficient r normalizes covariance to the range [-1, 1].",
    "whyItMatters": "Covariance and correlation matrices form the backbone of Exploratory Data Analysis, feature selection, and Principal Component Analysis (PCA) to remove redundant collinear features.",
    "howItWorks": [
      "Expected Value: E[X] = sum(x * P(x)) for discrete; integral(x * f(x) dx) for continuous.",
      "Linearity of Expectation: E[aX + bY] = a*E[X] + b*E[Y] (always holds, even if X and Y are dependent!).",
      "Variance: Var(X) = E[(X - E[X])^2] = E[X^2] - (E[X])^2; Standard Deviation sigma = sqrt(Var(X)).",
      "Covariance: Cov(X, Y) = E[(X - E[X])(Y - E[Y])] = E[XY] - E[X]E[Y].",
      "Pearson Correlation: rho_XY = Cov(X, Y) / (sigma_X * sigma_Y); range is strictly -1 <= rho <= +1.",
      "rho = +1 implies perfect positive linear relationship; rho = -1 implies perfect negative linear relationship; rho = 0 implies no linear correlation."
    ],
    "example": "If study hours and exam scores have Cov(X,Y) = 24, with sigma_X = 2 and sigma_Y = 15: Correlation r = 24 / (2 * 15) = 24 / 30 = +0.80, indicating a strong positive correlation.",
    "keyPoints": [
      "Variance formula: Var(X) = E[X²] - (E[X])².",
      "Var(aX + b) = a² * Var(X).",
      "Covariance indicates direction of relationship; Correlation indicates both strength and direction bounded in [-1, +1].",
      "Zero correlation does NOT imply independence (only zero LINEAR correlation)."
    ],
    "examFocus": [
      "Derive Var(X) = E[X²] - (E[X])² and prove linearity properties of Expectation (5 marks).",
      "Calculate Covariance and Pearson Correlation coefficient from a bivariate dataset (7 marks)."
    ],
    "selfCheck": {
      "question": "If random variable X has Var(X) = 4, what is the variance of the transformed variable Y = 3X + 5?",
      "options": [
        "12",
        "36",
        "17",
        "41"
      ],
      "answer": "36",
      "correctIndex": 1,
      "explanation": "By variance scaling properties, Var(aX + b) = a² * Var(X). Here, Var(3X + 5) = 3² * Var(X) = 9 * 4 = 36."
    }
  },
  "math-m2-t4": {
    "topicId": "math-m2-t4",
    "title": "Hypothesis Testing, Estimation and Markov Models",
    "subjectCode": "24CST503",
    "subjectName": "Advanced Mathematics for Data Science",
    "moduleTitle": "Module II — Probability & Random Processes",
    "estimatedMinutes": 40,
    "difficulty": "hard",
    "understand": "Statistical Hypothesis Testing evaluates whether sample evidence is strong enough to reject a default baseline claim (Null Hypothesis H0). Point and Interval Estimation compute parameters like confidence intervals. A Markov Chain is a stochastic process that satisfies the Markov property: the future state depends only on the current state, not on the past history.",
    "whyItMatters": "Tech companies use hypothesis testing for A/B testing (e.g. verifying if a new UI button increases conversion). Markov models power Google's PageRank algorithm, speech recognition, and stock transition modeling.",
    "howItWorks": [
      "Null Hypothesis (H0): Default claim of no effect; Alternative Hypothesis (H1): Research claim.",
      "Type I Error (alpha): Rejecting true H0 (False Positive); Type II Error (beta): Failing to reject false H0 (False Negative).",
      "p-value: Probability of observing data at least as extreme as the sample, assuming H0 is true. If p <= alpha, reject H0.",
      "Markov Property: P(X_{t+1} = s | X_t = s_t, ..., X_0 = s_0) = P(X_{t+1} = s | X_t = s_t).",
      "State Transition Matrix P: Square matrix where P_ij represents probability of transitioning from state i to state j; rows sum to 1.",
      "Stationary Distribution pi: Satisfies pi * P = pi."
    ],
    "example": "Weather Markov chain: If it's Sunny today, tomorrow is Sunny with prob 0.8, Rainy with prob 0.2. If Rainy today, tomorrow is Sunny with prob 0.4, Rainy with prob 0.6. Transition matrix P = [[0.8, 0.2], [0.4, 0.6]].",
    "keyPoints": [
      "Rule: If p-value <= alpha (e.g. 0.05), reject the Null Hypothesis H0.",
      "Type I error = False Positive; Type II error = False Negative.",
      "Markov property: 'The future is conditionally independent of the past, given the present.'",
      "Row entries of a Markov transition matrix must sum to exactly 1."
    ],
    "examFocus": [
      "Explain Null hypothesis, Alternative hypothesis, Type I & Type II errors, and p-value (5 marks).",
      "Formulate a Markov chain transition matrix and find the 2-step transition probability and stationary distribution (7 marks)."
    ],
    "selfCheck": {
      "question": "In statistical hypothesis testing, what error is committed when a researcher rejects a Null Hypothesis (H0) that is actually true?",
      "options": [
        "Type II Error",
        "Type I Error",
        "Sampling Bias",
        "Standard Error"
      ],
      "answer": "Type I Error",
      "correctIndex": 1,
      "explanation": "A Type I Error (False Positive) occurs when the null hypothesis H0 is rejected when it is in reality true. The probability of a Type I error is denoted by alpha."
    }
  },
  "math-m3-t1": {
    "topicId": "math-m3-t1",
    "title": "Functions, Limits, Continuity and Derivatives",
    "subjectCode": "24CST503",
    "subjectName": "Advanced Mathematics for Data Science",
    "moduleTitle": "Module III — Calculus & Optimization",
    "estimatedMinutes": 30,
    "difficulty": "easy",
    "understand": "Calculus provides the mathematical language for modeling rates of change and accumulation. A Limit describes the behavior of a function near a point. A function is Continuous if it has no breaks or jumps. The Derivative f'(x) represents the instantaneous rate of change and the geometric slope of the tangent line.",
    "whyItMatters": "Machine learning algorithms optimize models by minimizing loss functions. The derivative points the way toward the local minimum where model errors are minimized.",
    "howItWorks": [
      "Limit: lim_{x -> a} f(x) = L means f(x) becomes arbitrarily close to L as x approaches a.",
      "Continuity: f is continuous at a if: 1. f(a) exists, 2. lim_{x -> a} f(x) exists, and 3. lim_{x -> a} f(x) = f(a).",
      "Derivative definition: f'(x) = lim_{h -> 0} [f(x + h) - f(x)] / h.",
      "Core rules: Power Rule d/dx(x^n) = n*x^(n-1); Product Rule d/dx(uv) = u'v + uv'; Quotient Rule d/dx(u/v) = (u'v - uv') / v^2.",
      "Chain Rule: d/dx(f(g(x))) = f'(g(x)) * g'(x)."
    ],
    "example": "For loss function f(w) = 3w^2 - 12w + 5: Derivative f'(w) = 6w - 12. Setting f'(w) = 0 yields 6w = 12 => w = 2, which is the minimum loss location.",
    "keyPoints": [
      "Derivative f'(x) equals the slope of the tangent line at x.",
      "At a local minimum or maximum of a differentiable function, f'(x) = 0 (Critical point).",
      "Second derivative f''(x) > 0 indicates local minimum (convex); f''(x) < 0 indicates local maximum (concave)."
    ],
    "examFocus": [
      "State conditions for continuity of a function at a point with an example (3 marks).",
      "Find critical points and determine local maxima/minima using first and second derivative tests (5 marks)."
    ],
    "selfCheck": {
      "question": "If a function f(x) has f'(c) = 0 and its second derivative f''(c) > 0, what does the critical point x = c represent?",
      "options": [
        "Local Maximum",
        "Local Minimum",
        "Point of Inflection",
        "Discontinuity"
      ],
      "answer": "Local Minimum",
      "correctIndex": 1,
      "explanation": "By the Second Derivative Test, if f'(c) = 0 and f''(c) > 0, the function is concave up (bowl-shaped) at c, meaning x = c is a Local Minimum."
    }
  },
  "math-m3-t2": {
    "topicId": "math-m3-t2",
    "title": "Partial Derivatives, Chain Rule and Gradients",
    "subjectCode": "24CST503",
    "subjectName": "Advanced Mathematics for Data Science",
    "moduleTitle": "Module III — Calculus & Optimization",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "Multivariable calculus extends single-variable concepts to functions of multiple variables f(x1, x2, ..., xn). A Partial Derivative differentiates with respect to one variable while holding all others constant. The Gradient vector nabla f points in the direction of steepest ascent, and its negative points in the direction of steepest descent.",
    "whyItMatters": "Neural networks contain millions of parameters (weights and biases). Computing partial derivatives via the multivariate chain rule (Backpropagation) is how deep neural networks learn.",
    "howItWorks": [
      "Partial Derivative: ∂f/∂x treats y as a constant; ∂f/∂y treats x as a constant.",
      "Gradient Vector: ∇f = [∂f/∂x1, ∂f/∂x2, ..., ∂f/∂xn]^T in R^n.",
      "Directional Derivative: Rate of change of f in direction of unit vector u is D_u f = ∇f · u.",
      "Maximum rate of increase occurs in the direction of the gradient ∇f, with magnitude ||∇f||.",
      "Multivariate Chain Rule: If z = f(x, y) where x = g(t) and y = h(t), then dz/dt = (∂f/∂x)(dx/dt) + (∂f/∂y)(dy/dt).",
      "Jacobian Matrix: Matrix of all first-order partial derivatives for vector-valued functions.",
      "Hessian Matrix: Square matrix of all second-order partial derivatives (measures curvature)."
    ],
    "example": "For f(x, y) = x^2 * y + 3y^3: ∂f/∂x = 2xy, ∂f/∂y = x^2 + 9y^2. At point (1, 2): ∇f = [2(1)(2), 1^2 + 9(4)]^T = [4, 37]^T.",
    "keyPoints": [
      "Gradient vector ∇f points in the direction of steepest increase.",
      "Negative gradient -∇f points in the direction of steepest decrease (descent).",
      "Jacobian is the matrix of first partial derivatives; Hessian is the matrix of second partial derivatives.",
      "Multivariate chain rule forms the mathematical foundation of Neural Network Backpropagation."
    ],
    "examFocus": [
      "Compute the gradient vector and directional derivative of a multivariable function at a given point (5 marks).",
      "Formulate the Jacobian and Hessian matrices for a bivariate function (7 marks)."
    ],
    "selfCheck": {
      "question": "In what direction does the negative gradient vector -∇f(x) of a multivariable scalar function point?",
      "options": [
        "Direction of steepest ascent (fastest increase)",
        "Direction of steepest descent (fastest decrease)",
        "Perpendicular to the surface without change",
        "Random tangent direction"
      ],
      "answer": "Direction of steepest descent (fastest decrease)",
      "correctIndex": 1,
      "explanation": "While the gradient ∇f points in the direction of maximum rate of increase (steepest ascent), the negative gradient -∇f points in the direction of steepest descent (fastest decrease), which is why optimization algorithms subtract the gradient."
    }
  },
  "math-m3-t4": {
    "topicId": "math-m3-t4",
    "title": "Constrained Optimization, SGD, Adam and RMSProp",
    "subjectCode": "24CST503",
    "subjectName": "Advanced Mathematics for Data Science",
    "moduleTitle": "Module III — Calculus & Optimization",
    "estimatedMinutes": 40,
    "difficulty": "hard",
    "understand": "Constrained optimization solves minimization problems subject to equality and inequality constraints using the Method of Lagrange Multipliers and KKT (Karush-Kuhn-Tucker) conditions. Modern deep learning uses stochastic variants of gradient descent with adaptive learning rates (SGD, Momentum, RMSProp, Adam).",
    "whyItMatters": "Standard Gradient Descent evaluates the entire dataset before making one parameter update—intractable for millions of images. Stochastic optimizers like Adam converge rapidly using noisy mini-batches and per-parameter adaptive momentum.",
    "howItWorks": [
      "Lagrange Multipliers: To minimize f(x) subject to g(x) = 0, construct Lagrangian L(x, lambda) = f(x) + lambda*g(x) and set ∇L = 0.",
      "KKT Conditions: Generalize Lagrange multipliers for inequality constraints g(x) <= 0 (Primal feasibility, Dual feasibility, Complementary slackness).",
      "Stochastic Gradient Descent (SGD): Updates weights using a single random training sample or mini-batch: theta = theta - alpha * ∇J_i(theta).",
      "Momentum: Accumulates past gradients to accelerate through flat plateaus: v_t = gamma*v_{t-1} + alpha*∇J(theta).",
      "RMSProp: Scales learning rates inversely by moving average of squared gradients, damping oscillations.",
      "Adam (Adaptive Moment Estimation): Combines Momentum (first moment m_t) and RMSProp (second moment v_t) with bias correction."
    ],
    "example": "Optimizing a neural net: While vanilla SGD oscillates wildly in ravines, Adam computes running averages of gradients and squared gradients, adapting step size automatically per layer.",
    "keyPoints": [
      "Lagrange multipliers solve equality constrained optimization: ∇f = -lambda * ∇g.",
      "KKT conditions govern optimization with inequality constraints (crucial for Support Vector Machines).",
      "Mini-batch SGD balances computational efficiency and gradient variance.",
      "Adam optimizer combines first moment (momentum) and second moment (adaptive learning rate)."
    ],
    "examFocus": [
      "Explain the method of Lagrange Multipliers with a constrained optimization example (7 marks).",
      "Explain the Adam optimization algorithm and how it combines Momentum and RMSProp (5 marks)."
    ],
    "selfCheck": {
      "question": "Which popular deep learning optimizer combines the advantages of Momentum (first moment of gradients) and RMSProp (second moment of gradients)?",
      "options": [
        "Stochastic Gradient Descent",
        "Adam (Adaptive Moment Estimation)",
        "Newton-Raphson",
        "Batch Gradient Descent"
      ],
      "answer": "Adam (Adaptive Moment Estimation)",
      "correctIndex": 1,
      "explanation": "Adam (Adaptive Moment Estimation) computes exponentially decaying moving averages of both past gradients (momentum) and squared past gradients (RMSProp) to provide individual adaptive learning rates for each parameter."
    }
  },
  "math-m4-t1": {
    "topicId": "math-m4-t1",
    "title": "Mathematical Modeling, Function Approximation and Curve Fitting",
    "subjectCode": "24CST503",
    "subjectName": "Advanced Mathematics for Data Science",
    "moduleTitle": "Module IV — Mathematical Modeling & Fitting",
    "estimatedMinutes": 30,
    "difficulty": "medium",
    "understand": "Mathematical modeling translates observed real-world phenomena into mathematical equations. Function approximation seeks a simpler or computable function (e.g. polynomial, Fourier series) that approximates a target function. Curve fitting constructs a mathematical curve that best fits a series of empirical data points.",
    "whyItMatters": "Supervised machine learning is fundamentally function approximation: finding an unknown function f such that y ≈ f(x) based on observed historical training pairs (x, y).",
    "howItWorks": [
      "Modeling Steps: Real-world problem -> Formulate mathematical equations -> Solve analytically/numerically -> Validate with empirical data.",
      "Weierstrass Approximation Theorem: Any continuous function on a closed interval [a, b] can be uniformly approximated as closely as desired by a polynomial.",
      "Taylor Series: Approximates a differentiable function near point a: f(x) = sum [f^(n)(a) / n!] * (x - a)^n.",
      "Interpolation vs Curve Fitting: Interpolation forces the curve through EVERY data point (prone to Runge's phenomenon oscillation); Curve fitting minimizes overall discrepancy without requiring exact passage through noise."
    ],
    "example": "Using a degree-2 polynomial y = a*x^2 + b*x + c to fit battery discharge curves over temperature, capturing non-linear decay without overfitting to noisy sensor spikes.",
    "keyPoints": [
      "Curve fitting seeks the best overall trend, while interpolation forces exact passage through all points.",
      "Taylor series uses local derivatives to construct polynomial approximations near an expansion point.",
      "Universal Approximation Theorem: Neural networks with one hidden layer can approximate any continuous function."
    ],
    "examFocus": [
      "Differentiate Interpolation vs Curve Fitting with diagrams (5 marks).",
      "Write Taylor series expansion of a function up to degree 3 around a point (5 marks)."
    ],
    "selfCheck": {
      "question": "What is the key difference between Interpolation and Curve Fitting (Regression)?",
      "options": [
        "Interpolation only works for linear lines",
        "Interpolation forces the curve to pass through every given data point, while curve fitting finds an optimal trend line minimizing overall error",
        "Curve fitting never uses mathematical equations",
        "Interpolation is only used for image compression"
      ],
      "answer": "Interpolation forces the curve to pass through every given data point, while curve fitting finds an optimal trend line minimizing overall error",
      "correctIndex": 1,
      "explanation": "Interpolation requires the fitted curve to pass through every single observed data point (often overfitting noisy data), whereas curve fitting/regression finds a smooth curve that best fits the general trend by minimizing overall residual errors."
    }
  },
  "math-m4-t2": {
    "topicId": "math-m4-t2",
    "title": "Least Squares Methods and Model Complexity",
    "subjectCode": "24CST503",
    "subjectName": "Advanced Mathematics for Data Science",
    "moduleTitle": "Module IV — Mathematical Modeling & Fitting",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "The Method of Ordinary Least Squares (OLS) fits a mathematical model to data by minimizing the Sum of Squared Residuals (SSR) between observed values and model predictions. Model complexity refers to the capacity or number of free parameters in the model (e.g. polynomial degree).",
    "whyItMatters": "OLS provides the mathematical foundation of Linear Regression. Finding the optimal model complexity prevents underfitting (too simple) and overfitting (too complex, capturing noise).",
    "howItWorks": [
      "Residual e_i = y_i - y_hat_i = y_i - (w * x_i + b).",
      "Objective: Minimize S = sum(e_i^2) = ||y - X*w||^2.",
      "Normal Equations: Setting gradient ∇_w S = 0 leads to X^T * X * w = X^T * y.",
      "Closed-form solution: w = (X^T * X)^(-1) * X^T * y, provided (X^T * X) is invertible (full column rank).",
      "Model Complexity Tradeoff: High complexity (e.g. degree 15 polynomial) achieves zero training error but fails miserably on test data."
    ],
    "example": "Fitting a line y = mx + c through points (1, 2), (2, 3), (3, 5): Normal equations yield slope m = 1.5, intercept c = 0.33, minimizing the sum of squared vertical distances.",
    "keyPoints": [
      "OLS minimizes the sum of squared differences: sum((y_i - y_hat_i)²).",
      "Normal equation closed-form solution: w = (X^T X)^(-1) X^T y.",
      "Inversion of (X^T X) has computational complexity O(d³), motivating iterative gradient descent for large feature counts.",
      "Increasing model complexity always reduces training error but risks high test error."
    ],
    "examFocus": [
      "Derive the closed-form Normal Equation w = (X^T X)^(-1) X^T y for multiple linear regression (7 marks).",
      "Solve a simple 2D Ordinary Least Squares line fitting numerical (5 marks)."
    ],
    "selfCheck": {
      "question": "What is the closed-form matrix solution (Normal Equation) for parameter vector w in Ordinary Least Squares regression?",
      "options": [
        "w = X^T * y",
        "w = (X^T * X)^(-1) * X^T * y",
        "w = (X * X^T)^(-1) * y",
        "w = X * (X^T * y)^(-1)"
      ],
      "answer": "w = (X^T * X)^(-1) * X^T * y",
      "correctIndex": 1,
      "explanation": "By setting the gradient of the sum of squared residuals with respect to w to zero, we obtain the Normal Equation: X^T X w = X^T y, which yields w = (X^T X)^(-1) X^T y."
    }
  },
  "math-m4-t3": {
    "topicId": "math-m4-t3",
    "title": "Bias-Variance Tradeoff and Overfitting",
    "subjectCode": "24CST503",
    "subjectName": "Advanced Mathematics for Data Science",
    "moduleTitle": "Module IV — Mathematical Modeling & Fitting",
    "estimatedMinutes": 40,
    "difficulty": "hard",
    "understand": "The Bias-Variance Tradeoff is the central dilemma in predictive modeling: Expected Generalization Error = Bias^2 + Variance + Irreducible Error. Bias represents errors from erroneous assumptions (underfitting); Variance represents sensitivity to small fluctuations in training data (overfitting).",
    "whyItMatters": "Achieving high accuracy on training data is useless if the model cannot generalize to unseen test data. Mastering the bias-variance tradeoff allows engineers to select the sweet spot of model capacity.",
    "howItWorks": [
      "High Bias (Underfitting): Model is overly simplistic (e.g. fitting a straight line to quadratic data); high training error, high test error.",
      "High Variance (Overfitting): Model is overly complex (e.g. high-degree polynomial); near-zero training error, very high test error.",
      "Irreducible Error sigma^2: Inherent noise in the data generating process that cannot be eliminated by any model.",
      "Regularization: Constrains model weights to control variance. Ridge (L2: lambda * sum(w_i^2)); Lasso (L1: lambda * sum(|w_i|), induces sparsity).",
      "Techniques to reduce variance: Gather more training data, regularization, feature selection, cross-validation, bagging/ensembles."
    ],
    "example": "A student who memorizes exact practice exam questions word-for-word (overfitting/high variance) scores 100% on practice tests but fails the actual university exam when question numbers change slightly.",
    "keyPoints": [
      "Total Expected Error = Bias² + Variance + Irreducible Error.",
      "Underfitting = High Bias, Low Variance. Overfitting = Low Bias, High Variance.",
      "L1 Regularization (Lasso) produces sparse weights (feature selection); L2 (Ridge) shrinks weights smoothly.",
      "Cross-validation (k-fold) provides reliable empirical estimation of generalization error."
    ],
    "examFocus": [
      "Derive and explain the Bias-Variance decomposition of Mean Squared Error with graphs (7 marks).",
      "Compare L1 (Lasso) vs L2 (Ridge) regularization mechanisms and how they control overfitting (5 marks)."
    ],
    "selfCheck": {
      "question": "A machine learning model achieves 99.8% accuracy on its training dataset but only 58.2% on unseen test data. What problem is occurring?",
      "options": [
        "High Bias (Underfitting)",
        "High Variance (Overfitting)",
        "Zero Irreducible Error",
        "Data Imbalance only"
      ],
      "answer": "High Variance (Overfitting)",
      "correctIndex": 1,
      "explanation": "A large gap between near-perfect training performance and poor test performance is the hallmark of Overfitting (High Variance): the model has memorized training noise instead of general patterns."
    }
  },
  "math-m4-t4": {
    "topicId": "math-m4-t4",
    "title": "Entropy, Cross-Entropy, KL Divergence and Mutual Information",
    "subjectCode": "24CST503",
    "subjectName": "Advanced Mathematics for Data Science",
    "moduleTitle": "Module IV — Mathematical Modeling & Fitting",
    "estimatedMinutes": 40,
    "difficulty": "hard",
    "understand": "Information Theory measures the amount of information, uncertainty, and surprise in probability distributions. Shannon Entropy H(X) quantifies the average uncertainty of a random variable. Cross-Entropy measures the difference between true and predicted distributions. KL Divergence (Relative Entropy) measures the information lost when approximating one distribution with another.",
    "whyItMatters": "Binary Cross-Entropy and Categorical Cross-Entropy are the universal loss functions for training classification neural networks, logistic regression, and Large Language Models.",
    "howItWorks": [
      "Self-Information: I(x) = -log2(p(x)); rarer events convey higher information/surprise.",
      "Shannon Entropy: H(X) = -sum p(x) * log2(p(x)) >= 0; maximized when all outcomes are uniformly likely.",
      "Cross-Entropy: H(P, Q) = -sum P(x) * log Q(x), where P is true distribution (one-hot label) and Q is model probability.",
      "Kullback-Leibler (KL) Divergence: D_KL(P || Q) = sum P(x) * log(P(x) / Q(x)) = H(P, Q) - H(P) >= 0; asymmetric.",
      "Mutual Information: I(X; Y) = H(X) - H(X | Y); measures the reduction in uncertainty of X given knowledge of Y."
    ],
    "example": "A fair coin has Entropy H = -[0.5*log2(0.5) + 0.5*log2(0.5)] = 1 bit. A double-headed coin (p=1) has H = -[1*log2(1)] = 0 bits (zero uncertainty).",
    "keyPoints": [
      "Shannon Entropy measures average uncertainty: H(X) = -sum(p log p).",
      "Cross-Entropy H(P, Q) = H(P) + D_KL(P || Q); minimizing cross-entropy is equivalent to minimizing KL divergence.",
      "KL divergence is always non-negative (D_KL >= 0) and asymmetric (D_KL(P||Q) ≠ D_KL(Q||P)).",
      "Binary Cross-Entropy Loss: L = -[y*log(p) + (1-y)*log(1-p)]."
    ],
    "examFocus": [
      "Define Shannon Entropy, Cross-Entropy, and KL Divergence with formulas and properties (7 marks).",
      "Calculate entropy of a discrete distribution and explain its role in decision trees (5 marks)."
    ],
    "selfCheck": {
      "question": "What is the Shannon Entropy of a deterministic event that is 100% guaranteed to happen (probability p = 1.0)?",
      "options": [
        "1 bit",
        "0 bits",
        "Infinite bits",
        "0.5 bits"
      ],
      "answer": "0 bits",
      "correctIndex": 1,
      "explanation": "H(X) = -1.0 * log2(1.0) = -1.0 * 0 = 0 bits. A deterministic event contains zero uncertainty or surprise, hence its entropy is zero."
    }
  },
  "ml-m1-t2": {
    "topicId": "ml-m1-t2",
    "title": "Machine Learning Pipeline and Workflow",
    "subjectCode": "24CSR504",
    "subjectName": "Machine Learning",
    "moduleTitle": "Module I — Foundations of Machine Learning",
    "estimatedMinutes": 30,
    "difficulty": "easy",
    "understand": "An end-to-end Machine Learning pipeline is the standardized sequence of data processing and modeling stages that transforms raw real-world data into an operational predictive model: Problem Definition, Data Ingestion, Preprocessing, Feature Engineering, Model Training, Evaluation, Deployment, and Monitoring.",
    "whyItMatters": "Building a machine learning model is only 15% of the engineering work. Without a robust automated pipeline, models suffer from data leakage, feature drift, and silent failures in production.",
    "howItWorks": [
      "1. Problem Formulation: Frame business goal as supervised (classification/regression) or unsupervised task.",
      "2. Data Collection & Ingestion: Gathering historical records, databases, logs, and external APIs.",
      "3. Exploratory Data Analysis (EDA): Visualizing distributions, correlations, and checking class imbalances.",
      "4. Data Preprocessing: Imputing missing values, removing outliers, normalizing numerical scales.",
      "5. Feature Engineering: Creating domain-specific indicators, polynomial features, and encodings.",
      "6. Model Training & Hyperparameter Tuning: Grid search, random search, cross-validation.",
      "7. Deployment & Monitoring: Exporting model (ONNX, Pickle) to REST API and tracking Concept Drift over time."
    ],
    "example": "Credit card fraud pipeline: Incoming transaction -> Impute missing merchant ID -> Scale amount -> Check against XGBoost model -> If prob > 0.85, block transaction and trigger SMS alert in under 50ms.",
    "keyPoints": [
      "Pipeline stages: Data -> Preprocess -> Feature Engineering -> Train -> Validate -> Deploy -> Monitor.",
      "Data Leakage occurs when test information accidentally leaks into the training pipeline.",
      "Concept Drift occurs when real-world statistical patterns change after deployment (e.g. changing consumer behavior)."
    ],
    "examFocus": [
      "Draw and explain the complete end-to-end Machine Learning workflow pipeline (7 marks).",
      "Explain Data Leakage and Concept Drift with real-world examples (5 marks)."
    ],
    "selfCheck": {
      "question": "What is 'Data Leakage' in a machine learning pipeline?",
      "options": [
        "A hacker stealing the database credentials",
        "When information from the test/target dataset inadvertently contaminates the training set, giving falsely optimistic performance",
        "Memory leaking from a Python script",
        "Dropping columns with missing values"
      ],
      "answer": "When information from the test/target dataset inadvertently contaminates the training set, giving falsely optimistic performance",
      "correctIndex": 1,
      "explanation": "Data leakage happens when features created using information from the test or target dataset are mistakenly included during model training, leading to unrealistically high validation scores that fail in production."
    }
  },
  "ml-m1-t3": {
    "topicId": "ml-m1-t3",
    "title": "Data Preprocessing",
    "subjectCode": "24CSR504",
    "subjectName": "Machine Learning",
    "moduleTitle": "Module I — Foundations of Machine Learning",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "Data preprocessing transforms messy, raw real-world data into a clean, numerical format suitable for machine learning algorithms. Core techniques include handling missing values, encoding categorical variables, scaling numerical features, and splitting data into training, validation, and test sets.",
    "whyItMatters": "Garbage In, Garbage Out. If an algorithm receives unscaled features (e.g. Salary in thousands and Age in tens), distance-based algorithms like k-NN or Gradient Descent will mistakenly treat Salary as 1,000 times more important than Age.",
    "howItWorks": [
      "Handling Missing Data: Removal (drop rows/cols if sparse), Imputation (Mean/Median for numerical, Mode for categorical, k-NN imputation).",
      "Encoding Categoricals: Label Encoding (for ordinal variables with intrinsic ranking), One-Hot Encoding (for nominal unordered variables).",
      "Feature Scaling 1 — Min-Max Normalization: x_norm = (x - min) / (max - min); scales values into [0, 1].",
      "Feature Scaling 2 — Standardization (Z-score): x_std = (x - mu) / sigma; centers data around mean 0 with unit variance 1.",
      "Train-Validation-Test Split: Typically 70% Train, 15% Validation (for hyperparameter tuning), 15% Test (unbiased final evaluation)."
    ],
    "example": "Housing price prediction: Standardizing square footage (500 to 5,000 sq ft) and bedrooms (1 to 5) ensures gradient descent steps descend directly toward the minimum without erratic oscillations.",
    "keyPoints": [
      "One-Hot Encoding converts nominal categories into binary indicator vectors.",
      "Standardization (Z-score) is robust to outliers and preferred for algorithms assuming Gaussian distributions.",
      "Always fit transformers (scalers/encoders) on the training set ONLY, then transform the test set to avoid leakage."
    ],
    "examFocus": [
      "Compare Min-Max Normalization vs Standardization (Z-score) with formulas and use cases (5 marks).",
      "Explain techniques for handling missing values and categorical data encoding (5 marks)."
    ],
    "selfCheck": {
      "question": "Which feature scaling method transforms values to have a mean of 0 and a standard deviation of 1?",
      "options": [
        "Min-Max Normalization",
        "Standardization (Z-Score Scaling)",
        "One-Hot Encoding",
        "Log Transformation"
      ],
      "answer": "Standardization (Z-Score Scaling)",
      "correctIndex": 1,
      "explanation": "Standardization (StandardScaler) calculates (x - mean) / std_dev, producing a distribution centered at mean 0 with standard deviation 1."
    }
  },
  "ml-m1-t4": {
    "topicId": "ml-m1-t4",
    "title": "Model Evaluation and Validation",
    "subjectCode": "24CSR504",
    "subjectName": "Machine Learning",
    "moduleTitle": "Module I — Foundations of Machine Learning",
    "estimatedMinutes": 40,
    "difficulty": "medium",
    "understand": "Model evaluation quantifies how effectively a trained model generalizes to new data. For classification, a Confusion Matrix tracks True Positives (TP), False Positives (FP), True Negatives (TN), and False Negatives (FN) to compute Precision, Recall, F1-Score, and ROC-AUC. Cross-validation evaluates statistical stability.",
    "whyItMatters": "Accuracy is dangerously misleading on imbalanced datasets. If 99% of transactions are legitimate and 1% are fraudulent, a dumb model predicting 'not fraud' for everything achieves 99% accuracy but catches zero fraud.",
    "howItWorks": [
      "Confusion Matrix: Rows = True Class, Columns = Predicted Class (TP, FP, TN, FN).",
      "Accuracy = (TP + TN) / (TP + TN + FP + FN).",
      "Precision = TP / (TP + FP); measures exactness ('Out of all predicted positive, how many were truly positive?').",
      "Recall (Sensitivity) = TP / (TP + FN); measures completeness ('Out of all actual positive cases, how many did we catch?').",
      "F1-Score = Harmonic Mean of Precision and Recall = 2 * (Precision * Recall) / (Precision + Recall).",
      "ROC Curve: Plots True Positive Rate (Recall) vs False Positive Rate (FPR = FP / (FP + TN)) across varying probability thresholds; AUC measures overall ranking capability.",
      "k-Fold Cross-Validation: Splits data into k subsets; trains on k-1 folds and validates on 1 fold, repeated k times."
    ],
    "example": "Cancer diagnosis: High Recall is critical (FN means missing a cancer patient). Spam email filtering: High Precision is critical (FP means sending an important job offer to spam).",
    "keyPoints": [
      "Accuracy fails on imbalanced datasets; use Precision, Recall, F1-Score, and ROC-AUC.",
      "Precision penalizes False Positives; Recall penalizes False Negatives.",
      "F1-score is the harmonic mean, severely penalizing models where either precision or recall is low.",
      "k-Fold cross validation prevents lucky or unlucky train-test splits."
    ],
    "examFocus": [
      "Construct a Confusion Matrix and calculate Accuracy, Precision, Recall, and F1-Score from given counts (7 marks).",
      "Explain the ROC curve and Area Under Curve (AUC) metric (5 marks).",
      "Explain k-Fold Cross Validation with diagrams (5 marks)."
    ],
    "selfCheck": {
      "question": "If a medical diagnostic model predicts 100 positive cases, of which 80 are truly sick and 20 are healthy, what is the model's Precision?",
      "options": [
        "80%",
        "20%",
        "90%",
        "64%"
      ],
      "answer": "80%",
      "correctIndex": 0,
      "explanation": "Precision = TP / (TP + FP) = 80 / (80 + 20) = 80 / 100 = 80%."
    }
  },
  "ml-m2-t1": {
    "topicId": "ml-m2-t1",
    "title": "Linear Regression and Multiple Regression",
    "subjectCode": "24CSR504",
    "subjectName": "Machine Learning",
    "moduleTitle": "Module II — Supervised Learning: Regression & Classification",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "Linear Regression models the relationship between a continuous dependent target variable y and one or more independent explanatory features x by fitting a linear hypothesis: y_hat = w1*x1 + w2*x2 + ... + wn*xn + b. The parameters are learned by minimizing Mean Squared Error (MSE).",
    "whyItMatters": "Linear regression is the fundamental baseline algorithm in econometric forecasting, real-estate pricing, algorithmic trading, and data science.",
    "howItWorks": [
      "Simple Linear Regression: y_hat = w*x + b (single feature, line in 2D).",
      "Multiple Linear Regression: y_hat = w^T * x + b (multiple features, hyperplane in n-D).",
      "Loss Function (Mean Squared Error): J(w, b) = (1/2m) * sum((y_hat_i - y_i)^2).",
      "Assumptions of Linear Regression: Linearity, Independence of errors, Homoscedasticity (constant error variance), Normality of residuals, No multicollinearity.",
      "Evaluation Metrics: Mean Absolute Error (MAE), Mean Squared Error (MSE), Root Mean Squared Error (RMSE), and R-squared coefficient of determination."
    ],
    "example": "Predicting car price: Price = 25000 - 1200*(Age in years) + 0.15*(Horsepower) - 0.05*(Mileage). Each coefficient indicates the marginal effect of that feature holding other features constant.",
    "keyPoints": [
      "Hypothesis function: y_hat = w^T * x + b.",
      "MSE loss function is convex (bowl-shaped), guaranteeing that gradient descent finds the global minimum.",
      "R-squared measures the proportion of variance in y explained by the model (0 to 1).",
      "Multicollinearity inflates coefficient variance, requiring VIF analysis or Ridge regularization."
    ],
    "examFocus": [
      "Derive the partial derivatives of the MSE cost function with respect to weights and bias (7 marks).",
      "List the 5 core statistical assumptions of Linear Regression (5 marks).",
      "Explain evaluation metrics: MAE, MSE, RMSE, and R² (5 marks)."
    ],
    "selfCheck": {
      "question": "Why is the Mean Squared Error (MSE) cost function preferred over arbitrary loss functions for Linear Regression?",
      "options": [
        "It is non-differentiable",
        "It is a convex function, guaranteeing a unique global minimum with no local traps",
        "It produces negative numbers for errors",
        "It ignores outliers completely"
      ],
      "answer": "It is a convex function, guaranteeing a unique global minimum with no local traps",
      "correctIndex": 1,
      "explanation": "MSE is mathematically convex (strictly bowl-shaped), ensuring that gradient descent will always converge toward the unique global minimum without getting stuck in sub-optimal local minima."
    }
  },
  "ml-m2-t2": {
    "topicId": "ml-m2-t2",
    "title": "Gradient Descent and Cost Function",
    "subjectCode": "24CSR504",
    "subjectName": "Machine Learning",
    "moduleTitle": "Module II — Supervised Learning: Regression & Classification",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "Gradient Descent is an iterative first-order optimization algorithm used to find the parameter values (weights w and bias b) that minimize a model's cost function J(w, b). It updates parameters in the direction of the negative gradient scaled by a step size known as the Learning Rate (alpha).",
    "whyItMatters": "While small linear models can be solved analytically using matrix inversion, complex models (neural networks, logistic regression) have no closed-form solution and rely entirely on gradient descent.",
    "howItWorks": [
      "Cost Function J(w, b): Quantifies overall prediction error across all training examples.",
      "Gradient: Vector of partial derivatives [∂J/∂w, ∂J/∂b]^T representing direction of steepest uphill slope.",
      "Parameter Update Rule: w := w - alpha * (∂J/∂w); b := b - alpha * (∂J/∂b).",
      "Learning Rate alpha Impact: Too small -> very slow convergence; Too large -> overshoots, oscillates, or diverges to infinity.",
      "Variants: Batch Gradient Descent (uses entire dataset per step), Stochastic Gradient Descent (uses 1 sample per step), Mini-Batch Gradient Descent (uses 32–256 samples per step)."
    ],
    "example": "Imagine being blindfolded on a foggy mountain (cost surface): You feel the ground slope under your feet and take a step in the steepest downhill direction. Repeating this brings you to the valley bottom.",
    "keyPoints": [
      "Update rule: theta := theta - alpha * ∇J(theta).",
      "Gradient approaches 0 as parameters near the minimum, naturally shrinking step size.",
      "Feature scaling ensures gradient contours are circular rather than stretched ellipses, speeding up convergence."
    ],
    "examFocus": [
      "Explain the Gradient Descent algorithm with update equations and learning rate dynamics (7 marks).",
      "Compare Batch, Stochastic (SGD), and Mini-Batch gradient descent (5 marks)."
    ],
    "selfCheck": {
      "question": "What happens during gradient descent if the learning rate (alpha) is chosen to be excessively large?",
      "options": [
        "The model reaches the minimum in exactly 1 step",
        "The algorithm may overshoot the minimum, oscillate wildly, or fail to converge (diverge)",
        "The weights immediately become zero",
        "The cost function automatically turns linear"
      ],
      "answer": "The algorithm may overshoot the minimum, oscillate wildly, or fail to converge (diverge)",
      "correctIndex": 1,
      "explanation": "If the learning rate is too large, the parameter updates take steps that overshoot the valley bottom, causing the loss to oscillate and diverge toward infinity."
    }
  },
  "ml-m2-t4": {
    "topicId": "ml-m2-t4",
    "title": "k-NN, Decision Trees and Naïve Bayes",
    "subjectCode": "24CSR504",
    "subjectName": "Machine Learning",
    "moduleTitle": "Module II — Supervised Learning: Regression & Classification",
    "estimatedMinutes": 40,
    "difficulty": "medium",
    "understand": "k-NN, Decision Trees, and Naïve Bayes are three foundational supervised classification algorithms. k-NN is a lazy, instance-based classifier using distance metrics; Decision Trees use recursive hierarchical binary splits based on Gini Impurity or Information Gain; Naïve Bayes is a probabilistic classifier applying Bayes' Theorem under the 'naïve' assumption of conditional feature independence.",
    "whyItMatters": "Decision trees provide transparent explainability (interpretable rules for medical diagnosis), Naïve Bayes is blisteringly fast for spam text classification, and k-NN provides non-linear boundary detection without assumptions.",
    "howItWorks": [
      "k-Nearest Neighbors (k-NN): Stores all training data; to classify a new point, computes Euclidean distances, finds k closest neighbors, and assigns the majority vote class.",
      "Decision Trees: Recursively partitions data using greedy splits. Splitting criteria: Gini Impurity = 1 - sum(p_i^2) (CART) or Entropy & Information Gain (ID3/C4.5).",
      "Tree Pruning: Pre-pruning (max_depth, min_samples_split) and post-pruning prevent tree overfitting.",
      "Naïve Bayes: Computes posterior P(y | x) proportional to P(y) * prod(P(x_i | y)); assumes features x_i are conditionally independent given class y.",
      "Laplace Smoothing: Adds pseudo-counts to prevent zero-probability multiplications for unseen words."
    ],
    "example": "Spam filtering: Naïve Bayes calculates P(Spam | 'lottery', 'free', 'win') using the historical frequencies of those words in known spam vs ham emails.",
    "keyPoints": [
      "k-NN is non-parametric and lazy (no training phase; O(n) inference latency).",
      "Decision trees are highly interpretable but prone to high variance (overfitting); mitigated via Random Forests.",
      "Naïve Bayes 'naïve' assumption: All input features are conditionally independent given the class label."
    ],
    "examFocus": [
      "Explain Decision Tree split selection using Gini Impurity and Information Gain (7 marks).",
      "Classify a query record using Naïve Bayes with Laplace smoothing (7 marks).",
      "Explain the k-NN algorithm and the effect of choosing odd vs even k values (5 marks)."
    ],
    "selfCheck": {
      "question": "What is the 'naïve' assumption made by the Naïve Bayes classification algorithm?",
      "options": [
        "All features follow a uniform distribution",
        "All features are mutually conditionally independent given the class label",
        "The training dataset has zero label noise",
        "The decision boundary is strictly linear"
      ],
      "answer": "All features are mutually conditionally independent given the class label",
      "correctIndex": 1,
      "explanation": "Naïve Bayes is named 'naïve' because it assumes that the presence or value of a particular feature is completely independent of the value of any other feature, given the class label."
    }
  },
  "ml-m3-t1": {
    "topicId": "ml-m3-t1",
    "title": "Supervised vs Unsupervised Learning",
    "subjectCode": "24CSR504",
    "subjectName": "Machine Learning",
    "moduleTitle": "Module III — Unsupervised Learning & Dimensionality Reduction",
    "estimatedMinutes": 30,
    "difficulty": "easy",
    "understand": "Supervised Learning trains models on labeled input-output pairs (x, y) to predict target values on unseen data (Classification and Regression). Unsupervised Learning discovers hidden patterns, clusters, and representations in unlabeled data (x) with no human ground truth (Clustering, Dimensionality Reduction, Anomaly Detection).",
    "whyItMatters": "Labeling millions of data points requires expensive human annotators (e.g. radiologists marking tumors). Unsupervised learning uncovers organic customer segments and anomalies automatically without manual labels.",
    "howItWorks": [
      "Supervised Learning Tasks: Classification (discrete categorical target, e.g. spam/ham) and Regression (continuous numeric target, e.g. stock price).",
      "Supervised Algorithms: Linear Regression, Logistic Regression, SVM, Decision Trees, Neural Networks.",
      "Unsupervised Learning Tasks: Clustering (grouping similar items), Dimensionality Reduction (compressing features while preserving variance), Association Rule Mining (market basket analysis).",
      "Unsupervised Algorithms: k-Means, Hierarchical Clustering, DBSCAN, PCA, Autoencoders.",
      "Semi-Supervised Learning: Combines small labeled dataset with large unlabeled corpus to boost model accuracy."
    ],
    "example": "Netflix: Supervised learning predicts what rating you will give 'Stranger Things' (Regression). Unsupervised learning clusters viewers into 500 viewing taste communities without predefined genre labels.",
    "keyPoints": [
      "Supervised = Labeled training data (x -> y); evaluation uses ground-truth metrics (Accuracy, MSE).",
      "Unsupervised = Unlabeled data (x only); evaluation uses intrinsic cluster metrics (Silhouette score).",
      "Reinforcement Learning = Agent learns via trial-and-error rewards and penalties in an environment."
    ],
    "examFocus": [
      "Compare Supervised, Unsupervised, and Reinforcement learning paradigms with examples (7 marks).",
      "Differentiate Classification vs Clustering (3 marks)."
    ],
    "selfCheck": {
      "question": "Customer segmentation (grouping bank customers based on spending patterns without predefined category tags) is an example of which machine learning paradigm?",
      "options": [
        "Supervised Learning",
        "Unsupervised Learning",
        "Reinforcement Learning",
        "Semi-Supervised Regression"
      ],
      "answer": "Unsupervised Learning",
      "correctIndex": 1,
      "explanation": "Since the data contains no predefined labels or target classifications, discovering clusters of customer spending patterns is an Unsupervised Learning task."
    }
  },
  "ml-m3-t3": {
    "topicId": "ml-m3-t3",
    "title": "Hierarchical Clustering and DBSCAN",
    "subjectCode": "24CSR504",
    "subjectName": "Machine Learning",
    "moduleTitle": "Module III — Unsupervised Learning & Dimensionality Reduction",
    "estimatedMinutes": 40,
    "difficulty": "hard",
    "understand": "Hierarchical Clustering builds a nested tree of clusters visualized as a Dendrogram. DBSCAN (Density-Based Spatial Clustering of Applications with Noise) groups points based on spatial point density, capable of finding arbitrarily shaped clusters and identifying outliers as noise.",
    "whyItMatters": "k-Means fails when clusters are non-spherical (e.g. concentric circles) or contain background noise points. DBSCAN handles arbitrary shapes and does not require pre-specifying the number of clusters k.",
    "howItWorks": [
      "Hierarchical Clustering: Agglomerative (bottom-up; starts with each point as its own cluster and iteratively merges closest pairs) or Divisive (top-down).",
      "Linkage Criteria: Single (min distance, causes chaining), Complete (max distance, compact clusters), Average, Ward's Linkage (minimizes variance).",
      "Dendrogram: Tree diagram where the height of the cut determines the number of clusters.",
      "DBSCAN Parameters: eps (radius of neighborhood) and minPts (minimum points to form dense region).",
      "DBSCAN Point Types: Core Point (>= minPts within eps), Border Point (< minPts within eps but reachable from a Core point), Noise Point (neither Core nor Border; outlier)."
    ],
    "example": "GPS taxi route clustering: DBSCAN clusters GPS coordinates along winding highways (arbitrary shapes) while ignoring random scattered GPS sensor anomalies as noise.",
    "keyPoints": [
      "Dendrogram horizontal cut line determines final cluster count in hierarchical clustering.",
      "DBSCAN does not require specifying k beforehand; automatically detects noise outliers.",
      "Core points have at least minPts within distance eps; Noise points are isolated."
    ],
    "examFocus": [
      "Explain Agglomerative Hierarchical Clustering and interpret a Dendrogram (7 marks).",
      "Explain DBSCAN algorithm concepts: Core points, Border points, Noise, and Density-Reachability (7 marks)."
    ],
    "selfCheck": {
      "question": "In the DBSCAN density-based clustering algorithm, what is a 'Core Point'?",
      "options": [
        "The centroid average of all data points",
        "A point that contains at least minPts data points within its eps neighborhood radius",
        "A point located on the outermost boundary of a cluster",
        "An isolated outlier point"
      ],
      "answer": "A point that contains at least minPts data points within its eps neighborhood radius",
      "correctIndex": 1,
      "explanation": "A Core Point in DBSCAN is defined as any point that has at least the threshold number of neighboring points (minPts) within its neighborhood radius eps."
    }
  },
  "ml-m3-t4": {
    "topicId": "ml-m3-t4",
    "title": "PCA, LDA and t-SNE",
    "subjectCode": "24CSR504",
    "subjectName": "Machine Learning",
    "moduleTitle": "Module III — Unsupervised Learning & Dimensionality Reduction",
    "estimatedMinutes": 40,
    "difficulty": "hard",
    "understand": "Dimensionality reduction transforms high-dimensional datasets into lower-dimensional representations while preserving essential information. Principal Component Analysis (PCA) is an unsupervised linear technique maximizing variance. Linear Discriminant Analysis (LDA) is a supervised linear technique maximizing class separability. t-SNE is a non-linear probabilistic technique for 2D/3D visualization.",
    "whyItMatters": "High-dimensional data suffers from the 'Curse of Dimensionality' (sparse data, exponential volume growth, slow training). Dimensionality reduction speeds up training and makes 100-feature datasets visualizable on human screens.",
    "howItWorks": [
      "PCA (Unsupervised): Computes data covariance matrix Sigma; finds eigenvectors (principal components) and eigenvalues; projects data onto top k eigenvectors that capture maximum variance.",
      "Explained Variance Ratio: lambda_i / sum(lambda) measures the proportion of total variance captured by each principal component.",
      "LDA (Supervised): Maximizes between-class variance S_B while minimizing within-class variance S_W (Fisher criterion J(w) = w^T S_B w / w^T S_W w).",
      "t-SNE (t-Distributed Stochastic Neighbor Embedding): Converts high-dimensional Euclidean distances into conditional probabilities; minimizes KL divergence using Student-t distribution in 2D space to preserve local neighborhoods."
    ],
    "example": "Facial recognition (Eigenfaces): 10,000 pixel dimensions per face image are reduced to 50 principal components via PCA while preserving 95% of facial variance.",
    "keyPoints": [
      "PCA is unsupervised (maximizes variance); LDA is supervised (maximizes class separation).",
      "Eigenvectors of the covariance matrix form the orthogonal principal component axes.",
      "t-SNE is non-linear and strictly used for visual exploration (not for general feature extraction)."
    ],
    "examFocus": [
      "Explain the step-by-step mathematical algorithm of Principal Component Analysis (PCA) (7 marks).",
      "Compare PCA vs Linear Discriminant Analysis (LDA) with scatter plot sketches (5 marks)."
    ],
    "selfCheck": {
      "question": "What is the primary difference between Principal Component Analysis (PCA) and Linear Discriminant Analysis (LDA)?",
      "options": [
        "PCA is supervised while LDA is unsupervised",
        "PCA is unsupervised and maximizes variance, while LDA is supervised and maximizes class separation",
        "PCA only works on text data",
        "LDA is non-linear while PCA is non-linear"
      ],
      "answer": "PCA is unsupervised and maximizes variance, while LDA is supervised and maximizes class separation",
      "correctIndex": 1,
      "explanation": "PCA ignores class labels and finds axes that maximize overall data variance (unsupervised), whereas LDA utilizes class labels to find axes that maximize the ratio of between-class scatter to within-class scatter (supervised)."
    }
  },
  "ml-m4-t1": {
    "topicId": "ml-m4-t1",
    "title": "Biological vs Artificial Neurons",
    "subjectCode": "24CSR504",
    "subjectName": "Machine Learning",
    "moduleTitle": "Module IV — Neural Networks & Perceptrons",
    "estimatedMinutes": 30,
    "difficulty": "easy",
    "understand": "Artificial Neural Networks (ANNs) are computational models inspired by the biological neural structures of the human brain. An Artificial Neuron (Perceptron / Node) abstracts the biological neuron by computing a weighted sum of inputs plus a bias and passing it through a non-linear activation function.",
    "whyItMatters": "Understanding the biological mapping provides the physical intuition for neural connection weights (synaptic strengths), biases (firing thresholds), and activation functions (action potentials).",
    "howItWorks": [
      "Biological Components: Dendrites (receive signals) -> Soma (cell body, integrates electrical charges) -> Axon (transmits pulse) -> Synapses (junctions regulating signal transmission).",
      "Artificial Analogues: Inputs x_i (dendrites) -> Weights w_i (synaptic strength) -> Net input summation z = sum(w_i * x_i) + b (soma) -> Activation function f(z) (action potential) -> Output y (axon).",
      "Biological brains operate with massive parallelism, continuous analog chemical signals, and energy efficiency (~20W), whereas ANNs operate digitally on synchronized matrix GPUs."
    ],
    "example": "Biological: A sensory neuron fires if combined electrical input from dendrites crosses -55 mV threshold. Artificial: A node computes z = 0.5*x1 + 0.8*x2 - 1.2; if z > 0, ReLU activates and outputs z.",
    "keyPoints": [
      "Dendrites -> Inputs (x_i); Synapses -> Weights (w_i); Soma -> Net Summation; Axon -> Output (y).",
      "Weights model synaptic plasticity: positive weights are excitatory; negative weights are inhibitory.",
      "Bias acts as the activation threshold parameter."
    ],
    "examFocus": [
      "Compare Biological Neuron vs Artificial Neuron with comparative mapping table and diagrams (7 marks).",
      "Explain the mathematical model of an artificial neuron (5 marks)."
    ],
    "selfCheck": {
      "question": "In the biological-to-artificial neuron mapping, which artificial component corresponds to biological synapses?",
      "options": [
        "Inputs (x)",
        "Connection Weights (w)",
        "Activation Function",
        "Output (y)"
      ],
      "answer": "Connection Weights (w)",
      "correctIndex": 1,
      "explanation": "Biological synapses modulate the strength and chemical efficacy of signals traveling between neurons, which is modeled in artificial neurons by multiplying inputs by numerical connection Weights (w)."
    }
  },
  "ml-m4-t2": {
    "topicId": "ml-m4-t2",
    "title": "Neural Network Connections, Learning and Activation Functions",
    "subjectCode": "24CSR504",
    "subjectName": "Machine Learning",
    "moduleTitle": "Module IV — Neural Networks & Perceptrons",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "Neural network architectures connect layers of neurons (Input layer, Hidden layers, Output layer). Activation functions introduce non-linearity, allowing neural networks to learn complex non-linear decision boundaries. Without non-linear activation functions, any multi-layer neural network collapses into a simple linear regression model.",
    "whyItMatters": "Real-world data (audio, images, language) is profoundly non-linear. Non-linear activation functions give deep networks the mathematical capacity to approximate complex functions (Universal Approximation Theorem).",
    "howItWorks": [
      "Feedforward Architecture: Signals flow strictly forward from input to hidden to output layers with no cycles.",
      "Linear Activation f(z) = z: Stacking multiple linear layers yields another linear function: W2*(W1*x) = (W2*W1)*x = W_combined*x.",
      "Sigmoid: sigma(z) = 1 / (1 + e^(-z)); outputs in (0, 1); suffers from Vanishing Gradient problem for large |z|.",
      "Tanh: tanh(z) = (e^z - e^(-z)) / (e^z + e^(-z)); zero-centered in (-1, 1); still suffers from vanishing gradients.",
      "ReLU (Rectified Linear Unit): f(z) = max(0, z); computationally fast, does not saturate for z > 0, standard default for hidden layers.",
      "Leaky ReLU: f(z) = max(0.01*z, z); resolves 'Dying ReLU' problem by permitting a small positive gradient for negative inputs.",
      "Softmax: sigma(z)_i = e^(z_i) / sum(e^(z_j)); normalizes output logits into valid multi-class probability distributions summing to 1."
    ],
    "example": "Multi-class image classification (Cat, Dog, Bird): The final layer uses Softmax to convert raw scores [2.1, 0.4, 0.1] into probabilities [0.81, 0.14, 0.05].",
    "keyPoints": [
      "Without non-linear activations, deep networks are mathematically equivalent to a single linear layer.",
      "ReLU (max(0, z)) is the preferred standard activation for hidden layers in modern deep learning.",
      "Sigmoid is used for binary output; Softmax is used for multi-class classification output.",
      "Vanishing gradient problem occurs when activation derivative approaches 0 for extreme values."
    ],
    "examFocus": [
      "Compare Sigmoid, Tanh, and ReLU activation functions with equations, ranges, and derivative sketches (7 marks).",
      "Why are non-linear activation functions necessary in multi-layer neural networks? (5 marks).",
      "Explain the Softmax activation function and its mathematical formulation (5 marks)."
    ],
    "selfCheck": {
      "question": "What happens if a multi-layer neural network uses only linear activation functions across all hidden layers?",
      "options": [
        "It achieves infinite non-linear capacity",
        "The entire multi-layer network mathematically collapses into an ordinary single-layer linear model",
        "It causes exploding gradients",
        "It can solve the XOR problem easily"
      ],
      "answer": "The entire multi-layer network mathematically collapses into an ordinary single-layer linear model",
      "correctIndex": 1,
      "explanation": "The composition of linear functions is always just another linear function. Without non-linear activations, stacking 100 hidden layers provides no extra representational power over a basic linear model."
    }
  },
  "ml-m4-t3": {
    "topicId": "ml-m4-t3",
    "title": "McCulloch-Pitts Neuron and Hebbian Learning",
    "subjectCode": "24CSR504",
    "subjectName": "Machine Learning",
    "moduleTitle": "Module IV — Neural Networks & Perceptrons",
    "estimatedMinutes": 35,
    "difficulty": "medium",
    "understand": "Proposed in 1943, the McCulloch-Pitts (MP) Neuron was the first mathematical model of a biological neuron, capable of performing fundamental binary logical operations (AND, OR, NOT) using threshold logic. Hebbian Learning (1949) is a biologically plausible learning rule based on Donald Hebb's postulate: 'Neurons that fire together, wire together.'",
    "whyItMatters": "McCulloch-Pitts proved that networks of threshold logic units can compute any boolean function, laying the foundation of theoretical computer science and neural networks. Hebbian learning explains biological associative memory.",
    "howItWorks": [
      "McCulloch-Pitts Model: Binary inputs x_i in {0, 1}, binary weights (excitatory +1, inhibitory -infinity).",
      "Firing Rule: y = 1 if sum(x_i) >= theta AND no inhibitory input is active; otherwise y = 0.",
      "Realizing Logic Gates with MP Neuron: AND Gate: theta = n (all inputs must be 1); OR Gate: theta = 1 (at least one input 1); NOT Gate: 1 excitatory input with threshold 1 and 1 inhibitory input.",
      "Limitation of MP Neuron: Weights are hand-coded constants, not learned automatically from data.",
      "Hebbian Learning Rule: When presynaptic neuron i and postsynaptic neuron j are simultaneously active, the synaptic weight w_ij increases: delta w_ij = eta * x_i * y_j."
    ],
    "example": "Designing an AND gate for two inputs x1, x2: Both inputs have weight +1. Firing threshold theta = 2. When (1, 1), sum = 2 >= 2 -> output 1. When (1, 0), sum = 1 < 2 -> output 0.",
    "keyPoints": [
      "McCulloch-Pitts (1943): Threshold logic model using binary inputs and fixed predetermined weights.",
      "An inhibitory input in an MP neuron completely prevents firing regardless of excitatory sum.",
      "Hebbian Learning: 'Neurons that fire together, wire together' (delta w = eta * x * y).",
      "MP neuron cannot learn weights automatically; Frank Rosenblatt's Perceptron later solved this."
    ],
    "examFocus": [
      "Design McCulloch-Pitts neuron architectures for 2-input AND, OR, and NOT logic gates with threshold values (7 marks).",
      "Explain Hebb's learning rule and its biological principle (5 marks)."
    ],
    "selfCheck": {
      "question": "In a 2-input McCulloch-Pitts neuron with excitatory weights w1 = 1 and w2 = 1, what threshold value theta is required to implement a logical AND gate?",
      "options": [
        "theta = 1",
        "theta = 2",
        "theta = 0",
        "theta = 3"
      ],
      "answer": "theta = 2",
      "correctIndex": 1,
      "explanation": "For an AND gate, the neuron must fire (output 1) only when both inputs x1 = 1 and x2 = 1. Since sum = 1 + 1 = 2, setting threshold theta = 2 ensures it fires only when both inputs are active."
    }
  }
};

// Ensure 100% of topics have their rich structured example from TOPIC_EXAMPLES
Object.keys(TOPIC_EXAMPLES).forEach((topicId) => {
  if (LEARNING_CONTENT[topicId]) {
    LEARNING_CONTENT[topicId].example = TOPIC_EXAMPLES[topicId];
  }
});

export { TOPIC_EXAMPLES };

