param([Parameter(Mandatory=$true)][string]$Artifacts)
$ErrorActionPreference = 'Stop'
$installer = Get-ChildItem $Artifacts -Recurse -Filter '*-setup.exe' | Select-Object -First 1
if (!$installer) { throw 'Missing Windows NSIS installer.' }
$installDir = Join-Path $env:RUNNER_TEMP 'interstellar-smoke-install'
$installed = Start-Process $installer.FullName -ArgumentList '/S', "/D=$installDir" -Wait -PassThru
if ($installed.ExitCode -ne 0) { throw "Installer exited with $($installed.ExitCode)." }
$executable = Get-ChildItem $installDir -Filter '*.exe' | Where-Object { $_.Name -notmatch 'uninstall' } | Select-Object -First 1
if (!$executable) { throw 'Installed application executable is missing.' }
$app = $null
try {
  $app = Start-Process $executable.FullName -PassThru
  for ($i=0; $i -lt 8; $i++) {
    Start-Sleep -Seconds 1
    $app.Refresh()
    if ($app.HasExited) { throw "Application exited during launch with $($app.ExitCode)." }
  }
  Write-Output 'NSIS installation succeeded and the application stayed running.'
} finally {
  if ($app -and !$app.HasExited) { Stop-Process -Id $app.Id -Force }
  $uninstaller = Get-ChildItem $installDir -Filter '*uninstall*.exe' | Select-Object -First 1
  if ($uninstaller) {
    $result = Start-Process $uninstaller.FullName -ArgumentList '/S' -Wait -PassThru
    if ($result.ExitCode -ne 0) { throw "Uninstaller exited with $($result.ExitCode)." }
  } else { throw 'Uninstaller is missing.' }
}
Write-Output 'Windows install / launch / uninstall smoke test passed.'
Write-Output 'This does not certify Authenticode trust, GPU visuals or signed updates.'
