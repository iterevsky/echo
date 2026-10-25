# build-meta.ps1 — generate chapters-meta.js, a STRUCTURAL mirror of chapters.js.
# The output contains no literary text: only chapter indices, emptiness flags,
# value lengths and publication dates. It is a testing aid, never site content.
# Usage: pwsh tests/build-meta.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$srcPath = Join-Path $root 'chapters.js'
$outPath = Join-Path $root 'chapters-meta.js'
$htmlPath = Join-Path $root 'index.html'

$src = [System.IO.File]::ReadAllText($srcPath)

function Get-ObjectBody($text, $declName) {
    $m = [regex]::Match($text, [regex]::Escape($declName) + '\s*=\s*\{')
    if (-not $m.Success) { throw "declaration '$declName' not found" }
    return $m.Index + $m.Length - 1  # index of the opening brace
}

# Walk a JS object literal starting at its '{', tracking strings/comments,
# and return top-level "key: value" spans (value span = raw text range).
function Get-TopLevelEntries($text, $openBrace) {
    $entries = New-Object System.Collections.Generic.List[object]
    $depth = 0
    $inStr = $null          # ', " or `
    $esc = $false
    $interpDepth = 0        # ${...} nesting inside a template literal
    $lineComment = $false
    $blockComment = $false
    $keyStart = -1
    $i = $openBrace
    $n = $text.Length
    while ($i -lt $n) {
        $c = $text[$i]
        $next = if ($i + 1 -lt $n) { $text[$i + 1] } else { [char]0 }

        if ($lineComment) { if ($c -eq "`n") { $lineComment = $false }; $i++; continue }
        if ($blockComment) { if ($c -eq '*' -and $next -eq '/') { $blockComment = $false; $i += 2; continue }; $i++; continue }

        if ($inStr) {
            if ($esc) { $esc = $false; $i++; continue }
            if ($c -eq '\') { $esc = $true; $i++; continue }
            if ($inStr -eq '`' -and $c -eq '$' -and $next -eq '{') { $interpDepth++; $i += 2; continue }
            if ($interpDepth -gt 0) {
                if ($c -eq '{') { $interpDepth++ }
                elseif ($c -eq '}') { $interpDepth-- }
                $i++; continue
            }
            if ($c -eq $inStr) { $inStr = $null }
            $i++; continue
        }

        if ($c -eq '/' -and $next -eq '/') { $lineComment = $true; $i += 2; continue }
        if ($c -eq '/' -and $next -eq '*') { $blockComment = $true; $i += 2; continue }
        if ($c -eq "'" -or $c -eq '"' -or $c -eq '`') { $inStr = $c; $i++; continue }
        if ($c -eq '{') {
            $depth++
            if ($depth -eq 1) { $keyStart = -1 }
            $i++; continue
        }
        if ($c -eq '}') {
            $depth--
            if ($depth -eq 0) {
                if ($keyStart -ge 0) {
                    $entries.Add(@{ KeyStart = $keyStart; ValueEnd = $i })
                }
                return , $entries
            }
            $i++; continue
        }
        if ($depth -eq 1) {
            if ($keyStart -lt 0 -and ($c -match '\d')) { $keyStart = $i }
            if ($c -eq ',' -and $keyStart -ge 0) {
                $entries.Add(@{ KeyStart = $keyStart; ValueEnd = $i })
                $keyStart = -1
            }
        }
        $i++
    }
    throw "unbalanced braces after $declName"
}

# --- PUBLISHED_AT: only the numeric keys are extracted ---
$paStart = Get-ObjectBody $src 'PUBLISHED_AT'
$paEntries = Get-TopLevelEntries $src $paStart
$publishedKeys = @()
foreach ($e in $paEntries) {
    $km = [regex]::Match($src.Substring($e.KeyStart, [Math]::Min(16, $src.Length - $e.KeyStart)), '^\s*(\d+)\s*:')
    if ($km.Success) { $publishedKeys += [int]$km.Groups[1].Value }
}

# --- chapterTexts: keys + value lengths (length = raw span of the value) ---
$ctStart = Get-ObjectBody $src 'chapterTexts'
$ctEntries = Get-TopLevelEntries $src $ctStart
$lengths = [ordered]@{}
foreach ($e in $ctEntries) {
    $head = $src.Substring($e.KeyStart, [Math]::Min(16, $src.Length - $e.KeyStart))
    $km = [regex]::Match($head, '^\s*(\d+)\s*:\s*')
    if (-not $km.Success) { continue }
    $key = [int]$km.Groups[1].Value
    $valStart = $e.KeyStart + $km.Length
    $valLen = $e.ValueEnd - $valStart
    # string quotes are not part of the text
    if ($valLen -ge 2) { $valLen -= 2 }
    $lengths.Add($key, $valLen)
}

# --- contents items in index.html give the total chapter count ---
$html = [System.IO.File]::ReadAllText($htmlPath)
$chapterCount = [regex]::Matches($html, 'class="contents-item"').Count
if ($chapterCount -eq 0) { throw 'no .contents-item found in index.html' }

$textIndices = @($lengths.Keys | Sort-Object)
$emptyIndices = @()
for ($i = 0; $i -lt $chapterCount; $i++) {
    if (-not $lengths.Contains($i)) { $emptyIndices += $i }
}

# sanity: keys must be valid chapter indices
foreach ($k in $textIndices) {
    if ($k -lt 0 -or $k -ge $chapterCount) { throw "chapterTexts key $k outside 0..$($chapterCount-1)" }
}
foreach ($k in $publishedKeys) {
    if ($k -lt 0 -or $k -ge $chapterCount) { throw "PUBLISHED_AT key $k outside 0..$($chapterCount-1)" }
}

$lenJson = ($lengths.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Name): $($_.Value)" }) -join ', '
$meta = @"
/* AUTO-GENERATED by tests/build-meta.ps1 - structural testing aid only.
   Contains NO literary text: chapter indices, value lengths, publish dates.
   Regenerate after chapters.js changes. Never edit by hand. */
const CHAPTERS_META = {
    chapterCount: $chapterCount,
    textIndices: [$($textIndices -join ', ')],
    emptyIndices: [$($emptyIndices -join ', ')],
    lengths: { $lenJson },
    publishedAt: [$($publishedKeys -join ', ')]
];
"@
[System.IO.File]::WriteAllText($outPath, $meta + "`n", [System.Text.UTF8Encoding]::new($false))
Write-Host ("chapters-meta.js: {0} chapters, {1} with text, {2} empty, {3} dated" -f $chapterCount, $textIndices.Count, $emptyIndices.Count, $publishedKeys.Count)
