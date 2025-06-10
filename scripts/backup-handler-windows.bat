@echo off
set SOURCE_PATH=%1
set DEST_PATH=%2

:: You can hardcode these, or optionally fetch them via %~dp0\..\config.env etc.
set PGUSER=postgres
set PGPASSWORD=1234
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=postgres
set BACKUP_COUNT=3

echo Creating backup from %SOURCE_PATH% to %DEST_PATH%

:: create backup folder with timestamp
for /f %%i in ('powershell -command "Get-Date -Format yyyy-MM-dd_HH-mm-ss"') do set TIMESTAMP=%%i
set BACKUP_FOLDER=%DEST_PATH%\backup-%TIMESTAMP%

mkdir "%BACKUP_FOLDER%"
xcopy /E /I /Y "%SOURCE_PATH%" "%BACKUP_FOLDER%"

:: Cleanup old backups (more than BACKUP_COUNT)
for /f "skip=%BACKUP_COUNT%" %%F in ('dir /b /o-d "%DEST_PATH%\backup-*"') do (
    echo Deleting old backup: %%F
    rmdir /s /q "%DEST_PATH%\%%F"
)

echo Backup completed.