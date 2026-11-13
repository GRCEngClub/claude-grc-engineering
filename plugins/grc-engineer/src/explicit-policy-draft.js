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

# Only well-formed changes with known tag data can produce denials.
target(resource) if {
    resource.mode == "managed"
    resource.type == "aws_s3_bucket"
}

valid_actions(actions) if {
    actions in [["no-op"], ["create"], ["update"], ["delete"], ["delete", "create"], ["create", "delete"]]
}

deleted(resource) if { resource.change.actions == ["delete"] }

valid_unknown(u) if { u == true }
valid_unknown(u) if { u == false }
valid_unknown(u) if {
    is_object(u)
    marker := object.get(u, "tags", false)
    is_boolean(marker)
}
valid_unknown(u) if {
    is_object(u)
    marker := object.get(u, "tags", false)
    is_object(marker)
    is_boolean(object.get(marker, ${JSON.stringify(tag)}, false))
}

unknown_tag(u) if { u == true }
unknown_tag(u) if { is_object(u); object.get(u, "tags", false) == true }
unknown_tag(u) if {
    is_object(u)
    marker := object.get(u, "tags", false)
    is_object(marker)
    object.get(marker, ${JSON.stringify(tag)}, false) == true
}

ready(resource) if {
    change := object.get(resource, "change", null)
    is_object(change)
    valid_actions(object.get(change, "actions", null))
    not deleted(resource)
    after := object.get(change, "after", null)
    is_object(after)
    tags := object.get(after, "tags", null)
    is_object(tags)
    unknown := object.get(change, "after_unknown", null)
    valid_unknown(unknown)
    not unknown_tag(unknown)
    value := object.get(tags, ${JSON.stringify(tag)}, null)
    value == null
}
ready(resource) if {
    change := object.get(resource, "change", null)
    is_object(change)
    valid_actions(object.get(change, "actions", null))
    not deleted(resource)
    after := object.get(change, "after", null)
    is_object(after)
    tags := object.get(after, "tags", null)
    is_object(tags)
    unknown := object.get(change, "after_unknown", null)
    valid_unknown(unknown)
    not unknown_tag(unknown)
    is_string(object.get(tags, ${JSON.stringify(tag)}, null))
}

deny contains msg if {
    is_array(input.resource_changes)
    some resource in input.resource_changes
    target(resource)
    ready(resource)
    object.get(resource.change.after.tags, ${JSON.stringify(tag)}, null) == null
    msg := sprintf("Required S3 bucket tag is missing: %v", [object.get(resource, "address", "<unknown address>")])
}

# Consumers must evaluate warnings independently of deny.
warning contains "Indeterminate: input must be an object" if {
    not is_object(input)
}
warning contains "Indeterminate: resource_changes must be an array" if {
    is_object(input)
    not is_array(object.get(input, "resource_changes", null))
}
warning contains "Indeterminate: resource change entry lacks a valid mode or type" if {
    is_array(input.resource_changes)
    some resource in input.resource_changes
    not valid_identity(resource)
}
valid_identity(resource) if {
    is_object(resource)
    object.get(resource, "mode", null) in ["managed", "data"]
    type := object.get(resource, "type", null)
    is_string(type)
    trim_space(type) != ""
}
warning contains msg if {
    is_array(input.resource_changes)
    some resource in input.resource_changes
    target(resource)
    not deleted(resource)
    not ready(resource)
    msg := sprintf("Indeterminate tag data or change: %v", [object.get(resource, "address", "<unknown address>")])
}

`;
  // Standalone starter tests exercise both decisions; they do not certify coverage.
  // Tag is encoded as a Rego string literal, never interpolated as source.
  const testCode = `# DRAFT starter tests — expand and independently review before use.
package draft.required_tag

import rego.v1

example(tags, unknown) := {"resource_changes": [{
    "mode": "managed", "type": "aws_s3_bucket", "address": "aws_s3_bucket.example",
    "change": {"actions": ["create"], "after": {"tags": tags}, "after_unknown": unknown}
}]}

test_missing_tag_denied if {
    count(deny) == 1 with input as example({}, {})
    count(warning) == 0 with input as example({}, {})
}

test_present_tag_not_denied if {
    count(deny) == 0 with input as example({${JSON.stringify(tag)}: "example"}, {})
    count(warning) == 0 with input as example({${JSON.stringify(tag)}: "example"}, {})
}

test_unknown_tag_warns if {
    count(deny) == 0 with input as example({}, {"tags": true})
    count(warning) == 1 with input as example({}, {"tags": true})
}
`;
  // Keep untrusted source as JSON data, not executable code or Markdown markup.
  const provenance = JSON.stringify({ reference: source.reference, excerpt: source.excerpt, required_tag: tag }, null, 2);
  return {
    format, code, testCode,
    metadata: { status: 'draft', source: { reference: source.reference, excerpt: source.excerpt }, required_tag: tag },
    documentation: `# DRAFT — human review required\n\nThis incomplete example checks only for a non-null tag value on planned managed aws_s3_bucket resources; data sources are excluded. It does not validate tag values, determine compliance, verify the supplied source, or infer control mappings. The separate warning set reports non-object input, invalid resource_changes, invalid resource identity, and indeterminate change/tag data; inspect both deny and warning. Pure deletions are excluded, while replacements are evaluated. Provider defaults and other resources require separate handling. Do not enforce or treat absence of denials as compliance.\n\nIndependently verify the source and its applicability, confirm the tag and input schema, assess unknown and malformed data, and test representative compliant, noncompliant, and edge-case plans before use.\n\nSource data (JSON-encoded; untrusted):\n\n${provenance.split('\n').map(line => `    ${line}`).join('\n')}\n`
  };
}
