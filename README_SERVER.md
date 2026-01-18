Node.js backend (replaces PHP)

This project now includes a Node.js/Express backend to replace the previous PHP backend.

Quick start (local development)

1. Ensure you have Node.js (16+) and MySQL running.
2. From the project root, install dependencies:

```powershell
cd server
npm install
```

3. Configure DB credentials (optional via environment variables):

```powershell
# Example in PowerShell (adjust password/database):
$env:DB_HOST = 'localhost'; $env:DB_USER = 'root'; $env:DB_PASS = ''; $env:DB_NAME = 'portfolio_db'
node server.js
```

4. Or run with defaults (server expects database `portfolio_db` to exist). Start the server:

```powershell
node server/server.js
# Or from server folder
cd server; npm start
```

5. Open the site at http://localhost:3000/register.html or http://localhost:3000/login.html

Endpoints (relative to server root)
- POST /api/register  — {username,email,password}
- POST /api/login     — {username,password}
- POST /api/contact   — {name,email,subject,message}
- GET  /api/dashboard?action=overview|messages|profile

Database
- Use the existing SQL in `db/schema.sql` to create the database/tables if you haven't already:

```powershell
mysql -u root -p < .\db\schema.sql
```

Notes
- I left the original PHP files in the repository for reference (you can delete them once you're happy with the Node server). If you want, I can remove them for you.
