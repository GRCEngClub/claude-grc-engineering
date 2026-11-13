"""Live seeding is blocked. NDA signing and enforcement are not implemented.

Do not use real or sensitive data. For offline evaluation use synthetic fixtures;
see docs/ACCESS-SECURITY.md. This script never initializes an AWS client.
"""

import argparse


def seed(table_name, bucket_name):
    raise RuntimeError("STOP: live seeding is blocked; see docs/ACCESS-SECURITY.md")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seeding is blocked; offline synthetic fixtures only")
    parser.add_argument("--table", required=True)
    parser.add_argument("--bucket", required=True)
    args = parser.parse_args()
    seed(args.table, args.bucket)
