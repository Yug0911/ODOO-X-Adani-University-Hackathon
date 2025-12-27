const { Pool } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  // Connect to postgres database to create maintenance
  const tempPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres', // Connect to default postgres db
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Creating database...');
    await tempPool.query('CREATE DATABASE maintenance;');
    console.log('Database created.');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('Database already exists.');
    } else {
      throw err;
    }
  } finally {
    await tempPool.end();
  }

  // Now connect to maintenance and run schema
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Running schema...');
    const fs = require('fs');
    const sql = fs.readFileSync('schema.sql', 'utf8');
    await pool.query(sql);
    console.log('Schema executed successfully.');
  } catch (err) {
    console.error('Error running schema:', err);
  } finally {
    await pool.end();
  }
}

setupDatabase();