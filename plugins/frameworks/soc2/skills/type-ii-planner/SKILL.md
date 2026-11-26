---
name: type-ii-planner
description: Plan SOC 2 Type II period testing timeline
---

# SOC 2 Type II Planner

Generates a detailed timeline and checklist for SOC 2 Type II audit period testing, including evidence collection schedules, review milestones, and readiness gates.

## Usage

```bash
/soc2:type-ii-planner <period-start> <period-end> [options]
```

## Arguments

- Argument 1 - Period start date (format: YYYY-MM-DD)
- Argument 2 - Period end date (format: YYYY-MM-DD)
- Argument 3 - Options: `--audit-firm=name`, `--output=format` (timeline, checklist, gantt)

## Examples

```bash
# Standard 12-month period
/soc2:type-ii-planner 2024-01-01 2024-12-31

# 6-month period (minimum)
/soc2:type-ii-planner 2024-07-01 2024-12-31

# With audit firm and Gantt output
/soc2:type-ii-planner 2024-01-01 2024-12-31 --audit-firm="Example Audit LLP" --output=gantt
```

## Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOC 2 TYPE II AUDIT TIMELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Audit Period: January 1, 2024 - December 31, 2024 (12 months)
Audit Firm: [To be selected]
Estimated Audit Start: January 2025
Report Date: March 2025 (target)

Period Requirements:
✓ Minimum duration: 6 months (AICPA requirement)
✓ Selected duration: 12 months (standard for first-time)
✓ Controls must be operating for entire period
✓ Evidence required from all months

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
READINESS TIMELINE (Pre-Period)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3 Months Before Period Start (Oct 2023):
□ Complete SOC 2 readiness assessment
  Command: /soc2:assess security type2
  Output: Identifies gaps in controls/processes

□ Select Trust Service Criteria
  Required: Security (CC1-CC9)
  Optional: Availability, Confidentiality, Processing Integrity, Privacy
  Decision: Document scope in System Description

□ Implement missing controls
  Priority: All Type A (design) deficiencies
  Timeline: Must be operational by period start

□ Document policies and procedures
  Required: All control policies
  Approval: Executive management sign-off
  Version: Must be dated before period start

□ Set up evidence collection automation
  Command: /engineer:monitor-continuous SOC2 daily
  Purpose: Continuous evidence collection

2 Months Before (Nov 2023):
□ Select and engage audit firm
  RFP Process: Get quotes from 3+ firms
  Budget: \$15k-\$50k depending on complexity
  Deliverables: Type II report, management letter

□ Conduct readiness audit (optional but recommended)
  Purpose: Identify issues before official audit
  Scope: Design testing only (point-in-time)
  Cost: ~30% of full audit cost

□ Train staff on control procedures
  Audience: All personnel involved in controls
  Topics: Evidence collection, quarterly reviews, incident response

1 Month Before (Dec 2023):
□ Perform dry-run of quarterly reviews
  Purpose: Validate process before period start
  Evidence: Practice access reviews, change management reviews

□ Verify automated evidence collection
  Test: Ensure logs, reports generating correctly
  Retention: Configure 1+ year retention

□ Finalize System Description
  Content: Infrastructure, processes, controls
  Review: Internal legal, IT, security review
  Approval: Management sign-off

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUDIT PERIOD (Jan 1 - Dec 31, 2024)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Month 1 - January 2024:
✓ Period Start - Day 1 (Jan 1)
  - All controls must be operating
  - Policies/procedures in effect
  - Evidence collection begins

□ Q1 Activities:
  - Quarterly access review (due: Jan 31)
  - Vulnerability scans (weekly)
  - Change management board meetings (weekly)
  - Security awareness training (monthly)
  - Incident response testing (quarterly)

□ Evidence Collection:
  - Save all access request tickets
  - Document all changes (CAB minutes)
  - Collect vulnerability scan results
  - Maintain security training records

Month 2 - February 2024:
□ Monthly checkpoint
  - Review evidence collection completeness
  - Verify no control gaps/outages
  - Document any incidents/exceptions

Month 3 - March 2024:
□ End of Q1 - Major Milestone
  ✓ First quarter complete
  ✓ Quarterly access review completed
  ✓ Quarterly management review completed
  ✓ All Q1 evidence collected and organized

Month 4-6 (Apr-Jun 2024) - Q2:
□ Q2 Activities (same as Q1)
□ Mid-period review (internal)
  - Verify controls still operating
  - Check evidence completeness
  - Identify any gaps early

□ End of Q2 (June 30):
  ✓ Halfway through period
  ✓ Second quarterly reviews complete
  ✓ 6-month minimum achieved (early exit possible if needed)

Month 7-9 (Jul-Sep 2024) - Q3:
□ Q3 Activities (same as Q1/Q2)
□ Pre-audit preparation begins
  - Contact audit firm for scheduling
  - Begin organizing evidence
  - Identify PBC (Provided By Client) list

□ End of Q3 (Sept 30):
  ✓ Third quarterly reviews complete
  ✓ Prepare for final quarter

Month 10-12 (Oct-Dec 2024) - Q4:
□ Q4 Activities (same as Q1/Q2/Q3)
□ Final month activities:
  - Complete all quarterly reviews
  - Collect final month evidence
  - Prepare comprehensive evidence package

✓ Period End - Day 365 (Dec 31)
  - All controls must operate through final day
  - Final evidence collection
  - Period complete

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POST-PERIOD (Jan-Mar 2025)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Week 1-2 (Early Jan 2025):
□ Evidence Package Preparation
  Command: /soc2:service-auditor-prep --period 2024
  Output: Complete evidence package

□ Organize evidence by control
  Structure: ./evidence/[control-id]/
  Contents: Policies, automated evidence, manual samples

□ Finalize System Description
  Update: Any changes during period
  Approval: Final management sign-off

Week 3-4 (Mid-Late Jan 2025):
□ Audit Kickoff Meeting
  Attendees: Audit firm, IT, Security, Management
  Agenda: Scope, timeline, evidence location, key contacts

□ Provide PBC (Provided By Client) List
  Contents: ~100-200 evidence items
  Format: Organized by TSC control
  Access: Secure file share or audit platform

Week 5-8 (Feb 2025):
□ Fieldwork Period
  - Auditors test control design
  - Auditors test operating effectiveness (samples)
  - Management provides additional evidence as requested
  - Weekly status calls with audit team

□ Testing Activities:
  - Design testing: Interview, policy review
  - Operating effectiveness: Sample testing (25+ per control)
  - Inquiry: Staff interviews
  - Observation: Watch processes in action
  - Inspection: Review documentation
  - Re-performance: Auditor performs control themselves

Week 9-10 (Early Mar 2025):
□ Draft Report Review
  - Audit firm provides draft report
  - Management reviews for factual accuracy
  - Discuss any findings/exceptions
  - Negotiate management response (if needed)

Week 11-12 (Mid-Late Mar 2025):
□ Final Report Issuance
  - Auditor issues final SOC 2 Type II report
  - Management Letter (recommendations)
  - Report distributed to customers/prospects

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUARTERLY MILESTONES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q1 2024 (Jan-Mar):
✓ Period begins
✓ Controls operating
✓ Evidence collection starts
⚠ First quarterly reviews complete
📊 Checkpoint: 25% complete

Q2 2024 (Apr-Jun):
✓ Continued operation
✓ Second quarterly reviews
📊 Checkpoint: 50% complete (minimum period achieved)

Q3 2024 (Jul-Sep):
✓ Third quarterly reviews
✓ Begin audit preparation
📊 Checkpoint: 75% complete

Q4 2024 (Oct-Dec):
✓ Fourth quarterly reviews
✓ Final evidence collection
✓ Period ends
📊 Checkpoint: 100% complete

Post-Period (Jan-Mar 2025):
✓ Evidence organization
✓ Audit execution
✓ Report issuance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVIDENCE COLLECTION SCHEDULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Daily (Automated):
✓ CloudTrail logs
✓ VPC Flow Logs
✓ Application logs
✓ Security event logs
✓ Monitoring data

Weekly:
□ Vulnerability scans
□ Change management board minutes
□ Backup verification logs

Monthly:
□ Security awareness training records
□ Incident response drill documentation
□ Risk assessment updates

Quarterly:
□ Access reviews (all users)
□ Management reviews
□ Business continuity testing
□ Vendor risk assessments

Annually:
□ Penetration testing
□ Disaster recovery testing
□ Policy reviews/updates
□ Risk assessment comprehensive review

Ad-Hoc (As Needed):
□ Incident response documentation
□ Change tickets
□ Access request tickets
□ Termination documentation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL SUCCESS FACTORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Controls operate for ENTIRE period (no gaps)
  - If control fails for >24 hours, may be deficiency
  - Document and remediate any outages immediately

✓ Evidence collected from EVERY quarter
  - Quarterly reviews must occur in all 4 quarters
  - Samples must span entire period

✓ Policies in effect BEFORE period start
  - Policy dates must precede period start
  - Any changes require version control

✓ No shared accounts
  - All actions attributable to individuals
  - Service accounts documented/approved

✓ Timely terminations
  - Access removed within 24 hours of termination
  - All terminations must have documentation

✓ Complete evidence package
  - Nothing missing from PBC list
  - Well-organized, easy for auditor to navigate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMON PITFALLS TO AVOID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Skipping a quarterly review
   Impact: Gap in testing, potential deficiency
   Prevention: Calendar reminders, automated triggers

❌ Policy dated after period start
   Impact: Control not in effect, design deficiency
   Prevention: Finalize all policies 1+ months before

❌ Missing evidence from early months
   Impact: Cannot prove control operated entire period
   Prevention: Start collecting evidence from Day 1

❌ Control automation fails mid-period
   Impact: Gap in control operation
   Prevention: Monitoring alerts, daily checks

❌ Insufficient samples
   Impact: Auditor cannot conclude on effectiveness
   Prevention: Maintain ticketing system, save all

❌ Undocumented changes
   Impact: Cannot demonstrate change control
   Prevention: Require tickets for all changes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COST ESTIMATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Internal Effort (Staff Time):
- Readiness preparation: 160-240 hours
- Evidence collection (ongoing): 10-20 hours/month
- Audit support: 80-120 hours
- Total: 400-600 hours (~\$40k-\$90k at \$150/hour)

External Costs:
- Type II audit (Security only): \$15k-\$35k
- Additional TSCs: +\$5k-\$10k each
- Readiness audit (optional): \$10k-\$15k
- Gap remediation: Variable (\$0-\$50k+)

Total Estimated Cost: \$55k-\$180k
Timeline: 15-18 months (prep + period + audit)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Immediate (This Week):
1. Run readiness assessment: /soc2:assess security type2
2. Identify period start date (3-6 months from now)
3. Assign SOC 2 program owner
4. Budget for audit costs

This Month:
1. Document all current policies/procedures
2. Start RFP process for audit firm
3. Implement missing controls
4. Set up automated evidence collection

Next 3 Months:
1. Complete gap remediation
2. Finalize audit firm selection
3. Train staff on procedures
4. Perform readiness dry-run
5. Begin period when ready

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIMELINE EXPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate project plan:
```bash
/soc2:type-ii-planner 2024-01-01 2024-12-31 --output=gantt > soc2-timeline.md
```

Import to project management tools:

- Jira: Export as CSV, import as Epic with subtasks
- Asana: Copy milestones, create project
- Microsoft Project: Export as XML

```

## Related Commands

- `/soc2:assess` - Readiness assessment
- `/soc2:evidence-checklist` - Evidence requirements per control
- `/soc2:service-auditor-prep` - Generate evidence package
- `/engineer:monitor-continuous` - Continuous evidence collection
