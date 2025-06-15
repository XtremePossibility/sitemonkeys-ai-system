import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Load minimal core intelligence only
            memory_content = load_minimal_core()
            
            # Return success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                "success": True,
                "memory": memory_content,
                "vault_loaded": True,
                "token_estimate": len(memory_content.split()) * 1.3
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            # Return error response
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                "success": False,
                "error": str(e)
            }
            
            self.wfile.write(json.dumps(response).encode())

def load_minimal_core():
    """Load complete SiteMonkeys business intelligence - FULL VAULT ACCESS"""
    
    # Google Drive setup
    google_creds = os.getenv("GOOGLE_CREDENTIALS_JSON")
    if not google_creds:
        return "=== ERROR: GOOGLE_CREDENTIALS_JSON not found ==="
    
    try:
        creds_dict = json.loads(google_creds)
        creds = service_account.Credentials.from_service_account_info(
            creds_dict, 
            scopes=["https://www.googleapis.com/auth/drive.readonly"]
        )
        drive_service = build("drive", "v3", credentials=creds)
    except Exception as e:
        return f"=== ERROR: Google Drive setup failed: {e} ==="
    
    vault_folder_id = "1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM"
    memory_content = "=== COMPLETE SITEMONKEYS VAULT LOADED ===\n\n"
    memory_content += "📂 VAULT FILES SUCCESSFULLY LOADED:\n"
    
    try:
        # Load from VAULT_MEMORY_FILES
        memory_content += load_vault_memory_files(drive_service, vault_folder_id)
        
        # Load from 01_Core_Directives  
        memory_content += load_core_directives_files(drive_service, vault_folder_id)
        
        # Load from 02_Legal (key files)
        memory_content += load_legal_files(drive_service, vault_folder_id)
        
        memory_content += "\n=== ADDITIONAL VAULT RESOURCES AVAILABLE ===\n"
        memory_content += "- Contractor Handoff Materials (05_Complete Contractor Handoff)\n"
        memory_content += "- AI Tuning Protocols (03_AI_Tuning)\n"
        memory_content += "- Session Logging (04_SessionLogs)\n"
        memory_content += "- Auto-Reply Templates (06_AutoReplyTemplates)\n\n"
        
        return memory_content
        
    except Exception as e:
        return f"=== ERROR: Vault loading failed: {e} ==="
