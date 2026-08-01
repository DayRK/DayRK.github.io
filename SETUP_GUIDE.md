# Portfolio Setup & Admin Guide

## Database Setup (MariaDB)

### 1. Install MariaDB
- Download and install from: https://mariadb.org/download/
- Or use `brew install mariadb` on macOS or package manager on Linux

### 2. Start MariaDB Service
```bash
# On Windows with MariaDB installed:
net start MariaDB

# Or start MariaDB Server manually through Services
```

### 3. Create Database and Tables
```bash
# Connect to MariaDB
mysql -u root -p

# Then run the setup.sql file:
source setup.sql;
```

Or copy-paste the contents of `setup.sql` directly into your MariaDB client.

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=portfolio
```

## Portfolio Features

### Main Portfolio Site
- **Responsive Design**: Fully optimized for mobile (< 640px), tablet (640px-1024px), and desktop (> 1024px)
- **Animated Hero**: Text cycles through different roles automatically
- **Projects Section**: Display all your projects with links
- **Technical Sandbox**: Display your skills organized by category
- **Footer**: Social media links

Access at: `http://localhost:3002` (or the port assigned)

### Admin Dashboard
- **URL**: `http://localhost:3002/admin`
- **Availability Status**: Change between:
  - Open to Commissions
  - Limited Availability
  - Closed for Commissions
- **Project Management**:
  - Add new projects with title, description, tech stack, and link
  - Edit existing projects
  - Delete projects

## Project Management

### Add a Project
1. Navigate to `/admin`
2. Fill in project details:
   - **Title**: Project name
   - **Summary**: Brief description
   - **Tech Stack**: Technologies used (comma-separated)
   - **Link**: Project URL
3. Click "Add Project"

### Edit a Project
1. Find the project in the list
2. Click "Edit"
3. Modify the details
4. Click "Save"

### Delete a Project
1. Find the project in the list
2. Click "Delete"
3. Confirm deletion

### Update Availability Status
1. Scroll to top of admin dashboard
2. Select status from dropdown
3. Click "Save"

## Responsive Design Breakdown

### Mobile (< 640px)
- Single column layout
- Large touch-friendly buttons
- Optimized font sizes (text-5xl headings)
- Full-width input fields
- Stacked card layouts

### Tablet (640px - 1024px)
- 2-column project grid
- Balanced spacing
- Medium font sizes (text-6xl headings)
- Side-by-side buttons where appropriate

### Desktop (> 1024px)
- 3-column project grid
- Large spacing and padding
- Large font sizes (text-7xl headings)
- Side-by-side hero content with profile card
- Full-width responsive containers

## Running the Project

### Development
```bash
npm run dev
```
Visit `http://localhost:3000` (or assigned port)

### Production Build
```bash
npm run build
npm start
```

## Troubleshooting

### Database Connection Error
- Ensure MariaDB is running
- Check `.env.local` credentials
- Verify database and tables exist (run `setup.sql`)

### Port Already in Use
- The app will automatically try ports 3001, 3002, etc.
- Or specify a port: `PORT=3000 npm run dev`

### Build Errors
- Clear cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Rebuild: `npm run build`

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Availability
- `GET /api/availability` - Get current status
- `PUT /api/availability` - Update status

## Security Notes

- Admin dashboard is currently open. For production, add authentication.
- Use environment variables for sensitive data (DB credentials)
- Consider adding API authentication tokens for production
- Use HTTPS in production
