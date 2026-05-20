# Pagination Techniques

*A practical comparison: when to use what, API design, and backend mechanics*

---

## Quick Comparison

| Aspect | Offset / LIMIT | Page-based | Cursor (keyset) |
|---|---|---|---|
| Performance at scale | Degrades — DB scans skipped rows | Same as offset (it is offset) | Constant — index seek |
| Jump to arbitrary page | Yes | Yes | No — sequential only |
| Stable on inserts/deletes | No — items shift | No | Yes |
| Total count available | Yes (extra query) | Yes | Not easily |
| Best fit | Admin lists, reports | Search results, tables | Feeds, timelines, logs |

---

## 1. Offset-based Pagination

### When to choose it
- Dataset is small to moderate (under ~100k rows, or page numbers stay shallow)
- Users need to jump to arbitrary pages (page 1, page 47, last page)
- Data is mostly static — not constantly receiving inserts at the head
- You need a total count and total page numbers shown in the UI

### Use cases
- Admin dashboards listing users, orders, transactions
- Internal reports and CSV-style data tables
- Search result pages where users say "go to page 5"

### API design
```
GET /api/orders?offset=40&limit=20

Response:
{
  "data":   [ /* 20 orders */ ],
  "offset": 40,
  "limit":  20,
  "total":  1543
}
```

### Backend (Java / Spring Data JPA)
```java
@GetMapping("/orders")
public OrderPage list(
    @RequestParam(defaultValue = "0")  int offset,
    @RequestParam(defaultValue = "20") int limit) {

    int pageIndex = offset / limit;
    Pageable pageable = PageRequest.of(pageIndex, limit, Sort.by("id"));
    Page<Order> page = orderRepository.findAll(pageable);

    return new OrderPage(
        page.getContent(),
        offset,
        limit,
        page.getTotalElements()   // triggers a separate COUNT(*) query
    );
}
```

### How it works in the DB
```sql
SELECT * FROM orders ORDER BY id LIMIT 20 OFFSET 40;
```
The DB walks past the first 40 rows on every request. At OFFSET 100,000 it walks past 100,000 rows — query time grows linearly with depth.

---

## 2. Page-based Pagination

### When to choose it
- Same engine as offset — use this when consumers think in pages, not records
- Public APIs and UIs that show "Page 3 of 27" controls
- You want friendlier URLs than raw offsets

### Use cases
- Product catalogues and e-commerce search
- Blog post listings, forum threads
- Any UI with numbered page links at the bottom

### API design
```
GET /api/products?page=3&size=20

Response:
{
  "data":       [ /* 20 products */ ],
  "page":       3,
  "size":       20,
  "totalPages": 27,
  "totalItems": 534
}
```

### Backend (Java / Spring Data JPA)
```java
@GetMapping("/products")
public ProductPage list(
    @RequestParam(defaultValue = "1")  int page,
    @RequestParam(defaultValue = "20") int size) {

    // Spring is 0-indexed; expose 1-indexed to clients
    Pageable pageable = PageRequest.of(page - 1, size, Sort.by("id"));
    Page<Product> result = productRepository.findAll(pageable);

    return new ProductPage(
        result.getContent(),
        page,
        size,
        result.getTotalPages(),
        result.getTotalElements()
    );
}
```

### How it works in the DB
Page-based is offset in disguise — the server converts before querying:
```sql
-- offset = (page - 1) * size
SELECT * FROM products ORDER BY id LIMIT 20 OFFSET 40;
```
Same performance profile as offset. Same instability when records are inserted mid-browse — users may see duplicates or skip items across page transitions.

---

## 3. Cursor-based Pagination

### When to choose it
- Large or rapidly growing dataset where deep pagination must stay fast
- Real-time feeds where new items arrive at the head constantly
- Infinite-scroll UIs — users only move forward, never "jump to page 47"
- You need stable results: no duplicates, no skipped items, even under heavy writes

### Use cases
- Social media timelines (Twitter, Instagram, LinkedIn feeds)
- Chat message history, notification lists
- Audit logs, event streams, transaction history
- Any "load more" button

### API design
```
GET /api/feed?cursor=eyJpZCI6MTI1MH0&limit=20

Response:
{
  "data": [ /* 20 posts */ ],
  "pageInfo": {
    "nextCursor":     "eyJpZCI6MTIzMH0",
    "hasNextPage":    true,
    "previousCursor": "eyJpZCI6MTI3MH0"
  }
}
```
The cursor is an opaque Base64-encoded token. Clients should never parse it — the server owns the format and can change it without breaking clients.

### Backend (Java / Spring Boot)
```java
@GetMapping("/feed")
public FeedPage feed(
    @RequestParam(required = false)    String cursor,
    @RequestParam(defaultValue = "20") int limit) {

    Long afterId = decodeCursor(cursor); // null on first request

    // Fetch limit + 1 to detect if a next page exists
    List<Post> posts = postRepository
        .findNextPage(afterId, PageRequest.of(0, limit + 1));

    boolean hasNext = posts.size() > limit;
    if (hasNext) posts = posts.subList(0, limit);

    String nextCursor = hasNext
        ? encodeCursor(posts.get(posts.size() - 1).getId())
        : null;

    return new FeedPage(posts, nextCursor, hasNext);
}

private String encodeCursor(Long id) {
    return Base64.getUrlEncoder().withoutPadding()
        .encodeToString(("{\"id\":" + id + "}").getBytes());
}

private Long decodeCursor(String cursor) {
    if (cursor == null) return null;
    String json = new String(Base64.getUrlDecoder().decode(cursor));
    return Long.parseLong(json.replaceAll("[^0-9]", ""));
}
```

Repository:
```java
public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("""
        SELECT p FROM Post p
        WHERE (:afterId IS NULL OR p.id < :afterId)
        ORDER BY p.id DESC
    """)
    List<Post> findNextPage(@Param("afterId") Long afterId, Pageable pageable);
}
```

### How it works in the DB
```sql
SELECT * FROM posts WHERE id < 1250 ORDER BY id DESC LIMIT 20;
```
The DB performs an index seek directly to the cursor value — no rows are scanned and skipped. Performance stays flat at page 1 or page 10,000.

### Gotchas
- Cursor must be on a **unique, indexed, sortable** column. If `created_at` can repeat, use a composite: `WHERE (created_at, id) < (?, ?)`
- Cursors must be **opaque** to clients — encode them so you can change the format later
- **No random-page access** — clients can only go forward (or backward with a `previousCursor`)
- **Total count is expensive** — usually omitted; cache it or show "1000+" if needed

---

## 4. Decision Guide

| If your situation is… | Use… |
|---|---|
| Internal admin tool, < 50k records, need page numbers | Page-based |
| Public search results with "Page X of Y" | Page-based |
| Mobile app feed with infinite scroll | Cursor |
| Chat history, notifications, activity log | Cursor |
| High-write table where data shifts between requests | Cursor |
| Quick prototype, small dataset | Offset |

---

## 5. Summary

Offset and page-based are easy to build and reason about — they fit admin lists and traditional paginated UIs. They fail on two fronts as data grows: query latency at deep offsets, and result instability when data is changing. Cursor pagination solves both, at the cost of losing random-page-access and total counts. Pick the pattern that matches how users actually move through the data, not what feels easiest to build.
