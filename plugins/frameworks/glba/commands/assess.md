---
description: GLBA compliance readiness assessment
---

# GLBA Compliance Assessment

Evaluates organizational readiness for Gramm-Leach-Bliley Act (GLBA) compliance.

## Arguments

- Argument 1 - Assessment scope (required: full, safeguards, privacy, pretexting)
- Argument 2 - Institution type (optional: bank, credit-union, securities-firm, insurance-company, other)

## GLBA Overview

**Authority**: 15 U.S.C. 6801-6809
**Enforced by**: FTC, OCC, FDIC, Federal Reserve, NCUA, SEC, state regulators
**Effective**: 1999, with ongoing amendments
**Purpose**: Protect consumer financial privacy and secure financial information

## GLBA Components

### Safeguards Rule (16 CFR Part 314)

**Requirement**: Develop, implement, and maintain comprehensive information security program
**Applies to**: Financial institutions handling customer information
**Updated**: December 2021 (effective June 2023)

**Nine Elements Required**:

1. Risk assessment
2. Security systems design and implementation
3. Access controls and authorization
4. Encryption of customer information at rest and in transit
5. Multi-factor authentication (MFA)
6. Security awareness training
7. Incident response plan
8. Vendor/service provider oversight
9. Annual reporting to board of directors

### Privacy Rule (16 CFR Part 313)

**Requirement**: Provide clear privacy notices to consumers
**Key Elements**:

- Initial privacy notice at account opening
- Annual privacy notice (opt-out required if sharing with non-affiliates)
- Opt-out rights for certain information sharing
- Redelivery of notices after material changes

### Pretexting Protection (15 U.S.C. 6821)

**Prohibition**: Obtaining customer information under false pretenses
**Requirements**: Administrative, technical, and physical safeguards

## Assessment Scope Options

### Full Assessment

Comprehensive evaluation across all three GLBA components:

- Safeguards Rule compliance
- Privacy Rule implementation
- Pretexting prevention controls

### Safeguards-Only Assessment

Focused on information security program:

- Nine required elements evaluation
- Technical controls review
- Vendor management assessment

### Privacy-Only Assessment

Privacy notice and opt-out compliance:

- Notice delivery and content
- Opt-out mechanisms
- Sharing practices review

### Pretexting Assessment

Social engineering and fraud prevention:

- Authentication procedures
- Employee training
- Identity verification controls

## Institution Types

| Type | Examples | Primary Regulator |
|------|----------|------------------|
| **Banks** | Commercial banks, savings banks | OCC, FDIC, Federal Reserve |
| **Credit Unions** | Federal/state credit unions | NCUA |
| **Securities Firms** | Broker-dealers, investment advisors | SEC |
| **Insurance Companies** | Life, property, casualty insurers | State insurance commissioners |
| **Other** | Mortgage brokers, collection agencies, tax preparers | FTC |

## Assessment Output

1. **Compliance Score**: Overall GLBA readiness percentage
2. **Safeguards Rule Status**:
   - Nine required elements implementation
   - Technical controls maturity
   - Encryption coverage
   - MFA deployment
   - Training program effectiveness
   - Incident response capability
   - Vendor management rigor
   - Board reporting status
3. **Privacy Rule Status**:
   - Privacy notice accuracy and completeness
   - Delivery mechanisms
   - Opt-out process functionality
   - Information sharing practices
4. **Pretexting Protection**:
   - Authentication strength
   - Social engineering defenses
   - Employee awareness
5. **Regulatory Risk Assessment**:
   - Enforcement action likelihood
   - Gap severity analysis
6. **Remediation Roadmap**:
   - Prioritized action plan
   - Quick wins vs. long-term initiatives
   - Resource requirements
   - Timeline estimates

## Key Requirements by Rule

### Safeguards Rule Requirements

**Risk Assessment**:

- Identify reasonably foreseeable internal/external threats
- Assess likelihood and potential damage
- Evaluate existing safeguards effectiveness

**Security Program Elements**:

- Designated qualified individual (CISO or equivalent)
- Written information security plan
- Access controls and authorization
- Encryption at rest and in transit (customer information)
- Multi-factor authentication for remote access
- Secure development practices
- Security awareness training
- Incident response plan
- Service provider oversight
- Annual board reporting

**Technical Controls**:

- Network security (firewalls, segmentation)
- Endpoint protection
- Data loss prevention
- Logging and monitoring
- Vulnerability management
- Penetration testing (risk-based)

### Privacy Rule Requirements

**Privacy Notice Content**:

- Information collected
- How information is shared
- How information is protected
- Consumer rights to opt-out
- Contact information

**Delivery Requirements**:

- Initial notice at customer relationship establishment
- Annual notice (if required)
- Notice of material changes
- Clear and conspicuous delivery

**Opt-Out Requirements**:

- Reasonable means to opt-out (online, phone, mail)
- 30-day minimum opt-out period
- Honor opt-out requests
- Reaffirmation for expired opt-outs

### Pretexting Protection

**Prevention Measures**:

- Customer authentication before releasing information
- Employee training on social engineering
- Verification procedures for third-party requests
- Incident reporting for suspected pretexting

## Common Compliance Gaps

1. **Encryption**:
   - Customer information not encrypted at rest
   - Transmission encryption gaps (email, file transfers)
   - Inadequate key management

2. **Multi-Factor Authentication**:
   - Not deployed for remote access
   - SMS-based MFA (inadequate for high-risk scenarios)
   - No MFA for privileged accounts

3. **Risk Assessment**:
   - Not performed or outdated
   - Missing threat analysis
   - No assessment of safeguards effectiveness

4. **Vendor Management**:
   - No due diligence process
   - Contracts lack security requirements
   - No ongoing monitoring

5. **Incident Response**:
   - No written IR plan
   - Plan not tested
   - No notification procedures

6. **Privacy Notices**:
   - Outdated or inaccurate
   - Not delivered annually
   - Opt-out mechanisms broken

7. **Board Reporting**:
   - Security not reported to board
   - No annual certification
   - Insufficient detail

## FTC Enforcement Focus Areas

**Recent Enforcement Actions**:

- Inadequate data security (e.g., Drizly, Chegg)
- Failure to implement MFA
- Lack of encryption
- Insufficient vendor oversight
- Misleading privacy statements

**Penalties**:

- Civil penalties up to \$50,000+ per violation per day
- Individual liability for officers/directors
- Compliance monitoring requirements
- Reputational damage

## Examples

```bash
# Full GLBA assessment for commercial bank
/glba:assess full bank

# Safeguards Rule assessment only
/glba:assess safeguards credit-union

# Privacy Rule compliance check for broker-dealer
/glba:assess privacy securities-firm

# Pretexting controls for insurance company
/glba:assess pretexting insurance-company
```
