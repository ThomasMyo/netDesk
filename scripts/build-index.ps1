<#
  Builds docs/content/index.json from the Markdown project files in docs/content/projects.

  The website reads that index to draw the Work grid, because a static host
  like GitHub Pages can't list a folder's files by itself.

  - Runs automatically: in the local preview server (scripts/serve.ps1) and in the
    GitHub Actions deploy (.github/workflows/pages.yml). You rarely need to run it by hand.
  - By hand:  powershell -ExecutionPolicy Bypass -File scripts/build-index.ps1

  Works in Windows PowerShell 5.1 and PowerShell 7 (Linux runner).
#>
param(
  [string]$Docs = (Join-Path $PSScriptRoot '../docs'),
  [switch]$Quiet
)
$ErrorActionPreference = 'Stop'
$Docs = (Resolve-Path $Docs).Path.TrimEnd('\', '/')
$ProjectsDir = Join-Path $Docs 'content/projects'
$OutFile = Join-Path $Docs 'content/index.json'
$script:count = 0
$script:warnings = New-Object System.Collections.Generic.List[string]

function Remove-Quotes([string]$s) {
  if ($s.Length -ge 2 -and (($s[0] -eq '"' -and $s[-1] -eq '"') -or ($s[0] -eq "'" -and $s[-1] -eq "'"))) {
    return $s.Substring(1, $s.Length - 2)
  }
  return $s
}

# Turn a tag's text into a value: [a, b] -> list, 2025 -> number, true/false -> boolean.
function ConvertFrom-TagValue([string]$v) {
  $v = ($v -replace '\s+#\s.*$', '').Trim()   # drop "  # comment" at the end of a line
  if ($v -match '^\[(.*)\]$') {
    $items = @($Matches[1] -split ',' | ForEach-Object { Remove-Quotes $_.Trim() } | Where-Object { $_ -ne '' })
    return , $items
  }
  $v = Remove-Quotes $v
  if ($v -match '^-?\d+$') { return [int]$v }
  if ($v -eq 'true') { return $true }
  if ($v -eq 'false') { return $false }
  return $v
}

# Read the "--- key: value ---" tag block at the top of a Markdown file.
function Read-Project([string]$file) {
  $text = [IO.File]::ReadAllText($file, [Text.Encoding]::UTF8) -replace "^﻿", ''
  $meta = @{}
  $body = $text
  $m = [regex]::Match($text, '^---[ \t]*\r?\n(.*?)\r?\n---[ \t]*(\r?\n|$)', 'Singleline')
  if ($m.Success) {
    $body = $text.Substring($m.Length)
    foreach ($line in ($m.Groups[1].Value -split '\r?\n')) {
      if ($line -match '^\s*#') { continue }
      if ($line -notmatch '^\s*([A-Za-z_][\w-]*)\s*:\s*(.*?)\s*$') { continue }
      $key = $Matches[1].ToLower()
      $raw = $Matches[2]
      $meta[$key] = ConvertFrom-TagValue $raw
    }
  }
  [pscustomobject]@{ Meta = $meta; HasBody = ($body.Trim().Length -gt 0) }
}

# Paths in tags (image, link) become relative to docs/:
#   /images/x.jpg  → from the site folder (docs/), works from any .md file at any depth
#   x.jpg          → next to the Markdown file
function Resolve-ContentPath($value, [string]$baseDirRel) {
  if (-not $value) { return $null }
  $value = "$value"
  if ($value -match '^([a-z][a-z0-9+.-]*:|//|#)') { return $value }   # full URL, mailto: or #anchor
  if ($value.StartsWith('/')) { $baseDirRel = ''; $value = $value.TrimStart('/') }
  $dir = $baseDirRel.Trim('/')
  $base = [Uri]("http://site/" + $(if ($dir) { "$dir/" } else { '' }))
  return ([Uri]::new($base, $value)).AbsolutePath.TrimStart('/')
}

function Get-PrettyName([string]$name) {
  $t = ($name -replace '[-_]+', ' ').Trim()
  if ($t.Length) { $t.Substring(0, 1).ToUpper() + $t.Substring(1) } else { $name }
}

function Get-DocsRelative([string]$full) {
  return $full.Substring($Docs.Length + 1) -replace '\\', '/'
}

function New-ProjectNode([string]$mdFile, [string]$defaultId, [string]$parentPath, [string]$baseDirFull, [string]$childDir) {
  if ($mdFile) { $p = Read-Project $mdFile } else { $p = [pscustomobject]@{ Meta = @{}; HasBody = $false } }
  $meta = $p.Meta
  if ($meta['draft'] -eq $true) { return $null }

  $id = if ($meta['id']) { "$($meta['id'])" } else { $defaultId }
  $id = ($id.ToLower() -replace '[^a-z0-9-]+', '-').Trim('-')
  $path = if ($parentPath) { "$parentPath/$id" } else { $id }
  $baseRel = Get-DocsRelative $baseDirFull

  $category = if ($meta['category']) { $meta['category'] } elseif ($meta['cat']) { $meta['cat'] } else { '' }
  $tools = $meta['tools']
  if ($tools -is [string]) { $tools = @($tools -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ }) }

  $node = [ordered]@{
    id       = $id
    path     = $path
    title    = if ($meta['title']) { "$($meta['title'])" } else { Get-PrettyName $defaultId }
    category = "$category".ToLower()
  }
  if ($null -ne $meta['year'])  { $node.year = $meta['year'] }
  if ($meta['summary']) { $node.summary = "$($meta['summary'])" }
  if ($meta['image'])   { $node.image = Resolve-ContentPath $meta['image'] $baseRel }
  if ($meta['link'])    { $node.link = Resolve-ContentPath $meta['link'] $baseRel }
  if ($meta['role'])    { $node.role = "$($meta['role'])" }
  if ($tools)           { $node.tools = @($tools) }
  if ($meta['outcome']) { $node.outcome = "$($meta['outcome'])" }
  $node.order = if ($null -ne $meta['order']) { [int]$meta['order'] } else { 1000 }
  if ($mdFile) { $node.file = Get-DocsRelative $mdFile }
  $node.hasBody = [bool]$p.HasBody
  if ($childDir) { $node.children = Get-ProjectNodes $childDir $path }

  $script:count++
  return $node
}

function Get-ProjectNodes([string]$dir, [string]$parentPath) {
  $nodes = New-Object System.Collections.Generic.List[object]

  # Single-file projects
  Get-ChildItem -LiteralPath $dir -Filter '*.md' -File |
    Where-Object { $_.Name -ne 'index.md' -and -not $_.Name.StartsWith('_') } |
    ForEach-Object {
      $n = New-ProjectNode $_.FullName $_.BaseName $parentPath $dir $null
      if ($n) { $nodes.Add($n) }
    }

  # Folder projects (a folder counts only if it contains Markdown, so image folders are ignored)
  Get-ChildItem -LiteralPath $dir -Directory |
    Where-Object { -not $_.Name.StartsWith('_') -and -not $_.Name.StartsWith('.') } |
    ForEach-Object {
      $hasMd = @(Get-ChildItem -LiteralPath $_.FullName -Filter '*.md' -File -Recurse |
                 Where-Object { -not $_.Name.StartsWith('_') }).Count -gt 0
      if (-not $hasMd) { return }
      $index = Join-Path $_.FullName 'index.md'
      $mdFile = if (Test-Path -LiteralPath $index) { $index } else { $null }
      $n = New-ProjectNode $mdFile $_.Name $parentPath $_.FullName $_.FullName
      if ($n) { $nodes.Add($n) }
    }

  $dupes = $nodes | Group-Object { $_.id } | Where-Object { $_.Count -gt 1 }
  foreach ($d in $dupes) { $script:warnings.Add("Duplicate id '$($d.Name)' in $(Get-DocsRelative $dir); links to it may open the wrong one.") }

  $sorted = @($nodes | Sort-Object { $_.order }, { $_.title })
  return , $sorted
}

if (-not (Test-Path -LiteralPath $ProjectsDir)) { throw "Projects folder not found: $ProjectsDir" }

$projects = Get-ProjectNodes $ProjectsDir ''
$out = [ordered]@{ generated = (Get-Date).ToString('s'); projects = $projects }
$json = ConvertTo-Json -InputObject $out -Depth 64
[IO.File]::WriteAllText($OutFile, $json, (New-Object System.Text.UTF8Encoding $false))

foreach ($w in $script:warnings) { Write-Warning $w }
if (-not $Quiet) { Write-Host "Built $(Get-DocsRelative $OutFile): $script:count projects." }
