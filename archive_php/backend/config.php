<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
// Never hardcode credentials in repo. Set DB_PASS in your environment (or in server-side config).
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');
define('DB_NAME', 'portfolio_db');

// Create database connection
function getDBConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return false;
    }
}

// Initialize database tables
function initializeDatabase() {
    $pdo = getDBConnection();
    if (!$pdo) {
        return false;
    }

    try {
        // Create users table
        $pdo->exec("\n            CREATE TABLE IF NOT EXISTS users (\n                id INT AUTO_INCREMENT PRIMARY KEY,\n                username VARCHAR(50) UNIQUE NOT NULL,\n                email VARCHAR(100) UNIQUE NOT NULL,\n                password VARCHAR(255) NOT NULL,\n                full_name VARCHAR(100),\n                is_admin BOOLEAN DEFAULT FALSE,\n                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n            )\n        ");

        // Create contact_messages table
        $pdo->exec("\n            CREATE TABLE IF NOT EXISTS contact_messages (\n                id INT AUTO_INCREMENT PRIMARY KEY,\n                name VARCHAR(100) NOT NULL,\n                email VARCHAR(100) NOT NULL,\n                subject VARCHAR(200) NOT NULL,\n                message TEXT NOT NULL,\n                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n                is_read BOOLEAN DEFAULT FALSE\n            )\n        ");

        // Create portfolio_data table
        $pdo->exec("\n            CREATE TABLE IF NOT EXISTS portfolio_data (\n                id INT AUTO_INCREMENT PRIMARY KEY,\n                section VARCHAR(50) NOT NULL,\n                title VARCHAR(200),\n                content TEXT,\n                data_json JSON,\n                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n            )\n        ");

        // Insert default admin user if not exists
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = 'admin'");
        $stmt->execute();
        
        if ($stmt->fetchColumn() == 0) {
            $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("\n                INSERT INTO users (username, email, password, full_name, is_admin) \n                VALUES (?, ?, ?, ?, ?)\n            ");
            $stmt->execute(['admin', 'admin@portfolio.com', $hashedPassword, 'Portfolio Admin', 1]);
        }

        return true;
    } catch (PDOException $e) {
        error_log("Database initialization failed: " . $e->getMessage());
        return false;
    }
}

// Security functions
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Response helper functions
function sendJSONResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function sendErrorResponse($message, $statusCode = 400) {
    sendJSONResponse(['success' => false, 'message' => $message], $statusCode);
}

function sendSuccessResponse($data = [], $message = 'Success') {
    sendJSONResponse(['success' => true, 'message' => $message, 'data' => $data]);
}

// Initialize database on first run
if (!file_exists('database_initialized.txt')) {
    if (initializeDatabase()) {
        file_put_contents('database_initialized.txt', 'Database initialized on ' . date('Y-m-d H:i:s'));
    }
}
?>
