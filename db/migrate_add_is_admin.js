// Migration script to add is_admin column to users table
// Run: node db/migrate_add_is_admin.js

const mysql = require('mysql2/promise');
const path = require('path');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
// Never hardcode credentials in repo. Set DB_PASS in `.env` or your environment.
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'portfolio_db';

async function migrate() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME
    });

    console.log('Checking if is_admin column exists...');
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_admin'",
      [DB_NAME]
    );

    if (columns.length > 0) {
      console.log('✓ is_admin column already exists');
    } else {
      console.log('Adding is_admin column to users table...');
      await connection.execute(
        'ALTER TABLE `users` ADD COLUMN `is_admin` BOOLEAN DEFAULT FALSE AFTER `full_name`'
      );
      console.log('✓ is_admin column added successfully');
    }

    console.log('Setting admin user privileges...');
    const [result] = await connection.execute(
      "UPDATE `users` SET `is_admin` = TRUE WHERE `username` = 'admin'"
    );
    console.log(`✓ Updated ${result.affectedRows} admin user(s)`);

    console.log('Verifying admin user...');
    const [adminUsers] = await connection.execute(
      "SELECT id, username, email, full_name, is_admin FROM users WHERE username = 'admin'"
    );
    
    if (adminUsers.length > 0) {
      console.log('Admin user details:');
      console.log(adminUsers[0]);
      if (adminUsers[0].is_admin) {
        console.log('\n✓ Migration completed successfully!');
        console.log('You can now access the admin panel and view messages.');
      } else {
        console.log('\n⚠ Warning: Admin user exists but is_admin is not set to TRUE');
      }
    } else {
      console.log('⚠ Warning: No admin user found. Please create an admin user first.');
    }

  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrate();

