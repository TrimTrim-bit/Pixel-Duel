Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
$lines = [System.IO.File]::ReadAllLines("ai_universal.js")
Write-Output ("count={0}" -f $lines.Length)
for ($i = 250; $i -le 258; $i++) { Write-Output ("{0}: [{1}]" -f ($i+1), $lines[$i]) }
