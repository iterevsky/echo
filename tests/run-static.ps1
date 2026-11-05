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

function Test-CssSyntax([string]$text) {
    $errors = New-Object System.Collections.Generic.List[string]
    $stack = New-Object System.Collections.Generic.Stack[object]
    $line = 1
    $inComment = $false
    $quote = [char]0
    for ($i = 0; $i -lt $text.Length; $i++) {
        $c = $text[$i]
        $next = if ($i + 1 -lt $text.Length) { $text[$i + 1] } else { [char]0 }
        if ($c -eq "`n") { $line++ }
        if ($inComment) {
            if ($c -eq '*' -and $next -eq '/') { $inComment = $false; $i++ }
            continue
        }
        if ($quote -ne [char]0) {
            if ($c -eq '\') {
                if ($next -eq [char]0) { $errors.Add("escape at end of file (line $line)"); continue }
                if ($next -eq "`n") { $line++ }
                $i++
                continue
            }
            if ($c -eq "`n" -or $c -eq "`r") {
                $errors.Add("unescaped newline in string (line $line)")
                $quote = [char]0
                continue
            }
            if ($c -eq $quote) { $quote = [char]0 }
            continue
        }
        if ($c -eq '/' -and $next -eq '*') { $inComment = $true; $i++; continue }
        if ($c -eq "'" -or $c -eq '"') { $quote = $c; continue }
        if ($c -eq '\') {
            if ($next -eq [char]0 -or $next -eq "`n" -or $next -eq "`r") {
                $errors.Add("invalid escape (line $line)")
            }
            if ($next -ne [char]0) { $i++ }
            continue
        }
        if ($c -eq '{' -or $c -eq '(' -or $c -eq '[') {
            $stack.Push(@{ Char = $c; Line = $line })
            continue
        }
        if ($c -eq '}' -or $c -eq ')' -or $c -eq ']') {
            $expected = switch ($c) { '}' { '{' } ')' { '(' } ']' { '[' } }
            if ($stack.Count -eq 0) {
                $errors.Add("unmatched closing '$c' (line $line)")
                continue
            }
            $open = $stack.Peek()
            if ($open.Char -ne $expected) {
                $errors.Add("closing '$c' does not match '$($open.Char)' opened at line $($open.Line) (line $line)")
                continue
            }
            [void]$stack.Pop()
        }
    }
    if ($inComment) { $errors.Add('unterminated comment') }
    if ($quote -ne [char]0) { $errors.Add("unterminated string (line $line)") }
    foreach ($open in $stack) { $errors.Add("unclosed '$($open.Char)' opened at line $($open.Line)") }
    return ,$errors
}

# files served by the website — changing any of them requires a CACHE_VERSION bump
$served = @('index.html','style.css','script.js','chapters.js','sw.js',
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
    $versionNow = [System.IO.File]::ReadAllText((Join-Path $root 'version.js'))
    $echoVersion = [regex]::Match($versionNow, "\bvar\s+ECHO_VERSION\s*=\s*'(v\d+)'").Groups[1].Value
    $nowV = [int]([regex]::Match($echoVersion, '^v(\d+)$').Groups[1].Value)
    $derivedCache = [regex]::IsMatch($swNow, "importScripts\('version\.js'\)\s*;") -and
                    [regex]::IsMatch($swNow, "const\s+CACHE_VERSION\s*=\s*'echo-'\s*\+\s*ECHO_VERSION\s*;")
    Check 'CACHE_VERSION is echo-<ECHO_VERSION> from version.js' ($derivedCache -and $nowV -gt 0)
    if (@($servedChanged).Count -gt 0) {
        Check "CACHE_VERSION bumped vs $BaseRef (v$baseV -> v$nowV; served files changed)" ($nowV -gt $baseV)
    } else {
        Write-Host "SKIP  CACHE_VERSION bump (no served files changed vs $BaseRef)"
    }
} finally { Pop-Location }

# --- required served files exist ---
foreach ($f in 'index.html','style.css','script.js','chapters.js','sw.js') {
    Check "exists: $f" (Test-Path (Join-Path $root $f))
}

# --- no external/CDN references in served files ---
$cdn = Select-String -Path (Join-Path $root 'index.html'),(Join-Path $root 'style.css') `
        -Pattern 'https?://(cdn|unpkg|cdnjs|fonts\.googleapis|fonts\.gstatic|jsdelivr)' -AllMatches
Check 'no CDN links in index.html/style.css' ($cdn.Count -eq 0)

# --- full-file CSS Syntax component-value/block parse ---
$cssErrors = Test-CssSyntax ([System.IO.File]::ReadAllText((Join-Path $root 'style.css')))
foreach ($cssError in $cssErrors) { Write-Host "CSS parse error: $cssError" }
Check 'CSS full-file parse (0 errors)' (@($cssErrors).Count -eq 0)

# --- viewport meta unchanged (zoom change is prohibited) ---
$vp = Select-String -Path (Join-Path $root 'index.html') -Pattern 'name="viewport" content="([^"]+)"'
Check 'viewport meta present and unchanged' ($vp -and $vp.Matches[0].Groups[1].Value -eq 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')

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

# --- JS syntax gate: node --check when Node.js is installed ---
$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    foreach ($js in 'script.js','sw.js') {
        node --check (Join-Path $root $js) 2>$null
        Check "node --check $js" ($LASTEXITCODE -eq 0)
    }
} else {
    Write-Host "SKIP  node --check (Node.js not installed — required by push-echo.cmd)"
}

if ($script:failures -gt 0) { Write-Host "`n$($script:failures) check(s) FAILED"; exit 1 }
Write-Host "`nAll static checks passed."
exit 0
