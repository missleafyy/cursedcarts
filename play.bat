@echo off
rem Carl's Cursed Cartridges: double-click to play on Windows.
cd /d "%~dp0"
set "GAME=file:///%CD:\=/%/index.html"
for %%B in ("%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "%LocalAppData%\Google\Chrome\Application\chrome.exe" "%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe" "%LocalAppData%\BraveSoftware\Brave-Browser\Application\brave.exe") do (
  if exist %%B ( start "" %%B --app="%GAME%" --start-maximized & exit /b )
)
rem No Chromium browser found: open in the default browser instead.
start "" "%~dp0index.html"
