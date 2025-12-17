# Fix SIGNED_OUT Event Handler in AuthContext.jsx
# This script patches the SIGNED_OUT event handling to ignore it during initial page load

$filePath = "src\contexts\AuthContext.jsx"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Old SIGNED_OUT handler (complex setTimeout logic)
$oldPattern = @'
        } else if \(event === 'SIGNED_OUT'\) \{
          // ✅ CRITICAL FIX v3: SIGNED_OUT event handling
          // Khi reload, SIGNED_OUT có thể fire trước INITIAL_SESSION
          // → Đợi 1\.5s để INITIAL_SESSION kip fire, sau đó mới verify & logout
          console\.log\('\[AUTH\]\[Supabase\] SIGNED_OUT event received, verifying session\.\.\.'\);
          
          setTimeout\(async \(\) => \{
            // Verify session thực sự đã hết
            try \{
              const \{ data: \{ session: currentSession \} \} = await supabase\.auth\.getSession\(\);
              if \(!currentSession\) \{
                console\.log\('\[AUTH\]\[Supabase\] Session confirmed expired, logging out'\);
                setUser\(null\);
                try \{
                  localStorage\.removeItem\('authUser'\);
                \} catch \(storageError\) \{
                  // localStorage không available → bỏ qua
                \}
              \} else \{
                console\.log\('\[AUTH\]\[Supabase\] Session still exists, ignoring SIGNED_OUT event \(reload detected\)'\);
              \}
            \} catch \(err\) \{
              console\.warn\('\[AUTH\]\[Supabase\] Error verifying session on SIGNED_OUT:', err\);
              // Nếu lỗi, không logout - để safe
            \}
          \}, 1500\);
        \}
'@

# New SIGNED_OUT handler (simple check for initialSessionHandled)
$newCode = @'
        } else if (event === 'SIGNED_OUT') {
          // ✅ CRITICAL FIX v4: SIGNED_OUT event handling
          // BUG: Khi reload page, SIGNED_OUT có thể fire trước INITIAL_SESSION
          // → Nếu chưa handle INITIAL_SESSION, BỎ QUA SIGNED_OUT hoàn toàn
          
          if (!initialSessionHandled) {
            console.log('[AUTH][Supabase] SIGNED_OUT received but INITIAL_SESSION not handled yet, ignoring (page reload detected)');
            return; // ✅ BỎ QUA - không xử lý SIGNED_OUT khi đang page load
          }
          
          // ✅ Chỉ xử lý SIGNED_OUT nếu đã handle INITIAL_SESSION
          // (tức là user đang dùng app và logout, không phải reload page)
          console.log('[AUTH][Supabase] SIGNED_OUT event - user logged out');
          setUser(null);
          try {
            localStorage.removeItem('authUser');
          } catch (storageError) {
            // localStorage không available → bỏ qua
          }
        }
'@

# Apply replacement
$newContent = $content -replace $oldPattern, $newCode

# Write back to file
Set-Content -Path $filePath -Value $newContent -Encoding UTF8 -NoNewline

Write-Host "✅ Successfully patched AuthContext.jsx - SIGNED_OUT event now ignores page reload!" -ForegroundColor Green
