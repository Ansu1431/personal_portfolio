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
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                is_admin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        ");

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

        // Create portfolio_data table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS portfolio_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                section VARCHAR(50) NOT NULL,
                title VARCHAR(200),
                content TEXT,
                data_json JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        ");

        // Insert default admin user if not exists
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = 'admin'");
        $stmt->execute();
        
        if ($stmt->fetchColumn() == 0) {
            $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("
                INSERT INTO users (username, email, password, full_name, is_admin) 
                VALUES (?, ?, ?, ?, ?)
            ");
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