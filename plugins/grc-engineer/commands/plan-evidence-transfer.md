---
description: Plan a human-approved secure evidence transfer without collecting or transmitting evidence
---

# Plan evidence transfer

Prepare a **plan**, not a package or transmission. This is an initial manual workflow toward secure evidence packaging, not an encryption or delivery implementation.

## Arguments

- `$ARGUMENTS` - Intended recipient and purpose, classification, approximate size, and approved delivery constraints. Use generic descriptions; do not paste evidence, secrets, credentials, private keys, access tokens, or personal data into the conversation.

## Instructions

1. Ask for missing information: authorized recipient and independent verification contact, permitted classification and approved transfer method, retention/deletion requirements, and whether signing is required. Do not assume that a portal or email is approved.
2. Produce an inventory template containing only artifact identifiers/descriptions, owner, classification, intended recipient, and retention date. Explain that names, paths, metadata, hashes, and even the inventory can be sensitive. The evidence owner must select the minimum necessary artifacts and review them for secrets and third-party data before inclusion; this workflow does not scan or redact them.
3. Recommend use of an organization-approved, access-controlled workstation and private encrypted staging location. Avoid shared temporary directories, repositories, chat transcripts and logs. Review file permissions, symlinks, unexpected files and archive paths before packaging; do not follow links into unrelated locations. A normal archive is not encrypted. Archive metadata may reveal sensitive information.
4. If asymmetric encryption is approved, have the recipient provide a supported public key and verify its **full fingerprint out of band** with a known contact before use. Determine approved signing keys and fingerprint verification separately. Use the organization's supported GnuPG/PGP implementation and documented key-management procedures; never invent cryptography or request a private key, passphrase or recovery code. A public key in an unverified email is not sufficient. 1Password CLI is not treated as an encryption format.
5. Within the approved secure workspace, the operator can create a manifest of selected files and their SHA-256 digests, then package the reviewed files and manifest using approved tooling. Have an authorized operator sign the manifest or package when required and encrypt the archive to the independently verified recipient key(s). Confirm signer and recipient fingerprints and verify the output with the organization's documented tools before release. Hashes alone do not authenticate the sender; the recipient must validate the signature using a separately verified signing key and check the file digests after safe extraction.
6. Obtain explicit human approval of the recipient, contents and delivery channel before any transfer. A human uses the approved portal or transfer tool; do not upload, email, publish links, change permissions or contact recipients automatically. Record the transfer reference, time, recipient identity, key fingerprints, package digest and approval in the approved restricted audit system, without credentials, evidence content or secret-bearing links. Confirm receipt and signature/checksum verification through an agreed channel.
7. Apply the organization's retention and cleanup policy to staging files and keys. Do not promise secure deletion: backups, snapshots, SSDs and synchronized folders can retain copies. Record exceptions and failed verification; do not release a failed package.

## Local packaging (optional)

The operator may use the experimental local CLI below after completing the planning and key verification steps above. Run it directly on a trusted, access-controlled machine, not through a chat containing evidence or credentials. Import the recipient's public key into the operator's GnuPG keyring first and independently verify the full **primary key** fingerprint. The CLI deliberately uses GnuPG's `--trust-model always` only after requiring that exact fingerprint; it cannot verify the recipient's identity for you.

```bash
python3 plugins/grc-engineer/scripts/package-evidence.py /private/reviewed-evidence /private/output/evidence.zip.gpg FULL_PRIMARY_KEY_FINGERPRINT
```

The source must be a stable, trusted directory, not writable by other users or processes during packaging. The output must not already exist or be within the source. The command stores regular files in a ZIP, includes a SHA-256 JSON manifest inside it, and encrypts to one GnuPG recipient. It refuses symlinks and special files; empty directories are omitted. ZIP timestamps use local time with two-second precision: dates before 1980 are clamped to 1980-01-01 00:00:00 and dates after 2107 to 2107-12-31 23:59:58 rather than preserved. Permission bits are stored where supported, but other metadata is not. File contents and the archive are held in memory, so use only for reasonably sized evidence. It creates no plaintext archive on disk, but memory, swap, crash dumps and backups can expose plaintext. The output digest is printed for the operator's restricted audit record. File names, metadata, hashes and manifest can be sensitive.

This initial CLI does **not** sign the manifest or authenticate the sender, verify recipient identity, scan or redact secrets, transmit files, create an audit trail, integrate with 1Password, or provide tar.gz, multi-recipient or portal support. A hash obtained over the same untrusted channel is not proof of authenticity. Use an independently verified signer and the organization's approved signature and delivery procedures; do not treat this command as completing those steps. The recipient must authenticate the sender, decrypt in a private workspace, safely inspect archive paths before extraction, and compare extracted files against the manifest. Do not release if verification fails. Do not use where signatures are required until a separately approved signing workflow is completed.

## Output

Return a concise checklist with known inputs, open questions, owner approvals, planned verification and delivery, and limitations. Never claim that anything was packaged, encrypted, signed, delivered, or verified unless an authorized operator actually performed and confirmed that action. This command does not itself create manifests, archives, signatures, logs or encrypted bundles and does not integrate with 1Password, SFTP or auditor portals.
