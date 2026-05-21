# `/trust-center:add-document`

Add a compliance document to the trust center.

## Steps
1. Ask for document name, description, category, and access level (public/gated)
2. Update `backend/seed_data.py`
3. If deployed, write the record to DynamoDB directly

## Usage
```
/trust-center:add-document --name "SOC 2 Type II" --access gated --category "Audit Reports"
```
