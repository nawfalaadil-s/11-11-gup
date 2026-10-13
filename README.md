# 11:11 Lucky Draw Platform

A complete, production-ready full-stack web application for conducting secure lucky draws with manual payment verification, token generation, and animated winner selection.

## Features

### Public Features
- **Responsive Homepage** - Premium underwater-themed design with animated bubbles and particles
- **Prize Gallery** - Display of three exotic betta fish prizes with details
- **Event Rules** - Complete terms, conditions, and rules display
- **Registration System** - Validated registration form with duplicate prevention
- **Token Verification** - Public QR code verification system
- **Winners Announcement** - Public display of draw results

### Admin Features
- **Secure Authentication** - Supabase Auth-based admin login
- **Dashboard** - Overview of registrations, payments, and draw status
- **Entry Management** - View, search, filter, and verify payments
- **Token Generation** - Downloadable PNG tokens with QR codes
- **Prize Management** - Edit prize details and images
- **Event Settings** - Configure all event parameters
- **Secure Draw System** - Animated spinning wheel with backend-verified winner selection

## Technology Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS with custom underwater theme
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth
- **QR Codes**: qrcode library
- **Image Generation**: html2canvas
- **Routing**: React Router v7
- **Hosting**: Designed for Vercel (frontend) + Supabase (backend)

## Project Structure

```
11-11gupies/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ErrorMessage.jsx
│   │   ├── Footer.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── UnderwaterBackground.jsx
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.jsx
│   ├── lib/                # External service clients
│   │   └── supabase.js
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx
│   │   ├── PrizesPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── RulesPage.jsx
│   │   ├── VerifyTokenPage.jsx
│   │   ├── WinnersPage.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminDrawPage.jsx
│   │   ├── AdminEntriesPage.jsx
│   │   ├── AdminLoginPage.jsx
│   │   ├── AdminPrizesPage.jsx
│   │   └── AdminSettingsPage.jsx
│   ├── utils/              # Utility functions
│   │   ├── helpers.js
│   │   ├── qrcode.js
│   │   ├── tokenGenerator.js
│   │   └── validation.js
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
│   └── assets/             # Static assets (logos, images)
├── .env.example            # Environment variables template
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Vercel account (for deployment)
- Basic understanding of React and SQL

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd "E:\11 11gupies"
npm install
```

### 2. Set Up Supabase

1. **Create a new Supabase project**: https://app.supabase.com/

2. **Run the database migration**:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and execute the SQL

3. **Configure Authentication**:
   - Go to Authentication → Providers
   - Enable Email provider
   - Configure email templates if needed

4. **Create the first admin user**:
   - Go to Authentication → Users
   - Click "Add User"
   - Enter admin email and password
   - Copy the user's UUID
   
   - Go to SQL Editor and run:
   ```sql
   INSERT INTO admin_profiles (id, email, full_name)
   VALUES ('YOUR-USER-UUID-HERE', 'admin@example.com', 'Admin Name');
   ```

5. **Get your Supabase credentials**:
   - Go to Project Settings → API
   - Copy the Project URL and anon/public key

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Never commit the `.env` file to version control.

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (optional):
```bash
npm i -g vercel
```

2. **Push your code to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

3. **Deploy via Vercel Dashboard**:
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click "Deploy"

4. **Configure Supabase Redirect URLs**:
   - Go to your Supabase project → Authentication → URL Configuration
   - Add your Vercel deployment URL to "Redirect URLs"
   - Example: `https://your-app.vercel.app/**`

### Post-Deployment Configuration

1. **Test admin login**: Visit `/admin/login` and sign in with your admin credentials
2. **Configure event settings**: Go to Admin → Settings and fill in all event details
3. **Update prize information**: Go to Admin → Prizes and add prize details/images
4. **Add payment instructions**: In Settings, add your payment details for participants
5. **Open registration**: Toggle "Registration is Open" when ready

## Usage Guide

### For Administrators

#### Initial Setup
1. Log in at `/admin/login`
2. Configure event settings (dates, pricing, contact info)
3. Update prize information with actual photos
4. Add payment instructions and rules
5. Open registration when ready

#### Managing Registrations
1. View all entries in Admin → Entries
2. Search and filter by status
3. Verify payments manually against your payment records
4. Generate and download entry tokens for verified participants
5. Export data as CSV for records

#### Executing the Draw
1. Close registration in Settings
2. Verify all payments are processed
3. Go to Admin → Draw
4. Review eligible entries count
5. Click "Execute Lucky Draw"
6. Watch the animated selection
7. Winners are automatically announced

### For Participants

1. **Register**: Fill the registration form at `/register`
2. **Pay**: Complete payment as per instructions
3. **Wait**: Administrator will verify payment
4. **Get Token**: Download your entry token after verification
5. **Verify**: Check your token at `/verify`
6. **Results**: View winners at `/winners` after draw

## Security Features

- **Row Level Security (RLS)** on all database tables
- **Server-side validation** for all critical operations
- **Atomic capacity enforcement** prevents over-registration
- **Secure random winner selection** on the backend
- **No hardcoded credentials** or default passwords
- **Admin-only access** enforced at database level
- **Audit logging** for administrative actions
- **Duplicate prevention** by mobile number
- **Payment verification** required before token issuance

## Database Schema

### Main Tables
- `admin_profiles` - Administrator users
- `event_settings` - Single-row configuration table
- `prizes` - Three prize definitions
- `entries` - All participant registrations
- `draw_state` - Draw execution state (prevents duplicates)
- `winners` - Three selected winners
- `audit_logs` - Administrative action tracking

### Key Functions
- `create_entry()` - Atomically creates entries with capacity check
- `verify_payment()` - Marks payment as verified/rejected with audit
- `verify_token()` - Public token verification (minimal data exposure)
- `execute_draw()` - Secure random winner selection
- `get_draw_preview()` - Preview eligible entries without executing draw

## Testing Checklist

- [ ] Registration form validation works
- [ ] Duplicate mobile numbers are rejected
- [ ] Capacity limit (50) is enforced under concurrent requests
- [ ] Closed registration prevents new entries
- [ ] Only verified entries receive tokens
- [ ] QR codes verify correctly without exposing private data
- [ ] Admin login requires valid credentials
- [ ] Non-admin users cannot access admin pages
- [ ] Payment verification creates audit logs
- [ ] Draw selects exactly 3 distinct winners
- [ ] Draw cannot be executed twice
- [ ] Winners page shows correct results
- [ ] Responsive design works on mobile
- [ ] Reduced-motion preference is respected

## Important Notes

### Before Launch
- [ ] Complete all event settings and rules
- [ ] Add real prize photos
- [ ] Configure payment instructions with your actual payment details
- [ ] Test the entire flow with a test user
- [ ] Create admin account(s)
- [ ] Review privacy policy and refund policy
- [ ] Test on mobile devices

### During Event
- Monitor registrations in real-time
- Verify payments promptly
- Respond to participant queries
- Keep payment records synchronized

### After Draw
- Winners are immutable once selected
- Contact winners using provided details
- Arrange prize delivery/collection
- Keep all data for record-keeping

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

### Database Connection Issues
- Verify `.env` file exists and contains correct credentials
- Check Supabase project is active
- Ensure RLS policies are correctly applied

### Authentication Issues
- Verify admin user exists in `admin_profiles` table
- Check Supabase Auth email provider is enabled
- Verify redirect URLs in Supabase settings

### Registration Not Working
- Check `is_registration_open` is true in `event_settings`
- Verify capacity hasn't been reached
- Check browser console for errors

## Support

For issues, questions, or contributions, please contact the development team or create an issue in the repository.

## License

This project is proprietary software for the 11:11 Lucky Draw event.

---

**Built for 11:11 Guppies Garage** | **Sponsored by 11:11 Bettas**
