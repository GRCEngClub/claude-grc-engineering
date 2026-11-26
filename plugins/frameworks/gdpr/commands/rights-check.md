---
description: Verify data subject rights implementation (access, erasure, portability, etc.)
---

# Data Subject Rights Check

Evaluates implementation of the 8 data subject rights under GDPR Articles 12-22.

## Arguments

- Argument 1 - Specific right to check (optional: access, rectification, erasure, restriction, portability, object, automated-decisions, all)
- Argument 2 - Check depth (optional: basic, comprehensive, audit-ready)

## Overview of Data Subject Rights

GDPR grants individuals 8 fundamental rights over their personal data. Organizations must facilitate the exercise of these rights.

## General Requirements (Article 12)

### Response Timeframes

- **1 month** to respond to requests (standard)
- **+2 months** extension if complex/numerous (inform data subject within 1 month)
- **Without undue delay** for rectification/erasure urgent cases

### No Fee (Generally)

- Rights exercised **free of charge**
- Fee allowed if requests manifestly unfounded, excessive, or repetitive
- Reasonable fee for administrative costs

### Transparent Communication

- **Concise, transparent, intelligible** language
- **Plain language** (no legalese)
- **Written or electronic** form (preference of data subject)
- **Oral** if requested (must verify identity)

### Identity Verification

- Verify identity before responding (proportionate measures)
- Request additional information if reasonable doubts
- Balance verification with not collecting excessive data

### Right to Complain

- Inform data subjects of right to lodge complaint with supervisory authority
- Provide supervisory authority contact details

## 1. Right to Be Informed

**Implicit right exercised through privacy notices**

### Fair Processing Information (Articles 13-14)

**At Collection (Article 13)**:

- Controller identity and contact
- DPO contact (if applicable)
- Purposes and lawful basis
- Legitimate interests (if applicable)
- Recipients or categories
- Third country transfers and safeguards
- Retention period
- Data subject rights (access, rectification, erasure, etc.)
- Right to withdraw consent (if applicable)
- Right to complain
- Statutory/contractual requirement
- Automated decision-making details

**Not Obtained from Data Subject (Article 14)**:

- All Article 13 information, PLUS:
- Categories of personal data
- Source of data (including public sources)

**Timing**:

- At collection (Article 13): When data obtained
- Not from subject (Article 14): Within 1 month, or at first communication, or before disclosure

### Implementation Check

- Privacy notices available and accessible?
- Content complete per Articles 13/14?
- Multi-layered approach (short + full notice)?
- Language clear and plain?
- Updated when processing changes?

## 2. Right of Access (Article 15)

**Data subjects can request**:

1. Confirmation whether personal data processed
2. Copy of personal data
3. Supplementary information

### Supplementary Information Required

- Purposes of processing
- Categories of data
- Recipients or categories
- Retention period (or criteria)
- Rights (rectification, erasure, restriction, object, complain)
- Source of data (if not from data subject)
- Automated decision-making details
- Safeguards for third country transfers

### Copy of Data

- **First copy**: Free of charge
- **Additional copies**: Reasonable fee for administrative costs
- **Format**: Commonly used electronic format (if electronic request)

### Implementation Check

- Process to search and compile personal data?
- All systems/databases covered?
- Automated retrieval where possible?
- Verification of identity?
- Response within 1 month?
- Copy provided in accessible format?
- Supplementary information included?

### Common Challenges

- Data scattered across multiple systems
- Unstructured data (emails, documents)
- Third-party data (processor, joint controller)
- Impact on others' rights (redaction needed)
- Manifestly unfounded/excessive requests

## 3. Right to Rectification (Article 16)

**Data subjects can request**:

- Correction of inaccurate personal data
- Completion of incomplete personal data

### Scope

- Factual inaccuracies (names, addresses, dates)
- Incomplete data relevant to purposes
- Takes into account purposes of processing

### Notification Obligation

- Communicate rectification to recipients
- Unless impossible or disproportionate effort
- Inform data subject of recipients if requested

### Implementation Check

- Simple process to submit corrections?
- Verification of corrections?
- Updates propagated to all systems?
- Notification to recipients/processors?
- Response within 1 month?

## 4. Right to Erasure / "Right to be Forgotten" (Article 17)

**Data subjects can request deletion when**:

### Grounds for Erasure

1. **No longer necessary**: Data not needed for original purpose
2. **Consent withdrawn**: Lawful basis was consent, now withdrawn
3. **Objection**: Data subject objects (no overriding legitimate grounds)
4. **Unlawful processing**: Processing violates GDPR
5. **Legal obligation**: Deletion required by EU/Member State law
6. **Children's data**: Consent obtained when subject was child (Article 8)

### Exceptions (Right Not Absolute)

- **Freedom of expression/information**
- **Legal obligation** (compliance with law)
- **Public interest** (public health, archiving, scientific/historical research)
- **Legal claims** (establishment, exercise, defense)

### "Right to be Forgotten" (Public Data)

- If data made public, controller must inform other controllers
- Take reasonable steps (technical measures) to notify
- Consider technology and cost

### Implementation Check

- Process to identify and delete data?
- Deletion from all systems (including backups)?
- Notification to processors and recipients?
- "Right to be forgotten" for published data?
- Response within 1 month?
- Assessment of grounds and exceptions?

### Deletion Challenges

- Backups (delete on backup cycle, mark for deletion)
- Legal hold (litigation, regulatory obligation)
- Logs (anonymize where possible)
- Third parties (processors, recipients)

## 5. Right to Restriction of Processing (Article 18)

**Data subjects can request restriction (not deletion) when**:

### Grounds for Restriction

1. **Accuracy disputed**: During verification period
2. **Unlawful processing**: Subject prefers restriction over erasure
3. **No longer needed**: But subject needs for legal claims
4. **Objection pending**: During assessment of controller's grounds

### Restricted Processing Means

- **Storage only** (no further processing)
- **Exceptions**: Subject consent, legal claims, others' protection, public interest

### Lifting Restriction

- Inform data subject before lifting restriction
- Only lift when grounds no longer apply

### Implementation Check

- Ability to "flag" or mark restricted data?
- Prevents processing (except storage)?
- Notification to recipients?
- Inform subject before lifting?
- Response within 1 month?

## 6. Right to Data Portability (Article 20)

**Data subjects can request**:

- Receive personal data in structured, commonly used, machine-readable format
- Transmit data to another controller

### Scope (Narrow Right)

Only applies when:

- **Lawful basis**: Consent OR contract
- **Processing**: Carried out by automated means

**Does NOT apply to**:

- Manual processing/paper records
- Processing on other lawful bases (legal obligation, legitimate interests, etc.)

### "Structured, Commonly Used, Machine-Readable"

- JSON, CSV, XML formats
- Not PDF, printed documents
- Interoperable between systems

### Direct Transmission

- Transmit directly to another controller "where technically feasible"
- Does not require interoperability between controllers

### Rights of Others

- Must not adversely affect others' rights and freedoms
- May require redaction/exclusion

### Implementation Check

- Automated export in machine-readable format?
- Common formats (JSON, CSV, XML)?
- Includes all data in scope (consent/contract + automated)?
- Ability to transmit to another controller?
- Response within 1 month?

## 7. Right to Object (Article 21)

### Two Types of Objection

#### General Right to Object (Article 21(1))

**Applies when lawful basis is**:

- Legitimate interests (Article 6(1)(f))
- Public task (Article 6(1)(e))

**Data subject must**:

- Object on grounds relating to particular situation

**Controller must**:

- Stop processing UNLESS
- Demonstrate compelling legitimate grounds overriding data subject's interests/rights/freedoms, OR
- Processing for legal claims

#### Absolute Right to Object (Article 21(2-3))

**Direct marketing**:

- Right to object at any time
- No balancing test - must stop immediately
- Includes profiling for direct marketing

**Scientific/historical research or statistics**:

- Right to object on grounds of particular situation
- Unless necessary for public interest task

### Opt-Out vs. Right to Object

- Direct marketing opt-out ≠ full right to object
- Separate processes may be needed

### Implementation Check

- Clear information about right to object?
- Explicit mention in privacy notice?
- Easy method to object (one-click for direct marketing)?
- Processing stops upon objection?
- Balancing test for legitimate interests (if applicable)?
- Response within 1 month?

## 8. Rights Related to Automated Decision-Making (Article 22)

### Scope

**Automated decision-making that**:

- Is based solely on automated processing (including profiling)
- Produces legal or similarly significant effects

**Examples**:

- Credit scoring (automatic loan denial)
- Algorithmic hiring (automatic rejection)
- Online behavioral advertising (if significant effect)
- Healthcare decision algorithms

### General Prohibition

Data subject has right NOT to be subject to such decisions

### Exceptions (When Allowed)

1. **Necessary for contract** (entering or performing)
2. **Authorized by law** (with safeguards for rights/freedoms/interests)
3. **Explicit consent** (with safeguards)

### Safeguards Required (Exceptions 1 & 3)

- Right to **human intervention**
- Right to **express point of view**
- Right to **contest the decision**

### Special Category Data

- **NOT allowed** for automated decisions involving special categories
- **Exception**: Explicit consent OR substantial public interest + suitable safeguards

### Implementation Check

- Identification of automated decision-making?
- Legal basis for automated decisions?
- Safeguards in place (human intervention, contest)?
- Information provided to data subjects?
- Meaningful information about logic?
- Significance and consequences explained?

## Implementation Framework

### Rights Management System

**Essential Components**:

1. **Request intake**: Portal, email, phone, mail
2. **Identity verification**: Proportionate measures
3. **Request routing**: To responsible teams/systems
4. **Deadline tracking**: 1-month (extendable to 3) SLAs
5. **Data retrieval**: Across all systems and databases
6. **Response generation**: Consistent templates
7. **Audit trail**: Log all requests and responses
8. **Metrics and reporting**: Volume, types, response times

### Verification Procedures

**Proportionate Measures**:

- Match request to known data (email, account number)
- Request additional information if reasonable doubts
- Challenge: Don't collect excessive data for verification

**Examples**:

- Account holders: Login to portal
- Former customers: Match to order history, DOB
- Unknown subjects: Request identifying information

### Fees and Refusals

**Manifestly Unfounded or Excessive**:

- Charge reasonable fee, OR
- Refuse to act
- Must demonstrate unfounded/excessive nature
- Inform data subject and complaint rights

**Examples**:

- Repetitive requests without change
- Clearly no data held
- Harassment or abuse

### Communication Templates

**Standard Responses Needed**:

- Acknowledgment (especially if extension needed)
- Access request fulfillment
- Erasure confirmation
- Restriction confirmation
- Portability data package
- Objection acknowledgment
- Refusal (with reasons and complaint rights)

### Staff Training

**Key Personnel**:

- Customer service (front-line request handlers)
- IT/Data teams (retrieval and deletion)
- Legal/Compliance (complex requests)
- DPO (oversight and advice)

**Training Topics**:

- Recognizing rights requests
- Verification procedures
- Deadlines and escalation
- Systems and data locations
- Templates and tools

## Examples

```bash
# Check all data subject rights implementation
/gdpr:rights-check all comprehensive

# Verify right of access implementation
/gdpr:rights-check access

# Check erasure (right to be forgotten) procedures
/gdpr:rights-check erasure comprehensive

# Verify data portability capability
/gdpr:rights-check portability

# Basic check of rectification process
/gdpr:rights-check rectification basic

# Audit-ready assessment of all rights
/gdpr:rights-check all audit-ready

# Check automated decision-making safeguards
/gdpr:rights-check automated-decisions comprehensive
```

## Common Implementation Gaps

1. **No centralized request process**: Requests lost or delayed
2. **Inadequate identity verification**: Over/under verification
3. **Data scattered**: Can't locate all personal data
4. **No recipient tracking**: Can't notify about erasure/rectification
5. **Backup challenges**: Can't delete from backups
6. **Third-party systems**: Processors not integrated
7. **No metrics**: Can't track compliance or trends
8. **Insufficient training**: Staff don't recognize requests
9. **Portability gaps**: No machine-readable export
10. **Automated decisions unidentified**: Don't know where they occur

## Best Practices

1. **Proactive transparency**: Explain rights in privacy notice
2. **Self-service portals**: Enable data subjects to exercise rights online
3. **Automated workflows**: Ticket systems, SLA tracking
4. **Data mapping prerequisite**: Know where data is before requests arrive
5. **Regular testing**: Simulate requests, measure response times
6. **DPO involvement**: Review complex/novel requests
7. **Metrics and KPIs**: Track volume, types, resolution times
8. **Continuous improvement**: Learn from requests to improve practices
