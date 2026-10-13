# Testing Guide - 11:11 Lucky Draw Platform

## Manual Testing Checklist

### Pre-Testing Setup

**Requirements:**
- Supabase project configured with migration executed
- At least one admin user created
- `.env` file configured
- Application running (dev or production)

---

## Phase 1: Public Features Testing

### 1.1 Homepage Testing

**Test Case: Homepage loads correctly**
- [ ] Navigate to `/`
- [ ] Verify underwater background with bubbles animates
- [ ] Check "11:11 Guppies Garage" and "11:11 Bettas" branding displays
- [ ] Verify event details show (price, prizes, slots)
- [ ] Test "Register Now" button functionality
- [ ] Verify responsive design on mobile (resize browser)
- [ ] Test reduced motion (enable in OS settings and refresh)

**Expected Results:**
- All content loads without errors
- Animations are smooth
- Responsive layout adjusts properly
- Reduced motion disables animations

---

### 1.2 Registration Form Testing

**Test Case: Valid registration**
- [ ] Navigate to `/register`
- [ ] Fill form with valid data:
  - Full Name: "Test User"
  - Mobile: "9876543210"
  - Email: "test@example.com"
  - Accept rules checkbox
- [ ] Submit form
- [ ] Note the entry code received
- [ ] Verify success message displays

**Expected Results:**
- Registration succeeds
- Entry code is generated (format: 1111-XXXXXXXX)
- Success page displays with next steps

**Test Case: Duplicate mobile number**
- [ ] Try registering again with same mobile number
- [ ] Different name but same mobile

**Expected Results:**
- Error: "Mobile number already registered"
- No new entry created

**Test Case: Invalid inputs**
- [ ] Try invalid mobile numbers:
  - Less than 10 digits: "12345"
  - Starts with invalid digit: "1234567890"
- [ ] Try invalid name: "A" (too short)
- [ ] Try without accepting rules

**Expected Results:**
- Validation errors display
- Form does not submit
- Error messages are clear

**Test Case: Registration capacity limit**
- [ ] Register 50 users (can use test script or manual)
- [ ] Try to register 51st user

**Expected Results:**
- First 50 succeed
- 51st shows "Maximum capacity reached"

**Test Case: Registration closed**
- [ ] Admin closes registration in settings
- [ ] Try to access `/register`

**Expected Results:**
- "Registration Closed" message displays
- Cannot submit form

---

### 1.3 Prizes Page Testing

**Test Case: Prizes display**
- [ ] Navigate to `/prizes`
- [ ] Verify 3 prize cards display
- [ ] Check prize numbers (1, 2, 3)
- [ ] Verify images load or placeholders show

**Expected Results:**
- All prizes visible
- Responsive grid layout
- Placeholder indicators if no real images

---

### 1.4 Rules Page Testing

**Test Case: Rules display**
- [ ] Navigate to `/rules`
- [ ] Scroll through all sections
- [ ] Verify event details show correctly
- [ ] Check payment instructions
- [ ] Verify contact information

**Expected Results:**
- All configured rules display
- Formatting is correct
- No missing information errors

---

### 1.5 Token Verification Testing

**Test Case: Valid token verification**
- [ ] Get an entry code from registration
- [ ] Navigate to `/verify`
- [ ] Enter the entry code
- [ ] Click "Verify"

**Expected Results:**
- Shows participant name
- Shows payment status (pending initially)
- Shows registration date
- No private data exposed (no full mobile/email)

**Test Case: Invalid token**
- [ ] Enter fake entry code: "1111-INVALID"
- [ ] Click "Verify"

**Expected Results:**
- Error message: "Invalid entry code"

---

### 1.6 Winners Page Testing (Before Draw)

**Test Case: Pre-draw state**
- [ ] Navigate to `/winners`
- [ ] Verify "Draw Not Yet Conducted" message

**Expected Results:**
- Informational message
- No winners displayed
- No errors

---

## Phase 2: Admin Features Testing

### 2.1 Admin Authentication

**Test Case: Admin login**
- [ ] Navigate to `/admin/login`
- [ ] Enter correct admin credentials
- [ ] Click "Sign In"

**Expected Results:**
- Redirects to `/admin` dashboard
- No errors

**Test Case: Invalid credentials**
- [ ] Try wrong password
- [ ] Try non-existent email

**Expected Results:**
- Error message displays
- Does not redirect
- Remains on login page

**Test Case: Non-admin user**
- [ ] Create regular user (not in admin_profiles)
- [ ] Try to log in

**Expected Results:**
- Error: "Access denied. Admin privileges required"

**Test Case: Protected routes**
- [ ] While logged out, try to access:
  - `/admin`
  - `/admin/entries`
  - `/admin/prizes`

**Expected Results:**
- Redirects to `/admin/login`
- Cannot access admin pages

---

### 2.2 Admin Dashboard Testing

**Test Case: Dashboard stats**
- [ ] Log in as admin
- [ ] View dashboard
- [ ] Verify stats cards show correct counts:
  - Total registrations
  - Pending payments
  - Verified entries
  - Remaining slots

**Expected Results:**
- All stats accurate
- Quick action buttons work
- Pending payments alert shows if applicable

---

### 2.3 Entry Management Testing

**Test Case: View entries**
- [ ] Navigate to Admin → Entries
- [ ] Verify table displays all entries
- [ ] Check columns show correct data

**Expected Results:**
- All entries visible
- Sortable by date
- Status badges color-coded

**Test Case: Search functionality**
- [ ] Search by name
- [ ] Search by mobile number
- [ ] Search by entry code

**Expected Results:**
- Results filter correctly
- No false matches

**Test Case: Status filter**
- [ ] Filter by "Pending"
- [ ] Filter by "Verified"
- [ ] Filter by "Rejected"
- [ ] Select "All Statuses"

**Expected Results:**
- Correct entries show for each filter

**Test Case: Payment verification**
- [ ] Find a pending entry
- [ ] Click "Verify" button
- [ ] Check audit log records action

**Expected Results:**
- Status changes to "verified"
- Verified timestamp recorded
- Admin ID logged
- Entry reloads in list

**Test Case: Payment rejection**
- [ ] Find a pending entry
- [ ] Click "Reject"
- [ ] Enter rejection reason
- [ ] Submit

**Expected Results:**
- Status changes to "rejected"
- Reason stored
- Action logged

**Test Case: Token generation**
- [ ] Find verified entry
- [ ] Click "Token" button
- [ ] Verify token modal opens

**Expected Results:**
- Modal displays entry token
- Shows participant name
- Shows entry code
- QR code generates
- "Download PNG" button works
- "Print" button works

**Test Case: CSV export**
- [ ] Click "Export CSV"
- [ ] Open downloaded file

**Expected Results:**
- CSV contains all filtered entries
- Columns match table structure
- Data is accurate

---

### 2.4 Prize Management Testing

**Test Case: Edit prize**
- [ ] Navigate to Admin → Prizes
- [ ] Click "Edit Prize" on Prize 1
- [ ] Update:
  - Prize name
  - Variety name
  - Description
  - Image URL
- [ ] Click "Save"

**Expected Results:**
- Changes save successfully
- Prize updates on public page
- No errors

**Test Case: Image placeholder toggle**
- [ ] Edit a prize
- [ ] Toggle "This is a placeholder image"
- [ ] Save

**Expected Results:**
- Checkbox state persists
- Placeholder indicator updates

---

### 2.5 Settings Management Testing

**Test Case: Update event settings**
- [ ] Navigate to Admin → Settings
- [ ] Update various fields:
  - Event name
  - Token price
  - Contact information
  - Rules text
- [ ] Click "Save Settings"

**Expected Results:**
- All changes persist
- Public pages reflect updates
- No data loss

**Test Case: Registration toggle**
- [ ] Toggle "Registration is Open"
- [ ] Save
- [ ] Check public registration page

**Expected Results:**
- Public page shows correct state
- Can't register when closed

**Test Case: Date configuration**
- [ ] Set event date
- [ ] Set registration deadline
- [ ] Save

**Expected Results:**
- Dates save correctly
- Display properly in IST timezone

---

### 2.6 Draw Execution Testing

**Test Case: Pre-draw validation**
- [ ] Navigate to Admin → Draw
- [ ] Check eligible entries count
- [ ] Verify button state

**Expected Results:**
- Shows accurate count of verified entries
- Button disabled if <3 entries
- Warning message clear

**Test Case: Execute draw**
- [ ] Ensure ≥3 verified entries exist
- [ ] Click "Execute Lucky Draw"
- [ ] Confirm action
- [ ] Watch animation

**Expected Results:**
- Wheel animates for each prize
- Three distinct winners selected
- Winners display after animation
- No duplicates
- Action cannot be repeated

**Test Case: Post-draw state**
- [ ] Refresh admin draw page
- [ ] Try to execute again

**Expected Results:**
- Shows "Draw Completed" state
- Displays winners
- Cannot re-execute

**Test Case: Public winners display**
- [ ] Navigate to public `/winners` page
- [ ] Verify results match admin

**Expected Results:**
- Winners display publicly
- Entry codes shown (not full names/contacts)
- Prize details correct

---

## Phase 3: Security Testing

### 3.1 Database Security

**Test Case: RLS policies**
- [ ] Open browser console
- [ ] Try to query entries table directly via Supabase client:
```javascript
const { data } = await supabase.from('entries').select('*')
console.log(data)
```

**Expected Results:**
- Returns empty or error (non-admin users)
- Only admins can read entries

**Test Case: Admin-only operations**
- [ ] As non-admin, try to call admin functions via console:
```javascript
await supabase.rpc('verify_payment', {...})
```

**Expected Results:**
- Permission denied errors

---

### 3.2 Input Validation

**Test Case: SQL injection attempts**
- [ ] Try injecting SQL in registration:
  - Name: `'; DROP TABLE entries; --`
  - Mobile: `' OR '1'='1`

**Expected Results:**
- Input sanitized
- No SQL execution
- Safe error handling

**Test Case: XSS attempts**
- [ ] Try injecting scripts:
  - Name: `<script>alert('XSS')</script>`

**Expected Results:**
- Script not executed
- Displayed as text

---

### 3.3 Capacity Enforcement

**Test Case: Concurrent registration**
- [ ] Open 5 browser tabs
- [ ] Start 49 registrations
- [ ] Submit 5 more simultaneously

**Expected Results:**
- Exactly 50 total succeed
- Excess fail with capacity error
- No race condition

---

## Phase 4: Mobile & Accessibility Testing

### 4.1 Responsive Design

**Test devices/viewports:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Check on each:**
- [ ] Layout adjusts properly
- [ ] Text remains readable
- [ ] Buttons are tappable
- [ ] Images scale correctly
- [ ] Navigation works

---

### 4.2 Accessibility

**Test Case: Keyboard navigation**
- [ ] Navigate site using only Tab key
- [ ] Test form submission with Enter
- [ ] Test buttons with Space

**Expected Results:**
- All interactive elements reachable
- Focus indicators visible
- Logical tab order

**Test Case: Reduced motion**
- [ ] Enable reduced motion in OS
- [ ] Reload application
- [ ] Check animations

**Expected Results:**
- Animations disabled or minimal
- Site remains functional

---

## Phase 5: Performance Testing

### 5.1 Load Time

**Test Case: Initial load**
- [ ] Clear cache
- [ ] Load homepage
- [ ] Check Network tab in DevTools

**Expected Results:**
- Page loads in <3 seconds
- No failed requests
- CSS/JS bundles reasonable size

---

### 5.2 Large Dataset

**Test Case: Many entries**
- [ ] Add 50 entries to database
- [ ] Load Admin → Entries page
- [ ] Test search/filter

**Expected Results:**
- Page loads smoothly
- Search is responsive
- No performance degradation

---

## Test Results Summary

**Date Tested**: _______________  
**Tested By**: _______________  
**Environment**: [ ] Development [ ] Production

### Results

| Category | Total Tests | Passed | Failed | Notes |
|----------|-------------|--------|--------|-------|
| Public Features | | | | |
| Admin Features | | | | |
| Security | | | | |
| Mobile/Accessibility | | | | |
| Performance | | | | |

### Critical Issues Found

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Recommendations

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## Automated Testing Script (Optional)

For basic smoke tests, you can use this script:

```javascript
// test-suite.js
import { supabase } from './src/lib/supabase.js';

async function runTests() {
  console.log('Starting automated tests...\n');
  
  // Test 1: Database connection
  try {
    const { data, error } = await supabase.from('event_settings').select('*').single();
    console.log('✓ Database connection successful');
  } catch (err) {
    console.error('✗ Database connection failed:', err.message);
  }
  
  // Test 2: Registration function exists
  try {
    const { data, error } = await supabase.rpc('create_entry', {
      p_full_name: 'Test User',
      p_mobile_number: '9999999999',
    });
    if (error && error.code !== '23505') { // Ignore duplicate error
      throw error;
    }
    console.log('✓ Registration function accessible');
  } catch (err) {
    console.error('✗ Registration function error:', err.message);
  }
  
  // Add more tests as needed...
  
  console.log('\nTests completed.');
}

runTests();
```

---

## Sign-off

**Testing Complete**: [ ] Yes [ ] No  
**Ready for Production**: [ ] Yes [ ] No  
**Approved By**: _______________  
**Date**: _______________
