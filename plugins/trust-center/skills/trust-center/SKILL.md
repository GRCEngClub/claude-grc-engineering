---
name: trust-center
description: Inspect experimental trust-center groundwork using synthetic data only. Deployment and sensitive document handling are blocked.
---

# Trust Center — experimental groundwork

**STOP: Do not deploy, publish, seed a live service, upload documents, or use sensitive or customer data.** This is not production-ready. Never bypass the deployment guards or generate alternative deployment instructions. The public API proxy is unauthenticated and route security has not been verified. NDA signing and enforcement are not implemented; configuring an e-signature provider does not make access safe.

For requests to deploy, host documents, enable gated access, or set up NDAs, explain the blockers in `docs/ACCESS-SECURITY.md` and stop. Do not ask for credentials or company documents. Do not imply offline tests prove cloud security.

For evaluation, inspect the code and run offline tests with synthetic data only. The frontend's demo mode is opt-in and does not provide real access requests or downloads. Do not provision AWS resources or write to existing services. The deployment scripts and CloudFormation templates deliberately fail closed; these guards are not security boundaries if modified or bypassed. Maintainer selection of hosting and access model, implementation and independent end-to-end verification are required before reconsidering deployment.
