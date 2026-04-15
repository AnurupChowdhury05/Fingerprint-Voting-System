# ============================================================
#  Fingerprint Voting System - One-Click Launcher
#  Biometric e-Voting Platform
# ============================================================

# Set window title and colors
$Host.UI.RawUI.WindowTitle = "Fingerprint Voting System - Launcher"

function Write-Banner {
    Clear-Host
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║                                                  ║" -ForegroundColor Cyan
    Write-Host "  ║      🗳  FINGERPRINT VOTING SYSTEM               ║" -ForegroundColor Cyan
    Write-Host "  ║         Biometric e-Voting Platform              ║" -ForegroundColor Cyan
    Write-Host "  ║                                                  ║" -ForegroundColor Cyan
    Write-Host "  ╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$Message, [string]$Status = "INFO")
    $color = switch ($Status) {
        "OK"    { "Green" }
        "ERROR" { "Red" }
        "WARN"  { "Yellow" }
        default { "Cyan" }
    }
    $icon = switch ($Status) {
        "OK"    { "[✓]" }
        "ERROR" { "[✗]" }
        "WARN"  { "[!]" }
        default { "[*]" }
    }
    Write-Host "  $icon $Message" -ForegroundColor $color
}

# ---- Main Script ----

Write-Banner

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pages = @{
    "index.html"    = "Home / Landing Page"
    "vote.html"     = "Cast Your Vote"
    "register.html" = "Voter Registration"
    "admin.html"    = "Admin Dashboard"
    "results.html"  = "Election Results"
}

Write-Host "  Project Directory:" -ForegroundColor DarkGray
Write-Host "  $projectDir" -ForegroundColor White
Write-Host ""

# Validate project files
Write-Step "Checking project files..." "INFO"
$allOk = $true
foreach ($page in $pages.Keys) {
    $filePath = Join-Path $projectDir $page
    if (Test-Path $filePath) {
        Write-Step "$page → found" "OK"
    } else {
        Write-Step "$page → MISSING!" "ERROR"
        $allOk = $false
    }
}

Write-Host ""

if (-not $allOk) {
    Write-Step "Some files are missing. Please check the project directory." "WARN"
    Write-Host ""
    Read-Host "  Press Enter to exit"
    exit 1
}

# Menu
Write-Host "  ┌─────────────────────────────────────────────────┐" -ForegroundColor DarkCyan
Write-Host "  │  What would you like to open?                   │" -ForegroundColor DarkCyan
Write-Host "  │                                                  │" -ForegroundColor DarkCyan
Write-Host "  │   1. Home Page (index.html)      ← Start here   │" -ForegroundColor White
Write-Host "  │   2. Vote Page (vote.html)                       │" -ForegroundColor White
Write-Host "  │   3. Register Page (register.html)               │" -ForegroundColor White
Write-Host "  │   4. Admin Dashboard (admin.html)                │" -ForegroundColor White
Write-Host "  │   5. Results Page (results.html)                 │" -ForegroundColor White
Write-Host "  │   6. Open ALL pages at once                      │" -ForegroundColor Yellow
Write-Host "  │   Q. Quit                                        │" -ForegroundColor DarkGray
Write-Host "  └─────────────────────────────────────────────────┘" -ForegroundColor DarkCyan
Write-Host ""

$choice = Read-Host "  Enter your choice [1-6 / Q]"

$filesToOpen = @()

switch ($choice.Trim().ToUpper()) {
    "1" { $filesToOpen = @("index.html") }
    "2" { $filesToOpen = @("vote.html") }
    "3" { $filesToOpen = @("register.html") }
    "4" { $filesToOpen = @("admin.html") }
    "5" { $filesToOpen = @("results.html") }
    "6" { $filesToOpen = @("index.html", "vote.html", "register.html", "admin.html", "results.html") }
    "Q" {
        Write-Host ""
        Write-Step "Exiting launcher. Goodbye!" "OK"
        Start-Sleep -Milliseconds 800
        exit 0
    }
    default {
        Write-Step "Invalid choice. Opening Home page by default..." "WARN"
        $filesToOpen = @("index.html")
    }
}

Write-Host ""
Write-Step "Launching in your default browser..." "INFO"

foreach ($file in $filesToOpen) {
    $fullPath = Join-Path $projectDir $file
    Start-Process $fullPath
    Write-Step "Opened: $file" "OK"
    Start-Sleep -Milliseconds 300  # slight delay to avoid browser tab race
}

Write-Host ""
Write-Host "  ══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Step "Application launched successfully!" "OK"
Write-Host "  ══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Start-Sleep -Seconds 2
