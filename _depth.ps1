Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
# count braces to find imbalance region — print first line where depth goes negative or ends nonzero
$lines = [System.IO.File]::ReadAllLines("ai_universal.js")
$depth = 0
for ($i = 0; $i -lt $lines.Length; $i++) {
  $line = $lines[$i]
  # crude: strip strings and comments
  $clean = $line -replace '"[^"]*"','""' -replace "'[^']*'","''" -replace '`[^`]*`','``' -replace '//.*',''
  $opens = ([regex]::Matches($clean,'\{')).Count
  $closes = ([regex]::Matches($clean,'\}')).Count
  $depth += $opens - $closes
  if ($i -gt 240) { Write-Output ("{0}: depth={1}" -f ($i+1), $depth) }
}
