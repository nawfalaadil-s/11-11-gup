# 🎯 IMMEDIATE NEXT STEPS - Run Locally

Your Supabase project ID: `adhjhinmevsxmdumtsli`

## 📝 **YOU NEED TO DO THIS NOW:**

### Step 1: Get Your Anon Key (2 minutes)

1. **Click this link**: https://supabase.com/dashboard/project/adhjhinmevsxmdumtsli/settings/api

2. Look for **"Project API keys"** section

3. Find the **"anon" "public"** key - it looks like this:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
   ```
   (It's a VERY long string)

4. **Copy that entire key**

### Step 2: Update .env File (1 minute)

1. Open this file in a text editor:
   ```
   E:\11 11gupies\.env
   ```

2. Replace `your-anon-key-here` with the key you copied

3. Save the file

**Your .env should now look like:**
```env
VITE_SUPABASE_URL=https://adhjhinmevsxmdumtsli.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

### Step 3: Run Database Migration (3 minutes)

1. **Click this link**: https://supabase.com/dashboard/project/adhjhinmevsxmdumtsli/sql/new

2. Open this file and copy ALL contents:
   ```
   E:\11 11gupies\supabase\migrations\001_initial_schema.sql
   ```

3. Paste into the SQL Editor on Supabase

4. Click **"Run"** or press **F5**

5. Wait for: ✅ **"Success. No rows returned"**

### Step 4: Create Admin User (3 minutes)

#### 4a. Create User Account
1. **Click**: https://supabase.com/dashboard/project/adhjhinmevsxmdumtsli/auth/users

2. Click **"Add User"** → **"Create new user"**

3. Enter:
   - **Email**: your-email@example.com
   - **Password**: YourPassword123!
   - ✅ **Check "Auto Confirm User"**

4. Click **"Create User"**

5. **📋 COPY THE USER UID** (you'll see it in the user list)

#### 4b. Make User an Admin
1. Go back to SQL Editor: https://supabase.com/dashboard/project/adhjhinmevsxmdumtsli/sql/new

2. Paste this (replace with YOUR values):
   ```sql
   INSERT INTO admin_profiles (id, email, full_name)
   VALUES (
     'paste-user-uid-here',
     'your-email@example.com',
     'Your Name'
   );
   ```

3. Click **"Run"**

4. Should see: ✅ **"Success. 1 row(s) returned"**

### Step 5: Start the App! (1 minute)

Open your terminal in the project folder and run:

```bash
npm run dev
```

Then open: **http://localhost:5173**

---

## 🧪 Quick Test After Starting

### Test 1: Public Site
- Go to: http://localhost:5173
- Should see underwater theme with bubbles
- Click "Prizes", "Rules" - should work

### Test 2: Admin Login
- Go to: http://localhost:5173/admin/login
- Enter your email and password from Step 4
- Should redirect to admin dashboard

---

## ⚠️ Troubleshooting

**If you see "Missing Supabase environment variables":**
- Check your `.env` file exists
- Make sure you replaced `your-anon-key-here` with actual key
- Restart the dev server (`Ctrl+C` then `npm run dev`)

**If admin login fails:**
- Make sure you ran Step 4b (add to admin_profiles table)
- Check the email matches exactly

**If you see database errors:**
- Make sure Step 3 (migration) completed successfully
- Try running the migration again

---

## 📚 More Help

Check these files for detailed guides:
- `QUICKSTART.md` - Detailed setup instructions
- `README.md` - Full project documentation
- `DEPLOYMENT.md` - Production deployment guide

---

**Current Status:**
- ✅ Project built and ready
- ✅ .env file created with your Supabase URL
- ⏳ Waiting for you to add anon key
- ⏳ Waiting for database migration
- ⏳ Waiting for admin user creation

**Once you complete Steps 1-4, you can run `npm run dev` and start using the app!**
