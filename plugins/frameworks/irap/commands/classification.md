---
description: Determine the Australian Government security classification a system will hold and what it changes for an IRAP assessment
---

# Classification

Works out the highest security classification a system will hold, and what that means for control selection, personnel, and authorisation.

## Usage

```bash
/irap:classification
```

## The classifications

| Classification | ISM applicability marking | Notes |
|---|---|---|
| Non-classified (including unofficial and OFFICIAL information) | NC | Baseline ISM controls |
| OFFICIAL: Sensitive | OS | Sensitive information that needs limited dissemination, such as personal information held by government |
| PROTECTED | P | A common target for cloud services that hold government information; confirm with each customer |
| SECRET | S | The highest classification IRAP assessments cover |
| TOP SECRET | TS | Outside IRAP's scope; the Director-General ASD (or delegate) authorises these systems |

## How to decide

1. **Ask the data owner.** The originating government entity assigns classifications under the PSPF. A provider does not decide them.
2. **Use the highest classification** of any information the system will store, process, or communicate. Aggregated data can warrant a higher classification than the individual items.
3. **Record the decision** with the data owner's name and date, and the customer contract or requirement that states it.

## What the classification changes

- **Control selection**: you take the ISM controls marked for that classification.
- **Personnel**: screening and clearance requirements for people with access rise with classification. Confirm the customer's requirements.
- **Hosting and location**: customer contracts and PSPF requirements may limit where data and support staff can be. See `/irap:data-residency`.
- **Authorisation**: up to SECRET, the customer organisation's CISO (or delegate) authorises the system.

## Output

The classification, the reason for it, who confirmed it, and the ISM applicability marking to filter controls by. The output feeds `/irap:scope`.

## Source

- [ASD: Information security manual](https://www.cyber.gov.au/ism)
- [Protective Security Policy Framework](https://www.protectivesecurity.gov.au/)
