const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Products API running' });
});

// Products route
app.get('/products', async (req, res) => {
  try {
    const { category, cursor, limit = 20 } = req.query;
    const pageLimit = Math.min(parseInt(limit), 100);

    let query;
    let params;

    if (cursor) {
      // Decode cursor
      const [cursorTime, cursorId] = Buffer.from(cursor, 'base64')
        .toString()
        .split('___');

      if (category) {
        query = `
          SELECT id, name, category, price, created_at, updated_at
          FROM products
          WHERE category = $1
            AND (created_at, id) < ($2::timestamptz, $3::uuid)
          ORDER BY created_at DESC, id DESC
          LIMIT $4
        `;
        params = [category, cursorTime, cursorId, pageLimit];
      } else {
        query = `
          SELECT id, name, category, price, created_at, updated_at
          FROM products
          WHERE (created_at, id) < ($1::timestamptz, $2::uuid)
          ORDER BY created_at DESC, id DESC
          LIMIT $3
        `;
        params = [cursorTime, cursorId, pageLimit];
      }
    } else {
      // First page - no cursor
      if (category) {
        query = `
          SELECT id, name, category, price, created_at, updated_at
          FROM products
          WHERE category = $1
          ORDER BY created_at DESC, id DESC
          LIMIT $2
        `;
        params = [category, pageLimit];
      } else {
        query = `
          SELECT id, name, category, price, created_at, updated_at
          FROM products
          ORDER BY created_at DESC, id DESC
          LIMIT $1
        `;
        params = [pageLimit];
      }
    }

    const result = await pool.query(query, params);
    const products = result.rows;

    // Build next cursor from last item
    let nextCursor = null;
    if (products.length === pageLimit) {
      const last = products[products.length - 1];
      nextCursor = Buffer.from(
        `${last.created_at.toISOString()}___${last.id}`
      ).toString('base64');
    }

    res.json({
      data: products,
      nextCursor,
      hasMore: nextCursor !== null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});