---
description: Determine whether Singapore MAS TRM applies to the organization
---

# Singapore MAS TRM Scope

Determines whether and how the Monetary Authority of Singapore (MAS) Technology
Risk Management Guidelines apply to the organization. Reference-depth scope is a
decision-tree prompt; Full-depth plugins extend this with jurisdiction-aware
logic.

## Usage

```bash
/sg-mas-trm:scope
```

## What this produces

- **Applicability verdict**: in-scope, out-of-scope, or partially in-scope.
- **In-scope entity types**: MAS-regulated financial institution, Singapore
  branch, licensed payment service provider, capital markets intermediary,
  insurer, bank, outsourced service provider, or shared-service operator.
- **In-scope systems**: critical systems, customer-facing digital channels,
  cloud workloads, outsourced technology services, security monitoring, and
  recovery environments.
- **Jurisdiction reach**: Singapore-regulated operations and supporting offshore
  or outsourced technology services.
- **Next steps**: whether to proceed with `/sg-mas-trm:assess` or
  `/sg-mas-trm:evidence-checklist`.

## Framework-specific scope triggers

Ask the minimum questions needed to classify MAS TRM applicability:

- Is the organization regulated or licensed by MAS?
- Does it operate a Singapore branch, subsidiary, or service supporting a
  Singapore-regulated financial institution?
- Which systems are critical to financial services, customer access,
  transaction processing, risk management, or regulatory reporting?
- Are technology services outsourced, cloud-hosted, or delivered through a
  regional shared-service model?
- Are there customer-facing digital channels, APIs, payment systems, trading
  systems, or high-availability platforms?
- Does the organization rely on third parties for security monitoring, incident
  response, disaster recovery, software development, or infrastructure
  operations?

Return an applicability verdict, in-scope systems, responsible owners, and the
follow-up command that should run next. Do not ask users to search the MAS
guidelines; translate their answers into practical MAS TRM scoping outcomes.
