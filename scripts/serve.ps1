<#
  Local preview server for docs/ (no Python or Node needed).
    powershell -ExecutionPolicy Bypass -File scripts/serve.ps1            → http://localhost:8000
    powershell -ExecutionPolicy Bypass -File scripts/serve.ps1 -Port 8080

  The project index is rebuilt from the Markdown files every time the site asks for it,
  so new or edited .md files show up on a normal browser refresh.
#>
param([int]$Port = 8000, [string]$Root = (Join-Path $PSScriptRoot '../docs'))
if ($env:PORT) { $Port = [int]$env:PORT }
$Root = (Resolve-Path $Root).Path.TrimEnd('\', '/')
$Build = Join-Path $PSScriptRoot 'build-index.ps1'
$types = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='text/javascript; charset=utf-8';
  '.json'='application/json; charset=utf-8'; '.md'='text/markdown; charset=utf-8'; '.txt'='text/plain; charset=utf-8';
  '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.svg'='image/svg+xml'; '.gif'='image/gif';
  '.webp'='image/webp'; '.mp4'='video/mp4'; '.pdf'='application/pdf'; '.ico'='image/x-icon'; '.stl'='model/stl'; '.glb'='model/gltf-binary' }

& $Build -Docs $Root
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $Root at http://localhost:$Port/  (close this window to stop)"

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $res = $ctx.Response
  try {
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ($path -eq '' -or $path.EndsWith('/')) { $path += 'index.html' }
    if ($path -eq 'content/index.json') { & $Build -Docs $Root -Quiet }
    $file = [IO.Path]::GetFullPath((Join-Path $Root $path))
    $res.Headers['Cache-Control'] = 'no-store'   # always serve your latest edits
    if ($file.StartsWith($Root) -and (Test-Path -LiteralPath $file -PathType Leaf)) {
      $bytes = [IO.File]::ReadAllBytes($file)
      $ext = [IO.Path]::GetExtension($file).ToLower()
      $res.ContentType = $(if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' })
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $res.StatusCode = 404
    }
  } catch {
    Write-Warning $_
    $res.StatusCode = 500
    $msg = [Text.Encoding]::UTF8.GetBytes("$_")
    $res.OutputStream.Write($msg, 0, $msg.Length)
  } finally {
    $res.Close()
  }
}
