# Load Balancers

## What is it?
Distributes incoming traffic across multiple servers to ensure no single server is overwhelmed, improving availability and scalability.

---

## Layer 4 vs Layer 7

| | Layer 4 (Transport) | Layer 7 (Application) |
|---|---|---|
| **Operates on** | TCP/UDP packets | HTTP/HTTPS content |
| **Routing based on** | IP + Port | URL, headers, cookies, body |
| **Speed** | Faster (less inspection) | Slower (more inspection) |
| **Use cases** | WebSockets, raw TCP, low-latency | REST APIs, microservices, A/B testing |
| **Examples** | AWS NLB, HAProxy (TCP mode) | AWS ALB, Nginx, HAProxy (HTTP mode) |

> **Key insight:** WebSockets require L4 because the connection is upgraded from HTTP and then becomes a persistent TCP stream — L7 load balancers may break the persistent connection or not support the upgrade correctly.

---

## Load Balancing Algorithms

| Algorithm | How it works | Best for |
|---|---|---|
| **Round Robin** | Cycles through servers in order | Stateless, uniform servers |
| **Weighted Round Robin** | Like RR but some servers get more traffic | Servers with different capacities |
| **Least Connections** | Routes to server with fewest active connections | Long-lived connections (e.g. streaming) |
| **IP Hash** | Hashes client IP → same server every time | Sticky sessions without cookies |
| **Random** | Picks a server randomly | Simple, uniform workloads |

---

## Sticky Sessions (Session Affinity)
Routes the same client to the same server. Needed when session state is stored in-process (not externalized).

- **Cookie-based:** LB injects a cookie (e.g. `SERVERID`) to pin the client
- **IP hash-based:** deterministic but breaks behind NAT/proxies
- ⚠️ Sticky sessions reduce the effectiveness of load balancing — prefer **externalizing session state** (Redis) to avoid needing them.

---

## Health Checks
LBs periodically ping backend servers. If a server fails:
- Stops sending traffic to it
- Restarts sending after it recovers

Types: **active** (LB pings the server) vs **passive** (LB detects failures from real traffic).

---

## Common Patterns in System Design

### Horizontal Scaling Entry Point
```
Client → Load Balancer → [Server 1, Server 2, Server 3]
```

### Tiered Load Balancing
```
Client → Global LB (DNS/GeoDNS) → Regional LB → App Servers
```

### Internal Load Balancing (Service Mesh)
Between microservices — handled by sidecar proxies (e.g. Envoy in Istio).

---

## SSL Termination
L7 LBs can terminate SSL (decrypt HTTPS) so backend servers don't have to.
- **Pro:** Offloads CPU from app servers; LB can inspect content
- **Con:** Traffic between LB and servers is plain HTTP (mitigate with private network or re-encryption)

---

## Single Point of Failure
A lone LB is itself an SPOF. Solutions:
- **Active-Active:** Two LBs both serve traffic
- **Active-Passive:** One LB is hot standby; takes over via floating IP (e.g. keepalived + VRRP)

---

## Key Tools / Products

| Tool | Layer | Notes |
|---|---|---|
| **Nginx** | L7 (also L4) | Most common; highly configurable |
| **HAProxy** | L4 + L7 | High-performance; fine-grained control |
| **AWS ALB** | L7 | Native AWS; path/header routing |
| **AWS NLB** | L4 | Ultra-low latency; static IP support |
| **Envoy** | L7 | Service mesh; used in Istio/Kubernetes |

---

## Interview Talking Points
- Use **L4 for WebSockets**, gaming, or any non-HTTP protocol
- Use **L7 for microservices** to route by path (`/api/users` → user-service)
- Avoid sticky sessions — externalize state to Redis instead
- Always mention **health checks** and **redundant LBs** to avoid SPOF
- SSL termination at the LB is standard, but flag the internal plaintext risk
