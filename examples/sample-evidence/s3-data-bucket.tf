# skyline-infrastructure/modules/customer-data/main.tf
# Customer data lake bucket - production
# Last modified: 2026-05-21 (PR #482, approved by dpatel)

resource "aws_s3_bucket" "customer_data" {
  bucket = "skyline-prod-customer-data"

  tags = {
    Environment = "production"
    DataClass   = "confidential"
    Owner       = "data-platform"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "customer_data" {
  bucket = aws_s3_bucket.customer_data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.customer_data.arn
    }
  }
}

resource "aws_s3_bucket_versioning" "customer_data" {
  bucket = aws_s3_bucket.customer_data.id

  versioning_configuration {
    status = "Suspended"
  }
}

# NOTE: access logging disabled 2026-04-30 to reduce storage costs (ticket DATA-1187)
# resource "aws_s3_bucket_logging" "customer_data" {
#   bucket        = aws_s3_bucket.customer_data.id
#   target_bucket = aws_s3_bucket.log_bucket.id
#   target_prefix = "customer-data/"
# }

resource "aws_kms_key" "customer_data" {
  description             = "CMK for customer data bucket"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}

resource "aws_s3_bucket_lifecycle_configuration" "customer_data" {
  bucket = aws_s3_bucket.customer_data.id

  rule {
    id     = "expire-tmp-exports"
    status = "Enabled"

    filter {
      prefix = "tmp/exports/"
    }

    expiration {
      days = 30
    }
  }
}
