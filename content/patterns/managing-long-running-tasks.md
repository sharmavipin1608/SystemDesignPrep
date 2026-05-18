# Managing Long Running Tasks

## What is it?
Patterns for handling operations that take too long to complete in a single HTTP request — video transcoding, report generation, bulk imports, ML inference, email campaigns. The core idea: **accept the request immediately, process asynchronously, notify when done**.

---

## The Problem
```
Client → POST /transcode-video → Server processes 10min video...
                                 ...client times out after 30s ❌
```

---

## The Core Pattern — Async Job with Status Polling

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Queue
    participant Worker
    participant DB

    Client->>API: POST /jobs { videoUrl: "..." }
    API->>DB: INSERT job { id: "job_123", status: "pending" }
    API->>Queue: Enqueue job_123
    API-->>Client: 202 Accepted { jobId: "job_123" }

    Note over Worker: Picks up job from queue
    Queue->>Worker: job_123
    Worker->>DB: UPDATE job SET status="processing"
    Worker->>Worker: Process video...
    Worker->>DB: UPDATE job SET status="complete", resultUrl="..."

    Client->>API: GET /jobs/job_123
    API-->>Client: { status: "complete", resultUrl: "..." }
```

- Client gets `202 Accepted` immediately with a job ID
- Client polls `GET /jobs/{id}` to check status
- ✅ No timeouts, no blocking
- ✅ Client can check progress, display status bar

---

## Job Status Machine

```
PENDING → QUEUED → PROCESSING → COMPLETE
                             ↘ FAILED → (retry) → PROCESSING
                                      → DEAD (max retries exceeded)
```

Always persist status in DB — worker crashes are survivable.

---

## Queue Options

| Queue | Best for |
|---|---|
| **Kafka** | High throughput, durable, replayable, ordered |
| **SQS** | AWS-native, simple, at-least-once delivery |
| **RabbitMQ** | Complex routing, priority queues |
| **Redis (BullMQ)** | Simple jobs, same-infra, fast |
| **Celery + Redis/RabbitMQ** | Python ecosystem |

---

## Retry Strategy
Workers will fail. Always design for retries.

```mermaid
flowchart LR
    Queue -->|deliver| Worker
    Worker -->|success| Done[Mark Complete]
    Worker -->|fail| Retry{Retry count\n< max?}
    Retry -->|yes| Backoff[Wait: 2^n seconds\n+ jitter]
    Backoff --> Queue
    Retry -->|no| DLQ[Dead Letter Queue]
    DLQ --> Alert[Alert On-Call]
```

- **Exponential backoff with jitter** — `wait = 2^attempt + rand(0, 1)`
- **Max retries** (e.g. 3–5) before sending to Dead Letter Queue (DLQ)
- DLQ = holding area for failed jobs — inspect, fix, replay manually

---

## Idempotency for Workers
Jobs can be delivered more than once (at-least-once queues). Workers must be safe to run twice.

```java
public void processJob(String jobId) {
    Job job = db.findJob(jobId);

    // Idempotency check
    if (job.getStatus() == Status.COMPLETE) {
        return; // already processed — skip safely
    }

    // Atomic status transition — prevent double processing
    int updated = db.updateJobStatus(jobId, Status.PROCESSING, Status.QUEUED);
    if (updated == 0) {
        return; // another worker grabbed it first
    }

    // Do the actual work
    doWork(job);
    db.updateJobStatus(jobId, Status.COMPLETE, Status.PROCESSING);
}
```

---

## Progress Tracking
For long jobs, clients want progress updates — not just pending/complete.

### Option A — Polling with progress field
```json
GET /jobs/job_123
{
  "status": "processing",
  "progress": 67,
  "eta_seconds": 45
}
```

### Option B — WebSocket / SSE push
```mermaid
sequenceDiagram
    Client->>Server: Subscribe to job_123 updates (SSE/WS)
    Worker->>Redis: PUBLISH job:123 { progress: 30 }
    Redis-->>Server: event received
    Server-->>Client: { progress: 30 }
    Worker->>Redis: PUBLISH job:123 { progress: 67 }
    Server-->>Client: { progress: 67 }
    Worker->>Redis: PUBLISH job:123 { status: "complete" }
    Server-->>Client: { status: "complete", resultUrl: "..." }
```

---

## Worker Scaling

```mermaid
flowchart LR
    Queue -->|partition 0| W1[Worker 1]
    Queue -->|partition 1| W2[Worker 2]
    Queue -->|partition 2| W3[Worker 3]
    W1 & W2 & W3 --> DB[(DB)]
```

- Scale workers horizontally — add more consumers
- Kafka partitions = max parallelism ceiling (1 consumer per partition)
- Use **priority queues** for urgent jobs (paid users jump the queue)

---

## Failure Modes & Mitigations

| Failure | Impact | Mitigation |
|---|---|---|
| **Worker crashes mid-job** | Job stuck in "processing" | Heartbeat timeout — if no heartbeat in N seconds, reset to "queued" for retry |
| **Job delivered twice** | Duplicate processing | Idempotency check on job status before processing |
| **DLQ fills up** | Silent failures | Alert on DLQ size; build replay tooling |
| **Queue backlog grows** | Jobs delayed | Auto-scale workers; shed load with priority queues |
| **Result storage fails** | Job completes but result lost | Store result in blob storage (S3); store URL in DB separately from job completion |

---

## Interview Talking Points
- Always return **202 Accepted** with a job ID — never make the client wait
- Persist job state in DB — worker crashes must be recoverable
- **Idempotency** on workers is non-negotiable with at-least-once queues
- Mention **DLQ** — shows operational maturity
- For progress updates: polling is simple, SSE/WebSocket is better UX — pick based on requirements
- **Heartbeat timeout** to detect stuck jobs — interviewers rarely hear this
