<?php
session_start();
require_once 'config.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    sendErrorResponse('Unauthorized', 401);
}

// Get database connection
$pdo = getDBConnection();
if (!$pdo) {
    sendErrorResponse('Database connection failed', 500);
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'overview':
        handleOverview();
        break;
    case 'messages':
        handleMessages();
        break;
    case 'profile':
        handleProfile();
        break;
    case 'settings':
        handleSettings();
        break;
    case 'update_profile':
        handleUpdateProfile();
        break;
    case 'change_password':
        handleChangePassword();
        break;
    case 'update_settings':
        handleUpdateSettings();
        break;
    default:
        sendErrorResponse('Invalid action', 400);
}

function handleOverview() {
    global $pdo;
    
    try {
        // Get total messages
        $stmt = $pdo->query("SELECT COUNT(*) FROM contact_messages");
        $totalMessages = $stmt->fetchColumn();
        
        // Get unread messages
        $stmt = $pdo->query("SELECT COUNT(*) FROM contact_messages WHERE is_read = 0");
        $unreadMessages = $stmt->fetchColumn();
        
        // Get messages this month
        $stmt = $pdo->query("SELECT COUNT(*) FROM contact_messages WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())");
        $thisMonth = $stmt->fetchColumn();
        
        // Get recent activity (last 10 messages)
        $stmt = $pdo->query("
            SELECT name, subject, created_at, 'message' as type 
            FROM contact_messages 
            ORDER BY created_at DESC 
            LIMIT 10
        ");
        $recentActivity = $stmt->fetchAll();
        
        // Format activity data
        $formattedActivity = array_map(function($activity) {
            return [
                'title' => 'New message from ' . $activity['name'],
                'description' => $activity['subject'],
                'type' => $activity['type'],
                'created_at' => $activity['created_at']
            ];
        }, $recentActivity);
        
        sendSuccessResponse([
            'totalMessages' => $totalMessages,
            'unreadMessages' => $unreadMessages,
            'thisMonth' => $thisMonth,
            'totalViews' => rand(100, 1000), // Mock data for now
            'recentActivity' => $formattedActivity
        ]);
        
    } catch (Exception $e) {
        error_log("Overview error: " . $e->getMessage());
        sendErrorResponse('Failed to load overview data', 500);
    }
}

function handleMessages() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("
            SELECT * FROM contact_messages 
            ORDER BY created_at DESC 
            LIMIT 50
        ");
        $messages = $stmt->fetchAll();
        
        sendSuccessResponse(['messages' => $messages]);
        
    } catch (Exception $e) {
        error_log("Messages error: " . $e->getMessage());
        sendErrorResponse('Failed to load messages', 500);
    }
}

function handleProfile() {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("SELECT id, username, email, full_name FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $profile = $stmt->fetch();
        
        if (!$profile) {
            sendErrorResponse('Profile not found', 404);
        }
        
        sendSuccessResponse(['profile' => $profile]);
        
    } catch (Exception $e) {
        error_log("Profile error: " . $e->getMessage());
        sendErrorResponse('Failed to load profile', 500);
    }
}

function handleSettings() {
    global $pdo;
    
    try {
        // Get portfolio settings from portfolio_data table
        $stmt = $pdo->query("
            SELECT section, data_json 
            FROM portfolio_data 
            WHERE section IN ('general', 'contact', 'about')
        ");
        $settingsData = $stmt->fetchAll();
        
        $settings = [
            'portfolio_title' => 'Your Name - Portfolio',
            'about_me' => '',
            'contact_email' => '',
            'phone_number' => '',
            'location' => ''
        ];
        
        foreach ($settingsData as $data) {
            $jsonData = json_decode($data['data_json'], true);
            if ($jsonData) {
                $settings = array_merge($settings, $jsonData);
            }
        }
        
        sendSuccessResponse(['settings' => $settings]);
        
    } catch (Exception $e) {
        error_log("Settings error: " . $e->getMessage());
        sendErrorResponse('Failed to load settings', 500);
    }
}

function handleUpdateProfile() {
    global $pdo;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendErrorResponse('Method not allowed', 405);
    }
    
    try {
        $fullName = sanitizeInput($_POST['full_name'] ?? '');
        $email = sanitizeInput($_POST['email'] ?? '');
        $username = sanitizeInput($_POST['username'] ?? '');
        
        // Validate input
        if (empty($fullName) || empty($email) || empty($username)) {
            sendErrorResponse('All fields are required');
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendErrorResponse('Please enter a valid email address');
        }
        
        // Check if username or email already exists (excluding current user)
        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM users 
            WHERE (username = ? OR email = ?) AND id != ?
        ");
        $stmt->execute([$username, $email, $_SESSION['user_id']]);
        
        if ($stmt->fetchColumn() > 0) {
            sendErrorResponse('Username or email already exists');
        }
        
        // Update profile
        $stmt = $pdo->prepare("
            UPDATE users 
            SET full_name = ?, email = ?, username = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
        
        $result = $stmt->execute([$fullName, $email, $username, $_SESSION['user_id']]);
        
        if ($result) {
            // Update session data
            $_SESSION['full_name'] = $fullName;
            $_SESSION['email'] = $email;
            $_SESSION['username'] = $username;
            
            sendSuccessResponse([], 'Profile updated successfully');
        } else {
            sendErrorResponse('Failed to update profile');
        }
        
    } catch (Exception $e) {
        error_log("Update profile error: " . $e->getMessage());
        sendErrorResponse('Failed to update profile', 500);
    }
}

function handleChangePassword() {
    global $pdo;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendErrorResponse('Method not allowed', 405);
    }
    
    try {
        $currentPassword = $_POST['current_password'] ?? '';
        $newPassword = $_POST['new_password'] ?? '';
        $confirmPassword = $_POST['confirm_password'] ?? '';
        
        // Validate input
        if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
            sendErrorResponse('All fields are required');
        }
        
        if ($newPassword !== $confirmPassword) {
            sendErrorResponse('New passwords do not match');
        }
        
        if (strlen($newPassword) < 6) {
            sendErrorResponse('Password must be at least 6 characters');
        }
        
        // Verify current password
        $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        
        if (!password_verify($currentPassword, $user['password'])) {
            sendErrorResponse('Current password is incorrect');
        }
        
        // Update password
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("
            UPDATE users 
            SET password = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
        
        $result = $stmt->execute([$hashedPassword, $_SESSION['user_id']]);
        
        if ($result) {
            sendSuccessResponse([], 'Password changed successfully');
        } else {
            sendErrorResponse('Failed to change password');
        }
        
    } catch (Exception $e) {
        error_log("Change password error: " . $e->getMessage());
        sendErrorResponse('Failed to change password', 500);
    }
}

function handleUpdateSettings() {
    global $pdo;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendErrorResponse('Method not allowed', 405);
    }
    
    try {
        $portfolioTitle = sanitizeInput($_POST['portfolio_title'] ?? '');
        $aboutMe = sanitizeInput($_POST['about_me'] ?? '');
        $contactEmail = sanitizeInput($_POST['contact_email'] ?? '');
        $phoneNumber = sanitizeInput($_POST['phone_number'] ?? '');
        $location = sanitizeInput($_POST['location'] ?? '');
        
        // Validate email if provided
        if (!empty($contactEmail) && !filter_var($contactEmail, FILTER_VALIDATE_EMAIL)) {
            sendErrorResponse('Please enter a valid contact email address');
        }
        
        // Save general settings
        $generalSettings = [
            'portfolio_title' => $portfolioTitle,
            'about_me' => $aboutMe
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO portfolio_data (section, data_json) 
            VALUES ('general', ?) 
            ON DUPLICATE KEY UPDATE data_json = ?
        ");
        $jsonData = json_encode($generalSettings);
        $stmt->execute([$jsonData, $jsonData]);
        
        // Save contact settings
        $contactSettings = [
            'contact_email' => $contactEmail,
            'phone_number' => $phoneNumber,
            'location' => $location
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO portfolio_data (section, data_json) 
            VALUES ('contact', ?) 
            ON DUPLICATE KEY UPDATE data_json = ?
        ");
        $jsonData = json_encode($contactSettings);
        $stmt->execute([$jsonData, $jsonData]);
        
        sendSuccessResponse([], 'Portfolio settings updated successfully');
        
    } catch (Exception $e) {
        error_log("Update settings error: " . $e->getMessage());
        sendErrorResponse('Failed to update settings', 500);
    }
}
?> 