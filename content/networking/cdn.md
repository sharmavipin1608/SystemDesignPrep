# CDN (Content Delivery Network)

## What is it?
A globally distributed network of servers (edge nodes) that cache and serve content from locations geographically closer to the user — reducing latency and offloading traffic from your origin server.

---

## How it Works
```
User (India) → Nearest Edge Node (Singapore) → Cache Hit? Serve it
                                              → Cache Miss? Fetch from Origin → Cache → Serve
```
Subsequent users in the same region get the cached copy instantly.

---

## What Gets Cached?

| Good fit for CDN | Bad fit for CDN |
|---|---|
| Images, videos, CSS, JS | Personalized API responses |
| Static HTML pages | Real-time data (stock prices, chat) |
| Large file downloads | User-specific dashboards |
| Font files | Write-heavy endpoints |

> **Rule of thumb:** CDNs shine for **read-heavy, static or semi-static** content.

---

## Push vs Pull CDN

| | Pull CDN | Push CDN |
|---|---|---|
| **How** | CDN fetches from origin on first request (cache miss) | You upload content to CDN proactively |
| **Best for** | Unpredictable traffic, large content libraries | Known assets, high-traffic launches |
| **Downside** | First user gets slow response (cold cache) | You manage invalidation and uploads |
| **Examples** | Cloudflare, AWS CloudFront (default) | AWS CloudFront (with S3 push), Akamai |

---

## Cache Control & TTL
You control how long content lives in edge cache via HTTP headers:

```
Cache-Control: max-age=86400        # Cache for 1 day
Cache-Control: no-store             # Never cache
Cache-Control: s-maxage=3600        # CDN-specific TTL (overrides max-age for CDN)
```

- **Short TTL** → more origin hits, fresher content
- **Long TTL** → better cache hit rate, stale risk

---

## Cache Invalidation
When you deploy new content, old cached versions may still be served.

Strategies:
- **TTL expiry** — wait it out (simplest, but slow)
- **Versioned URLs** — `app.v2.js` instead of `app.js` (cache never goes stale)
- **Explicit purge** — call CDN API to invalidate specific paths (Cloudflare, CloudFront support this)

> **Best practice:** Use **versioned/fingerprinted filenames** for static assets — deploy and forget. Reserve purge API for emergencies.

---

## CDN for Dynamic Content
Modern CDNs can also accelerate dynamic content:
- **Edge caching** with short TTL for semi-dynamic pages
- **Edge compute** (Cloudflare Workers, Lambda@Edge) — run code at the edge to personalize responses without hitting origin
- **TCP optimization** — CDN maintains persistent connections to origin, reducing handshake overhead

---

## Common Patterns in System Design

### Static Asset Serving
```
Browser → CDN Edge → (miss) → S3 / Object Storage (origin)
```

### Media Streaming
```
User → CDN Edge → (miss) → Media Server
       ↑ Subsequent users served directly from edge
```

### API Acceleration (Dynamic)
```
User → CDN (edge compute / smart routing) → Origin API
```

---

## Key Metrics
- **Cache Hit Ratio** — % of requests served from cache (higher = better; aim for >90% for static)
- **Origin Offload** — % of traffic NOT hitting your origin
- **TTFB (Time to First Byte)** — should drop significantly with CDN

---

## Key Tools / Products

| CDN | Notes |
|---|---|
| **Cloudflare** | Most popular; DDoS protection built-in; edge compute (Workers) |
| **AWS CloudFront** | Tight AWS integration; Lambda@Edge |
| **Akamai** | Enterprise-grade; massive edge network |
| **Fastly** | Real-time purge; popular for APIs |
| **Google Cloud CDN** | GCP native |

---

## Interview Talking Points
- CDNs reduce latency by serving from the **edge**, not just offloading origin
- Always mention **cache invalidation** — it's one of the hard problems
- Use **versioned URLs** for static assets to sidestep invalidation entirely
- For WebSockets or real-time data — CDN won't help; go direct to origin
- Mention **edge compute** if the interviewer pushes on personalization at scale
- CDN also provides **DDoS protection** and **TLS termination** at the edge — free wins
