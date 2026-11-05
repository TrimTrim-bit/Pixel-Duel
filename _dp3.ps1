Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
$js = [System.IO.File]::ReadAllText("ai_universal.js")
# measure depth at the point just before final '})();'
$closerIdx = $js.LastIndexOf("})();")
$seg = $js.Substring(0, $closerIdx)
$d = 0; $line = 1; $inS = $false; $inD = $false; $inT = $false; $inC = $false; $inB = $false
for ($i = 0; $i -lt $seg.Length; $i++) {
  $ch = $seg[$i]; $nx = if ($i+1 -lt $seg.Length) { $seg[$i+1] } else { '' }
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
  if ($ch -eq '{' -or $ch -eq '(' -or $ch -eq '[') { $d++ }
  elseif ($ch -eq '}' -or $ch -eq ')' -or $ch -eq ']') { $d-- }
}
Write-Output "depth right before final closer: $d (line $line)"
