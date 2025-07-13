import json
import os
import requests
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        try:
            print("🧹 Starting KV cache purge...")
            
            kv_url = os.environ.get('KV_REST_API_URL')
            kv_token = os.environ.get('KV_REST_API_TOKEN')
            
            if not kv_url or not kv_token:
                raise Exception("KV environment variables not found")
            
            headers = {
                'Authorization': f'Bearer {kv_token}',
            }
            
            # ✅ DELETE ALL OLD VAULT KEYS (EXPANDED LIST)
            keys_to_delete = [
                'sitemonkeys_vault',
                'sitemonkeys_vault/_master_index', 
                'sitemonkeys_vault/VAULT_MEMORY_FILES/_index',
                'sitemonkeys_vault/00_EnforcementShell/_index',
                'sitemonkeys_vault/01_Core_Directives/_index',
                'sitemonkeys_vault/03_AI_Tuning/_index',
                'sitemonkeys_vault/04_SessionLogs/_index',
                'sitemonkeys_vault/strategy_toolkit',
                'sitemonkeys_vault/execution_flow',
                'sitemonkeys_vault/client_experience',
                'sitemonkeys_vault/offer_enforcement',
                'sitemonkeys_vault/delivery_protocols',
                'sitemonkeys_vault/internal_efficiency',
                # ✅ ADD THE CORRUPTED KEYS WE JUST FOUND
                'vault_data',
                'site_monkeys_vault', 
                'sm_vault',
                'vault',
                # ✅ ADD ANY OTHER POSSIBLE VARIANTS
                'vault_content',
                'sitemonkeys_data',
                'site_monkeys_data',
                'sm_data'
            ]
            
            deleted_count = 0
            errors = []
            
            for key in keys_to_delete:
                try:
                    # ✅ UPSTASH REDIS CORRECT DELETE SYNTAX
                    response = requests.post(
                        f'{kv_url}/del/{key}',
                        headers=headers,
                        timeout=10
                    )
                    
                    print(f"Deleting {key}: {response.status_code}")
                    
                    if response.status_code == 200:
                        deleted_count += 1
                        print(f"✅ Deleted: {key}")
                    else:
                        print(f"⚠️ Could not delete {key}: {response.status_code} - {response.text}")
                        errors.append(f"{key}: HTTP {response.status_code}")
                        
                except Exception as del_error:
                    errors.append(f"{key}: {str(del_error)}")
                    print(f"❌ Error deleting {key}: {del_error}")
            
            print(f"🧹 KV Purge complete: {deleted_count} keys deleted")
            
            response_data = {
                "status": "success",
                "message": "KV cache purged successfully",
                "keys_deleted": deleted_count,
                "total_keys_attempted": len(keys_to_delete),
                "errors": errors,
                "next_step": "Now refresh vault to reload with new structure"
            }
            
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            print(f"❌ KV purge failed: {str(e)}")
            error_response = {
                "status": "error",
                "error": str(e),
                "message": "KV purge failed"
            }
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_POST(self):
        self.do_GET()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
