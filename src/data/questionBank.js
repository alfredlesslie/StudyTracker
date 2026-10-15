/**
 * StudySense AI - Seed Practice Question Bank
 * 
 * Reusable, expandable question database with multiple-choice and true/false types.
 * Aligned with the 64-topic prototype syllabus.
 * 
 * Data Model:
 * {
 *   id: string,
 *   topicId: string,
 *   subjectId: string,
 *   moduleId: string,
 *   question: string,
 *   type: "multiple_choice" | "true_false",
 *   marks: number,
 *   options: string[],
 *   correctAnswer: number, // 0-indexed option
 *   explanation: string,
 *   difficulty: "easy" | "medium" | "hard"
 * }
 */

import { TOPICS, SUBJECTS, MODULES } from "./syllabus.js";

export const QUESTION_BANK = [
  // =========================================================================
  // 1. COMPUTER NETWORKS (24CST501)
  // =========================================================================

  // --- OSI and TCP/IP Reference Models (cn-m1-t1) ---
  {
    id: "q-cn-osi-1",
    topicId: "cn-m1-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    question: "In the 7-layer OSI model, which layer is responsible for end-to-end process-to-process delivery, flow control, and port addressing?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Network Layer",
      "Data Link Layer",
      "Transport Layer",
      "Session Layer"
    ],
    correctAnswer: 2,
    explanation: "The Transport Layer (Layer 4) handles end-to-end communication between specific application processes using port numbers, while also ensuring reliability and flow control."
  },
  {
    id: "q-cn-osi-2",
    topicId: "cn-m1-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    question: "The TCP/IP model has 4 layers, consolidating the OSI Session, Presentation, and Application layers into a single Application layer.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. In the practical TCP/IP suite, the top three OSI layers are combined into a single unified Application layer (HTTP, DNS, SMTP, etc.)."
  },
  {
    id: "q-cn-osi-3",
    topicId: "cn-m1-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    question: "What is the proper Protocol Data Unit (PDU) name at the Data Link layer?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "easy",
    options: ["Packet", "Frame", "Segment", "Bit"],
    correctAnswer: 1,
    explanation: "At the Data Link layer, data is encapsulated into 'Frames'. At Network it is 'Packets', at Transport it is 'Segments', and at Physical it is 'Bits'."
  },
  {
    id: "q-cn-osi-4",
    topicId: "cn-m1-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    question: "During data encapsulation, protocol headers are stripped off as data travels downwards from the Application to Physical layer.",
    type: "true_false",
    marks: 1,
    difficulty: "medium",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "False. During encapsulation, headers are added as data travels downwards. Headers are stripped off during de-encapsulation when data travels upwards at the receiver."
  },
  {
    id: "q-cn-osi-5",
    topicId: "cn-m1-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    question: "Which layer of the OSI model handles data compression, ASCII-to-Unicode character translation, and encryption/decryption?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Session Layer",
      "Presentation Layer",
      "Application Layer",
      "Transport Layer"
    ],
    correctAnswer: 1,
    explanation: "The Presentation Layer (Layer 6) is responsible for syntax and semantics: translation, compression, and cryptography."
  },
  {
    id: "q-cn-osi-6",
    topicId: "cn-m1-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    question: "Which transmission medium provides the highest immunity to electromagnetic interference (EMI) and supports the highest transmission bandwidth?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Shielded Twisted Pair (STP)",
      "Coaxial Cable (RG-59)",
      "Fiber Optic Cable",
      "Unshielded Twisted Pair (UTP Cat 6)"
    ],
    correctAnswer: 2,
    explanation: "Fiber optic cables carry data as modulated light pulses through glass/silica cores, rendering them completely impervious to electromagnetic interference and enabling multi-gigabit throughput."
  },
  {
    id: "q-cn-osi-7",
    topicId: "cn-m1-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    question: "At the Data Link layer, a MAC address is a 48-bit globally unique hardware identifier typically represented as 12 hexadecimal digits.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. IEEE standard MAC addresses are 48 bits (6 octets) burned into the Network Interface Card (NIC), where the first 24 bits represent the Organizationally Unique Identifier (OUI)."
  },
  {
    id: "q-cn-osi-8",
    topicId: "cn-m1-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    question: "What is the primary difference between logical addressing (IP) and physical addressing (MAC)?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "IP addresses are permanent hardware IDs, whereas MAC addresses change with each router hop",
      "IP addresses provide hierarchical network routing across subnets, whereas MAC addresses identify devices on the local broadcast domain",
      "MAC addresses operate at Layer 3, whereas IP addresses operate at Layer 2",
      "IP addresses only exist in wireless WiFi networks"
    ],
    correctAnswer: 1,
    explanation: "Logical IP addresses (Layer 3) enable global routing across heterogeneous networks, while Physical MAC addresses (Layer 2) are used for hop-by-hop frame delivery across local Ethernet links."
  },
  {
    id: "q-cn-osi-9",
    topicId: "cn-m1-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    question: "In the TCP 3-way handshake used to establish a reliable transport connection, what is the exact packet sequence sent between Client and Server?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "ACK -> SYN -> SYN-ACK",
      "SYN -> SYN-ACK -> ACK",
      "FIN -> ACK -> FIN-ACK",
      "PING -> PONG -> ACK"
    ],
    correctAnswer: 1,
    explanation: "TCP connection establishment begins with the Client sending SYN, the Server responding with SYN-ACK, and the Client acknowledging with ACK before data transfer starts."
  },
  {
    id: "q-cn-osi-10",
    topicId: "cn-m1-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    question: "UDP provides connection-oriented service with guaranteed in-order delivery and automatic packet retransmission.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "False. UDP (User Datagram Protocol) is connectionless and best-effort with no handshake, no retransmission, and no ordering guarantees, which minimizes latency for streaming and DNS."
  },
  {
    id: "q-cn-osi-11",
    topicId: "cn-m1-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    question: "Which of the following pairings correctly matches an Application Layer protocol with its default standard transport port?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "HTTP : Port 21 (TCP)",
      "DNS : Port 53 (UDP/TCP)",
      "HTTPS : Port 25 (TCP)",
      "SSH : Port 80 (TCP)"
    ],
    correctAnswer: 1,
    explanation: "Domain Name System (DNS) operates on well-known Port 53. Standard ports for others: HTTP is 80, HTTPS is 443, SSH is 22, and FTP is 20/21."
  },
  {
    id: "q-cn-osi-12",
    topicId: "cn-m1-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    question: "In computer networks, Flow Control prevents a fast sender from overwhelming a slow receiver, while Congestion Control prevents senders from overloading intermediate network links and routers.",
    type: "true_false",
    marks: 1,
    difficulty: "medium",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. Flow Control is an end-to-end mechanism between two peers (using sliding window / advertised window), whereas Congestion Control manages aggregate traffic load across network intermediate nodes."
  },
  {
    id: "q-cn-osi-13",
    topicId: "cn-m1-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    question: "In the OSI model, which network device functions primarily at Layer 2 to inspect MAC addresses and segment collision domains?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Repeater / Hub",
      "Network Switch",
      "Network Layer Router",
      "Passive Patch Panel"
    ],
    correctAnswer: 1,
    explanation: "Ethernet Switches operate at Layer 2 (Data Link), reading frame MAC headers and using MAC address learning tables to deliver frames only to destination ports, separating collision domains."
  },
  {
    id: "q-cn-osi-14",
    topicId: "cn-m1-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    question: "IPv4 addresses are 32 bits long providing roughly 4.3 billion unique addresses, whereas IPv6 addresses are 128 bits long.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. IPv4 uses 32-bit addresses (dotted decimal format). IPv6 was designed with 128-bit addresses (hexadecimal format) to eliminate address exhaustion permanently."
  },
  {
    id: "q-cn-osi-15",
    topicId: "cn-m1-t1",
    subjectId: "cs-cn",
    moduleId: "cn-m1",
    question: "What mechanism is utilized by the TCP protocol to adapt transmission rates dynamically when packet loss occurs in transit?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "hard",
    options: [
      "Additive Increase Multiplicative Decrease (AIMD)",
      "Round-robin token bucket without window shrinkage",
      "Exponential growth ignoring timeouts",
      "Packet replication across all router interfaces"
    ],
    correctAnswer: 0,
    explanation: "TCP Congestion Control employs AIMD: linearly increasing the congestion window (CWND) by 1 MSS each RTT when ACKs arrive, and halving CWND upon packet loss."
  },

  // --- Routing Algorithms (cn-m2-t2) ---
  {
    id: "q-cn-rt-1",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "Which routing algorithm is based on the Bellman-Ford equation and shares distance vectors only with directly connected neighbors?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Link State Routing",
      "Distance Vector Routing",
      "Path Vector Routing",
      "Flooding"
    ],
    correctAnswer: 1,
    explanation: "Distance Vector Routing uses the Bellman-Ford algorithm where each node shares its routing vector only with direct physical neighbors."
  },
  {
    id: "q-cn-rt-2",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "Dijkstra's Shortest Path algorithm requires that all link weights in the network graph be non-negative.",
    type: "true_false",
    marks: 1,
    difficulty: "medium",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. Dijkstra's greedy choice assumes that adding an edge never decreases total path cost. Negative edge weights can cause incorrect results."
  },
  {
    id: "q-cn-rt-3",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "What classic problem occurs in Distance Vector routing when a link fails and routers exchange outdated metrics in a loop?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "hard",
    options: [
      "Split Horizon deadlock",
      "Count-to-Infinity problem",
      "Dijkstra cycle error",
      "BGP collision"
    ],
    correctAnswer: 1,
    explanation: "When a link goes down, neighbors increment costs back and forth toward infinity (typically 16 in RIP), known as the Count-to-Infinity problem."
  },
  {
    id: "q-cn-rt-4",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "Split Horizon prevents routing loops by forbidding a router from advertising a route back out the interface through which it originally learned that route.",
    type: "true_false",
    marks: 1,
    difficulty: "medium",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. Split Horizon prevents two adjacent nodes from bouncing packets back and forth by suppressing advertisements back to the source."
  },
  {
    id: "q-cn-rt-5",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "In Link State routing, what technique is used to distribute link status information to all routers across the entire autonomous system?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Unicast tunneling",
      "Reliable Flooding of Link State Advertisements (LSAs)",
      "Periodic neighbor polling",
      "Random walk routing"
    ],
    correctAnswer: 1,
    explanation: "Link State protocols (like OSPF) flood LSAs to every router in the network so every node constructs the exact same topology map."
  },
  {
    id: "q-cn-rt-6",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "Which of the following routing protocols is an interior gateway protocol (IGP) based on Dijkstra's Shortest Path First algorithm?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "BGP (Border Gateway Protocol)",
      "OSPF (Open Shortest Path First)",
      "RIP v1 (Routing Information Protocol)",
      "ARP (Address Resolution Protocol)"
    ],
    correctAnswer: 1,
    explanation: "OSPF is an open standard Link State IGP that runs Dijkstra's algorithm inside an Autonomous System to compute optimal path trees."
  },
  {
    id: "q-cn-rt-7",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "In the Routing Information Protocol (RIP), a hop count of 16 is defined as representing network infinity or unreachable destination.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. RIP sets maximum allowable metric at 15 hops; 16 denotes unreachable destination, which helps bound the Count-to-Infinity problem."
  },
  {
    id: "q-cn-rt-8",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "What is the primary role of the Border Gateway Protocol (BGP) in the global internet architecture?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "hard",
    options: [
      "Assigning DHCP addresses to home clients",
      "Inter-domain Path-Vector routing between distinct Autonomous Systems (AS)",
      "Resolving domain names into IPv4 addresses",
      "Controlling CSMA/CD Ethernet collision backoff"
    ],
    correctAnswer: 1,
    explanation: "BGP is the de-facto exterior gateway protocol (EGP) powering the internet core, routing traffic between Autonomous Systems using policy-based Path Vector announcements."
  },
  {
    id: "q-cn-rt-9",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "Poison Reverse prevents two-node routing loops by advertising a failed route back to the source node with a metric value of infinity (16).",
    type: "true_false",
    marks: 1,
    difficulty: "medium",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. Poison Reverse enhances Split Horizon by explicitly advertising metric 16 back to the neighbor, immediately breaking potential two-node loops."
  },
  {
    id: "q-cn-rt-10",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "In hierarchical routing, dividing a large network into administrative areas primarily achieves which critical advantage?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Eliminating the need for IP subnetting",
      "Substantially reducing routing table size and memory overhead on internal routers",
      "Increasing packet hop count indefinitely",
      "Allowing routers to operate without power supplies"
    ],
    correctAnswer: 1,
    explanation: "Hierarchical routing groups routers into regions or OSPF areas so routers only maintain detailed routes for their local area and summary routes for external areas."
  },
  {
    id: "q-cn-rt-11",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "Forwarding and Routing are identical operations executed on the same hardware plane of a network router.",
    type: "true_false",
    marks: 1,
    difficulty: "medium",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "False. Routing operates on the Control Plane (computing global paths and populating routing tables), whereas Forwarding operates on the Data Plane (fast packet switching between input and output ports)."
  },
  {
    id: "q-cn-rt-12",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "Which data structure is constructed by each router executing Dijkstra's Link-State algorithm before populating its forwarding table?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Shortest Path Tree (SPT) with the router as root",
      "Doubly linked list of all internet IP addresses",
      "Hash map of client browser cookies",
      "Circular queue of MAC frame fragments"
    ],
    correctAnswer: 0,
    explanation: "Dijkstra's algorithm builds a Shortest Path Tree (SPT) rooted at the calculating router, identifying the minimum-cost next hop to every network prefix."
  },
  {
    id: "q-cn-rt-13",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "Software-Defined Networking (SDN) physically couples the control plane and data plane inside each individual proprietary router box.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "False. The fundamental premise of SDN is separating the centralized control plane (SDN controller) from the distributed data plane (programmable OpenFlow switches)."
  },
  {
    id: "q-cn-rt-14",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "What is the computational time complexity of Dijkstra's algorithm for a network graph with V vertices and E edges when implemented using a binary min-heap?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "hard",
    options: [
      "O(V²)",
      "O((V + E) log V)",
      "O(V!)",
      "O(1)"
    ],
    correctAnswer: 1,
    explanation: "With a binary min-heap / priority queue, extract-min takes O(log V) and edge relaxations take O(E log V), yielding total complexity O((V + E) log V)."
  },
  {
    id: "q-cn-rt-15",
    topicId: "cn-m2-t2",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "Distance Vector algorithms require periodic exchange of complete routing tables between neighbors, whereas Link State algorithms flood updates primarily when link states change.",
    type: "true_false",
    marks: 1,
    difficulty: "medium",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. RIP periodically broadcasts its entire table every 30 seconds, while OSPF uses triggered LSAs when link state or metric updates occur."
  },

  // --- Subnetting and Supernetting (cn-m2-t4) ---
  {
    id: "q-cn-sub-1",
    topicId: "cn-m2-t4",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "How many usable host IP addresses are available in a subnet with a CIDR prefix of /28?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "hard",
    options: ["14", "16", "30", "6"],
    correctAnswer: 0,
    explanation: "Host bits = 32 - 28 = 4. Total addresses = 2⁴ = 16. Usable hosts = 2⁴ - 2 = 14 (subtracting network and broadcast IDs)."
  },
  {
    id: "q-cn-sub-2",
    topicId: "cn-m2-t4",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "The primary purpose of Supernetting (CIDR aggregation) is to reduce the size of global internet routing tables.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. Supernetting combines multiple contiguous Class C addresses into a single routing table entry, preventing routing table explosion."
  },
  {
    id: "q-cn-sub-3",
    topicId: "cn-m2-t4",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "Given the IP address 192.168.1.130 with subnet mask 255.255.255.192 (/26), what is the Network ID of this subnet?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "hard",
    options: [
      "192.168.1.0",
      "192.168.1.64",
      "192.168.1.128",
      "192.168.1.192"
    ],
    correctAnswer: 2,
    explanation: "Block size is 256 - 192 = 64. Subnets are .0, .64, .128, .192. The address 130 falls in the block starting at 192.168.1.128."
  },
  {
    id: "q-cn-sub-4",
    topicId: "cn-m2-t4",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "A broadcast IP address in an IPv4 subnet has all of its host bits set to binary 0.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "False. In an IPv4 subnet, all host bits set to 0 represents the Network ID, whereas all host bits set to 1 represents the Broadcast address."
  },
  {
    id: "q-cn-sub-5",
    topicId: "cn-m2-t4",
    subjectId: "cs-cn",
    moduleId: "cn-m2",
    question: "What is the dotted decimal representation of a /27 subnet mask?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "255.255.255.192",
      "255.255.255.224",
      "255.255.255.240",
      "255.255.255.248"
    ],
    correctAnswer: 1,
    explanation: "A /27 mask has 27 ones. In the 4th octet, 3 ones: 128 + 64 + 32 = 224. Hence: 255.255.255.224."
  },

  // =========================================================================
  // 2. SOFTWARE ENGINEERING (24CST502)
  // =========================================================================

  // --- SDLC Models (se-m1-t2) ---
  {
    id: "q-se-sdlc-1",
    topicId: "se-m1-t2",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "What is the core defining characteristic of Barry Boehm's Spiral Model compared to other SDLC models?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Strict absence of documentation",
      "Explicit, formal risk analysis at each cycle",
      "Pair programming requirement",
      "Linear sequential progress without prototyping"
    ],
    correctAnswer: 1,
    explanation: "The Spiral Model is an explicitly risk-driven meta-model. Every spiral iteration begins with objectives and conducts rigorous risk analysis before building prototypes."
  },
  {
    id: "q-se-sdlc-2",
    topicId: "se-m1-t2",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "In the V-Model of software development, testing activities are planned in parallel with their corresponding development phases.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. The V-Model pairs verification (development) with validation (testing): Acceptance testing corresponds to Requirements, Unit testing corresponds to Coding."
  },
  {
    id: "q-se-sdlc-3",
    topicId: "se-m1-t2",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "Which SDLC model is most suitable for safety-critical systems with completely fixed, well-understood upfront requirements?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Classical Waterfall / V-Model",
      "Extreme Programming (XP)",
      "Scrum with 1-week sprints",
      "Ad-hoc prototyping"
    ],
    correctAnswer: 0,
    explanation: "When requirements are strictly stable, regulated, and critical (e.g. medical or avionics), Waterfall or the V-Model provides the required verification and documentation discipline."
  },
  {
    id: "q-se-sdlc-4",
    topicId: "se-m1-t2",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "The Waterfall model welcomes late changes in requirements during the implementation and testing phases with zero cost penalty.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "False. Waterfall is strictly linear and sequential. Accommodating requirement changes late in development requires expensive rework or starting over."
  },
  {
    id: "q-se-sdlc-5",
    topicId: "se-m1-t2",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "In standard software engineering, which life cycle phase accounts for the majority (60% to 70%) of total lifetime software cost?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Requirements Analysis",
      "Initial Coding",
      "Maintenance",
      "Unit Testing"
    ],
    correctAnswer: 2,
    explanation: "Maintenance (corrective, adaptive, perfective, and preventive) historically dominates the total lifetime cost of production enterprise software."
  },
  {
    id: "q-se-sdlc-6",
    topicId: "se-m1-t2",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "Which of the following is considered the primary risk associated with the Classical Waterfall Model?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Inability to write unit tests",
      "Delayed discovery of major design or requirement flaws until the final integration phase",
      "Too many releases delivered to the customer too quickly",
      "Absence of written documentation"
    ],
    correctAnswer: 1,
    explanation: "Because integration and system testing occur only at the end of Waterfall, catastrophic architectural flaws or misunderstood requirements are discovered late, causing massive cost overruns."
  },
  {
    id: "q-se-sdlc-7",
    topicId: "se-m1-t2",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "Prototyping in software development is primarily utilized to clarify ambiguous user requirements before full-scale architecture and coding begin.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. Prototyping allows end-users to interact with an early mockup, revealing true expectations and validating ambiguous requirements early."
  },
  {
    id: "q-se-sdlc-8",
    topicId: "se-m1-t2",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "In Boehm's Spiral Model, what occurs in the 'Review and Plan' sector at the completion of each spiral iteration?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Immediate product decommissioning",
      "Evaluation of the current prototype and collaborative planning for the next spiral phase",
      "Writing assembly code for the bootloader",
      "Ignoring stakeholder feedback to save time"
    ],
    correctAnswer: 1,
    explanation: "Each spiral quadrant concludes with a milestone review with stakeholders, evaluating progress and committing resources for the subsequent iteration."
  },
  {
    id: "q-se-sdlc-9",
    topicId: "se-m1-t2",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "Incremental development models deliver software in small, usable increments rather than a single 'big bang' release.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. Incremental delivery breaks the product down into functional subsets, allowing early deployment of core value and earlier user feedback."
  },
  {
    id: "q-se-sdlc-10",
    topicId: "se-m1-t2",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "Which SDLC model is specifically characterized by formal mathematical specification, proofs of correctness, and cleanroom verification?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "hard",
    options: [
      "Rapid Application Development (RAD)",
      "Formal Methods / Cleanroom Model",
      "Scrum with 2-week iterations",
      "Ad-hoc code and fix"
    ],
    correctAnswer: 1,
    explanation: "The Formal Methods and Cleanroom approaches use mathematical state-transition specifications and formal proofs to verify correctness before defect insertion."
  },
  {
    id: "q-se-sdlc-11",
    topicId: "se-m1-t2",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "In the Evolutionary Prototyping model, the prototype is discarded completely once requirements are documented.",
    type: "true_false",
    marks: 1,
    difficulty: "medium",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "False. In Evolutionary Prototyping, the prototype is continuously refined into the final production system. In Throwaway Prototyping, it is discarded."
  },
  {
    id: "q-se-sdlc-12",
    topicId: "se-m1-t2",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "What metric is most frequently used to estimate software development effort and schedule in Boehm's COCOMO model?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Number of developer coffee breaks",
      "Source Lines of Code (KLOC) and Cost Drivers",
      "Git commit count per hour",
      "Network bandwidth speed"
    ],
    correctAnswer: 1,
    explanation: "COCOMO (Constructive Cost Model) calculates person-months of effort primarily based on estimated Thousand Lines of Code (KLOC) combined with environmental cost drivers."
  },
  {
    id: "q-se-sdlc-13",
    topicId: "se-m1-t2",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "Software Crisis refers to historical problems in software engineering where projects routinely exceeded budgets, slipped schedules, and delivered low-quality code.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. Coined at the 1968 NATO conference, 'Software Crisis' led to the establishment of software engineering as a disciplined field to address unmanageable project failure rates."
  },
  {
    id: "q-se-sdlc-14",
    topicId: "se-m1-t2",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "Which phase of the standard SDLC focuses on creating architectural components, interface contracts, and database entity schemas?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "System and Software Design",
      "Acceptance Testing",
      "Decommissioning",
      "Marketing"
    ],
    correctAnswer: 0,
    explanation: "The Design phase transforms requirements into architectural specifications, module decomposition, data schemas, and interface definitions."
  },
  {
    id: "q-se-sdlc-15",
    topicId: "se-m1-t2",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "In modern software development, agile methodologies eliminate all forms of documentation, planning, and architectural governance.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "False. The Agile Manifesto values working software *over comprehensive documentation*, but does not eliminate necessary architecture, user stories, or regulatory documentation."
  },

  // --- Agile and Agile Manifesto (se-m1-t3) ---
  {
    id: "q-se-agile-1",
    topicId: "se-m1-t3",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "Which of the following is one of the four core values of the Agile Manifesto?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "easy",
    options: [
      "Comprehensive documentation over working software",
      "Following a rigid plan over responding to change",
      "Working software over comprehensive documentation",
      "Contract negotiation over customer collaboration"
    ],
    correctAnswer: 2,
    explanation: "The Agile Manifesto explicitly states: 'Working software over comprehensive documentation'."
  },
  {
    id: "q-se-agile-2",
    topicId: "se-m1-t3",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "Agile methodologies completely eliminate the need for any documentation or architectural design.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "False. Agile values working software MORE than comprehensive documentation, but it does not advocate zero documentation. Documentation should be lean and useful."
  },
  {
    id: "q-se-agile-3",
    topicId: "se-m1-t3",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "What is the standard template format for writing an Agile User Story?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "easy",
    options: [
      "Given [Context], When [Action], Then [Result]",
      "As a [Role], I want [Feature], So that [Benefit]",
      "If [Condition], Then [Trigger], Else [Fallback]",
      "System shall [Function] with [Constraint]"
    ],
    correctAnswer: 1,
    explanation: "User stories follow the format: 'As a [user type], I want [an action/goal], so that [a business value/benefit is achieved]'."
  },
  {
    id: "q-se-agile-4",
    topicId: "se-m1-t3",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "Agile teams work in fixed timeboxes called Sprints or Iterations to deliver potentially shippable software increments.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. Sprints are typically 1 to 4 weeks in duration, resulting in a functioning increment reviewed with stakeholders."
  },
  {
    id: "q-se-agile-5",
    topicId: "se-m1-t3",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "In Agile development, who has the final authority to prioritize items in the Product Backlog?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "The Scrum Master",
      "The Lead Developer",
      "The Product Owner",
      "The Project Sponsor"
    ],
    correctAnswer: 2,
    explanation: "The Product Owner is solely responsible for managing and prioritizing the Product Backlog based on stakeholder value."
  },

  // --- Scrum and DevOps (se-m1-t4) ---
  {
    id: "q-se-scrum-1",
    topicId: "se-m1-t4",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "What is the primary role of the Scrum Master in an Agile Scrum team?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Assigning daily coding tasks to programmers",
      "Acting as a servant-leader who removes blockers and facilitates Scrum practices",
      "Writing formal test cases for QA",
      "Managing project budget and client billing"
    ],
    correctAnswer: 1,
    explanation: "The Scrum Master is a servant-leader and coach who helps remove organizational blockers, facilitating smooth team delivery without traditional top-down authority."
  },
  {
    id: "q-se-scrum-2",
    topicId: "se-m1-t4",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "Continuous Integration (CI) in DevOps requires developers to merge code changes into a shared central branch frequently, triggering automated tests.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. CI automates building and testing whenever code is committed, catching regression bugs early before integration conflicts mount."
  },
  {
    id: "q-se-scrum-3",
    topicId: "se-m1-t4",
    subjectId: "cs-se",
    moduleId: "se-m1",
    question: "What is the standard maximum recommended time limit for the Daily Scrum stand-up meeting?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "easy",
    options: ["15 Minutes", "45 Minutes", "1 Hour", "30 Minutes"],
    correctAnswer: 0,
    explanation: "The Daily Scrum is timeboxed strictly to 15 minutes to inspect progress toward the Sprint Goal and identify immediate blockers."
  },

  // =========================================================================
  // 3. ADVANCED MATHEMATICS FOR DATA SCIENCE (24CST503)
  // =========================================================================

  // --- Eigenvalues and Eigenvectors (math-m1-t4) ---
  {
    id: "q-math-eigen-1",
    topicId: "math-m1-t4",
    subjectId: "cs-math",
    moduleId: "math-m1",
    question: "If a non-zero vector v satisfies the equation Av = λv for a square matrix A, what do λ and v represent?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "easy",
    options: [
      "λ is the determinant and v is the trace",
      "λ is the eigenvalue and v is the eigenvector",
      "λ is the singular value and v is the inverse",
      "λ is the gradient and v is the Hessian"
    ],
    correctAnswer: 1,
    explanation: "By definition, v is an eigenvector and scalar λ is the associated eigenvalue: multiplying by matrix A scales v without changing its spatial direction."
  },
  {
    id: "q-math-eigen-2",
    topicId: "math-m1-t4",
    subjectId: "cs-math",
    moduleId: "math-m1",
    question: "The sum of all eigenvalues of a square matrix equals the trace (sum of main diagonal elements) of the matrix.",
    type: "true_false",
    marks: 1,
    difficulty: "medium",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. For any square matrix, the sum of its eigenvalues equals trace(A), and the product of its eigenvalues equals det(A)."
  },
  {
    id: "q-math-eigen-3",
    topicId: "math-m1-t4",
    subjectId: "cs-math",
    moduleId: "math-m1",
    question: "How does Principal Component Analysis (PCA) utilize eigenvalues when reducing feature dimensionality?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "hard",
    options: [
      "Eigenvectors with the smallest eigenvalues are prioritized",
      "Eigenvectors of the covariance matrix with the largest eigenvalues capture maximum variance and are retained",
      "Eigenvalues are multiplied to compute loss gradients",
      "PCA discards all eigenvectors with non-zero eigenvalues"
    ],
    correctAnswer: 1,
    explanation: "In PCA, the eigenvalues represent the variance explained along each principal axis. Keeping the top eigenvectors captures the maximum variance in lower dimensions."
  },
  {
    id: "q-math-eigen-4",
    topicId: "math-m1-t4",
    subjectId: "cs-math",
    moduleId: "math-m1",
    question: "The zero vector [0, 0, ... 0]ᵀ is considered a valid eigenvector of every square matrix.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "False. By mathematical definition, eigenvectors MUST be non-zero vectors (v ≠ 0), even though A(0) = λ(0) holds trivially."
  },
  {
    id: "q-math-eigen-5",
    topicId: "math-m1-t4",
    subjectId: "cs-math",
    moduleId: "math-m1",
    question: "What is the characteristic equation used to compute the eigenvalues of a square matrix A?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "det(A - λI) = 0",
      "trace(A) · λ = 1",
      "Aᵀ · A = λI",
      "det(A) + λ = 0"
    ],
    correctAnswer: 0,
    explanation: "Non-trivial solutions to (A - λI)v = 0 exist if and only if the matrix (A - λI) is singular, meaning its determinant det(A - λI) equals 0."
  },

  // --- Bayes' Theorem (math-m2-t1) ---
  {
    id: "q-math-bayes-1",
    topicId: "math-m2-t1",
    subjectId: "cs-math",
    moduleId: "math-m2",
    question: "In Bayes' formula P(A|B) = [P(B|A) · P(A)] / P(B), what is P(A) called?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "easy",
    options: ["Likelihood", "Posterior probability", "Prior probability", "Evidence"],
    correctAnswer: 2,
    explanation: "P(A) is the 'Prior probability' — our initial belief about hypothesis A before observing the new evidence B."
  },
  {
    id: "q-math-bayes-2",
    topicId: "math-m2-t1",
    subjectId: "cs-math",
    moduleId: "math-m2",
    question: "If two events A and B are statistically independent, then conditional probability P(A|B) is equal to P(A).",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. Independence means knowing that event B occurred provides zero new information about whether event A occurs, so P(A|B) = P(A)."
  },
  {
    id: "q-math-bayes-3",
    topicId: "math-m2-t1",
    subjectId: "cs-math",
    moduleId: "math-m2",
    question: "Why does the Naïve Bayes classifier carry the word 'Naïve' in its name?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Because it does not calculate probabilities",
      "Because it naively assumes all input features are conditionally independent given the class label",
      "Because it only works on binary classification",
      "Because it uses zero training data"
    ],
    correctAnswer: 1,
    explanation: "It is called 'naïve' because real-world features are almost always correlated, but the model assumes strict conditional independence to simplify math."
  },
  {
    id: "q-math-bayes-4",
    topicId: "math-m2-t1",
    subjectId: "cs-math",
    moduleId: "math-m2",
    question: "The denominator P(B) in Bayes' formula is called the normalizing constant because it ensures that the sum of all posterior probabilities equals 1.",
    type: "true_false",
    marks: 1,
    difficulty: "medium",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. P(B) sums the joint probability over all possible mutually exclusive hypotheses, ensuring the posterior is a valid probability distribution."
  },

  // --- Gradient Descent (math-m3-t3) ---
  {
    id: "q-math-gd-1",
    topicId: "math-m3-t3",
    subjectId: "cs-math",
    moduleId: "math-m3",
    question: "In the Gradient Descent parameter update rule w := w - α · ∇J(w), why is the gradient multiplied by a negative sign?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Because computer memory requires negative indices",
      "Because the gradient points in the direction of steepest ascent, so moving negative steps goes downhill towards the minimum",
      "To prevent division by zero",
      "Because probabilities are always negative"
    ],
    correctAnswer: 1,
    explanation: "The gradient ∇J points toward steepest increase. To minimize cost (error), we must move in the opposite (negative) direction."
  },
  {
    id: "q-math-gd-2",
    topicId: "math-m3-t3",
    subjectId: "cs-math",
    moduleId: "math-m3",
    question: "If the learning rate α is set excessively large in Gradient Descent, the algorithm may overshoot the minimum and diverge.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. An oversized learning rate takes gigantic steps across valleys, causing loss to oscillate with growing magnitude and blow up to infinity."
  },
  {
    id: "q-math-gd-3",
    topicId: "math-m3-t3",
    subjectId: "cs-math",
    moduleId: "math-m3",
    question: "How does Newton's Optimization Method differ from first-order Gradient Descent?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "hard",
    options: [
      "Newton's method does not compute derivatives",
      "Newton's method uses second-order curvature (the Hessian matrix) to take smarter quadratic steps",
      "Newton's method only works on linear models",
      "Newton's method requires no matrix operations"
    ],
    correctAnswer: 1,
    explanation: "Gradient descent uses only 1st derivatives (slope). Newton's method uses the 2nd derivative matrix (Hessian) to account for surface curvature."
  },

  // =========================================================================
  // 4. MACHINE LEARNING (24CSR504)
  // =========================================================================

  // --- Learning Paradigms (ml-m1-t1) ---
  {
    id: "q-ml-par-1",
    topicId: "ml-m1-t1",
    subjectId: "cs-ml",
    moduleId: "ml-m1",
    question: "What differentiates Supervised Learning from Unsupervised Learning?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "easy",
    options: [
      "Supervised learning requires GPU acceleration",
      "Supervised learning trains on labeled input-output pairs (X, y); Unsupervised learning discovers patterns in unlabeled data (X only)",
      "Unsupervised learning always achieves 100% accuracy",
      "Supervised learning does not use loss functions"
    ],
    correctAnswer: 1,
    explanation: "Supervised learning relies on ground-truth target labels (y) provided by a teacher, whereas unsupervised learning seeks latent structures without labels."
  },
  {
    id: "q-ml-par-2",
    topicId: "ml-m1-t1",
    subjectId: "cs-ml",
    moduleId: "ml-m1",
    question: "Predicting continuous values like real estate house prices or tomorrow's temperature is called a Classification task.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "False. Predicting continuous real-valued numbers is a Regression task. Classification predicts discrete categorical class labels."
  },
  {
    id: "q-ml-par-3",
    topicId: "ml-m1-t1",
    subjectId: "cs-ml",
    moduleId: "ml-m1",
    question: "Which learning paradigm relies on an agent interacting with an environment through trial-and-error to maximize cumulative numerical rewards?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Semi-Supervised Learning",
      "Reinforcement Learning",
      "Unsupervised Clustering",
      "Active Learning"
    ],
    correctAnswer: 1,
    explanation: "In Reinforcement Learning, an agent takes sequential actions, transitions between states, and optimizes its policy via environmental reward signals."
  },

  // --- Logistic Regression (ml-m2-t3) ---
  {
    id: "q-ml-log-1",
    topicId: "ml-m2-t3",
    subjectId: "cs-ml",
    moduleId: "ml-m2",
    question: "Despite containing 'Regression' in its name, what primary task is Logistic Regression used for?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "easy",
    options: [
      "Continuous numerical prediction",
      "Categorical binary / multi-class classification",
      "Unsupervised dimensionality reduction",
      "Sorting database keys"
    ],
    correctAnswer: 1,
    explanation: "Logistic Regression is a foundational classification algorithm. It outputs calibrated probabilities for discrete class outcomes."
  },
  {
    id: "q-ml-log-2",
    topicId: "ml-m2-t3",
    subjectId: "cs-ml",
    moduleId: "ml-m2",
    question: "The Sigmoid activation function maps any real number in (-∞, +∞) strictly into the probability range (0, 1).",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. The formula σ(z) = 1 / (1 + e⁻ᶻ) squashes any input smoothly into the open interval (0, 1)."
  },
  {
    id: "q-ml-log-3",
    topicId: "ml-m2-t3",
    subjectId: "cs-ml",
    moduleId: "ml-m2",
    question: "Why is Binary Cross-Entropy (Log Loss) used instead of Mean Squared Error (MSE) to train Logistic Regression?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "hard",
    options: [
      "Because MSE is computationally too fast",
      "Because MSE combined with the non-linear Sigmoid yields a non-convex loss surface with local minima, while Cross-Entropy is convex",
      "Because Cross-Entropy requires zero gradient calculations",
      "Because MSE cannot take floating-point inputs"
    ],
    correctAnswer: 1,
    explanation: "MSE creates non-convex plateaus with sigmoid activations. Cross-Entropy loss guarantees a convex cost function with a single global minimum."
  },
  {
    id: "q-ml-log-4",
    topicId: "ml-m2-t3",
    subjectId: "cs-ml",
    moduleId: "ml-m2",
    question: "In standard Logistic Regression, what is the value of the linear combination z = wᵀx + b along the decision boundary?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: ["z = 1.0", "z = 0.5", "z = 0", "z = -1.0"],
    correctAnswer: 2,
    explanation: "The decision threshold is probability 0.5. Since σ(0) = 0.5, the decision boundary occurs precisely where z = wᵀx + b = 0."
  },

  // --- k-Means Clustering (ml-m3-t2) ---
  {
    id: "q-ml-kmeans-1",
    topicId: "ml-m3-t2",
    subjectId: "cs-ml",
    moduleId: "ml-m3",
    question: "What objective loss function does the k-Means clustering algorithm seek to minimize?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Hinge Loss",
      "Within-Cluster Sum of Squares (WCSS / Inertia)",
      "Cross-Entropy Loss",
      "Mean Absolute Error"
    ],
    correctAnswer: 1,
    explanation: "k-Means iteratively minimizes WCSS: the sum of squared Euclidean distances between every sample and its assigned cluster centroid."
  },
  {
    id: "q-ml-kmeans-2",
    topicId: "ml-m3-t2",
    subjectId: "cs-ml",
    moduleId: "ml-m3",
    question: "The Elbow Method helps data scientists determine an appropriate number of clusters k by plotting WCSS against values of k.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. The elbow point on the curve represents the point of diminishing returns where adding more clusters yields marginal reduction in WCSS."
  },
  {
    id: "q-ml-kmeans-3",
    topicId: "ml-m3-t2",
    subjectId: "cs-ml",
    moduleId: "ml-m3",
    question: "Which of the following is a recognized limitation of standard k-Means clustering?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "Inability to run on numeric datasets",
      "High sensitivity to initial centroid placement and extreme outliers",
      "Requires ground truth labels for convergence",
      "Cannot cluster more than two dimensions"
    ],
    correctAnswer: 1,
    explanation: "k-Means is sensitive to random initialization (mitigated by k-Means++) and outliers pull cluster centroids away from true dense groupings."
  },

  // --- Perceptron and Backpropagation (ml-m4-t4) ---
  {
    id: "q-ml-nn-1",
    topicId: "ml-m4-t4",
    subjectId: "cs-ml",
    moduleId: "ml-m4",
    question: "Why was Minsky and Papert's proof regarding the single-layer Perceptron in 1969 so historically significant?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "medium",
    options: [
      "It proved perceptrons could not perform addition",
      "It proved a single-layer perceptron cannot solve linearly inseparable problems like XOR",
      "It showed computers could not store floating-point numbers",
      "It proved backpropagation was mathematically impossible"
    ],
    correctAnswer: 1,
    explanation: "Minsky and Papert showed that a single perceptron cannot learn non-linear decision boundaries like the XOR truth table, triggering the first AI Winter."
  },
  {
    id: "q-ml-nn-2",
    topicId: "ml-m4-t4",
    subjectId: "cs-ml",
    moduleId: "ml-m4",
    question: "Backpropagation calculates loss gradients using the multivariate chain rule of differential calculus.",
    type: "true_false",
    marks: 1,
    difficulty: "easy",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "True. Backpropagation applies the calculus chain rule recursively backwards from output layers to input layers to compute error derivatives."
  },
  {
    id: "q-ml-nn-3",
    topicId: "ml-m4-t4",
    subjectId: "cs-ml",
    moduleId: "ml-m4",
    question: "What is the primary function of non-linear activation functions (e.g. ReLU, Sigmoid) in deep neural networks?",
    type: "multiple_choice",
    marks: 1,
    difficulty: "hard",
    options: [
      "To speed up integer multiplication",
      "To enable networks to learn non-linear patterns (otherwise multiple stacked layers collapse mathematically into a single linear matrix)",
      "To prevent weights from ever changing during training",
      "To normalize dataset inputs automatically"
    ],
    correctAnswer: 1,
    explanation: "Without non-linear activations, stacking multiple linear layers is mathematically equivalent to a single linear layer (W₂ · W₁ · x = W_combined · x)."
  }
];

/**
 * Get count of available authentic questions for a specific topic, module, or subject
 * @param {Object} scope - { topicId, moduleId, subjectId }
 * @returns {number}
 */
export function getAvailableQuestionCount({ topicId, moduleId, subjectId } = {}) {
  if (topicId) {
    return QUESTION_BANK.filter((q) => q.topicId === topicId).length;
  }
  if (moduleId) {
    return QUESTION_BANK.filter((q) => q.moduleId === moduleId).length;
  }
  if (subjectId) {
    return QUESTION_BANK.filter((q) => q.subjectId === subjectId).length;
  }
  return QUESTION_BANK.length;
}

/**
 * Retrieve authentic questions for a topic or scope.
 * - Respects the selected question count (5, 10, 15).
 * - Avoids repeating questions across consecutive attempts when fresh questions are available.
 * - Strictly NEVER fabricates fake questions.
 * - Clearly signals when the available authentic pool is smaller than requested.
 * 
 * @param {string|Object} target - topicId string or scope object { topicId, moduleId, subjectId }
 * @param {number} requestedCount - 5, 10, or 15
 * @param {Object|string} [options={}] - Options object { excludeIds: string[], format?: string } or legacy format string
 * @returns {Array} array of authentic question objects with metadata: { availableTotal, isInsufficient, hasRepeats, requestedCount }
 */
export function getQuestionsForTopic(target, requestedCount = 5, options = {}) {
  let topicId = typeof target === "string" ? target : target?.topicId;
  let moduleId = typeof target === "object" ? target?.moduleId : null;
  let subjectId = typeof target === "object" ? target?.subjectId : null;

  const currentTopic = topicId ? TOPICS.find((t) => t.id === topicId) : null;
  if (currentTopic) {
    moduleId = currentTopic.moduleId;
    subjectId = currentTopic.subjectId;
  }

  // Handle options whether passed as object or legacy format string
  const excludeList = Array.isArray(options?.excludeIds)
    ? options.excludeIds
    : (Array.isArray(options?.excludeQuestionIds) ? options.excludeQuestionIds : []);
  const excludedSet = new Set(excludeList);

  // 1. Gather matching authentic questions from question bank
  let pool = [];
  if (topicId) {
    pool = QUESTION_BANK.filter((q) => q.topicId === topicId);
  } else if (moduleId) {
    pool = QUESTION_BANK.filter((q) => q.moduleId === moduleId);
  } else if (subjectId) {
    pool = QUESTION_BANK.filter((q) => q.subjectId === subjectId);
  } else {
    pool = [...QUESTION_BANK];
  }

  const availableTotal = pool.length;

  // 2. Separate fresh questions (not seen in recent attempts) from previously seen questions
  const freshQuestions = pool.filter((q) => !excludedSet.has(q.id));
  const seenQuestions = pool.filter((q) => excludedSet.has(q.id));

  let chosen = [];
  let hasRepeats = false;

  if (freshQuestions.length >= requestedCount) {
    // Plenty of fresh questions available
    chosen = freshQuestions.slice(0, requestedCount);
  } else {
    // Take all available fresh questions first
    chosen = [...freshQuestions];
    if (seenQuestions.length > 0) {
      const needed = requestedCount - chosen.length;
      chosen = chosen.concat(seenQuestions.slice(0, needed));
      hasRepeats = true;
    }
  }

  // Do NOT invent fake questions when pool is smaller than requested count
  const isInsufficient = availableTotal < requestedCount;
  const result = chosen.slice(0, requestedCount);

  // Attach metadata to the returned array
  result.availableTotal = availableTotal;
  result.isInsufficient = isInsufficient;
  result.hasRepeats = hasRepeats;
  result.requestedCount = requestedCount;
  result.topicId = topicId;
  result.moduleId = moduleId;
  result.subjectId = subjectId;

  return result;
}

/**
 * Retrieve questions for a generalized practice scope (subject, module, or topic)
 * with freshness guarantees and no fabricated questions.
 */
export function getQuestionsForPracticeScope(params = {}) {
  const { topicId, moduleId, subjectId, requestedCount = 5, excludeIds = [] } = params;
  return getQuestionsForTopic({ topicId, moduleId, subjectId }, requestedCount, { excludeIds });
}
