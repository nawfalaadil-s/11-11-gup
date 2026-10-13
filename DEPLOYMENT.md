# Deployment Guide - 11:11 Lucky Draw Platform

## Complete Step-by-Step Deployment Instructions

### Part 1: Supabase Setup (Backend)

#### 1.1 Create Supabase Project

1. Go to https://app.supabase.com/
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `11-11-lucky-draw`
   - Database Password: (generate a strong password and save it securely)
   - Region: Choose closest to your users (e.g., Mumbai for India)
5. Click "Create new project"
6. Wait 2-3 minutes for project initialization

#### 1.2 Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open the file `supabase/migrations/001_initial_schema.sql` from your project
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click "Run" or press Ctrl+Enter
7. Verify success message (should see "Success. No rows returned")

#### 1.3 Create First Admin User

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click "Add User" → "Create new user"
3. Fill in:
   - Email: your-admin-email@example.com
   - Password: (create a strong password)
   - Auto Confirm User: YES (check this box)
4. Click "Create User"
5. **Copy the User UUID** (you'll need this next)

6. Go back to **SQL Editor**
7. Run this query (replace the UUID and email):
```sql
INSERT INTO admin_profiles (id, email, full_name)
VALUES (
  'your-copied-user-uuid-here', 
  'your-admin-email@example.com', 
  'Your Full Name'
);
```

#### 1.4 Get API Credentials

1. Go to **Project Settings** (gear icon) → **API**
2. Copy these values:
   - Project URL (looks like: https://xxxxx.supabase.co)
   - anon/public key (the "anon" key)
3. **Save these securely** - you'll need them for deployment

#### 1.5 Configure Authentication

1. Go to **Authentication** → **URL Configuration**
2. Under "Redirect URLs", you'll add your Vercel URL after deployment
3. For now, add `http://localhost:5173/**` for local testing

### Part 2: Local Testing

#### 2.1 Install Dependencies

```bash
cd "E:\11 11gupies"
npm install
```

#### 2.2 Configure Environment

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase
```

#### 2.3 Test Locally

```bash
npm run dev
```

Visit http://localhost:5173 and test:
- Homepage loads
- Can view prizes and rules
- Registration form appears
- Admin login at http://localhost:5173/admin/login

### Part 3: Vercel Deployment (Frontend)

#### 3.1 Prepare Git Repository

```bash
git init
git add .
git commit -m "Initial commit: 11:11 Lucky Draw Platform"
```

Push to GitHub:
```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/your-username/11-11-lucky-draw.git
git branch -M main
git push -u origin main
```

#### 3.2 Deploy to Vercel

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: Vite
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variables:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
7. Click "Deploy"

**Option B: Via Vercel CLI**

```bash
npm i -g vercel
vercel login
vercel
# Follow prompts, add environment variables when asked
```

#### 3.3 Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

#### 3.4 Update Supabase Redirect URLs

1. After deployment, copy your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Go to Supabase dashboard → **Authentication** → **URL Configuration**
3. Add to "Redirect URLs":
   ```
   https://your-app.vercel.app/**
   ```
4. Save changes

### Part 4: Post-Deployment Configuration

#### 4.1 Initial Admin Setup

1. Visit your deployed site: `https://your-app.vercel.app/admin/login`
2. Log in with admin credentials created earlier
3. You should see the admin dashboard

#### 4.2 Configure Event Settings

1. Go to **Admin** → **Settings**
2. Fill in all fields:
   - Event name (default: 11:11 Lucky Draw)
   - Event date and registration deadline
   - Contact email and phone
   - Payment instructions (IMPORTANT: Add your actual payment details)
   - Eligibility criteria
   - Refund policy
   - Privacy notice
3. **DO NOT open registration yet**
4. Click "Save Settings"

#### 4.3 Update Prize Information

1. Go to **Admin** → **Prizes**
2. For each of the 3 prizes:
   - Click "Edit Prize"
   - Update prize name
   - Add variety name
   - Write description
   - Add image URL (upload images to Supabase Storage or use external URLs)
   - Uncheck "This is a placeholder image" when using real photos
   - Click "Save"

#### 4.4 Add Payment Instructions

1. Go to **Admin** → **Settings**
2. Scroll to "Payment Instructions"
3. Add complete payment details:
   ```
   Please transfer ₹30 to:
   
   UPI ID: your-upi-id@bank
   Phone Pay: +91-XXXXXXXXXX
   Google Pay: +91-XXXXXXXXXX
   
   Bank Details:
   Account Name: Your Name
   Account Number: XXXXXXXXXXXX
   IFSC Code: XXXXXX
   Bank: Your Bank Name
   
   After payment:
   1. Note down your transaction ID
   2. You can add it during registration or send it to us
   3. We will verify and send your entry token within 24 hours
   ```
4. Save settings

#### 4.5 Test the Complete Flow

1. Open an incognito window
2. Visit your site
3. Test registration:
   - Fill the form
   - Use a test mobile number
   - Complete registration
4. As admin:
   - Go to Admin → Entries
   - Find the test entry
   - Click "Verify"
   - Click "Token" to see token generation
   - Download the token
5. Test token verification:
   - Go to /verify
   - Enter the entry code
   - Verify it shows correct information

#### 4.6 Open Registration

Once everything is tested:
1. Go to **Admin** → **Settings**
2. Check "Registration is Open"
3. Click "Save Settings"
4. Registration is now live!

### Part 5: Managing the Event

#### During Registration Period

**Daily Tasks:**
1. Check Admin Dashboard for new registrations
2. Verify payments against your actual payment records
3. For each verified payment:
   - Click "Verify" in Admin → Entries
4. Respond to participant queries
5. Monitor remaining slots

**Verifying Payments:**
1. Check your UPI/bank account for actual payments
2. Match transaction IDs with registrations
3. Only verify when payment is confirmed
4. For mismatches, use the "Reject" button with a reason

#### Before Draw

**Pre-Draw Checklist:**
1. Close registration (Admin → Settings → uncheck "Registration is Open")
2. Verify all pending payments
3. Count total verified entries
4. Ensure at least 3 verified entries exist
5. Announce draw date/time to participants

#### Executing the Draw

1. Go to **Admin** → **Draw**
2. Review eligible entries count
3. Read the warning carefully
4. Click "Execute Lucky Draw"
5. Watch the animated wheel selection
6. Screenshot the results for records
7. Winners are automatically published

#### After Draw

1. Winners page is now public at `/winners`
2. Contact winners using their registration details:
   - Call their mobile number
   - Email if provided
3. Arrange prize collection/delivery
4. Keep records of prize distribution

### Part 6: Maintenance

#### Backup Database

Regular backups are automatic in Supabase, but you can also:
1. Go to Supabase → Database → Backups
2. Enable Point-in-Time Recovery (paid feature)
3. Or export data: Admin → Entries → Export CSV

#### Monitor Usage

1. Supabase dashboard shows:
   - Database size
   - API requests
   - Active users
2. Vercel dashboard shows:
   - Bandwidth usage
   - Function invocations
   - Build status

#### Security Best Practices

- Never share your .env file
- Keep service-role key secret (don't use in frontend)
- Regularly review admin users
- Check audit logs for suspicious activity
- Keep dependencies updated: `npm update`

### Troubleshooting

#### "Registration is closed" but settings show open
- Check registration deadline hasn't passed
- Verify capacity isn't reached (50 max)
- Clear browser cache and refresh

#### Admin can't log in
- Verify user exists in Authentication → Users
- Check admin_profiles table has matching entry
- Try password reset via Supabase

#### Tokens not generating
- Check payment status is "verified"
- Look for console errors in browser
- Verify html2canvas library is loaded

#### Draw button disabled
- Need at least 3 verified entries
- Check draw hasn't already been executed
- Verify you're logged in as admin

#### Images not loading
- Check image URLs are correct
- Ensure images are publicly accessible
- Try uploading to Supabase Storage

### Support & Updates

#### Getting Help
- Check browser console for errors
- Review Supabase logs
- Check Vercel deployment logs

#### Making Changes After Deployment

1. Make changes locally
2. Test with `npm run dev`
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. Vercel automatically redeploys on push

#### Database Changes

⚠️ **Be very careful with database changes after the event starts**

For safe changes:
1. Test in Supabase SQL Editor first
2. Backup data before running
3. Avoid deleting or modifying existing entries

---

## Quick Reference

### Important URLs
- Supabase Dashboard: https://app.supabase.com/
- Vercel Dashboard: https://vercel.com/
- Your Site: https://your-app.vercel.app
- Admin Login: https://your-app.vercel.app/admin/login

### Important Commands
```bash
npm install          # Install dependencies
npm run dev          # Run development server
npm run build        # Build for production
npm run preview      # Preview production build
vercel               # Deploy to Vercel
```

### Support Contacts
- Supabase Support: support@supabase.com
- Vercel Support: support@vercel.com

---

**Deployment Date**: October 13, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
