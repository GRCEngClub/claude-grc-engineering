# GRC Trust Center — experimental groundwork

**STOP: Do not deploy or use sensitive data.** This is not production-ready. Deployment scripts and CloudFormation templates deliberately reject deployment; do not bypass the guards. The public proxy is unauthenticated and gateway routing and access controls have not been verified end-to-end. Requester sign-in and private download flows are incomplete, and NDA signing and enforcement are not implemented.

Only offline evaluation with synthetic data is appropriate. See [security limitations and blockers](docs/ACCESS-SECURITY.md) and [deployment status](docs/DEPLOYMENT.md). Offline tests do not prove AWS security. Existing deployments or modified templates are not protected by these guards.

The repository contains experimental frontend, backend, and AWS reference infrastructure, plus offline tests. The hosting and private-access model remain subject to maintainer selection and independent validation.
