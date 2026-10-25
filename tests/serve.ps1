# serve.ps1 — minimal static HTTP server for local testing (raw sockets, no admin).
# Usage: pwsh tests/serve.ps1 [-Port 8734]
# Serves the project root. Stop with Ctrl+C.
param([int]$Port = 8734)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)

$mime = @{
    '.html'  = 'text/html; charset=utf-8'
    '.css'   = 'text/css; charset=utf-8'
    '.js'    = 'text/javascript; charset=utf-8'
    '.json'  = 'application/json; charset=utf-8'
    '.svg'   = 'image/svg+xml'
    '.png'   = 'image/png'
    '.jpg'   = 'image/jpeg'
    '.jpeg'  = 'image/jpeg'
    '.woff2' = 'font/woff2'
    '.ico'   = 'image/x-icon'
    '.txt'   = 'text/plain; charset=utf-8'
}

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Host "Serving $root at http://127.0.0.1:$Port/ (Ctrl+C to stop)"

while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $requestLine = $reader.ReadLine()
        if (-not $requestLine) { $client.Close(); continue }
        # drain headers
        while ($true) { $h = $reader.ReadLine(); if ([string]::IsNullOrEmpty($h)) { break } }

        $parts = $requestLine -split ' '
        $path = [System.Uri]::UnescapeDataString(($parts[1] -split '\?')[0])
        # test hook: log film-frame requests for preload-gating tests
        if ($path.Contains('/images/frame/')) {
            [System.IO.File]::AppendAllText((Join-Path $root 'tests\_frames.log'), "$path`n")
        }
        # test hook: while tests/_fail500.flag exists, test-browser paths answer 500
        $flag = Join-Path $root 'tests\_fail500.flag'
        if (($path -eq '/tests/browser/flaky.txt' -or $path -eq '/tests/browser/never.txt') -and (Test-Path $flag)) {
            $body = [System.Text.Encoding]::UTF8.GetBytes('simulated server failure')
            $head = "HTTP/1.1 500 Internal Server Error`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
            $h = [System.Text.Encoding]::ASCII.GetBytes($head)
            $stream.Write($h, 0, $h.Length); $stream.Write($body, 0, $body.Length)
            $client.Close(); continue
        }
        if ($path -eq '/') { $path = '/index.html' }
        $file = Join-Path $root ($path.TrimStart('/') -replace '/', [System.IO.Path]::DirectorySeparatorChar)
        $full = [System.IO.Path]::GetFullPath($file)
        if (-not $full.StartsWith([System.IO.Path]::GetFullPath($root))) {
            $body = [System.Text.Encoding]::UTF8.GetBytes('403')
            $head = "HTTP/1.1 403 Forbidden`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
            $h = [System.Text.Encoding]::ASCII.GetBytes($head)
            $stream.Write($h, 0, $h.Length); $stream.Write($body, 0, $body.Length)
            $client.Close(); continue
        }
        if (Test-Path $full -PathType Leaf) {
            $body = [System.IO.File]::ReadAllBytes($full)
            $ext = [System.IO.Path]::GetExtension($full).ToLower()
            $type = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
            $head = "HTTP/1.1 200 OK`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
            $h = [System.Text.Encoding]::ASCII.GetBytes($head)
            $stream.Write($h, 0, $h.Length); $stream.Write($body, 0, $body.Length)
        } else {
            $body = [System.Text.Encoding]::UTF8.GetBytes('404')
            $head = "HTTP/1.1 404 Not Found`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
            $h = [System.Text.Encoding]::ASCII.GetBytes($head)
            $stream.Write($h, 0, $h.Length); $stream.Write($body, 0, $body.Length)
        }
        $stream.Flush()
    } catch {
        # client disconnected mid-request — keep serving
    } finally {
        $client.Close()
    }
}
