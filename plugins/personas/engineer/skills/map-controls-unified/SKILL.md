---
name: map-controls-unified
description: Map a control across all compliance frameworks
---

# Map Controls Unified

Maps a single security control across ALL compliance frameworks to identify overlaps and optimization opportunities.

## Usage

```bash
/engineer:map-controls-unified <control-name-or-id>
```

## Arguments

- Argument 1 - Control name or ID (e.g., "access_control_account_management", "AC-2", "CC6.1", "encryption")

## Examples

```bash
# Map by common name
/engineer:map-controls-unified access_control_account_management

# Map by NIST control ID
/engineer:map-controls-unified AC-2

# Map by SOC2 control ID
/engineer:map-controls-unified CC6.1

# Map by search term
/engineer:map-controls-unified encryption
```

## Output

The command provides:

1. **Framework Mappings**: Shows equivalent controls across all frameworks
2. **Common Requirements**: Shared requirements across frameworks
3. **Conflicts**: Identifies conflicting requirements and provides resolution
4. **Cloud Implementation**: Multi-cloud implementation patterns (AWS, Azure, GCP, Kubernetes)
5. **Optimization Insight**: Shows how many frameworks benefit from single implementation

## Example Output

```
UNIFIED CONTROL MAPPING: Account Management
Category: Access Control

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FRAMEWORK MAPPINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NIST 800-53:
  ✓ AC-2     - Account Management
  ✓ AC-2(1)  - Automated Account Management
  ✓ AC-2(2)  - Temporary/Emergency Accounts
  ✓ AC-2(3)  - Disable Inactive Accounts
  ✓ AC-2(4)  - Automated Audit Actions

ISO 27001:2022:
  ✓ A.5.16   - Identity Management
  ✓ A.5.18   - Access Rights
  ✓ A.8.2    - Privileged Access Rights

SOC 2:
  ✓ CC6.1    - Logical and Physical Access Controls
  ✓ CC6.2    - Prior to Issuing System Credentials
  ✓ CC6.3    - Removes Access When Appropriate

PCI-DSS:
  ✓ 7.2.4    - Review User Accounts Every Six Months
  ✓ 8.2.1    - Unique User IDs
  ✓ 8.2.5    - Revoke Access for Terminated Users
  ✓ 8.2.6    - Remove Inactive Accounts Within 90 Days

CIS Controls:
  ✓ 5.1      - Inventory of Accounts
  ✓ 5.2      - Use Unique Passwords
  ✓ 5.3      - Disable Dormant Accounts
  ✓ 6.1      - Establish Access Control Policy
  ✓ 6.2      - Access Based on Need to Know

CMMC:
  ✓ AC.L2-3.1.1  - Authorized Access Control
  ✓ AC.L2-3.1.2  - Transaction and Function Control
  ✓ IA.L2-3.5.1  - Identify Users
  ✓ IA.L2-3.5.2  - Authenticate Users

FedRAMP:
  ✓ AC-2     - NIST 800-53 Control
  Baseline: Moderate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMON REQUIREMENTS (All Frameworks)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Unique user IDs for all individuals
✓ Formal access request and approval process
✓ Periodic access reviews (quarterly to annually)
✓ Automated provisioning and de-provisioning
✓ Separation of duties for privileged access
✓ Audit trail of all account management actions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONFLICTS DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠ Access Review Frequency:
  - SOC2: No specific frequency, risk-based approach
  - PCI-DSS: Reviews at least every six months (7.2.4)
  - NIST: Annually minimum, or when roles change
  - ISO 27001: At planned intervals (typically annually)

  ✓ RESOLUTION: Review at least every six months to satisfy
                 the most restrictive requirement (PCI-DSS 7.2.4)

⚠ Inactive Account Detection:
  - PCI-DSS: Remove/disable after 90 days (8.2.6)
  - NIST: Organization-defined time period
  - SOC2: Risk-based determination

  ✓ RESOLUTION: Use 90 days to satisfy PCI-DSS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLOUD IMPLEMENTATION PATTERNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AWS:
  - IAM users with unique identifiers
  - IAM Access Analyzer for unused access detection
  - AWS IAM Identity Center (SSO) for federated access
  - AWS Config rules for compliance monitoring
  - CloudTrail for audit logging
  - Lambda + EventBridge for automated lifecycle

Azure:
  - Microsoft Entra ID users
  - Microsoft Entra Privileged Identity Management (PIM)
  - Microsoft Entra access reviews for periodic certification
  - Azure Policy for compliance enforcement
  - Azure Monitor for audit logging
  - Logic Apps for automation

GCP:
  - Cloud IAM users and service accounts
  - Policy Analyzer for access analysis
  - Workforce Identity Federation
  - Organization Policy for constraints
  - Cloud Logging for audit trails
  - Cloud Functions for automation

Kubernetes:
  - RBAC for role-based access control
  - ServiceAccounts for workload identity
  - Admission controllers for policy enforcement
  - Audit logging enabled
  - Automated RBAC reviews via scripts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPTIMIZATION INSIGHT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 TIER 1: Highest Value Implementation
   Implement once, satisfies 7 frameworks simultaneously

   Frameworks covered:
   ✓ NIST 800-53 (5 controls)
   ✓ ISO 27001 (3 controls)
   ✓ SOC 2 (3 controls)
   ✓ PCI-DSS (4 controls)
   ✓ CIS Controls (5 controls)
   ✓ CMMC (4 controls)
   ✓ FedRAMP (1 control)

   Total: 25 controls satisfied
   Estimated effort: 40 hours
   ROI: 625% (25 controls / 40 hours = 0.625 controls/hour)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDED NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Review cloud implementation patterns above
2. Use /engineer:generate-implementation to create code
3. Use /engineer:scan-iac to validate existing infrastructure
4. Use /engineer:test-control to verify implementation
```

## Related Commands

- `/engineer:find-conflicts` - Identify conflicting requirements across frameworks
- `/engineer:optimize-multi-framework` - Optimize implementation across multiple frameworks
- `/engineer:generate-implementation` - Generate code for control implementation
- `/engineer:scan-iac` - Scan infrastructure for compliance
