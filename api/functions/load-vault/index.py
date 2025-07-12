#!/usr/bin/env python3
"""
SITE MONKEYS AI - LOAD VAULT FUNCTION
Vercel-compatible Python handler for vault loading operations
CRITICAL MISSING ENDPOINT - REQUIRED FOR FRONTEND
"""

from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import traceback
import time
from datetime import datetime, timezone
from urllib.parse import urlparse, parse_qs
import requests

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests for vault loading and status"""
        try:
            # Parse query parameters
            query = urlparse(self.path).query
            params = parse_qs(query)
            is_refresh = params.get('refresh', ['false'])[0].lower() == 'true'
            
            print(f"🔍 Load vault request - refresh: {is_refresh}")
            
            # Load vault content
            if is_refresh:
                vault_data = refresh_vault_data()
            else:
                vault_data = load_cached_vault_data()
            
            self._send_success_response(vault_data)
            
        except Exception as e:
            print(f"❌ Load vault error: {str(e)}")
            self._send_error_response(str(e), 500)

    def do_POST(self):
        """Handle POST requests (same as GET for compatibility)"""
        self.do_GET()

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self._send_cors_headers()
        self.send_response(200)
        self.end_headers()

    def _send_success_response(self, data):
        """Send standardized success response"""
        self._send_cors_headers()
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        response = {
            "status": data.get("status", "success"),
            "vault_content": data.get("vault_content", ""),
            "tokens": data.get("tokens", 0),
            "estimated_cost": data.get("estimated_cost", "$0.00"),
            "folders_loaded": data.get("folders_loaded", []),
            "needs_refresh": data.get("needs_refresh", False),
            "timestamp": get_timestamp(),
            "message": "Vault loaded successfully"
        }
        
        self.wfile.write(json.dumps(response).encode('utf-8'))

    def _send_error_response(self, error_message, status_code=500):
        """Send standardized error response"""
        self._send_cors_headers()
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        include_traceback = os.environ.get('ENV', 'production') == 'development'
        
        error_response = {
            "status": "error",
            "error": error_message,
            "message": "Vault loading failed",
            "timestamp": get_timestamp(),
            "needs_refresh": True,
            "vault_content": "",
            "tokens": 0,
            "estimated_cost": "$0.00",
            "folders_loaded": [],
            "traceback": traceback.format_exc() if include_traceback and status_code == 500 else None
        }
        
        self.wfile.write(json.dumps(error_response).encode('utf-8'))

    def _send_cors_headers(self):
        """Send CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

def get_timestamp():
    """Get current timestamp in ISO format"""
    return datetime.now(timezone.utc).isoformat()

def load_cached_vault_data():
    """Load vault data from KV storage (cached)"""
    try:
        print("📚 Loading cached vault data...")
        
        kv_url = os.environ.get('KV_REST_API_URL')
        kv_token = os.environ.get('KV_REST_API_TOKEN')
        
        if not kv_url or not kv_token:
            print("⚠️ KV environment variables not found, using fallback")
            return get_fallback_vault_data()
        
        headers = {
            'Authorization': f'Bearer {kv_token}',
            'Content-Type': 'application/json'
        }
        
        # Try to load master index first
        try:
            index_response = requests.get(
                f'{kv_url}/get/sitemonkeys_vault/_master_index',
                headers=headers,
                timeout=10
            )
            
            if index_response.status_code == 200:
                master_index = json.loads(index_response.text)
                print(f"✅ Master index loaded: {master_index.get('total_files', 0)} files")
                
                # Load vault content
                vault_content = load_all_vault_content(kv_url, headers)
                
                return {
                    "status": "success",
                    "vault_content": vault_content,
                    "tokens": estimate_tokens(vault_content),
                    "estimated_cost": estimate_cost(vault_content),
                    "folders_loaded": get_folder_list(kv_url, headers),
                    "needs_refresh": False,
                    "last_updated": master_index.get('migration_date', get_timestamp())
                }
                
        except Exception as index_error:
            print(f"⚠️ Master index not found: {str(index_error)}")
        
        # Fallback: Try to load individual vault content
        vault_content = load_all_vault_content(kv_url, headers)
        
        if vault_content:
            return {
                "status": "success",
                "vault_content": vault_content,
                "tokens": estimate_tokens(vault_content),
                "estimated_cost": estimate_cost(vault_content),
                "folders_loaded": get_folder_list(kv_url, headers),
                "needs_refresh": False
            }
        else:
            return {
                "status": "error",
                "vault_content": "",
                "tokens": 0,
                "estimated_cost": "$0.00",
                "folders_loaded": [],
                "needs_refresh": True,
                "message": "No vault content found in cache"
            }
            
    except Exception as e:
        print(f"❌ Cache load failed: {str(e)}")
        return get_fallback_vault_data()

def refresh_vault_data():
    """Refresh vault data (trigger migration if needed)"""
    try:
        print("🔄 Refreshing vault data...")
        
        # First try to load from cache
        cached_data = load_cached_vault_data()
        
        if cached_data.get("status") == "success" and cached_data.get("vault_content"):
            # Update status to refreshed
            cached_data["status"] = "refreshed"
            cached_data["message"] = "Vault refreshed from cache"
            cached_data["needs_refresh"] = False
            return cached_data
        
        # If no cached data, trigger migration
        print("🚀 No cached data found, triggering migration...")
        
        try:
            # Try to trigger migration via migrate-vault endpoint
            migration_response = requests.get(
                f"https://{os.environ.get('VERCEL_URL', 'localhost')}/api/migrate-vault?migrate=true",
                timeout=30
            )
            
            if migration_response.status_code == 200:
                migration_data = migration_response.json()
                
                if migration_data.get("status") == "migration_complete":
                    # Migration successful, reload data
                    return load_cached_vault_data()
                    
        except Exception as migration_error:
            print(f"⚠️ Migration trigger failed: {str(migration_error)}")
        
        # Final fallback
        return get_fallback_vault_data()
        
    except Exception as e:
        print(f"❌ Refresh failed: {str(e)}")
        return get_fallback_vault_data()

def load_all_vault_content(kv_url, headers):
    """Load all vault content from KV storage"""
    try:
        vault_content = []
        
        # Known folder structure
        folders = [
            "00_EnforcementShell",
            "01_Core_Directives", 
            "02_Legal",
            "03_AI_Tuning",
            "05_Complete_Contractor_Handoff",
            "VAULT_MEMORY_FILES"
        ]
        
        for folder in folders:
            try:
                # Get folder index
                index_response = requests.get(
                    f'{kv_url}/get/sitemonkeys_vault/{folder}/_index',
                    headers=headers,
                    timeout=5
                )
                
                if index_response.status_code == 200:
                    folder_index = json.loads(index_response.text)
                    files = folder_index.get('files', [])
                    
                    for filename in files:
                        try:
                            file_response = requests.get(
                                f'{kv_url}/get/sitemonkeys_vault/{folder}/{filename}',
                                headers=headers,
                                timeout=5
                            )
                            
                            if file_response.status_code == 200:
                                file_data = json.loads(file_response.text)
                                content = file_data.get('content', '')
                                
                                vault_content.append(f"\n=== {folder}/{filename} ===\n{content}\n")
                                
                        except Exception as file_error:
                            print(f"⚠️ Failed to load {folder}/{filename}: {str(file_error)}")
                            
            except Exception as folder_error:
                print(f"⚠️ Failed to load folder {folder}: {str(folder_error)}")
        
        return '\n'.join(vault_content)
        
    except Exception as e:
        print(f"❌ Failed to load vault content: {str(e)}")
        return ""

def get_folder_list(kv_url, headers):
    """Get list of loaded folders"""
    try:
        folders = []
        folder_names = [
            "00_EnforcementShell",
            "01_Core_Directives", 
            "02_Legal",
            "03_AI_Tuning",
            "05_Complete_Contractor_Handoff",
            "VAULT_MEMORY_FILES"
        ]
        
        for folder_name in folder_names:
            try:
                response = requests.get(
                    f'{kv_url}/get/sitemonkeys_vault/{folder_name}/_index',
                    headers=headers,
                    timeout=3
                )
                
                if response.status_code == 200:
                    folders.append(folder_name)
                    
            except:
                continue
        
        return folders
        
    except Exception as e:
        print(f"❌ Failed to get folder list: {str(e)}")
        return []

def estimate_tokens(content):
    """Estimate token count for content"""
    if not content:
        return 0
    return max(1, len(content) // 4)  # Rough estimate: 4 chars per token

def estimate_cost(content):
    """Estimate cost for content"""
    if not content:
        return "$0.00"
    
    tokens = estimate_tokens(content)
    # Rough estimate: $0.002 per 1K tokens
    cost = (tokens / 1000) * 0.002
    return f"${cost:.3f}"

def get_fallback_vault_data():
    """Fallback vault data when everything else fails"""
    return {
        "status": "error",
        "vault_content": "",
        "tokens": 0,
        "estimated_cost": "$0.00", 
        "folders_loaded": [],
        "needs_refresh": True,
        "message": "Vault data unavailable - refresh needed",
        "emergency_mode": True
    }

# Entry point for local testing
if __name__ == "__main__":
    print("🔧 Load vault handler ready for testing")
