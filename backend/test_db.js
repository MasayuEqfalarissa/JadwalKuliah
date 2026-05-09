const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => console.log('Connected!'))
  .catch(err => console.error('Error connecting:', err))
  .finally(() => client.end());
