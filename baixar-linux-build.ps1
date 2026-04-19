param(
  [string]$Repo = "Panhard-Dev/liz-desktop",
  [string]$Workflow = "tauri-linux.yml",
  [string]$ArtifactName = "liz-linux-bundles",
  [string]$Branch = "main",
  [string]$OutputBaseDir = "",
  [switch]$RunNow
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$script:GhExePath = ""

function Write-Info([string]$Message) {
  Write-Host "[liz] $Message" -ForegroundColor Cyan
}

function Resolve-GitHubCliPath {
  $cmd = Get-Command gh -ErrorAction SilentlyContinue
  if ($cmd) {
    return $cmd.Source
  }

  $candidates = @(
    "$env:ProgramFiles\GitHub CLI\gh.exe",
    "$env:ProgramFiles(x86)\GitHub CLI\gh.exe",
    "$env:LOCALAPPDATA\Programs\GitHub CLI\gh.exe"
  )

  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  return ""
}

function Invoke-Gh {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
  )

  if ([string]::IsNullOrWhiteSpace($script:GhExePath)) {
    throw "GitHub CLI path nao definido."
  }

  & $script:GhExePath @Arguments
}

function Ensure-GitHubCli {
  $script:GhExePath = Resolve-GitHubCliPath
  if (-not [string]::IsNullOrWhiteSpace($script:GhExePath)) {
    return
  }

  Write-Info "GitHub CLI (gh) nao encontrado. Tentando instalar via winget..."
  winget install --id GitHub.cli -e --accept-source-agreements --accept-package-agreements | Out-Host

  $script:GhExePath = Resolve-GitHubCliPath
  if ([string]::IsNullOrWhiteSpace($script:GhExePath)) {
    throw "Nao foi possivel instalar o GitHub CLI automaticamente. Instale manualmente e rode de novo."
  }

  $ghDir = Split-Path -Parent $script:GhExePath
  if (-not [string]::IsNullOrWhiteSpace($ghDir) -and -not ($env:Path -split ';' | Where-Object { $_ -eq $ghDir })) {
    $env:Path = "$env:Path;$ghDir"
  }
}

function Ensure-GitHubAuth {
  Invoke-Gh auth status --hostname github.com | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Info "Login necessario no GitHub. Vai abrir o fluxo de autenticacao..."
    Invoke-Gh auth login --hostname github.com --web --git-protocol https | Out-Host
    if ($LASTEXITCODE -ne 0) {
      throw "Falha no login do GitHub CLI."
    }
  }
}

function Get-LatestSuccessfulRunId {
  param(
    [Parameter(Mandatory = $true)][string]$RepoName,
    [Parameter(Mandatory = $true)][string]$WorkflowName,
    [Parameter(Mandatory = $true)][string]$BranchName
  )

  $json = Invoke-Gh run list `
    --repo $RepoName `
    --workflow $WorkflowName `
    --branch $BranchName `
    --limit 40 `
    --json "databaseId,status,conclusion,createdAt,displayTitle"
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao consultar runs no GitHub Actions. Verifique login e permissoes no repo."
  }

  $runs = $json | ConvertFrom-Json
  if (-not $runs) {
    throw "Nao encontrei runs para o workflow '$WorkflowName' no repo '$RepoName'."
  }

  $success = $runs | Where-Object { $_.conclusion -eq "success" } | Select-Object -First 1
  if (-not $success) {
    throw "Nao existe run com sucesso ainda para '$WorkflowName'. Rode o workflow no GitHub Actions primeiro."
  }

  return $success
}

function Trigger-WorkflowAndWait {
  param(
    [Parameter(Mandatory = $true)][string]$RepoName,
    [Parameter(Mandatory = $true)][string]$WorkflowName,
    [Parameter(Mandatory = $true)][string]$BranchName
  )

  Write-Info "Disparando workflow '$WorkflowName' em '$RepoName' (branch $BranchName)..."
  Invoke-Gh workflow run $WorkflowName --repo $RepoName --ref $BranchName | Out-Host

  Start-Sleep -Seconds 4

  $json = Invoke-Gh run list `
    --repo $RepoName `
    --workflow $WorkflowName `
    --branch $BranchName `
    --limit 20 `
    --json "databaseId,status,conclusion,createdAt,displayTitle"
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao consultar runs apos disparar workflow."
  }

  $runs = $json | ConvertFrom-Json
  if (-not $runs) {
    throw "Nao consegui localizar a run apos disparar o workflow."
  }

  $latest = $runs | Select-Object -First 1
  if (-not $latest.databaseId) {
    throw "Falha ao obter ID da run mais recente."
  }

  Write-Info "Aguardando fim da run ID $($latest.databaseId)..."
  Invoke-Gh run watch $latest.databaseId --repo $RepoName --exit-status | Out-Host
}

function Resolve-OutputDirectory {
  param(
    [AllowEmptyString()][string]$BasePath,
    [Parameter(Mandatory = $true)][string]$RunId
  )

  if ([string]::IsNullOrWhiteSpace($BasePath)) {
    $BasePath = Join-Path $PSScriptRoot "linux-builds"
  }

  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $dest = Join-Path $BasePath ("run-" + $RunId + "-" + $stamp)
  New-Item -ItemType Directory -Force -Path $dest | Out-Null
  return $dest
}

function Get-ArtifactIdForRun {
  param(
    [Parameter(Mandatory = $true)][string]$RepoName,
    [Parameter(Mandatory = $true)][string]$RunId,
    [Parameter(Mandatory = $true)][string]$Artifact
  )

  $json = Invoke-Gh api "/repos/$RepoName/actions/runs/$RunId/artifacts"
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao listar artifacts da run $RunId."
  }

  $payload = $json | ConvertFrom-Json
  if (-not $payload -or -not $payload.artifacts) {
    throw "Resposta invalida ao listar artifacts da run $RunId."
  }

  $match = $payload.artifacts | Where-Object { $_.name -eq $Artifact } | Select-Object -First 1
  if (-not $match) {
    throw "Artifact '$Artifact' nao encontrado na run $RunId."
  }

  return [string]$match.id
}

function Download-ArtifactZip {
  param(
    [Parameter(Mandatory = $true)][string]$RepoName,
    [Parameter(Mandatory = $true)][string]$ArtifactId,
    [Parameter(Mandatory = $true)][string]$ZipPath
  )

  $token = (Invoke-Gh auth token | Out-String).Trim()
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($token)) {
    throw "Falha ao obter token do GitHub CLI para download do artifact."
  }

  $uri = "https://api.github.com/repos/$RepoName/actions/artifacts/$ArtifactId/zip"
  $headers = @{
    Authorization = "Bearer $token"
    Accept = "application/vnd.github+json"
    "User-Agent" = "liz-build-downloader"
  }

  Invoke-WebRequest -Uri $uri -Headers $headers -OutFile $ZipPath
  if (-not (Test-Path $ZipPath)) {
    throw "Falha ao baixar zip bruto do artifact (id=$ArtifactId)."
  }
}

Ensure-GitHubCli
Ensure-GitHubAuth

if ($RunNow) {
  Trigger-WorkflowAndWait -RepoName $Repo -WorkflowName $Workflow -BranchName $Branch
}

$run = Get-LatestSuccessfulRunId -RepoName $Repo -WorkflowName $Workflow -BranchName $Branch
$outDir = Resolve-OutputDirectory -BasePath $OutputBaseDir -RunId ([string]$run.databaseId)

Write-Info "Baixando artifact '$ArtifactName' da run $($run.databaseId)..."
$downloadOk = $true
Invoke-Gh run download $run.databaseId --repo $Repo --name $ArtifactName --dir $outDir | Out-Host
if ($LASTEXITCODE -ne 0) {
  $downloadOk = $false
}

if (-not $downloadOk) {
  Write-Info "Falha ao extrair artifact no Windows. Baixando zip bruto..."
  $artifactId = Get-ArtifactIdForRun -RepoName $Repo -RunId ([string]$run.databaseId) -Artifact $ArtifactName
  $zipPath = Join-Path $outDir ($ArtifactName + ".zip")
  Download-ArtifactZip -RepoName $Repo -ArtifactId $artifactId -ZipPath $zipPath
  Write-Info "Zip salvo em: $zipPath"
}

Write-Host ""
Write-Host "Download concluido." -ForegroundColor Green
Write-Host "Run ID: $($run.databaseId)"
Write-Host "Pasta:  $outDir"
Write-Host ""

Start-Process explorer.exe $outDir
