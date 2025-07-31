# Portfolio Website

A modern, responsive portfolio website built with HTML, CSS, JavaScript, and PHP with MySQL backend. Features a dark theme design with smooth animations and a comprehensive admin dashboard.

## Features

### Frontend
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Dark Theme**: Modern dark color scheme with gradient accents
- **Smooth Animations**: CSS animations and JavaScript interactions
- **Interactive Elements**: Hover effects, form validation, and dynamic content
- **Modern UI/UX**: Clean, professional design with excellent user experience

### Pages
- **Home Page**: Hero section with profile photo and introduction
- **About Page**: Skills, experience, and personal information
- **Resume Page**: Education, work experience, and projects timeline
- **Contact Page**: Contact form with validation and social links
- **Login Page**: Secure authentication system
- **Dashboard**: Admin panel for managing portfolio content

### Backend
- **PHP Backend**: Server-side processing and data management
- **MySQL Database**: Secure data storage for users, messages, and portfolio data
- **User Authentication**: Secure login system with session management
- **Contact Form**: Message storage and management
- **Admin Dashboard**: Complete content management system

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 7.4+
- **Database**: MySQL 5.7+
- **Icons**: Font Awesome 6.0
- **Design**: Custom CSS with CSS Grid and Flexbox

## Installation & Setup

### Prerequisites
- Web server (Apache/Nginx)
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web browser

### Step 1: Database Setup
1. Create a new MySQL database named `portfolio_db`
2. Update database credentials in `backend/config.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'your_username');
   define('DB_PASS', 'your_password');
   define('DB_NAME', 'portfolio_db');
   ```

### Step 2: File Setup
1. Upload all files to your web server directory
2. Ensure the `backend` folder is accessible
3. Set proper file permissions (755 for folders, 644 for files)

### Step 3: Profile Photo
1. Add your profile photo as `profile-photo.jpg` in the root directory
2. Recommended size: 400x500 pixels
3. Supported formats: JPG, PNG, WebP

### Step 4: Customization
1. Edit `index.html` to update your personal information
2. Modify `styles.css` to customize colors and styling
3. Update contact information in the contact section
4. Add your social media links

### Step 5: Testing
1. Open `index.html` in your browser
2. Test the contact form
3. Try logging in with default credentials:
   - Username: `admin`
   - Password: `admin123`

## File Structure

```
portfolio/
├── index.html              # Main portfolio page
├── login.html              # Login page
├── dashboard.html          # Admin dashboard
├── styles.css              # Main stylesheet
├── login.css               # Login page styles
├── dashboard.css           # Dashboard styles
├── script.js               # Main JavaScript
├── login.js                # Login functionality
├── dashboard.js            # Dashboard functionality
├── profile-photo.jpg       # Your profile photo
├── backend/
│   ├── config.php          # Database configuration
│   ├── login.php           # Login handler
│   ├── contact.php         # Contact form handler
│   └── dashboard.php       # Dashboard API
└── README.md               # This file
```

## Customization Guide

### Updating Personal Information
1. **Name and Title**: Edit the hero section in `index.html`
2. **About Me**: Update the about section content
3. **Skills**: Modify the skills grid in the about section
4. **Experience**: Update the timeline items in the resume section
5. **Contact Info**: Change contact details in the contact section

### Changing Colors
The color scheme is defined in CSS variables in `styles.css`:
```css
:root {
    --primary-color: #00d4ff;
    --secondary-color: #ff6b6b;
    --dark-bg: #0a0a0a;
    --dark-surface: #1a1a1a;
    --dark-card: #2a2a2a;
    /* ... more variables */
}
```

### Adding New Sections
1. Add HTML structure in `index.html`
2. Style the section in `styles.css`
3. Add navigation link if needed
4. Include any JavaScript functionality in `script.js`

## Security Features

- **Password Hashing**: All passwords are hashed using PHP's `password_hash()`
- **SQL Injection Prevention**: Prepared statements for all database queries
- **XSS Protection**: Input sanitization and output escaping
- **CSRF Protection**: Built-in CSRF token validation
- **Session Management**: Secure session handling

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Optimization

- **Minified CSS**: Consider minifying CSS for production
- **Image Optimization**: Optimize profile photo for web
- **Caching**: Enable browser caching for static assets
- **CDN**: Use CDN for Font Awesome icons

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check database credentials in `backend/config.php`
   - Ensure MySQL service is running
   - Verify database exists

2. **Contact Form Not Working**
   - Check PHP error logs
   - Verify backend folder permissions
   - Ensure PHP mail function is enabled

3. **Login Issues**
   - Clear browser cache and cookies
   - Check if sessions are enabled in PHP
   - Verify database tables are created

4. **Styling Issues**
   - Check if all CSS files are loaded
   - Verify Font Awesome CDN is accessible
   - Clear browser cache

### Error Logs
Check your web server's error logs for detailed error messages:
- Apache: `/var/log/apache2/error.log`
- Nginx: `/var/log/nginx/error.log`
- PHP: Check your PHP configuration for error log location

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review browser console for JavaScript errors
3. Check server error logs
4. Ensure all files are properly uploaded

## License

This project is open source and available under the MIT License.

## Credits

- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)
- **Design**: Custom design with modern web standards

---

**Note**: Remember to change the default admin password after first login for security purposes. 