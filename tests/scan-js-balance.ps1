# scan-js-balance.ps1 — brace/paren/bracket balance scan for a JS file,
# tracking strings, template literals, escapes, line/block comments.
# Prints the depth at EOF and the deepest unclosed opening locations.
param([string]$File)
$ErrorActionPreference = 'Stop'
$t = [System.IO.File]::ReadAllText($File)
$depth = 0
$stack = New-Object System.Collections.Generic.Stack[object]
$inStr = $null; $esc = $false; $interp = New-Object System.Collections.Generic.Stack[int]
$lineComment = $false; $blockComment = $false
$line = 1
$trace = New-Object System.Collections.Generic.Queue[string]
for ($i = 0; $i -lt $t.Length; $i++) {
    $c = $t[$i]
    $next = if ($i + 1 -lt $t.Length) { $t[$i + 1] } else { [char]0 }
    if ($c -eq "`n") { $line++ }
    if ($lineComment) { if ($c -eq "`n") { $lineComment = $false }; continue }
    if ($blockComment) { if ($c -eq '*' -and $next -eq '/') { $blockComment = $false; $i++; continue }; continue }
    # regex literal heuristic: '/' after an operator/opener/keyword-ish position
    if ($c -eq '/' -and $next -ne '/' -and $next -ne '*') {
        $j = $i - 1
        while ($j -ge 0 -and ($t[$j] -eq ' ' -or $t[$j] -eq "`t" -or $t[$j] -eq "`n" -or $t[$j] -eq "`r")) { $j-- }
        $prev = if ($j -ge 0) { $t[$j] } else { ';' }
        if ('(,=:[!&|?{};+-*%<>~^'.Contains([string]$prev)) {
            $i++
            $inClass = $false; $resc = $false
            while ($i -lt $t.Length) {
                $rc = $t[$i]
                if ($resc) { $resc = $false; $i++; continue }
                if ($rc -eq '\') { $resc = $true; $i++; continue }
                if ($rc -eq '[') { $inClass = $true; $i++; continue }
                if ($rc -eq ']') { $inClass = $false; $i++; continue }
                if ($rc -eq '/' -and -not $inClass) { break }
                $i++
            }
            continue
        }
    }
    if ($inStr) {
        if ($esc) { $esc = $false; continue }
        if ($c -eq '\') { $esc = $true; continue }
        if ($inStr -eq '`' -and $c -eq '$' -and $next -eq '{') {
            $interp.Push($depth); $stack.Push(@{ ch = '${'; line = $line }); $depth++; $i++; $inStr = $null; continue
        }
        if ($c -eq $inStr) { $inStr = $null }
        continue
    }
    if ($c -eq '/' -and $next -eq '/') { $lineComment = $true; $i++; continue }
    if ($c -eq '/' -and $next -eq '*') { $blockComment = $true; $i++; continue }
    if ($c -eq "'" -or $c -eq '"' -or $c -eq '`') { $inStr = $c; continue }
    if ($c -eq '{' -or $c -eq '(' -or $c -eq '[') {
        $stack.Push(@{ ch = $c; line = $line }); $depth++
        $trace.Enqueue("open $c @$line"); if ($trace.Count -gt 12) { [void]$trace.Dequeue() }
        continue
    }
    if ($c -eq '}' -or $c -eq ')' -or $c -eq ']') {
        if ($stack.Count -eq 0) {
            Write-Host "EXTRA closer '$c' at line $line; recent:"
            $trace | ForEach-Object { Write-Host "  $_" }
            exit 1
        }
        $open = $stack.Pop(); $depth--
        $trace.Enqueue("close $c (matches $($open.ch) @$($open.line))"); if ($trace.Count -gt 12) { [void]$trace.Dequeue() }
        if ($interp.Count -gt 0 -and $interp.Peek() -eq $depth) {
            $interp.Pop(); $inStr = '`'; continue
        }
    }
}
if ($stack.Count -eq 0) { Write-Host "BALANCED ($File)"; exit 0 }
Write-Host "UNCLOSED: $($stack.Count) opener(s); innermost:"
foreach ($o in $stack) { Write-Host ("  {0} opened at line {1}" -f $o.ch, $o.line) }
exit 1
