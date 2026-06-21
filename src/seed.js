const pool = require('./db');
const { faker } = require('@faker-js/faker');

const TOTAL = 200000;
const BATCH_SIZE = 1000;

const CATEGORIES = [
  'electronics',
  'clothing',
  'books',
  'furniture',
  'sports',
  'toys',
  'beauty',
  'food'
];

async function seed() {
  console.log('Starting seed...');
  
  const client = await pool.connect();
  
  try {
    let inserted = 0;

    while (inserted < TOTAL) {
      const values = [];
      const placeholders = [];

      for (let i = 0; i < BATCH_SIZE; i++) {
        const idx = i * 5;
        placeholders.push(
          `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5})`
        );
        
        const createdAt = faker.date.past({ years: 2 });
        
        values.push(
          faker.commerce.productName(),
          CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
          faker.commerce.price({ min: 10, max: 10000 }),
          createdAt,
          createdAt
        );
      }

      await client.query(
        `INSERT INTO products (name, category, price, created_at, updated_at)
         VALUES ${placeholders.join(',')}`,
        values
      );

      inserted += BATCH_SIZE;
      console.log(`Inserted ${inserted}/${TOTAL}`);
    }

    console.log('Seed complete!');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);