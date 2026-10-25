# run-static.ps1 — structural regression checks that need no browser.
# Usage: pwsh tests/run-static.ps1 [-BaseRef main]
# Exit code 0 = all pass, 1 = failures. Prints PASS/FAIL per check.
param([string]$BaseRef = 'main')
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$script:failures = 0

function Check($name, $cond) {
    if ($cond) { Write-Host "PASS  $name" }
    else { Write-Host "FAIL  $name"; $script:failures++ }
}

# files served by the website — changing any of them requires a CACHE_VERSION bump
$served = @('index.html','style.css','script.js','chapters.js','sw.js','chapters-meta.js',
            'Zastavka.jpg','icons/','fonts/','images/')

Push-Location $root
try {
    # --- chapters.js untouched vs git HEAD ---
    $dirty = git status --porcelain -- chapters.js
    Check 'chapters.js unmodified vs git' ([string]::IsNullOrWhiteSpace($dirty))

    # --- CACHE_VERSION bump iff served files changed vs BaseRef ---
    $changed = @()
    try { $changed = git diff --name-only $BaseRef HEAD 2>$null } catch { $changed = @() }
    try { $changed += git diff --name-only $BaseRef 2>$null } catch {}  # uncommitted vs BaseRef
    if (-not $changed) { $changed = @() }
    $servedChanged = $changed | Where-Object {
        $p = $_ -replace '\\','/'
        ($served | Where-Object { $p -eq $_ -or ($_.EndsWith('/') -and $p.StartsWith($_)) })
    }
    $swBase = git show "${BaseRef}:sw.js" 2>$null | Out-String
    $baseV = [int]([regex]::Match($swBase, "echo-v(\d+)").Groups[1].Value)
    $swNow = [System.IO.File]::ReadAllText((Join-Path $root 'sw.js'))
    $nowV = [int]([regex]::Match($swNow, "CACHE_VERSION\s*=\s*'echo-v(\d+)'").Groups[1].Value)
    Check 'CACHE_VERSION parseable' ($nowV -gt 0)
    if (@($servedChanged).Count -gt 0) {
        Check "CACHE_VERSION bumped vs $BaseRef (v$baseV -> v$nowV; served files changed)" ($nowV -gt $baseV)
    } else {
        Write-Host "SKIP  CACHE_VERSION bump (no served files changed vs $BaseRef)"
    }
} finally { Pop-Location }

# --- required served files exist ---
foreach ($f in 'index.html','style.css','script.js','chapters.js','chapters-meta.js','sw.js') {
    Check "exists: $f" (Test-Path (Join-Path $root $f))
}

# --- no external/CDN references in served files ---
$cdn = Select-String -Path (Join-Path $root 'index.html'),(Join-Path $root 'style.css') `
        -Pattern 'https?://(cdn|unpkg|cdnjs|fonts\.googleapis|fonts\.gstatic|jsdelivr)' -AllMatches
Check 'no CDN links in index.html/style.css' ($cdn.Count -eq 0)

# --- viewport meta unchanged (zoom change is prohibited) ---
$vp = Select-String -Path (Join-Path $root 'index.html') -Pattern 'name="viewport" content="([^"]+)"'
Check 'viewport meta present and unchanged' ($vp -and $vp.Matches[0].Groups[1].Value -eq 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')

# --- chapters-meta.js consistent with index.html + chapters.js ---
$meta = [System.IO.File]::ReadAllText((Join-Path $root 'chapters-meta.js'))
$html = [System.IO.File]::ReadAllText((Join-Path $root 'index.html'))
$htmlCount = [regex]::Matches($html, 'class="contents-item"').Count
$metaCount = [int]([regex]::Match($meta, 'chapterCount:\s*(\d+)').Groups[1].Value)
Check "chapterCount ($metaCount) == contents-item count ($htmlCount)" ($metaCount -eq $htmlCount)

# regenerate meta and compare with committed file (line-ending insensitive)
& pwsh -NoProfile -File (Join-Path $root 'tests/build-meta.ps1') | Out-Null
$regen = [System.IO.File]::ReadAllText((Join-Path $root 'chapters-meta.js'))
Check 'chapters-meta.js is up to date with chapters.js' (($regen -replace "`r`n", "`n") -eq ($meta -replace "`r`n", "`n"))

# --- sw.js precache entries (CORE_FILES + EXTRA_FILES) reference existing files ---
$swListsOk = $true
foreach ($listName in 'CORE_FILES', 'EXTRA_FILES') {
    $pm = [regex]::Match($swNow, "(?s)$listName\s*=\s*\[(.*?)\]")
    if (-not $pm.Success) { Check "$listName list parseable" $false; $swListsOk = $false; continue }
    $entries = [regex]::Matches($pm.Groups[1].Value, "'\./([^']*)'") | ForEach-Object { $_.Groups[1].Value }
    foreach ($e in $entries) {
        $p = if ($e -eq '') { 'index.html' } else { $e }
        Check "precache file exists: $e" (Test-Path (Join-Path $root $p))
    }
}

if ($script:failures -gt 0) { Write-Host "`n$($script:failures) check(s) FAILED"; exit 1 }
Write-Host "`nAll static checks passed."
exit 0
