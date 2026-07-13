# Actualiza el firmware de la Pi en un solo paso.
#
#   .\actualizar_pi.ps1                # busca la Pi sola (botchi.local o escaneo)
#   .\actualizar_pi.ps1 -PiHost 192.168.100.143   # o dile la IP directa
#
# Copia botchi.py, face.py, botchi_ota.py y device.json (token nuevo) a
# ~/botchi/ y corre el cliente OTA una vez para verificar. Pide la
# contraseña de la Pi dos veces (una por scp, otra por ssh).
#
# device.json NO está en git (contiene el device_token real). Si no
# existe junto a este script, genera uno: el token sale de la tabla
# `devices` en Supabase (proyecto Botchi).

param(
    [string]$PiHost = "",
    [string]$User = "botchi"
)

$ErrorActionPreference = "Stop"
$aqui = $PSScriptRoot

# --- Archivos a copiar -------------------------------------------------
$archivos = @("botchi.py", "face.py", "botchi_ota.py", "device.json")
foreach ($f in $archivos) {
    if (-not (Test-Path (Join-Path $aqui $f))) {
        Write-Host "FALTA $f junto al script. Abortando." -ForegroundColor Red
        exit 1
    }
}

# --- Encontrar la Pi ----------------------------------------------------
function Test-Ssh([string]$ip) {
    $c = New-Object System.Net.Sockets.TcpClient
    try { return $c.ConnectAsync($ip, 22).Wait(1500) -and $c.Connected }
    catch { return $false }
    finally { $c.Close() }
}

if (-not $PiHost) {
    Write-Host "Buscando la Pi..." -ForegroundColor Cyan
    # Resolver botchi.local a IPv4 nosotros: el OpenSSH de Windows no
    # entiende mDNS y fallaria con el nombre aunque la Pi este viva.
    $ipv4 = $null
    try {
        $ipv4 = ([System.Net.Dns]::GetHostAddresses("botchi.local") |
            Where-Object { $_.AddressFamily -eq "InterNetwork" } |
            Select-Object -First 1).IPAddressToString
    } catch {}
    if ($ipv4 -and (Test-Ssh $ipv4)) {
        $PiHost = $ipv4
    } else {
        # Escaneo del segmento local buscando SSH abierto.
        $miIp = (Get-NetIPAddress -AddressFamily IPv4 |
            Where-Object { $_.IPAddress -like "192.168.*" } |
            Select-Object -First 1).IPAddress
        if (-not $miIp) { Write-Host "No estoy en una red 192.168.x — pasa -PiHost <ip>." -ForegroundColor Red; exit 1 }
        $base = ($miIp -split "\.")[0..2] -join "."
        # OJO: nada de filtrar por ping — el WiFi del Pi Zero ahorra
        # energia y no contesta pings aunque SSH este vivo (comprobado).
        # Probamos el puerto 22 de todo el segmento, en paralelo.
        Write-Host "Escaneando $base.0/24 (puerto 22)..." -ForegroundColor Cyan
        $intentos = 1..254 | ForEach-Object {
            $ip = "$base.$_"
            if ($ip -eq $miIp) { return }
            $cli = New-Object System.Net.Sockets.TcpClient
            @{ IP = $ip; Cli = $cli; Task = $cli.ConnectAsync($ip, 22) }
        }
        try {
            [System.Threading.Tasks.Task]::WaitAll(@($intentos | ForEach-Object { $_.Task }), 3000) | Out-Null
        } catch {}
        $candidatos = @($intentos | Where-Object {
            $_.Task.IsCompleted -and -not $_.Task.IsFaulted -and $_.Cli.Connected
        } | ForEach-Object { $_.IP })
        $intentos | ForEach-Object { $_.Cli.Close() }
        if ($candidatos.Count -eq 0) {
            Write-Host "No encontre ningun equipo con SSH en $base.0/24." -ForegroundColor Red
            Write-Host "Confirma que la Pi este encendida (LED verde parpadeando ~30s tras conectar PWR IN) y en el WiFi."
            exit 1
        }
        $PiHost = $candidatos[0]
        if ($candidatos.Count -gt 1) {
            Write-Host "Varios equipos con SSH: $($candidatos -join ', '). Usando $PiHost; si no es, pasa -PiHost." -ForegroundColor Yellow
        }
    }
}
Write-Host "Pi: $PiHost" -ForegroundColor Green

# --- Copiar y verificar --------------------------------------------------
# Voces Piper opcionales: si estan junto al script, viajan tambien
# (el selector de voz del panel las necesita en ~/botchi de la Pi).
foreach ($voz in @("sharvard.onnx", "sharvard.onnx.json", "claude.onnx", "claude.onnx.json")) {
    if (Test-Path (Join-Path $aqui $voz)) { $archivos += $voz }
}

Write-Host "`n[1/2] Copiando firmware (te pedira la contraseña de la Pi)..." -ForegroundColor Cyan
$rutas = $archivos | ForEach-Object { Join-Path $aqui $_ }
scp $rutas "${User}@${PiHost}:~/botchi/"
if ($LASTEXITCODE -ne 0) { Write-Host "scp fallo." -ForegroundColor Red; exit 1 }

Write-Host "`n[2/2] Probando OTA contra botchi-beta.vercel.app..." -ForegroundColor Cyan
ssh "${User}@${PiHost}" "cd ~/botchi && python3 botchi_ota.py --once"
if ($LASTEXITCODE -ne 0) { Write-Host "La prueba OTA fallo — revisa el mensaje de arriba." -ForegroundColor Red; exit 1 }

Write-Host "`nListo. Para ver la cara: ssh ${User}@${PiHost} y corre: cd ~/botchi && python3 botchi.py" -ForegroundColor Green
