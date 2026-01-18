<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: index.php');
    exit;
}
$page = $_GET['page'] ?? 'projects';
function active($tab, $page) { return $tab === $page ? 'style="background:#FFD700;color:#221b10;"' : ''; }
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Dashboard - Portfolio CMS</title>
    <link rel="stylesheet" href="../../dashboard.css">
    <style>
        body { background: #18140c; color: #fff8e1; font-family: 'Segoe UI',sans-serif; }
        .admin-sidebar { width:220px; background:#221b10; height:100vh; position:fixed; left:0; top:0; padding:2rem 1rem; }
        .admin-sidebar h2 { color:#FFD700; margin-bottom:2rem; }
        .admin-sidebar a { display:block; color:#fff8e1; text-decoration:none; margin:1rem 0; padding:.7rem 1rem; border-radius:6px; transition:.2s; }
        .admin-sidebar a:hover { background:#FFD700; color:#221b10; }
        .admin-main { margin-left:240px; padding:2rem; }
        .section-title { font-size:2rem; color:#FFD700; margin-bottom:1.5rem; }
        .logout-btn { color:#FFD700; border:none; background:none; cursor:pointer; font-size:1rem; margin-top:2rem; }
    </style>
</head>
<body>
    <div class="admin-sidebar">
        <h2>CMS Admin</h2>
        <a href="?page=projects" <?=active('projects',$page)?>>Projects</a>
        <a href="?page=blog" <?=active('blog',$page)?>>Blog Posts</a>
        <a href="?page=testimonials" <?=active('testimonials',$page)?>>Testimonials</a>
        <a href="?page=resume" <?=active('resume',$page)?>>Resume</a>
        <form method="post" action="logout.php"><button class="logout-btn">Logout</button></form>
    </div>
    <div class="admin-main">
        <?php if ($page === 'projects'): ?>
            <div class="section-title">Projects</div>
            <p>Manage your portfolio projects here. (CRUD coming soon)</p>
        <?php elseif ($page === 'blog'): ?>
            <div class="section-title">Blog Posts</div>
            <p>Manage your blog posts here. (CRUD coming soon)</p>
        <?php elseif ($page === 'testimonials'): ?>
            <div class="section-title">Testimonials</div>
            <p>Manage testimonials here. (CRUD coming soon)</p>
        <?php elseif ($page === 'resume'): ?>
            <div class="section-title">Resume</div>
            <p>Manage your resume content here. (CRUD coming soon)</p>
        <?php else: ?>
            <div class="section-title">Welcome</div>
            <p>Welcome, <?=htmlspecialchars($_SESSION['admin_username'])?>! Use the sidebar to manage your content.</p>
        <?php endif; ?>
    </div>
</body>
</html>
