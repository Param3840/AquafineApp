@echo off
setlocal enabledelayedexpansion

echo ==============================================
echo       Aquafine Git Auto-Push Automation
echo ==============================================

:: Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git is not installed or not added to PATH.
    echo Please install Git and try again.
    pause
    exit /b 1
)

:: Check if git is initialized
if not exist ".git" (
    echo [INFO] Git repository not initialized. Initializing...
    git init
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to initialize git repository.
        pause
        exit /b 1
    )
)

:: Ensure remote origin is set correctly
git remote get-url origin >nul 2>nul
if errorlevel 1 (
    echo [INFO] Remote origin not set. Configuring remote origin...
    git remote add origin https://github.com/Param3840/AquafineApp
)

:: Verify or update remote origin URL if needed
for /f "tokens=*" %%a in ('git remote get-url origin 2^>nul') do set CURRENT_REMOTE=%%a
if not "!CURRENT_REMOTE!"=="https://github.com/Param3840/AquafineApp" (
    echo [INFO] Remote origin is currently set to !CURRENT_REMOTE!.
    echo Updating remote origin to https://github.com/Param3840/AquafineApp...
    git remote set-url origin https://github.com/Param3840/AquafineApp
)

:: Safety Check: Ensure no sensitive files are about to be committed or tracked
echo [INFO] Scanning for exposed secrets or untracked .env files...

:: Search for any .env files in git status (untracked or modified)
git status --porcelain | findstr /i "\.env" >nul
if %ERRORLEVEL% equ 0 (
    echo [WARNING] One or more .env files are detected by git status!
    echo Checking if they are properly ignored by .gitignore...
    
    :: Use git check-ignore to verify if .env files are ignored
    for /f "tokens=*" %%i in ('git status --porcelain') do (
        set "STATUS_LINE=%%i"
        set "FILE_PATH=!STATUS_LINE:~3!"
        :: If it's a .env file, verify it's ignored
        echo !FILE_PATH! | findstr /i "\.env" >nul
        if !ERRORLEVEL! equ 0 (
            git check-ignore "!FILE_PATH!" >nul 2>nul
            if !ERRORLEVEL! neq 0 (
                echo [CRITICAL ERROR] Untracked or tracked file '!FILE_PATH!' is NOT ignored by .gitignore!
                echo Aborting push to prevent sensitive credential leak.
                echo Please verify your .gitignore or remove "!FILE_PATH!" from version tracking.
                pause
                exit /b 1
            )
        )
    )
    echo [OK] All .env files are properly ignored.
)

:: Check if there are actual changes to commit
git status --porcelain | findstr /v "\.env" >nul
if %ERRORLEVEL% neq 0 (
    echo [INFO] No changes detected. Repository is up-to-date.
    goto :push_only
)

:: Stage all valid changes (excluding ignored files)
echo [INFO] Staging changes...
git add .

:: Double safety check on staged files
git diff --cached --name-only | findstr /i "\.env" >nul
if %ERRORLEVEL% equ 0 (
    echo [CRITICAL ERROR] Staged files contain a .env file!
    echo Aborting push to prevent sensitive credential leak.
    git reset
    pause
    exit /b 1
)

:: Set commit message
set COMMIT_MSG=chore: save database payment checkout and dashboard dynamic updates
if not "%~1"=="" (
    set COMMIT_MSG=%~1
)

echo [INFO] Committing changes with message: "%COMMIT_MSG%"
git commit -m "%COMMIT_MSG%"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to commit changes.
    pause
    exit /b 1
)

:push_only
:: Ensure branch is main
echo [INFO] Ensuring local branch is set to main...
git branch -M main

:: Push to remote
echo [INFO] Pushing changes to GitHub (main)...
git push -u origin main
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git push failed. Please check internet connection, remote URL, and credentials.
    pause
    exit /b 1
)

echo ==============================================
echo [SUCCESS] Git automation complete!
echo ==============================================
pause
