Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
$js = [System.IO.File]::ReadAllText("ai_universal.js")
# remove the second })(); we added (was wrong)
$js = $js.Replace("if (typeof requestAnimationFrame !== `"undefined`") requestAnimationFrame(loop);`n  }`n})();`n})();",
                  "if (typeof requestAnimationFrame !== `"undefined`") requestAnimationFrame(loop);`n})();")
[System.IO.File]::WriteAllText("ai_universal.js", $js)
