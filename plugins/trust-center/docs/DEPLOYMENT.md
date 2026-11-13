# Trust Center — deployment blocked

**STOP: Do not deploy this prototype or use it for sensitive data.** Deployment scripts and the reference CloudFormation templates intentionally reject deployment. Do not bypass these guards. They cannot protect an independently modified or previously deployed copy.

The hosting and private-access model has not been selected, gateway route selection and identity trust boundaries have not been validated in AWS, and the public proxy is unauthenticated. NDA enforcement and the requester UI are not implemented; revocation has known gaps. See [ACCESS-SECURITY.md](ACCESS-SECURITY.md) for the full blockers and required verification. Offline tests are not deployment or security validation. Only offline evaluation with synthetic data is appropriate.
