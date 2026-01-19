// Script to check all users and their admin status
const mysql = require('mysql2/promise');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
// Never hardcode credentials in repo. Set DB_PASS in `.env` or your environment.
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'portfolio_db';

async function checkUsers() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME
    });

    console.log('Checking users...\n');
    const [users] = await connection.execute(
      'SELECT id, username, email, full_name, is_admin FROM users'
    );
    
    console.log('All users:');
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - Admin: ${user.is_admin ? 'YES' : 'NO'}`);
    });

    console.log('\nChecking contact messages...\n');
    const [messages] = await connection.execute(
      'SELECT id, name, email, subject, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 10'
    );
    
    console.log(`Total messages: ${messages.length}`);
    messages.forEach(msg => {
      console.log(`  - From: ${msg.name} (${msg.email}) - Subject: ${msg.subject} - Date: ${msg.created_at}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUsers();

