# codevector products api

## what we built
a backend rest api that:
- stores 200,000 products in postgresql
- returns them newest first
- filters by category
- uses cursor-based pagination (stable and fast)
- built with node.js, express, postgresql on neon, hosted on render

---

## tech stack
| tool | purpose |
|------|---------|
| node.js | runtime environment |
| express.js | web framework |
| postgresql | database |
| neon | cloud postgresql hosting (free) |
| render | api hosting (free) |
| faker.js | generate fake product data |
| dotenv | load environment variables |
| cors | allow frontend to call api |
| pg | connect node.js to postgresql |

---

## project structure
codevector-products-api/

├── src/

│   ├── db.js        → database connection pool

│   ├── seed.js      → generates 200,000 products

│   └── index.js     → express server and api endpoints

├── .env             → secret credentials (not on github)

├── .gitignore       → ignores node_modules and .env

└── package.json     → project config and dependencies
---

## file by file explanation

### db.js
- creates a connection pool to postgresql
- pool keeps connections open and reuses them
- without pool: every request opens a new connection = slow
- ssl enabled because neon requires encrypted connections

### seed.js
- generates 200,000 fake products using faker.js
- uses bulk insert — 1000 rows per query = 200 queries total
- not 200,000 individual queries (would be very slow)
- each product has: name, category, price, created_at, updated_at
- 8 categories: electronics, clothing, books, furniture, sports, toys, beauty, food
- random dates in last 2 years for created_at

### index.js
- express server on port 3000
- cors enabled so frontend can call the api
- two routes:
  - GET / → health check
  - GET /products → main endpoint with pagination and filtering

---

## api endpoints

### health check
GET /
```json
{"status": "ok", "message": "products api running"}
```

### get products
GET /products

GET /products?category=electronics

GET /products?category=electronics&cursor=XXXXX

GET /products?limit=20
```json
{
  "data": [...20 products],
  "nextCursor": "base64encodedcursor",
  "hasMore": true
}
```

---

## the key concept — cursor vs offset pagination

### offset pagination (wrong approach)
```sql
SELECT * FROM products LIMIT 20 OFFSET 100
```
problem 1 — slow: database scans 100 rows just to skip them. gets slower on large tables.
problem 2 — unstable: if 50 new products added while browsing page 3, offset shifts. you see duplicates or miss products.

### cursor pagination (correct approach)
```sql
WHERE (created_at, id) < (:last_timestamp, :last_id)
ORDER BY created_at DESC, id DESC
LIMIT 20
```
why fast: uses index directly. jumps straight to right row — no scanning.
why stable: says "give me products older than this timestamp+id". new products at top don't affect your position.
why id as tiebreaker: multiple products can have same created_at. id makes ordering 100% unique.

---

## how cursor encoding works
```js
// encoding — when sending response
const nextCursor = Buffer.from(
  `${last.created_at.toISOString()}___${last.id}`
).toString('base64');

// decoding — when receiving request
const [cursorTime, cursorId] = Buffer.from(cursor, 'base64')
  .toString()
  .split('___');
```
why base64: makes cursor url-safe. hides implementation details from client.
why ___ separator: three underscores won't appear in uuid or timestamp so splitting is safe.

---


## architecture flow
client request

↓

express server (render)

↓

parse cursor + category from query params

↓

build sql with cursor where clause

↓

postgresql on neon (indexed lookup)

↓

return 20 products and nextcursor token

↓

client uses nextcursor for next page
