# PowerShell Launcher Script for CloudLab PaaS Demo
# Handles browser CORS restriction for ES Modules by starting a lightweight local server.

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       CLOUDLAB PAAS DEMO - LOCAL LAUNCHER" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Dang kiem tra moi truong he thong de khoi tao may chu..." -ForegroundColor Yellow

# Function to launch default browser
function Open-Browser($url) {
    Write-Host "Dang khoi chay trinh duyet tai dia chi: $url" -ForegroundColor Green
    Start-Process $url
}

# 1. Check Node.js and NPM
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "[OK] Tim thay Node.js ($(node -v)) va NPM." -ForegroundColor Green
    Write-Host "Dang cai dat cac phu thuoc nhe (Vite)..." -ForegroundColor Yellow
    npm install --no-audit --no-fund
    
    Write-Host "Dang khoi dong may chu Vite..." -ForegroundColor Green
    # Start npm run dev in background
    $job = Start-Job -ScriptBlock {
        cd "d:\DiemToanDamMay\PaaS_Demo"
        npm run dev
    }
    
    # Wait a moment for server to spin up
    Start-Sleep -Seconds 3
    Open-Browser "http://localhost:5173"
    
    Write-Host "May chu dang chay tai cong 5173. Nhan Ctrl+C de thoat." -ForegroundColor Yellow
    
    # Keep console alive and pipe background job output
    Receive-Job -Job $job -Keep
    while ($true) { Start-Sleep -Seconds 1 }
}
# 2. Fallback to Python http.server
elseif (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "[OK] Tim thay Python. Khoi chay may chu http.server..." -ForegroundColor Green
    
    $port = 8000
    Write-Host "Dang chay may chu tai dia chi http://localhost:$port" -ForegroundColor Yellow
    
    # Launch browser
    Open-Browser "http://localhost:8000"
    
    # Run python server
    python -m http.server $port
}
# 3. Ultimate Fallback
else {
    Write-Host "[WARNING] Khong tim thay Node.js hoac Python tren may cua ban." -ForegroundColor Yellow
    Write-Host "Vi trinh duyet chan nap module JS qua giao thuc file:// (CORS policy)," -ForegroundColor Cyan
    Write-Host "ban vui long lam theo mot trong hai cach sau:" -ForegroundColor Cyan
    Write-Host "  Cach 1: Cai dat Node.js tu https://nodejs.org roi chay lai file nay." -ForegroundColor Green
    Write-Host "  Cach 2: Trong VS Code, cai Extension 'Live Server' va click 'Go Live'." -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Cyan
    Read-Host "Nhan Enter de dong..."
}
