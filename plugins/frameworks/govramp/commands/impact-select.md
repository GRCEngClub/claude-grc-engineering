---
description: Choose the GovRAMP impact level (Low, Moderate, or High) with FIPS 199
---

# GovRAMP Impact Level Selection

Helps pick the impact level for GovRAMP Ready or Authorized Verification from the system's data and mission. Snapshot and Core do not need this choice: their 40 and 60 controls are fixed and Core aligns with Moderate.

## Arguments

- `$1` - System description (optional)

## How GovRAMP sets the level

GovRAMP offers Low, Moderate, and High service provider packages built on NIST SP 800-53 Rev. 5 baselines. GovRAMP asks providers to pick the level "based on your government customers and data sensitivity," so start from what the buying governments will put in the system. Use FIPS 199:

- Rate confidentiality, integrity, and availability as Low (limited adverse effect), Moderate (serious adverse effect), or High (severe or catastrophic adverse effect).
- The overall level is the highest of the three.

## Low

Choose Low only when every objective is Low:

- Public or already-published information only.
- No PII beyond what login needs (such as a name and email address).
- An outage is an inconvenience, with other channels available.

Examples: informational websites, event calendars, public comment collection that stores no sensitive personal data.

## Moderate

Most state and local SaaS lands here. Choose Moderate when the system holds data whose disclosure or alteration would cause serious harm:

- PII such as SSNs, driver's license numbers, or financial account data.
- Health information, tax data, benefits eligibility data, or employee records.
- Systems whose outage seriously disrupts a government service.

Examples: benefits administration, payroll and HR, licensing and permitting with PII, case management, grant management.

## High

Choose High when compromise could cause severe or catastrophic harm:

- Loss of life or major public-safety impact, such as emergency dispatch or critical infrastructure control.
- Large aggregations of highly sensitive data where a breach would be catastrophic.

## Other requirements that apply on top

The impact level does not replace other rules that apply to the data:

- **Criminal justice information**: the FBI CJIS Security Policy applies.
- **Federal tax information**: IRS Publication 1075 applies.
- **Health data**: HIPAA applies where the government entity is a covered entity or business associate.
- **The buying government's own rules**: some governments set extra requirements by data type. Read the solicitation. See `/govramp:state-specific`.

## Common mistakes

1. **Missing PII in logs, metadata, or attachments.** It counts toward the rating.
2. **Ignoring aggregation.** Individually low-sensitivity records can be Moderate in bulk.
3. **Rating availability on hope.** If the service has no workaround during an outage, rate availability honestly.
4. **Choosing for today only.** Adding sensitive data later means re-categorizing and possibly a new assessment. Plan for what customers will put in the system.

## Output

1. Recommended impact level with the C/I/A ratings and the reason for each
2. Data types found and how each drives the rating
3. Overlapping requirements (CJIS, Pub 1075, HIPAA) that apply
4. Questions to confirm with the buying governments

## Examples

```bash
/govramp:impact-select
/govramp:impact-select "Benefits eligibility and enrollment system with SSN, income data, and health information"
/govramp:impact-select "Public permit search portal with no account creation"
```

## Related commands

1. `/govramp:assess ready <level>` or `/govramp:assess authorized <level>`
2. `/govramp:documentation`
