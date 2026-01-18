# Database setup (MySQL)

This project already includes helper scripts to create and initialize a MySQL database. Follow one of the two options below.

1) Quick web setup (recommended for local dev)

- Open `setup.php` in your browser (for example: http://localhost/your-project/setup.php). The script will create `portfolio_db` and the tables, and insert a default admin user (`admin` / `admin123`).
- After the script runs, delete `setup.php` for security.

2) Manual import

- Import `db/schema.sql` into your MySQL server:

```powershell
# In PowerShell run (adjust user and path):
mysql -u root -p < .\db\schema.sql
```

- Then optionally insert a default admin user (use PHP's `password_hash` or an equivalent to generate the password hash). The easiest is to run the `setup.php` once.

3) Configure credentials

- Edit `backend/config.php` to set your DB host, user, password and database name. The file already uses PDO and will auto-initialize tables when first run.

4) Endpoints

- Login: `backend/login.php` (POST username + password)
- Register: `backend/register.php` (POST username + email + password)
- Contact: `backend/contact.php` (POST name + email + subject + message)

Security notes
- Remove `setup.php` after using it.
- Use strong DB user credentials in production and don't store them in source control.
