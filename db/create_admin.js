// Script to create admin user or set existing user as admin
// Run: node db/create_admin.js [username]

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
// Never hardcode credentials in repo. Set DB_PASS in `.env` or your environment.
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'portfolio_db';

const username = process.argv[2] || 'admin';

async function createOrUpdateAdmin() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME
    });

    // Check if user exists
    const [existingUsers] = await connection.execute(
      'SELECT id, username, email, is_admin FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      // User exists, update to admin
      const user = existingUsers[0];
      console.log(`Found existing user: ${user.username} (${user.email})`);
      
      if (user.is_admin) {
        console.log('✓ User is already an admin');
      } else {
        await connection.execute(
          'UPDATE users SET is_admin = TRUE WHERE id = ?',
          [user.id]
        );
        console.log(`✓ User "${username}" has been granted admin privileges`);
      }
    } else {
      // Create new admin user
      console.log(`Creating new admin user: ${username}`);
      const password = 'admin123'; // Default password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await connection.execute(
        'INSERT INTO users (username, email, password, full_name, is_admin) VALUES (?, ?, ?, ?, ?)',
        [username, `${username}@portfolio.com`, hashedPassword, 'Portfolio Admin', true]
      );
      
      console.log(`✓ Admin user "${username}" created successfully`);
      console.log(`  Email: ${username}@portfolio.com`);
      console.log(`  Password: ${password}`);
      console.log(`  ⚠ Please change the password after first login!`);
    }

    // Verify
    const [adminUsers] = await connection.execute(
      'SELECT id, username, email, full_name, is_admin FROM users WHERE is_admin = TRUE'
    );
    
    console.log('\nAll admin users:');
    adminUsers.forEach(user => {
      console.log(`  - ${user.username} (${user.email})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createOrUpdateAdmin();

