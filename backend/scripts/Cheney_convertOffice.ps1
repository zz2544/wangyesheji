# 姓名：张硕 | 学号：24006380115 | 时间：2026-11-23 | 大模型：Kimi-K3.1-Pro
# 作用：通过本机 Microsoft Office 将旧版 DOC/PPT 转为 DOCX/PPTX
param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath,
  [Parameter(Mandatory = $true)][ValidateSet('word', 'powerpoint')][string]$Kind
)

$ErrorActionPreference = 'Stop'
$Cheney_app = $null
$Cheney_document = $null

try {
  $Cheney_input = (Resolve-Path -LiteralPath $InputPath).Path
  $Cheney_output = [System.IO.Path]::GetFullPath($OutputPath)

  if ($Kind -eq 'word') {
    $Cheney_app = New-Object -ComObject Word.Application
    $Cheney_app.Visible = $false
    $Cheney_app.DisplayAlerts = 0
    $Cheney_app.AutomationSecurity = 3
    $Cheney_document = $Cheney_app.Documents.Open($Cheney_input, $false, $true)
    # wdFormatDocumentDefault = 16（DOCX）
    $Cheney_document.SaveAs2($Cheney_output, 16)
  } else {
    $Cheney_app = New-Object -ComObject PowerPoint.Application
    $Cheney_app.AutomationSecurity = 3
    # ReadOnly = -1，Untitled = 0，WithWindow = 0
    $Cheney_document = $Cheney_app.Presentations.Open($Cheney_input, -1, 0, 0)
    # ppSaveAsOpenXMLPresentation = 24（PPTX）
    $Cheney_document.SaveAs($Cheney_output, 24)
  }
  if (-not (Test-Path -LiteralPath $Cheney_output -PathType Leaf)) {
    throw 'Microsoft Office 未生成转换后的文件'
  }
} finally {
  if ($Cheney_document -ne $null) {
    try { $Cheney_document.Close() } catch { Write-Warning $_.Exception.Message }
    [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($Cheney_document)
  }
  if ($Cheney_app -ne $null) {
    try { $Cheney_app.Quit() } catch { Write-Warning $_.Exception.Message }
    [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($Cheney_app)
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
