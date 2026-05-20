# Probabilistic Data Structures

## What is it?
Data structures that trade **exact answers for massive memory savings**. They give approximate answers with a controllable error rate. Essential when you're dealing with billions of events and exact counting would be prohibitively expensive.

---

## Why They Matter
```
Exact count of unique visitors across 1B events:
→ Store every user ID → ~32GB RAM minimum

HyperLogLog approximate count:
→ ~1.5KB RAM, 99.2% accurate
```

---

## 1. Bloom Filter
**Question it answers:** "Have I seen this item before?"
**Answer type:** "Definitely NO" or "Probably YES"

### How it works
A bit array + multiple hash functions. On insert, set bits at hash positions. On lookup, check if all those bits are set.

```
Insert "alice@email.com":
  hash1("alice") = 3  → set bit 3
  hash2("alice") = 7  → set bit 7
  hash3("alice") = 12 → set bit 12

Bit array: 0 0 0 1 0 0 0 1 0 0 0 0 1 0 0 0

Lookup "bob@email.com":
  hash1("bob") = 3  → bit 3 set ✅
  hash2("bob") = 5  → bit 5 NOT set ❌
  → Definitely NOT in set

Lookup "alice@email.com":
  hash1 = 3 ✅, hash2 = 7 ✅, hash3 = 12 ✅
  → Probably in set ✅
```

- ✅ **False positives possible** — "probably yes" can be wrong
- ✅ **False negatives impossible** — "definitely no" is always correct
- ✅ O(1) insert and lookup
- ✅ Fixed memory regardless of dataset size
- ❌ Cannot delete items (standard bloom filter)
- ❌ Cannot retrieve the actual items

### Real-world use cases
| Use Case | How |
|---|---|
| **Cache pre-check** | Before hitting DB, check bloom filter — skip DB if definitely not there |
| **Duplicate URL detection** (Google Crawler) | Don't re-crawl URLs already visited |
| **Username availability** | Quick reject before DB lookup |
| **Spam filter** | Check if email is in known-spam list |
| **Cassandra / HBase** | Built-in bloom filters to skip SSTable reads |

### Tuning
- More bits + more hash functions = lower false positive rate
- False positive rate ≈ `(1 - e^(-kn/m))^k` where k=hash functions, n=items, m=bits
- Rule of thumb: ~10 bits per item gives ~1% false positive rate

---

## 2. HyperLogLog (HLL)
**Question it answers:** "How many unique items have I seen?"
**Answer type:** Approximate cardinality (unique count) with ~1-2% error

### How it works
Hash each item → observe the **longest run of leading zeros** in the binary hash → more leading zeros = more unique items seen (probabilistically).

```
Stream of events: user_1, user_2, user_1, user_3, user_2 ...

HLL tracks: max leading zeros seen across hash buckets
Result: "~3 unique users" (exact = 3)

At 1 billion users:
Exact set: ~8GB RAM
HLL:       ~1.5KB RAM, 99.2% accurate
```

- ✅ Constant memory (~1.5KB for any cardinality)
- ✅ Mergeable — combine HLLs from different servers
- ❌ ~1-2% error rate
- ❌ Cannot tell you which items were seen, only how many

### Real-world use cases
| Use Case | How |
|---|---|
| **Daily Active Users (DAU)** | Count unique user IDs per day |
| **Unique page views** | Count distinct visitors per URL |
| **Unique search queries** | Count distinct queries per hour |
| **Redis built-in** | `PFADD`, `PFCOUNT` commands — native HLL support |

```
PFADD dau:2024-05-16 user:1 user:2 user:3
PFCOUNT dau:2024-05-16  → (integer) 3

-- Merge multiple days:
PFMERGE dau:week dau:2024-05-16 dau:2024-05-17
PFCOUNT dau:week → weekly unique users
```

---

## 3. Count-Min Sketch
**Question it answers:** "How many times have I seen this specific item?"
**Answer type:** Approximate frequency count (always overestimates, never underestimates)

### How it works
A 2D grid (rows = hash functions, columns = counters). On each event, increment the counter at each row's hash position. On query, return the **minimum** across all rows.

```
Grid (3 hash functions × 5 buckets):

          0    1    2    3    4
hash1: [  0    3    0    2    0  ]
hash2: [  1    0    3    0    1  ]
hash3: [  0    2    1    3    0  ]

Query frequency of "apple":
  hash1("apple") = 1 → count = 3
  hash2("apple") = 2 → count = 3
  hash3("apple") = 3 → count = 3
  min(3, 3, 3) = 3  ← approximate frequency
```

- ✅ Overestimates (due to hash collisions) but never underestimates
- ✅ Fixed memory regardless of number of distinct items
- ✅ O(1) update and query
- ❌ Cannot enumerate which items were counted

### Real-world use cases
| Use Case | How |
|---|---|
| **Heavy hitter detection** | Find top-K most frequent items in a stream (trending topics, hot products) |
| **Rate limiting** | Count requests per IP approximately |
| **Network traffic analysis** | Count packets per source IP |
| **Ad frequency capping** | Approximate how many times a user saw an ad |

---

## 4. Skip List (Bonus — not probabilistic but often grouped here)
Already covered in the Redis internals doc — Redis sorted sets use skip lists for O(log n) range queries.

---

## Comparison Cheat Sheet

| Structure | Answers | Error Type | Memory | Use Case |
|---|---|---|---|---|
| **Bloom Filter** | Is X in the set? | False positives only | Tiny, fixed | Duplicate detection, cache pre-check |
| **HyperLogLog** | How many unique X? | ~1-2% cardinality error | ~1.5KB fixed | DAU, unique visitors |
| **Count-Min Sketch** | How often does X appear? | Overcount only | Small, fixed | Trending topics, rate limiting |

---

## When to Reach for These in System Design

```
"Design a system that tracks unique visitors per page"
→ HyperLogLog — exact count impossible at scale, 1% error is fine

"Design a web crawler that doesn't revisit URLs"
→ Bloom filter — definitely-not-seen check before DB lookup

"Design a trending topics feature"
→ Count-Min Sketch — approximate frequency of hashtags in last 1hr window

"Design a rate limiter at massive scale"
→ Count-Min Sketch per IP + Redis atomic increments
```

---

## Failure Modes & Mitigations

| Failure | Impact | Mitigation |
|---|---|---|
| **Bloom filter too small** | False positive rate too high | Size filter based on expected n; monitor FP rate; rebuild periodically |
| **HLL across distributed nodes out of sync** | Inaccurate cardinality | Merge HLLs periodically; Redis PFMERGE handles this natively |
| **Count-Min Sketch grid too small** | Overcounting errors too large | Increase width (more buckets); use multiple independent sketches |
| **Bloom filter can't delete** | Stale entries cause false positives forever | Use **Counting Bloom Filter** (stores counts instead of bits) to support deletes |

---

## Interview Talking Points
- These exist because **exact answers at billion-scale are too expensive** — always frame it as a trade-off
- Bloom filter: **false positives yes, false negatives never** — this asymmetry is what makes it useful
- HyperLogLog in Redis is a **one-liner** (`PFADD`, `PFCOUNT`) — practical and worth mentioning
- Count-Min Sketch for **top-K / trending** is a very common interview scenario
- Mergeability of HLL is powerful — each server tracks its own HLL, merge for global count
