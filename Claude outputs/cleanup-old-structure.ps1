# cleanup-old-structure.ps1
# ---------------------------------------------------------------------------
# Run this ONCE from the project folder after Claude has written the new
# src/frontend, src/backend and src/shared folders.
#
# Claude can create and overwrite files on this computer but cannot DELETE
# them, so the old folders are still sitting there. Every file in them has
# already been copied to its new home — this script removes the leftovers.
#
#   cd C:\Users\Noorullah\Documents\PERSONAL\portfoliov2
#   powershell -ExecutionPolicy Bypass -File .\cleanup-old-structure.ps1
# ---------------------------------------------------------------------------

$old = @(
  "src\components",          # -> src\frontend\components  +  src\backend\admin-ui
  "src\hooks",               # -> src\frontend\hooks
  "src\utils",               # -> src\frontend\utils
  "src\assets",              # -> src\frontend\assets
  "src\data",                # -> src\backend\seed-data
  "src\lib",                 # -> src\backend\{db,cms,auth,media}
  "src\app\globals.css"      # -> src\frontend\styles\globals.css
)

# Safety check: refuse to delete anything if the new structure is not there.
$required = @("src\frontend\components\Site.jsx", "src\backend\cms\schema.js",
              "src\backend\db\index.js", "src\shared\config.js",
              "src\frontend\styles\globals.css")
$missing = $required | Where-Object { -not (Test-Path $_) }
if ($missing) {
  Write-Host "STOPPING - the new structure is incomplete. Missing:" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  Write-Host "Nothing was deleted. Ask Claude to re-send the files first."
  exit 1
}

Write-Host "New structure found. Removing the old folders..." -ForegroundColor Cyan
foreach ($p in $old) {
  if (Test-Path $p) {
    Remove-Item -Recurse -Force $p
    Write-Host "  removed  $p" -ForegroundColor Yellow
  } else {
    Write-Host "  already gone  $p" -ForegroundColor DarkGray
  }
}

Write-Host ""
Write-Host "Done. Now run:" -ForegroundColor Green
Write-Host "  npm run dev        # check the site and /admin still work"
Write-Host "  npm run build      # check the production build"
Write-Host "  git add -A"
Write-Host '  git commit -m "refactor: split src into frontend, backend and shared"'
Write-Host ""
Write-Host "git will record these as renames, so the file history is preserved."
