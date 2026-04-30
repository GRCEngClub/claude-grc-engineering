---
description: Determine NIS2 applicability and entity classification (essential / important / out-of-scope)
---

# EU NIS2 Scope

Determines whether the **EU NIS2 Directive** (Directive (EU) 2022/2555) applies to the organisation, and if so whether the organisation is classified as **essential** (Annex I) or **important** (Annex II). Reference-depth scope is a structured walkthrough of the Article 2 and Article 3 decision tree; Full-depth plugins extend this with national-law-aware logic per Member State.

NIS2 is a **Directive**, not a Regulation. The substantive rules a regulator can enforce against the organisation live in the **national transposition law** of each EU Member State. This command gives the directive-level verdict; for definitive in-or-out determinations always consult the national transposition law of every Member State in which the organisation operates a NIS2-covered service.

## Usage

```
/eu-nis2:scope
```

## What this produces

- **Applicability verdict** — In-scope / out-of-scope / partially in-scope, with the Article 2 trigger that led there.
- **Entity classification** — Essential (Annex I sector + size threshold) / Important (Annex II sector + size threshold) / Both (multi-sector organisations may have parts of the organisation in different tiers).
- **Sector mapping** — which NIS2 sector (or sectors) the organisation operates in, and the specific subsector under Annex I or II.
- **Size-threshold finding** — whether the entity meets the medium-enterprise threshold from Recommendation 2003/361/EC (≥50 employees OR ≥€10M annual turnover/balance sheet).
- **Carve-out flags** — whether any Article 2(2) override applies (trust services, DNS/TLD, public electronic communications, sole provider, CER critical entity, central-government public administration). These pull the entity in regardless of size.
- **Member-State touchpoints** — for each Member State the organisation operates in, the national competent authority and CSIRT to engage with, plus a flag on transposition status as known.
- **Registration obligations** — whether the entity must register with the national competent authority and (for digital infrastructure / ICT service management / digital providers) with ENISA under Article 27.
- **Next steps** — typically `/eu-nis2:evidence-checklist` to enumerate Article 21 evidence requirements and `/eu-nis2:assess` to run the SCF-backed gap assessment.

## Decision tree

The plugin walks through these checks in order. Stop at the first definitive verdict.

### Step 1 — Sector check (Article 2(1) and Annexes I & II)

Ask: "Which of the NIS2 sectors does the organisation operate in?" Multiple sectors are common — capture all of them.

**Annex I sectors (default classification: essential)**:

- Energy (electricity, district heating and cooling, oil, gas, hydrogen)
- Transport (air, rail, water, road)
- Banking (credit institutions)
- Financial market infrastructures (trading venues, central counterparties)
- Health (healthcare providers; EU reference labs; R&D for medicinal products; manufacturers of basic pharmaceutical products and preparations; manufacturers of critical medical devices)
- Drinking water (suppliers and distributors)
- Wastewater (collection, disposal, treatment)
- Digital infrastructure (IXPs, DNS providers excl. root servers, TLD name registries, cloud computing services, data centre services, content delivery networks, trust service providers, providers of public electronic communications networks/services)
- ICT service management B2B (managed service providers, managed security service providers)
- Public administration (central government and certain regional government, scope set by Member State)
- Space (operators of ground-based infrastructure)

**Annex II sectors (default classification: important)**:

- Postal and courier services
- Waste management
- Manufacture, production and distribution of chemicals
- Production, processing and distribution of food
- Manufacturing — medical devices and IVD; computer/electronic/optical products; electrical equipment; machinery and equipment; motor vehicles, trailers, semi-trailers; other transport equipment
- Digital providers (online marketplaces, online search engines, social networking services platforms)
- Research organisations

If the organisation is in none of these sectors, it is **out of scope under the directive baseline**. (Member States may widen scope under Article 2(2)(d)–(e); flag this as a residual risk and re-check the national law.)

### Step 2 — Size-threshold check (Article 2(1) and Recommendation 2003/361/EC)

Ask: "Does the entity meet the medium-enterprise threshold?"

- ≥ 50 employees, OR
- annual turnover **and** annual balance sheet total **both above €10 million**

Apply the threshold at the **entity level**, not at the corporate group level (with the group-aggregation rules in Recommendation 2003/361/EC for partner and linked enterprises). If the entity meets the medium threshold:

- Annex I sector → **Essential entity**.
- Annex II sector → **Important entity**.

If the entity is below the medium threshold, do not stop yet — go to Step 3.

### Step 3 — Size-independent override check (Article 2(2))

The size threshold is **overridden** for any of the following — these entities are in scope regardless of size:

- Qualified and non-qualified **trust service providers** under eIDAS.
- **TLD name registries** and **DNS service providers** (excluding root servers).
- Providers of **public electronic communications networks** and **publicly available electronic communications services**.
- **Sole providers** in a Member State of a service that is essential for the maintenance of critical societal or economic activities.
- Entities providing services on which the Member State's economy or constitutional order depends, as identified by the Member State.
- Entities qualified as **critical entities under the CER Directive** (Directive (EU) 2022/2557).
- Public administration entities of **central government** as designated by the Member State.
- Public administration entities at **regional level** as designated by the Member State (some Member States include all regions; others only certain ones).
- Where the Member State so provides, entities providing **domain-name registration services**.

If any of these applies, the entity is in scope regardless of headcount or turnover. Most are classified as essential, but verify via Annex I vs II for the sector.

### Step 4 — Member-State-discretionary additions (Article 2(2)(d)–(e))

Member States may classify additional entities as essential or important based on the role they play in the national economy. Examples in early transposition laws:

- Some Member States include all of central and regional public administration; others only ministries and federal-level agencies.
- Some Member States include educational institutions in research scope; others do not.
- Some Member States explicitly extend scope to specific industries (e.g., automotive supply chain in Germany; defence-industrial base in France's transposition).

Check the national transposition law of each Member State the organisation operates in. The plugin cannot give a definitive answer at the directive level for these discretionary categories.

### Step 5 — Member-State-discretionary exclusions

Limited carve-outs are available for entities providing services **exclusively** to defence or national security. National security is outside the EU's competence, so Member States can choose to exclude or apply a different regime to entities supporting national-security functions. This is narrow — most dual-use organisations do not qualify.

## Multi-Member-State organisations

NIS2 applies wherever the entity is **established** in the Union. Article 26 sets jurisdiction:

- For most entity types: the Member State of the entity's main establishment.
- For DNS service providers, TLD name registries, entities providing domain-name registration services, cloud computing service providers, data centre service providers, content delivery network providers, managed service providers, managed security service providers, providers of online marketplaces, of online search engines, and of social networking services platforms: the Member State of the **main establishment in the Union** (with Article 26(2) tie-breakers).
- An entity not established in the Union but offering services within the Union must designate a representative in one of the Member States in which it offers services.

For each Member State of operation, the plugin records: competent authority, CSIRT, transposition-law citation, registration deadline, and any national-specific obligations (mandatory CISO appointment, sectoral reporting portals, etc.).

## What the verdict does *not* cover

- **Implementing Regulation (EU) 2024/2690 controls** — for entities in scope of the digital-infrastructure / ICT-service-management / digital-provider categories, the Annex implementing act sets detailed technical and methodological requirements. Use the companion `emea-eu-nis2-annex-2024` SCF crosswalk.
- **DORA pre-emption** — for in-scope financial entities, DORA (Regulation (EU) 2022/2554) is *lex specialis* and pre-empts NIS2 on ICT risk management, incident reporting, threat-led penetration testing, and ICT third-party risk. The plugin flags this; route to a DORA workflow for the overlapping topics.
- **CER co-designation** — entities qualified as critical entities under CER are automatically in NIS2 scope as essential. The CER physical-resilience obligations are not covered by this plugin.
- **Sector-specific national rules** — many Member States preserve pre-NIS2 sectoral regimes (for example, Germany's KRITIS rules, France's LPM-OIV regime). Read them alongside the NIS2 transposition law.
