const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'task4_app',
  password: 'vierneZ$97@',
  port: 5432,
  options: '-c search_path=task4_app,public'
});

module.exports = pool;
