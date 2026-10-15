# -*- coding: utf-8 -*-
"""
Full Topic Examples Generator for StudySense AI.
Generates comprehensive, curriculum-aligned structured examples for all 64 topics across 4 subjects.
"""

import json
import os

CN_EXAMPLES = {
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
        "diagram": "[Host: 4000B Datagram] ---> [Router (MTU=1500B)] ---> [Frag 1: 1500B] + [Frag 2: 1500B] + [Frag 3: 1060B]",
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
    }
}

print(f"Loaded {len(CN_EXAMPLES)} Computer Networks examples.")
