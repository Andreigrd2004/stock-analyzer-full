$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "Checking installed Python versions..."
py -0p

Write-Host "Creating or reusing Python 3.11 virtual environment at .venv311..."
py -3.11 -m venv .venv311

$pythonExe = Join-Path $projectRoot ".venv311\Scripts\python.exe"

Write-Host "Upgrading pip..."
& $pythonExe -m pip install --upgrade pip

Write-Host "Installing project dependencies..."
& $pythonExe -m pip install -r requirements.txt

Write-Host "Validating imports and model load..."
& $pythonExe -c "from app import app; print('App import OK')"

Write-Host "Starting Flask app on http://127.0.0.1:5000"
& $pythonExe app.py

