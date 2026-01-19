const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

console.log("🔌 Connecting to MySQL:", {
  host: process.env.MYSQLHOST,
  database: process.env.MYSQLDATABASE
});

module.exports = {
  query: async (sql, params) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
  },
  pool
};
