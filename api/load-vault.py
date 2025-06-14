import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Load vault memory from Google Drive
            memory_content = load_vault_memory()
            
            # Return success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                "success": True,
                "memory": memory_content
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

def load_vault_memory():
    """Load all enforcement files from Google Drive vault"""
    
    # Google Drive setup
    google_creds = os.getenv("GOOGLE_CREDENTIALS_JSON")
    if not google_creds:
        raise ValueError("GOOGLE_CREDENTIALS_JSON not found in environment variables")
    
    try:
        creds_dict = json.loads(google_creds)
        creds = service_account.Credentials.from_service_account_info(
            creds_dict, 
            scopes=["https://www.googleapis.com/auth/drive.readonly"]
        )
        drive_service = build("drive", "v3", credentials=creds)
    except Exception as e:
        raise Exception(f"Google Drive setup failed: {e}")
    
    vault_folder_id = "1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM"
    memory_content = "=== SITEMONKEYS ZERO-FAILURE ENFORCEMENT LOADED ===\n\n"
    
    # Files to load from vault
    enforcement_files = [
        "00_EnforcementShell.txt",
        "00_EnforcementShell_Addendum.txt", 
        "00_BEHAVIOR_ENFORCEMENT_DEEP_LAYER.txt",
        "FULL COMPLETE Founder's Directive – Elevated and Executable Form (Exact Instruction Set).txt",
        "Comprehensive Services Offered by a World-Class Full-Service Digital Marketing Agency.txt"
    ]
    
    try:
        # Find VAULT_MEMORY_FILES subfolder
        folder_response = drive_service.files().list(
            q=f"'{vault_folder_id}' in parents and name='VAULT_MEMORY_FILES' and mimeType='application/vnd.google-apps.folder'",
            fields="files(id, name)"
        ).execute()
        
        if not folder_response['files']:
            raise Exception("VAULT_MEMORY_FILES folder not found")
        
        subfolder_id = folder_response['files'][0]['id']
        
        # Load each enforcement file
        for filename in enforcement_files:
            try:
                file_response = drive_service.files().list(
                    q=f"'{subfolder_id}' in parents and name='{filename}'",
                    fields="files(id, name, mimeType)"
                ).execute()
                
                if file_response['files']:
                    file_id = file_response['files'][0]['id']
                    mime_type = file_response['files'][0]['mimeType']
                    
                    # Export based on file type
                    if mime_type == "application/vnd.google-apps.document":
                        request = drive_service.files().export_media(
                            fileId=file_id, 
                            mimeType="text/plain"
                        )
                    else:
                        request = drive_service.files().get_media(fileId=file_id)
                    
                    content = request.execute().decode("utf-8")
                    memory_content += f"\n=== {filename} ===\n{content}\n\n"
                    
                else:
                    memory_content += f"\n=== {filename} ===\nFILE NOT FOUND\n\n"
                    
            except Exception as e:
                memory_content += f"\n=== {filename} ===\nERROR LOADING: {e}\n\n"
        
        return memory_content
        
    except Exception as e:
        raise Exception(f"Vault loading failed: {e}")
