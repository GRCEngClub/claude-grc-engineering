---
name: evidence-checklist
description: Build an IRAP evidence checklist grouped by ISM guideline
---

# IRAP Evidence Checklist

Builds the evidence an IRAP assessor will ask for, grouped by ISM guideline. Pair it with the control set from `/irap:scope`. The ISM is the authority for control wording; this checklist lists the artifacts that show a control is implemented and operating.

> **Never commit evidence to source control.** IRAP evidence can include system designs, personnel details, and classified or sensitive configuration. Handle it at the classification of the system it describes.

## Usage

```bash
/irap:evidence-checklist [<guideline>|all] [--classification <level>] [--export <markdown|csv|json>]
```

## Evidence by ISM guideline

### Cyber security roles and documentation

- CISO appointment and responsibilities.
- System security plan, incident response plan, continuous monitoring plan, and the cyber security policies the system relies on.
- System authorisation records from previous cycles, if any.

### Cyber security incidents

- Incident response plan and records of plan exercises.
- How incidents are reported, internally and to ASD, and records of recent reports.
- Event log sources, central collection, protection from modification and deletion, and analysis records.

### Procurement and outsourcing

- Inventory of service providers and what each one provides.
- Contract terms covering security obligations, data location, and incident notification.
- IRAP or other assessment reports for inherited services, with dates and scope.

### Physical and personnel security

- Facility security for data centres and offices in scope, or the hosting provider's evidence.
- Security clearance and screening records for staff with access, as the classification requires.
- Security awareness training records.

### Communications infrastructure, systems, and networking

- Network diagrams that show the boundary, segmentation, and connections to other systems.
- Firewall and gateway rule reviews.
- Wireless, remote access, and administrative access paths.

### System hardening and system management

- Hardened baseline configurations for operating systems, applications, and network devices.
- Application control configuration.
- Patch and vulnerability scan records. Show timeframes against the target Essential Eight maturity level.
- Change management records.

### System access

- Account inventories; privileged access approvals and revalidation.
- MFA configuration, including phishing-resistant methods where required.
- Separate administrative environments or jump servers for privileged work.

### Cryptography and data transfers

- The cryptographic algorithms and protocols in use and where they are configured.
- Key management procedures.
- Controls and logs for data imports and exports.

### Software development and database systems

- Secure development practices, code review, and testing records.
- Database hardening and access logging.

### Email, gateways, and media

- Email protections such as sender authentication and content filtering, where in scope.
- Gateway architecture and logs.
- Media handling, sanitisation, and disposal records.

### Security assurance and evaluated products

- Records of prior assessments and penetration tests, and remediation tracking.
- Evaluated products in use, where the ISM calls for them.

## Output

One row per artifact with these fields:

- ISM guideline;
- related control IDs from the scope record;
- artifact;
- owner;
- location;
- status;
- date collected.

Mark inherited controls with the provider and the report that covers them.

## Automating collection

Technical evidence can come from connectors:

```bash
/irap:assess --sources=aws-inspector,okta-inspector,github-inspector
```
