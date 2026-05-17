---
name: cmmc-assessment-objectives
description: "Verbatim reference for all 320 NIST 800-171A Rev 2 assessment objectives, plus the Rev 2 → Rev 3 control crosswalk. Use for AO-level lookups (e.g., 3.1.1[c]), evidence planning, and forward-mapping to Rev 3. Pairs with cmmc-expert."
allowed-tools: Read, Glob, Grep, Write
---

# CMMC Assessment Objectives — 800-171A Rev 2 (with Rev 3 Crosswalk)

The scoreable layer underneath every CMMC Level 2 assessment. Where `cmmc-expert` describes the CMMC program, this skill captures the **320 specific objectives** an assessor is actually scoring against, plus the structural Rev 2 → Rev 3 mapping.

## How to use this skill (paired with cmmc-expert)

| Question | Skill |
|---|---|
| What does CMMC require, who needs L1 vs L2, how does SPRS scoring work, what's POA&M-eligible? | `cmmc-expert` |
| What does an assessor look for at the objective level for 3.1.1? What does 3.13.11[a] actually say? | **this skill** |
| Where does Rev 2 3.5.7 land in Rev 3? Which Rev 2 controls were withdrawn? | **this skill** |
| What FedRAMP level does a CSP need for CUI? | `cmmc-expert` |
| What does FIPS-validated cryptography mean in Rev 3 vs. Rev 2? | **this skill** (note in 3.13.11 crosswalk row) |

**Lookup patterns:**

- **By control:** Jump to the family heading (`## 3.X`) → find the practice number.
- **By objective:** Each practice lists `[a], [b], [c]...` — these are the scoreable units.
- **By Rev 3 equivalent:** Jump to "Rev 2 → Rev 3 Crosswalk" → find the family → row by Rev 2 ID.
- **For withdrawn controls:** See the "Quick Reference: Withdrawn Rev 2 Controls" table.

## Source & Verification Status

**Layer 1 — Assessment objectives (Rev 2):**

- Source: **NIST SP 800-171A** (June 2018; published assessment guide for 800-171 Rev 2).
- Status: Withdrawn May 14, 2024; **still operative for CMMC Level 2** under current DoD rulemaking.
- DOI for parent 800-171 Rev 2: https://doi.org/10.6028/NIST.SP.800-171r2
- Text below is verbatim from the PDF.

**Layer 2 — Rev 2 → Rev 3 crosswalk:**

- Source: **NIST SP 800-171 Rev 3** (Final, May 2024).
- AC, AT, AU families: PDF-verified.
- CM through SI families: high-confidence training-knowledge mapping; verify against the Rev 3 PDF before relying on it for a Rev 3 assessment deliverable.

**Critical constants for Rev 2:**

- 14 control families · 110 controls · **320 assessment objectives**.
- Numbering scheme: `Chapter.Family.Requirement[Objective]` — e.g., `3.1.1[a]` = AC, requirement 1, objective a.

---

## Quick Reference: Counts by Family

| Family | Rev 2 Controls | Rev 2 Assessment Objectives |
|---|---|---|
| 3.1 Access Control (AC) | 22 | **70** |
| 3.2 Awareness & Training (AT) | 3 | 9 |
| 3.3 Audit & Accountability (AU) | 9 | 29 |
| 3.4 Configuration Management (CM) | 9 | **44** |
| 3.5 Identification & Authentication (IA) | 11 | 25 |
| 3.6 Incident Response (IR) | 3 | 14 |
| 3.7 Maintenance (MA) | 6 | 10 |
| 3.8 Media Protection (MP) | 9 | 15 |
| 3.9 Personnel Security (PS) | 2 | 4 |
| 3.10 Physical Protection (PE) | 6 | 16 |
| 3.11 Risk Assessment (RA) | 3 | 9 |
| 3.12 Security Assessment (CA) | 4 | 14 |
| 3.13 System & Comms Protection (SC) | 16 | **41** |
| 3.14 System & Info Integrity (SI) | 7 | 20 |
| **TOTAL** | **110** | **320** |

---

## Assessment Methods Reference (per NIST SP 800-171A)

Three methods — **not four.** "Determine" is the verb each objective opens with, not a separate method.

| Method | What it means | Depth attributes |
|---|---|---|
| **EXAMINE** | Reviewing, inspecting, observing, studying, or analyzing assessment objects (specifications, mechanisms, activities). | Basic / Focused / Comprehensive |
| **INTERVIEW** | Discussions with individuals or groups to facilitate understanding, achieve clarification, or obtain evidence. | Basic / Focused / Comprehensive |
| **TEST** | Exercising assessment objects under specified conditions to compare actual with expected behavior. | Basic (black box) / Focused (gray box) / Comprehensive (white box) |

### Assessment Objects

- **Specifications** — policies, procedures, plans, SSP, designs, requirements.
- **Mechanisms** — hardware, software, firmware controls.
- **Activities** — system operations, exercises, backup operations.
- **Individuals** — system owners, admins, security personnel, users.

### How to read an assessment objective

Each lettered sub-item (`[a]`, `[b]`, ...) is **one scoreable assessment objective**. For each, the assessor will (per NIST 800-171A):

1. **Determine** if the objective is satisfied.
2. Support that determination with **E/I/T** evidence — typically all three for any non-trivial control.
3. Mark it **Satisfied** or **Other Than Satisfied** for SPRS / CMMC purposes.

**Practice-level rollup:** all AOs within a practice must be Satisfied for the practice to be **MET** in a C3PAO assessment.

---

# 320 Assessment Objectives (NIST SP 800-171A Rev 2)

> Text below is verbatim from NIST SP 800-171A. Each lettered sub-item is one scoreable assessment objective.

## 3.1 ACCESS CONTROL (22 controls, 70 objectives)

**3.1.1** — Limit system access to authorized users, processes acting on behalf of authorized users, and devices.
- [a] authorized users are identified
- [b] processes acting on behalf of authorized users are identified
- [c] devices (and other systems) authorized to connect to the system are identified
- [d] system access is limited to authorized users
- [e] system access is limited to processes acting on behalf of authorized users
- [f] system access is limited to authorized devices (including other systems)

**3.1.2** — Limit system access to the types of transactions and functions that authorized users are permitted to execute.
- [a] the types of transactions and functions that authorized users are permitted to execute are defined
- [b] system access is limited to the defined types of transactions and functions for authorized users

**3.1.3** — Control the flow of CUI in accordance with approved authorizations.
- [a] information flow control policies are defined
- [b] methods and enforcement mechanisms for controlling the flow of CUI are defined
- [c] designated sources and destinations for CUI within the system and between interconnected systems are identified
- [d] authorizations for controlling the flow of CUI are defined
- [e] approved authorizations for controlling the flow of CUI are enforced

**3.1.4** — Separate the duties of individuals to reduce the risk of malevolent activity without collusion.
- [a] the duties of individuals requiring separation are defined
- [b] responsibilities for duties that require separation are assigned to separate individuals
- [c] access privileges that enable individuals to exercise the duties that require separation are granted to separate individuals

**3.1.5** — Employ the principle of least privilege, including for specific security functions and privileged accounts.
- [a] privileged accounts are identified
- [b] access to privileged accounts is authorized in accordance with the principle of least privilege
- [c] security functions are identified
- [d] access to security functions is authorized in accordance with the principle of least privilege

**3.1.6** — Use non-privileged accounts or roles when accessing nonsecurity functions.
- [a] nonsecurity functions are identified
- [b] users are required to use non-privileged accounts or roles when accessing nonsecurity functions

**3.1.7** — Prevent non-privileged users from executing privileged functions and capture the execution of such functions in audit logs.
- [a] privileged functions are defined
- [b] non-privileged users are defined
- [c] non-privileged users are prevented from executing privileged functions
- [d] the execution of privileged functions is captured in audit logs

**3.1.8** — Limit unsuccessful logon attempts.
- [a] the means of limiting unsuccessful logon attempts is defined
- [b] the defined means of limiting unsuccessful logon attempts is implemented

**3.1.9** — Provide privacy and security notices consistent with applicable CUI rules.
- [a] privacy and security notices required by CUI-specified rules are identified, consistent, and associated with the specific CUI category
- [b] privacy and security notices are displayed

**3.1.10** — Use session lock with pattern-hiding displays to prevent access and viewing of data after a period of inactivity.
- [a] the period of inactivity after which the system initiates a session lock is defined
- [b] access to the system and viewing of data is prevented by initiating a session lock after the defined period of inactivity
- [c] previously visible information is concealed via a pattern-hiding display after the defined period of inactivity

**3.1.11** — Terminate (automatically) a user session after a defined condition.
- [a] conditions requiring a user session to terminate are defined
- [b] a user session is automatically terminated after any of the defined conditions occur

**3.1.12** — Monitor and control remote access sessions.
- [a] remote access sessions are permitted
- [b] the types of permitted remote access are identified
- [c] remote access sessions are controlled
- [d] remote access sessions are monitored

**3.1.13** — Employ cryptographic mechanisms to protect the confidentiality of remote access sessions.
- [a] cryptographic mechanisms to protect the confidentiality of remote access sessions are identified
- [b] cryptographic mechanisms to protect the confidentiality of remote access sessions are implemented

**3.1.14** — Route remote access via managed access control points.
- [a] managed access control points are identified and implemented
- [b] remote access is routed through managed network access control points

**3.1.15** — Authorize remote execution of privileged commands and remote access to security-relevant information.
- [a] privileged commands authorized for remote execution are identified
- [b] security-relevant information authorized to be accessed remotely is identified
- [c] the execution of the identified privileged commands via remote access is authorized
- [d] access to the identified security-relevant information via remote access is authorized

**3.1.16** — Authorize wireless access prior to allowing such connections.
- [a] wireless access points are identified
- [b] wireless access is authorized prior to allowing such connections

**3.1.17** — Protect wireless access using authentication and encryption.
- [a] wireless access to the system is protected using authentication
- [b] wireless access to the system is protected using encryption

**3.1.18** — Control connection of mobile devices.
- [a] mobile devices that process, store, or transmit CUI are identified
- [b] mobile device connections are authorized
- [c] mobile device connections are monitored and logged

**3.1.19** — Encrypt CUI on mobile devices and mobile computing platforms.
- [a] mobile devices and mobile computing platforms that process, store, or transmit CUI are identified
- [b] encryption is employed to protect CUI on identified mobile devices and mobile computing platforms

**3.1.20** — Verify and control/limit connections to and use of external systems.
- [a] connections to external systems are identified
- [b] the use of external systems is identified
- [c] connections to external systems are verified
- [d] the use of external systems is verified
- [e] connections to external systems are controlled/limited
- [f] the use of external systems is controlled/limited

**3.1.21** — Limit use of portable storage devices on external systems.
- [a] the use of portable storage devices containing CUI on external systems is identified and documented
- [b] limits on the use of portable storage devices containing CUI on external systems are defined
- [c] the use of portable storage devices containing CUI on external systems is limited as defined

**3.1.22** — Control CUI posted or processed on publicly accessible systems.
- [a] individuals authorized to post or process information on publicly accessible systems are identified
- [b] procedures to ensure CUI is not posted or processed on publicly accessible systems are identified
- [c] a review process is in place prior to posting of any content to publicly accessible systems
- [d] content on publicly accessible systems is reviewed to ensure that it does not include CUI
- [e] mechanisms are in place to remove and address improper posting of CUI

---

## 3.2 AWARENESS AND TRAINING (3 controls, 9 objectives)

**3.2.1** — Ensure that managers, systems administrators, and users of organizational systems are made aware of the security risks associated with their activities.
- [a] security risks associated with organizational activities involving CUI are identified
- [b] policies, standards, and procedures related to the security of the system are identified
- [c] managers, systems administrators, and users of the system are made aware of the security risks associated with their activities
- [d] managers, systems administrators, and users of the system are made aware of the applicable policies, standards, and procedures related to the security of the system

**3.2.2** — Ensure that personnel are trained to carry out their assigned information security-related duties and responsibilities.
- [a] information security-related duties, roles, and responsibilities are defined
- [b] information security-related duties, roles, and responsibilities are assigned to designated personnel
- [c] personnel are adequately trained to carry out their assigned information security-related duties, roles, and responsibilities

**3.2.3** — Provide security awareness training on recognizing and reporting potential indicators of insider threat.
- [a] potential indicators associated with insider threats are identified
- [b] security awareness training on recognizing and reporting potential indicators of insider threat is provided to managers and employees

---

## 3.3 AUDIT AND ACCOUNTABILITY (9 controls, 29 objectives)

**3.3.1** — Create and retain system audit logs and records to the extent needed to enable the monitoring, analysis, investigation, and reporting of unlawful or unauthorized system activity.
- [a] audit logs needed to enable the monitoring, analysis, investigation, and reporting of unlawful or unauthorized system activity are specified
- [b] the content of audit records needed to support monitoring, analysis, investigation, and reporting of unlawful or unauthorized system activity is defined
- [c] audit records are created (generated)
- [d] audit records, once created, contain the defined content
- [e] retention requirements for audit records are defined
- [f] audit records are retained as defined

**3.3.2** — Ensure that the actions of individual system users can be uniquely traced to those users so they can be held accountable for their actions.
- [a] the content of the audit records needed to support the ability to uniquely trace users to their actions is defined
- [b] audit records, once created, contain the defined content

**3.3.3** — Review and update logged events.
- [a] a process for determining when to review logged events is defined
- [b] event types being logged are reviewed in accordance with the defined review process
- [c] event types being logged are updated based on the review

**3.3.4** — Alert in the event of an audit logging process failure.
- [a] personnel or roles to be alerted in the event of an audit logging process failure are identified
- [b] types of audit logging process failures for which alert will be generated are defined
- [c] identified personnel or roles are alerted in the event of an audit logging process failure

**3.3.5** — Correlate audit record review, analysis, and reporting processes for investigation and response to indications of unlawful, unauthorized, suspicious, or unusual activity.
- [a] audit record review, analysis, and reporting processes for investigation and response to indications of unlawful, unauthorized, suspicious, or unusual activity are defined
- [b] defined audit record review, analysis, and reporting processes are correlated

**3.3.6** — Provide audit record reduction and report generation to support on-demand analysis and reporting.
- [a] an audit record reduction capability that supports on-demand analysis is provided
- [b] a report generation capability that supports on-demand reporting is provided

**3.3.7** — Provide a system capability that compares and synchronizes internal system clocks with an authoritative source to generate time stamps for audit records.
- [a] internal system clocks are used to generate time stamps for audit records
- [b] an authoritative source with which to compare and synchronize internal system clocks is specified
- [c] internal system clocks used to generate time stamps for audit records are compared to and synchronized with the specified authoritative time source

**3.3.8** — Protect audit information and audit logging tools from unauthorized access, modification, and deletion.
- [a] audit information is protected from unauthorized access
- [b] audit information is protected from unauthorized modification
- [c] audit information is protected from unauthorized deletion
- [d] audit logging tools are protected from unauthorized access
- [e] audit logging tools are protected from unauthorized modification
- [f] audit logging tools are protected from unauthorized deletion

**3.3.9** — Limit management of audit logging functionality to a subset of privileged users.
- [a] a subset of privileged users granted access to manage audit logging functionality is defined
- [b] management of audit logging functionality is limited to the defined subset of privileged users

---

## 3.4 CONFIGURATION MANAGEMENT (9 controls, 44 objectives)

**3.4.1** — Establish and maintain baseline configurations and inventories of organizational systems throughout the respective system development life cycles.
- [a] a baseline configuration is established
- [b] the baseline configuration includes hardware, software, firmware, and documentation
- [c] the baseline configuration is maintained (reviewed and updated) throughout the system development life cycle
- [d] a system inventory is established
- [e] the system inventory includes hardware, software, firmware, and documentation
- [f] the inventory is maintained (reviewed and updated) throughout the system development life cycle

**3.4.2** — Establish and enforce security configuration settings for information technology products employed in organizational systems.
- [a] security configuration settings for information technology products employed in the system are established and included in the baseline configuration
- [b] security configuration settings for information technology products employed in the system are enforced

**3.4.3** — Track, review, approve or disapprove, and log changes to organizational systems.
- [a] changes to the system are tracked
- [b] changes to the system are reviewed
- [c] changes to the system are approved or disapproved
- [d] changes to the system are logged

**3.4.4** — Analyze the security impact of changes prior to implementation.
- [a] the security impact of changes to the system is analyzed prior to implementation

**3.4.5** — Define, document, approve, and enforce physical and logical access restrictions associated with changes to organizational systems.
- [a] physical access restrictions associated with changes to the system are defined
- [b] physical access restrictions associated with changes to the system are documented
- [c] physical access restrictions associated with changes to the system are approved
- [d] physical access restrictions associated with changes to the system are enforced
- [e] logical access restrictions associated with changes to the system are defined
- [f] logical access restrictions associated with changes to the system are documented
- [g] logical access restrictions associated with changes to the system are approved
- [h] logical access restrictions associated with changes to the system are enforced

**3.4.6** — Employ the principle of least functionality by configuring organizational systems to provide only essential capabilities.
- [a] essential system capabilities are defined based on the principle of least functionality
- [b] the system is configured to provide only the defined essential capabilities

**3.4.7** — Restrict, disable, or prevent the use of nonessential programs, functions, ports, protocols, and services.
- [a] essential programs are defined
- [b] the use of nonessential programs is defined
- [c] the use of nonessential programs is restricted, disabled, or prevented as defined
- [d] essential functions are defined
- [e] the use of nonessential functions is defined
- [f] the use of nonessential functions is restricted, disabled, or prevented as defined
- [g] essential ports are defined
- [h] the use of nonessential ports is defined
- [i] the use of nonessential ports is restricted, disabled, or prevented as defined
- [j] essential protocols are defined
- [k] the use of nonessential protocols is defined
- [l] the use of nonessential protocols is restricted, disabled, or prevented as defined
- [m] essential services are defined
- [n] the use of nonessential services is defined
- [o] the use of nonessential services is restricted, disabled, or prevented as defined

**3.4.8** — Apply deny-by-exception (blacklisting) policy to prevent the use of unauthorized software or deny-all, permit-by-exception (whitelisting) policy to allow the execution of authorized software.
- [a] a policy specifying whether whitelisting or blacklisting is to be implemented is specified
- [b] the software allowed to execute under whitelisting or denied use under blacklisting is specified
- [c] whitelisting to allow the execution of authorized software or blacklisting to prevent the use of unauthorized software is implemented as specified

**3.4.9** — Control and monitor user-installed software.
- [a] a policy for controlling the installation of software by users is established
- [b] installation of software by users is controlled based on the established policy
- [c] installation of software by users is monitored

---

## 3.5 IDENTIFICATION AND AUTHENTICATION (11 controls, 25 objectives)

**3.5.1** — Identify system users, processes acting on behalf of users, and devices.
- [a] system users are identified
- [b] processes acting on behalf of users are identified
- [c] devices accessing the system are identified

**3.5.2** — Authenticate (or verify) the identities of users, processes, or devices, as a prerequisite to allowing access to organizational systems.
- [a] the identity of each user is authenticated or verified as a prerequisite to system access
- [b] the identity of each process acting on behalf of a user is authenticated or verified as a prerequisite to system access
- [c] the identity of each device accessing or connecting to the system is authenticated or verified as a prerequisite to system access

**3.5.3** — Use multifactor authentication for local and network access to privileged accounts and for network access to non-privileged accounts.
- [a] privileged accounts are identified
- [b] multifactor authentication is implemented for local access to privileged accounts
- [c] multifactor authentication is implemented for network access to privileged accounts
- [d] multifactor authentication is implemented for network access to non-privileged accounts

**3.5.4** — Employ replay-resistant authentication mechanisms for network access to privileged and non-privileged accounts.
- [a] replay-resistant authentication mechanisms are implemented for network account access to privileged and non-privileged accounts

**3.5.5** — Prevent reuse of identifiers for a defined period.
- [a] a period within which identifiers cannot be reused is defined
- [b] reuse of identifiers is prevented within the defined period

**3.5.6** — Disable identifiers after a defined period of inactivity.
- [a] a period of inactivity after which an identifier is disabled is defined
- [b] identifiers are disabled after the defined period of inactivity

**3.5.7** — Enforce a minimum password complexity and change of characters when new passwords are created.
- [a] password complexity requirements are defined
- [b] password change of character requirements are defined
- [c] minimum password complexity requirements as defined are enforced when new passwords are created
- [d] minimum password change of character requirements as defined are enforced when new passwords are created

**3.5.8** — Prohibit password reuse for a specified number of generations.
- [a] the number of generations during which a password cannot be reused is specified
- [b] reuse of passwords is prohibited during the specified number of generations

**3.5.9** — Allow temporary password use for system logons with an immediate change to a permanent password.
- [a] an immediate change to a permanent password is required when a temporary password is used for system logon

**3.5.10** — Store and transmit only cryptographically-protected passwords.
- [a] passwords are cryptographically protected in storage
- [b] passwords are cryptographically protected in transit

**3.5.11** — Obscure feedback of authentication information.
- [a] authentication information is obscured during the authentication process

---

## 3.6 INCIDENT RESPONSE (3 controls, 14 objectives)

**3.6.1** — Establish an operational incident-handling capability for organizational systems that includes preparation, detection, analysis, containment, recovery, and user response activities.
- [a] an operational incident-handling capability is established
- [b] the operational incident-handling capability includes preparation
- [c] the operational incident-handling capability includes detection
- [d] the operational incident-handling capability includes analysis
- [e] the operational incident-handling capability includes containment
- [f] the operational incident-handling capability includes recovery
- [g] the operational incident-handling capability includes user response activities

**3.6.2** — Track, document, and report incidents to designated officials and/or authorities both internal and external to the organization.
- [a] incidents are tracked
- [b] incidents are documented
- [c] authorities to whom incidents are to be reported are identified
- [d] organizational officials to whom incidents are to be reported are identified
- [e] identified authorities are notified of incidents
- [f] identified organizational officials are notified of incidents

**3.6.3** — Test the organizational incident response capability.
- [a] the incident response capability is tested

---

## 3.7 MAINTENANCE (6 controls, 10 objectives)

**3.7.1** — Perform maintenance on organizational systems.
- [a] system maintenance is performed

**3.7.2** — Provide controls on the tools, techniques, mechanisms, and personnel used to conduct system maintenance.
- [a] tools used to conduct system maintenance are controlled
- [b] techniques used to conduct system maintenance are controlled
- [c] mechanisms used to conduct system maintenance are controlled
- [d] personnel used to conduct system maintenance are controlled

**3.7.3** — Ensure equipment removed for off-site maintenance is sanitized of any CUI.
- [a] equipment to be removed from organizational spaces for off-site maintenance is sanitized of any CUI

**3.7.4** — Check media containing diagnostic and test programs for malicious code before the media are used in organizational systems.
- [a] media containing diagnostic and test programs are checked for malicious code before being used in organizational systems that process, store, or transmit CUI

**3.7.5** — Require multifactor authentication to establish nonlocal maintenance sessions via external network connections and terminate such connections when nonlocal maintenance is complete.
- [a] multifactor authentication is used to establish nonlocal maintenance sessions via external network connections
- [b] nonlocal maintenance sessions established via external network connections are terminated when nonlocal maintenance is complete

**3.7.6** — Supervise the maintenance activities of maintenance personnel without required access authorization.
- [a] maintenance personnel without required access authorization are supervised during maintenance activities

---

## 3.8 MEDIA PROTECTION (9 controls, 15 objectives)

**3.8.1** — Protect (i.e., physically control and securely store) system media containing CUI, both paper and digital.
- [a] paper media containing CUI is physically controlled
- [b] digital media containing CUI is physically controlled
- [c] paper media containing CUI is securely stored
- [d] digital media containing CUI is securely stored

**3.8.2** — Limit access to CUI on system media to authorized users.
- [a] access to CUI on system media is limited to authorized users

**3.8.3** — Sanitize or destroy system media containing CUI before disposal or release for reuse.
- [a] system media containing CUI is sanitized or destroyed before disposal
- [b] system media containing CUI is sanitized before it is released for reuse

**3.8.4** — Mark media with necessary CUI markings and distribution limitations.
- [a] media containing CUI is marked with applicable CUI markings
- [b] media containing CUI is marked with distribution limitations

**3.8.5** — Control access to media containing CUI and maintain accountability for media during transport outside of controlled areas.
- [a] access to media containing CUI is controlled
- [b] accountability for media containing CUI is maintained during transport outside of controlled areas

**3.8.6** — Implement cryptographic mechanisms to protect the confidentiality of CUI stored on digital media during transport unless otherwise protected by alternative physical safeguards.
- [a] the confidentiality of CUI stored on digital media is protected during transport using cryptographic mechanisms or alternative physical safeguards

**3.8.7** — Control the use of removable media on system components.
- [a] the use of removable media on system components is controlled

**3.8.8** — Prohibit the use of portable storage devices when such devices have no identifiable owner.
- [a] the use of portable storage devices is prohibited when such devices have no identifiable owner

**3.8.9** — Protect the confidentiality of backup CUI at storage locations.
- [a] the confidentiality of backup CUI is protected at storage locations

---

## 3.9 PERSONNEL SECURITY (2 controls, 4 objectives)

**3.9.1** — Screen individuals prior to authorizing access to organizational systems containing CUI.
- [a] individuals are screened prior to authorizing access to organizational systems containing CUI

**3.9.2** — Ensure that organizational systems containing CUI are protected during and after personnel actions such as terminations and transfers.
- [a] a policy and/or process for terminating system access and any credentials coincident with personnel actions is established
- [b] system access and credentials are terminated consistent with personnel actions such as termination or transfer
- [c] the system is protected during and after personnel transfer actions

---

## 3.10 PHYSICAL PROTECTION (6 controls, 16 objectives)

**3.10.1** — Limit physical access to organizational systems, equipment, and the respective operating environments to authorized individuals.
- [a] authorized individuals allowed physical access are identified
- [b] physical access to organizational systems is limited to authorized individuals
- [c] physical access to equipment is limited to authorized individuals
- [d] physical access to operating environments is limited to authorized individuals

**3.10.2** — Protect and monitor the physical facility and support infrastructure for organizational systems.
- [a] the physical facility where organizational systems reside is protected
- [b] the support infrastructure for organizational systems is protected
- [c] the physical facility where organizational systems reside is monitored
- [d] the support infrastructure for organizational systems is monitored

**3.10.3** — Escort visitors and monitor visitor activity.
- [a] visitors are escorted
- [b] visitor activity is monitored

**3.10.4** — Maintain audit logs of physical access.
- [a] audit logs of physical access are maintained

**3.10.5** — Control and manage physical access devices.
- [a] physical access devices are identified
- [b] physical access devices are controlled
- [c] physical access devices are managed

**3.10.6** — Enforce safeguarding measures for CUI at alternate work sites.
- [a] safeguarding measures for CUI are defined for alternate work sites
- [b] safeguarding measures for CUI are enforced for alternate work sites

---

## 3.11 RISK ASSESSMENT (3 controls, 9 objectives)

**3.11.1** — Periodically assess the risk to organizational operations, organizational assets, and individuals, resulting from the operation of organizational systems and the associated processing, storage, or transmission of CUI.
- [a] the frequency to assess risk to organizational operations, organizational assets, and individuals is defined
- [b] risk to organizational operations, organizational assets, and individuals resulting from the operation of an organizational system that processes, stores, or transmits CUI is assessed with the defined frequency

**3.11.2** — Scan for vulnerabilities in organizational systems and applications periodically and when new vulnerabilities affecting those systems and applications are identified.
- [a] the frequency to scan for vulnerabilities in organizational systems and applications is defined
- [b] vulnerability scans are performed on organizational systems with the defined frequency
- [c] vulnerability scans are performed on applications with the defined frequency
- [d] vulnerability scans are performed on organizational systems when new vulnerabilities are identified
- [e] vulnerability scans are performed on applications when new vulnerabilities are identified

**3.11.3** — Remediate vulnerabilities in accordance with risk assessments.
- [a] vulnerabilities are identified
- [b] vulnerabilities are remediated in accordance with risk assessments

---

## 3.12 SECURITY ASSESSMENT (4 controls, 14 objectives)

**3.12.1** — Periodically assess the security controls in organizational systems to determine if the controls are effective in their application.
- [a] the frequency of security control assessments is defined
- [b] security controls are assessed with the defined frequency to determine if the controls are effective in their application

**3.12.2** — Develop and implement plans of action designed to correct deficiencies and reduce or eliminate vulnerabilities in organizational systems.
- [a] deficiencies and vulnerabilities to be addressed by the plan of action are identified
- [b] a plan of action is developed to correct identified deficiencies and reduce or eliminate identified vulnerabilities
- [c] the plan of action is implemented to correct identified deficiencies and reduce or eliminate identified vulnerabilities

**3.12.3** — Monitor security controls on an ongoing basis to ensure the continued effectiveness of the controls.
- [a] security controls are monitored on an ongoing basis to ensure the continued effectiveness of those controls

**3.12.4** — Develop, document, and periodically update system security plans that describe system boundaries, system environments of operation, how security requirements are implemented, and the relationships with or connections to other systems.
- [a] a system security plan is developed
- [b] the system boundary is described and documented in the system security plan
- [c] the system environment of operation is described and documented in the system security plan
- [d] the security requirements identified and approved by the designated authority as non-applicable are identified
- [e] the method of security requirement implementation is described and documented in the system security plan
- [f] the relationship with or connection to other systems is described and documented in the system security plan
- [g] the frequency to update the system security plan is defined
- [h] system security plan is updated with the defined frequency

---

## 3.13 SYSTEM AND COMMUNICATIONS PROTECTION (16 controls, 41 objectives)

**3.13.1** — Monitor, control, and protect communications at the external boundaries and key internal boundaries of organizational systems.
- [a] the external system boundary is defined
- [b] key internal system boundaries are defined
- [c] communications are monitored at the external system boundary
- [d] communications are monitored at key internal boundaries
- [e] communications are controlled at the external system boundary
- [f] communications are controlled at key internal boundaries
- [g] communications are protected at the external system boundary
- [h] communications are protected at key internal boundaries

**3.13.2** — Employ architectural designs, software development techniques, and systems engineering principles that promote effective information security within organizational systems.
- [a] architectural designs that promote effective information security are identified
- [b] software development techniques that promote effective information security are identified
- [c] systems engineering principles that promote effective information security are identified
- [d] identified architectural designs that promote effective information security are employed
- [e] identified software development techniques that promote effective information security are employed
- [f] identified systems engineering principles that promote effective information security are employed

**3.13.3** — Separate user functionality from system management functionality.
- [a] user functionality is identified
- [b] system management functionality is identified
- [c] user functionality is separated from system management functionality

**3.13.4** — Prevent unauthorized and unintended information transfer via shared system resources.
- [a] unauthorized and unintended information transfer via shared system resources is prevented

**3.13.5** — Implement subnetworks for publicly accessible system components that are physically or logically separated from internal networks.
- [a] publicly accessible system components are identified
- [b] subnetworks for publicly accessible system components are physically or logically separated from internal networks

**3.13.6** — Deny network communications traffic by default and allow network communications traffic by exception (i.e., deny all, permit by exception).
- [a] network communications traffic is denied by default
- [b] network communications traffic is allowed by exception

**3.13.7** — Prevent remote devices from simultaneously establishing non-remote connections with organizational systems and communicating via some other connection to resources in external networks (i.e., split tunneling).
- [a] remote devices are prevented from simultaneously establishing non-remote connections with the system and communicating via some other connection to resources in external networks (split tunneling)

**3.13.8** — Implement cryptographic mechanisms to prevent unauthorized disclosure of CUI during transmission unless otherwise protected by alternative physical safeguards.
- [a] cryptographic mechanisms intended to prevent unauthorized disclosure of CUI are identified
- [b] alternative physical safeguards intended to prevent unauthorized disclosure of CUI are identified
- [c] either cryptographic mechanisms or alternative physical safeguards are implemented to prevent unauthorized disclosure of CUI during transmission

**3.13.9** — Terminate network connections associated with communications sessions at the end of the sessions or after a defined period of inactivity.
- [a] a period of inactivity to terminate network connections associated with communications sessions is defined
- [b] network connections associated with communications sessions are terminated at the end of the sessions
- [c] network connections associated with communications sessions are terminated after the defined period of inactivity

**3.13.10** — Establish and manage cryptographic keys for cryptography employed in organizational systems.
- [a] cryptographic keys are established whenever cryptography is employed
- [b] cryptographic keys are managed whenever cryptography is employed

**3.13.11** — Employ FIPS-validated cryptography when used to protect the confidentiality of CUI.
- [a] FIPS-validated cryptography is employed to protect the confidentiality of CUI

**3.13.12** — Prohibit remote activation of collaborative computing devices and provide indication of devices in use to users present at the device.
- [a] collaborative computing devices are identified
- [b] collaborative computing devices provide indication to users of devices in use
- [c] remote activation of collaborative computing devices is prohibited

**3.13.13** — Control and monitor the use of mobile code.
- [a] use of mobile code is controlled
- [b] use of mobile code is monitored

**3.13.14** — Control and monitor the use of Voice over Internet Protocol (VoIP) technologies.
- [a] use of Voice over Internet Protocol (VoIP) technologies is controlled
- [b] use of Voice over Internet Protocol (VoIP) technologies is monitored

**3.13.15** — Protect the authenticity of communications sessions.
- [a] the authenticity of communications sessions is protected

**3.13.16** — Protect the confidentiality of CUI at rest.
- [a] the confidentiality of CUI at rest is protected

---

## 3.14 SYSTEM AND INFORMATION INTEGRITY (7 controls, 20 objectives)

**3.14.1** — Identify, report, and correct system flaws in a timely manner.
- [a] the time within which to identify system flaws is specified
- [b] system flaws are identified within the specified time frame
- [c] the time within which to report system flaws is specified
- [d] system flaws are reported within the specified time frame
- [e] the time within which to correct system flaws is specified
- [f] system flaws are corrected within the specified time frame

**3.14.2** — Provide protection from malicious code at designated locations within organizational systems.
- [a] designated locations for malicious code protection are identified
- [b] protection from malicious code at designated locations is provided

**3.14.3** — Monitor system security alerts and advisories and take action in response.
- [a] response actions to system security alerts and advisories are identified
- [b] system security alerts and advisories are monitored
- [c] actions in response to system security alerts and advisories are taken

**3.14.4** — Update malicious code protection mechanisms when new releases are available.
- [a] malicious code protection mechanisms are updated when new releases are available

**3.14.5** — Perform periodic scans of organizational systems and real-time scans of files from external sources as files are downloaded, opened, or executed.
- [a] the frequency for malicious code scans is defined
- [b] malicious code scans are performed with the defined frequency
- [c] real-time malicious code scans of files from external sources as files are downloaded, opened, or executed are performed

**3.14.6** — Monitor organizational systems, including inbound and outbound communications traffic, to detect attacks and indicators of potential attacks.
- [a] the system is monitored to detect attacks and indicators of potential attacks
- [b] inbound communications traffic is monitored to detect attacks and indicators of potential attacks
- [c] outbound communications traffic is monitored to detect attacks and indicators of potential attacks

**3.14.7** — Identify unauthorized use of organizational systems.
- [a] authorized use of the system is defined
- [b] unauthorized use of the system is identified

---

# Rev 2 → Rev 3 Control Crosswalk

> **CMMC 2.0 is Rev 2 only.** Rev 3 (Final, May 2024) is the forward horizon. DoD has not adopted Rev 3 for CMMC. Use this section for transition planning and to understand Rev 3 finding language — not as a substitute for Rev 2 assessment evidence.
>
> Verification status: ✅ PDF-verified | 🔵 Training-knowledge (high confidence; verify against the Rev 3 PDF for deliverables)

### Summary

| Metric | Rev 2 | Rev 3 |
|---|---|---|
| Control families | 14 | **17** (adds PL, SA, SR) |
| Total requirements | 110 | ~97 (net — many consolidations) |
| Numbering | `3.X.Y` | `03.X.Y` (leading zeros) |
| Basic / Derived distinction | Yes | Eliminated |
| ODPs (Organization-Defined Parameters) | None | **Introduced** |
| Family rename | Security Assessment (CA) | "Security Assessment and Monitoring" |

---

### 3.1 → 03.01 ACCESS CONTROL ✅

| Rev 2 | Rev 2 title | Rev 3 | Status | Notes |
|---|---|---|---|---|
| 3.1.1 | Limit system access to authorized users/processes/devices | 03.01.01 | Account Management | Massively expanded — 8 parts (a–h) covering full account lifecycle |
| 3.1.2 | Limit access to permitted transactions/functions | 03.01.02 | Access Enforcement | Similar scope, refined |
| 3.1.3 | Control flow of CUI | 03.01.03 | Information Flow Enforcement | Similar scope |
| 3.1.4 | Separate duties | 03.01.04 | Separation of Duties | Slightly narrowed |
| 3.1.5 | Least privilege | 03.01.05 | Least Privilege | Split — privilege rules moved to 03.01.06/07 |
| 3.1.6 | Non-privileged accounts for non-security functions | 03.01.06 | Least Privilege – Privileged Accounts | Carved out from Rev 2 3.1.5 |
| 3.1.7 | Prevent non-privileged execution of privileged functions | 03.01.07 | Least Privilege – Privileged Functions | Carved out |
| 3.1.8 | Limit unsuccessful logon attempts | 03.01.08 | Unsuccessful Logon Attempts | Added ODPs for count and time; selection for response |
| 3.1.9 | Privacy/security notices | 03.01.09 | System Use Notification | Similar |
| 3.1.10 | Session lock | 03.01.10 | Device Lock | Added ODP for inactivity period |
| 3.1.11 | Terminate user session after defined condition | 03.01.11 | Session Termination | Added ODP for triggers |
| 3.1.12 | Monitor and control remote access | 03.01.12 | Remote Access | Consolidated with 3.1.14 and 3.1.15 |
| 3.1.13 | Crypto for remote access confidentiality | **03.01.13** | **WITHDRAWN** | Addressed by **03.13.08** |
| 3.1.14 | Route remote access via managed access points | **03.01.14** | **WITHDRAWN** | Into **03.01.12** |
| 3.1.15 | Authorize remote execution of privileged commands | **03.01.15** | **WITHDRAWN** | Into **03.01.12** |
| 3.1.16 | Authorize wireless access | 03.01.16 | Wireless Access | Consolidated with 3.1.17 |
| 3.1.17 | Protect wireless via authn/encryption | **03.01.17** | **WITHDRAWN** | Into **03.01.16** |
| 3.1.18 | Control connection of mobile devices | 03.01.18 | Access Control for Mobile Devices | Consolidated with 3.1.19 |
| 3.1.19 | Encrypt CUI on mobile devices | **03.01.19** | **WITHDRAWN** | Into **03.01.18** |
| 3.1.20 | Verify/control external system connections | 03.01.20 | Use of External Systems | Consolidated with 3.1.21; ODP added |
| 3.1.21 | Limit portable storage on external systems | **03.01.21** | **WITHDRAWN** | Into **03.01.20** |
| 3.1.22 | Control CUI on publicly accessible systems | 03.01.22 | Publicly Accessible Content | Streamlined |

**AC summary:** 22 Rev 2 → 13 active Rev 3 (+ 9 withdrawn slots).

---

### 3.2 → 03.02 AWARENESS AND TRAINING ✅

| Rev 2 | Rev 2 title | Rev 3 | Status | Notes |
|---|---|---|---|---|
| 3.2.1 | Make users aware of security risks | 03.02.01 | Literacy Training and Awareness | Incorporates 3.2.3; ODPs for frequency/triggers; adds social-engineering topics |
| 3.2.2 | Train personnel for assigned security duties | 03.02.02 | Role-Based Training | Similar; ODPs for frequency/triggers |
| 3.2.3 | Insider threat awareness training | **03.02.03** | **WITHDRAWN** | Into **03.02.01** |

**AT summary:** 3 Rev 2 → 2 active Rev 3 (+ 1 withdrawn).

---

### 3.3 → 03.03 AUDIT AND ACCOUNTABILITY ✅

| Rev 2 | Rev 2 title | Rev 3 | Status | Notes |
|---|---|---|---|---|
| 3.3.1 | Create and retain audit logs | 03.03.01 + 03.03.03 | Split | Event types/review → 03.03.01; record generation/retention → 03.03.03 |
| 3.3.2 | Trace actions to individual users | 03.03.02 | Audit Record Content | Expanded — 6 required content elements |
| 3.3.3 | Review and update logged events | 03.03.01 | Merged | Into 03.03.01 |
| 3.3.4 | Alert on audit logging process failure | 03.03.04 | Response to Audit Logging Process Failures | ODPs for time period and additional response actions |
| 3.3.5 | Correlate audit record review/analysis | 03.03.05 | Audit Record Review, Analysis, and Reporting | ODP for review frequency |
| 3.3.6 | Record reduction and report generation | 03.03.06 | Audit Record Reduction and Report Generation | Adds requirement to preserve original content and time ordering |
| 3.3.7 | Synchronize internal clocks with authoritative source | 03.03.07 | Time Stamps | **Scope changed** — focus on UTC-based format and granularity; explicit NTP-sync requirement softened |
| 3.3.8 | Protect audit information and tools | 03.03.08 | Protection of Audit Information | Consolidated with 3.3.9 |
| 3.3.9 | Limit management of audit logging to privileged users | **03.03.09** | **WITHDRAWN** | Into **03.03.08** |

**AU summary:** 9 Rev 2 → 8 active Rev 3 (+ 1 withdrawn). Practitioner note on **3.3.7**: Rev 3 no longer requires explicit NTP sync with an authoritative source — but for CMMC purposes (Rev 2), NTP sync is still required.

---

### 3.4 → 03.04 CONFIGURATION MANAGEMENT 🔵

| Rev 2 | Rev 2 title | Rev 3 | Status | Notes |
|---|---|---|---|---|
| 3.4.1 | Baseline configurations and inventories | 03.04.01 | Baseline Configuration | Simplified — inventory handled separately |
| 3.4.2 | Establish/enforce security configuration settings | 03.04.02 | Configuration Settings | ODP added for settings |
| 3.4.3 | Track/review/approve/log changes | 03.04.03 | Configuration Change Control | Incorporates 3.4.4 (security impact analysis) |
| 3.4.4 | Analyze security impact of changes | 03.04.03 | Merged | Into 03.04.03 |
| 3.4.5 | Physical/logical access restrictions for changes | 03.04.04 | Access Restrictions for Change | Streamlined |
| 3.4.6 | Least functionality | 03.04.05 | Least Functionality | ODP for essential capabilities |
| 3.4.7 | Restrict nonessential programs/functions/ports/protocols/services | 03.04.06 | Nonessential Programs, Functions, Ports, Protocols, and Services | **15 Rev 2 sub-objectives collapsed into a single ODP-driven control** |
| 3.4.8 | Deny-by-exception or allow-by-exception software policy | 03.04.07 | Authorized Software | Reframed; ODP for allowed/denied software |
| 3.4.9 | Control and monitor user-installed software | 03.04.08 | User-Installed Software | Retained |

**CM summary:** 9 Rev 2 → 8 active Rev 3.

---

### 3.5 → 03.05 IDENTIFICATION AND AUTHENTICATION 🔵

| Rev 2 | Rev 2 title | Rev 3 | Status | Notes |
|---|---|---|---|---|
| 3.5.1 | Identify users/processes/devices | 03.05.01 | Identification | Similar |
| 3.5.2 | Authenticate identities | 03.05.02 | Authenticator Management | Expanded — full authenticator lifecycle |
| 3.5.3 | MFA for privileged/non-privileged accounts | 03.05.03 | Multi-Factor Authentication | Incorporates 3.5.4; ODP for when MFA is required |
| 3.5.4 | Replay-resistant authentication mechanisms | **03.05.04** | **WITHDRAWN** | Into **03.05.03** |
| 3.5.5 | Prevent reuse of identifiers | 03.05.05 | Identifier Management | Incorporates 3.5.6 |
| 3.5.6 | Disable identifiers after inactivity | **03.05.06** | **WITHDRAWN** | Into **03.05.05** |
| 3.5.7 | Password complexity / change of characters | 03.05.07 | Password Management | Consolidates 3.5.7 through 3.5.11 |
| 3.5.8 | Prohibit password reuse | **03.05.08** | **WITHDRAWN** | Into **03.05.07** |
| 3.5.9 | Temporary password with immediate change | **03.05.09** | **WITHDRAWN** | Into **03.05.07** |
| 3.5.10 | Cryptographically-protected passwords | **03.05.10** | **WITHDRAWN** | Into **03.05.07** |
| 3.5.11 | Obscure feedback of authentication info | **03.05.11** | **WITHDRAWN** | Into **03.05.07** |

**IA summary:** 11 Rev 2 → 5 active Rev 3 (+ 6 withdrawn). Biggest family consolidation in Rev 3.

---

### 3.6 → 03.06 INCIDENT RESPONSE 🔵

| Rev 2 | Rev 2 title | Rev 3 | Status | Notes |
|---|---|---|---|---|
| 3.6.1 | Operational incident-handling capability | 03.06.01 | Incident Handling | IR phases retained |
| 3.6.2 | Track, document, report incidents | 03.06.02 | Incident Monitoring, Reporting, Response Planning | Adds formal IR plan requirement |
| 3.6.3 | Test incident response capability | 03.06.03 | Incident Response Testing | ODP for testing frequency |

**IR summary:** 3 → 3, no withdrawals.

---

### 3.7 → 03.07 MAINTENANCE 🔵

| Rev 2 | Rev 2 title | Rev 3 | Status | Notes |
|---|---|---|---|---|
| 3.7.1 | Perform maintenance | 03.07.01 | Controlled Maintenance | Incorporates 3.7.2 |
| 3.7.2 | Controls on maintenance tools/techniques/personnel | **03.07.02** | **WITHDRAWN** | Into **03.07.01** |
| 3.7.3 | Sanitize off-site maintenance equipment | 03.07.02 | Maintenance Tools | Renumbered; sanitization retained |
| 3.7.4 | Check diagnostic/test media for malicious code | 03.07.03 | (Nonlocal Maintenance / Media Check) | ODP added |
| 3.7.5 | MFA for nonlocal maintenance via external connections | 03.07.04 | Nonlocal Maintenance | MFA retained; ODP for authentication mechanisms |
| 3.7.6 | Supervise unauthorized maintenance personnel | 03.07.05 | Maintenance Personnel | Similar |

**MA summary:** 6 → 5 active (+ 1 withdrawn).

---

### 3.8 → 03.08 MEDIA PROTECTION 🔵

| Rev 2 | Rev 2 title | Rev 3 | Status | Notes |
|---|---|---|---|---|
| 3.8.1 | Protect media containing CUI | 03.08.01 | Media Protection | Incorporates 3.8.2 |
| 3.8.2 | Limit access to CUI on media | **03.08.02** | **WITHDRAWN** | Into **03.08.01** |
| 3.8.3 | Sanitize/destroy media before disposal/reuse | 03.08.02 | Media Sanitization | Renumbered; ODP for sanitization methods |
| 3.8.4 | Mark media with CUI markings and distribution limits | 03.08.03 | Media Marking | Similar |
| 3.8.5 | Control access to media and accountability during transport | 03.08.04 | Media Transport | ODP for protection during transport |
| 3.8.6 | Crypto for CUI on digital media during transport | **03.08.05** | **WITHDRAWN** | Addressed by **03.13.08** |
| 3.8.7 | Control use of removable media | 03.08.05 | Media Use | Renumbered; ODP for restrictions |
| 3.8.8 | Prohibit portable storage without identifiable owner | **03.08.06** | **WITHDRAWN** | Into **03.08.05** |
| 3.8.9 | Protect confidentiality of backup CUI | 03.08.06 | Media Downgrading | Reframed |

**MP summary:** 9 → 6 active (+ 3 withdrawn). **Key change:** transport-encryption requirement moves to SC family (03.13.08).

---

### 3.9 → 03.09 PERSONNEL SECURITY 🔵

| Rev 2 | Rev 2 title | Rev 3 | Status | Notes |
|---|---|---|---|---|
| 3.9.1 | Screen individuals before authorizing access | 03.09.01 | Personnel Screening | ODP for screening criteria |
| 3.9.2 | Protect systems during/after personnel actions | 03.09.02 | Personnel Termination and Transfer | Explicit about both termination and transfer |

**PS summary:** 2 → 2, no withdrawals.

---

### 3.10 → 03.10 PHYSICAL PROTECTION 🔵

| Rev 2 | Rev 2 title | Rev 3 | Status | Notes |
|---|---|---|---|---|
| 3.10.1 | Limit physical access to authorized individuals | 03.10.01 | Physical Access Authorizations | Authorization process now explicit |
| 3.10.2 | Protect and monitor physical facility/infrastructure | 03.10.02 | Physical Access Control | Monitoring split into separate concern |
| 3.10.3 | Escort visitors / monitor activity | 03.10.03 | Visitor Control | ODP for visitor log retention |
| 3.10.4 | Maintain audit logs of physical access | 03.10.04 | (Within broader physical access controls — verify) | Reorganized |
| 3.10.5 | Control and manage physical access devices | 03.10.05 | Physical Access Devices | ODP for inventory frequency |
| 3.10.6 | Safeguarding measures for CUI at alternate work sites | 03.10.06 | Alternate Work Sites | Adds compromise detection requirement |

**PE summary:** 6 → 6, no withdrawals (reorganized within family).

---

### 3.11 → 03.11 RISK ASSESSMENT 🔵

| Rev 2 | Rev 2 title | Rev 3 | Status | Notes |
|---|---|---|---|---|
| 3.11.1 | Periodically assess risk | 03.11.01 | Risk Assessment | ODP for frequency; documents results |
| 3.11.2 | Scan for vulnerabilities | 03.11.02 | Vulnerability Monitoring and Scanning | Expanded; ODPs for scan frequency, tools, techniques; remediation tracking added |
| 3.11.3 | Remediate vulnerabilities | 03.11.03 | Vulnerability Remediation | ODP for remediation timeframes by severity |

**RA summary:** 3 → 3, no withdrawals.

---

### 3.12 → 03.12 SECURITY ASSESSMENT AND MONITORING 🔵
*(Renamed from "Security Assessment" in Rev 2.)*

| Rev 2 | Rev 2 title | Rev 3 | Status | Notes |
|---|---|---|---|---|
| 3.12.1 | Assess effectiveness of security controls | 03.12.01 | Security Assessments | ODP for frequency; more explicit scope |
| 3.12.2 | POA&M development and implementation | 03.12.02 | Plan of Action and Milestones | ODP for POA&M update frequency |
| 3.12.3 | Monitor security controls on ongoing basis | 03.12.03 | Continuous Monitoring | Expanded — monitoring strategy/program/frequency now explicit |
| 3.12.4 | SSP development, documentation, periodic update | **Moved** | **→ 03.15.02** (Planning family) | **SSP requirement relocated** to new PL family |

**CA summary:** 4 → 3 active in the CA family; SSP requirement migrated to the new PL family.

---

### 3.13 → 03.13 SYSTEM AND COMMUNICATIONS PROTECTION 🔵

| Rev 2 | Rev 2 title | Rev 3 | Status | Notes |
|---|---|---|---|---|
| 3.13.1 | Monitor/control/protect communications at boundaries | 03.13.01 | Boundary Protection | ODP for external/key internal boundaries |
| 3.13.2 | Architectural designs, software dev techniques, systems eng | 03.13.02 | Security Engineering Principles | Similar |
| 3.13.3 | Separate user and system management functionality | 03.13.03 | Security Function Isolation | Similar |
| 3.13.4 | Prevent unauthorized info transfer via shared resources | 03.13.04 | (Reframed) | May be combined/reframed in Rev 3 |
| 3.13.5 | Subnetworks for publicly accessible components | 03.13.05 | Boundary Protection – Publicly Accessible Systems | Similar |
| 3.13.6 | Deny network communications by default | 03.13.06 | Deny by Default | Similar |
| 3.13.7 | Prevent split tunneling | 03.13.07 | Boundary Protection – Split Tunneling | Similar |
| 3.13.8 | Crypto to prevent unauthorized disclosure during transmission | 03.13.08 | Cryptographic Protection | **Consolidation target** — 3.1.13 and 3.8.6 point here |
| 3.13.9 | Terminate network connections after inactivity | 03.13.09 | Network Disconnect | ODP for inactivity period |
| 3.13.10 | Establish/manage cryptographic keys | 03.13.10 | Cryptographic Key Management | Similar |
| 3.13.11 | Employ FIPS-validated cryptography for CUI | 03.13.11 | Cryptographic Protection – FIPS | **Changed** — Rev 3 uses ODP "organization-defined types of cryptography." **For CMMC purposes, FIPS 140-2/140-3 validation is still the operational expectation.** Do not advise clients that Rev 3 weakens this. |
| 3.13.12 | Prohibit remote activation of collaborative computing devices | 03.13.12 | Collaborative Computing Devices and Applications | ODP for authorized exceptions |
| 3.13.13 | Control and monitor mobile code | 03.13.13 | Mobile Code | ODP for mobile code technologies |
| 3.13.14 | Control and monitor VoIP | 03.13.14 | Voice Over IP Technologies | ODP for VoIP technologies |
| 3.13.15 | Protect authenticity of communications sessions | 03.13.15 | Communications Authenticity | Similar |
| 3.13.16 | Protect confidentiality of CUI at rest | 03.13.16 | CUI at Rest | ODP for types of cryptography |

**SC summary:** 16 → 16, no withdrawals.

---

### 3.14 → 03.14 SYSTEM AND INFORMATION INTEGRITY 🔵

| Rev 2 | Rev 2 title | Rev 3 | Status | Notes |
|---|---|---|---|---|
| 3.14.1 | Identify, report, correct system flaws | 03.14.01 | Flaw Remediation | ODP for remediation timeframes by severity |
| 3.14.2 | Malicious code protection at designated locations | 03.14.02 | Malicious Code Protection | ODP for mechanisms and locations |
| 3.14.3 | Monitor security alerts/advisories and take action | 03.14.03 | Security Alerts, Advisories, and Directives | Requires internal dissemination |
| 3.14.4 | Update malicious code protection on new releases | **03.14.04** | **WITHDRAWN** | Into **03.14.02** |
| 3.14.5 | Periodic and real-time scans | 03.14.04 | Malicious Code Protection – Scans | Renumbered |
| 3.14.6 | Monitor inbound/outbound traffic for attacks | 03.14.05 | System Monitoring | Expanded; ODP for monitoring activities |
| 3.14.7 | Identify unauthorized use of systems | 03.14.06 | System Monitoring – Unauthorized Use | Possibly incorporated into 03.14.05 |

**SI summary:** 7 → 6 active (+ 1 withdrawn).

---

## New Families in Rev 3 (No Rev 2 Equivalent)

### 03.15 PLANNING (PL) — NEW 🔵

Picks up planning requirements that were implicit or in other Rev 2 families.

| Rev 3 | Title | Origin |
|---|---|---|
| 03.15.01 | Policy and Procedures | New — formerly NFO (`XX-1` type) controls that were excluded from Rev 2 |
| 03.15.02 | System Security Plan | **From Rev 2 3.12.4** — relocated from CA family |
| 03.15.03 | Rules of Behavior | New — system use rules for users |
| 03.15.04 | (Additional planning requirements) | New additions from 800-53B moderate baseline |

**Practitioner note:** SSP migration from 3.12.4 → 03.15.02 means Rev 3 assessors will look at the SSP as a planning artifact, not a security assessment artifact. SSP content requirements are retained and expanded.

---

### 03.16 SYSTEM AND SERVICES ACQUISITION (SA) — NEW 🔵

Requirements for secure acquisition of systems, components, and services.

| Rev 3 | Title | Notes |
|---|---|---|
| 03.16.01 | Security Engineering Principles for Development | Software/system development security |
| 03.16.02 | Unsupported System Components | EOL/unsupported software management |
| 03.16.03 | External System Services | Contracts/agreements with cloud/MSP providers — related to Rev 2 3.1.20 |
| 03.16.04 | (Additional SA requirements) | Acquisition documentation, security requirements in contracts |

**Practitioner note:** **03.16.03** is particularly relevant for clients using cloud providers — it requires verifying that service providers implement required controls. Formalizes what was implied in Rev 2 3.1.20.

---

### 03.17 SUPPLY CHAIN RISK MANAGEMENT (SR) — NEW 🔵

| Rev 3 | Title | Notes |
|---|---|---|
| 03.17.01 | Supply Chain Risk Management Plan | Develop and maintain SCRM plan |
| 03.17.02 | Acquisition Strategies, Tools, and Methods | Address supply chain risks during acquisition |
| 03.17.03 | Supplier Reviews | Assess suppliers/vendors providing system components |

**Practitioner note:** Entirely new for nonfederal contractors. CMMC 2.0 (Rev 2-based) has no SR family. When/if CMMC adopts Rev 3, SCRM becomes a new assessment domain — notable for clients with complex vendor ecosystems.

---

## Quick Reference: Withdrawn Rev 2 Controls

| Rev 2 Control | Disposition in Rev 3 |
|---|---|
| 3.1.13 | 03.01.13 WITHDRAWN — addressed by 03.13.08 |
| 3.1.14 | 03.01.14 WITHDRAWN — into 03.01.12 |
| 3.1.15 | 03.01.15 WITHDRAWN — into 03.01.12 |
| 3.1.17 | 03.01.17 WITHDRAWN — into 03.01.16 |
| 3.1.19 | 03.01.19 WITHDRAWN — into 03.01.18 |
| 3.1.21 | 03.01.21 WITHDRAWN — into 03.01.20 |
| 3.2.3 | 03.02.03 WITHDRAWN — into 03.02.01 |
| 3.3.3 | Merged into 03.03.01 (no "withdrawn" slot) |
| 3.3.9 | 03.03.09 WITHDRAWN — into 03.03.08 |
| 3.4.4 | Merged into 03.04.03 (no "withdrawn" slot) |
| 3.5.4 | 03.05.04 WITHDRAWN — into 03.05.03 |
| 3.5.6 | 03.05.06 WITHDRAWN — into 03.05.05 |
| 3.5.8 | 03.05.08 WITHDRAWN — into 03.05.07 |
| 3.5.9 | 03.05.09 WITHDRAWN — into 03.05.07 |
| 3.5.10 | 03.05.10 WITHDRAWN — into 03.05.07 |
| 3.5.11 | 03.05.11 WITHDRAWN — into 03.05.07 |
| 3.7.2 | 03.07.02 WITHDRAWN — into 03.07.01 |
| 3.8.2 | 03.08.02 WITHDRAWN — into 03.08.01 |
| 3.8.6 | 03.08.06 WITHDRAWN — addressed by 03.13.08 |
| 3.8.8 | 03.08.08 WITHDRAWN — into 03.08.07 |
| 3.12.4 | Relocated to 03.15.02 (PL family) |
| 3.14.4 | 03.14.04 WITHDRAWN — into 03.14.02 |

---

## ODPs — Organization-Defined Parameters (Rev 3 concept)

Rev 3 introduces ODPs — values that the organization (or contracting federal agency) must define. Once defined, they become **assessable scope**. Common categories:

- **Time periods** — inactivity timeouts, audit-failure response windows, scan frequency.
- **Roles/personnel** — who is authorized for privileged accounts, who responds to logon-attempt thresholds.
- **Technical parameters** — number of invalid logon attempts allowed, configuration settings, types of cryptography.
- **Security requirements** — those imposed on external systems, prohibited services/ports/protocols.

**Pre-adoption planning for clients:**

1. Stand up an ODP register (separate document or SSP appendix).
2. Get management approval for each value.
3. Implement controls using those defined values.
4. Be ready to be assessed against the values you stated — they become binding.

If the contracting agency specifies ODP values via contract or policy, those govern. Otherwise the contractor defines its own.

---

## Rev 2 vs. Rev 3 — Which Applies Right Now

**As of 2026-05-17:**

- **CMMC 2.0 assessments → Rev 2 only.** All 110 Rev 2 controls and 320 assessment objectives apply.
- **DFARS 252.204-7012** requires Rev 2 compliance. No DoD contract language has adopted Rev 3.
- **SPRS scoring** uses the 110-point Rev 2 framework.
- **C3PAO assessments** assess against Rev 2 practices (CMMC Level 2 = 110 practices).

**Forward planning:**

- DoD has not announced a CMMC adoption timeline for Rev 3.
- When adopted, control count drops from 110 to ~97, but the addition of PL/SA/SR families likely increases total requirement counts.
- ODP values become assessable scope.
- Clients implementing MFA via platform tools (Entra ID, Okta) benefit from IA consolidation (one implementation, one control).

### Reverse-Mapping (Rev 3 finding → Rev 2 impact)

When a Rev 3 finding references a specific control, map back to Rev 2 to understand CMMC impact:

| If Rev 3 finds an issue with... | Check Rev 2 controls... |
|---|---|
| 03.01.01 Account Management | 3.1.1, 3.1.2 |
| 03.01.12 Remote Access | 3.1.12, 3.1.14, 3.1.15 |
| 03.01.16 Wireless Access | 3.1.16, 3.1.17 |
| 03.01.18 Mobile Device AC | 3.1.18, 3.1.19 |
| 03.01.20 External Systems | 3.1.20, 3.1.21 |
| 03.02.01 Literacy Training | 3.2.1, 3.2.3 |
| 03.03.01 Event Logging | 3.3.1 (partial), 3.3.3 |
| 03.03.08 Audit Protection | 3.3.8, 3.3.9 |
| 03.05.03 MFA | 3.5.3, 3.5.4 |
| 03.05.07 Password Management | 3.5.7, 3.5.8, 3.5.9, 3.5.10, 3.5.11 |
| 03.13.08 Cryptographic Protection | 3.1.13, 3.8.6, 3.13.8 |
| 03.15.02 System Security Plan | 3.12.4 |

### Key Risk: Clients Who Know Rev 3 But Aren't Rev 2 Ready

Some clients have implemented Rev 3-style controls and believe they're covered. **Rev 2 has specific requirements that Rev 3 softened with ODPs** — for current CMMC assessments, the **Rev 2** language governs:

- **3.3.7 (clock sync)** — Rev 2 requires NTP sync with an authoritative source; Rev 3 softened. NTP sync is required for CMMC.
- **3.4.8 (allow/deny software)** — Rev 2 requires an explicit policy choice and implementation. "We'll define an ODP later" does not satisfy Rev 2.
- **3.5.3 (MFA)** — Rev 2 requires MFA for network access to non-privileged accounts. No ODP wiggle room in Rev 2.
- **3.13.11 (FIPS crypto)** — Rev 2 says "FIPS-validated", flat. Rev 3 uses an ODP. For CMMC, FIPS 140-2/140-3 validation is mandatory.

---

## High-Complexity Controls (Assessment Effort Indicators)

Controls with 5+ assessment objectives drive the bulk of assessment effort and evidence burden:

| Control | Objectives | Key evidence focus |
|---|---|---|
| 3.4.7 | **15** | Port/protocol/service documentation (most objectives of any control) |
| 3.13.1 | 8 | Network boundary definition + monitoring/control/protection |
| 3.4.5 | 8 | Change control access restrictions (physical AND logical) |
| 3.12.4 | 8 | SSP completeness (boundary, environment, connections, update freq) |
| 3.6.1 | 7 | IRP covering all IR phases |
| 3.6.2 | 6 | Incident reporting chain (internal + external) |
| 3.1.1 | 6 | User/device/process inventory + access restrictions |
| 3.1.20 | 6 | External system agreements + connection controls |
| 3.3.1 | 6 | Audit log configuration + retention policy |
| 3.3.8 | 6 | Log protection controls |
| 3.4.1 | 6 | Baseline config + asset inventory |
| 3.13.2 | 6 | Secure architecture documentation |
| 3.14.1 | 6 | Flaw ID/report/correct with defined timeframes |
| 3.1.3 | 5 | Data flow diagrams + flow enforcement |
| 3.1.22 | 5 | Public web content review process |

---

## Common POA&M Objective-Split Patterns

When clients have partial implementations, these objectives are typically split across a POA&M (some Satisfied, some Other Than Satisfied — assuming the practice is POA&M-eligible per `cmmc-expert` §11):

- **3.4.7**: Often `[a]–[f]` Satisfied (programs/functions); `[g]–[o]` (ports/protocols/services) on POA&M.
- **3.3.1**: Often `[a]–[d]` Satisfied (log creation/content); `[e]–[f]` (retention) on POA&M.
- **3.5.3**: Often `[b]–[c]` Satisfied (MFA on privileged); `[d]` (network MFA for non-privileged) on POA&M.
- **3.12.4**: Often `[a]–[c]` Satisfied (SSP exists); `[d]–[h]` (specific elements) on POA&M.
- **3.1.12**: Often `[a]–[b]` Satisfied (types defined); `[c]–[d]` (active monitoring) on POA&M.

For POA&M eligibility rules, point weights, and the 180-day window, see `cmmc-expert` §10–§11.

---

## Authoritative Sources

- **NIST SP 800-171A** (June 2018) — assessment procedures for 800-171 Rev 2 (this skill's primary source).
- **NIST SP 800-171 Rev 2** — https://doi.org/10.6028/NIST.SP.800-171r2
- **NIST SP 800-171 Rev 3** (Final, May 2024) — forward horizon; source of the crosswalk.
- **NIST SP 800-171A Rev 3** — assessment procedures for Rev 3 (consult directly for Rev 3 AO-level language).
- **NIST SP 800-53B** — parent moderate baseline that informed Rev 3 expansions.
- **32 CFR Part 170** — CMMC program rule.
- **DFARS 252.204-7012 / -7019 / -7020 / -7021 / -7025** — contract clauses.
- **CMMC Assessment Guide — Level 2** (current version on dodcio.defense.gov).
- **CMMC Scoping Guide — Level 2**.
- **CMMC Scoring Methodology**.

Primary locations: `dodcio.defense.gov/CMMC/`, `cyber.mil`, `cyberab.org`, `sprs.csd.disa.mil`.

---

## Capabilities

This skill supports:

- Looking up the verbatim text of any Rev 2 assessment objective by ID (e.g., `3.1.1[c]`, `3.13.11[a]`)
- Counting and listing AOs per family for assessment planning
- Determining what evidence types support a given AO (via Examine/Interview/Test method mapping)
- Mapping any Rev 2 control to its Rev 3 equivalent (or noting that it was withdrawn / merged)
- Identifying which Rev 2 controls are gone in Rev 3 and where their content lives now
- Distinguishing Rev 3 ODP-driven language from Rev 2 hard requirements
- Reverse-mapping a Rev 3 finding to its Rev 2 impact on a current CMMC assessment
- Identifying high-complexity controls for assessment scoping
- Spotting common objective-split POA&M patterns

For program-level CMMC topics — SPRS scoring, POA&M rules, scoping, ESP/CSP, C3PAO lifecycle, annual affirmation, False Claims Act risk — use the `cmmc-expert` skill instead.
