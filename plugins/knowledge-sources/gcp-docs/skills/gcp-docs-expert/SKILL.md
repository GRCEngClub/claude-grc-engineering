# GCP Docs Expert

Use `gcp-docs` when implementation guidance needs current Google Cloud, Google Workspace, Firebase, Android, Chrome, or related public Google developer documentation.

This is a knowledge-source plugin. It does not emit Findings. It returns citations and grounded answers that other plugins can use in remediation guidance, evidence procedures, and control implementation notes.

Requirements:
- Enable the Google Developer Knowledge API in a Google Cloud project.
- Create an API key restricted to the Developer Knowledge API.
- Set `GOOGLE_DEVELOPER_KNOWLEDGE_API_KEY` or run `/gcp-docs:setup`.

Limits:
- The API is experimental.
- Only public pages in Google's documented corpus are available.
- Returned Markdown is generated from source HTML and can have formatting discrepancies.
