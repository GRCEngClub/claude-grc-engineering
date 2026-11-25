---
description: Deep dive analysis of ISO 27001 Annex A control domains with implementation guidance
---

# ISO 27001 Annex A Control Domain Deep Dive

Provides comprehensive analysis of ISO 27001:2022 Annex A control domains, including control objectives, implementation guidance, cloud-specific patterns, common pitfalls, and certification audit readiness.

## Usage

```bash
/iso:annex-a-deep-dive <domain> [options]
```

## Arguments

- `$1` - Control domain: "A.5" (Organizational), "A.6" (People), "A.7" (Physical), "A.8" (Technological)
- `$2` - Options (optional): `--environment=cloud|hybrid`, `--show-gaps`, `--certification-focus`

## Examples

```bash
# Deep dive on Organizational Controls (A.5)
/iso:annex-a-deep-dive A.5

# Deep dive on Technological Controls for cloud
/iso:annex-a-deep-dive A.8 --environment=cloud

# Show gaps only (controls not implemented)
/iso:annex-a-deep-dive A.8 --show-gaps

# Certification audit focus
/iso:annex-a-deep-dive A.6 --certification-focus
```

## Output - A.8 Technological Controls

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ISO 27001:2022 ANNEX A DEEP DIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Domain: A.8 - Technological Controls
Total Controls: 34
Environment: Cloud (AWS)
Certification Focus: Stage 2 audit preparation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOMAIN OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purpose:
  Technological controls address the technical security measures needed to
  protect information systems, networks, and data. This domain covers everything
  from endpoint security and access management to cryptography and secure
  development.

Key Themes:
  - User endpoint devices and remote working
  - Access control and authentication
  - System configuration and hardening
  - Cryptography and data protection
  - Secure development lifecycle
  - Network security
  - Logging and monitoring
  - Backup and resilience

Control Count: 34 controls (largest domain in Annex A)
Typical Implementation Time: 6-12 months (cloud environment)
Average Cost: $150,000-$300,000 (including tools and implementation)

Common Audit Findings:
  - Insufficient logging and monitoring (A.8.15, A.8.16)
  - Weak cryptography or key management (A.8.24)
  - Inadequate patch management (A.8.8)
  - Poor configuration management (A.8.9)
  - Insufficient backup testing (A.8.13)

Maturity Levels:
  Level 1 (Ad-hoc): Manual processes, inconsistent implementation
  Level 2 (Defined): Documented procedures, some automation
  Level 3 (Managed): Automated controls, regular testing
  Level 4 (Optimized): Continuous monitoring, self-healing systems

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL CONTROLS (Must Implement First)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A.8.2 - Privileged Access Rights
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Control Objective:
  To limit and control the allocation and use of privileged access rights.

Why Critical:
  Privileged accounts (admin, root, database admin) are the #1 target for
  attackers. Compromise of privileged credentials leads to complete system
  compromise, data breaches, and massive damage.

ISO Requirements:
  - Privileged access rights allocated based on business need
  - Regular review of privileged access (more frequent than normal access)
  - Privileged actions logged and monitored
  - Separation of privileged accounts from normal user accounts
  - Additional authentication for privileged access

Cloud Implementation (AWS):

  IAM Best Practices:
    ✓ No direct AdministratorAccess policy assignments
    ✓ Use permission sets with least privilege
    ✓ Require MFA for all privileged access
    ✓ Use AWS IAM Identity Center with time-limited sessions
    ✓ Separate admin accounts from daily-use accounts

  Privileged Access Management:
    ```terraform
    # Example: Time-limited privileged access
    resource "aws_iam_role" "admin" {
      name = "EmergencyAdminAccess"

      assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Principal = {
            AWS = "arn:aws:iam::${var.account_id}:root"
          }
          Action = "sts:AssumeRole"
          Condition = {
            IpAddress = {
              "aws:SourceIp" = var.corporate_ip_ranges
            }
            Bool = {
              "aws:MultiFactorAuthPresent" = "true"
            }
          }
        }]
      })

      max_session_duration = 3600  # 1 hour maximum
    }

    # Log all privileged actions
    resource "aws_cloudtrail" "admin_actions" {
      name           = "admin-audit-trail"
      s3_bucket_name = aws_s3_bucket.admin_logs.id

      event_selector {
        read_write_type           = "All"
        include_management_events = true

        # Filter for privileged API calls
        data_resource {
          type   = "AWS::IAM::Role"
          values = ["arn:aws:iam::${var.account_id}:role/Admin*"]
        }
      }
    }
    ```

  Monitoring and Alerting:
    - CloudWatch alarm for AssumeRole with Admin policies
    - GuardDuty for privilege escalation attempts
    - Access Analyzer for overly permissive policies

  Review Process:
    - Monthly review of all privileged access assignments
    - Quarterly justification required (business need)
    - Automatic revocation after 90 days if not used
    - Manager + CISO approval for privileged access

Common Pitfalls:
  ❌ Giving developers AdministratorAccess "temporarily" (never removed)
  ❌ Shared admin accounts (cannot attribute actions)
  ❌ No MFA requirement for admin access
  ❌ Privileged access never reviewed (orphaned admin accounts)
  ❌ No logging of privileged actions

Evidence for Audit:
  □ IAM policy documents showing least privilege
  □ MFA enforcement configuration
  □ Monthly privileged access review reports
  □ CloudTrail logs of admin API calls
  □ Privileged access request/approval tickets
  □ Session duration limits configuration

Effort: 24 hours (initial setup) + 4 hours/month (reviews)
Cost: $0 (AWS native) + staff time
Priority: 🔴 CRITICAL
Cross-Reference: NIST AC-6, SOC2 CC6.2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A.8.5 - Secure Authentication
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Control Objective:
  To ensure secure authentication technologies and procedures are implemented
  based on information access restrictions and the topic of access control
  policy.

Why Critical:
  Weak authentication is the entry point for 80%+ of security breaches.
  Modern threats (credential stuffing, phishing, MFA bypass) require robust
  authentication mechanisms.

ISO Requirements:
  - Strong authentication for all system access
  - Multi-factor authentication for sensitive systems
  - Secure password policies (if passwords used)
  - Authentication secrets properly protected
  - Biometric authentication where appropriate

Cloud Implementation (AWS):

  Identity Provider Integration:
    ✓ Federated authentication (Okta, Entra ID)
    ✓ SAML 2.0 or OIDC protocol
    ✓ Single Sign-On (SSO) for all applications
    ✓ No direct IAM user passwords (federated only)

  Multi-Factor Authentication:
    ```yaml
    # Okta MFA Policy Example
    mfa_policy:
      name: "Company-Wide MFA Policy"
      factors_required:
        - type: "okta_verify_push"  # Primary
        - type: "google_otp"        # Backup
        - type: "sms"               # Last resort (being phased out)

      enforcement:
        workforce_users: required
        privileged_users: required
        api_access: required (service accounts exempt with justification)

      risk_based:
        enabled: true
        factors:
          - unusual_location: require_mfa
          - new_device: require_mfa
          - after_hours: require_mfa_for_sensitive_apps
    ```

  Password Policy (for emergency/service accounts):
    - Minimum 15 characters (ISO recommends strong passwords)
    - Complexity requirements (upper, lower, number, special)
    - Password history: 24 previous passwords
    - Maximum age: 90 days
    - Account lockout: 5 failed attempts, 30-minute lockout

  Passwordless Authentication:
    - WebAuthn/FIDO2 security keys (YubiKey)
    - Biometric authentication (Touch ID, Face ID)
    - Certificate-based authentication (PIV/CAC)

  Session Management:
    - Session timeout: 15 minutes idle for standard, 5 minutes for privileged
    - Re-authentication required for sensitive operations
    - Concurrent session limits
    - Device trust verification

Implementation Guide:

  Phase 1: Foundation (Weeks 1-4)
    □ Deploy identity provider (Okta or Entra ID)
    □ Migrate all users to federated authentication
    □ Disable direct IAM user passwords
    □ Enforce MFA for all users (100% enrollment)

  Phase 2: Enhanced Security (Weeks 5-8)
    □ Implement risk-based authentication
    □ Deploy hardware security keys for admins
    □ Configure session timeout policies
    □ Implement device trust

  Phase 3: Monitoring (Weeks 9-12)
    □ Set up authentication monitoring
    □ Configure failed login alerts
    □ Implement anomaly detection
    □ Create authentication dashboard

Evidence for Audit:
  □ Identity provider configuration (Okta/Entra ID)
  □ MFA enrollment report (100% required)
  □ Password policy screenshot
  □ Session timeout configuration
  □ Risk-based authentication rules
  □ Authentication logs (successful + failed)
  □ MFA bypass exceptions (documented and approved)

Common Pitfalls:
  ❌ MFA optional or only for some users
  ❌ SMS as only MFA method (vulnerable to SIM swapping)
  ❌ Weak password requirements (<14 characters)
  ❌ No session timeout (sessions never expire)
  ❌ Shared service accounts without MFA

Effort: 40 hours (initial) + 2 hours/month (maintenance)
Cost: $3-$5/user/month (Okta or Entra ID with MFA)
Priority: 🔴 CRITICAL
Cross-Reference: NIST IA-2, IA-5; SOC2 CC6.1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A.8.9 - Configuration Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Control Objective:
  To establish and maintain configurations, including security configurations,
  of hardware, software, services, and networks.

Why Critical:
  Misconfiguration is the #1 cause of cloud security incidents. Default
  configurations, configuration drift, and manual changes lead to vulnerabilities.

ISO Requirements:
  - Documented baseline configurations
  - Configuration changes controlled and approved
  - Regular review of configurations
  - Detection of unauthorized changes
  - Configuration documentation maintained

Cloud Implementation (AWS):

  Infrastructure as Code (IaC):
    ```terraform
    # Example: Enforced configuration baseline
    module "secure_vpc" {
      source = "./modules/secure-vpc"

      # Security baseline enforced via Terraform
      enable_flow_logs        = true
      enable_vpc_endpoints    = true
      private_subnets_only    = true
      enable_network_firewall = true

      # Compliance tags required
      tags = {
        Environment = "production"
        Compliance  = "ISO27001"
        DataClass   = "sensitive"
        Owner       = "platform-team"
      }
    }

    # Security group baseline
    resource "aws_security_group" "baseline" {
      name        = "secure-baseline-sg"
      description = "ISO 27001 compliant security group"

      # Deny all inbound by default (best practice)
      # Explicitly allow only required ports

      egress {
        from_port   = 443
        to_port     = 443
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
        description = "HTTPS outbound only"
      }

      lifecycle {
        # Prevent accidental deletion of security groups
        prevent_destroy = true
      }
    }
    ```

  Configuration Management Tools:
    ✓ Terraform for infrastructure
    ✓ AWS Config for compliance monitoring
    ✓ AWS Systems Manager State Manager for EC2 configuration
    ✓ Chef/Ansible for application configuration (if needed)

  Baseline Configurations:
    - CIS AWS Foundations Benchmark Level 1 (minimum)
    - CIS Level 2 for sensitive workloads
    - Custom security baseline documented

  Change Management Process:
    1. All changes via pull request (Infrastructure as Code)
    2. terraform plan shows proposed changes
    3. Security team review required
    4. Automated testing in dev environment
    5. Approved changes merged to main
    6. Terraform Cloud applies changes
    7. AWS Config validates compliance

  Configuration Drift Detection:
    ```python
    # Lambda function: detect-configuration-drift
    def lambda_handler(event, context):
        # Triggered by AWS Config compliance change

        # Compare actual config vs. Terraform state
        actual_config = get_actual_config(event['resourceId'])
        desired_config = get_terraform_state(event['resourceId'])

        if actual_config != desired_config:
            # Configuration drift detected
            send_alert(f"Drift detected: {event['resourceId']}")

            # Auto-remediate or create ticket
            if event['autoRemediate']:
                apply_terraform()  # Restore to desired state
            else:
                create_jira_ticket(drift_details)

        return {
            'statusCode': 200,
            'body': 'Drift detection complete'
        }
    ```

  Automated Compliance Checks:
    - AWS Config Rules (40+ compliance rules)
    - Conformance Packs (ISO 27001 pack available)
    - Daily compliance reports
    - Non-compliance triggers alerts

Evidence for Audit:
  □ Configuration Management Policy v1.0
  □ Terraform configuration repository (GitHub)
  □ CIS Benchmark compliance report
  □ AWS Config compliance dashboard
  □ Change history (Git commits + Terraform Cloud runs)
  □ Drift detection alerts and remediation
  □ Configuration review meeting notes (quarterly)

Common Pitfalls:
  ❌ Manual changes via console (bypassing IaC)
  ❌ No configuration baseline documented
  ❌ Configuration drift not detected
  ❌ Changes not reviewed before applying
  ❌ Default configurations used (not hardened)

Effort: 80 hours (initial baseline) + 10 hours/month (maintenance)
Cost: $200/month (AWS Config) + staff time
Priority: 🔴 CRITICAL
Cross-Reference: NIST CM-2, CM-3, CM-6; SOC2 CC8.1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A.8.15 - Logging
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Control Objective:
  To record events, generate evidence, and log information.

Why Important:
  Logging is essential for incident detection, forensics, compliance, and
  demonstrating control effectiveness. Inadequate logging is a TOP 3 audit finding.

ISO Requirements:
  - Event logs record user activities, exceptions, faults
  - Logs include: user ID, date/time, event type, success/failure
  - System administrator and operator activities logged
  - Log files protected against tampering and unauthorized access
  - Clocks synchronized (accurate timestamps)

Cloud Implementation (AWS):

  Logging Architecture:
    ```
    Application → CloudWatch Logs → S3 (long-term)
    Infrastructure → CloudTrail → S3 + CloudWatch Logs
    Network → VPC Flow Logs → S3
    Security Events → GuardDuty → Security Hub → S3
    Access Logs → ALB/CloudFront → S3
    ```

  CloudTrail (Audit Logging):
    ```terraform
    resource "aws_cloudtrail" "audit" {
      name                       = "organization-audit-trail"
      s3_bucket_name            = aws_s3_bucket.audit_logs.id
      include_global_service_events = true
      is_multi_region_trail     = true
      enable_log_file_validation = true  # Tamper protection

      # Send to CloudWatch for real-time analysis
      cloud_watch_logs_group_arn = aws_cloudwatch_log_group.cloudtrail.arn
      cloud_watch_logs_role_arn  = aws_iam_role.cloudtrail_cloudwatch.arn

      event_selector {
        read_write_type           = "All"
        include_management_events = true

        # Log data events (S3, Lambda)
        data_resource {
          type   = "AWS::S3::Object"
          values = ["arn:aws:s3:::${var.audit_bucket_name}/*"]
        }
      }

      # Protect against tampering
      kms_key_id = aws_kms_key.cloudtrail.arn

      tags = {
        Purpose = "ISO27001-Audit-Logging"
      }
    }

    # Immutable log storage
    resource "aws_s3_bucket" "audit_logs" {
      bucket = "audit-logs-${var.account_id}"

      # Object Lock prevents deletion
      object_lock_enabled = true
    }

    resource "aws_s3_bucket_object_lock_configuration" "audit_logs" {
      bucket = aws_s3_bucket.audit_logs.id

      rule {
        default_retention {
          mode = "GOVERNANCE"
          days = 365  # 1 year retention (ISO minimum)
        }
      }
    }
    ```

  Log Retention Requirements:
    - CloudTrail: 1 year online (S3), 7 years total (Glacier)
    - Application logs: 90 days online, 1 year total
    - Security logs: 1 year online (compliance requirement)
    - VPC Flow Logs: 90 days

  Clock Synchronization:
    - NTP configured on all EC2 instances
    - AWS Systems Manager enforces time sync
    - Verified via compliance checks

Evidence for Audit:
  □ Logging Policy v1.2
  □ CloudTrail configuration (multi-region, log file validation)
  □ Log retention configuration (S3 lifecycle policies)
  □ S3 Object Lock configuration (tamper protection)
  □ Sample logs demonstrating required fields
  □ NTP configuration on EC2 instances
  □ Log access controls (who can view logs)

Common Pitfalls:
  ❌ Logs not retained long enough (ISO requires 1 year minimum)
  ❌ Logs not protected (can be deleted/modified)
  ❌ Insufficient log detail (missing user ID, timestamps)
  ❌ Logs not monitored (collected but never reviewed)
  ❌ Clock skew (inaccurate timestamps)

Effort: 24 hours (initial setup) + 2 hours/month (review)
Cost: $100-$500/month (storage, depending on volume)
Priority: 🟠 HIGH
Cross-Reference: NIST AU-2, AU-3, AU-9, AU-11; SOC2 CC7.2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A.8.24 - Use of Cryptography
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Control Objective:
  To ensure proper and effective use of cryptography to protect the
  confidentiality, authenticity, and/or integrity of information.

Why Critical:
  Cryptography is the last line of defense. If all other controls fail,
  encryption prevents data exposure. Weak cryptography = no protection.

ISO Requirements:
  - Cryptographic policy defining use of encryption
  - Appropriate cryptographic algorithms and key lengths
  - Key management throughout lifecycle
  - Cryptography for data at rest and in transit
  - Regular review of cryptographic implementations

Cloud Implementation (AWS):

  Encryption at Rest:
    ```terraform
    # S3 default encryption (AES-256)
    resource "aws_s3_bucket_server_side_encryption_configuration" "default" {
      bucket = aws_s3_bucket.data.id

      rule {
        apply_server_side_encryption_by_default {
          sse_algorithm     = "aws:kms"
          kms_master_key_id = aws_kms_key.s3.arn
        }
        bucket_key_enabled = true  # Reduces KMS API calls
      }
    }

    # RDS encryption
    resource "aws_db_instance" "app" {
      identifier     = "app-database"
      engine         = "postgres"
      engine_version = "15.3"

      storage_encrypted   = true
      kms_key_id          = aws_kms_key.rds.arn

      # Encrypted backups
      backup_retention_period = 30
      backup_encryption_enabled = true
    }

    # EBS volume encryption (enforced account-wide)
    resource "aws_ebs_encryption_by_default" "enabled" {
      enabled = true
    }
    ```

  Encryption in Transit:
    - TLS 1.2 or 1.3 only (TLS 1.0/1.1 disabled)
    - Strong cipher suites (ECDHE, AES-GCM)
    - HSTS enabled (Strict-Transport-Security header)
    - Certificate management via ACM (automated renewal)

  Key Management (AWS KMS):
    ```terraform
    resource "aws_kms_key" "data_encryption" {
      description             = "Data encryption key (ISO 27001)"
      deletion_window_in_days = 30
      enable_key_rotation     = true  # Annual automatic rotation

      policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
          {
            Sid    = "Enable IAM User Permissions"
            Effect = "Allow"
            Principal = {
              AWS = "arn:aws:iam::${var.account_id}:root"
            }
            Action   = "kms:*"
            Resource = "*"
          },
          {
            Sid    = "Allow services to use key"
            Effect = "Allow"
            Principal = {
              Service = [
                "s3.amazonaws.com",
                "rds.amazonaws.com",
                "lambda.amazonaws.com"
              ]
            }
            Action = [
              "kms:Decrypt",
              "kms:DescribeKey",
              "kms:CreateGrant"
            ]
            Resource = "*"
          }
        ]
      })

      tags = {
        Purpose = "ISO27001-Data-Encryption"
      }
    }

    # Key rotation monitoring
    resource "aws_cloudwatch_event_rule" "kms_rotation" {
      name        = "kms-key-rotation-check"
      description = "Alert if KMS keys not rotated annually"

      schedule_expression = "cron(0 9 1 * ? *)"  # Monthly check

      event_pattern = jsonencode({
        source      = ["aws.kms"]
        detail-type = ["AWS API Call via CloudTrail"]
        detail = {
          eventName = ["DisableKeyRotation"]
        }
      })
    }
    ```

  Cryptographic Standards:
    - Algorithms: AES-256, RSA-2048 or higher, ECDSA P-256+
    - Hashing: SHA-256 or higher (no MD5, SHA-1)
    - Key Derivation: PBKDF2, bcrypt, Argon2
    - TLS: Version 1.2 or 1.3 only

  Prohibited/Deprecated:
    ✗ DES, 3DES, RC4 (weak symmetric encryption)
    ✗ MD5, SHA-1 (weak hashing, collision attacks)
    ✗ RSA-1024 or lower (insufficient key length)
    ✗ TLS 1.0, TLS 1.1 (deprecated, vulnerabilities)
    ✗ Self-signed certificates in production

Evidence for Audit:
  □ Cryptography Policy v1.5
  □ KMS key configuration (customer-managed keys)
  □ S3 encryption configuration (all buckets)
  □ RDS encryption status (all instances)
  □ TLS configuration (ALB listeners, CloudFront)
  □ SSL Labs test results (A+ rating required)
  □ Key rotation schedule and history
  □ Certificate inventory (ACM)

Common Pitfalls:
  ❌ Using AWS-managed keys instead of customer-managed (less control)
  ❌ No key rotation (keys used indefinitely)
  ❌ Weak TLS cipher suites allowed
  ❌ Hardcoded encryption keys in code
  ❌ Data encrypted but keys not protected

Effort: 16 hours (policy + initial setup) + 2 hours/month (review)
Cost: $1/key/month (KMS) + storage overhead (negligible)
Priority: 🔴 CRITICAL
Cross-Reference: NIST SC-12, SC-13, SC-28; SOC2 CC6.7, CC6.8

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPLEMENTATION ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1: Critical Controls (Months 1-3)
  Priority: Must-have for certification

  □ A.8.2 - Privileged access rights (4 weeks)
  □ A.8.5 - Secure authentication (MFA) (6 weeks)
  □ A.8.9 - Configuration management (IaC) (8 weeks)
  □ A.8.15 - Logging (4 weeks)
  □ A.8.24 - Cryptography (3 weeks)

  Effort: 320 hours
  Cost: $50,000 (tools + implementation)

Phase 2: High-Priority Controls (Months 4-6)
  Priority: Expected for certification

  □ A.8.1 - User endpoint devices (3 weeks)
  □ A.8.3 - Information access restriction (3 weeks)
  □ A.8.8 - Management of technical vulnerabilities (4 weeks)
  □ A.8.13 - Information backup (2 weeks)
  □ A.8.16 - Monitoring activities (6 weeks)

  Effort: 240 hours
  Cost: $35,000

Phase 3: Medium-Priority Controls (Months 7-9)
  Priority: Nice-to-have, demonstrates maturity

  □ A.8.10 - Information deletion (2 weeks)
  □ A.8.11 - Data masking (3 weeks)
  □ A.8.18 - Use of privileged utility programs (2 weeks)
  □ A.8.23 - Web filtering (2 weeks)
  □ A.8.28 - Secure coding (8 weeks)

  Effort: 200 hours
  Cost: $25,000

Phase 4: Optimization (Months 10-12)
  Priority: Continuous improvement

  □ Automation and self-healing
  □ Advanced monitoring and SIEM
  □ Security orchestration (SOAR)
  □ Threat hunting capabilities

  Effort: 160 hours
  Cost: $40,000

Total Implementation:
  Timeline: 12 months
  Effort: 920 hours
  Cost: $150,000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CERTIFICATION AUDIT PREPARATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pre-Audit Checklist (A.8 Technological Controls):

Documentation:
  □ All policies approved and current (<12 months)
  □ Procedures documented and accessible
  □ Configuration baselines documented
  □ Network diagrams current
  □ Data flow diagrams current

Technical Evidence:
  □ Configuration exports (Terraform, AWS Config)
  □ Log samples demonstrating required fields
  □ Encryption status reports (S3, RDS, EBS)
  □ Access control configurations (IAM policies)
  □ Monitoring dashboards (CloudWatch, GuardDuty)

Operational Evidence:
  □ Quarterly access reviews completed
  □ Vulnerability scan results (monthly)
  □ Patch compliance reports
  □ Backup test results (quarterly)
  □ Incident response drill results

Common Audit Questions:
  1. "Show me how you enforce MFA for all users"
     → Okta policy + enrollment report (100%)

  2. "How do you detect configuration drift?"
     → AWS Config rules + drift detection alerts

  3. "Demonstrate log retention of 1 year"
     → S3 lifecycle policy + oldest log files

  4. "How do you manage privileged access?"
     → IAM policies + monthly review reports

  5. "Show encryption is enabled for all data at rest"
     → S3/RDS/EBS encryption reports

Tips for Stage 2 Audit:
  - Organize evidence by control number (A.8.1, A.8.2, etc.)
  - Have screenshots ready (don't navigate live during audit)
  - Practice explaining controls (elevator pitch)
  - Know your compensating controls (if any gaps)
  - Be honest about gaps (better than auditor finding them)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COST SUMMARY (A.8 Technological Controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Technology Costs (Annual):
  Identity & Access (Okta):         $7,000  ($50/user/month × 142 users × 1 year / 12)
  Endpoint Protection (CrowdStrike): $7,100  ($50/endpoint/month)
  Configuration Management:          $2,400  (AWS Config)
  Logging & Monitoring:              $6,000  (CloudWatch, Storage)
  Encryption (KMS):                    $120  (10 keys × $1/month)
  Backup & DR:                      $12,000  (cross-region replication)
  Vulnerability Scanning:            $2,400  (Inspector)

  Total Technology: $37,020/year

Implementation Costs (One-Time):
  Phase 1 (Critical): $50,000
  Phase 2 (High):     $35,000
  Phase 3 (Medium):   $25,000
  Phase 4 (Optimize): $40,000

  Total Implementation: $150,000

Ongoing Operational Costs (Annual):
  Access reviews:            $12,000  (10 hours/month × $100/hour)
  Config management:          $6,000  (5 hours/month)
  Log review:                 $6,000  (5 hours/month)
  Vulnerability remediation: $12,000  (10 hours/month)
  Incident response:          $6,000  (5 hours/month avg)

  Total Operational: $42,000/year

Grand Total: $150,000 (one-time) + $79,020/year (ongoing)
```

## Related Commands

- `/iso:soa-generator` - Generate Statement of Applicability
- `/iso:risk-treatment-plan` - Create risk treatment plan
- `/iso:certification-roadmap` - Plan certification process
- `/iso:isms-documentation-pack` - Generate ISMS documents
- `/grc-engineer:generate-implementation` - Generate IaC for controls
