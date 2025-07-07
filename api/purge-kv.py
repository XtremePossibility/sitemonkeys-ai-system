# Manual KV Purge Commands
# Run these in your terminal with your KV credentials

# Replace these with your actual values:
KV_URL="your_kv_rest_api_url"
KV_TOKEN="your_kv_rest_api_token"

# Delete old vault keys
curl -X POST "$KV_URL/del/sitemonkeys_vault" \
  -H "Authorization: Bearer $KV_TOKEN"

curl -X POST "$KV_URL/del/sitemonkeys_vault/_master_index" \
  -H "Authorization: Bearer $KV_TOKEN"

curl -X POST "$KV_URL/del/sitemonkeys_vault/VAULT_MEMORY_FILES/_index" \
  -H "Authorization: Bearer $KV_TOKEN"

curl -X POST "$KV_URL/del/sitemonkeys_vault/strategy_toolkit" \
  -H "Authorization: Bearer $KV_TOKEN"

curl -X POST "$KV_URL/del/sitemonkeys_vault/execution_flow" \
  -H "Authorization: Bearer $KV_TOKEN"

curl -X POST "$KV_URL/del/sitemonkeys_vault/client_experience" \
  -H "Authorization: Bearer $KV_TOKEN"

curl -X POST "$KV_URL/del/sitemonkeys_vault/offer_enforcement" \
  -H "Authorization: Bearer $KV_TOKEN"

curl -X POST "$KV_URL/del/sitemonkeys_vault/delivery_protocols" \
  -H "Authorization: Bearer $KV_TOKEN"

curl -X POST "$KV_URL/del/sitemonkeys_vault/internal_efficiency" \
  -H "Authorization: Bearer $KV_TOKEN"

echo "KV purge complete"
