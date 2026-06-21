# codevector products api

## live urls
- backend api: https://codevector-product-api.onrender.com
- github repo: https://github.com/haripriyatripathi/codevector-product-api

## what we did
- built a backend rest api from scratch in one night with zero prior backend experience, learning node.js, express and postgresql on the go while understanding every line of code
- implemented cursor-based pagination over offset pagination to ensure fast queries on 200,000 products and stable browsing even when new data is added, deployed live on render with neon postgresql database

## api endpoints
| endpoint | description |
|----------|-------------|
| GET / | health check |
| GET /products | get 20 products newest first |
| GET /products?category=electronics | filter by category |
| GET /products?cursor=XXX | get next page |
| GET /products?limit=20 | set page size |

## project structure
codevector-products-api/

├── src/

│   ├── db.js          → database connection pool

│   ├── seed.js        → generates 200,000 products in bulk

│   └── index.js       → express server and api endpoints

├── frontend/          → bonus ui (next.js)

├── .env               → secret credentials (not on github)

├── .gitignore         → ignores node_modules and .env

├── package.json       → project config and dependencies

└── README.md          → project documentation

## packages used
| package | version | purpose |
|---------|---------|---------|
| express | ^5.2.1 | web server framework |
| pg | ^8.22.0 | connect node.js to postgresql |
| dotenv | ^17.4.2 | load .env credentials |
| cors | ^2.8.6 | allow frontend to call api |
| @faker-js/faker | ^10.5.0 | generate fake product data |

## database schema
```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_cursor 
ON products (created_at DESC, id DESC);

CREATE INDEX idx_products_category 
ON products (category, created_at DESC, id DESC);
```

## how each file works

### src/db.js
- creates a postgresql connection pool
- pool reuses connections instead of creating new one per request
- ssl enabled because neon requires encrypted connections
- exports pool so other files can use it

### src/seed.js
- generates 200,000 fake products using faker.js
- uses bulk insert — 1000 rows per query
- total of 200 queries instead of 200,000
- 8 categories: electronics, clothing, books, furniture, sports, toys, beauty, food
- random prices between $10 and $10,000
- random dates within last 2 years

### src/index.js
- express server running on port 3000
- cors enabled for frontend access
- GET / → health check endpoint
- GET /products → main endpoint with:
  - cursor-based pagination
  - category filtering
  - base64 encoded cursor
  - returns data and nextCursor and hasMore

## how cursor pagination works

### first page request
GET /products?limit=20
```json
{
  "data": [...20 products],
  "nextCursor": "MjAyNC0wMS0xNVQxMDozMDowMFpfX191dWlkLWhlcmU=",
  "hasMore": true
}
```

### next page request
GET /products?cursor=MjAyNC0wMS0xNVQxMDozMDowMFpfX191dWlkLWhlcmU=
```json
{
  "data": [...next 20 products],
  "nextCursor": "NEXT_CURSOR",
  "hasMore": true
}
```

### last page
```json
{
  "data": [...last products],
  "nextCursor": null,
  "hasMore": false
}
```

## cursor encoding
```js
// encoding — last item becomes next cursor
const nextCursor = Buffer.from(
  `${last.created_at.toISOString()}___${last.id}`
).toString('base64');

// decoding — cursor decoded to get timestamp and id
const [cursorTime, cursorId] = Buffer.from(cursor, 'base64')
  .toString()
  .split('___');
```

## sql queries used

### no cursor, no category (first page)
```sql
SELECT id, name, category, price, created_at, updated_at
FROM products
ORDER BY created_at DESC, id DESC
LIMIT 20
```

### with cursor, no category
```sql
SELECT id, name, category, price, created_at, updated_at
FROM products
WHERE (created_at, id) < ($1::timestamptz, $2::uuid)
ORDER BY created_at DESC, id DESC
LIMIT 20
```

### with cursor and category
```sql
SELECT id, name, category, price, created_at, updated_at
FROM products
WHERE category = $1
  AND (created_at, id) < ($2::timestamptz, $3::uuid)
ORDER BY created_at DESC, id DESC
LIMIT 20
```

## why cursor over offset pagination
| offset pagination | cursor pagination |
|------------------|------------------|
| slow on large tables | fast — uses index directly |
| breaks when data changes | stable — bookmark based |
| 200k rows = slow scan | jumps to exact position |
| duplicates possible | no duplicates ever |

## hosting
| service | platform | url |
|---------|----------|-----|
| backend api | render (free) | https://codevector-product-api.onrender.com |
| database | neon (free) | postgresql on aws us-east-1 |
| frontend ui | v0.dev | bonus only |

## what i would improve with more time
- input validation with proper 400 errors
- cursor validation
- rate limiting (100 req/min per ip)
- morgan for request logging
- redis caching for first page
- post /products endpoint to add new products
- typescript for better type safety
- unit tests for pagination logic

## categories available
electronics | clothing | books | furniture | sports | toys | beauty | food

## how to run locally
```bash
# clone repo
git clone https://github.com/haripriyatripathi/codevector-product-api.git
cd codevector-product-api

# install dependencies
npm install

# create .env file
DATABASE_URL=your_neon_connection_string
PORT=3000

# seed 200,000 products
node src/seed.js

# start server
npm start

# test
curl http://localhost:3000/products
```

