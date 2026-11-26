---
description: Identify conflicting requirements across frameworks
---

# Find Conflicts

Analyzes your selected compliance frameworks to identify conflicting requirements and provides resolution strategies.

## Usage

```bash
/engineer:find-conflicts <frameworks> [detail-level]
```

## Arguments

- Argument 1 - Comma-separated list of frameworks (e.g., "SOC2,PCI-DSS,NIST")
- Argument 2 - Detail level (optional): "summary" or "detailed" (default: "detailed")

## Framework Codes

- `SOC2` - SOC 2 Trust Service Criteria
- `NIST` - NIST 800-53
- `ISO` - ISO 27001
- `PCI` or `PCI-DSS` - PCI DSS
- `CIS` - CIS Controls
- `CMMC` - CMMC 2.0
- `FedRAMP` - FedRAMP (Rev 5 or 20X)
- `HITRUST` - HITRUST CSF
- `GDPR` - GDPR

## Examples

```bash
# Find conflicts between SOC2 and PCI-DSS
/engineer:find-conflicts SOC2,PCI-DSS

# Detailed analysis across multiple frameworks
/engineer:find-conflicts SOC2,PCI-DSS,NIST,ISO detailed

# Summary view for quick review
/engineer:find-conflicts NIST,FedRAMP,CMMC summary
```

## Output

The command provides:

1. **Conflict Summary**: Number and severity of conflicts
2. **Detailed Conflicts**: Specific requirement differences
3. **Resolution Strategy**: Recommended approach to satisfy all frameworks
4. **Implementation Guidance**: How to configure to meet all requirements

## Example Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CROSS-FRAMEWORK CONFLICT ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frameworks Analyzed: SOC2, PCI-DSS, NIST 800-53, ISO 27001
Controls Analyzed: 87 overlapping controls

CONFLICT SUMMARY:
  🔴 High Severity: 3 conflicts (require immediate attention)
  🟡 Medium Severity: 7 conflicts (may need adjustment)
  🟢 Low Severity: 12 conflicts (minor differences)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HIGH SEVERITY CONFLICTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CONFLICT #1: Access Review Frequency
   Control Area: Account Management
   Affected Controls: NIST AC-2, ISO A.5.18, SOC2 CC6.1, PCI 7.2.4

   Requirements:
   - SOC2:    No specific frequency, risk-based approach
              (typically quarterly for sensitive systems)
   - PCI-DSS: Reviews MANDATORY at least once every six months
              Requirement 7.2.4
   - NIST:    Annually minimum, or when roles/responsibilities change
              AC-2 control statement
   - ISO:     At planned intervals (typically annually)
              A.5.18 requirement

   ⚠ IMPACT: PCI-DSS is most restrictive and MANDATORY
   ✓ RESOLUTION: Review at least every six months; quarterly (90-day)
                 reviews leave margin and suit privileged access

   Implementation:
   - Set automated reviews every 90 days
   - This exceeds the PCI-DSS six-month minimum
   - Exceeds NIST, ISO, SOC2 requirements
   - Document as quarterly in all framework documentation

   Code Example:
   ```python
   # AWS Lambda triggered every 90 days
   review_schedule = "rate(90 days)"
   ```

🔴 CONFLICT #2: Log Retention Period
   Control Area: Logging and Monitoring
   Affected Controls: NIST AU-11, ISO A.8.15, SOC2 CC7.3, PCI 10.5.1

   Requirements:

- SOC2:    Retention based on risk assessment
              (typically 1 year minimum)
- PCI-DSS: One year minimum, with at least 3 months
              immediately available for analysis
              Requirement 10.5.1 MANDATORY
- NIST:    Organization-defined period
              (typically 90 days online, 1 year archived)
- ISO:     As required by applicable regulations
              and contractual requirements

   ⚠ IMPACT: PCI-DSS specific requirements for availability
   ✓ RESOLUTION: 1 year total, 3+ months online/searchable

   Implementation:

- Online logs: 6 months (exceeds PCI 3-month minimum)
- Archived logs: 6 months (total = 1 year)
- Use cheaper storage for archived logs
- Satisfies all framework requirements

   Cloud Implementation:
   AWS:

- CloudWatch Logs: 6 months retention
- S3 Glacier: 6 months archived (total 1 year)

   Azure:

- Log Analytics: 6 months
- Archive Storage: 6 months

   GCP:

- Cloud Logging: 6 months
- Cloud Storage Archive: 6 months

🔴 CONFLICT #3: Inactive Account Handling
   Control Area: Account Management
   Affected Controls: NIST AC-2(3), SOC2 CC6.1, PCI 8.2.6

   Requirements:

- SOC2:    Remove or disable inactive accounts based on
              risk assessment (no specific timeline)
- PCI-DSS: Remove/disable inactive user accounts at least
              every 90 days - Requirement 8.2.6 MANDATORY
- NIST:    AC-2(3) - Organization-defined time period
              (commonly 90 days for government)
- ISO:     Review access rights at regular intervals

   ⚠ IMPACT: PCI-DSS mandatory 90-day requirement
   ✓ RESOLUTION: Automatically disable accounts after 90 days

   Implementation:

- Automated detection of accounts inactive 90+ days
- Automatic disablement (not deletion)
- Exception process for service accounts
- Monthly review of disabled accounts

   Automation:

   ```python
   # Disable users inactive for 90+ days
   inactive_threshold_days = 90

   def disable_inactive_users():
       users = iam.list_users()
       for user in users:
           last_used = get_last_activity(user)
           if days_since(last_used) >= 90:
               iam.disable_user(user)
               notify_security_team(user)
   ```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEDIUM SEVERITY CONFLICTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟡 CONFLICT #4: Vulnerability Scan Frequency
   Control Area: Vulnerability Management

   Requirements:

- PCI-DSS: Quarterly external scans by ASV
              Quarterly internal scans
              Scans after significant changes
- NIST:    Organization-defined frequency (monthly common)
- SOC2:    Risk-based frequency
- CIS:     Monthly vulnerability scans (Control 7.5)

   ✓ RESOLUTION: Monthly internal, quarterly external by ASV

- Satisfies PCI quarterly minimum
- Satisfies CIS monthly recommendation
- Exceeds NIST and SOC2 expectations

🟡 CONFLICT #5: Firewall Rule Review
   Control Area: Network Security

   Requirements:

- PCI-DSS: Review firewall rules every 6 months (11.1.2)
- NIST:    Annual minimum (CM-3)
- SOC2:    Regular reviews based on risk
- ISO:     Periodic review (typically annual)

   ✓ RESOLUTION: Semi-annual (6 months) to satisfy PCI-DSS

- Documented review process
- Change tracking and approval
- Exceeds other framework requirements

🟡 CONFLICT #6: Password Complexity
   Control Area: Authentication

   Requirements:

- PCI-DSS: Minimum 12 characters (as of March 2025)
              Complexity requirements
- NIST:    Minimum 8 characters (updated 800-63B guidance)
              No complexity requirements (deprecated)
- SOC2:    Strong password policy (not specified)
- ISO:     Adequate password policy

   ✓ RESOLUTION: 12+ characters with complexity

- Satisfies PCI-DSS March 2025 requirement
- Exceeds NIST minimum
- Implement passphrase support
- Consider MFA to reduce password burden

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOW SEVERITY CONFLICTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 CONFLICT #7: Encryption Algorithm Selection
   All frameworks accept AES-256 with FIPS 140-2
   ✓ RESOLUTION: Use AES-256 with FIPS 140-2 validated modules

🟢 CONFLICT #8: Security Awareness Training
   Frequency varies (annual to ongoing)
   ✓ RESOLUTION: Annual formal training + ongoing phishing tests

🟢 CONFLICT #9: Backup Frequency
   Daily to weekly depending on framework
   ✓ RESOLUTION: Daily automated backups

... (9 more low-severity conflicts)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESOLUTION STRATEGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

General Principle: "Most Restrictive Wins"

When conflicts exist:

1. Identify the most restrictive requirement
2. Implement to satisfy the highest standard
3. Document that implementation exceeds other frameworks
4. Verify all frameworks accept the implementation

Example:
  PCI-DSS requires access reviews at least every six months
  → Implement six-monthly (or quarterly) reviews
  → Satisfies SOC2 (risk-based)
  → Exceeds NIST (annual minimum)
  → Exceeds ISO (annual typical)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPLEMENTATION CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HIGH PRIORITY (Must Address):
□ Set access reviews to 90-day frequency
□ Configure log retention: 6mo online + 6mo archive
□ Enable 90-day inactive account detection
□ Implement 12-character password minimum

MEDIUM PRIORITY (Recommended):
□ Schedule monthly vulnerability scans
□ Set firewall review calendar (every 6 months)
□ Update password policy documentation

LOW PRIORITY (Best Practices):
□ Use AES-256 with FIPS 140-2
□ Schedule annual security awareness training
□ Configure daily backups

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENTATION GUIDANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When documenting your approach:

1. Create a Control Implementation Matrix showing:
   - Selected configuration (e.g., "90-day access reviews")
   - How it satisfies each framework requirement
   - Rationale for selection (most restrictive wins)

2. For auditors, note where you EXCEED requirements:
   - "Quarterly reviews exceed NIST annual requirement"
   - "6-month online logs exceed PCI 3-month requirement"

3. Maintain single source of truth:
   - Don't create different configs per framework
   - Document once, reference in all frameworks
   - Reduces drift and maintenance burden

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Review high-severity conflicts above
2. Use /engineer:optimize-multi-framework to see effort reduction
3. Use /engineer:generate-implementation to create configurations
4. Use /engineer:scan-iac to validate current state
5. Update documentation to reference conflict resolutions

```

## Summary Mode Output

```bash
/engineer:find-conflicts SOC2,PCI-DSS,NIST summary
```

```
Conflict Analysis: SOC2, PCI-DSS, NIST
22 conflicts identified

HIGH SEVERITY (3):
  🔴 Access review frequency → At least every six months (PCI 7.2.4)
  🔴 Log retention period → 1yr total, 3mo+ online (PCI)
  🔴 Inactive accounts → 90-day threshold (PCI)

MEDIUM SEVERITY (7):
  🟡 Vuln scan frequency → Monthly internal, quarterly external
  🟡 Firewall review → Semi-annual (PCI)
  🟡 Password complexity → 12+ chars (PCI March 2025)
  ... 4 more

LOW SEVERITY (12):
  🟢 Encryption algorithms → AES-256 FIPS 140-2
  🟢 Training frequency → Annual + ongoing
  ... 10 more

Use "detailed" mode for full analysis and implementation guidance.
```

## Related Commands

- `/engineer:map-controls-unified` - Map controls across frameworks
- `/engineer:optimize-multi-framework` - Find optimization opportunities
- `/engineer:generate-implementation` - Generate code for resolved requirements
