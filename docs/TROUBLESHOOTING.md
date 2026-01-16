# Troubleshooting Guide

## Common Issues and Solutions

### Authentication Issues

#### Issue: "Profile not found" after signup

**Symptoms:**
- User successfully signs up
- Profile not created in `profiles` table
- User cannot access protected routes

**Solutions:**

1. **Check trigger exists:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. **Recreate trigger if missing:**
   ```sql
   -- See SETUP.md for trigger creation script
   ```

3. **Manually create profile:**
   ```sql
   INSERT INTO profiles (user_id, email, display_name, role)
   VALUES ('user-uuid', 'user@example.com', 'User', 'user');
   ```

#### Issue: "RLS Policy Error" when accessing data

**Symptoms:**
- Error: `Row-level security policy violation`
- Cannot read/write data even when logged in

**Solutions:**

1. **Check user role:**
   ```sql
   SELECT role FROM profiles WHERE user_id = auth.uid();
   ```

2. **Verify RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'table_name';
   ```

3. **Check if user is admin:**
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

#### Issue: Session expires immediately

**Symptoms:**
- User logs in successfully
- Session lost on page refresh
- Redirected to login page

**Solutions:**

1. **Check localStorage:**
   ```javascript
   // In browser console
   localStorage.getItem('sb-glingo-auth-token');
   ```

2. **Verify Supabase config:**
   ```javascript
   // Check environment variables
   console.log(import.meta.env.VITE_SUPABASE_URL);
   ```

3. **Clear browser storage:**
   ```javascript
   localStorage.clear();
   // Then login again
   ```

### Database Issues

#### Issue: Foreign key constraint errors

**Symptoms:**
- Error: `foreign key constraint "fk_name" violated`
- Cannot create child records

**Solutions:**

1. **Verify parent exists:**
   ```sql
   SELECT * FROM books WHERE id = 'book-id';
   ```

2. **Create parent first:**
   ```sql
   -- Create book before chapters
   INSERT INTO books (id, level, title) VALUES ('book-1', 'n5', 'Title');
   ```

3. **Check cascade deletes:**
   ```sql
   -- Verify ON DELETE CASCADE is set
   SELECT * FROM information_schema.table_constraints 
   WHERE constraint_name = 'fk_name';
   ```

#### Issue: JSONB queries return null

**Symptoms:**
- JSONB column exists but queries return null
- Data appears in Supabase Dashboard but not in app

**Solutions:**

1. **Check JSONB structure:**
   ```sql
   SELECT content FROM lessons WHERE id = 'lesson-id';
   ```

2. **Verify JSONB path:**
   ```sql
   -- Correct path
   SELECT content->'blocks' FROM lessons;
   
   -- Wrong path
   SELECT content->'blocks'->'data' FROM lessons;  -- May return null
   ```

3. **Use proper JSONB operators:**
   ```sql
   -- Use -> for object, ->> for text
   SELECT content->>'title' FROM lessons;
   ```

#### Issue: IndexedDB not available

**Symptoms:**
- Warning: "IndexedDB not available, using localStorage"
- Data not persisting

**Solutions:**

1. **Check browser support:**
   ```javascript
   // In browser console
   'indexedDB' in window;  // Should be true
   ```

2. **Check private browsing:**
   - IndexedDB disabled in incognito mode
   - Use normal browsing mode

3. **Clear IndexedDB:**
   ```javascript
   // In browser console
   indexedDB.deleteDatabase('glingo-db');
   // Reload page
   ```

### Content Loading Issues

#### Issue: Books not loading

**Symptoms:**
- Empty book list
- Loading spinner never stops

**Solutions:**

1. **Check Supabase connection:**
   ```javascript
   // In browser console
   console.log(import.meta.env.VITE_SUPABASE_URL);
   ```

2. **Verify RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'books';
   ```

3. **Check data exists:**
   ```sql
   SELECT COUNT(*) FROM books WHERE level = 'n5';
   ```

4. **Clear cache:**
   ```javascript
   // Clear IndexedDB and localStorage
   indexedDB.deleteDatabase('glingo-db');
   localStorage.clear();
   ```

#### Issue: Quiz questions not displaying

**Symptoms:**
- Quiz loads but questions are empty
- Error in console about questions format

**Solutions:**

1. **Check questions structure:**
   ```sql
   SELECT questions FROM quizzes WHERE id = 'quiz-id';
   ```

2. **Verify JSONB format:**
   ```javascript
   // Questions should be array
   {
     "questions": [
       { "id": 1, "text": "...", "options": [...] }
     ]
   }
   ```

3. **Check question parsing:**
   ```javascript
   // In component
   console.log('Questions:', JSON.parse(quiz.questions));
   ```

### Storage Issues

#### Issue: localStorage quota exceeded

**Symptoms:**
- Error: `QuotaExceededError`
- Cannot save data

**Solutions:**

1. **Clear old data:**
   ```javascript
   // Remove old keys
   Object.keys(localStorage).forEach(key => {
     if (key.startsWith('admin')) {
       localStorage.removeItem(key);
     }
   });
   ```

2. **Use IndexedDB:**
   - IndexedDB has much larger capacity (>100MB)
   - Automatically used if available

3. **Export and clear:**
   ```javascript
   // Export data first
   const data = await storageManager.exportAll();
   // Then clear
   localStorage.clear();
   ```

#### Issue: Data not syncing to Supabase

**Symptoms:**
- Data saved locally but not in Supabase
- Changes lost on different device

**Solutions:**

1. **Check userId:**
   ```javascript
   // Ensure userId is provided
   await storageManager.saveBooks('n5', books, userId);
   ```

2. **Verify user is admin:**
   ```sql
   SELECT role FROM profiles WHERE user_id = 'user-id';
   ```

3. **Check RLS policies:**
   ```sql
   -- Admin should have INSERT/UPDATE permissions
   SELECT * FROM pg_policies WHERE tablename = 'books';
   ```

### Build & Deployment Issues

#### Issue: Build fails on Vercel

**Symptoms:**
- Build error in Vercel logs
- Deployment fails

**Solutions:**

1. **Check build locally:**
   ```bash
   npm run build
   ```

2. **Verify Node version:**
   - Vercel uses Node 18+ by default
   - Check `package.json` engines

3. **Check environment variables:**
   - Verify all required variables are set in Vercel

#### Issue: Environment variables not working

**Symptoms:**
- Variables set in Vercel but undefined in app
- `import.meta.env.VITE_*` returns undefined

**Solutions:**

1. **Verify variable names:**
   - Must start with `VITE_` for Vite
   - Case-sensitive

2. **Redeploy after adding variables:**
   - Variables only available after redeploy

3. **Check environment scope:**
   - Ensure variables set for correct environment (Production/Preview)

### Performance Issues

#### Issue: Slow page loads

**Symptoms:**
- Pages take long to load
- Loading spinners visible for extended time

**Solutions:**

1. **Check bundle size:**
   ```bash
   npm run build
   # Check dist/assets/ folder sizes
   ```

2. **Enable code splitting:**
   - Already enabled via lazy loading
   - Verify in `main.jsx`

3. **Optimize images:**
   - Use WebP format
   - Compress images before upload

4. **Check network requests:**
   - Open DevTools → Network
   - Identify slow requests

#### Issue: Memory leaks

**Symptoms:**
- Browser becomes slow over time
- High memory usage

**Solutions:**

1. **Check event listeners:**
   ```javascript
   // Always cleanup
   useEffect(() => {
     const handler = () => {};
     window.addEventListener('event', handler);
     return () => window.removeEventListener('event', handler);
   }, []);
   ```

2. **Clear subscriptions:**
   ```javascript
   useEffect(() => {
     const unsubscribe = subscribe();
     return () => unsubscribe();
   }, []);
   ```

### Access Control Issues

#### Issue: Cannot access level/module

**Symptoms:**
- Access denied even when should have access
- Module shows as locked

**Solutions:**

1. **Check access control config:**
   ```sql
   SELECT access_control FROM app_settings WHERE key = 'access_control';
   ```

2. **Verify user role:**
   ```sql
   SELECT role FROM profiles WHERE user_id = auth.uid();
   ```

3. **Check localStorage:**
   ```javascript
   // Access control cached in localStorage
   localStorage.getItem('levelAccessControl');
   ```

4. **Clear cache:**
   ```javascript
   localStorage.removeItem('levelAccessControl');
   localStorage.removeItem('jlptAccessControl');
   // Reload page
   ```

## Debugging Tips

### Enable Debug Logging

```javascript
// In browser console
localStorage.setItem('debug', 'true');
// Reload page
```

### Check Supabase Connection

```javascript
// In browser console
import('./services/supabaseClient.js').then(({ supabase }) => {
  supabase.from('profiles').select('count').then(console.log);
});
```

### Inspect Storage

```javascript
// Check IndexedDB
const db = await indexedDB.open('glingo-db');
console.log('Stores:', db.objectStoreNames);

// Check localStorage
console.log('localStorage keys:', Object.keys(localStorage));
```

### Network Debugging

1. Open DevTools → Network
2. Filter by "Fetch/XHR"
3. Check failed requests
4. Inspect request/response headers

## Getting Help

### Check Logs

1. **Browser Console**: Check for JavaScript errors
2. **Network Tab**: Check failed API requests
3. **Supabase Logs**: Check Supabase Dashboard → Logs
4. **Vercel Logs**: Check Vercel Dashboard → Deployments → Logs

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Row-level security policy violation` | RLS blocking access | Check user role and policies |
| `Foreign key constraint violated` | Parent record missing | Create parent first |
| `QuotaExceededError` | Storage full | Clear old data or use IndexedDB |
| `Profile not found` | Trigger not working | Manually create profile |
| `Session expired` | Token invalid | Re-login |

### Still Stuck?

1. Check this troubleshooting guide
2. Review relevant documentation
3. Check Supabase/Vercel status pages
4. Review code comments in relevant files
5. Check Git history for recent changes
