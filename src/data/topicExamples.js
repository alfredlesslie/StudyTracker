/**
 * StudySense AI - Structured Learning Examples for all 64 Prototype Topics.
 * Complete curriculum coverage across all 4 subjects & 16 modules.
 * Each topic provides:
 * - title: Specific worked scenario title
 * - scenario: Real-world engineering context or question
 * - steps: Step-by-step breakdown with stage labels and calculations
 * - expectedResult: Verified outcome / conclusion
 * - practicalApplication: Industrial & systems relevance
 * - keyInsight: High-yield pedagogical rule
 * - diagram / formula / code: (where relevant)
 */

export const TOPIC_EXAMPLES = {
  "cn-m1-t1": {
    "title": "Encapsulation Flow: Loading a Web Page (HTTP GET)",
    "scenario": "A user types 'https://example.com' into a web browser. Trace how data moves down the sender's protocol stack and gets encapsulated with layer-specific headers.",
    "diagram": "[Application: HTTP GET] -> [Transport: TCP + Port 443] -> [Network: IP + Dest IP] -> [Data Link: Ethernet + MAC] -> [Physical: Bits on Wire]",
    "steps": [
      {
        "stage": "Layer 7 (Application)",
        "details": "Browser generates an HTTP GET request payload: 'GET /index.html HTTP/1.1' to request the homepage content."
      },
      {
        "stage": "Layer 4 (Transport)",
        "details": "TCP encapsulates the payload into a segment, adding a 20-byte header with Source Port 54321, Destination Port 443, sequence numbers, and SYN/ACK flags."
      },
      {
        "stage": "Layer 3 (Network)",
        "details": "IP wraps the segment into a packet, appending Source IP (192.168.1.10) and Destination IP (93.184.216.34) with TTL = 64."
      },
      {
        "stage": "Layer 2 (Data Link)",
        "details": "Ethernet encapsulates the packet into a frame with Source MAC (00:1A:2B:3C:4D:5E), Default Gateway Router MAC (00:11:22:33:44:55), and appends a 4-byte CRC-32 trailer."
      },
      {
        "stage": "Layer 1 (Physical)",
        "details": "Frame is converted into digital signaling pulses and transmitted across physical medium (twisted-pair copper wire / fiber optic)."
      }
    ],
    "expectedResult": "The destination server de-encapsulates the frame in reverse order, verifying CRC, IP address, and TCP port, and delivers the request to the web server daemon.",
    "practicalApplication": "Wireshark packet analysis, web server performance diagnostics, and configuring network firewall rules.",
    "keyInsight": "Each layer only talks to its peer layer on the remote system, completely oblivious to how lower layers deliver the payload."
  },
  "cn-m1-t2": {
    "title": "Campus LAN Cabling & Topology Trade-off Analysis",
    "scenario": "A university department needs to interconnect 10 departmental workstations with high reliability and evaluate cabling cost, fault tolerance, and transmission modes between Star and full Mesh topologies.",
    "formula": "Full Mesh Links = N*(N - 1)/2 | Star Links = N",
    "diagram": "Star Topology:                       Mesh Topology (Fully Connected):\n  [PC1]---\\                            [PC1]=====[PC2]\n  [PC2]---[Switch]                      \\\\   X   //\n  [PC3]---/                            [PC3]=====[PC4]",
    "steps": [
      {
        "stage": "Step 1: Calculate Link Requirements",
        "details": "For N = 10 computers: A Star topology requires 10 patch cables connected to a central 16-port switch. A full Mesh topology requires 10*(9)/2 = 45 separate dedicated cables."
      },
      {
        "stage": "Step 2: Transmission Mode Selection",
        "details": "Workstations communicate in Full-Duplex mode over Cat6 Ethernet cables (1 Gbps bidirectional simultaneous transmit and receive via separate twisted pairs)."
      },
      {
        "stage": "Step 3: Fault Isolation Analysis",
        "details": "If Cable #4 is severed: In Star topology, only Workstation #4 loses connectivity; the other 9 nodes continue communicating unaffected. In Mesh, PC #4 can route through intermediate nodes."
      },
      {
        "stage": "Step 4: Central Device Failure Risk",
        "details": "If the central switch in a Star fails, all 10 nodes lose network access (single point of failure). Production networks mitigate this using dual redundant core switches."
      }
    ],
    "expectedResult": "Star topology is selected for workstation floor distribution due to 78% lower cabling cost ($500 vs $2,250) and simple maintenance, while Mesh is reserved for core datacenter interconnects.",
    "practicalApplication": "Enterprise office Ethernet design, Datacenter spine-leaf architectures, and telecommunication backbone engineering.",
    "keyInsight": "Star topology trades central switch dependency for drastic cabling reduction and straightforward node isolation."
  },
  "cn-m1-t3": {
    "title": "Transmission Delay & Bandwidth-Delay Product (BDP) Calculation",
    "scenario": "A research station in Thiruvananthapuram sends a 2 MB (megabyte) satellite imagery file to a datacenter in Bengaluru (distance d = 750 km) over a 100 Mbps fiber link with propagation speed v = 2 × 10^8 m/s. Compute transmission delay, propagation delay, and total latency.",
    "formula": "T_tx = L / B | T_prop = d / v | Total Latency = T_tx + T_prop",
    "steps": [
      {
        "stage": "Step 1: Unit Conversions",
        "details": "File size L = 2 MB = 2 × 10^6 × 8 = 16,000,000 bits. Bandwidth B = 100 Mbps = 10^8 bps. Distance d = 750 km = 750,000 meters."
      },
      {
        "stage": "Step 2: Transmission Delay (T_tx)",
        "details": "T_tx = L / B = 16,000,000 / 100,000,000 = 0.16 seconds = 160 ms."
      },
      {
        "stage": "Step 3: Propagation Delay (T_prop)",
        "details": "T_prop = d / v = 750,000 / (2 × 10^8) = 0.00375 seconds = 3.75 ms."
      },
      {
        "stage": "Step 4: Total Latency & BDP",
        "details": "Total Latency = T_tx + T_prop = 160 ms + 3.75 ms = 163.75 ms. Bandwidth-Delay Product (BDP) = B × RTT = 10^8 bps × (2 × 0.00375 s) = 750,000 bits (93.75 KB)."
      }
    ],
    "expectedResult": "The transfer completes in 163.75 ms. Transmission delay dominates (97.7% of total time), confirming the transfer is bandwidth-bound for large files.",
    "practicalApplication": "Tuning TCP receive window buffer sizes for high-speed WAN links, streaming video buffering, and cloud CDN latency reduction.",
    "keyInsight": "Transmission delay depends on file size and link bandwidth (how fast bits enter the wire); propagation delay depends purely on physical distance and the speed of light in the medium."
  },
  "cn-m1-t4": {
    "title": "CRC-4 Error Detection & Bit-Stuffing Walkthrough",
    "scenario": "A sender transmits binary message M = 1101011011 using generator polynomial G(x) = x^4 + x + 1 (binary divisor 10011). Calculate the transmitted CRC codeword and explain HDLC bit-stuffing rules.",
    "formula": "Divisor = 10011 (k = 4 CRC bits). Append k zeros to M, then perform modulo-2 binary division.",
    "diagram": "Sender: M = 1101011011 -> Append 0000 -> Mod-2 Division by 10011 -> Remainder R = 1110\nTransmitted Frame: 1101011011 1110",
    "steps": [
      {
        "stage": "Step 1: Generator Setup",
        "details": "Generator G(x) = x^4 + x^1 + x^0 corresponds to bit pattern 10011 (degree r = 4). Append 4 zeros to M: M' = 1101011011 0000."
      },
      {
        "stage": "Step 2: Modulo-2 Division (XOR)",
        "details": "Perform XOR long division of M' by 10011. Divide 11010 by 10011 -> XOR yields 01001. Repeating through the 14 bits yields final remainder R = 1110."
      },
      {
        "stage": "Step 3: Assemble Codeword",
        "details": "Replace the 4 appended zeros with remainder R: Transmitted Codeword T = 1101011011 1110."
      },
      {
        "stage": "Step 4: Receiver Verification",
        "details": "Receiver divides incoming bits T by 10011. Since T = M' ⊕ R, the modulo-2 division yields remainder 0000, confirming error-free transmission."
      },
      {
        "stage": "Step 5: Bit-Stuffing Protocol Rule",
        "details": "If framing uses delimiter flag 01111110, whenever sender encounters five consecutive 1s in data (11111), it automatically injects a dummy '0' bit: 0111110... Receiver removes the '0' after five 1s."
      }
    ],
    "expectedResult": "CRC checksum 1110 guarantees detection of all single-bit errors, double-bit errors, odd numbers of bit errors, and burst errors of length ≤ 4.",
    "practicalApplication": "Ethernet 802.3 FCS (CRC-32), HDLC framing, and SATA bus integrity checking.",
    "keyInsight": "Modulo-2 division replaces arithmetic subtraction with XOR, enabling ultra-fast hardware implementation via linear feedback shift registers (LFSR)."
  },
  "cn-m2-t1": {
    "title": "IPv4 Packet Fragmentation Across Lower MTU Links",
    "scenario": "A host sends a 4000-byte IPv4 datagram (20-byte IP header + 3980-byte data payload) across a path where an intermediate router has an outgoing Ethernet link with Maximum Transmission Unit (MTU) = 1500 bytes. Determine the fragment offsets and flags.",
    "formula": "Max Payload per Fragment = floor((MTU - Header) / 8) * 8",
    "diagram": "[Host: 4000B Datagram] ---> [Router (MTU=1500B)] ---> [Frag 1: 1500B] + [Frag 2: 1500B] + [Frag 3: 1040B]",
    "steps": [
      {
        "stage": "Step 1: Compute Maximum Payload per Fragment",
        "details": "Available bytes per frame = MTU - IP header = 1500 - 20 = 1480 bytes. Since 1480 is divisible by 8 (1480 / 8 = 185), each full fragment can carry up to 1480 data bytes."
      },
      {
        "stage": "Step 2: Fragment 1 Parameters",
        "details": "Data payload: bytes 0 to 1479 (1480 bytes). Total length = 1500 bytes. More Fragments (MF) flag = 1. Fragment Offset = 0 / 8 = 0."
      },
      {
        "stage": "Step 3: Fragment 2 Parameters",
        "details": "Data payload: bytes 1480 to 2959 (1480 bytes). Total length = 1500 bytes. More Fragments (MF) flag = 1. Fragment Offset = 1480 / 8 = 185."
      },
      {
        "stage": "Step 4: Fragment 3 Parameters (Last Fragment)",
        "details": "Remaining data payload = 3980 - 2960 = 1020 bytes. Total length = 1020 + 20 = 1040 bytes. More Fragments (MF) flag = 0. Fragment Offset = 2960 / 8 = 370."
      }
    ],
    "expectedResult": "The 4000-byte packet is split into 3 fragments of total lengths 1500, 1500, and 1040 bytes. Reassembly occurs exclusively at the final destination host using Identification, MF flag, and Offset fields.",
    "practicalApplication": "VPN tunneling MTU tuning, troubleshooting packet drops in GRE/IPsec tunnels, and Path MTU Discovery (PMTUD).",
    "keyInsight": "Fragment offset values are measured in units of 8-byte blocks (64 bits), which is why non-terminal fragment payloads must always be multiples of 8 bytes."
  },
  "cn-m2-t2": {
    "title": "Dijkstra's Shortest Path Walkthrough",
    "scenario": "Consider 5 routers (A, B, C, D, E) in an OSPF autonomous system. Router A needs to compute its shortest path routing table to all other nodes using Dijkstra's Link-State algorithm.",
    "diagram": "Graph Topology:\n  A --(2)-- B --(1)-- D\n  |         |        / \n (5)       (3)     (1) \n  |         |      /   \n  C ------- E ----/    ",
    "steps": [
      {
        "stage": "Given Graph State",
        "details": "Direct link costs from A: A-B = 2, A-C = 5. Other nodes at infinity (∞). Permanent set S = {A}."
      },
      {
        "stage": "Iteration 1",
        "details": "Minimum tentative distance is node B with dist=2. Add B to S: S = {A, B}. Update neighbors of B: dist(D) = 2 + 1 = 3 (via B), dist(E) = 2 + 3 = 5 (via B)."
      },
      {
        "stage": "Iteration 2",
        "details": "Tentative distances: C=5, D=3, E=5. Smallest is D (dist=3). Add D to S: S = {A, B, D}. Update neighbors of D: dist(E) = min(5, 3 + 1) = 4 (via D)."
      },
      {
        "stage": "Iteration 3 & 4",
        "details": "Smallest is E (dist=4 via D). Add E to S: S = {A, B, D, E}. Finally add C (dist=5 via A). S = {A, B, C, D, E}."
      }
    ],
    "expectedResult": "Router A builds its forwarding table: Destination B -> Next Hop B (cost 2); Destination D -> Next Hop B (cost 3); Destination E -> Next Hop B (cost 4); Destination C -> Next Hop C (cost 5).",
    "practicalApplication": "Open Shortest Path First (OSPF) and Intermediate System to Intermediate System (IS-IS) interior gateway protocols.",
    "keyInsight": "At every step, Dijkstra makes a greedy local choice of the lowest-cost unvisited node, which mathematically guarantees the global optimum because all edge weights are non-negative."
  },
  "cn-m2-t3": {
    "title": "IPv4 Subnet Masking vs IPv6 Address Compression",
    "scenario": "A network engineer must verify the network address for IPv4 host 172.16.45.130/20 and compress the 128-bit IPv6 address 2001:0db8:0000:0000:0008:0800:200c:417a following RFC 5952 standard.",
    "formula": "Network Address = Host IP bitwise-AND Subnet Mask",
    "steps": [
      {
        "stage": "Step 1: IPv4 Mask Conversion",
        "details": "Prefix /20 means 20 ones: 11111111.11111111.11110000.00000000 = 255.255.240.0. The interesting octet is Octet 3 (mask = 240, block size = 256 - 240 = 16)."
      },
      {
        "stage": "Step 2: Compute IPv4 Network ID",
        "details": "Octet 3 value is 45. The block boundaries are multiples of 16: 0, 16, 32, 48. 45 falls into block 32. Thus, Network Address = 172.16.32.0/20. Broadcast = 172.16.47.255."
      },
      {
        "stage": "Step 3: IPv6 Leading Zero Suppression",
        "details": "Original: 2001:0db8:0000:0000:0008:0800:200c:417a. Remove leading zeros in each 16-bit hextet: 2001:db8:0:0:8:800:200c:417a."
      },
      {
        "stage": "Step 4: IPv6 Double Colon Replacement",
        "details": "Replace the longest consecutive run of zero hextets (:0:0:) with '::'. Final compressed format: 2001:db8::8:800:200c:417a."
      }
    ],
    "expectedResult": "IPv4 Network ID is 172.16.32.0 with usable hosts 172.16.32.1 to 172.16.47.254 (4,094 hosts). The IPv6 address is compressed from 39 characters to 27 characters.",
    "practicalApplication": "Configuring enterprise edge routers, DHCP pool provisioning, and transition to pure IPv6 networks.",
    "keyInsight": "The '::' symbol in IPv6 can only appear once in an address; otherwise, the number of zero hextets would be ambiguous."
  },
  "cn-m2-t4": {
    "title": "Worked Numerical: Dividing 192.168.10.0/24 into 4 Subnets",
    "scenario": "A college engineering department needs 4 distinct lab subnets from a base network allocation of 192.168.10.0/24. Calculate the new subnet mask, block size, and usable host address ranges.",
    "formula": "Borrowed Bits k: 2^k >= Required Subnets | Block Size = 256 - Last Mask Octet",
    "steps": [
      {
        "stage": "Step 1: Determine Bits to Borrow",
        "details": "Base Network: 192.168.10.0/24. Subnets required = 4. Since 2^2 = 4, we borrow k = 2 bits from the host portion. New prefix = 24 + 2 = /26."
      },
      {
        "stage": "Step 2: Calculate New Subnet Mask",
        "details": "The 4th octet has 2 ones: 11000000 binary = 128 + 64 = 192. New Subnet Mask: 255.255.255.192. Block size = 256 - 192 = 64 addresses per subnet."
      },
      {
        "stage": "Step 3: Usable Hosts per Subnet",
        "details": "Host bits remaining = 32 - 26 = 6 bits. Total addresses = 2^6 = 64. Usable host addresses = 64 - 2 = 62 hosts per subnet."
      },
      {
        "stage": "Step 4: Subnet Ranges Table",
        "details": "Subnet 0: 192.168.10.0/26 (Usable: .1 to .62, Broadcast: .63). Subnet 1: 192.168.10.64/26 (Usable: .65 to .126, Broadcast: .127). Subnet 2: 192.168.10.128/26 (Usable: .129 to .190, Broadcast: .191). Subnet 3: 192.168.10.192/26 (Usable: .193 to .254, Broadcast: .255)."
      }
    ],
    "expectedResult": "Four distinct subnets are allocated with 62 usable IP addresses each, preventing IP waste and isolating broadcast traffic between college labs.",
    "practicalApplication": "Enterprise subnetting, VLAN IP assignment in Cisco IOS switches, and cloud VPC CIDR design in AWS/Azure.",
    "keyInsight": "Always subtract 2 from total host capacity per subnet: one address for the Network ID (all host bits 0) and one for the Directed Broadcast (all host bits 1)."
  },
  "cn-m3-t1": {
    "title": "Socket API Client-Server State Machine Walkthrough",
    "scenario": "A student builds a TCP client-server application in Python. Trace the socket system call sequence on both sides from initialization to teardown.",
    "diagram": "Server: socket() -> bind() -> listen() -> accept() [Blocks] ----------\\ (SYN-ACK)\n                                                                        v\nClient: socket() ---------------------------------------> connect() [Blocks] -> Connected",
    "steps": [
      {
        "stage": "Step 1: Server Passive Open",
        "details": "Server invokes socket(AF_INET, SOCK_STREAM), bind(('0.0.0.0', 8080)) to bind to port 8080, and listen(5) to set the connection backlog queue."
      },
      {
        "stage": "Step 2: Server Blocking Accept",
        "details": "Server calls accept(). The operating system puts the server thread to sleep waiting for incoming TCP connection requests on the listening socket."
      },
      {
        "stage": "Step 3: Client Active Open",
        "details": "Client calls socket() and connect(('192.168.1.10', 8080)). The OS network stack initiates the TCP 3-Way Handshake with the server."
      },
      {
        "stage": "Step 4: Connection Established & Data Exchange",
        "details": "Server accept() unblocks and returns a new connected socket dedicated to this client. Client calls send('HELLO'), and server reads with recv(1024)."
      },
      {
        "stage": "Step 5: Connection Teardown",
        "details": "Client calls close(), transmitting a FIN packet. Server replies with ACK, calls close(), sending FIN, and client sends final ACK (entering TIME_WAIT state)."
      }
    ],
    "expectedResult": "A reliable, full-duplex byte stream is established. Server continues listening on port 8080 for other clients while serving this client on the dedicated descriptor.",
    "practicalApplication": "Backend development using Node.js net sockets, Python asyncio, Go net package, and reverse proxies like NGINX.",
    "keyInsight": "The server uses one socket to listen for incoming connections and a separate socket for each established client connection."
  },
  "cn-m3-t2": {
    "title": "TCP 3-Way Handshake & Sequence Number Synchronization",
    "scenario": "Client host C (IP 10.0.0.1) connects to Web Server S (IP 10.0.0.2) on Port 80. Trace the exact sequence and acknowledgement numbers during the 3-Way Handshake and first HTTP request.",
    "diagram": "Client C                                        Server S\n   | ----------- SYN (seq = 1000) -------------> | (SYN_RCVD)\n   | <--- SYN-ACK (seq = 5000, ack = 1001) ----- | \n   | ----------- ACK (seq = 1001, ack = 5001) -> | (ESTABLISHED)",
    "steps": [
      {
        "stage": "Message 1 (SYN)",
        "details": "Client chooses Initial Sequence Number (ISN) = 1000. It sends a packet with SYN flag = 1, Seq = 1000, Ack = 0, Window = 65535."
      },
      {
        "stage": "Message 2 (SYN-ACK)",
        "details": "Server receives SYN, chooses its own ISN = 5000. It replies with SYN = 1, ACK = 1, Seq = 5000, and Ack = 1001 (acknowledging receipt of client byte 1000)."
      },
      {
        "stage": "Message 3 (ACK)",
        "details": "Client transitions to ESTABLISHED. It replies with ACK = 1, Seq = 1001, and Ack = 5001. Handshake is complete."
      },
      {
        "stage": "Data Transmission (HTTP GET)",
        "details": "Client sends 200-byte HTTP request: Seq = 1001, Ack = 5001, Length = 200. Server acknowledges with Ack = 1201 (1001 + 200 bytes)."
      }
    ],
    "expectedResult": "Both endpoints synchronize starting sequence numbers and allocate transmit/receive sliding window buffers before transmitting application data.",
    "practicalApplication": "Detecting SYN Flood DDoS attacks, configuring TCP syncookies, and analyzing connection latency overhead.",
    "keyInsight": "The SYN bit consumes 1 sequence number in the sequence space even though it carries zero application payload."
  },
  "cn-m3-t3": {
    "title": "TCP Reno Congestion Control: AIMD & Fast Recovery",
    "scenario": "A TCP Reno sender with MSS = 1 KB experiences Congestion Window (cwnd) growth over time. Starting with cwnd = 1 KB and ssthresh = 16 KB, track cwnd changes over 10 transmission rounds, including response to a triple duplicate ACK at round 8.",
    "formula": "Slow Start: cwnd = cwnd * 2 per RTT | Congestion Avoidance: cwnd = cwnd + 1 MSS per RTT",
    "steps": [
      {
        "stage": "Phase 1: Slow Start (Rounds 1-4)",
        "details": "Round 1: cwnd = 1 KB. Round 2: cwnd = 2 KB. Round 3: cwnd = 4 KB. Round 4: cwnd = 8 KB. Round 5: cwnd = 16 KB (reaches ssthresh)."
      },
      {
        "stage": "Phase 2: Congestion Avoidance (Rounds 6-7)",
        "details": "Now in linear growth (AIMD): Round 6: cwnd = 17 KB. Round 7: cwnd = 18 KB. Round 8: cwnd = 19 KB."
      },
      {
        "stage": "Phase 3: Triple Duplicate ACK Event (Round 8)",
        "details": "Sender receives 3 duplicate ACKs indicating a single lost packet. Reno enters Fast Retransmit & Fast Recovery: ssthresh is halved to 19 / 2 = 9.5 KB (9 KB). cwnd is set to ssthresh + 3 MSS = 12 KB."
      },
      {
        "stage": "Phase 4: Linear Resumption (Round 9-10)",
        "details": "Once the missing segment is acknowledged, cwnd resets to ssthresh (9 KB) and resumes linear Congestion Avoidance: Round 9 = 10 KB, Round 10 = 11 KB."
      }
    ],
    "expectedResult": "TCP Reno avoids collapsing cwnd back to 1 KB on minor isolated packet loss (unlike TCP Tahoe), maintaining high throughput on high-bandwidth links.",
    "practicalApplication": "Internet congestion management, throughput optimization in video streaming, and modern BBR congestion control comparison.",
    "keyInsight": "Additive Increase Multiplicative Decrease (AIMD) guarantees fairness and distributed stability across competing Internet traffic flows."
  },
  "cn-m3-t4": {
    "title": "Hierarchical DNS Resolution Walkthrough for ktu.edu.in",
    "scenario": "A student's laptop in Kozhikode has an empty DNS cache and queries 'ktu.edu.in'. Trace the recursive and iterative DNS resolution steps to obtain the web server IP address.",
    "diagram": "[Client] -> (1) Recursive Query -> [Local ISP DNS Resolver]\n                                         |-- (2) Iterative -> [Root DNS (.): asks .in]\n                                         |-- (3) Iterative -> [TLD DNS (.in): asks .edu.in]\n                                         |-- (4) Iterative -> [Authoritative: ktu.edu.in]\n[Client] <- (5) IP: 14.139.185.150 <----|",
    "steps": [
      {
        "stage": "Step 1: Client to Local Resolver (Recursive)",
        "details": "Browser checks OS cache. Missing, so it sends a recursive UDP query (Destination Port 53) to the local ISP DNS resolver (e.g., 8.8.8.8)."
      },
      {
        "stage": "Step 2: Querying Root Nameserver",
        "details": "Local resolver queries one of the 13 global Root Servers (a.root-servers.net). Root replies with referral to the '.in' country-code Top-Level Domain (ccTLD) nameserver."
      },
      {
        "stage": "Step 3: Querying TLD Nameserver",
        "details": "Resolver queries the '.in' TLD nameserver. TLD server responds with NS records for the authoritative servers of 'ktu.edu.in' (e.g., ns1.ktu.edu.in)."
      },
      {
        "stage": "Step 4: Querying Authoritative Nameserver",
        "details": "Resolver queries ns1.ktu.edu.in for the Type A record of 'ktu.edu.in'. Authoritative server responds: Type A, IP = 14.139.185.150 with TTL = 3600 seconds."
      },
      {
        "stage": "Step 5: Cache & Deliver to Browser",
        "details": "Local resolver caches the mapping for 1 hour (3600 s) and returns IP 14.139.185.150 to the student's browser."
      }
    ],
    "expectedResult": "The client successfully resolves ktu.edu.in to IP 14.139.185.150 within 45 ms and initiates TCP connection to Port 443.",
    "practicalApplication": "Domain name configuration, CDN edge routing, split-horizon DNS, and DNSSEC security implementation.",
    "keyInsight": "The query from client to local DNS is recursive (do the whole lookup for me), while queries from local resolver to the hierarchy are iterative (here is who to ask next)."
  },
  "cn-m4-t1": {
    "title": "Li-Fi Optical Wireless Link & CSMA/CA Optical MAC",
    "scenario": "An operation theatre in an ICU requires 100 Mbps wireless connectivity where traditional Wi-Fi RF radiation is strictly banned due to interference with medical telemetry. Design a Li-Fi optical transceiver link.",
    "diagram": "[Server] -> [LED Driver] -> [Ceiling LED Light] ~~(Visible Light 400-800 THz)~~> [Photodiode Receiver on Laptop]",
    "steps": [
      {
        "stage": "Step 1: Physical Modulation (OOK / OFDM)",
        "details": "Digital data is fed to a micro-LED driver that flickers the LED light intensity millions of times per second (On-Off Keying or Optical OFDM) imperceptible to the human eye."
      },
      {
        "stage": "Step 2: Free-Space Optical Transmission",
        "details": "The light beam covers a 3-meter cone area directly beneath the lamp fixture at optical wavelengths of 400 to 700 nm with zero electromagnetic interference (EMI)."
      },
      {
        "stage": "Step 3: Optical Receiver Detection",
        "details": "A silicon PIN photodiode attached to the surgical workstation detects variations in optical irradiance and converts photons into electrical currents."
      },
      {
        "stage": "Step 4: Medium Access Control (MAC)",
        "details": "Since light cannot penetrate opaque walls, physical isolation provides inherent security. Bidirectional uplink uses infrared LED to prevent glare."
      }
    ],
    "expectedResult": "Workstation achieves 100 Mbps clean data transfer with zero RF electromagnetic interference and complete physical eavesdropping protection.",
    "practicalApplication": "Hospital ICUs, airplane passenger cabins, defense secure command rooms, and underwater underwater communications.",
    "keyInsight": "Li-Fi leverages the massive unallocated 400-800 THz visible light spectrum, providing 10,000 times the bandwidth capacity of traditional radio frequencies."
  },
  "cn-m4-t2": {
    "title": "Software-Defined Networking (SDN) OpenFlow Flow Table Matching",
    "scenario": "An SDN OpenFlow switch receives an incoming packet from Port 1 with Source IP 10.0.0.5, Destination IP 10.0.0.99, and TCP Port 80. Trace how the switch evaluates its Flow Table and forwards the packet.",
    "diagram": "[Incoming Packet] -> [Match Pipeline: In_Port=1, Dst_IP=10.0.0.99, Dst_Port=80]\n                     |-> MATCH FOUND: Action = Output to Port 3, Increment Byte Counter\n                     |-> (If Table-Miss -> Send OpenFlow Packet-In to SDN Controller)",
    "steps": [
      {
        "stage": "Step 1: Header Extraction",
        "details": "Switch hardware extracts 10-tuple flow header from packet: In_Port = 1, Ether_Type = 0x0800 (IPv4), Src_IP = 10.0.0.5, Dst_IP = 10.0.0.99, Protocol = 6 (TCP), Dst_Port = 80."
      },
      {
        "stage": "Step 2: Flow Table Lookup",
        "details": "Switch scans Flow Table 0 in priority order. It matches Rule #102: Match (Dst_IP = 10.0.0.99, Protocol = 6), Priority = 1000."
      },
      {
        "stage": "Step 3: Action Execution",
        "details": "The matching instruction set specifies: Action = Forward out physical interface Port 3; Counter = increment matched_packets by 1 and matched_bytes by length."
      },
      {
        "stage": "Step 4: Centralized Controller Updates",
        "details": "If no flow entry matched (Table-Miss), the switch encapsulates the packet into an OpenFlow 'Packet-In' message sent to the centralized Ryu/ONOS Controller over TLS."
      }
    ],
    "expectedResult": "Packet is switched in hardware at line rate through Port 3 without consulting the controller for subsequent packets in the same flow.",
    "practicalApplication": "Google B4 WAN datacenter interconnects, cloud virtual switches (Open vSwitch), and dynamic network slicing in 5G core networks.",
    "keyInsight": "SDN completely decouples the Control Plane (routing decisions made centrally in software) from the Data Plane (fast packet forwarding performed on commodity hardware switches)."
  },
  "cn-m4-t3": {
    "title": "IoT MQTT Publish-Subscribe Protocol Flow",
    "scenario": "An agricultural IoT system has 20 soil moisture sensors publishing readings to an MQTT broker on topic 'farm/zone1/soil'. A smart irrigation pump is subscribed to the topic. Trace the message exchange with QoS 1.",
    "diagram": "[Soil Sensor (Publisher)] ---> PUBLISH (Topic='farm/zone1/soil', Payload='18%') ---> [MQTT Broker]\n                                                                                      |\n[Irrigation Pump (Subscriber)] <--- PUBLISH (Payload='18%') <-------------------------|",
    "steps": [
      {
        "stage": "Step 1: Subscriber Registration",
        "details": "The irrigation pump connects to MQTT Broker on TCP Port 1883 and issues SUBSCRIBE packet for topic 'farm/zone1/soil' with QoS 1. Broker acknowledges with SUBACK."
      },
      {
        "stage": "Step 2: Sensor Telemetry Publish",
        "details": "Moisture sensor wakes from deep sleep, connects, and sends PUBLISH: PacketID = 401, Topic = 'farm/zone1/soil', QoS = 1, Payload = '{\"moisture\": 18.5, \"battery\": 94}'."
      },
      {
        "stage": "Step 3: Broker Acknowledgment (PUBACK)",
        "details": "Broker persists message and returns PUBACK (PacketID = 401) to the sensor. Sensor enters low-power sleep state."
      },
      {
        "stage": "Step 4: Message Dispatch to Subscriber",
        "details": "Broker checks subscription tree and pushes PUBLISH to the irrigation pump. Pump receives '18.5%', triggers watering solenoid relay, and replies with PUBACK to broker."
      }
    ],
    "expectedResult": "Low-overhead telemetry transmission (only 2-byte MQTT fixed header) succeeds reliably over an unstable cellular/LoRaWAN connection.",
    "practicalApplication": "Smart agriculture, connected smart home appliances (Home Assistant), automotive telematics, and industrial SCADA systems.",
    "keyInsight": "Publish-Subscribe decouples publishers and subscribers in both space (they don't know each other's IP addresses) and time (they do not need to be active simultaneously if retained messages are used)."
  },
  "cn-m4-t4": {
    "title": "RSA Public-Key Encryption & Stateful Firewall Rule Evaluation",
    "scenario": "Trace small-prime RSA key generation (p = 3, q = 11) for secure session key exchange, and demonstrate how a stateful firewall inspects connection tracking tables.",
    "formula": "n = p*q | phi = (p-1)*(q-1) | e*d = 1 (mod phi) | c = m^e mod n",
    "steps": [
      {
        "stage": "Step 1: RSA Key Generation",
        "details": "Choose primes p = 3, q = 11. Modulus n = 3 × 11 = 33. Euler totient phi(n) = (3 - 1)(11 - 1) = 2 × 10 = 20."
      },
      {
        "stage": "Step 2: Choose Public and Private Exponents",
        "details": "Choose e = 3 such that gcd(3, 20) = 1. Calculate private key d: (d × 3) mod 20 = 1. For d = 7: (7 × 3) = 21 mod 20 = 1. Public Key = (e=3, n=33); Private Key = (d=7, n=33)."
      },
      {
        "stage": "Step 3: Encryption & Decryption",
        "details": "Encrypt message m = 4: Ciphertext c = m^e mod n = 4^3 mod 33 = 64 mod 33 = 31. Decrypt: m = c^d mod n = 31^7 mod 33 = 4. Original message is verified."
      },
      {
        "stage": "Step 4: Stateful Firewall Inspection",
        "details": "An internal host connects to external IP 93.184.216.34:443. Firewall logs entry in conntrack table: (Src: 192.168.1.10:54321, Dst: 93.184.216.34:443, State: ESTABLISHED). Incoming return packets matching this flow are dynamically permitted without exposing internal ports."
      }
    ],
    "expectedResult": "Message is securely transmitted using asymmetric cryptography, while the stateful firewall blocks all unsolicited inbound traffic that lacks an active connection tracking entry.",
    "practicalApplication": "TLS/HTTPS handshakes, SSH authentication keys, iptables/nftables Linux firewalls, and enterprise perimeter defense.",
    "keyInsight": "Asymmetric encryption provides confidentiality and key exchange without sharing secrets; stateful firewalls track protocol state rather than inspecting packets in isolation."
  },
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
  },
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
  },
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
};
