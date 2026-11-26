---
description: Determine ITAR vs EAR jurisdiction applicability
---

# Export Control Jurisdiction

> **Engineering guidance only. Not legal advice.** Jurisdiction determinations are made by DDTC and BIS (Commodity Jurisdiction and Classification Requests), not by this toolkit. Use the decision framework below as a starting point for internal triage; file a Commodity Jurisdiction (CJ) request or an ECCN classification through counsel before relying on any determination.

Helps determine whether ITAR, EAR, or both apply to your products, technology, and services.

## Arguments

- Argument 1 - Product/technology description (required)
- Argument 2 - Industry (optional: defense, commercial, technology, aerospace)

## Decision Framework

### Primary Jurisdiction Question

**Is the item on the US Munitions List (USML)?**

- **YES** → ITAR applies (State Department, DDTC)
- **NO** → Continue to EAR analysis

### USML Categories (ITAR)

The USML contains 21 categories of defense articles:

| Category | Description | Examples |
|----------|-------------|----------|
| I | Firearms | Rifles, pistols, machine guns |
| II | Guns and Armament | Artillery, rockets, grenades |
| III | Ammunition | Military ammunition |
| IV | Launch Vehicles | Missiles, rockets, launch vehicles |
| V | Explosives | Plastic explosives, detonators |
| VI | Vessels of War | Naval ships, submarines |
| VII | Tanks and Military Vehicles | Armored vehicles, tanks |
| VIII | Aircraft | Military aircraft, drones |
| IX | Military Training Equipment | Simulators, training devices |
| X | Protective Personnel Equipment | Body armor, helmets |
| XI | Military Electronics | Radar, jamming equipment |
| XII | Fire Control Systems | Targeting systems |
| XIII | Materials and Miscellaneous | Specialized materials |
| XIV | Toxicological Agents | Chemical agents |
| XV | Spacecraft | Satellites, space vehicles |
| XVI | Nuclear Weapons | (See separate regulations) |
| XVII | Classified Articles | Items requiring security clearance |
| XVIII | Directed Energy Weapons | Lasers, particle beams |
| XIX | Gas Turbine Engines | Military jet engines |
| XX | Submersible Vessels | Submarines |
| XXI | Miscellaneous | Other defense articles |

### Commerce Control List Categories (EAR)

If NOT on USML, check if on CCL:

| Category | Description | Examples |
|----------|-------------|----------|
| 0 | Nuclear | Nuclear materials, equipment |
| 1 | Materials | Special materials, composites |
| 2 | Materials Processing | Machine tools, equipment |
| 3 | Electronics | Semiconductors, computers |
| 4 | Computers | Processors, supercomputers |
| 5 | Telecommunications | Encryption, networking |
| 6 | Sensors and Lasers | Sensors, optical equipment |
| 7 | Navigation and Avionics | GPS, inertial systems |
| 8 | Marine | Marine equipment |
| 9 | Aerospace and Propulsion | Aircraft parts, engines |

## Jurisdiction Scenarios

### Scenario 1: Defense Contractor

**Product**: Technical data for military aircraft avionics
**Analysis**: Military aircraft → USML Category VIII → **ITAR applies**
**Posture (validate with counsel)**: DDTC registration, US-person access, US-located data by default (22 CFR 120.54 encryption carve-out available)
**Recommendation**: Use AWS GovCloud or Azure Government

### Scenario 2: Encryption Software Company

**Product**: Commercial encryption software
**Analysis**: Encryption software → CCL Category 5 Part 2 → **EAR applies**
**ECCN**: Likely 5D002 (encryption software)
**License Exception**: ENC may apply
**Requirements**: Self-classification, BIS reporting, embargo screening
**Recommendation**: Commercial cloud with FIPS 140-2, geo-blocking

### Scenario 3: Semiconductor Manufacturer

**Product**: Advanced microprocessors
**Analysis**: Computer chips → CCL Category 3 or 4 → **EAR applies**
**ECCN**: Varies by specifications (3A001, 4A003, etc.)
**Requirements**: Entity List screening (China restrictions), classification
**Recommendation**: Commercial cloud with denied party screening

### Scenario 4: Aerospace Company

**Product**: Jet engine components for both military and commercial aircraft
**Analysis**: Dual-use → **Both ITAR and EAR may apply**

- Military use → ITAR (USML Category XIX)
- Commercial use → EAR (CCL Category 9)
**Requirements**: Separate systems for military vs commercial, jurisdiction by use
**Recommendation**: Segregated environments (GovCloud for ITAR, commercial for EAR)

### Scenario 5: Cloud Service Provider

**Product**: Infrastructure as a Service (IaaS)
**Analysis**: Cloud services generally → **EAR applies** (as a tool)
**Customers** may have ITAR/EAR obligations
**Requirements**: Provide FIPS encryption, data residency controls, access logs
**Recommendation**: Offer GovCloud/Government regions for ITAR customers

## Gray Areas and Dual Jurisdiction

**Dual-Use Technology**:

- May be on both USML and CCL
- **Rule**: If on USML, ITAR takes precedence
- Commodity Jurisdiction (CJ) request can clarify

**Technical Data**:

- Drawings, blueprints, source code
- ITAR if for defense articles
- EAR if for commercial/dual-use

**Deemed Exports**:

- Applies to both ITAR and EAR
- Foreign nationals accessing controlled data in the US
- ITAR: No foreign national access without authorization
- EAR: Deemed export license may be required

## Commodity Jurisdiction (CJ) Request

If uncertain, submit CJ request to State Department:

**Process**:

1. Submit detailed product description to DDTC
2. DDTC reviews against USML
3. Decision: USML (ITAR) or CCL (EAR jurisdiction)
4. Timeline: 60 days (can extend)

**Cost**: No fee
**Form**: DS-4076 Commodity Jurisdiction Request

## Decision Matrix

| Product Type | Likely Jurisdiction | Authority | Key Requirements |
|--------------|-------------------|-----------|------------------|
| Military weapons | ITAR | State DDTC | US persons, US regions, registration |
| Defense technical data | ITAR | State DDTC | US persons, classification, marking |
| Encryption software | EAR | Commerce BIS | FIPS 140, screening, ECCN 5D002 |
| Semiconductors | EAR | Commerce BIS | Entity List, classification |
| Dual-use tech | ITAR + EAR | Both | Segregate by use case |
| Cloud services (tool) | EAR | Commerce BIS | Support customer compliance |

## Examples

```bash
# Determine jurisdiction for encryption software
/us-export:jurisdiction "Commercial encryption software with AES-256"

# Aerospace dual-use product
/us-export:jurisdiction "Jet engine components" aerospace

# Technical data for defense
/us-export:jurisdiction "Technical drawings for military radar system" defense

# Cloud infrastructure service
/us-export:jurisdiction "IaaS cloud platform" technology
```

## Compliance Recommendation

**If ITAR applies**:

- Use `/us-export:itar-assess` for detailed requirements
- Consider GovCloud/Government cloud
- Implement US person verification

**If EAR applies**:

- Use `/us-export:ear-assess` for detailed requirements
- Commercial cloud with FIPS 140-2 and geo-blocking
- Implement denied party screening

**If both apply**:

- Segregate systems by use case
- Use `/us-export:assess both` for comprehensive evaluation
- Consider separate environments (GovCloud + commercial)

## Resources

- **USML**: 22 CFR 121 (ITAR)
- **CCL**: 15 CFR 774 Supplement No. 1 (EAR)
- **CJ Process**: https://www.pmddtc.state.gov/ddtc_public/ddtc_public?id=ddtc_public_portal_cj_landing
