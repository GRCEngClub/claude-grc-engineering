---
name: breach-process
description: GDPR breach notification procedures and 72-hour requirement
---

# Breach Notification Process

Guides compliance with GDPR breach notification requirements under Articles 33 (supervisory authority) and 34 (data subjects).

## Arguments

- Argument 1 - Breach severity (optional: low, moderate, high, critical)
- Argument 2 - Process phase (optional: detection, assessment, notification, documentation)

## Definition of Personal Data Breach

**Article 4(12)**: "A breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to, personal data transmitted, stored or otherwise processed."

### Three Types of Breach

1. **Confidentiality Breach**
   - Unauthorized or accidental disclosure
   - Unauthorized access
   - Examples: Hacking, lost laptop, email to wrong recipient

2. **Integrity Breach**
   - Unauthorized or accidental alteration
   - Data corruption or modification
   - Examples: Ransomware, database manipulation, accidental deletion

3. **Availability Breach**
   - Accidental or unauthorized loss of access
   - Destruction of data
   - Examples: Ransomware, DDoS, system failure, natural disaster

**Note**: A single incident can involve multiple breach types

## The 72-Hour Rule (Article 33)

### Notification to Supervisory Authority

**Obligation**:

- Notify supervisory authority **without undue delay**
- **Within 72 hours** of becoming aware (where feasible)
- If >72 hours, must explain delay

**"Becoming Aware"**:

- When reasonable degree of certainty breach occurred
- Not when initially suspected
- Clock starts when controller has information to conclude breach likely
- Ongoing investigation does not pause clock

### When Notification NOT Required

**Exception** (Article 33(1)):

- Breach is **unlikely to result in a risk** to rights and freedoms of individuals

**Risk Assessment Factors**:

- Type and volume of data
- Ease of identification
- Severity and likelihood of consequences
- Special characteristics of data subject (vulnerable individuals)
- Special characteristics of controller (healthcare, financial)
- Number of affected individuals

### Notification Content (Article 33(3))

**Minimum Required Information**:

1. **Nature of breach**
   - Categories of data subjects affected
   - Approximate number of data subjects
   - Categories of personal data records
   - Approximate number of records

2. **Contact point**
   - Name and contact details of DPO or other contact
   - Where more information can be obtained

3. **Likely consequences**
   - Describe likely consequences of breach
   - Potential adverse effects on individuals

4. **Measures taken/proposed**
   - Measures taken to address breach
   - Measures to mitigate adverse effects
   - Remediation steps

### Phased Notification

**Article 33(4)**: If information not available within 72 hours:

- Provide initial notification with available information
- Provide additional information in phases "without undue further delay"
- Explain reasons for delay

**Typical Phased Approach**:

1. **Initial (<72h)**: Breach type, approximate scope, contact point
2. **Update 1 (1-2 weeks)**: Confirmed numbers, detailed consequences
3. **Final (ongoing)**: Remediation complete, lessons learned

## Notification to Data Subjects (Article 34)

### When Required

**Mandatory notification if**:

- Breach likely to result in **high risk** to rights and freedoms

**High Risk Factors**:

- Special category data (health, biometric, racial, etc.)
- Financial data (credit cards, bank details)
- Credentials (passwords, especially if not hashed)
- Large-scale breach
- Vulnerable data subjects (children)
- Significant adverse effects (discrimination, identity theft, financial loss, reputational damage)

### Notification Content

**Communicate in clear and plain language**:

1. **Nature of breach**: What happened
2. **Contact point**: DPO or contact for more information
3. **Likely consequences**: Potential impacts on individuals
4. **Measures taken/proposed**: Steps to mitigate
5. **Recommended actions**: What individuals should do (change passwords, monitor accounts, etc.)

### Timing

- **Without undue delay**
- No specific deadline (unlike 72-hour rule for authority)
- As soon as possible after discovery
- May notify authority first to seek guidance

### When Notification NOT Required

**Exceptions** (Article 34(3)):

1. **Appropriate safeguards applied** (Article 34(3)(a))
   - Encryption or pseudonymization rendered data unintelligible
   - Example: Stolen encrypted laptop with strong encryption

2. **Subsequent measures taken** (Article 34(3)(b))
   - Controller took measures ensuring high risk no longer likely
   - Example: Deleted data before unauthorized party accessed it

3. **Disproportionate effort** (Article 34(3)(c))
   - Public communication or similar measure
   - Equally effective
   - Example: Cannot identify/contact affected individuals, public notice instead

### Methods of Communication

**Direct Individual Notification**:

- Email (preferred if available)
- Mail (postal)
- Phone
- SMS
- In-app notification

**Public Communication** (if disproportionate):

- Press release
- Website notice (prominent)
- Social media
- Paid advertising

## Breach Response Process

### Phase 1: Detection and Containment (Hours 0-4)

**Immediate Actions**:

1. **Detect and verify** breach occurred
2. **Contain** breach (stop ongoing unauthorized access)
3. **Preserve evidence** (logs, forensic data)
4. **Assemble response team** (IT, security, legal, DPO, communications)
5. **Initial assessment** of scope and severity

**Key Questions**:

- What happened?
- When did it occur?
- Is it ongoing?
- What systems/data affected?
- How many individuals potentially affected?

### Phase 2: Assessment (Hours 4-24)

**Detailed Investigation**:

1. **Root cause analysis**: How did breach occur?
2. **Scope determination**: What data accessed/lost/altered?
3. **Impact assessment**: What are consequences for individuals?
4. **Risk assessment**: Likelihood and severity of adverse effects
5. **Count affected individuals**: Exact or approximate numbers
6. **Identify data categories**: Personal data, special categories, credentials

**Risk Assessment**:

- Low: Minimal impact, unlikely adverse effects
- Moderate: Some potential for harm
- High: Significant adverse effects likely
- Critical: Severe consequences (special categories, credentials, large scale)

### Phase 3: Notification Decision (Hours 24-48)

**Determine Notification Obligations**:

**Supervisory Authority (Article 33)**:

- Is risk unlikely? → No notification required
- Is risk possible/likely? → Notification required (<72h)

**Data Subjects (Article 34)**:

- Is risk high? → Notification required (without undue delay)
- Are exceptions applicable? → May not be required

**Consult DPO**:

- DPO must be involved in breach response
- Seek advice on notification decisions
- Document DPO recommendations

### Phase 4: Notification (Hours 48-72)

**To Supervisory Authority** (if required):

1. **Prepare notification** with Article 33(3) content
2. **Submit** to lead supervisory authority
   - Online portal (if available)
   - Email or designated contact
   - Specify if phased notification planned
3. **Confirm receipt** and note case reference
4. **Cooperate** with authority investigation

**To Data Subjects** (if required):

1. **Prepare communications** in clear language
2. **Identify affected individuals** and contact methods
3. **Coordinate messaging** (avoid panic, provide guidance)
4. **Send notifications** via appropriate channels
5. **Set up helpline/FAQ** for inquiries
6. **Monitor** for questions and concerns

### Phase 5: Remediation (Ongoing)

**Immediate Remediation**:

1. **Close security gaps** that caused breach
2. **Reset credentials** if compromised
3. **Restore data** from backups if lost
4. **Implement additional safeguards**

**Short-Term Actions**:

1. **Monitoring** for signs of data misuse
2. **Support** for affected individuals (credit monitoring, ID theft services)
3. **Updates** to authority and individuals as investigation progresses

**Long-Term Actions**:

1. **Root cause remediation** (fix underlying issues)
2. **Policy/procedure updates** (prevent recurrence)
3. **Staff training** (address human factors)
4. **Security improvements** (defense in depth)
5. **Lessons learned** exercise

### Phase 6: Documentation (Ongoing)

**Record of Breach** (Article 33(5)):

- Document **all** breaches (even those not notified)
- Facts of breach
- Effects of breach
- Remedial action taken

**Purpose**:

- Demonstrate compliance
- Supervisory authority can verify compliance
- Learn from incidents

**Breach Register Should Include**:

- Date/time of breach
- Date/time became aware
- Description of breach (type, cause)
- Categories and volume of data
- Number of individuals affected
- Consequences and likely adverse effects
- Measures taken to address breach
- Whether authority notified (date, reference)
- Whether individuals notified (date, method)
- Reasoning if not notified
- Communications and decisions
- DPO involvement
- Lessons learned and preventive measures

## Special Considerations

### Processor Breaches (Article 33(2))

**Processor obligations**:

- Notify controller **without undue delay** after becoming aware
- No specific timeframe (unlike controller's 72 hours)
- Controller then has notification obligations

**Processor should provide**:

- Detailed breach information
- Affected clients/controllers
- Scope and impact assessment
- Remediation steps

**Data Processing Agreement** should specify:

- Breach notification procedures
- Timeframes (recommend <24 hours)
- Information to be provided
- Cooperation with controller

### Cross-Border Breaches

**Lead Supervisory Authority** (Article 56):

- Notify lead authority (main establishment)
- Lead authority coordinates with other concerned authorities
- One-stop-shop mechanism

**Concerned Authorities**:

- Lead authority may inform other authorities
- Cooperation through mutual assistance
- Consistent approach across Member States

### Third-Country Transfers

**Breach involving data transferred outside EU**:

- Same notification requirements apply
- Complexity in identifying individuals
- May need to notify multiple authorities
- Consider local breach notification laws (e.g., US state laws)

### Ransomware

**Unique considerations**:

- Availability breach (minimum)
- Likely confidentiality breach (assume data exfiltrated)
- Do NOT pay ransom before assessment
- Notify authority even if ransom paid
- Cannot assume data not accessed/disclosed

## Supervisory Authority Responses

**Possible Actions**:

- Request additional information
- Investigation/audit
- Corrective measures (improve security, notify individuals)
- Warnings or reprimands
- Temporary/permanent processing ban
- Administrative fines

**Cooperation**:

- Respond promptly to authority requests
- Provide requested evidence
- Implement recommended measures
- Maintain open communication

## Penalties for Non-Compliance

**Failure to notify** (Article 83):

- Up to **€10M** or **2% of global annual turnover** (whichever higher)
- Factors: Intentional or negligent, cooperation, previous infringements

**Related violations** (higher fines):

- Up to €20M or 4% if breach caused by failure to implement security (Article 32)

## Breach Notification Tools

### Breach Assessment Questionnaire

1. What type of breach occurred? (confidentiality, integrity, availability)
2. What personal data categories affected?
3. Any special category data?
4. How many individuals affected?
5. What are potential consequences for individuals?
6. What safeguards were in place? (encryption, etc.)
7. What immediate actions taken?
8. Can breach be contained?

### Risk Matrix

| Data Type | Volume | Safeguards | Risk Level | Notify Authority? | Notify Individuals? |
|-----------|--------|------------|------------|-------------------|---------------------|
| Contact info | <100 | None | Low | No | No |
| Contact info | >1000 | None | Moderate | Yes | No |
| Financial | Any | None | High | Yes | Yes |
| Health/Biometric | Any | None | Critical | Yes | Yes |
| Any | Any | Encrypted | Low | Assess | Likely No |

### Notification Timeline Template

| Milestone | Deadline | Responsible | Status |
|-----------|----------|-------------|--------|
| Breach detected | T+0 | IT/Security | |
| Response team assembled | T+2h | Incident Manager | |
| Scope assessed | T+24h | Investigation Team | |
| Notification decision | T+48h | DPO + Legal | |
| Authority notification | T+72h | DPO | |
| Individual notification | T+96h | Communications | |
| Initial remediation | T+1 week | IT/Security | |

## Examples

```bash
# Guide breach response for critical severity breach
/gdpr:breach-process critical

# Assess notification requirements for moderate breach
/gdpr:breach-process moderate assessment

# Document breach that has been detected
/gdpr:breach-process high detection

# Prepare notifications for high-risk breach
/gdpr:breach-process high notification

# Review overall breach response procedures
/gdpr:breach-process

# Low severity breach documentation
/gdpr:breach-process low documentation
```

## Common Mistakes to Avoid

1. **Waiting for complete information**: Notify within 72h even if incomplete, update later
2. **Delaying while investigating**: Clock starts when "becoming aware" (reasonable certainty)
3. **Not documenting non-notified breaches**: Article 33(5) requires all breaches documented
4. **Generic notifications**: Be specific about breach, consequences, actions
5. **Not involving DPO**: DPO must advise on breach response
6. **Ignoring processor breaches**: Processors must notify controllers promptly
7. **No breach response plan**: Plan and test breach procedures in advance
8. **Focusing only on notification**: Remediation and prevention equally important
9. **Not training staff**: Employees must know how to recognize and report breaches
10. **Underestimating risk**: When in doubt, notify (better safe than fined)

## Breach Preparedness

### Incident Response Plan

**Include**:

- Breach definition and examples
- Reporting procedures (internal)
- Response team roles (IT, security, legal, DPO, communications, management)
- Containment procedures
- Investigation checklists
- Assessment criteria (risk levels)
- Notification decision trees
- Communication templates
- Contact lists (supervisory authority, affected parties, vendors)
- Escalation procedures
- Training and testing schedule

### Regular Testing

**Exercises**:

- Tabletop exercises (quarterly)
- Simulated breaches (annually)
- Update procedures based on lessons learned
- Test notification procedures (without sending)
- Validate contact lists

### Staff Training

**All Staff**:

- Recognize and report potential breaches
- Don't delay reporting
- Preserve evidence

**Response Team**:

- Detailed procedures
- Roles and responsibilities
- Tools and systems
- Communication protocols
- Legal obligations

**Management**:

- Oversight and approval
- Resource allocation
- Authority engagement
- Public communications
