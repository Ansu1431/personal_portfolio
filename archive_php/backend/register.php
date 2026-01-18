<?php
session_start();
require_once 'config.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

try {
    $username = sanitizeInput($_POST['username'] ?? '');
    $email = sanitizeInput($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($email) || empty($password)) {
        sendErrorResponse('All fields are required');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendErrorResponse('Please provide a valid email address');
    }

    if (strlen($username) < 3 || strlen($username) > 50) {
        sendErrorResponse('Username must be between 3 and 50 characters');
    }

    if (strlen($password) < 6) {
        sendErrorResponse('Password must be at least 6 characters');
    }

    $pdo = getDBConnection();
    if (!$pdo) {
        sendErrorResponse('Database connection failed', 500);
    }

    // Check uniqueness
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
    $stmt->execute([$username, $email]);
    if ($stmt->fetch()) {
        sendErrorResponse('Username or email already in use');
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
    $ok = $stmt->execute([$username, $email, $hashed]);

    if (!$ok) {
        sendErrorResponse('Failed to create account', 500);
    }

    sendSuccessResponse([], 'Account created successfully. You can log in now.');

} catch (Exception $e) {
    error_log('Register error: ' . $e->getMessage());
    sendErrorResponse('An error occurred during registration', 500);
}
?>
