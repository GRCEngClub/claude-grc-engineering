---
description: Assess Protected B compliance readiness against ITSG-33 controls
---

# PBMM Assessment

Evaluates readiness for Canadian Protected B, Medium Integrity, Medium Availability (PBMM) compliance based on ITSG-33 and the CCCS Medium Cloud Security Profile.

## Arguments

- Argument 1 - Classification level (optional: protected-a, protected-b, protected-c) - defaults to "protected-b"
- Argument 2 - Assessment type (optional: readiness, gap-analysis, certification) - defaults to "readiness"

## Classification Levels

| Level | Sensitivity | Injury if Compromised | Controls Required |
|-------|-------------|----------------------|-------------------|
| **Unclassified** | Public information | None | Basic hygiene |
| **Protected A** | Low sensitivity | Limited injury | Basic ITSG-33 |
| **Protected B** | Sensitive | Serious injury | Full PBMM profile (10 controls) |
| **Protected C** | Extremely sensitive | Grave injury | Enhanced beyond PBMM |

## PBMM Control Assessment (10 Controls)

### PBMM-DATA-1: Canadian Data Residency

**Requirement**: All Protected B data must reside exclusively in Canadian geographic regions.

**Approved Regions**:

- **AWS**: ca-central-1 (Montreal), ca-west-1 (Calgary)
- **Azure**: canadacentral (Toronto), canadaeast (Quebec City)
- **GCP**: northamerica-northeast1 (Montreal), northamerica-northeast2 (Toronto)

**Assessment Questions**:

- Are all resources deployed in Canadian regions only?
- Is cross-border data transfer disabled?
- Are backups stored in Canadian regions?

### PBMM-AC-1: Access Control Policy

**Requirement**: Establish and maintain access control policies aligned with ITSG-33.

**NIST Mapping**: AC-1, AC-2

**Assessment Questions**:

- Is a formal access control policy documented?
- Are all users authorized and documented?
- Is password policy enforced (complexity, rotation)?

### PBMM-AC-2: Multi-Factor Authentication

**Requirement**: Enforce MFA for all users accessing Protected B systems.

**NIST Mapping**: IA-2(1), IA-2(2)

**Assessment Questions**:

- Is MFA required for all users?
- Are hardware tokens or authenticator apps used?
- Is MFA enforced at cloud provider level?

### PBMM-AU-1: Audit and Accountability

**Requirement**: Maintain comprehensive audit logs for at least 2 years.

**NIST Mapping**: AU-2, AU-3, AU-6, AU-9

**Assessment Questions**:

- Is logging enabled for all services?
- Are logs stored for 2+ years?
- Is log integrity protection enabled?
- Are logs reviewed regularly?

### PBMM-SC-1: Encryption at Rest

**Requirement**: Encrypt all Protected B data at rest using FIPS 140-2 validated encryption.

**NIST Mapping**: SC-28

**Assessment Questions**:

- Are all storage resources encrypted?
- Is FIPS 140-2 Level 2+ encryption used?
- Are customer-managed encryption keys configured?

### PBMM-SC-2: Encryption in Transit

**Requirement**: Encrypt all data transmissions using TLS 1.2+ with FIPS-approved cipher suites.

**NIST Mapping**: SC-8

**Assessment Questions**:

- Is TLS 1.2+ enforced for all connections?
- Are FIPS cipher suites configured?
- Is HTTP disabled (HTTPS only)?

### PBMM-SC-3: Network Segmentation

**Requirement**: Implement network segmentation with security groups and firewalls.

**NIST Mapping**: SC-7

**Assessment Questions**:

- Are VPCs/VNets isolated for Protected B workloads?
- Are security groups configured with least privilege?
- Is network traffic logged and monitored?

### PBMM-RA-1: Vulnerability Management

**Requirement**: Scan for vulnerabilities and remediate within defined timeframes.

**NIST Mapping**: RA-5

**Remediation Timeframes**:

- **Critical vulnerabilities**: 48 hours
- **High vulnerabilities**: 7 days
- **Medium vulnerabilities**: 30 days

**Assessment Questions**:

- Is vulnerability scanning automated?
- Are remediation timeframes met?
- Is patch management process documented?

### PBMM-IR-1: Incident Response

**Requirement**: Establish incident response procedures and contact CCCS for incidents.

**NIST Mapping**: IR-1, IR-4, IR-6

**Assessment Questions**:

- Is incident response plan documented?
- Are incident response roles assigned?
- Is CCCS notification process established?
- Are incidents logged and tracked?

### PBMM-CP-1: Backup and Recovery

**Requirement**: Implement automated backups with Canadian region storage.

**NIST Mapping**: CP-9

**Assessment Questions**:

- Are automated backups configured?
- Are backups tested regularly?
- Are backups stored in Canadian regions only?
- Is recovery time objective (RTO) documented?

## CCCS Assessment Process

### Self-Assessment (Readiness)

Organizations prepare for CCCS assessment by:

1. Implementing all 10 PBMM controls
2. Documenting policies and procedures
3. Conducting internal audits
4. Remediating gaps

### CCCS Certification Assessment

**Process**:

1. Submit application to CCCS
2. CCCS reviews documentation
3. On-site assessment (if applicable)
4. Corrective action period for gaps
5. Certification issuance

**Timeline**: 6-12 months
**Validity**: 2 years (re-assessment required)

## Cloud Provider Certifications

| Provider | PBMM Status | Canadian Regions | Notes |
|----------|-------------|------------------|-------|
| **AWS** | ✅ Certified | ca-central-1, ca-west-1 | ITSM.50.100 assessed |
| **Azure** | ✅ Certified | canadacentral, canadaeast | PBMM compliant |
| **GCP** | ⚠️ In Progress | northamerica-northeast1/2 | Check current status |

## Compliance Output

**Assessment Report Includes**:

- Overall readiness score (0-100%)
- Control-by-control compliance status
- Gap analysis with remediation priorities
- Estimated timeline to certification
- Cost estimate for remediation

## Examples

```bash
# Protected B readiness assessment
/pbmm:assess protected-b readiness

# Gap analysis for certification
/pbmm:assess protected-b gap-analysis

# Protected A assessment
/pbmm:assess protected-a readiness
```

## Key Requirements Summary

- **Canadian Data Residency**: Mandatory for Protected B
- **2-Year Log Retention**: Minimum requirement
- **48-Hour Critical Patching**: For critical vulnerabilities
- **FIPS 140-2 Encryption**: Level 2+ for at rest/in transit
- **CCCS Notification**: Required for security incidents
