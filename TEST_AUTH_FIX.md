# 🧪 How to Test the Auth Fix Locally

## Step 1: Start Dev Server

```bash
npm run dev
```

Wait for it to start, then open: **http://localhost:5173**

## Step 2: Test Login with Supabase

1. Go to Login page
2. Click "Supabase Login" button (or similar)
3. Enter your Supabase credentials
4. Login successfully
5. You should see `[AUTH][Supabase]` logs in console

## Step 3: Test Reload (The Critical Test)

1. After successful login, open **Developer Console** (F12 or Right-click → Inspect → Console tab)
2. Look for these logs:
   ```
   [AUTH][Supabase] Initial session found on reload
   [AUTH][Supabase] User restored from initial session
   ```
3. Now press **F5** to reload page
4. Observe console logs - you should see:
   ```
   [AUTH][Supabase] Auth state changed: SIGNED_OUT
   [AUTH][Supabase] SIGNED_OUT event received, verifying session...
   [AUTH][Supabase] Auth state changed: INITIAL_SESSION
   [AUTH][Supabase] Initial session found on reload
   [AUTH][Supabase] User restored from initial session
   [AUTH][Supabase] Session still exists, ignoring SIGNED_OUT (reload detected)
   ```
5. **Result Check:**
   - ✅ User should STAY LOGGED IN (not redirected to login)
   - ✅ Navbar should show username
   - ✅ All pages accessible

## Step 4: Test Actual Logout

1. Click logout button
2. Console should show:
   ```
   [AUTH][Supabase] Auth state changed: SIGNED_OUT
   [AUTH][Supabase] SIGNED_OUT event received, verifying session...
   [AUTH][Supabase] Session confirmed expired, logging out
   ```
3. **Result Check:**
   - ✅ User redirected to login page
   - ✅ localStorage authUser removed
   - ✅ Can't access protected pages

## Step 5: Verify in DevTools

### Network Tab:
- No 401/403 errors on reload
- Auth requests succeed

### Console Tab:
- No red error messages
- Plenty of `[AUTH][Supabase]` logs (shows code is running)

### Application Tab (Storage):
- After login: localStorage has `authUser`
- After logout: localStorage `authUser` is removed

## ✅ Success Criteria

All of these should be TRUE:
- [ ] Login with Supabase works
- [ ] After reload, user stays logged in
- [ ] Logout button works
- [ ] Console shows all `[AUTH]` logs
- [ ] No errors in console
- [ ] Mobile behavior unchanged

If all ✅, the fix is working correctly!

## 🚀 Ready to Deploy

If local test passes:
1. Run: `npm run build`
2. Deploy `dist/` folder to your hosting (Netlify/Vercel/etc)
3. Test same steps on live site
4. Monitor console logs on live site

## 📞 Troubleshooting

**Problem**: No `[AUTH]` logs in console
- Solution: Clear browser cache (Ctrl+Shift+Delete)
- Solution: Hard reload (Ctrl+F5)
- Solution: Check that file hash changed in dist/assets/

**Problem**: User still logged out on reload
- Check if Supabase connection is working
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
- Check Supabase session persistence settings

**Problem**: Logout doesn't work
- Verify Supabase signOut is working
- Check localStorage is being cleared

