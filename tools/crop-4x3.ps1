<#
  Recorta uma foto para 4:3 (centralizado), redimensiona para no máximo 1200 px
  de largura e salva em JPEG qualidade 85, no lugar do arquivo original.

  Uso:
    powershell -ExecutionPolicy Bypass -File tools/crop-4x3.ps1 -Scene house-sweeping
    powershell -ExecutionPolicy Bypass -File tools/crop-4x3.ps1 -Scene face-feliz-1 -Game emotions
    powershell -ExecutionPolicy Bypass -File tools/crop-4x3.ps1 -All
#>
param(
  [string]$Scene,
  [string]$Game = "image-interpretation",
  [switch]$All,
  [int]$Width = 1200,
  [int]$Quality = 85
)

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$gameDirs = @{
  "image-interpretation" = "assets\images\image-interpretation"
  "emotions" = "assets\images\emotions"
}
if (-not $gameDirs.ContainsKey($Game)) {
  throw "Jogo desconhecido: $Game. Use: $($gameDirs.Keys -join ', ')"
}
$imageDir = Join-Path $root $gameDirs[$Game]
$ratio = 4.0 / 3.0

function Crop-To4x3 {
  param([string]$File)

  $img = [System.Drawing.Image]::FromFile($File)
  try {
    $current = $img.Width / $img.Height
    if ([Math]::Abs($current - $ratio) -lt 0.01) {
      $cropW = $img.Width
      $cropH = $img.Height
    } elseif ($current -gt $ratio) {
      $cropH = $img.Height
      $cropW = [int][Math]::Round($img.Height * $ratio)
    } else {
      $cropW = $img.Width
      $cropH = [int][Math]::Round($img.Width / $ratio)
    }

    $cropX = [int](($img.Width - $cropW) / 2)
    $cropY = [int](($img.Height - $cropH) / 2)

    $targetW = [Math]::Min($Width, $cropW)
    $targetH = [int][Math]::Round($targetW / $ratio)

    $bmp = New-Object System.Drawing.Bitmap($targetW, $targetH)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $dest = New-Object System.Drawing.Rectangle(0, 0, $targetW, $targetH)
    $src = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
    $g.DrawImage($img, $dest, $src, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()

    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
      Where-Object { $_.MimeType -eq "image/jpeg" }
    $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
      [System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)

    $temp = "$File.tmp.jpg"
    $bmp.Save($temp, $codec, $params)
    $bmp.Dispose()
  } finally {
    $img.Dispose()
  }

  Move-Item -Force $temp $File
  $final = [System.Drawing.Image]::FromFile($File)
  $size = "{0}x{1}" -f $final.Width, $final.Height
  $final.Dispose()
  Write-Output ("{0} -> {1}" -f (Split-Path -Leaf $File), $size)
}

if ($All) {
  $manifestPath = Join-Path $imageDir "candidates\manifest.json"
  if (-not (Test-Path $manifestPath)) {
    throw "Nenhuma busca encontrada. Rode npm run images:fetch primeiro."
  }
  $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
  foreach ($entry in $manifest.scenes.PSObject.Properties) {
    $file = Join-Path $imageDir ("{0}.jpg" -f $entry.Name)
    if (Test-Path $file) { Crop-To4x3 $file }
  }
  exit 0
}

if (-not $Scene) { throw "Informe -Scene <id> ou -All." }
$target = Join-Path $imageDir ("{0}.jpg" -f $Scene)
if (-not (Test-Path $target)) { throw "Arquivo não encontrado: $target" }
Crop-To4x3 $target
