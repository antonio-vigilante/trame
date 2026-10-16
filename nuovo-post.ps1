# nuovo-post.ps1
# Uso: .\nuovo-post.ps1                       (apre il calendario sulla data rilevata)
#      .\nuovo-post.ps1 -Data "2026-10-09 16:15"
#      .\nuovo-post.ps1 -Data "09/10/2026 16.15"
# Metti i media in inbox/ prima di lanciarlo.

param(
    [string]$Data
)

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

# Estrai timestamp dal nome file. Supporta sia il formato Android grezzo
# (YYYYMMDD_HHmm o YYYYMMDD_HHmmSS) sia il formato con trattini usato per
# rinominare i media (YYYY-MM-DD_HHmm o YYYY-MM-DD_HHmmSS).
function Get-TsFromName($file) {
    if (-not $file) { return $null }
    $name = $file.BaseName

    if ($name -match "^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})?$") {
        $sec = if ($Matches[6]) { [int]$Matches[6] } else { 0 }
        try {
            return [DateTime]::new([int]$Matches[1], [int]$Matches[2], [int]$Matches[3],
                                   [int]$Matches[4], [int]$Matches[5], $sec)
        } catch {}
    }

    if ($name -match "^(\d{4})-(\d{2})-(\d{2})_(\d{2})(\d{2})(\d{2})?$") {
        $sec = if ($Matches[6]) { [int]$Matches[6] } else { 0 }
        try {
            return [DateTime]::new([int]$Matches[1], [int]$Matches[2], [int]$Matches[3],
                                   [int]$Matches[4], [int]$Matches[5], $sec)
        } catch {}
    }

    return $null
}

$ts = Get-TsFromName $imageFile
if (-not $ts) { $ts = Get-TsFromName $audioFile }
if (-not $ts) { $ts = Get-TsFromName $videoFile }

# Se il nome file non contiene una data riconoscibile, usa la data di
# modifica del file (più affidabile della data odierna, che riflette solo
# quando è stato lanciato lo script).
if (-not $ts) {
    $sourceFile = $imageFile
    if (-not $sourceFile) { $sourceFile = $audioFile }
    if (-not $sourceFile) { $sourceFile = $videoFile }
    if ($sourceFile) { $ts = $sourceFile.LastWriteTime }
}

if (-not $ts) { $ts = Get-Date }

# Interpreta una data scritta a mano. Accetta data+ora, solo data (mantiene
# l'ora rilevata) o solo ora (mantiene la data rilevata).
function ConvertFrom-UserDate($text, $default) {
    $text = $text.Trim()
    $culture = [System.Globalization.CultureInfo]::InvariantCulture
    $style   = [System.Globalization.DateTimeStyles]::None
    $parsed  = [DateTime]::MinValue

    $fullFormats = @("yyyy-MM-dd HH:mm", "yyyy-MM-dd HH.mm", "yyyy-MM-dd_HHmm",
                     "dd/MM/yyyy HH:mm", "dd/MM/yyyy HH.mm", "d/M/yyyy H:mm", "d/M/yyyy H.mm")
    $dateFormats = @("yyyy-MM-dd", "dd/MM/yyyy", "d/M/yyyy")
    $timeFormats = @("HH:mm", "H:mm", "HH.mm", "H.mm")

    if ([DateTime]::TryParseExact($text, [string[]]$fullFormats, $culture, $style, [ref]$parsed)) {
        return $parsed
    }
    if ([DateTime]::TryParseExact($text, [string[]]$dateFormats, $culture, $style, [ref]$parsed)) {
        return $parsed.Date + $default.TimeOfDay
    }
    if ([DateTime]::TryParseExact($text, [string[]]$timeFormats, $culture, $style, [ref]$parsed)) {
        return $default.Date + $parsed.TimeOfDay
    }
    return $null
}

if ($Data) {
    $chosen = ConvertFrom-UserDate $Data $ts
    if (-not $chosen) {
        Write-Warning "Data non valida: '$Data'"
        exit 1
    }
    $ts = $chosen
} else {
    # Maschera grafica: calendario per il giorno, selettore per l'ora.
    # Parte dalla data rilevata dai media.
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    [System.Windows.Forms.Application]::EnableVisualStyles()

    $form = New-Object System.Windows.Forms.Form
    $form.Text            = "Data del post"
    $form.FormBorderStyle = "FixedDialog"
    $form.StartPosition   = "CenterScreen"
    $form.MaximizeBox     = $false
    $form.MinimizeBox     = $false
    $form.TopMost         = $true
    $form.AutoSize        = $true
    $form.AutoSizeMode    = "GrowAndShrink"
    $form.Padding         = New-Object System.Windows.Forms.Padding(12)

    $calendar = New-Object System.Windows.Forms.MonthCalendar
    $calendar.MaxSelectionCount = 1
    $calendar.SetDate($ts.Date)
    $calendar.Location = New-Object System.Drawing.Point(12, 12)
    $form.Controls.Add($calendar)

    $calBottom = $calendar.Location.Y + $calendar.Height + 12

    $timeLabel = New-Object System.Windows.Forms.Label
    $timeLabel.Text     = "Ora:"
    $timeLabel.AutoSize = $true
    $timeLabel.Location = New-Object System.Drawing.Point(12, ($calBottom + 4))
    $form.Controls.Add($timeLabel)

    $timePicker = New-Object System.Windows.Forms.DateTimePicker
    $timePicker.Format       = "Custom"
    $timePicker.CustomFormat = "HH:mm"
    $timePicker.ShowUpDown   = $true
    $timePicker.Width        = 70
    $timePicker.Value        = $ts
    $timePicker.Location     = New-Object System.Drawing.Point(60, $calBottom)
    $form.Controls.Add($timePicker)

    $btnTop = $calBottom + $timePicker.Height + 16

    $okButton = New-Object System.Windows.Forms.Button
    $okButton.Text         = "Crea post"
    $okButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
    $okButton.Width        = 90
    $okButton.Location     = New-Object System.Drawing.Point(12, $btnTop)
    $form.Controls.Add($okButton)

    $cancelButton = New-Object System.Windows.Forms.Button
    $cancelButton.Text         = "Annulla"
    $cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
    $cancelButton.Width        = 90
    $cancelButton.Location     = New-Object System.Drawing.Point(110, $btnTop)
    $form.Controls.Add($cancelButton)

    $form.AcceptButton = $okButton
    $form.CancelButton = $cancelButton

    $result = $form.ShowDialog()
    if ($result -ne [System.Windows.Forms.DialogResult]::OK) {
        Write-Host "Annullato, nessun post creato."
        exit 0
    }

    $ts = $calendar.SelectionStart.Date + $timePicker.Value.TimeOfDay
    $ts = $ts.AddSeconds(-$ts.Second)
    $form.Dispose()
}

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
    # I .wav sono troppo grandi per Cloudflare Pages (limite 25 MiB per file):
    # convertili in .mp3 con ffmpeg prima di spostarli.
    if ($audioFile.Extension.ToLower() -eq ".wav") {
        if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
            Write-Error "ffmpeg non trovato: impossibile convertire $($audioFile.Name) in mp3."
            exit 1
        }
        $mp3Path = Join-Path $audioFile.DirectoryName "$($audioFile.BaseName).mp3"
        & ffmpeg -hide_banner -loglevel error -y -i $audioFile.FullName -codec:a libmp3lame -q:a 4 $mp3Path
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Conversione di $($audioFile.Name) fallita."
            exit 1
        }
        Remove-Item $audioFile.FullName
        $audioFile = Get-Item $mp3Path
    }
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
