# Database Indexing — External Indexes

## Quick Recap: Why External Indexes?

Postgres is a great general-purpose DB but its built-in indexes hit limits:

| Need | Postgres Built-in | Problem | Better Tool |
|---|---|---|---|
| Full-text search | `tsvector` + `GIN` index | No fuzzy match, no relevance scoring, slow at scale | **Elasticsearch** |
| Geospatial queries | `PostGIS` extension | Fine for simple queries, but complex geo at scale is slow | **PostGIS** (still Postgres, but a dedicated instance) |

> The pattern is always the same: **Postgres = source of truth. External index = optimized read layer.**

---

## The Core Architecture Pattern

```mermaid
flowchart LR
    A[Client App] -->|writes| B[(PostgreSQL\nSource of Truth)]
    B -->|CDC stream| C[Debezium\nCDC Connector]
    C -->|publishes events| D[Kafka\nMessage Bus]
    D -->|consumes| E[Elasticsearch\nFull-Text Index]
    D -->|consumes| F[PostGIS\nGeo Index]

    A -->|full-text query| E
    A -->|geo query| F
    E -->|returns IDs| A
    F -->|returns IDs| A
    A -->|fetch full record by ID| B
```

**Key insight:** External indexes return **IDs only** — your app then fetches the full record from Postgres using those IDs.

---

## How CDC Works (The Plumbing)

Postgres writes every insert/update/delete to a **Write-Ahead Log (WAL)** — this is how it guarantees durability. CDC tools like **Debezium** tap into this log.

```mermaid
flowchart TD
    A[App writes to Postgres] --> B[Postgres WAL\nWrite-Ahead Log]
    B --> C[Debezium\nreads WAL like a replica]
    C --> D{Event Type?}
    D -->|INSERT| E[Publish created event to Kafka]
    D -->|UPDATE| F[Publish updated event to Kafka]
    D -->|DELETE| G[Publish deleted event to Kafka]
    E --> H[Consumer indexes doc in Elasticsearch]
    F --> I[Consumer updates doc in Elasticsearch]
    G --> J[Consumer deletes doc in Elasticsearch]
```

- Debezium acts like a **Postgres replica** — it reads the WAL without touching your main DB queries
- Events flow through **Kafka** so multiple consumers (ES, PostGIS, Redis, etc.) can independently consume them
- If a consumer goes down, it **replays from Kafka offset** — no data loss

---

## Full-Text Search Flow (Elasticsearch)

```mermaid
sequenceDiagram
    participant App
    participant Elasticsearch
    participant Postgres

    Note over App: User searches "wireless headphones"

    App->>Elasticsearch: GET /products/_search { "match": { "description": "wireless headphones" } }
    Elasticsearch-->>App: [ { id: 42, score: 1.8 }, { id: 17, score: 1.2 } ]

    Note over App: Got ranked IDs back

    App->>Postgres: SELECT * FROM products WHERE id IN (42, 17)
    Postgres-->>App: Full product records

    Note over App: Merge scores + records, return to user
```

**Why not just use Postgres full-text?**
- Postgres `tsvector` can't do **fuzzy matching** (typos)
- No **relevance ranking** (BM25 scoring)
- Performance degrades on large tables
- No **aggregations** for faceted search (filter by brand, price range simultaneously)

---

## Geospatial Flow (PostGIS)

PostGIS is a **Postgres extension** — it adds geo data types and spatial indexes (R-Tree / GiST index) to Postgres. For complex geo workloads, you run it as a **dedicated Postgres instance** separate from your main OLTP DB.

```mermaid
sequenceDiagram
    participant App
    participant PostGIS
    participant MainPostgres

    Note over App: User searches "restaurants within 2km of me"

    App->>PostGIS: SELECT id FROM locations WHERE ST_DWithin(geom, ST_Point(-122.4, 37.7), 2000)
    PostGIS-->>App: [ id: 5, id: 9, id: 23 ]

    Note over App: Got nearby IDs

    App->>MainPostgres: SELECT * FROM restaurants WHERE id IN (5, 9, 23)
    MainPostgres-->>App: Full restaurant records
```

**PostGIS key functions:**
- `ST_DWithin` — within X meters
- `ST_Distance` — distance between two points
- `ST_Within` — point inside a polygon (e.g. delivery zone)
- `ST_Intersects` — two shapes overlap

---

## Putting It All Together — Combined Query Example

Imagine a food delivery app: *"Find sushi restaurants near me with 'spicy tuna' on the menu"*

```mermaid
flowchart TD
    A[User: sushi near me with spicy tuna] --> B[App Server]
    B --> C[PostGIS: restaurants within 3km]
    B --> D[Elasticsearch: menu items matching 'spicy tuna']
    C --> E[IDs: 5, 9, 23, 41]
    D --> F[IDs: 9, 23, 88]
    E --> G[Intersect IDs in App: 9, 23]
    F --> G
    G --> H[Postgres: SELECT * FROM restaurants WHERE id IN 9, 23]
    H --> I[Return results to user]
```

The app runs **both queries in parallel**, intersects the ID sets, then does one final Postgres lookup.

---

## Sync Strategies Compared

| Strategy | How | Pro | Con |
|---|---|---|---|
| **CDC (Debezium + Kafka)** | Tap Postgres WAL | Reliable, no app changes, replayable | Infra overhead |
| **Dual Write** | App writes to Postgres AND ES | Simple | Risk of partial failure (one write succeeds, other fails) |
| **Polling** | Cron job reads `updated_at > last_run` | Simple | Delay, misses deletes, DB load |
| **Outbox Pattern** | App writes to Postgres + outbox table; CDC picks up outbox | Transactionally safe dual-write | Slightly more complex schema |

> **Best practice:** CDC + Kafka for production. Outbox pattern if you can't use CDC directly.

---

## Interview Talking Points
- External indexes are **read optimizations** — Postgres stays the source of truth
- CDC taps the **WAL** — zero impact on your main DB performance
- Queries return **IDs**, not full records — always do a final Postgres lookup
- For combined queries (geo + text), run in **parallel** and intersect results in the app layer
- **Outbox pattern** solves dual-write consistency — worth mentioning
- PostGIS uses **GiST index** (R-Tree variant) — designed for spatial range queries
- Elasticsearch uses **inverted index** — designed for term lookups
