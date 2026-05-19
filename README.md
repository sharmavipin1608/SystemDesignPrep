# SystemDesign.prep

A static web app for studying system design interview topics.

## Topics

- **Caching** — caching strategies, Redis vs Memcached
- **Databases** — NoSQL, Elasticsearch, database indexing
- **Networking** — load balancers, CDN
- **Storage** — blob storage
- **APIs** — API design
- **Patterns** — real-time updates, contention, multi-step processes, scaling reads/writes, long-running tasks

## Adding a new topic

Drop a `.md` file in the relevant `content/<group>/` folder — it appears in the sidebar automatically on the next build.

## Development

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # run tests
npm run build     # static export to out/
```

## Deploy

Connected to Vercel — merging to `main` triggers a production deploy.
