---
name: data-residency
description: Verify Canadian data residency requirements for Protected B
---

# Canadian Data Residency Verification

Verifies that all Protected B data resides exclusively in Canadian geographic regions as required by PBMM and Government of Canada policies.

## Arguments

- Argument 1 - Cloud provider (optional: aws, azure, gcp, all) - defaults to "all"
- Argument 2 - Verification mode (optional: check, remediate) - defaults to "check"

## Canadian Data Residency Requirement

**Policy**: All Protected B data must be stored, processed, and backed up exclusively within Canadian geographic boundaries.

**Authority**:

- ITSG-33 security controls
- Treasury Board Secretariat cloud adoption strategy
- PBMM-DATA-1 control requirement
- Privacy Act (Canada)
- Provincial privacy legislation

## Approved Canadian Regions

### AWS Canada

**Primary Regions**:

- **ca-central-1**: Canada (Montreal), Quebec
- **ca-west-1**: Canada West (Calgary), Alberta

**Services Verified**:

- Compute: EC2, Lambda, ECS, EKS
- Storage: S3, EBS, EFS
- Databases: RDS, DynamoDB, Aurora
- Networking: VPC, CloudFront (with restrictions)

**Prohibited Regions**: All non-Canadian regions

**Edge Services**:

- **CloudFront**: Must use only Canadian edge locations (configure distribution restrictions)
- **Route 53**: Canadian regions for hosted zones

### Azure Canada

**Primary Regions**:

- **canadacentral**: Canada Central (Toronto), Ontario
- **canadaeast**: Canada East (Quebec City), Quebec

**Services Verified**:

- Compute: Virtual Machines, App Service, AKS
- Storage: Blob Storage, File Storage, Managed Disks
- Databases: SQL Database, Cosmos DB, PostgreSQL
- Networking: Virtual Networks, Application Gateway

**Prohibited Regions**: All non-Canadian regions

**Global Services**:

- **Entra ID**: Tenant data must be in Canadian data centers
- **Traffic Manager**: Configure Canadian endpoints only

### Google Cloud Platform Canada

**Primary Regions**:

- **northamerica-northeast1**: Montreal, Quebec
- **northamerica-northeast2**: Toronto, Ontario

**Services Verified**:

- Compute: Compute Engine, Cloud Run, GKE
- Storage: Cloud Storage, Persistent Disks
- Databases: Cloud SQL, Firestore, Spanner
- Networking: VPC, Cloud Load Balancing

**Prohibited Regions**: All non-Canadian regions

**Global Services**:

- **Cloud CDN**: Configure Canadian-only cache locations

## Verification Commands

### AWS Verification

**S3 Bucket Locations**:

```bash
# List all buckets with locations
for bucket in $(aws s3api list-buckets --query 'Buckets[*].Name' --output text); do
  location=$(aws s3api get-bucket-location --bucket "$bucket" --query 'LocationConstraint' --output text)
  if [[ "$location" == "ca-central-1" ]] || [[ "$location" == "ca-west-1" ]] || [[ "$location" == "null" && "$AWS_DEFAULT_REGION" =~ ^ca- ]]; then
    echo "PASS: $bucket -> $location"
  else
    echo "FAIL: $bucket -> $location (NOT Canadian)"
  fi
done
```

**EC2 Instance Locations**:

```bash
# Check all EC2 instances
aws ec2 describe-instances \
  --query 'Reservations[*].Instances[*].{Id:InstanceId,AZ:Placement.AvailabilityZone,State:State.Name}' \
  --output table

# Verify only Canadian availability zones (ca-central-1*, ca-west-1*)
```

**RDS Database Locations**:

```bash
# Check all RDS instances
aws rds describe-db-instances \
  --query 'DBInstances[*].{Id:DBInstanceIdentifier,AZ:AvailabilityZone,MultiAZ:MultiAZ}' \
  --output table

# Ensure all in ca-central-1 or ca-west-1
```

**EBS Snapshots**:

```bash
# Check snapshot locations (must be in Canadian regions)
aws ec2 describe-snapshots --owner-ids self \
  --query 'Snapshots[*].{SnapshotId:SnapshotId,VolumeId:VolumeId}' \
  --output table
```

### Azure Verification

**All Resources**:

```bash
# List all resources with locations
az resource list \
  --query '[].{Name:name,Location:location,Type:type}' \
  --output table

# Filter non-Canadian resources
az resource list \
  --query "[?location!='canadacentral' && location!='canadaeast'].{Name:name,Location:location,Type:type}" \
  --output table
```

**Storage Accounts**:

```bash
# Check storage account locations
az storage account list \
  --query '[].{Name:name,Location:location,Kind:kind}' \
  --output table

# Should only show: canadacentral or canadaeast
```

**Virtual Machines**:

```bash
# Check VM locations
az vm list \
  --query '[].{Name:name,Location:location,ResourceGroup:resourceGroup}' \
  --output table
```

### GCP Verification

**Cloud Storage Buckets**:

```bash
# List all buckets with locations
gcloud storage buckets list --format='table(name,location,locationType)'

# Verify: northamerica-northeast1 or northamerica-northeast2
```

**Compute Instances**:

```bash
# List all instances with zones
gcloud compute instances list \
  --format='table(name,zone,status)'

# Verify zones: northamerica-northeast1-* or northamerica-northeast2-*
```

**Cloud SQL Instances**:

```bash
# Check database locations
gcloud sql instances list \
  --format='table(name,region,databaseVersion)'

# Verify regions: northamerica-northeast1 or northamerica-northeast2
```

## Common Violations and Remediation

### Violation 1: Non-Canadian S3 Buckets

**Finding**: S3 bucket in us-east-1

```
FAIL: my-bucket -> us-east-1 (NOT Canadian)
```

**Remediation**:

1. Create new bucket in ca-central-1
2. Use S3 replication or copy objects
3. Update application to use new bucket
4. Delete original bucket after migration
5. Update DNS/CDN configuration

```bash
# Create Canadian bucket
aws s3 mb s3://my-bucket-ca --region ca-central-1

# Copy data
aws s3 sync s3://my-bucket s3://my-bucket-ca --region ca-central-1

# Update application configuration
# Delete old bucket after verification
```

### Violation 2: EC2 Instance in US Region

**Finding**: EC2 instance in us-west-2

```
Instance i-1234567890 in us-west-2a
```

**Remediation**:

1. Create AMI snapshot
2. Copy AMI to ca-central-1
3. Launch new instance in Canadian region
4. Migrate data and traffic
5. Terminate US instance

```bash
# Create AMI
ami_id=$(aws ec2 create-image --instance-id i-1234567890 --name "Migration-AMI")

# Copy to Canadian region
aws ec2 copy-image \
  --source-region us-west-2 \
  --source-image-id $ami_id \
  --region ca-central-1 \
  --name "Canadian-AMI"

# Launch in ca-central-1
aws ec2 run-instances \
  --image-id $canadian_ami_id \
  --instance-type t3.medium \
  --region ca-central-1 \
  --subnet-id subnet-canadian-vpc
```

### Violation 3: Azure Resource in US Region

**Finding**: Storage account in eastus

```
my-storage | eastus | StorageV2
```

**Remediation**:

1. Create new storage account in canadacentral
2. Use AzCopy to migrate data
3. Update application connection strings
4. Delete US storage account

```bash
# Create Canadian storage account
az storage account create \
  --name mystoragecanada \
  --location canadacentral \
  --resource-group myResourceGroup

# Migrate data with AzCopy
azcopy sync \
  "https://mystorage.blob.core.windows.net" \
  "https://mystoragecanada.blob.core.windows.net"
```

## Cross-Border Data Transfer Restrictions

**Prohibited Activities**:

- Replication to non-Canadian regions
- Backup storage outside Canada
- Content delivery network (CDN) caching outside Canada
- Database read replicas in non-Canadian regions
- Disaster recovery sites outside Canada

**Permitted with Controls**:

- Encrypted transient network traffic through non-Canadian networks (TLS 1.2+)
- Management traffic to cloud provider control planes (encrypted)
- Monitoring and logging data (if encrypted and contractually protected)

## Compliance Verification Matrix

| Resource Type | Location Check | Backup Check | Replication Check |
|---------------|---------------|--------------|-------------------|
| **S3/Blob Storage** | ✅ ca-central-1, canadacentral | ✅ Canadian regions only | ❌ No cross-border replication |
| **EC2/VMs** | ✅ ca-* / canadacentral/east | ✅ Snapshots in CA | ❌ No cross-region AMIs |
| **RDS/SQL** | ✅ Canadian AZs | ✅ Automated backups in CA | ❌ No read replicas outside CA |
| **Load Balancers** | ✅ Canadian regions | N/A | ✅ Multi-AZ within CA OK |
| **CDN** | ⚠️ Canadian edge only | N/A | ❌ No global distribution |

## Automated Enforcement

### AWS Service Control Policy (SCP)

Prevent non-Canadian region usage:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Deny",
    "Action": "*",
    "Resource": "*",
    "Condition": {
      "StringNotEquals": {
        "aws:RequestedRegion": [
          "ca-central-1",
          "ca-west-1"
        ]
      }
    }
  }]
}
```

### Azure Policy

Restrict resource deployment to Canadian regions:

```json
{
  "properties": {
    "policyRule": {
      "if": {
        "not": {
          "field": "location",
          "in": ["canadacentral", "canadaeast"]
        }
      },
      "then": {
        "effect": "deny"
      }
    }
  }
}
```

### GCP Organization Policy

Restrict resource locations:

```yaml
name: organizations/ORGANIZATION_ID/policies/gcp.resourceLocations
spec:
  rules:
    - values:
        allowedValues:
          - in:northamerica-northeast1-locations
          - in:northamerica-northeast2-locations
```

## Examples

```bash
# Verify all cloud providers
/pbmm:data-residency all check

# Check AWS only
/pbmm:data-residency aws check

# Remediation mode for Azure
/pbmm:data-residency azure remediate

# GCP verification
/pbmm:data-residency gcp check
```

## Audit Evidence

For CCCS assessment, maintain:

- Monthly residency verification reports
- Configuration screenshots showing Canadian regions
- Service Control Policies or equivalent
- Incident logs (if violations occurred)
- Remediation documentation

## Key Requirements

- **100% Canadian Storage**: All data at rest in Canadian regions
- **No Cross-Border Replication**: Backups and replicas in Canada only
- **CDN Restrictions**: Canadian edge locations only for content delivery
- **Encrypted Transit OK**: Transient traffic through non-CA networks if encrypted
- **Continuous Verification**: Monthly residency checks required
