# Governance

`claude-grc-engineering` is the official open-source toolkit of the GRC
Engineering Club. This document explains how we make decisions, who stewards
the repository, and how contributors can grow into maintainership.

## Leadership team

The project is co-led by AJ Yawn and Ethan Troy through
`@GRCEngClub/grc-eng-leadership-team`.

The leadership team is responsible for:

- Setting the direction of the toolkit and approving major roadmap changes
- Approving changes to governance, licensing, security policy, and CODEOWNERS
- Resolving contested technical or community decisions
- Appointing and rotating maintainers as the project grows

## Decision process

We default to lazy consensus for routine work:

- Open the work in a pull request, issue, or discussion
- Leave reasonable space for review and objections
- Merge once a maintainer approves and no substantive objections remain

When consensus does not emerge, the leadership team makes the final call. For
changes that affect schemas, licensing, governance, security, or sensitive
framework content, leadership-team approval is required before merge.

## Maintainers

Maintainers are trusted contributors who help review pull requests, triage
issues, guide new contributors, and keep the project aligned with Club goals.
The current maintainer roster lives in `MAINTAINERS.md`.

Maintainers are expected to:

- Review contributions with empathy and technical rigor
- Protect the project contract, especially schema stability and licensing rules
- Escalate governance, security, or conduct concerns quickly
- Help contributors understand feedback and move work across the finish line

## Path to maintainership

Contributors can be nominated for maintainership after demonstrating sustained,
high-quality participation. Our default bar is:

- At least three meaningful pull requests over time
- Consistent collaboration in issues, reviews, or discussions
- Evidence of good judgment around the project's quality and community norms
- Nomination by an existing maintainer and approval by the leadership team

Maintainership is a stewardship role, not just a merge permission.

## Vouching new contributors

To manage the volume of automated and AI-scaffolded pull requests, this repo
uses [mitchellh/vouch](https://github.com/mitchellh/vouch). Vouched
contributors are listed in `.github/VOUCHED.td`; users with `write` or `admin`
role on the repository (including the leadership team) are auto-allowed and do
not need to be listed.

The gate runs in **enforcement mode**: PRs from unvouched authors are
auto-closed with a templated comment. Bots and write/admin users are exempt.

Only **AJ Yawn (`@ajy0127`) and Ethan Troy (`@ethanolivertroy`)** are
authorized to manage the vouch list — see `.github/VOUCHED-MANAGERS.td`. They
manage it by commenting on any issue or PR (the keyword must be the **first
line** of the comment):

- `!vouch` — vouch for the issue/PR author
- `!vouch @user` — vouch for a specific user
- `!denounce @user [reason]` — block a user
- `!unvouch @user` — remove a user from the list

Each command opens a small auto-PR editing `.github/VOUCHED.td` and
auto-merges it via the `grc-eng-vouch-bot` GitHub App, which holds bypass
permission on the main branch. Comments from anyone outside the managers
file are ignored.

## History

The toolkit was founded by Ethan Troy in 2025 and contributed to the GRC
Engineering Club in 2026. The Club now owns the project and stewards it as a
community-maintained open-source toolkit.
