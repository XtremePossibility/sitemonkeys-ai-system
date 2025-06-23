import json
import os
from http.server import BaseHTTPRequestHandler
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

# Your exact Google Drive folder ID
VAULT_FOLDER_ID = "1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM"

def get_google_drive_service():
    """Initialize Google Drive service with credentials"""
    try:
        # Get credentials from environment variable
        creds_json = os.environ.get('GOOGLE_CREDENTIALS_JSON')
        if not creds_json:
            raise Exception("GOOGLE_CREDENTIALS_JSON environment variable not found")
        
        # Parse credentials
        creds_info = json.loads(creds_json)
        creds = Credentials.from_service_account_info(
            creds_info,
            scopes=['https://www.googleapis.com/auth/drive.readonly']
        )
        
        # Build and return service
        return build('drive', 'v3', credentials=creds)
    except Exception as e:
        raise Exception(f"Google Drive authentication failed: {str(e)}")

def load_vault_content():
    """Load all content from SiteMonkeys vault folders"""
    vault_content = "=== SITEMONKEYS BUSINESS VALIDATION VAULT ===\n\n"
    loaded_folders = []
    total_files = 0
    
    try:
        service = get_google_drive_service()
        
        # Get subfolders in vault
        query = f"'{VAULT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder'"
        folders_result = service.files().list(q=query, fields="files(id, name)").execute()
        folders = folders_result.get('files', [])
        
        vault_content += f"\n=== LIVE VAULT FOLDERS LOADED ({len(folders)} folders) ===\n"
        
        for folder in folders:
            loaded_folders.append(folder['name'])
            vault_content += f"\n--- FOLDER: {folder['name']} ---\n"
            
            # Get files in each folder
            file_query = f"'{folder['id']}' in parents and mimeType!='application/vnd.google-apps.folder'"
            files_result = service.files().list(q=file_query, fields="files(id, name, mimeType)").execute()
            files = files_result.get('files', [])
            
            total_files += len(files)
            
            for file in files:
                try:
                    # Download file content
                    if 'text' in file.get('mimeType', '') or file['name'].endswith('.txt'):
                        file_content = service.files().get_media(fileId=file['id']).execute()
                        content = file_content.decode('utf-8')
                        vault_content += f"\n=== {file['name']} ===\n{content}\n"
                    elif file.get('mimeType') == 'application/vnd.google-apps.document':
                        # Export Google Doc as plain text
                        export_content = service.files().export(fileId=file['id'], mimeType='text/plain').execute()
                        content = export_content.decode('utf-8')
                        vault_content += f"\n=== {file['name']} ===\n{content}\n"
                    elif file['name'].endswith('.docx') or 'word' in file.get('mimeType', '').lower():
                        # Handle .docx files by exporting as plain text
                        try:
                            export_content = service.files().export(fileId=file['id'], mimeType='text/plain').execute()
                            content = export_content.decode('utf-8')
                            vault_content += f"\n=== {file['name']} ===\n{content}\n"
                        except:
                            # If export fails, try downloading directly
                            file_content = service.files().get_media(fileId=file['id']).execute()
                            vault_content += f"\n=== {file['name']} ===\n[DOCX file - {len(file_content)} bytes loaded]\n"
                    else:
                        vault_content += f"\n[SKIPPED: {file['name']} - unsupported format: {file.get('mimeType', 'unknown')}]\n"
                except Exception as file_error:
                    vault_content += f"\n[ERROR loading {file['name']}: {str(file_error)}]\n"
        
        vault_content += f"\n=== VAULT SUMMARY ===\nFolders: {len(folders)}\nFiles processed: {total_files}\n"
                    
    except Exception as drive_error:
        vault_content += f"\n[Google Drive connection error: {str(drive_error)}]\n"
        # Fallback to basic intelligence
        vault_content += """
=== FALLBACK BUSINESS INTELLIGENCE ===

FINANCIAL CONSTRAINTS:
- Launch Budget: $15,000 total available
- Monthly Burn Rate: $3,000 maximum
- Profit Margins: Target 87% on core services

PRICING TIERS:
1. Boost Package: $697 (Basic website + essentials)
2. Climb Package: $1,497 (Full business setup)
3. Lead Package: $2,997 (Complete system + support)

ZERO-FAILURE PROTOCOLS:
- All deliverables must be tested before client delivery
- Client satisfaction guarantee with revision process
"""
        loaded_folders = ["Fallback Intelligence"]
        total_files = 1
    
    return vault_content, loaded_folders, total_files

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        try:
            # Load vault content
            vault_memory, loaded_folders, total_files = load_vault_content()
            
            # Calculate tokens (rough estimate)
            token_count = len(vault_memory) // 4
            estimated_cost = (token_count * 0.002) / 1000
            
            # Return JSON response
            response = {
                "status": "OPERATIONAL",
                "vault_content": vault_memory,
                "tokens": token_count,
                "estimated_cost": f"${estimated_cost:.4f}",
                "folders_loaded": loaded_folders,
                "total_files": total_files,
                "message": f"SiteMonkeys Vault: {len(loaded_folders)} folders, {total_files} files loaded"
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            error_response = {
                "status": "ERROR",
                "error": str(e),
                "fallback_mode": True,
                "message": "Using cached business intelligence"
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
