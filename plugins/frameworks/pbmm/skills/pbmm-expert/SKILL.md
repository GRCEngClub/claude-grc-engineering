---
name: pbmm-expert
description: Canadian PBMM (Protected B, Medium Integrity, Medium Availability) expert. Provides comprehensive guidance on ITSG-33 controls, CCCS assessment, Canadian data residency, and Government of Canada cloud security requirements.
allowed-tools: Read, Glob, Grep, Write
---

# PBMM Expert

Deep expertise in Canadian Protected B, Medium Integrity, Medium Availability (PBMM) compliance based on ITSG-33 and CCCS Medium Cloud Security Profile.

## Expertise Areas

### Framework Overview

**PBMM (Protected B, Medium Integrity, Medium Availability)**:

- **Authority**: Canadian Centre for Cyber Security (CCCS), Treasury Board Secretariat
- **Base Standard**: ITSG-33 (based on NIST SP 800-53)
- **Assessment**: ITSM.50.100 Cloud Security Assessment
- **Scope**: Government of Canada departments, contractors, critical infrastructure

**Purpose**: Standardize cloud security for Protected B data across Government of Canada

### Canadian Security Classification

| Level | Full Name | Injury if Compromised | Use Cases |
|-------|-----------|----------------------|-----------|
| **U** | Unclassified | None | Public websites, published documents |
| **PA** | Protected A | Limited injury | Internal emails, drafts |
| **PB** | Protected B | Serious injury | Personal info, health records, financial data |
| **PC** | Protected C | Grave injury | Law enforcement, sensitive intelligence |
| **SECRET** | Secret | Exceptionally grave injury | National security |
| **TOP SECRET** | Top Secret | Catastrophic injury | Highest classification |

**PBMM Applicability**: Protected B data only

### PBMM Control Framework (10 Controls)

#### PBMM-DATA-1: Canadian Data Residency

**Requirement**: All Protected B data must be stored, processed, and backed up exclusively in Canadian geographic regions

**Approved Canadian Regions**:

| Provider | Regions | Location |
|----------|---------|----------|
| **AWS** | ca-central-1 | Montreal, QC |
| **AWS** | ca-west-1 | Calgary, AB |
| **Azure** | canadacentral | Toronto, ON |
| **Azure** | canadaeast | Quebec City, QC |
| **GCP** | northamerica-northeast1 | Montreal, QC |
| **GCP** | northamerica-northeast2 | Toronto, ON |

**Prohibited**:

- Any non-Canadian region worldwide
- Cross-border replication or backup
- Edge caching outside Canada
- Data processing outside Canada

**NIST Mapping**: SA-9(5), SC-8

**Implementation**:

- Service Control Policies to enforce Canadian regions
- Monthly residency verification audits
- Tagging all resources with data classification

#### PBMM-AC-1: Access Control Policy

**Requirement**: Establish and maintain formal access control policies aligned with ITSG-33

**Key Elements**:

- Documented access control policy
- User provisioning and de-provisioning procedures
- Least privilege principle
- Separation of duties
- Account reviews (quarterly)

**NIST Mapping**: AC-1, AC-2

**Cloud Implementation**:

- IAM policies with least privilege
- Role-based access control (RBAC)
- Strong password policy (14+ characters, complexity, 90-day rotation)
- Account lockout after 5 failed attempts

#### PBMM-AC-2: Multi-Factor Authentication

**Requirement**: Enforce MFA for all users accessing Protected B systems

**Acceptable MFA Methods**:

- Hardware tokens (FIDO2, YubiKey)
- Authenticator apps (TOTP)
- SMS (minimum acceptable, not recommended)
- Biometric + PIN (for mobile access)

**Implementation**:

- **AWS**: IAM MFA, AWS SSO with MFA
- **Azure**: Microsoft Entra Conditional Access with MFA
- **GCP**: 2-Step Verification, Context-Aware Access

**Enforcement**: No MFA = No access

**NIST Mapping**: IA-2(1), IA-2(2)

#### PBMM-AU-1: Audit and Accountability

**Requirement**: Maintain comprehensive audit logs for at least 2 years

**Logging Scope**:

- All authentication events (success/failure)
- All authorization decisions
- Resource creation, modification, deletion
- Data access (read/write)
- Configuration changes
- Administrative actions

**Log Retention**: Minimum 2 years

**Log Protection**:

- Centralized logging
- Log integrity protection (digital signatures, write-once storage)
- Restricted access to logs (security team only)
- Regular log review and analysis

**Implementation**:

- **AWS**: CloudTrail with S3 Glacier long-term storage
- **Azure**: Azure Monitor with Log Analytics 2-year retention
- **GCP**: Cloud Logging with log sinks to Cloud Storage

**NIST Mapping**: AU-2, AU-3, AU-6, AU-9

#### PBMM-SC-1: Encryption at Rest

**Requirement**: Encrypt all Protected B data at rest using FIPS 140-2 validated encryption

**Encryption Standard**: FIPS 140-2 Level 2 or higher

**Coverage**:

- Primary storage (S3, Blob, Cloud Storage)
- Block storage (EBS, Managed Disks, Persistent Disks)
- Databases (RDS, SQL Database, Cloud SQL)
- Backups and snapshots
- Temporary files and caches

**Cloud KMS Solutions**:

- **AWS KMS**: FIPS 140-2 Level 2 validated (Certificates #3139, #3195, #3520)
- **Azure Key Vault HSM**: FIPS 140-2 Level 2 (Certificates #3347, #3653)
- **GCP Cloud KMS**: FIPS 140-2 Level 3 (Certificates #3666, #4124)

**Key Management**:

- Customer-managed encryption keys (CMEK) recommended
- Automatic key rotation (annual)
- Key access audit logging

**NIST Mapping**: SC-28

#### PBMM-SC-2: Encryption in Transit

**Requirement**: Encrypt all data transmissions using TLS 1.2+ with FIPS-approved cipher suites

**Minimum TLS**: TLS 1.2 (TLS 1.3 preferred)

**FIPS Cipher Suites**:

- TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
- TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
- TLS_DHE_RSA_WITH_AES_256_GCM_SHA384

**Prohibited**: SSL, TLS 1.0, TLS 1.1

**Implementation**:

- HTTPS only for all web services (disable HTTP)
- API endpoints with TLS 1.2+ only
- Database connections encrypted (RDS force_ssl, Azure SQL Encrypted Connection)
- VPN tunnels for site-to-site connections

**NIST Mapping**: SC-8

#### PBMM-SC-3: Network Segmentation

**Requirement**: Implement network segmentation with security groups, firewalls, and network access controls

**Segmentation Strategy**:

- Dedicated VPC/VNet for Protected B workloads
- Subnet isolation (web tier, app tier, data tier)
- Security groups with least privilege
- Network ACLs for subnet-level filtering
- No direct internet access to database tier

**Implementation**:

- **AWS**: VPC with private subnets, Security Groups, NACLs, PrivateLink
- **Azure**: Virtual Network with NSGs, Application Security Groups, Private Endpoints
- **GCP**: VPC with Firewall Rules, VPC Service Controls

**Best Practices**:

- Default deny, explicit allow
- Micro-segmentation for critical workloads
- Separate management and production networks

**NIST Mapping**: SC-7

#### PBMM-RA-1: Vulnerability Management

**Requirement**: Scan for vulnerabilities and remediate within defined timeframes

**Remediation Timeframes**:

| Severity | Remediation Deadline | Action |
|----------|---------------------|--------|
| **Critical** | 48 hours | Emergency patching |
| **High** | 7 days | Scheduled patching |
| **Medium** | 30 days | Regular patch cycle |
| **Low** | 90 days | Next maintenance window |

**Scanning Frequency**:

- Continuous automated scanning
- Weekly vulnerability reports
- Monthly compliance reporting

**Tools**:

- **AWS**: Amazon Inspector, AWS Security Hub
- **Azure**: Microsoft Defender for Cloud, Qualys
- **GCP**: Security Command Center, Cloud Asset Inventory

**NIST Mapping**: RA-5

#### PBMM-IR-1: Incident Response

**Requirement**: Establish incident response procedures and notify CCCS of security incidents

**Incident Response Plan** must include:

- Incident classification (severity levels)
- Response procedures by incident type
- Contact information (internal and CCCS)
- Evidence collection and preservation
- Communication plan
- Post-incident review process

**CCCS Notification**:

- **Timeline**: Within 24 hours of confirmed incident
- **Contact**: contact@cyber.gc.ca or 1-833-CYBER-88
- **Information**: Incident type, affected systems, data types, impact assessment

**Incident Severity**:

- **Critical**: Data breach, system compromise, service disruption
- **High**: Attempted breach, malware detection, policy violation
- **Medium**: Suspicious activity, anomaly detection
- **Low**: False positives, minor policy violations

**NIST Mapping**: IR-1, IR-4, IR-6

#### PBMM-CP-1: Backup and Recovery

**Requirement**: Implement automated backups with Canadian region storage and tested recovery procedures

**Backup Requirements**:

- Automated daily backups minimum
- Backup storage in Canadian regions only (ca-central-1, canadacentral)
- Encrypted backups (FIPS 140-2)
- Backup retention: 30 days minimum, 1 year for compliance
- Off-site backups (different Canadian region)

**Recovery Testing**:

- Quarterly recovery drills
- Documented recovery procedures
- Recovery Time Objective (RTO): < 24 hours
- Recovery Point Objective (RPO): < 24 hours

**Implementation**:

- **AWS**: AWS Backup with cross-region copy (ca-central-1 ↔ ca-west-1)
- **Azure**: Azure Backup with geo-redundant storage (canadacentral ↔ canadaeast)
- **GCP**: Backup and DR Service with Canadian region snapshots

**NIST Mapping**: CP-9

### CCCS Assessment Process

**Assessment Type**: ITSM.50.100 Cloud Security Assessment

**Timeline**:

- Pre-assessment: 1-2 months (documentation, internal audit)
- Application: 1 month (CCCS review)
- Assessment: 2-4 months (testing, validation)
- Remediation: 1-3 months (if gaps found)
- Certification: 1 month (ATO issuance)
- **Total**: 6-12 months

**Required Documentation**:

- System Security Plan (SSP)
- Privacy Impact Assessment (PIA)
- Security Assessment Report (SAR)
- Plan of Action and Milestones (POA&M)
- Incident Response Plan
- Contingency Plan

**Certification Validity**: 2 years (re-assessment required)

### Certified Cloud Providers

| Provider | Status | Regions | Assessment Standard |
|----------|--------|---------|-------------------|
| **AWS Canada** | ✅ ITSM.50.100 Assessed | ca-central-1, ca-west-1 | PBMM compliant |
| **Azure Canada** | ✅ PBMM Assessed | canadacentral, canadaeast | PBMM compliant |
| **GCP Canada** | ⚠️ In Progress | northamerica-northeast1/2 | Verify status |

### Implementation Challenges

1. **Canadian Data Residency**
   - Challenge: Accidental deployment to non-Canadian regions
   - Solution: Service Control Policies, organizational policies, resource tagging

2. **2-Year Log Retention**
   - Challenge: Cost of long-term log storage
   - Solution: Lifecycle policies to transition to cheaper storage (Glacier, Cool Blob)

3. **48-Hour Critical Patching**
   - Challenge: Emergency patch deployment without disruption
   - Solution: Blue-green deployments, automated patching windows, runbook automation

4. **MFA Enforcement**
   - Challenge: Legacy systems and service accounts
   - Solution: Identity federation, break-glass procedures for emergencies

5. **CCCS Assessment Preparation**
   - Challenge: Documentation completeness and evidence collection
   - Solution: Continuous compliance monitoring, automated evidence collection

### Cost Considerations

**PBMM Compliance Costs** (Annual):

- **CCCS Assessment**: $100K - $250K (initial), $75K - $150K (re-assessment)
- **Canadian Region Premium**: +10-20% over US regions
- **Long-term Log Storage**: $5K - $50K (depends on volume)
- **Vulnerability Scanning**: $10K - $50K
- **Consulting/Staff**: $150K - $500K (FTE for compliance)
- **Total First Year**: $300K - $1M
- **Annual Maintenance**: $150K - $400K

### Resources

**CCCS**:

- Website: https://cyber.gc.ca
- Email: contact@cyber.gc.ca
- Phone: 1-833-CYBER-88 (1-833-292-3788)
- Incident Reporting: contact@cyber.gc.ca (24-hour notification)

**Key Publications**:

- **ITSG-33**: IT Security Risk Management guidance (based on NIST 800-53)
- **ITSP.50.103**: Cloud Security Categorization
- **ITSM.50.100**: Cloud Security Assessment methodology
- **Medium Cloud Security Profile**: PBMM baseline controls

**Treasury Board Secretariat**:

- Cloud Adoption Strategy
- Directive on Security Management
- Policy on Government Security

## Capabilities

- ITSG-33 control assessment and mapping to NIST SP 800-53
- Canadian data residency verification across AWS, Azure, and GCP
- CCCS assessment preparation and documentation (SSP, PIA, SAR, POA&M)
- Protected B vs Protected C vs Secret classification determination
- FIPS 140-2 encryption configuration for Canadian cloud regions
- 2-year audit log retention implementation and cost optimization
- 48-hour critical vulnerability remediation workflows
- Multi-factor authentication enforcement strategies
- CCCS incident notification procedures (24-hour timeline)
- Automated backup and recovery in Canadian regions
- Service Control Policy creation for Canadian region enforcement
- Continuous monitoring and compliance evidence collection
- PBMM vs NIST vs ISO 27001 control crosswalk
- Provincial privacy law compliance (PIPEDA, PHIPA, HIPA, PHI Act)
- Government of Canada contract security requirements interpretation
