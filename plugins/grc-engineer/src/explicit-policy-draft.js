/** Generate a narrowly scoped draft from an explicitly supplied policy source. */
export function generateExplicitPolicyDraft(spec) {
  const invalid = () => { throw new Error('Invalid policy specification; no policy was generated. See the policy-as-code-generator skill.'); };
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) invalid();
  if (Object.keys(spec).some(key => !['format', 'resource_type', 'required_tag', 'source'].includes(key))) invalid();
  const { format, resource_type: resourceType, required_tag: tag, source } = spec;
  if (format !== 'rego' || resourceType !== 'aws_s3_bucket' ||
      typeof tag !== 'string' || !tag.trim() || tag.length > 128 || /[\u0000-\u001f\u007f]/.test(tag) ||
      !source || typeof source !== 'object' || Array.isArray(source) ||
      Object.keys(source).some(key => !['reference', 'excerpt'].includes(key)) ||
      typeof source.reference !== 'string' || !source.reference.trim() || source.reference.length > 2048 ||
      typeof source.excerpt !== 'string' || !source.excerpt.trim() || source.excerpt.length > 8192) invalid();

  // Only the tag is embedded in code; JSON string escaping also escapes Rego literals.
  const code = `# DRAFT ONLY - do not enforce without independent review and testing.
# Checks only whether a tag key exists on planned aws_s3_bucket resources.
package draft.required_tag

import rego.v1

deny contains msg if {
    some resource in input.resource_changes
    resource.type == "aws_s3_bucket"
    after := object.get(resource.change, "after", null)
    is_object(after)
    tags := object.get(after, "tags", {})
    is_object(tags)
    not object.get(tags, ${JSON.stringify(tag)}, null) != null
    msg := "Required S3 bucket tag is missing"
}
`;
  // Keep untrusted source as JSON data, not executable code or Markdown markup.
  const provenance = JSON.stringify({ reference: source.reference, excerpt: source.excerpt, required_tag: tag }, null, 2);
  return {
    format, code,
    metadata: { status: 'draft', source: { reference: source.reference, excerpt: source.excerpt }, required_tag: tag },
    documentation: `# DRAFT — human review required\n\nThis incomplete example checks only for a non-null tag value on planned aws_s3_bucket resources. It does not validate tag values, determine compliance, verify the supplied source, or infer control mappings. Resources with missing or non-object after/tags data are not evaluated; unknown values, deletes, provider defaults and other resources require separate handling. Do not enforce or treat absence of denials as compliance.\n\nIndependently verify the source and its applicability, confirm the tag and input schema, assess unknown and malformed data, and test representative compliant, noncompliant, and edge-case plans before use.\n\nSource data (JSON-encoded; untrusted):\n\n${provenance.split('\n').map(line => `    ${line}`).join('\n')}\n`
  };
}
