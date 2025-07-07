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
            print("💣 NUCLEAR KV PURGE - Testing actual delete operations...")
            
            kv_url = os.environ.get('KV_REST_API_URL')
            kv_token = os.environ.get('KV_REST_API_TOKEN')
            
            if not kv_url or not kv_token:
                raise Exception("KV environment variables not found")
            
            headers = {
                'Authorization': f'Bearer {kv_token}',
                'Content-Type': 'application/json'
            }
            
            results = {
                "kv_config": {
                    "url": kv_url,
                    "token_present": bool(kv_token)
                },
                "delete_operations": [],
                "verification_checks": [],
                "final_status": {}
            }
            
            # ✅ TEST EACH DELETE OPERATION INDIVIDUALLY
            corrupted_keys = [
                'sitemonkeys_vault',
                'vault_data', 
                'site_monkeys_vault',
                'sm_vault',
                'vault'
            ]
            
            print(f"🎯 Targeting {len(corrupted_keys)} corrupted keys...")
            
            for key in corrupted_keys:
                try:
                    # Check if key exists first
                    check_response = requests.get(f'{kv_url}/get/{key}', headers=headers, timeout=10)
                    exists_before = check_response.status_code == 200 and check_response.text.strip() != 'null'
                    
                    print(f"🔍 Key '{key}' exists before delete: {exists_before}")
                    
                    # Attempt delete
                    delete_response = requests.delete(f'{kv_url}/{key}', headers=headers, timeout=10)
                    print(f"🗑️ Delete '{key}' response: {delete_response.status_code}")
                    
                    # Alternative delete method
                    if delete_response.status_code != 200:
                        delete_response2 = requests.post(f'{kv_url}/del/{key}', headers=headers, timeout=10)
                        print(f"🗑️ Alternative delete '{key}' response: {delete_response2.status_code}")
                    
                    # Verify deletion
                    verify_response = requests.get(f'{kv_url}/get/{key}', headers=headers, timeout=10)
                    exists_after = verify_response.status_code == 200 and verify_response.text.strip() != 'null'
                    
                    print(f"✅ Key '{key}' exists after delete: {exists_after}")
                    
                    operation_result = {
                        "key": key,
                        "existed_before": exists_before,
                        "delete_status": delete_response.status_code,
                        "delete_response": delete_response.text[:100],
                        "exists_after": exists_after,
                        "delete_successful": exists_before and not exists_after
                    }
                    
                    results["delete_operations"].append(operation_result)
                    
                except Exception as delete_error:
                    print(f"❌ Error deleting {key}: {delete_error}")
                    results["delete_operations"].append({
                        "key": key,
                        "error": str(delete_error),
                        "delete_successful": False
                    })
            
            # ✅ FINAL VERIFICATION - CHECK ALL KEYS AGAIN
            print("🔍 Final verification of all keys...")
            for key in corrupted_keys:
                try:
                    final_check = requests.get(f'{kv_url}/get/{key}', headers=headers, timeout=5)
                    still_exists = final_check.status_code == 200 and final_check.text.strip() != 'null'
                    
                    results["verification_checks"].append({
                        "key": key,
                        "still_exists": still_exists,
                        "content": final_check.text[:50] if still_exists else None
                    })
                    
                except Exception as verify_error:
                    results["verification_checks"].append({
                        "key": key,
                        "error": str(verify_error)
                    })
            
            # ✅ SUMMARY
            successful_deletes = sum(1 for op in results["delete_operations"] if op.get("delete_successful"))
            remaining_keys = sum(1 for check in results["verification_checks"] if check.get("still_exists"))
            
            results["final_status"] = {
                "total_delete_attempts": len(corrupted_keys),
                "successful_deletes": successful_deletes,
                "remaining_corrupted_keys": remaining_keys,
                "purge_effective": remaining_keys == 0,
                "next_action": "Force fresh vault load" if remaining_keys == 0 else "KV API issue - manual intervention required"
            }
            
            print(f"💣 Nuclear purge complete: {successful_deletes}/{len(corrupted_keys)} deleted, {remaining_keys} remain")
            
            self.wfile.write(json.dumps(results, indent=2).encode())
            
        except Exception as e:
            print(f"❌ Nuclear purge failed: {str(e)}")
            error_response = {
                "status": "error",
                "error": str(e),
                "message": "Nuclear KV purge failed"
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
