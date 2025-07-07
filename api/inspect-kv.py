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
            print("🔍 Inspecting KV contents...")
            
            kv_url = os.environ.get('KV_REST_API_URL')
            kv_token = os.environ.get('KV_REST_API_TOKEN')
            
            if not kv_url or not kv_token:
                raise Exception("KV environment variables not found")
            
            headers = {
                'Authorization': f'Bearer {kv_token}',
            }
            
            # ✅ CHECK MAIN VAULT KEY
            vault_response = requests.get(
                f'{kv_url}/get/sitemonkeys_vault',
                headers=headers,
                timeout=10
            )
            
            print(f"Main vault key status: {vault_response.status_code}")
            
            vault_data = None
            if vault_response.status_code == 200:
                vault_text = vault_response.text.strip()
                print(f"Vault response length: {len(vault_text)}")
                print(f"Vault response preview: {vault_text[:200]}...")
                
                if vault_text and vault_text != 'null':
                    try:
                        vault_data = json.loads(vault_text)
                        vault_content_length = len(vault_data.get('vault_content', '')) if 'vault_content' in vault_data else 0
                        print(f"Vault content length: {vault_content_length}")
                        print(f"Vault data keys: {list(vault_data.keys())}")
                    except json.JSONDecodeError as e:
                        print(f"JSON parse error: {e}")
                        vault_data = {"error": "JSON parse failed", "raw_content": vault_text[:500]}
            
            # ✅ CHECK FOR OTHER POSSIBLE KEYS
            possible_keys = [
                'sitemonkeys_vault/_master_index',
                'vault_data',
                'site_monkeys_vault',
                'sm_vault',
                'vault'
            ]
            
            other_keys = {}
            for key in possible_keys:
                try:
                    response = requests.get(f'{kv_url}/get/{key}', headers=headers, timeout=5)
                    if response.status_code == 200 and response.text.strip() != 'null':
                        other_keys[key] = {
                            "status": response.status_code,
                            "length": len(response.text),
                            "preview": response.text[:100]
                        }
                        print(f"Found additional key: {key}")
                except Exception as e:
                    print(f"Error checking {key}: {e}")
            
            response_data = {
                "status": "success",
                "main_vault_key": {
                    "exists": vault_response.status_code == 200,
                    "status_code": vault_response.status_code,
                    "content_length": len(vault_response.text) if vault_response.status_code == 200 else 0,
                    "vault_content_size": len(vault_data.get('vault_content', '')) if vault_data and 'vault_content' in vault_data else 0,
                    "vault_data_keys": list(vault_data.keys()) if vault_data else [],
                    "preview": vault_response.text[:300] if vault_response.status_code == 200 else None
                },
                "other_keys_found": other_keys,
                "total_keys_checked": len(possible_keys) + 1,
                "analysis": {
                    "problem_detected": vault_response.status_code == 200 and (not vault_data or not vault_data.get('vault_content')),
                    "purge_effective": vault_response.status_code != 200,
                    "needs_fresh_load": True
                }
            }
            
            self.wfile.write(json.dumps(response_data, indent=2).encode())
            
        except Exception as e:
            print(f"❌ KV inspection failed: {str(e)}")
            error_response = {
                "status": "error",
                "error": str(e),
                "message": "KV inspection failed"
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
