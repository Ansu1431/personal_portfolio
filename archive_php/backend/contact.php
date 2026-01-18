<?php
session_start();
require_once 'config.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

try {
    // Get form data
    $name = sanitizeInput($_POST['name'] ?? '');
    $email = sanitizeInput($_POST['email'] ?? '');
    $subject = sanitizeInput($_POST['subject'] ?? '');
    $message = sanitizeInput($_POST['message'] ?? '');

    // Validate input
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        sendErrorResponse('All fields are required');
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendErrorResponse('Please enter a valid email address');
    }

    // Validate name length
    if (strlen($name) < 2 || strlen($name) > 100) {
        sendErrorResponse('Name must be between 2 and 100 characters');
    }

    // Validate subject length
    if (strlen($subject) < 5 || strlen($subject) > 200) {
        sendErrorResponse('Subject must be between 5 and 200 characters');
    }

    // Validate message length
    if (strlen($message) < 10 || strlen($message) > 2000) {
        sendErrorResponse('Message must be between 10 and 2000 characters');
    }

    // Get database connection
    $pdo = getDBConnection();
    if (!$pdo) {
        sendErrorResponse('Database connection failed', 500);
    }

    // Insert message into database
    $stmt = $pdo->prepare("\n        INSERT INTO contact_messages (name, email, subject, message) \n        VALUES (?, ?, ?, ?)\n    ");
    
    $result = $stmt->execute([$name, $email, $subject, $message]);
    
    if (!$result) {
        sendErrorResponse('Failed to save message', 500);
    }

    // Optional: Send email notification to admin
    $adminEmail = 'admin@portfolio.com'; // Change this to your email
    $emailSubject = "New Contact Message: $subject";
    $emailBody = "\n        New contact message received:\n        \n        Name: $name\n        Email: $email\n        Subject: $subject\n        Message: $message\n        \n        Received on: " . date('Y-m-d H:i:s');
    
    // Uncomment the following lines if you want to send email notifications
    // mail($adminEmail, $emailSubject, $emailBody, "From: $email");

    sendSuccessResponse([], 'Message sent successfully! We will get back to you soon.');

} catch (Exception $e) {
    error_log("Contact form error: " . $e->getMessage());
    sendErrorResponse('An error occurred while sending your message', 500);
}
?>
