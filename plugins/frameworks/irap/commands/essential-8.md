---
description: Self-assess Essential Eight maturity against the ASD Essential Eight maturity model
---

# Essential Eight

Self-assesses the eight mitigation strategies against the ASD *Essential Eight maturity model* (November 2023 edition, the current edition as of late 2026). For a fuller treatment use the `essential8` plugin; this command covers what an IRAP assessment draws on.

## Usage

```bash
/irap:essential-8 [--target <1|2|3>]
```

## The strategies

1. Patch applications
2. Patch operating systems
3. Multi-factor authentication
4. Restrict administrative privileges
5. Application control
6. Restrict Microsoft Office macros
7. User application hardening
8. Regular backups

## Maturity levels

The model has four levels, Maturity Level Zero to Maturity Level Three. Each level is aimed at a more capable adversary. ASD advises reaching the same level across all eight strategies before moving to the next.

Examples of what moves between levels:

- **Patch applications, online services**: for critical vulnerabilities, or when a working exploit exists, patches are applied within 48 hours. For non-critical vulnerabilities with no working exploit, the deadline is two weeks. This applies from Maturity Level One.
- **Patch applications, office productivity suites, web browsers and their extensions, email clients, PDF software, and security products**: the deadline is two weeks at Maturity Levels One and Two. At Maturity Level Three it tightens to 48 hours for critical vulnerabilities.
- **Multi-factor authentication**: Maturity Level Two requires MFA for privileged and unprivileged users of systems, and that MFA must be phishing-resistant.
- **Restrict administrative privileges**: privileged access is validated when first requested and disabled after 12 months unless revalidated. From Maturity Level Two, privileged access to systems and applications is also disabled after 45 days of inactivity.
- **Event logs**: from Maturity Level Two, the relevant event logs are centrally logged and protected from modification and deletion. Logs from internet-facing servers are analysed in a timely manner.

Check the model itself for the full requirements at each level. ASD also publishes an *Essential Eight assessment process guide* for how to test them.

## Output

For each strategy:

- the current maturity level, with the requirement that blocks the next level;
- evidence references;
- the gap to the target level.

The overall maturity is the lowest level across the eight strategies.

## Sources

- [ASD: Essential Eight maturity model](https://www.cyber.gov.au/publication/essential-eight-maturity-model)
- [ASD: Essential Eight maturity model changes](https://www.cyber.gov.au/publication/essential-eight-maturity-model-changes)
