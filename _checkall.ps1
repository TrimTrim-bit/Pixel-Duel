Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
$fail = 0
Get-ChildItem -Filter "*.js" | ForEach-Object {
  node --check $_.FullName
  if ($LASTEXITCODE -ne 0) { Write-Output "FAIL: $($_.Name)"; $fail++ }
}
Write-Output "failures: $fail"
