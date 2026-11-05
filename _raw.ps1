Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
$lines = [System.IO.File]::ReadAllLines("ai_universal.js")
for ($i = 224; $i -le 234; $i++) { Write-Output ("{0}: {1}" -f ($i+1), $lines[$i]) }
