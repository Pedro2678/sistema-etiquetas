
$ErrorActionPreference = "Stop"

Set-Location "C:\Users\pedro.nunes\Desktop\sistema-etiquetas-main\sistema-etiquetas-main"

# Espera o Docker ficar disponível, por até 5 minutos
$dockerPronto = $false

for ($i = 0; $i -lt 30; $i++) {
    docker info *> $null

    if ($LASTEXITCODE -eq 0) {
        $dockerPronto = $true
        break
    }

    Start-Sleep -Seconds 10
}

if (-not $dockerPronto) {
    throw "Docker não ficou pronto. Backup não executado."
}

# Confirma que o contêiner está em execução
docker compose ps --status running --services | Select-String "^sistema-etiquetas$" *> $null

if ($LASTEXITCODE -ne 0) {
    throw "O contêiner não está em execução. Backup não executado."
}

# Executa o backup
docker compose exec -T sistema-etiquetas node /app/backup-banco.js

if ($LASTEXITCODE -ne 0) {
    throw "O backup falhou. Confira os logs."
}
