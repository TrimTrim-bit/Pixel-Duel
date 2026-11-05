Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
# proper structural depth counter (braces/brackets/parens) with string+comment stripping
$src = [System.IO.File]::ReadAllText("ai_universal.js")
$depth = 0; $line = 1; $inS = $false; $inD = $false; $inT = $false; $inC = $false; $inB = $false
for ($i = 0; $i -lt $src.Length; $i++) {
  $ch = $src[$i]; $nx = if ($i+1 -lt $src.Length) { $src[$i+1] } else { '' }
  if ($ch -eq "`n") { $line++; $inC = $false; continue }
  if ($inC) { continue }
  if (-not $inS -and -not $inD -and -not $inT -and $ch -eq '/' -and $nx -eq '/') { $inC = $true; $i++; continue }
  if (-not $inS -and -not $inD -and -not $inT -and $ch -eq '/' -and $nx -eq '*') { $inB = $true; $i++; continue }
  if ($inB) { if ($ch -eq '*' -and $nx -eq '/') { $inB = $false; $i++ }; continue }
  if (-not $inS -and -not $inD -and -not $inT -and $ch -eq "'") { $inS = $true; continue }
  if ($inS) { if ($ch -eq "'") { $inS = $false }; continue }
  if (-not $inS -and -not $inD -and -not $inT -and $ch -eq '"') { $inD = $true; continue }
  if ($inD) { if ($ch -eq '"') { $inD = $false }; continue }
  if (-not $inS -and -not $inD -and $ch -eq '`') { if ($inT) { $inT = $false } else { $inT = $true }; continue }
  if ($inT) { continue }
  if ($ch -eq '{' -or $ch -eq '(' -or $ch -eq '[') { $depth++ }
  elseif ($ch -eq '}' -or $ch -eq ')' -or $ch -eq ']') { $depth--; if ($depth -lt 0) { Write-Output "NEGATIVE at line $line char $i"; break } }
}
Write-Output "final depth: $depth"
