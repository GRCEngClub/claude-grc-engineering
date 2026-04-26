# Secure Controls Framework attribution

This toolkit uses the [Secure Controls Framework](https://securecontrolsframework.com) (SCF) as its canonical control vocabulary and crosswalk source.

## What this toolkit uses

- **Data source**: the static JSON API at [`https://grcengclub.github.io/scf-api/`](https://grcengclub.github.io/scf-api/), itself a faithful parse of the SCF v2026.1 workbook published by [securecontrolsframework.com](https://securecontrolsframework.com).
- **How**: `/grc-engineer:gap-assessment` and related commands fetch SCF controls, families, and framework crosswalks. Data is cached locally under `~/.cache/claude-grc/scf/` for performance.

## License

SCF data is licensed under [Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)](https://creativecommons.org/licenses/by-nd/4.0/).

This license allows:

- Copying and redistributing the material in any medium or format, for any purpose, including commercial
- Appropriate attribution to the Secure Controls Framework Council

This license forbids:

- Distributing modified versions of the SCF data
- Cropping or editing control text, descriptions, or crosswalk mappings

**How the toolkit stays compliant**:

- Cached SCF data is preserved byte-for-byte from the upstream API. Never modified.
- Every report that includes SCF control IDs, descriptions, or crosswalks carries an attribution footer: *"Control mappings provided by the Secure Controls Framework (https://securecontrolsframework.com), licensed under CC BY-ND 4.0."*
- The `control-crosswalk.yaml` overrides file is for **local supplements only**: adding controls SCF doesn't cover. It does not modify SCF data in place.

## If you're building on this

Any downstream use of SCF data through this toolkit inherits CC BY-ND 4.0. In practice:

- ✅ Include SCF-sourced control IDs in your audit reports
- ✅ Distribute the unmodified cached JSON
- ✅ Build commercial tools that consume SCF data via this toolkit
- ❌ Publish a "modified SCF" or "enhanced SCF" dataset by editing upstream text
- ❌ Strip the attribution from generated reports

## Upstream

- Framework: https://securecontrolsframework.com
- API source: https://github.com/GRCEngClub/scf-api
- Issues with crosswalk mappings: file upstream at the SCF council

## Version pinning

The toolkit is tested against SCF v2026.1 (1,468 controls, 33 families, 249 frameworks). Upstream publishes quarterly; the SCF API auto-syncs weekly. Breaking changes in the data shape trigger a toolkit release with an updated compatibility range.
