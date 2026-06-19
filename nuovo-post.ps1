# nuovo-post.ps1
# Uso: .\nuovo-post.ps1
# Metti i media in inbox/ prima di lanciarlo.

$root = $PSScriptRoot
$inboxDir = Join-Path $root "inbox"

if (-not (Test-Path $inboxDir)) {
    New-Item -ItemType Directory -Path $inboxDir | Out-Null
}

$imageExt = @(".jpg", ".jpeg", ".png", ".webp")
$audioExt = @(".m4a", ".mp3", ".ogg", ".wav")
$videoExt = @(".mp4", ".mov", ".mkv", ".webm")

$imageFile = Get-ChildItem $inboxDir |
    Where-Object { $imageExt -contains $_.Extension.ToLower() } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

$audioFile = Get-ChildItem $inboxDir |
    Where-Object { $audioExt -contains $_.Extension.ToLower() } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

$videoFile = Get-ChildItem $inboxDir |
    Where-Object { $videoExt -contains $_.Extension.ToLower() } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

# Estrai timestamp dal nome file (formato Android: YYYYMMDD_HHmmSS)
function Get-TsFromName($file) {
    if ($file -and $file.BaseName -match "^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})$") {
        try {
            return [DateTime]::new([int]$Matches[1], [int]$Matches[2], [int]$Matches[3],
                                   [int]$Matches[4], [int]$Matches[5], [int]$Matches[6])
        } catch {}
    }
    return $null
}

$ts = Get-TsFromName $imageFile
if (-not $ts) { $ts = Get-TsFromName $audioFile }
if (-not $ts) { $ts = Get-TsFromName $videoFile }
if (-not $ts) { $ts = Get-Date }

$year     = $ts.ToString("yyyy")
$month    = $ts.ToString("MM")
$monthDir = "$month-$year"
$day      = $ts.ToString("dd")
$hhmm     = $ts.ToString("HHmm")
$timeDot  = "$($ts.ToString("HH")).$($ts.ToString("mm"))"
$dateStr  = $ts.ToString("yyyy-MM-dd")

$postName = "$dateStr`_$hhmm.md"
$postDir  = Join-Path $root "content\$year\$monthDir"
$postPath = Join-Path $postDir $postName

New-Item -ItemType Directory -Force -Path $postDir | Out-Null

if (Test-Path $postPath) {
    Write-Warning "Il file esiste gia': $postPath"
    exit 1
}

# Sposta immagine
$imageLine = ""
if ($imageFile) {
    $dest = Join-Path $root "content\images\$($imageFile.Name)"
    Move-Item $imageFile.FullName $dest -Force
    $imageLine = "![]( /images/$($imageFile.Name))"
}

# Sposta video
$videoBlock = ""
if ($videoFile) {
    $dest = Join-Path $root "content\video\$($videoFile.Name)"
    Move-Item $videoFile.FullName $dest -Force
    $ext  = $videoFile.Extension.TrimStart('.').ToLower()
    $mime = switch ($ext) {
        "mp4"  { "video/mp4"  }
        "mov"  { "video/quicktime" }
        "mkv"  { "video/x-matroska" }
        "webm" { "video/webm" }
        default { "video/$ext" }
    }
    $videoBlock = @"
<video controls>
  <source src="/video/$($videoFile.Name)" type="$mime"/>
  Il tuo browser non supporta il video HTML5.
</video>
"@
}

# Sposta audio
$audioBlock = ""
if ($audioFile) {
    $dest = Join-Path $root "content\audio\$($audioFile.Name)"
    Move-Item $audioFile.FullName $dest -Force
    $ext  = $audioFile.Extension.TrimStart('.').ToLower()
    $mime = switch ($ext) {
        "mp3" { "audio/mpeg" }
        "m4a" { "audio/mp4"  }
        default { "audio/$ext" }
    }
    $audioBlock = @"
<audio controls>
  <source src="/audio/$($audioFile.Name)" type="$mime"/>
  Il tuo browser non supporta l'audio HTML5.
</audio>
"@
}

# Costruisci il contenuto del post
$body = @"
---
title: "$day $timeDot"
date: $dateStr
tags:
---

"@

if ($imageLine)  { $body += "$imageLine`n`n" }
if ($videoBlock) { $body += "$videoBlock`n" }
if ($audioBlock) { $body += "$audioBlock`n" }

[System.IO.File]::WriteAllText($postPath, $body, [System.Text.Encoding]::UTF8)

Write-Host "Post creato: $postPath"

# Apri in Kate (o editor di default se Kate non e' nel PATH)
$kate = Get-Command kate -ErrorAction SilentlyContinue
if ($kate) {
    kate $postPath
} else {
    Invoke-Item $postPath
}
