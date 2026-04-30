---
description: Determine whether NERC CIP applies to the entity and assets
---

# NERC CIP Scope

Determines whether and how NERC Critical Infrastructure Protection (CIP)
Reliability Standards apply to the entity, Facilities, and cyber asset
population. Reference-depth scope is a decision-tree prompt; Full-depth plugins
extend this with registered-function and BES Cyber System categorization logic.

## Usage

```bash
/us-nerc-cip:scope
```

## What this produces

- **Applicability verdict**: in-scope, out-of-scope, or partially in-scope.
- **In-scope entity types**: registered functions such as BA, DP, GO, GOP, RC,
  TO, TOP, TP, or other NERC-defined responsible entity roles.
- **In-scope assets**: Facilities, BES Cyber Systems, Cyber Assets, Electronic
  Security Perimeters, Physical Security Perimeters, EACMS, PACS, and protected
  information.
- **Jurisdiction reach**: applicable North American bulk power system
  jurisdiction and Regional Entity oversight.
- **Next steps**: whether to proceed with `/us-nerc-cip:assess` or
  `/us-nerc-cip:evidence-checklist`.

## Framework-specific scope triggers

Ask the minimum questions needed to classify NERC CIP applicability:

- Which NERC registered functions does the entity perform?
- Which Facilities and assets support BES reliability obligations?
- Has the entity completed BES Cyber System categorization and impact rating?
- Which assets are high, medium, low, or out of scope?
- What Electronic Security Perimeters and Physical Security Perimeters exist?
- Which vendors, remote access paths, cloud services, or shared services support
  BES Cyber Systems or protected information?
- Which Regional Entity or jurisdiction governs the compliance program?

Return an applicability verdict, in-scope asset population, impact categories,
responsible owners, and the follow-up command that should run next. Do not ask
users to search NERC standards; translate their answers into practical NERC CIP
scoping outcomes.
