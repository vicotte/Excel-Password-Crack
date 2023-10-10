
$tempadress = $env:LOCALAPPDATA + "\wiccoorporation\excelcrack-filelocation.wp"
$filepath = Get-Content -path $tempadress
$appProcess = Start-Process -FilePath $filepath -PassThru


$applicationStarted = $False
$stopCheckTime = (Get-Date).AddMinutes(1)

While (!$applicationStarted -and (Get-Date) -lt $stopCheckTime)
{
    Start-Sleep -Seconds 1
    $tempProc = Get-Process -Id $appProcess.Id
    $applicationStarted = $tempProc.MainWindowHandle -ne 0 -and ![string]::IsNullOrWhitespace($tempProc.MainWindowTitle)
}

if ($applicationStarted)
{
    $myshell = New-Object -com "Wscript.Shell"
    $myshell.sendkeys("{ENTER}")
    $myshell.sendkeys("{ENTER}")
    $myshell.sendkeys("{ENTER}")
    $myshell.sendkeys("^s")
    $myshell.sendkeys("%{F4}")
}
else
{
    # Log/raise error
}