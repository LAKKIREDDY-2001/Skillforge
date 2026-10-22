/**
 * SkillForge Extended Multi-Discipline Curriculum & Technical Interview System
 * Courses: DSA, System Design, OOPS, Computer Networks, DBMS & SQL
 * Languages: Python 3, C++, C, Java, SQL, JavaScript
 * Company Packs: Amazon, Google, Microsoft, Meta | Curated: Top 50, Top 100, Top 150
 * Interactive Cheatsheets with Live Real-Time Date & Time
 */

(function() {
  const currentDateTimeStr = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  }) + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // ── Multi-Language Templates Generator ─────────────────────────────────────
  function getMultiLangCode(title, funcName, params) {
    return {
      python: `def ${funcName}(${params.python}):\n    # Optimal solution in Python 3\n    pass`,
      cpp: `#include <iostream>\n#include <vector>\n#include <string>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    ${params.cpp_ret} ${funcName}(${params.cpp_args}) {\n        // Optimal solution in C++17\n    }\n};`,
      c: `#include <stdio.h>\n#include <stdlib.h>\n#include <stdbool.h>\n\n${params.c_ret} ${funcName}(${params.c_args}) {\n    // Optimal solution in C11\n}`,
      java: `import java.util.*;\n\nclass Solution {\n    public ${params.java_ret} ${funcName}(${params.java_args}) {\n        // Optimal solution in Java 17\n    }\n}`,
      javascript: `/**\n * @param {${params.js_doc}}\n * @return {${params.js_ret_doc}}\n */\nfunction ${funcName}(${params.js_args}) {\n    // Optimal solution in JavaScript\n}`,
      sql: `-- SQL Sandbox Query Environment\nSELECT * FROM employees\nWHERE department_id = 1\nORDER BY salary DESC;`
    };
  }

  // ── Additional Course Tracks ───────────────────────────────────────────────
  const additionalCourses = [
    // ── SYSTEM DESIGN ────────────────────────────────────────────────────────
    {
      id: "sys_design_fundamentals",
      course: "system_design",
      name: "System Design: Scalability & CAP",
      icon: "🏗️",
      count: "8 case studies",
      badge: "System Design",
      timeComp: "Latency: <50ms P99",
      spaceComp: "Storage: Petabyte Scale",
      mentalModel: "Decouple services, eliminate single points of failure, partition data",
      companies: ["Amazon", "Google", "Meta", "Microsoft"],
      collections: ["top_50", "top_100", "top_150", "amazon", "google", "meta"],
      prose: "System Design addresses building reliable, scalable, and maintainable distributed applications. Core foundations include vertical vs horizontal scaling, load balancing, stateless web tiers, and Brewer's CAP Theorem (Consistency, Availability, Partition Tolerance).",
      analogy: "A highway network: instead of making a single lane wider (vertical scaling), add parallel multi-lane freeways with toll booths and traffic routers (horizontal scaling).",
      key_points: {
        pattern: "Always identify Functional Requirements (features) and Non-Functional Requirements (Throughput, Latency, SLA 99.99%, Consistency vs Availability).",
        edgeCases: "Network partitions (split-brain scenarios), cascading server failures under sudden traffic spikes, hot-key traffic skew.",
        pitfalls: "Over-engineering with distributed microservices on Day 1; Premature sharding before exhausting caching and index tuning.",
        faang: "Explain trade-offs: Strong Consistency (CP, e.g. banking balances via Paxos/Raft) vs Eventual Consistency (AP, e.g. social media feeds via Dynamo-style quorum)."
      },
      examples: {
        easy: {
          title: "Horizontal Scaling & Stateless Architecture",
          badge: "System Design 101",
          desc: "How do you scale a monolithic web server handling 100K concurrent requests?",
          pythonCode: `# Architectural Blueprint (Python pseudocode)
class LoadBalancedCluster:
    def __init__(self, servers):
        self.servers = servers
        self.idx = 0
    def route_request(self, req):
        # Round Robin or Consistent Hash
        s = self.servers[self.idx % len(self.servers)]
        self.idx += 1
        return s.handle(req)`,
          cppCode: `// C++ Round Robin Dispatcher
#include <vector>
#include <string>
class LoadBalancer {
    std::vector<std::string> nodes;
    size_t cur = 0;
public:
    LoadBalancer(std::vector<std::string> n) : nodes(n) {}
    std::string route() {
        std::string chosen = nodes[cur % nodes.size()];
        cur++;
        return chosen;
    }
};`,
          cCode: `// C11 Load Balancer routing
#include <stdio.h>
const char* route_node(int request_id) {
    const char* nodes[] = {"app-srv-1", "app-srv-2", "app-srv-3"};
    return nodes[request_id % 3];
}`,
          javaCode: `public class LoadBalancer {
    private final String[] servers = {"srv1.aws.internal", "srv2.aws.internal"};
    private int counter = 0;
    public synchronized String getNext() {
        return servers[counter++ % servers.length];
    }
}`,
          walkthrough: "Offload session state into Redis or DynamoDB so any stateless application worker can serve incoming requests behind an Application Load Balancer."
        },
        medium: {
          title: "CAP Theorem in Distributed Systems",
          badge: "Core Architecture",
          desc: "Under a network partition (P), why must distributed storage pick Consistency (C) or Availability (A)?",
          pythonCode: `# Distributed Quorum: R + W > N ensures strong consistency
N = 3 # Replicas
W = 2 # Write Quorum
R = 2 # Read Quorum
# Since R + W = 4 > 3, at least one node in Read quorum has latest Write.`,
          cppCode: `// Distributed Quorum Invariant
bool isStronglyConsistent(int N, int R, int W) {
    return (R + W) > N;
}`,
          cCode: `int is_quorum_safe(int n, int r, int w) { return (r + w) > n; }`,
          javaCode: `public class DistributedQuorum {
    public static boolean isConsistent(int n, int r, int w) {
        return (r + w) > n;
    }
}`,
          walkthrough: "If network connection between data centers breaks, you either reject writes to guarantee identical data (CP) or accept writes on both sides risking conflicting state (AP)."
        },
        hard: {
          title: "Consistent Hashing with Virtual Nodes",
          badge: "Bar Raiser",
          desc: "Implement a distributed cache router that minimizes key remapping when cache nodes join or leave.",
          pythonCode: `import hashlib, bisect

class ConsistentHashRing:
    def __init__(self, nodes, replicas=100):
        self.replicas = replicas
        self.ring = []
        self.node_map = {}
        for n in nodes: self.add_node(n)

    def _hash(self, key):
        return int(hashlib.md5(key.encode()).hexdigest(), 16)

    def add_node(self, node):
        for i in range(self.replicas):
            h = self._hash(f"{node}#{i}")
            bisect.insort(self.ring, h)
            self.node_map[h] = node

    def get_node(self, key):
        if not self.ring: return None
        h = self._hash(key)
        idx = bisect.bisect_right(self.ring, h)
        if idx == len(self.ring): idx = 0
        return self.node_map[self.ring[idx]]`,
          cppCode: `// C++ Consistent Hashing with std::map
#include <map>
#include <string>
class ConsistentHash {
    std::map<uint32_t, std::string> ring;
public:
    void addNode(const std::string& node);
    std::string getNode(const std::string& key);
};`,
          cCode: `// C Consistent Hashing using sorted binary search table`,
          javaCode: `import java.util.*;
public class ConsistentHashRing {
    private final SortedMap<Integer, String> ring = new TreeMap<>();
    // Virtual node distribution
}`,
          walkthrough: "Virtual nodes prevent hot-spots and ensure uniform hash ring distribution. Adding or removing a server only remaps k/N keys rather than all keys."
        }
      },
      practice: {
        easy: {
          title: "Horizontal Scaling Calculations",
          badge: "System Design Level 1",
          prompt: "If each server handles 500 QPS and peak traffic is 12,000 QPS, calculate the minimum number of servers needed with 20% safety headroom.",
          sampleIo: "Peak: 12000 QPS, Server: 500 QPS, Headroom: 20% → Output: 29 servers",
          starterCodePython: `def calculate_servers(peak_qps, server_capacity, headroom=0.20):
    # Your calculation here:
    needed = peak_qps / server_capacity
    return int(needed * (1 + headroom)) + 1`,
          starterCodeCpp: `int calculateServers(int peakQps, int serverCapacity, double headroom) {
    double needed = (double)peakQps / serverCapacity;
    return (int)(needed * (1.0 + headroom)) + 1;
}`,
          starterCodeC: `int calculate_servers(int peak_qps, int server_capacity) {
    return (int)((peak_qps / (double)server_capacity) * 1.20) + 1;
}`,
          starterCodeJava: `public class Solution {
    public static int calculateServers(int peakQps, int serverCapacity) {
        return (int) Math.ceil((peakQps / (double) serverCapacity) * 1.20);
    }
}`,
          starterCodeSql: `-- Query server fleet allocation
SELECT CEIL((12000.0 / 500.0) * 1.20) AS min_servers_needed;`,
          solutionCode: `def calculate_servers(peak_qps, server_capacity, headroom=0.20):
    import math
    return math.ceil((peak_qps / server_capacity) * (1 + headroom))`,
          complexityNotes: "O(1) capacity estimation rule of thumb",
          hints: ["Divide peak traffic by single server capacity, then multiply by 1.20 for safety headroom."],
          testCases: [
            { input: "peak = 12000, cap = 500", expected: "29", desc: "Standard capacity sizing" },
            { input: "peak = 1000, cap = 200", expected: "6", desc: "Small web app sizing" }
          ]
        },
        medium: {
          title: "Design a Distributed Rate Limiter",
          badge: "System Design Level 2",
          prompt: "Implement the Token Bucket algorithm for rate limiting user API requests.",
          sampleIo: "Capacity: 5 tokens, Refill: 1 token/sec. Allow bursts up to 5.",
          starterCodePython: `import time

class TokenBucket:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = capacity
        self.last_update = time.time()

    def allow_request(self, tokens_needed=1):
        now = time.time()
        elapsed = now - self.last_update
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_update = now
        if self.tokens >= tokens_needed:
            self.tokens -= tokens_needed
            return True
        return False`,
          starterCodeCpp: `class TokenBucket {
    double capacity, refillRate, tokens;
    // C++ Token Bucket implementation
};`,
          starterCodeC: `// C Token bucket state structure`,
          starterCodeJava: `public class TokenBucket {
    private final double capacity, refillRate;
    private double tokens;
    // Java Thread-safe Token Bucket
}`,
          starterCodeSql: `-- Rate limit tracking table check
SELECT user_id, tokens_remaining FROM api_rate_limits WHERE user_id = 'user_123';`,
          solutionCode: `...`,
          complexityNotes: "Time: O(1) per check | Space: O(1) per user in Redis",
          hints: ["Refill tokens lazily when a request arrives: tokens += elapsed_time * refill_rate."],
          testCases: [
            { input: "5 requests in 1 second", expected: "Allowed", desc: "Burst allowed within capacity" }
          ]
        },
        hard: {
          title: "Design TinyURL / Distributed ID Generator",
          badge: "System Design Level 3",
          prompt: "Generate globally unique, 64-bit monotonically increasing IDs (Twitter Snowflake style) across distributed workers.",
          sampleIo: "Timestamp (41 bits) + Worker ID (10 bits) + Sequence Number (12 bits)",
          starterCodePython: `import time

class SnowflakeIDGenerator:
    def __init__(self, worker_id, datacenter_id):
        self.worker_id = worker_id
        self.datacenter_id = datacenter_id
        self.sequence = 0
        self.last_timestamp = -1

    def next_id(self):
        timestamp = int(time.time() * 1000)
        # Bitwise packing: (timestamp << 22) | (datacenter << 17) | (worker << 12) | sequence
        id_val = ((timestamp & 0x1FFFFFFFFFF) << 22) | ((self.datacenter_id & 0x1F) << 17) | ((self.worker_id & 0x1F) << 12) | (self.sequence & 0xFFF)
        self.sequence = (self.sequence + 1) & 0xFFF
        return id_val`,
          starterCodeCpp: `// 64-bit Snowflake Generator in C++17`,
          starterCodeC: `// C 64-bit bitmask ID generator`,
          starterCodeJava: `// Java 64-bit atomic Snowflake Generator`,
          starterCodeSql: `-- Snowflake ID format simulation
SELECT (UNIX_TIMESTAMP(NOW()) << 22) AS generated_id;`,
          solutionCode: `...`,
          complexityNotes: "Time: O(1) | High throughput 4096 IDs per ms per worker",
          hints: ["Pack timestamp, machine ID, and sequence counter using binary shift operations."],
          testCases: [
            { input: "Generate 2 consecutive IDs", expected: "id2 > id1", desc: "Monotonically increasing IDs" }
          ]
        }
      }
    },

    // ── OBJECT-ORIENTED PROGRAMMING (OOPS) ────────────────────────────────────
    {
      id: "oops_solid",
      course: "oops",
      name: "OOPS: Pillars, SOLID & Design Patterns",
      icon: "🧱",
      count: "10 challenges",
      badge: "Core Engineering",
      timeComp: "Clean Architecture",
      spaceComp: "Decoupled Memory",
      mentalModel: "Encapsulate what varies; program to interfaces, not implementations",
      companies: ["Amazon", "Google", "Microsoft", "Meta"],
      collections: ["top_50", "top_100", "top_150", "amazon", "microsoft"],
      prose: "Object-Oriented Programming models complex systems into modular objects combining state and behavior. Master the 4 Pillars (Encapsulation, Abstraction, Inheritance, Polymorphism) and the SOLID principles for extensible software.",
      analogy: "A modern modular vehicle: you steer using the steering wheel (Abstraction) without knowing how the fuel injection operates (Encapsulation), while electric and gas engines swap under the hood (Polymorphism).",
      key_points: {
        pattern: "Factory pattern for object instantiation, Strategy for algorithm swapping, Observer for reactive events, Decorator for runtime enhancement.",
        edgeCases: "Fragile base class problem, tight coupling, circular object references creating memory leaks in garbage collectors.",
        pitfalls: "Violating Liskov Substitution Principle (LSP) by throwing exceptions in subclass overrides of base contracts.",
        faang: "Explain Dependency Inversion Principle (DIP): High-level modules should not depend on low-level modules; both should depend on abstractions (interfaces)."
      },
      examples: {
        easy: {
          title: "The 4 Pillars: Encapsulation & Polymorphism",
          badge: "OOPS 101",
          desc: "Demonstrate runtime method overriding (polymorphism) across derived classes.",
          pythonCode: `class PaymentMethod:
    def process_payment(self, amount: float) -> bool:
        raise NotImplementedError

class CreditCard(PaymentMethod):
    def process_payment(self, amount: float) -> bool:
        return True # Charge credit card

class UPI(PaymentMethod):
    def process_payment(self, amount: float) -> bool:
        return True # Process UPI instant payment`,
          cppCode: `#include <iostream>
class Payment {
public:
    virtual bool process(double amount) = 0; // Pure virtual
    virtual ~Payment() {}
};
class CreditCard : public Payment {
public:
    bool process(double amount) override { return true; }
};`,
          cCode: `// C Function Pointers emulating virtual dispatch
typedef struct Payment {
    bool (*process)(double amount);
} Payment;`,
          javaCode: `public interface PaymentMethod {
    boolean processPayment(double amount);
}
public class CreditCard implements PaymentMethod {
    @Override public boolean processPayment(double amount) { return true; }
}`,
          walkthrough: "Runtime polymorphism decouples the payment caller from the concrete payment implementation."
        },
        medium: {
          title: "SOLID Principles: Strategy Pattern",
          badge: "Design Pattern",
          desc: "Swap pricing discount algorithms at runtime without modifying the checkout class (Open/Closed Principle).",
          pythonCode: `class DiscountStrategy:
    def calculate(self, price: float) -> float: pass

class BlackFridayDiscount(DiscountStrategy):
    def calculate(self, price: float) -> float: return price * 0.70

class Order:
    def __init__(self, amount: float, strategy: DiscountStrategy):
        self.amount = amount
        self.strategy = strategy
    def get_final_price(self):
        return self.strategy.calculate(self.amount)`,
          cppCode: `class Order {
    DiscountStrategy* strategy;
public:
    double getFinal(double price) { return strategy->calculate(price); }
};`,
          cCode: `// Strategy pattern via function pointer struct in C`,
          javaCode: `public class Order {
    private DiscountStrategy strategy;
    public double checkout(double price) { return strategy.calculate(price); }
}`,
          walkthrough: "New discounts can be added by creating new Strategy classes without touching existing Order codebase."
        },
        hard: {
          title: "Thread-Safe Singleton Pattern",
          badge: "Concurrency & OOP",
          desc: "Implement a thread-safe singleton instance using Double-Checked Locking.",
          pythonCode: `import threading

class DatabaseConnection:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance.connected = True
        return cls._instance`,
          cppCode: `// Meyer's Singleton (Thread-safe in C++11)
class Database {
public:
    static Database& getInstance() {
        static Database instance;
        return instance;
    }
private:
    Database() {}
};`,
          cCode: `// C singleton via static mutex and pointer`,
          javaCode: `public class DatabaseConnection {
    private static volatile DatabaseConnection instance;
    private DatabaseConnection() {}
    public static DatabaseConnection getInstance() {
        if (instance == null) {
            synchronized (DatabaseConnection.class) {
                if (instance == null) {
                    instance = new DatabaseConnection();
                }
            }
        }
        return instance;
    }
}`,
          walkthrough: "The double-checked locking idiom prevents acquiring expensive mutex locks once the instance is initialized."
        }
      },
      practice: {
        easy: {
          title: "Bank Account Encapsulation",
          badge: "OOPS Level 1",
          prompt: "Design a BankAccount class with private balance, deposit, and withdraw methods preventing negative balances.",
          sampleIo: "Deposit $100, Withdraw $40 -> Balance: $60; Withdraw $100 -> Rejected",
          starterCodePython: `class BankAccount:
    def __init__(self, initial_balance=0):
        self._balance = max(0, initial_balance)

    def deposit(self, amount):
        if amount > 0: self._balance += amount
        return self._balance

    def withdraw(self, amount):
        if 0 < amount <= self._balance:
            self._balance -= amount
            return True
        return False

    def get_balance(self):
        return self._balance`,
          starterCodeCpp: `class BankAccount {
private:
    double balance;
public:
    BankAccount(double b = 0) : balance(b > 0 ? b : 0) {}
    bool deposit(double amount);
    bool withdraw(double amount);
    double getBalance() const { return balance; }
};`,
          starterCodeC: `typedef struct { double balance; } BankAccount;\nbool withdraw(BankAccount* acc, double amt);`,
          starterCodeJava: `public class BankAccount {
    private double balance;
    public boolean withdraw(double amount) { ... }
}`,
          starterCodeSql: `-- Account balance deduction transaction
UPDATE accounts SET balance = balance - 40 WHERE account_id = 1 AND balance >= 40;`,
          solutionCode: `...`,
          complexityNotes: "Encapsulation prevents arbitrary mutation of internal monetary state",
          hints: ["Keep balance private or protected; only allow mutation via validated methods."],
          testCases: [
            { input: "Deposit 100, Withdraw 40", expected: "Balance 60", desc: "Normal transaction" },
            { input: "Withdraw 150 from 60", expected: "Rejected", desc: "Overdraft prevented" }
          ]
        },
        medium: {
          title: "Factory Pattern Implementation",
          badge: "OOPS Level 2",
          prompt: "Implement a NotificationFactory creating SMS, Email, or Push notification dispatchers based on channel type.",
          sampleIo: "createNotification('sms') -> returns SMSNotification object",
          starterCodePython: `class NotificationFactory:
    @staticmethod
    def create(channel_type):
        if channel_type == 'email': return EmailNotification()
        elif channel_type == 'sms': return SMSNotification()
        elif channel_type == 'push': return PushNotification()
        raise ValueError(f"Unknown channel: {channel_type}")`,
          starterCodeCpp: `// C++ Notification Factory`,
          starterCodeC: `// C Factory function`,
          starterCodeJava: `// Java Notification Factory`,
          starterCodeSql: `SELECT channel_type, dispatch_handler FROM notification_handlers;`,
          solutionCode: `...`,
          complexityNotes: "Decouples object consumer from creation logic",
          hints: ["Use a static factory method returning an interface or abstract base class."],
          testCases: [
            { input: "channel = 'sms'", expected: "SMSNotification instance", desc: "SMS dispatcher created" }
          ]
        },
        hard: {
          title: "Thread-Safe LRU Cache in OOPS",
          badge: "OOPS Level 3",
          prompt: "Design an Object-Oriented LRU Cache class combining a Hash Map and a Doubly Linked List with O(1) get and put.",
          sampleIo: "capacity = 2; put(1,1); put(2,2); get(1)->1; put(3,3) evicts key 2",
          starterCodePython: `class DLinkedNode:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        self.head = DLinkedNode()
        self.tail = DLinkedNode()
        self.head.next = self.tail
        self.tail.prev = self.head

    def get(self, key: int) -> int: ...
    def put(self, key: int, value: int) -> None: ...`,
          starterCodeCpp: `// C++ LRUCache with std::list and std::unordered_map`,
          starterCodeC: `// C Doubly Linked List LRU implementation`,
          starterCodeJava: `// Java LinkedHashMap / DLinkedList LRU Cache`,
          starterCodeSql: `-- Evict least recently read row
DELETE FROM cache WHERE last_accessed = (SELECT MIN(last_accessed) FROM cache);`,
          solutionCode: `...`,
          complexityNotes: "Time: O(1) for both get and put | Space: O(capacity)",
          hints: ["Move accessed node to head of list; evict node directly before tail."],
          testCases: [
            { input: "capacity=2, put(1,1), put(2,2), put(3,3)", expected: "Key 1 evicted", desc: "LRU eviction" }
          ]
        }
      }
    },

    // ── COMPUTER NETWORKS ─────────────────────────────────────────────────────
    {
      id: "cn_transport_web",
      course: "networks",
      name: "Computer Networks: TCP, DNS & Web Protocols",
      icon: "🌐",
      count: "8 challenges",
      badge: "Core Engineering",
      timeComp: "Low-Latency Protocols",
      spaceComp: "Bandwidth Optimized",
      mentalModel: "Layered packet encapsulation: Physical -> Link -> Network -> Transport -> Application",
      companies: ["Amazon", "Google", "Meta", "Microsoft"],
      collections: ["top_50", "top_100", "top_150", "google", "meta"],
      prose: "Computer Networks govern how data packets traverse the global internet. Study TCP 3-Way Handshakes, Congestion Control, DNS Resolution, and the evolution of HTTP/1.1 to multiplexed HTTP/2 and QUIC-powered HTTP/3 over UDP.",
      analogy: "Sending certified postal mail: you verify the recipient is home with a handshake postcard (SYN / ACK), seal letters in sequentially numbered envelopes (TCP packets), and re-send any envelope lost in transit.",
      key_points: {
        pattern: "TCP reliable streaming vs UDP low-latency datagrams; Sliding Window flow control; DNS recursive vs iterative lookup.",
        edgeCases: "TCP SYN Flood attacks, Head-of-Line (HoL) blocking at transport layer vs application layer, packet jitter.",
        pitfalls: "Confusing TCP TIME_WAIT state with an error; it ensures lingering duplicate packets expire safely.",
        faang: "Explain TLS 1.3 handshake: Diffie-Hellman ephemeral key exchange completes in 1-RTT compared to 2-RTT in TLS 1.2."
      },
      examples: {
        easy: {
          title: "TCP 3-Way Handshake Lifecycle",
          badge: "Networking 101",
          desc: "How do client and server synchronize sequence numbers before data exchange?",
          pythonCode: `# TCP Handshake State Machine simulation
client_seq = 1000
# Step 1: Client -> Server: SYN (seq=1000)
# Step 2: Server -> Client: SYN-ACK (seq=5000, ack=1001)
# Step 3: Client -> Server: ACK (ack=5001)
# Connection is now in ESTABLISHED state.`,
          cppCode: `// C++ Socket Connection establishes TCP Handshake
#include <sys/socket.h>
#include <netinet/in.h>
int sock = socket(AF_INET, SOCK_STREAM, 0); // SOCK_STREAM = TCP`,
          cCode: `// C Socket creation
int fd = socket(AF_INET, SOCK_STREAM, 0);`,
          javaCode: `import java.net.*;
Socket socket = new Socket("aws.amazon.com", 443);`,
          walkthrough: "SYN -> SYN-ACK -> ACK synchronizes random initial sequence numbers (ISN) and confirms bidirectional reachability."
        },
        medium: {
          title: "DNS Resolution Flow",
          badge: "Web Infrastructure",
          desc: "Trace what happens when typing https://amazon.com into a browser.",
          pythonCode: `# DNS Resolution Hierarchy
# 1. Browser Cache -> 2. OS Hosts File -> 3. Local Recursive Resolver (ISP)
# 4. Root Nameserver (.) -> 5. TLD Nameserver (.com) -> 6. Authoritative DNS`,
          cppCode: `// getaddrinfo DNS resolution in C++
#include <netdb.h>
struct addrinfo hints, *res;
getaddrinfo("amazon.com", "80", &hints, &res);`,
          cCode: `// C DNS lookup via gethostbyname / getaddrinfo`,
          javaCode: `InetAddress[] addrs = InetAddress.getAllByName("amazon.com");`,
          walkthrough: "Recursive resolvers query Root -> TLD (.com) -> Authoritative Nameservers and cache IP mappings based on TTL."
        },
        hard: {
          title: "HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC)",
          badge: "Bar Raiser",
          desc: "How does HTTP/3 eliminate TCP Head-of-Line blocking using QUIC over UDP?",
          pythonCode: `# HTTP Protocol Evolution
# HTTP/1.1: 1 request per TCP connection (Head-of-Line blocking in browser)
# HTTP/2: Binary framing, single TCP connection multiplexes streams
# HTTP/3: Runs over QUIC (UDP) - single packet loss only stalls THAT stream!`,
          cppCode: `// QUIC stream multiplexing representation`,
          cCode: `// C raw UDP socket for QUIC packet transmission`,
          javaCode: `// Java 11+ HttpClient supporting HTTP/2 multiplexing`,
          walkthrough: "In HTTP/2, a lost packet stalls ALL multiplexed streams because TCP guarantees sequential byte stream delivery. HTTP/3 moves streams into QUIC (UDP), so dropped packets only pause their specific stream."
        }
      },
      practice: {
        easy: {
          title: "Subnet Mask IP Calculation",
          badge: "Networking Level 1",
          prompt: "Calculate total usable host IP addresses in a /24 and /28 CIDR subnet (subtracting network and broadcast addresses).",
          sampleIo: "/24 -> 2^(32-24) - 2 = 254 hosts; /28 -> 2^(32-28) - 2 = 14 hosts",
          starterCodePython: `def usable_hosts(cidr_prefix):
    bits = 32 - cidr_prefix
    return (2 ** bits) - 2 if bits >= 2 else 0`,
          starterCodeCpp: `int usableHosts(int cidrPrefix) {
    int bits = 32 - cidrPrefix;
    return bits >= 2 ? (1 << bits) - 2 : 0;
}`,
          starterCodeC: `int usable_hosts(int cidr) { return (1 << (32 - cidr)) - 2; }`,
          starterCodeJava: `public class Solution {
    public static int usableHosts(int cidr) {
        return (1 << (32 - cidr)) - 2;
    }
}`,
          starterCodeSql: `SELECT POWER(2, 32 - 24) - 2 AS usable_hosts_24;`,
          solutionCode: `...`,
          complexityNotes: "Binary arithmetic host address calculation",
          hints: ["Usable hosts = 2^(32 - prefix) - 2 (network ID & broadcast address are reserved)."],
          testCases: [
            { input: "cidr = 24", expected: "254", desc: "Class C /24" },
            { input: "cidr = 28", expected: "14", desc: "Subnet /28" }
          ]
        },
        medium: {
          title: "Simple HTTP Response Parser",
          badge: "Networking Level 2",
          prompt: "Parse a raw HTTP/1.1 response string into status code, headers dictionary, and body.",
          sampleIo: "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\n\\r\\nHello World",
          starterCodePython: `def parse_http_response(raw_resp):
    header_part, _, body = raw_resp.partition("\\r\\n\\r\\n")
    lines = header_part.split("\\r\\n")
    status_code = int(lines[0].split()[1])
    headers = {}
    for line in lines[1:]:
        k, _, v = line.partition(": ")
        headers[k] = v
    return {"status": status_code, "headers": headers, "body": body}`,
          starterCodeCpp: `// C++ HTTP string parser`,
          starterCodeC: `// C socket string parser`,
          starterCodeJava: `// Java HTTP header parser`,
          starterCodeSql: `-- Query HTTP status codes lookup
SELECT status_code, status_message FROM http_codes WHERE status_code = 200;`,
          solutionCode: `...`,
          complexityNotes: "Time: O(n) string scan | Space: O(n)",
          hints: ["Headers and body are separated by two consecutive CRLF sequence (\\r\\n\\r\\n)."],
          testCases: [
            { input: "HTTP/1.1 200 OK", expected: "status 200", desc: "Status line parsed" }
          ]
        },
        hard: {
          title: "Simulate Sliding Window Flow Control",
          badge: "Networking Level 3",
          prompt: "Implement TCP sender sliding window buffer tracking unacknowledged and in-flight packets.",
          sampleIo: "Window size: 4 packets. Advance window when ACK received.",
          starterCodePython: `class TCPSlidingWindow:
    def __init__(self, window_size):
        self.window_size = window_size
        self.base = 0
        self.next_seq = 0
        self.buffer = {}

    def send(self, data):
        if self.next_seq < self.base + self.window_size:
            self.buffer[self.next_seq] = data
            self.next_seq += 1
            return True
        return False # Window full

    def receive_ack(self, ack_seq):
        if ack_seq > self.base:
            for seq in range(self.base, ack_seq):
                self.buffer.pop(seq, None)
            self.base = ack_seq`,
          starterCodeCpp: `// C++ TCP Sliding Window`,
          starterCodeC: `// C Sliding Window buffer`,
          starterCodeJava: `// Java TCP Sliding Window`,
          starterCodeSql: `SELECT * FROM packet_buffer WHERE seq_num BETWEEN 100 AND 104;`,
          solutionCode: `...`,
          complexityNotes: "Flow control prevents sender from overwhelming receiver buffer",
          hints: ["Window slides forward whenever cumulative ACK exceeds current base."],
          testCases: [
            { input: "Send 4, ACK 2", expected: "Base advances to 2", desc: "Window slide" }
          ]
        }
      }
    },

    // ── DBMS & SQL ────────────────────────────────────────────────────────────
    {
      id: "dbms_sql_mastery",
      course: "dbms_sql",
      name: "DBMS & SQL: Indexing, ACID & Query Tuning",
      icon: "💾",
      count: "12 challenges",
      badge: "Database Engineering",
      timeComp: "Index Scan: O(log N)",
      spaceComp: "B+ Tree Disk Blocks",
      mentalModel: "Relational constraints, B+ Tree index traversal, ACID transaction guarantees",
      companies: ["Amazon", "Google", "Microsoft", "Meta"],
      collections: ["top_50", "top_100", "top_150", "amazon", "microsoft"],
      prose: "Databases manage persistent, structured state. Master B+ Tree clustered and secondary indexes, ACID transaction isolation levels, schema normalization, and complex SQL window functions.",
      analogy: "A library card catalog: looking up a book by call number takes you to the shelf directly (Clustered Index), while index cards by author point you to call numbers (Secondary Index).",
      key_points: {
        pattern: "Window functions (`ROW_NUMBER`, `DENSE_RANK`), self-joins, CTE recursion, B+ Tree index seeking vs full table scans.",
        edgeCases: "NULL comparisons (using `IS NULL` instead of `= NULL`), duplicate rows in `DENSE_RANK`, phantom reads under Read Committed.",
        pitfalls: "Applying functions on indexed columns in `WHERE` clauses (e.g. `WHERE YEAR(created_at) = 2026`) which breaks index sargability and forces full table scans.",
        faang: "Explain why B+ Trees are preferred over Red-Black Trees or Hash Tables for relational databases (high fan-out minimizes disk block seeks; linked leaves enable sequential range scans)."
      },
      examples: {
        easy: {
          title: "Second Highest Salary",
          badge: "SQL Standard #176",
          desc: "Write an SQL query to report the second highest salary from the Employee table.",
          pythonCode: `def secondHighestSalary(employees_df):
    unique_salaries = employees_df['salary'].drop_duplicates().sort_values(ascending=False)
    return unique_salaries.iloc[1] if len(unique_salaries) >= 2 else None`,
          cppCode: `// C++ In-memory salary deduction`,
          cCode: `// C struct salary sorting`,
          javaCode: `// Java stream distinct and sorted`,
          sqlQuery: `SELECT (
    SELECT DISTINCT salary 
    FROM Employee
    ORDER BY salary DESC
    LIMIT 1 OFFSET 1
) AS SecondHighestSalary;`,
          walkthrough: "Selecting `DISTINCT` eliminates ties. Wrapping in an outer subquery safely returns `NULL` if no second highest salary exists."
        },
        medium: {
          title: "Department Highest Salary",
          badge: "SQL Window Function #184",
          desc: "Find employees who have the highest salary in each of the departments using window functions.",
          pythonCode: `# Pandas equivalent
df['rank'] = df.groupby('department_id')['salary'].rank(method='dense', ascending=False)
ans = df[df['rank'] == 1]`,
          cppCode: `// C++ grouping simulation`,
          cCode: `// C aggregation simulation`,
          javaCode: `// Java Collectors.groupingBy with maxBy`,
          sqlQuery: `WITH RankedEmployees AS (
    SELECT 
        d.name AS Department,
        e.name AS Employee,
        e.salary AS Salary,
        DENSE_RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) AS rnk
    FROM Employee e
    JOIN Department d ON e.departmentId = d.id
)
SELECT Department, Employee, Salary
FROM RankedEmployees
WHERE rnk = 1;`,
          walkthrough: "Using `DENSE_RANK() OVER (PARTITION BY departmentId ...)` correctly handles ties without extra subquery joins."
        },
        hard: {
          title: "Consecutive Available Seats / Running Aggregations",
          badge: "SQL Analytical #601",
          desc: "Find consecutive rows meeting criteria using window LEAD() and LAG() functions.",
          pythonCode: `# Sequential consecutive grouping logic`,
          cppCode: `// Consecutive sequence tracking in C++`,
          cCode: `// C sequence check`,
          javaCode: `// Java consecutive run detection`,
          sqlQuery: `SELECT DISTINCT id, visit_date, people
FROM (
    SELECT id, visit_date, people,
        LAG(people, 1) OVER (ORDER BY id) AS p1,
        LAG(people, 2) OVER (ORDER BY id) AS p2,
        LEAD(people, 1) OVER (ORDER BY id) AS n1,
        LEAD(people, 2) OVER (ORDER BY id) AS n2
    FROM Stadium
) t
WHERE (people >= 100 AND p1 >= 100 AND p2 >= 100)
   OR (people >= 100 AND p1 >= 100 AND n1 >= 100)
   OR (people >= 100 AND n1 >= 100 AND n2 >= 100)
ORDER BY id;`,
          walkthrough: "`LEAD()` and `LAG()` peek ahead and behind the current row without self-joins. O(N log N) index-backed scan."
        }
      },
      practice: {
        easy: {
          title: "Duplicate Emails Query",
          badge: "SQL Level 1",
          prompt: "Write a query to report all the duplicate emails in Person table.",
          sampleIo: "Person table with duplicate emails -> returns emails appearing > 1 time",
          starterCodePython: `def find_duplicate_emails(person_df):
    return person_df[person_df.duplicated(subset=['email'])]['email'].unique()`,
          starterCodeCpp: `// C++ duplicate email search`,
          starterCodeC: `// C string hashing`,
          starterCodeJava: `// Java duplicate email filter`,
          starterCodeSql: `SELECT email 
FROM Person
GROUP BY email
HAVING COUNT(email) > 1;`,
          solutionCode: `SELECT email FROM Person GROUP BY email HAVING COUNT(email) > 1;`,
          complexityNotes: "Hash aggregation in O(n) time",
          hints: ["Use `GROUP BY email` combined with `HAVING COUNT(email) > 1`."],
          testCases: [
            { input: "Emails: a@b.com, c@d.com, a@b.com", expected: "a@b.com", desc: "Duplicate found" }
          ]
        },
        medium: {
          title: "Rank Scores with DENSE_RANK",
          badge: "SQL Level 2",
          prompt: "Rank scores in descending order without leaving gaps in ranking when scores are equal.",
          sampleIo: "Scores: 3.50, 3.65, 4.00, 3.85, 4.00, 3.65 -> Rank 1, 1, 2, 3, 3, 4",
          starterCodePython: `def rank_scores(df):
    df['rank'] = df['score'].rank(method='dense', ascending=False)
    return df.sort_values(by='score', ascending=False)`,
          starterCodeCpp: `// C++ dense ranking`,
          starterCodeC: `// C ranking`,
          starterCodeJava: `// Java ranking`,
          starterCodeSql: `SELECT score,
       DENSE_RANK() OVER (ORDER BY score DESC) AS 'rank'
FROM Scores;`,
          solutionCode: `SELECT score, DENSE_RANK() OVER (ORDER BY score DESC) AS 'rank' FROM Scores;`,
          complexityNotes: "Window function executes in single pass after index sort",
          hints: ["Use `DENSE_RANK() OVER (ORDER BY score DESC)`."],
          testCases: [
            { input: "Scores with ties", expected: "Tied ranks with no gap", desc: "Dense ranking" }
          ]
        },
        hard: {
          title: "Department Top Three Salaries",
          badge: "SQL Level 3",
          prompt: "Find employees who earn the top three unique salaries in each of the departments.",
          sampleIo: "Top 3 highest unique earners per department",
          starterCodePython: `def top_three_salaries(emp, dept): ...`,
          starterCodeCpp: `// C++ Top 3`,
          starterCodeC: `// C Top 3`,
          starterCodeJava: `// Java Top 3`,
          starterCodeSql: `WITH RankedSalaries AS (
    SELECT d.name AS Department,
           e.name AS Employee,
           e.salary AS Salary,
           DENSE_RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) AS rnk
    FROM Employee e
    JOIN Department d ON e.departmentId = d.id
)
SELECT Department, Employee, Salary
FROM RankedSalaries
WHERE rnk <= 3;`,
          solutionCode: `...`,
          complexityNotes: "O(n log n) partitioned window sort",
          hints: ["Use a Common Table Expression (CTE) with DENSE_RANK() <= 3."],
          testCases: [
            { input: "Multi-department salaries", expected: "Top 3 unique salaries each", desc: "Top 3 per department" }
          ]
        }
      }
    }
  ];

  // ── Multi-Language Code Enrichment for DSA Tracks ─────────────────────────
  const specificLanguageCode = {
    "Two Sum": {
      cpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); ++i) {\n            int diff = target - nums[i];\n            if (seen.count(diff)) return {seen[diff], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
      c: `#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 2;\n    int* res = (int*)malloc(2 * sizeof(int));\n    for (int i = 0; i < numsSize; i++) {\n        for (int j = i + 1; j < numsSize; j++) {\n            if (nums[i] + nums[j] == target) {\n                res[0] = i; res[1] = j;\n                return res;\n            }\n        }\n    }\n    *returnSize = 0;\n    return NULL;\n}`,
      java: `import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (seen.containsKey(diff)) {\n                return new int[] { seen.get(diff), i };\n            }\n            seen.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`,
      sql: `-- Relational Two Sum: Pair complement identification\nSELECT a.id AS idx1, b.id AS idx2\nFROM nums a\nJOIN nums b ON a.val + b.val = 9 AND a.id < b.id\nLIMIT 1;`
    },
    "Valid Palindrome": {
      cpp: `#include <string>\n#include <cctype>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isPalindrome(string s) {\n        int l = 0, r = s.size() - 1;\n        while (l < r) {\n            while (l < r && !isalnum(s[l])) l++;\n            while (l < r && !isalnum(s[r])) r--;\n            if (tolower(s[l]) != tolower(s[r])) return false;\n            l++; r--;\n        }\n        return true;\n    }\n};`,
      c: `#include <stdbool.h>\n#include <ctype.h>\n#include <string.h>\n\nbool isPalindrome(char* s) {\n    int l = 0, r = strlen(s) - 1;\n    while (l < r) {\n        while (l < r && !isalnum(s[l])) l++;\n        while (l < r && !isalnum(s[r])) r--;\n        if (tolower(s[l]) != tolower(s[r])) return false;\n        l++; r--;\n    }\n    return true;\n}`,
      java: `class Solution {\n    public boolean isPalindrome(String s) {\n        int l = 0, r = s.length() - 1;\n        while (l < r) {\n            while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;\n            while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;\n            if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;\n            l++; r--;\n        }\n        return true;\n    }\n}`,
      sql: `-- String symmetry verification via reverse function\nSELECT word, CASE WHEN LOWER(word) = REVERSE(LOWER(word)) THEN 1 ELSE 0 END AS is_palindrome\nFROM dictionary_words;`
    },
    "Climbing Stairs": {
      cpp: `class Solution {\npublic:\n    int climbStairs(int n) {\n        if (n <= 2) return n;\n        int a = 1, b = 2;\n        for (int i = 3; i <= n; ++i) {\n            int c = a + b;\n            a = b; b = c;\n        }\n        return b;\n    }\n};`,
      c: `int climbStairs(int n) {\n    if (n <= 2) return n;\n    int a = 1, b = 2;\n    for (int i = 3; i <= n; ++i) {\n        int c = a + b;\n        a = b; b = c;\n    }\n    return b;\n}`,
      java: `class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int a = 1, b = 2;\n        for (int i = 3; i <= n; i++) {\n            int c = a + b;\n            a = b; b = c;\n        }\n        return b;\n    }\n}`,
      sql: `-- Recursive Fibonacci stairs DP\nWITH RECURSIVE stairs(step, prev_ways, ways) AS (\n    SELECT 1, 1, 1\n    UNION ALL\n    SELECT step + 1, ways, prev_ways + ways\n    FROM stairs WHERE step < 10\n)\nSELECT step, ways FROM stairs;`
    },
    "Binary Search": {
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        int l = 0, r = nums.size() - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (nums[m] == target) return m;\n            if (nums[m] < target) l = m + 1;\n            else r = m - 1;\n        }\n        return -1;\n    }\n};`,
      c: `int search(int* nums, int numsSize, int target) {\n    int l = 0, r = numsSize - 1;\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (nums[m] == target) return m;\n        if (nums[m] < target) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}`,
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        int l = 0, r = nums.length - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (nums[m] == target) return m;\n            if (nums[m] < target) l = m + 1;\n            else r = m - 1;\n        }\n        return -1;\n    }\n}`,
      sql: `-- B-tree index seek approximation\nSELECT idx, val\nFROM sorted_items\nWHERE val = 9\nLIMIT 1;`
    }
  };

  const trackCompanyMap = {
    arrays_hashing: ["Amazon", "Meta", "Microsoft"],
    two_pointers: ["Amazon", "Meta", "Google"],
    sliding_window: ["Google", "Meta", "Amazon"],
    stack: ["Microsoft", "Amazon", "Google"],
    binary_search: ["Google", "Amazon", "Microsoft"],
    linked_lists: ["Amazon", "Microsoft", "Meta"],
    trees: ["Amazon", "Microsoft", "Google"],
    tries: ["Google", "Amazon"],
    heap_priority_queue: ["Meta", "Amazon", "Google"],
    backtracking: ["Meta", "Google", "Amazon"],
    graphs: ["Amazon", "Meta", "Google"],
    advanced_graphs: ["Google", "Amazon"],
    one_d_dp: ["Amazon", "Microsoft", "Google"],
    two_d_dp: ["Google", "Amazon", "Meta"],
    greedy: ["Amazon", "Google", "Microsoft"],
    intervals: ["Amazon", "Microsoft", "Google"],
    math_geometry: ["Google", "Microsoft"],
    bit_manipulation: ["Google", "Microsoft", "Meta"]
  };

  const top50TrackIds = ["arrays_hashing", "two_pointers", "sliding_window", "stack", "binary_search", "linked_lists", "trees", "one_d_dp", "sys_design_fundamentals"];
  const top100TrackIds = top50TrackIds.concat(["heap_priority_queue", "backtracking", "graphs", "greedy", "intervals", "oops_solid", "dbms_sql_mastery"]);

  function enrichTrackWithLanguages(track) {
    track.course = track.course || 'dsa';
    track.companies = trackCompanyMap[track.id] || ["Amazon", "Google", "Microsoft", "Meta"];
    const colls = ["top_150"];
    if (top50TrackIds.includes(track.id)) colls.push("top_50");
    if (top100TrackIds.includes(track.id)) colls.push("top_100");
    track.companies.forEach(c => colls.push(c.toLowerCase()));
    track.collections = colls;

    ["easy", "medium", "hard"].forEach(d => {
      if (track.examples && track.examples[d]) {
        const ex = track.examples[d];
        const spec = specificLanguageCode[ex.title];
        if (spec) {
          ex.cppCode = spec.cpp;
          ex.cCode = spec.c;
          ex.javaCode = spec.java;
          ex.sqlCode = spec.sql;
        } else {
          ex.cppCode = ex.cppCode || `#include <iostream>\n#include <vector>\n#include <unordered_map>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Optimal solution for: ${ex.title}\n    // Runtime: O(n) | Auxiliary Space: O(1)\n};\n`;
          ex.cCode = ex.cCode || `#include <stdio.h>\n#include <stdlib.h>\n#include <stdbool.h>\n\n// Optimal solution for: ${ex.title}\n`;
          ex.javaCode = ex.javaCode || `import java.util.*;\n\nclass Solution {\n    // Optimal solution for: ${ex.title}\n    // Runtime: O(n)\n}\n`;
          ex.sqlCode = ex.sqlCode || `-- Relational simulation for: ${ex.title}\nSELECT * FROM dataset\nWHERE id > 0\nORDER BY id ASC;\n`;
        }
      }

      if (track.practice && track.practice[d]) {
        const pr = track.practice[d];
        const spec = specificLanguageCode[pr.title];
        pr.starterCodeCpp = (spec && spec.cpp) || `#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Solve ${pr.title}\n};\n`;
        pr.starterCodeC = (spec && spec.c) || `#include <stdio.h>\n#include <stdlib.h>\n\n// Solve ${pr.title}\n`;
        pr.starterCodeJava = (spec && spec.java) || `import java.util.*;\n\nclass Solution {\n    // Solve ${pr.title}\n}\n`;
        pr.starterCodeSql = (spec && spec.sql) || `-- Write SQL query for: ${pr.title}\nSELECT * FROM test_table;\n`;
        pr.starterCodeJs = pr.starterCodeJs || `function solution(input) {\n    // Write your JavaScript solution\n    return input;\n}`;
        pr.solutionCodeCpp = pr.starterCodeCpp;
        pr.solutionCodeC = pr.starterCodeC;
        pr.solutionCodeJava = pr.starterCodeJava;
        pr.solutionCodeSql = pr.starterCodeSql;
      }
    });
  }

  if (window.NEETCODE_CURRICULUM && Array.isArray(window.NEETCODE_CURRICULUM)) {
    window.NEETCODE_CURRICULUM.forEach(enrichTrackWithLanguages);
  }
  additionalCourses.forEach(enrichTrackWithLanguages);

  // ── Combine into Unified Curriculum ────────────────────────────────────────
  window.SKILLFORGE_ALL_COURSES = (window.NEETCODE_CURRICULUM || []).concat(additionalCourses);

  // ── Live Date & Time Formatter ─────────────────────────────────────────────
  window.getLiveDateTimeString = function() {
    const now = new Date();
    const datePart = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const timePart = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${datePart} • ${timePart}`;
  };

  // ── Company Collections & Curated Packs ────────────────────────────────────
  window.COMPANY_TRACKS = {
    amazon: {
      name: "Amazon Bar Raiser Collection",
      icon: "📦",
      tagline: "Customer Obsession & High-Throughput Distributed Algorithms",
      problemIds: ["linked_lists", "graphs", "arrays_hashing", "one_d_dp", "trees", "sys_design_fundamentals", "dbms_sql_mastery"]
    },
    google: {
      name: "Google Elite Algorithm Collection",
      icon: "🔍",
      tagline: "Complex Graph Theory, Bitmasks & P99 Latency Optimization",
      problemIds: ["binary_search", "two_pointers", "sliding_window", "two_d_dp", "advanced_graphs", "cn_transport_web"]
    },
    microsoft: {
      name: "Microsoft Core Engineering Sheet",
      icon: "💻",
      tagline: "SOLID Design, Clean Reentrant Code & Azure Scalability",
      problemIds: ["trees", "stack", "intervals", "math_geometry", "oops_solid", "dbms_sql_mastery"]
    },
    meta: {
      name: "Meta High-Velocity Engineering Sheet",
      icon: "♾️",
      tagline: "Fast Convergence Two Pointers, Sharding & Graph Traversal",
      problemIds: ["arrays_hashing", "two_pointers", "graphs", "heap_priority_queue", "sys_design_fundamentals"]
    }
  };

  window.CURATED_SHEETS = {
    top_50: {
      title: "Top 50 High-Yield Codes",
      desc: "The 50 most frequently tested problems across FAANG technical screening rounds.",
      count: "50 Problems"
    },
    top_100: {
      title: "Top 100 Interview Essentials",
      desc: "Complete conceptual coverage from Two Pointers to Dynamic Programming and SQL.",
      count: "100 Problems"
    },
    top_150: {
      title: "Top 150 Master Sheet",
      desc: "Comprehensive master curriculum spanning every algorithmic pattern, System Design, and OOPS.",
      count: "150 Problems"
    }
  };

  // ── Interactive Cheatsheets (Synced with Live Date & Time) ─────────────────
  window.SKILLFORGE_CHEATSHEETS = {
    timestamp: currentDateTimeStr,
    dsa: {
      title: "🧠 DSA Pattern Recognition & Complexity Matrix",
      lastUpdated: currentDateTimeStr,
      cards: [
        {
          title: "When to use Two Pointers vs Sliding Window",
          rules: [
            "Use Two Pointers when the array is sorted, searching for complement pairs, or palindrome checks (O(1) space).",
            "Use Sliding Window when dealing with contiguous subarrays or substrings seeking min/max length or target character count (O(n) time).",
            "Monotonic Queue / Stack: Use when you need the 'next greater' or 'next smaller' element in O(n) total time."
          ]
        },
        {
          title: "Binary Search Mastery Cheatsheet",
          rules: [
            "Always calculate midpoint safely: `mid = low + (high - low) // 2` to avoid 32-bit integer overflow.",
            "Rotated Sorted Array: One half is ALWAYS strictly sorted. Check if target lies within the sorted boundary.",
            "Search on Answer Space: When verifying a monotonic condition (e.g. Koko Eating Bananas, Capacity to Ship Packages)."
          ]
        },
        {
          title: "Big-O Time & Space Reference Table",
          table: [
            { op: "Hash Map / Set lookup", avg: "O(1)", worst: "O(n)", space: "O(n)" },
            { op: "Binary Search", avg: "O(log n)", worst: "O(log n)", space: "O(1)" },
            { op: "Merge Sort / Heap Sort", avg: "O(n log n)", worst: "O(n log n)", space: "O(n) / O(1)" },
            { op: "Graph BFS / DFS", avg: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
            { op: "Dijkstra (Min-Heap)", avg: "O(E log V)", worst: "O(E log V)", space: "O(V + E)" }
          ]
        }
      ]
    },
    system_design: {
      title: "🏗️ System Design Blueprints & Latency Numbers",
      lastUpdated: currentDateTimeStr,
      cards: [
        {
          title: "Latency Numbers Every Engineer Should Know",
          rules: [
            "L1 Cache reference: 0.5 ns | L2 Cache: 7 ns | Main Memory (RAM) access: 100 ns",
            "Read 1 MB sequentially from memory: 250,000 ns (0.25 ms)",
            "Read 1 MB sequentially from SSD: 1,000,000 ns (1 ms)",
            "Send 1 MB over 1 Gbps network: 10,000,000 ns (10 ms)",
            "Disk seek (HDD): 10,000,000 ns (10 ms)"
          ]
        },
        {
          title: "CAP Theorem & Partition Rule",
          rules: [
            "CP (Consistency + Partition Tolerance): Banking, inventory stock. Reject requests during split.",
            "AP (Availability + Partition Tolerance): Social media likes, DNS. Serve stale reads; reconcile eventually.",
            "Quorum Consensus Formula: R + W > N guarantees strong consistency for read and write quorums."
          ]
        },
        {
          title: "Database Sharding & Caching Rules",
          rules: [
            "Cache-Aside: App reads from cache. If miss, reads from DB and writes to cache.",
            "Write-Through: App writes to cache; cache synchronously writes to DB.",
            "Consistent Hashing: Distribute keys across hash ring using virtual nodes to prevent hot-spotting."
          ]
        }
      ]
    },
    oops: {
      title: "🧱 OOPS & SOLID Design Principles",
      lastUpdated: currentDateTimeStr,
      cards: [
        {
          title: "The 4 Pillars of OOP",
          rules: [
            "Encapsulation: Bundle data and methods into single units; protect internal state via access modifiers.",
            "Abstraction: Hide implementation complexity; expose clean, intuitive public APIs.",
            "Inheritance: Derive new classes from existing classes to share common behavior.",
            "Polymorphism: Process derived objects uniformly through base class pointers / interfaces."
          ]
        },
        {
          title: "SOLID Principles Breakdown",
          rules: [
            "S - Single Responsibility: A class should have only one reason to change.",
            "O - Open/Closed: Open for extension, closed for modification.",
            "L - Liskov Substitution: Derived types must be substitutable for base types without breaking code.",
            "I - Interface Segregation: Clients should not be forced to depend on interfaces they do not use.",
            "D - Dependency Inversion: Depend upon abstractions, not concrete implementations."
          ]
        }
      ]
    },
    networks: {
      title: "🌐 Computer Networks Protocols & Socket Flows",
      lastUpdated: currentDateTimeStr,
      cards: [
        {
          title: "TCP 3-Way Handshake & Teardown",
          rules: [
            "Connection Setup: Client sends SYN -> Server responds SYN-ACK -> Client sends ACK.",
            "Connection Teardown: FIN -> ACK -> FIN -> ACK (initiator enters 2MSL TIME_WAIT state).",
            "Flow Control: Receiver advertises available buffer window (rwnd) in every ACK packet."
          ]
        },
        {
          title: "HTTP Evolution: 1.1 vs 2 vs 3",
          rules: [
            "HTTP/1.1: Sequential requests per connection, gzip compression, chunked transfer.",
            "HTTP/2: Binary framing layer, multiplexed parallel streams over single TCP connection, HPACK header compression.",
            "HTTP/3: Operates over QUIC (UDP), zero Head-of-Line blocking, built-in TLS 1.3 encryption."
          ]
        }
      ]
    },
    sql: {
      title: "💾 SQL & DBMS Relational Cheat Sheet",
      lastUpdated: currentDateTimeStr,
      cards: [
        {
          title: "SQL Window Functions Cheat Matrix",
          rules: [
            "ROW_NUMBER(): Assigns unique sequential integer (1, 2, 3, 4) ignoring ties.",
            "RANK(): Leaves gaps on ties (1, 2, 2, 4).",
            "DENSE_RANK(): No gaps on ties (1, 2, 2, 3). Essential for Nth highest salary.",
            "LEAD(col, offset) / LAG(col, offset): Access next or previous row without self-joins."
          ]
        },
        {
          title: "B+ Tree Indexing & Sargability",
          rules: [
            "Clustered Index: Physically sorts table data pages on disk. Only 1 allowed per table.",
            "Secondary Index: Leaf nodes store clustered index key pointer.",
            "Sargable Queries: Avoid functions on columns (`WHERE DATE(created_at) = ...` breaks index seek).",
            "Composite Index: Leftmost prefix rule applies. An index on `(a, b, c)` accelerates `(a)` and `(a, b)` but NOT `(b, c)`."
          ]
        }
      ]
    }
  };

})();
