# 🚀 Quick Start Guide - Running Locally

## Step 1: Get Your Supabase Anon Key

You need the **anon/public key** from your Supabase project.

### How to find it:
1. Go to: https://supabase.com/dashboard/project/adhjhinmevsxmdumtsli/settings/api
2. Look for the **"Project API keys"** section
3. Copy the **"anon" "public"** key (it's a long string starting with `eyJ...`)

## Step 2: Update Your .env File

I've created a `.env` file for you. Now you need to add your anon key:

1. Open the file: `E:\11 11gupies\.env`
2. Replace `your-anon-key-here` with the actual anon key you copied
3. Save the file

Your `.env` should look like this:
```env
VITE_SUPABASE_URL=https://adhjhinmevsxmdumtsli.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZi...
```

## Step 3: Run Database Migration

Before starting the app, you need to create the database tables:

1. Go to: https://supabase.com/dashboard/project/adhjhinmevsxmdumtsli/editor
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Open the file: `E:\11 11gupies\supabase\migrations\001_initial_schema.sql`
5. Copy ALL the contents (it's about 600 lines)
6. Paste into the SQL Editor
7. Click **"Run"** (or press F5)
8. Wait for success message: "Success. No rows returned"

## Step 4: Create Your First Admin User

### 4.1 Create User in Supabase Auth
1. Go to: https://supabase.com/dashboard/project/adhjhinmevsxmdumtsli/auth/users
2. Click **"Add User"** → **"Create new user"**
3. Fill in:
   - Email: `your-email@example.com` (use your real email)
   - Password: `YourStrongPassword123!` (choose a secure password)
   - ✅ Check "Auto Confirm User"
4. Click **"Create User"**
5. **IMPORTANT**: Copy the **User UID** (looks like: `12345678-1234-1234-1234-123456789abc`)

### 4.2 Make User an Admin
1. Go back to SQL Editor: https://supabase.com/dashboard/project/adhjhinmevsxmdumtsli/editor
2. Click **"New Query"**
3. Paste this SQL (replace with YOUR user ID and email):

```sql
INSERT INTO admin_profiles (id, email, full_name)
VALUES (
  'YOUR-USER-UID-HERE',
  'your-email@example.com',
  'Your Full Name'
);
```

4. Click **"Run"**
5. You should see: "Success. 1 row(s) returned"

## Step 5: Start the Development Server

Now you're ready to run the app locally!

```bash
cd "E:\11 11gupies"
npm run dev
```

You should see:
```
VITE v8.3.4  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

## Step 6: Test the Application

### Test Public Site:
1. Open browser: http://localhost:5173/
2. You should see the underwater homepage
3. Try clicking around: Prizes, Rules, Register

### Test Admin Login:
1. Go to: http://localhost:5173/admin/login
2. Enter the email and password you created in Step 4.1
3. Click "Sign In"
4. You should be redirected to the admin dashboard

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution**: Make sure your `.env` file exists and has both values filled in.

### Issue: "Invalid API key"
**Solution**: Double-check you copied the **anon** key (not service_role key) from Supabase.

### Issue: "Access denied" when logging in as admin
**Solution**: Make sure you ran Step 4.2 to add your user to the `admin_profiles` table.

### Issue: "relation does not exist" errors
**Solution**: You need to run the database migration (Step 3).

### Issue: Build errors with Tailwind
**Solution**: Already fixed! The PostCSS config has been updated.

## What to Do After It's Running

### 1. Configure Event Settings
1. Log in as admin
2. Go to **Admin** → **Settings**
3. Fill in all fields (especially payment instructions)
4. **Don't open registration yet**

### 2. Update Prize Information
1. Go to **Admin** → **Prizes**
2. Edit each prize with actual details
3. Add prize images (you can use URLs or upload to Supabase Storage)

### 3. Test Registration Flow
1. Open incognito window
2. Go to http://localhost:5173/register
3. Register with a test mobile number
4. As admin, verify the payment
5. Download the token

### 4. When Ready
1. Open registration in Admin → Settings
2. Share the site URL with participants

## Quick Command Reference

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install dependencies (if needed)
npm install
```

## Need Help?

If you get stuck:
1. Check the browser console (F12) for errors
2. Check the terminal where `npm run dev` is running
3. Verify your `.env` file has the correct values
4. Make sure the database migration ran successfully

---

**Ready to start?** Follow the steps above in order! 🚀
