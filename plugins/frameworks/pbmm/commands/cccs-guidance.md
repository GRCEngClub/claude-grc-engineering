---
description: CCCS assessment process and certified cloud provider guidance
---

# CCCS Assessment Guidance

Guidance on the Canadian Centre for Cyber Security (CCCS) cloud security assessment process and certified cloud service providers.

## Arguments

- `$1` - Topic (optional: process, providers, requirements) - defaults to "process"

## CCCS Assessment Process

### ITSM.50.100 Cloud Security Assessment

The CCCS assesses cloud service providers against the ITSP.50.103 Cloud Security Categorization framework.

**Assessment Tiers**:

- **Tier 1**: Self-assessment by CSP
- **Tier 2**: Independent third-party assessment
- **Tier 3**: CCCS assessment (for Protected B and above)

### Protected B Assessment Steps

#### 1. Pre-Assessment (1-2 months)

**Organization Activities**:

- Review ITSG-33 security controls
- Implement PBMM controls (10 required controls)
- Document security policies and procedures
- Prepare System Security Plan (SSP)
- Conduct internal audit

**Required Documentation**:

- System Security Plan (SSP)
- Privacy Impact Assessment (PIA)
- Security Assessment Report (SAR)
- Plan of Action and Milestones (POA&M)
- Incident Response Plan
- Contingency Plan

#### 2. Application Submission (1 month)

**Submission to CCCS**:

- Complete assessment application
- Submit documentation package
- Provide cloud service description
- Identify Canadian regions used
- Demonstrate data residency controls

**CCCS Review**:

- Documentation completeness check
- Initial risk assessment
- Assessment schedule determination

#### 3. Assessment Execution (2-4 months)

**Assessment Activities**:

- Document review and analysis
- Configuration review of cloud environment
- Security control testing (10 PBMM controls)
- Vulnerability assessment
- Penetration testing (if required)
- Interviews with personnel

**Evidence Requirements**:

- Configuration screenshots
- Log samples (2-year retention proof)
- Encryption validation (FIPS 140-2)
- Data residency verification
- Access control demonstrations
- Incident response procedures

#### 4. Remediation (1-3 months)

**For Identified Gaps**:

- CCCS provides findings report
- Organization develops remediation plan
- Implement corrective actions
- Re-assessment of remediated controls

**POA&M**:

- Document residual risks
- Establish remediation timelines
- Assign responsible parties
- Track to completion

#### 5. Certification (1 month)

**CCCS Deliverables**:

- Security Assessment Report (SAR)
- Authorization to Operate (ATO)
- Continuous monitoring requirements
- Re-assessment schedule

**Validity Period**: 2 years (re-assessment required)

### Assessment Costs

| Item | Estimated Cost (CAD) | Notes |
|------|---------------------|-------|
| **Pre-assessment consulting** | $50,000 - $150,000 | Gap analysis, SSP development |
| **Third-party assessment** | $100,000 - $250,000 | CCCS Tier 2 assessment |
| **Remediation** | $50,000 - $200,000 | Depends on gaps |
| **CCCS assessment fee** | Varies | For Tier 3 assessments |
| **Annual maintenance** | $25,000 - $75,000 | Continuous monitoring |
| **Re-assessment (2 years)** | $75,000 - $150,000 | Reduced scope |

## Certified Cloud Service Providers

### AWS Canada

**Certification Status**: ✅ ITSM.50.100 Assessed

**Canadian Regions**:

- ca-central-1 (Montreal, Quebec)
- ca-west-1 (Calgary, Alberta)

**Services Assessed**:

- EC2, S3, RDS, Lambda
- CloudTrail, CloudWatch
- KMS, IAM, VPC

**PBMM Features**:

- FIPS 140-2 Level 2 encryption (AWS KMS)
- Canadian data residency enforcement
- MFA support (IAM, Cognito)
- 2-year+ log retention (CloudWatch, S3)
- Network isolation (VPC)

**Contact**: AWS Canada Public Sector team

### Microsoft Azure Canada

**Certification Status**: ✅ PBMM Assessed

**Canadian Regions**:

- canadacentral (Toronto, Ontario)
- canadaeast (Quebec City, Quebec)

**Services Assessed**:

- Virtual Machines, Storage, SQL Database
- Azure Monitor, Log Analytics
- Key Vault, Active Directory

**PBMM Features**:

- FIPS 140-2 Level 2 encryption (Key Vault HSM)
- Canadian data residency controls
- Entra ID multifactor authentication
- 2-year log retention (Monitor, Storage)
- Network Security Groups, Application Security Groups

**Contact**: Microsoft Canada Public Sector

### Google Cloud Platform Canada

**Certification Status**: ⚠️ Assessment In Progress (verify current status)

**Canadian Regions**:

- northamerica-northeast1 (Montreal, Quebec)
- northamerica-northeast2 (Toronto, Ontario)

**Services**:

- Compute Engine, Cloud Storage, Cloud SQL
- Cloud Logging, Cloud Monitoring
- Cloud KMS, Identity and Access Management

**PBMM Features**:

- FIPS 140-2 Level 3 encryption (Cloud KMS)
- Data residency controls
- IAM with MFA
- Log retention configuration
- VPC Service Controls

**Contact**: Google Cloud Canada team

**Note**: Verify current CCCS certification status before use

## Protected B Control Requirements

### Mandatory Controls (Medium Cloud Security Profile)

| Control ID | Control Name | CCCS Requirement |
|-----------|-------------|-----------------|
| **PBMM-DATA-1** | Canadian Data Residency | All data in CA regions only |
| **PBMM-AC-1** | Access Control Policy | Documented, enforced |
| **PBMM-AC-2** | Multi-Factor Authentication | Mandatory for all users |
| **PBMM-AU-1** | Audit and Accountability | 2-year log retention |
| **PBMM-SC-1** | Encryption at Rest | FIPS 140-2 Level 2+ |
| **PBMM-SC-2** | Encryption in Transit | TLS 1.2+ with FIPS |
| **PBMM-SC-3** | Network Segmentation | VPC/VNet isolation |
| **PBMM-RA-1** | Vulnerability Management | 48-hour critical patching |
| **PBMM-IR-1** | Incident Response | CCCS notification process |
| **PBMM-CP-1** | Backup and Recovery | Canadian region backups |

## Continuous Monitoring Requirements

### Post-Authorization

**Monthly Reporting**:

- Security control status
- Vulnerability scan results
- Incident summary
- Configuration changes

**Quarterly Reviews**:

- Access control verification
- Log analysis and anomaly detection
- Policy and procedure updates

**Annual Activities**:

- Full control re-testing
- Updated System Security Plan
- Privacy Impact Assessment review
- Third-party penetration testing

**Incident Reporting**:

- Report security incidents to CCCS within 24 hours
- Provide incident details and impact assessment
- Submit remediation plan

## CCCS Resources

### Key Publications

**ITSG-33**: IT Security Risk Management - A Lifecycle Approach

- Based on NIST SP 800-53
- Canadian government standard
- Control catalogue and implementation guidance

**ITSP.50.103**: Cloud Security Categorization

- Risk-based approach to cloud classification
- Categorization tool available online
- Maps to PBMM requirements

**ITSM.50.100**: Cloud Security Assessment

- CSP assessment methodology
- Assessment tiers and criteria
- Certification process

**Medium Cloud Security Profile**:

- Control baseline for Protected B
- 10 mandatory controls (PBMM)
- Implementation guidance

### Contact Information

**Canadian Centre for Cyber Security (CCCS)**:

- Website: https://cyber.gc.ca
- Email: contact@cyber.gc.ca
- Phone: 1-833-CYBER-88 (1-833-292-3788)

**Cloud Assessment Inquiries**:

- Email: cccs.cloudsecurity-securiteinfonuagique.satcc@cyber.gc.ca

**Incident Reporting**:

- Email: contact@cyber.gc.ca
- Phone: 1-833-CYBER-88
- Report within 24 hours for Protected B incidents

## Examples

```bash
# View assessment process
/pbmm:cccs-guidance process

# Check certified providers
/pbmm:cccs-guidance providers

# Review certification requirements
/pbmm:cccs-guidance requirements
```

## Frequently Asked Questions

**Q: How long does CCCS assessment take?**
A: 6-12 months total (pre-assessment through certification)

**Q: Can I use US cloud regions for Protected B?**
A: No, Canadian regions mandatory for Protected B

**Q: Is CCCS assessment required for all Protected B systems?**
A: Strongly recommended, may be required by contract or regulation

**Q: How often is re-assessment required?**
A: Every 2 years for Protected B

**Q: What if my cloud provider is not CCCS-certified?**
A: You can pursue your own CCCS assessment or use certified providers

**Q: Are there alternatives to CCCS assessment?**
A: For non-government, use CCCS-assessed CSPs or conduct independent third-party assessment aligned with ITSG-33
