# Elasticsearch

## What is it?
A distributed, full-text search and analytics engine built on top of Apache Lucene. Used when you need powerful search capabilities beyond what a relational DB can offer — fuzzy matching, relevance scoring, faceted search, and log analytics.

---

## Core Concepts

| Concept | Relational DB equivalent | Description |
|---|---|---|
| **Index** | Table | A collection of documents |
| **Document** | Row | A JSON object stored in an index |
| **Field** | Column | A key-value pair inside a document |
| **Shard** | Partition | A subset of an index (for distribution) |
| **Replica** | DB replica | A copy of a shard (for HA + read scaling) |

> Elasticsearch is **schemaless by default** but supports explicit **mappings** (like a schema) for type control and performance.

---

## How It Works (Inverted Index)
Traditional DBs scan rows. Elasticsearch builds an **inverted index**:

```
Document 1: "Elasticsearch is fast"
Document 2: "Elasticsearch is scalable"

Inverted Index:
  "fast"        → [Doc 1]
  "scalable"    → [Doc 2]
  "elasticsearch" → [Doc 1, Doc 2]
```

Lookups are O(1) by term — this is why full-text search is blazing fast.

---

## Sharding & Replication

```
Index: "products" (3 primary shards, 1 replica each)

Node 1: Shard 0 (primary), Shard 1 (replica)
Node 2: Shard 1 (primary), Shard 2 (replica)
Node 3: Shard 2 (primary), Shard 0 (replica)
```

- **Shards** = horizontal scaling (more shards → more nodes can share the load)
- **Replicas** = fault tolerance + read throughput
- ⚠️ Shard count is **fixed at index creation** — plan ahead

---

## Query Types

### Full-text search (analyzed, relevance-scored)
```json
GET /products/_search
{
  "query": {
    "match": {
      "description": "wireless noise cancelling headphones"
    }
  }
}
```

### Exact match (keyword, not analyzed)
```json
{
  "query": {
    "term": { "status": "active" }
  }
}
```

### Fuzzy search (typo-tolerant)
```json
{
  "query": {
    "fuzzy": {
      "name": { "value": "elasticsearh", "fuzziness": "AUTO" }
    }
  }
}
```

### Bool query (combine conditions)
```json
{
  "query": {
    "bool": {
      "must":   [ { "match": { "title": "laptop" } } ],
      "filter": [ { "term": { "in_stock": true } } ],
      "must_not": [ { "term": { "category": "refurbished" } } ]
    }
  }
}
```
> `must` = affects score. `filter` = yes/no, no scoring (faster — use for structured filters).

---

## Relevance Scoring
Elasticsearch scores results using **BM25** (default):
- Higher score = more relevant = ranked higher
- Factors: term frequency, inverse document frequency, field length
- You can **boost** fields: title matches count more than body matches

---

## Aggregations (Analytics)
Like `GROUP BY` in SQL — used for faceted search, dashboards.

```json
GET /orders/_search
{
  "aggs": {
    "by_status": {
      "terms": { "field": "status" }
    }
  }
}

Response:
{
  "aggregations": {
    "by_status": {
      "buckets": [
        { "key": "shipped", "doc_count": 1200 },
        { "key": "pending", "doc_count": 340 }
      ]
    }
  }
}
```

---

## Common Patterns in System Design

### Pattern 1: DB + Elasticsearch (dual write)
```
Write → Primary DB (PostgreSQL) → Sync to Elasticsearch
Read (search) → Elasticsearch
Read (by ID) → PostgreSQL
```
- Use a **CDC pipeline** (Debezium) or application-level dual write
- Elasticsearch is the **search layer**, not the source of truth

### Pattern 2: Log Analytics (ELK Stack)
```
App → Logstash/Filebeat → Elasticsearch → Kibana (dashboards)
```

### Pattern 3: Autocomplete
- Use **edge n-gram tokenizer** on index
- Query with `match_phrase_prefix` or `completion` suggester

---

## What Elasticsearch is NOT good for
- ❌ Source of truth (no ACID transactions)
- ❌ Frequent updates (re-indexing is expensive)
- ❌ Complex joins (it's document-based, not relational)
- ❌ Strong consistency requirements

---

## Key Operational Concerns
- **Mapping explosion** — too many dynamic fields bloat the index; use explicit mappings
- **Hot shards** — if one shard gets all writes (e.g. time-based index), use index rollover
- **Heap memory** — ES is JVM-based; give it ~50% of RAM, never exceed 32GB heap
- **Refresh interval** — writes aren't immediately searchable (default 1s delay); tunable

---

## Failure Modes & Mitigations

| Failure | Impact | Mitigation |
|---|---|---|
| **Node goes down** | Shards on that node unavailable | Replicas take over automatically; ensure replica count ≥ 1 |
| **Split brain** (network partition between master-eligible nodes) | Two nodes both think they're master → data inconsistency | Set `minimum_master_nodes = (n/2)+1`; use dedicated master nodes |
| **Shard imbalance / hot shard** | One node overwhelmed | Design partition keys carefully; use index rollover for time-based data |
| **Index corruption** | Data loss or unreadable index | Snapshots to S3/GCS on a schedule; restore from snapshot |
| **ES out of sync with DB** | Stale or missing search results | ES is not source of truth — fallback to DB query; replay CDC from Kafka offset to re-sync |
| **Heap pressure / OOM** | Node crash | Cap heap at 32GB; use circuit breakers; offload aggregations to smaller time windows |

---

## Interview Talking Points
- ES is a **search layer**, not a DB — always pair with a primary store
- Explain the **inverted index** — it's the core reason ES is fast for full-text
- Use `filter` over `must` for structured conditions — no scoring overhead
- **Shards are immutable in count** — emphasize upfront capacity planning
- For autocomplete → **edge n-gram** or **completion suggester**
- For near-real-time log search → ELK stack
- Sync strategy matters: **CDC (Debezium)** is more reliable than dual-write in application code
