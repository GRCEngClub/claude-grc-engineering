# Sample Evidence Pack — Drafting a Risk Report

Practice evidence for **CGE-AUD Chapter 5.4 (Drafting a Risk Report)** from the
[GRC Engineering Club Training Academy](https://cert.grcengclub.com). Use it any
time you want a realistic folder of raw evidence to point the `grc-auditor`
persona (or any Claude workflow) at.

Everything here is **fictional**. The company, people, account IDs, and
resources are invented for training. `Skyline Analytics` is a made-up
cloud-native SaaS company running on AWS with GitHub and GitHub Actions.

## The exercise

You have been handed this folder by the client at the start of fieldwork. Your
job, as taught in Chapter 5.4:

1. Point Claude at this folder with the auditor workflows installed:

   ```bash
   /plugin install grc-auditor@grc-engineering-suite
   /grc-auditor:risk-report examples/sample-evidence/ leadership
   ```

   (`/grc-auditor:review-evidence examples/sample-evidence/` also works if you
   want the control-by-control review instead of the ranked report.)

   or simply ask Claude Code to *"review the evidence in this folder and draft
   a ranked risk report, citing the specific file and line for every finding."*

2. Review the draft the way the course teaches: verify every finding against
   the underlying file, challenge the ranking, and reject anything the evidence
   does not support.

3. Present the final report as if to an engagement manager.

The files contain deliberately planted issues across several severity levels —
enough for a ranked report. They also contain configurations that are perfectly
fine. Part of the exercise is that Claude (and you) should *not* flag those.
No answer key is published; compare notes with your study group in Slack.

## What's in the folder

| File | What it is |
|---|---|
| `iam-policy-deploy-role.json` | IAM policy document attached to the CI deploy role |
| `iam-password-policy.json` | Output of `aws iam get-account-password-policy` |
| `cloudtrail-events.json` | Excerpt of CloudTrail management events (7 days) |
| `security-groups.json` | Output of `aws ec2 describe-security-groups` (prod VPC) |
| `s3-data-bucket.tf` | Terraform for the customer-data S3 bucket |
| `github-branch-protection.json` | GitHub API export of `main` branch protection |
| `ci-build-log.txt` | GitHub Actions log for a production deploy run |
| `access-review-q2.csv` | Q2 2026 user access review worksheet from the client |

All artifacts are dated within the fictional audit period (April–June 2026)
and are internally consistent — resource IDs and usernames that appear in one
file reappear in others, so cross-referencing between files is rewarded.
