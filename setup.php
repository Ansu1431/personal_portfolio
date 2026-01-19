<?php
/**
 * Database Setup Script
 * Run this file once to set up your portfolio database
 */

// Database configuration
$host = 'localhost';
$username = 'root';
// Never hardcode credentials in repo. Set DB_PASS in your environment (IIS/Apache) or edit locally.
$password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$database = 'portfolio_db';

echo "<h2>Portfolio Database Setup</h2>";
echo "<p>This script will create the database and tables for your portfolio website.</p>";

try {
    // Create connection without database
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p>✓ Connected to MySQL server successfully</p>";
    
    // Create database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "<p>✓ Database '$database' created successfully</p>";
    
    // Select the database
    $pdo->exec("USE `$database`");
    
    // Create users table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    echo "<p>✓ Users table created successfully</p>";
    
    // Create contact_messages table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            subject VARCHAR(200) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_read BOOLEAN DEFAULT FALSE
        )
    ");
    echo "<p>✓ Contact messages table created successfully</p>";
    
    // Create portfolio_data table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS portfolio_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            section VARCHAR(50) NOT NULL,
            title VARCHAR(200),
            content TEXT,
            data_json JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_section (section)
        )
    ");
    echo "<p>✓ Portfolio data table created successfully</p>";

    // Create projects table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            image_url VARCHAR(255),
            live_demo_url VARCHAR(255),
            source_code_url VARCHAR(255),
            tech_stack VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    echo "<p>✓ Projects table created successfully</p>";

    // Create blog_posts table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS blog_posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            content TEXT NOT NULL,
            image_url VARCHAR(255),
            published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    echo "<p>✓ Blog posts table created successfully</p>";

    // Create testimonials table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS testimonials (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            role VARCHAR(100),
            message TEXT NOT NULL,
            photo_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
    echo "<p>✓ Testimonials table created successfully</p>";

    // Create resume table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS resume (
            id INT AUTO_INCREMENT PRIMARY KEY,
            section VARCHAR(50) NOT NULL,
            title VARCHAR(200),
            content TEXT,
            data_json JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    echo "<p>✓ Resume table created successfully</p>";
    
    // Insert default admin user
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = 'admin'");
    $stmt->execute();
    
    if ($stmt->fetchColumn() == 0) {
        $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("
            INSERT INTO users (username, email, password, full_name) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute(['admin', 'admin@portfolio.com', $hashedPassword, 'Portfolio Admin']);
        echo "<p>✓ Default admin user created successfully</p>";
        echo "<p><strong>Default Login Credentials:</strong></p>";
        echo "<ul>";
        echo "<li>Username: admin</li>";
        echo "<li>Password: admin123</li>";
        echo "</ul>";
    } else {
        echo "<p>✓ Admin user already exists</p>";
    }
    
    // Insert some sample portfolio data
    $sampleData = [
        'general' => [
            'portfolio_title' => 'Your Name - Portfolio',
            'about_me' => 'I am a passionate developer with expertise in modern web technologies.'
        ],
        'contact' => [
            'contact_email' => 'your.email@example.com',
            'phone_number' => '+1 (555) 123-4567',
            'location' => 'City, State, Country'
        ]
    ];
    
    foreach ($sampleData as $section => $data) {
        $stmt = $pdo->prepare("
            INSERT INTO portfolio_data (section, data_json) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE data_json = ?
        ");
        $jsonData = json_encode($data);
        $stmt->execute([$section, $jsonData, $jsonData]);
    }
    echo "<p>✓ Sample portfolio data inserted successfully</p>";
    
    echo "<h3>🎉 Setup Complete!</h3>";
    echo "<p>Your portfolio database has been set up successfully. You can now:</p>";
    echo "<ol>";
    echo "<li>Update the database credentials in <code>backend/config.php</code></li>";
    echo "<li>Add your profile photo as <code>profile-photo.jpg</code></li>";
    echo "<li>Customize the content in <code>index.html</code></li>";
    echo "<li>Test the login system with the default credentials</li>";
    echo "</ol>";
    
    echo "<p><strong>Important:</strong> Delete this file (<code>setup.php</code>) after setup for security reasons.</p>";
    
} catch (PDOException $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
    echo "<p>Please check your database credentials and try again.</p>";
}
?>

<style>
body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 50px auto;
    padding: 20px;
    background: #f5f5f5;
    line-height: 1.6;
}

h2 {
    color: #333;
    border-bottom: 2px solid #00d4ff;
    padding-bottom: 10px;
}

h3 {
    color: #00d4ff;
}

p {
    margin: 10px 0;
}

code {
    background: #e0e0e0;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: monospace;
}

ul, ol {
    margin: 10px 0;
    padding-left: 20px;
}

li {
    margin: 5px 0;
}
</style> 