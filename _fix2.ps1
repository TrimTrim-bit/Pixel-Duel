Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
$raw = [System.IO.File]::ReadAllText("ai_universal.js")
$bad = "setTimeout(() => { PD.ai.pressed[k] = false; 60);"
$good = "setTimeout(() => { PD.ai.pressed[k] = false; }, 60);"
if ($raw.Contains($bad)) {
  $raw = $raw.Replace($bad, $good)
  [System.IO.File]::WriteAllText("ai_universal.js", $raw)
  Write-Output "fixed"
} else { Write-Output "not found" }
node --check ai_universal.js
Write-Output "syntax: $LASTEXITCODE"
