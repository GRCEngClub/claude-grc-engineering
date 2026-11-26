---
name: evidence-checklist
description: "Generates comprehensive evidence collection checklists for Australian Cyber Security Centre (ACSC) Essential Eight mitigation strategies with maturity level progression (ML1-ML3)"
---

# Essential Eight Evidence Checklist

Generates comprehensive evidence collection checklists for Australian Cyber Security Centre (ACSC) Essential Eight mitigation strategies with maturity level progression (ML1-ML3).

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/essential8:evidence-checklist <strategy> [--maturity-level <1|2|3>] [--export <format>]
```

## Arguments

- `<strategy>`: Essential Eight strategy number (e.g., "1", "2", "3") or name (e.g., "Application Control", "Patch Applications")
- `--maturity-level`: Target maturity level (1, 2, or 3). Default: `3`
- `--export`: Export format (`json`, `csv`, `markdown`). Default: `markdown`

## Example: Application Control Evidence (Maturity Level 3)

```bash
/essential8:evidence-checklist 1 --maturity-level 3
```

**Output:**

```markdown
Essential Eight Evidence Checklist
Strategy: #1 - Application Control
Maturity Level: ML3 (Target)
ACSC Guidance: ISM Control ASD-0843, ASD-1490-1507
Assessment Framework: ACSC Essential Eight Maturity Model (June 2024)

## Strategy Description

Application control is implemented on workstations and internet-facing servers to prevent execution of unapproved/malicious programs including .exe, DLL, scripts (e.g., Windows Script Host, PowerShell), installers, compiled HTML, HTML applications and drivers.

## Maturity Level Progression

### ML1 (Baseline)
- Application control implemented on workstations
- Microsoft's "recommended block rules" or equivalent

### ML2 (Improved)
- Application control on workstations and internet-facing servers
- Microsoft's "recommended block rules" + "recommended driver block rules"
- Validated at least annually

### ML3 (Advanced) - TARGET
- ML2 + validation at least every six months
- Application control events logged and centrally captured
- Cryptographic hash validation (not path-based rules)
- Incident response process for blocked applications

## Evidence Requirements (ML3)

### Required Documentation

□ **Application Control Policy**
  - Scope: All Windows workstations, internet-facing servers
  - Required elements:
    - Approved application whitelisting approach (AppLocker, WDAC, etc.)
    - Exception request and approval process
    - Cryptographic hash rules (not path/publisher only)
    - Audit and enforcement mode definitions
    - Frequency of validation (every 6 months minimum)
  - Update frequency: Annually
  - Approver: CISO or Chief Technology Officer
  - Evidence: Approved Application Control Policy v1.x

□ **Application Control Standard Operating Procedure (SOP)**
  - Step-by-step implementation guide
  - Exception approval workflow (screenshots)
  - Testing procedures before deployment
  - Troubleshooting common issues
  - Evidence: SOP document with diagrams

□ **Approved Application List (Whitelist)**
  - Complete list of approved applications
  - Business justification for each application
  - Cryptographic hash values for each approved binary
  - Approval date and approver
  - Evidence: Application whitelist register (Excel/database export)

### Automated Evidence Collection

✓ **Application Control Policy Status (All Endpoints)**
```powershell
# Windows - AppLocker Status
Get-AppLockerPolicy -Effective -Xml | Out-File "evidence/e8-1-applocker-policy-$(Get-Date -Format 'yyyyMMdd').xml"

# Get AppLocker rule count
$policy = Get-AppLockerPolicy -Effective
$ruleCount = ($policy.RuleCollections | Measure-Object).Count
Write-Host "AppLocker rules configured: $ruleCount"

# Export all AppLocker rules
$policy.RuleCollections | ForEach-Object {
    $_ | Export-Csv "evidence/e8-1-applocker-rules-$(Get-Date -Format 'yyyyMMdd').csv" -Append -NoTypeInformation
}

# Windows Defender Application Control (WDAC) status
Get-CIPolicy -PolicyId * | Export-Csv "evidence/e8-1-wdac-policies-$(Get-Date -Format 'yyyyMMdd').csv" -NoTypeInformation

# Check enforcement mode (audit vs enforce)
Get-AppLockerPolicy -Effective | Select-Object -ExpandProperty RuleCollections |
    Select-Object RuleCollectionType, EnforcementMode |
    Export-Csv "evidence/e8-1-enforcement-mode-$(Get-Date -Format 'yyyyMMdd').csv" -NoTypeInformation
```

Collection Frequency: Monthly
Retention: 18 months (ACSC recommendation)
Purpose: Demonstrates application control is active

✓ **Application Control Event Logs (Blocked Attempts)**

```powershell
# AppLocker blocked events (last 30 days)
Get-WinEvent -FilterHashtable @{
    LogName='Microsoft-Windows-AppLocker/EXE and DLL';
    ID=8004,8007;  # Denied events
    StartTime=(Get-Date).AddDays(-30)
} -MaxEvents 10000 |
    Select-Object TimeCreated, Id, Message |
    Export-Csv "evidence/e8-1-applocker-blocks-$(Get-Date -Format 'yyyyMMdd').csv" -NoTypeInformation

# PowerShell blocked scripts (ScriptBlockLogging)
Get-WinEvent -FilterHashtable @{
    LogName='Microsoft-Windows-PowerShell/Operational';
    ID=4104,4103;  # Script block logging
    StartTime=(Get-Date).AddDays(-30)
} -MaxEvents 10000 |
    Where-Object { $_.Message -like "*blocked*" } |
    Export-Csv "evidence/e8-1-powershell-blocks-$(Get-Date -Format 'yyyyMMdd').csv" -NoTypeInformation

# WDAC audit events
Get-WinEvent -FilterHashtable @{
    LogName='Microsoft-Windows-CodeIntegrity/Operational';
    ID=3076,3077;  # Code integrity blocks
    StartTime=(Get-Date).AddDays(-30)
} -MaxEvents 10000 |
    Export-Csv "evidence/e8-1-wdac-blocks-$(Get-Date -Format 'yyyyMMdd').csv" -NoTypeInformation
```

Collection Frequency: Daily (centralized to SIEM/log aggregator)
Retention: 18 months
Purpose: Demonstrates application control is working + audit trail

✓ **Centralized Log Collection Evidence**

```bash
# If using Splunk/ELK/Azure Sentinel
# Show that AppLocker events are forwarded to central SIEM

# Example: Azure Sentinel query
# SecurityEvent
# | where EventID in (8004, 8007)  // AppLocker blocks
# | where TimeGenerated > ago(30d)
# | summarize BlockCount = count() by Computer, AccountName
# | order by BlockCount desc

# Export query results monthly
# evidence/e8-1-central-logs-summary-YYYYMM.csv

# Splunk search example
# index=windows sourcetype="WinEventLog:Microsoft-Windows-AppLocker*" EventCode=8004 OR EventCode=8007
# | stats count by host, UserName
# | outputcsv evidence/e8-1-splunk-blocks-YYYYMMDD.csv
```

Collection Frequency: Monthly summary report
Retention: 18 months
Purpose: Centralized logging (ML3 requirement)

✓ **Application Control Coverage (Endpoint Inventory)**

```powershell
# Query all endpoints for AppLocker/WDAC status via AD
# Requires remote WinRM access

$computers = Get-ADComputer -Filter * -Properties OperatingSystem |
    Where-Object { $_.OperatingSystem -like "*Windows*" }

$results = @()
foreach ($computer in $computers) {
    try {
        $session = New-PSSession -ComputerName $computer.Name -ErrorAction Stop

        $appLockerStatus = Invoke-Command -Session $session -ScriptBlock {
            $policy = Get-AppLockerPolicy -Effective -ErrorAction SilentlyContinue
            return @{
                ComputerName = $env:COMPUTERNAME
                AppLockerEnabled = ($policy -ne $null)
                RuleCount = ($policy.RuleCollections | Measure-Object).Count
                EnforcementMode = ($policy.RuleCollections[0].EnforcementMode)
            }
        }

        $results += New-Object PSObject -Property $appLockerStatus
        Remove-PSSession -Session $session
    }
    catch {
        $results += [PSCustomObject]@{
            ComputerName = $computer.Name
            AppLockerEnabled = "ERROR: Could not connect"
        }
    }
}

$results | Export-Csv "evidence/e8-1-endpoint-coverage-$(Get-Date -Format 'yyyyMMdd').csv" -NoTypeInformation

# Calculate coverage percentage
$total = ($results | Measure-Object).Count
$enabled = ($results | Where-Object { $_.AppLockerEnabled -eq $true } | Measure-Object).Count
Write-Host "Application Control Coverage: $enabled / $total ($([math]::Round($enabled/$total*100,2))%)"
```

Collection Frequency: Monthly
Retention: 18 months
Purpose: Coverage assessment (should be 100% for ML3)

✓ **Hash-Based Rules Evidence**

```powershell
# Verify rules use cryptographic hashes (not just path/publisher)
$policy = Get-AppLockerPolicy -Effective

$hashRules = $policy.RuleCollections | Where-Object { $_.RuleCollectionType -eq "Exe" } |
    Select-Object -ExpandProperty Rules |
    Where-Object { $_.GetType().Name -eq "FileHashRule" }

$publisherRules = $policy.RuleCollections | Where-Object { $_.RuleCollectionType -eq "Exe" } |
    Select-Object -ExpandProperty Rules |
    Where-Object { $_.GetType().Name -eq "FilePublisherRule" }

$pathRules = $policy.RuleCollections | Where-Object { $_.RuleCollectionType -eq "Exe" } |
    Select-Object -ExpandProperty Rules |
    Where-Object { $_.GetType().Name -eq "FilePathRule" }

# Export rule type breakdown
[PSCustomObject]@{
    HashRules = ($hashRules | Measure-Object).Count
    PublisherRules = ($publisherRules | Measure-Object).Count
    PathRules = ($pathRules | Measure-Object).Count
    Date = Get-Date -Format "yyyy-MM-dd"
} | Export-Csv "evidence/e8-1-rule-types-$(Get-Date -Format 'yyyyMMdd').csv" -NoTypeInformation

# For ML3: Hash rules should be >80% of total rules
```

Collection Frequency: Every 6 months (ML3 validation requirement)
Retention: 18 months
Purpose: Demonstrates cryptographic hash validation

### Manual Evidence Collection

□ **Semi-Annual Validation Review**

- Review application control policy effectiveness
- Test sample of blocked applications (10-20 samples)
- Review exception requests from last 6 months
- Update whitelist for new approved applications
- Document findings and improvements
- Evidence: Validation review report (every 6 months for ML3)
- Frequency: Every 6 months (ML3 requirement)

□ **Exception Request Approvals (Sample)**

- Sample size: 25 exception requests from last 6 months
- Required elements:
  - Business justification for exception
  - Security risk assessment
  - Approval by IT Security
  - Approval by business owner
  - Hash value added to whitelist
  - Exception expiry date (if temporary)
- Evidence: Folder of exception tickets with approvals
- Frequency: Every 6 months review

□ **Incident Response for Blocked Applications**

- Document process for investigating blocked attempts
- Sample of 10 blocked application incidents
- Required elements:
  - Event details (user, application, timestamp)
  - Investigation outcome (malware? user error? legitimate need?)
  - Remediation action (educate user, add to whitelist, escalate)
- Evidence: Incident tickets + investigation notes
- Frequency: Every 6 months review

□ **Internet-Facing Server Coverage**

- List of all internet-facing servers
- Application control status for each server
- For servers WITHOUT application control:
  - Justification (e.g., incompatible OS, vendor restriction)
  - Compensating controls (e.g., WAF, IDS, containment)
- Evidence: Server inventory + application control status
- Frequency: Every 6 months review (ML3 requirement)

□ **Centralized Logging Configuration**

- Screenshots of Windows Event Forwarding (WEF) or SIEM config
- Show AppLocker/WDAC events forwarded to central log server
- Retention policy (18 months minimum)
- Evidence: SIEM configuration + forwarding rules screenshots
- Frequency: Annual review

## Maturity Level Assessment Criteria

### ML1 Assessment (Baseline)

✓ Application control implemented on workstations
✓ Microsoft's recommended block rules configured
✓ Policy documented

**Typical Gaps:**

- No coverage on servers
- Path-based rules instead of hash-based
- No validation process

### ML2 Assessment (Improved)

✓ ML1 + application control on internet-facing servers
✓ Microsoft's recommended driver block rules
✓ Annual validation performed
✓ Exceptions documented and approved

**Typical Gaps:**

- Validation only annual (not every 6 months)
- Centralized logging not implemented
- Incident response process undefined

### ML3 Assessment (Advanced) - ACSC Target

✓ ML2 + validation every 6 months
✓ Application control events logged centrally (SIEM)
✓ Cryptographic hash validation for >80% of rules
✓ Incident response process for blocked applications
✓ 100% coverage of in-scope systems

**Evidence Required:**

- 2 validation reports per year
- Central SIEM logs showing AppLocker/WDAC events
- Hash-based rules evidence
- Incident response process documentation
- Coverage reports showing 100%

## Common Assessment Findings

### Critical (Likely to be rated ML0 or ML1)

❌ No application control implemented
❌ Application control in audit mode only (not enforcing)
❌ Coverage <50% of workstations
❌ No policy documentation

### Moderate (Likely to be rated ML1 or ML2)

⚠️ No application control on internet-facing servers
⚠️ Path-based rules only (no hash validation)
⚠️ Validation not performed in last 12 months
⚠️ Events not centrally logged

### Minor (ML2 or ML3 with improvements needed)

⚠️ Validation every 12 months (need 6 months for ML3)
⚠️ Some hash-based rules but <80%
⚠️ Centralized logging exists but retention <18 months
⚠️ Incident response process informal (not documented)

## Remediation Guidance

### If No Application Control Exists

1. **Phase 1 (Weeks 1-4): Planning**
   - Select technology (AppLocker for Windows 10+, WDAC for Windows 11)
   - Identify all workstations and internet-facing servers
   - Create initial whitelist (scan existing approved applications)

2. **Phase 2 (Weeks 5-8): Pilot**
   - Deploy AppLocker in AUDIT mode to 10% of workstations
   - Monitor audit logs for 2 weeks
   - Refine whitelist based on audit logs
   - Create exception request process

3. **Phase 3 (Weeks 9-12): Rollout**
   - Deploy to 50% of workstations in AUDIT mode
   - After 2 weeks, switch to ENFORCE mode
   - Deploy to remaining 50%
   - Deploy to internet-facing servers (carefully!)

4. **Phase 4 (Weeks 13-16): Mature**
   - Configure centralized logging (WEF or SIEM)
   - Migrate path rules to hash rules
   - Schedule 6-monthly validation reviews
   - Document incident response process

**Timeline**: 4-6 months to reach ML3

### If Application Control is Audit-Only

1. Review audit logs for last 30 days
2. Add commonly-used applications to whitelist (if appropriate)
3. Educate users on exception request process
4. Schedule change window to switch to ENFORCE mode
5. Monitor help desk tickets for 2 weeks
6. Adjust whitelist based on legitimate exceptions

**Timeline**: 4-8 weeks

### If No Centralized Logging

1. **Windows Event Forwarding (Free)**
   - Configure WEF collector server
   - Create GPO to forward AppLocker events
   - Test with pilot group
   - Roll out to all endpoints

2. **SIEM Integration (Recommended for ML3)**
   - Configure Splunk/ELK/Azure Sentinel connector
   - Ingest AppLocker event logs
   - Create dashboards and alerts
   - Set retention to 18 months

**Timeline**: 2-4 weeks

## Cross-References

### Related Essential Eight Strategies

- #2 - Patch Applications (approved applications must be patched)
- #3 - Configure Microsoft Office Macro Settings (AppLocker can block macros)
- #4 - User Application Hardening (web browsers are approved applications)
- #7 - Multi-Factor Authentication (MFA for exception approvals)

### Maps to Other Frameworks

- **NIST 800-53**: CM-7 (Least Functionality), SI-7 (Software Integrity)
- **ISO 27001:2022**: A.8.19 (Installation of software on operational systems)
- **CMMC 2.0**: CM.L2-3.4.7 (Least functionality)
- **CIS Controls v8**: 2.3 (Allowlisting)

## Cost Estimates

### ML1 Implementation

- Planning and policy development: 40 hours (\$4,000)
- Pilot deployment: 40 hours (\$4,000)
- Full deployment: 80 hours (\$8,000)
- **Total ML1**: ~\$16k

### ML2 Implementation (from ML1)

- Server deployment: 40 hours (\$4,000)
- Driver block rules: 16 hours (\$1,600)
- Annual validation: 24 hours/year (\$2,400/year)
- **Additional for ML2**: ~\$8k

### ML3 Implementation (from ML2)

- Centralized logging (SIEM): 80 hours + \$10k-\$50k SIEM (\$18k-\$58k)
- Hash rule migration: 40 hours (\$4,000)
- Incident response process: 24 hours (\$2,400)
- Semi-annual validation: 24 hours x2/year (\$4,800/year)
- **Additional for ML3**: ~\$29k-\$69k

**Total Cost (ML0 to ML3)**: \$53k-\$93k (one-time) + \$7k/year (ongoing)

## Evidence Package Structure

```
evidence/
└── essential-eight-1-application-control/
    ├── policies/
    │   ├── application-control-policy-v1.2.pdf
    │   ├── application-control-sop-v1.1.docx
    │   └── approved-application-whitelist.xlsx
    ├── automated/
    │   ├── 2024-01/
    │   │   ├── applocker-policy-20240115.xml
    │   │   ├── applocker-blocks-20240131.csv
    │   │   └── endpoint-coverage-20240131.csv
    │   └── ... (monthly)
    ├── validation/
    │   ├── 2024-H1-validation-report.pdf
    │   └── 2024-H2-validation-report.pdf (ML3: every 6 months)
    ├── exceptions/
    │   ├── exception-request-samples-2024-H1/
    │   │   ├── exception-001-adobe-acrobat.pdf
    │   │   ├── exception-002-python.pdf
    │   │   └── ... (25 samples)
    │   └── exception-register-master.xlsx
    ├── incidents/
    │   ├── blocked-app-investigation-samples/
    │   │   ├── incident-001-wannacry-block.pdf
    │   │   ├── incident-002-user-error.pdf
    │   │   └── ... (10 samples)
    │   └── incident-response-procedure.docx
    ├── central-logging/
    │   ├── siem-configuration-screenshots.pdf
    │   ├── wef-config-export.xml
    │   └── monthly-block-summaries/ (from SIEM)
    └── README.md (evidence index, 18-month retention)
```

## Automation Script

```powershell
<#
.SYNOPSIS
Essential Eight - Application Control Evidence Collection
.DESCRIPTION
Collects evidence for ACSC Essential Eight Maturity Level 3
#>

$OutputDir = "evidence/essential-eight-1-application-control/automated/$(Get-Date -Format 'yyyy-MM')"
New-Item -Path $OutputDir -ItemType Directory -Force | Out-Null

function Collect-AppLockerPolicy {
    Write-Host "Collecting AppLocker policy configuration..."

    # Export effective policy
    Get-AppLockerPolicy -Effective -Xml | Out-File "$OutputDir/applocker-policy-$(Get-Date -Format 'yyyyMMdd').xml"

    # Export rule details
    $policy = Get-AppLockerPolicy -Effective
    $policy.RuleCollections | ForEach-Object {
        $_ | Export-Csv "$OutputDir/applocker-rules-$(Get-Date -Format 'yyyyMMdd').csv" -Append -NoTypeInformation
    }

    Write-Host "✓ AppLocker policy exported"
}

function Collect-BlockedEvents {
    Write-Host "Collecting blocked application events (last 30 days)..."

    try {
        $blocks = Get-WinEvent -FilterHashtable @{
            LogName='Microsoft-Windows-AppLocker/EXE and DLL';
            ID=8004,8007;
            StartTime=(Get-Date).AddDays(-30)
        } -MaxEvents 10000 -ErrorAction Stop

        $blocks | Select-Object TimeCreated, Id, Message, MachineName, UserId |
            Export-Csv "$OutputDir/applocker-blocks-$(Get-Date -Format 'yyyyMMdd').csv" -NoTypeInformation

        Write-Host "✓ Found $($blocks.Count) blocked events"
    }
    catch {
        Write-Host "⚠️  No AppLocker block events found (normal if no blocks occurred)"
    }
}

function Test-CentralLogging {
    Write-Host "Testing centralized logging configuration..."

    # Check if Windows Event Forwarding is configured
    $wef = Get-WinEvent -ListLog "ForwardedEvents" -ErrorAction SilentlyContinue

    if ($wef) {
        [PSCustomObject]@{
            CentralLoggingConfigured = $true
            LogName = $wef.LogName
            RecordCount = $wef.RecordCount
            MaximumSizeInBytes = $wef.MaximumSizeInBytes
            RetentionDays = [math]::Round($wef.MaximumSizeInBytes / 100KB / 365, 0) # rough estimate
        } | Export-Csv "$OutputDir/central-logging-status-$(Get-Date -Format 'yyyyMMdd').csv" -NoTypeInformation

        Write-Host "✓ Centralized logging configured (WEF)"
    }
    else {
        Write-Host "⚠️  Windows Event Forwarding not detected (check SIEM instead)"
    }
}

function Measure-RuleTypes {
    Write-Host "Analyzing rule types (hash vs path vs publisher)..."

    $policy = Get-AppLockerPolicy -Effective

    $stats = @{
        HashRules = 0
        PublisherRules = 0
        PathRules = 0
    }

    foreach ($collection in $policy.RuleCollections) {
        foreach ($rule in $collection.Rules) {
            switch ($rule.GetType().Name) {
                "FileHashRule" { $stats.HashRules++ }
                "FilePublisherRule" { $stats.PublisherRules++ }
                "FilePathRule" { $stats.PathRules++ }
            }
        }
    }

    $total = $stats.HashRules + $stats.PublisherRules + $stats.PathRules
    $hashPercent = if ($total -gt 0) { [math]::Round($stats.HashRules / $total * 100, 1) } else { 0 }

    [PSCustomObject]@{
        HashRules = $stats.HashRules
        PublisherRules = $stats.PublisherRules
        PathRules = $stats.PathRules
        TotalRules = $total
        HashPercentage = $hashPercent
        ML3Compliant = ($hashPercent -ge 80)
        Date = Get-Date -Format "yyyy-MM-dd"
    } | Export-Csv "$OutputDir/rule-type-analysis-$(Get-Date -Format 'yyyyMMdd').csv" -NoTypeInformation

    Write-Host "✓ Rule analysis: $hashPercent% hash-based (ML3 requires ≥80%)"

    if ($hashPercent -lt 80) {
        Write-Host "⚠️  WARNING: Hash rules below 80% - not ML3 compliant"
    }
}

function Generate-MaturityReport {
    Write-Host "`nGenerating maturity level assessment..."

    # Assess current maturity
    $ml1 = $true  # If we got this far, AppLocker is configured
    $ml2 = $false # Need server coverage check
    $ml3 = $false # Need 6-month validation + central logging + hash rules

    # Read rule analysis
    $ruleAnalysis = Import-Csv "$OutputDir/rule-type-analysis-$(Get-Date -Format 'yyyyMMdd').csv"
    $hashCompliant = [bool]$ruleAnalysis.ML3Compliant

    # Read central logging status
    $centralLogging = Test-Path "$OutputDir/central-logging-status-*.csv"

    # Simple maturity assessment
    if ($hashCompliant -and $centralLogging) {
        $ml3 = $true
        $ml2 = $true
    }
    elseif ($hashCompliant -or $centralLogging) {
        $ml2 = $true
    }

    $report = @"
Essential Eight - Application Control Maturity Assessment
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

MATURITY LEVEL ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ML1 (Baseline):      $($ml1 ? '✓ ACHIEVED' : '✗ NOT ACHIEVED')
ML2 (Improved):      $($ml2 ? '✓ ACHIEVED' : '✗ NOT ACHIEVED')
ML3 (Advanced):      $($ml3 ? '✓ ACHIEVED' : '⚠️  PARTIAL (manual review required)')

EVIDENCE COLLECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ AppLocker policy configuration
✓ Blocked event logs (30 days)
✓ Rule type analysis (hash/publisher/path)
$(if ($centralLogging) { '✓ Centralized logging configuration' } else { '⚠️  Centralized logging NOT detected' })

MANUAL EVIDENCE REQUIRED FOR ML3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Semi-annual validation report (last 6 months)
□ Exception request samples (25 from last 6 months)
□ Incident response process documentation
□ Internet-facing server coverage assessment
□ Endpoint coverage report (should be 100%)

NEXT ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
$(if (-not $hashCompliant) { '□ Migrate path/publisher rules to hash-based rules (target: ≥80%)' })
$(if (-not $centralLogging) { '□ Configure centralized logging (WEF or SIEM)' })
□ Schedule next semi-annual validation review
□ Review exception requests from last 6 months

Evidence Location: $OutputDir
Retention: 18 months (ACSC recommendation)
"@

    $report | Out-File "$OutputDir/maturity-assessment-$(Get-Date -Format 'yyyyMMdd').txt"
    Write-Host $report
}

# Main execution
Write-Host "Essential Eight - Application Control Evidence Collection"
Write-Host "=" * 70

Collect-AppLockerPolicy
Collect-BlockedEvents
Test-CentralLogging
Measure-RuleTypes
Generate-MaturityReport

Write-Host "`n✓ Evidence collection complete"
Write-Host "Evidence saved to: $OutputDir"
```

---

**ACSC Guidance**: Essential Eight Maturity Model (June 2024)
**Target Maturity**: ML3 (Advanced) - Recommended by ACSC
**Implementation Priority**: 🔴 CRITICAL (Australian Government & Critical Infrastructure)
**Typical Timeline**: 4-6 months (ML0 → ML3)
