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
    """Load all enforcement files from Google Drive vault with correct structure"""
    
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
    
    # Main vault folder ID
    vault_folder_id = "1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM"
    memory_content = "=== SITEMONKEYS ZERO-FAILURE ENFORCEMENT LOADED ===\n\n"
    
    try:
        # Load from 00_EnforcementShell.txt/Memory Files/
        memory_content += load_enforcement_shell_files(drive_service, vault_folder_id)
        
        # Load from 01_Core_Directives/
        memory_content += load_core_directives_files(drive_service, vault_folder_id)
        
        return memory_content
        
    except Exception as e:
        raise Exception(f"Vault loading failed: {e}")

def load_enforcement_shell_files(drive_service, vault_folder_id):
    """Load files from 00_EnforcementShell.txt/Memory Files/"""
    content = "=== ENFORCEMENT SHELL FILES ===\n\n"
    
    try:
        # Find 00_EnforcementShell.txt folder
        folder_response = drive_service.files().list(
            q=f"'{vault_folder_id}' in parents and name='00_EnforcementShell.txt' and mimeType='application/vnd.google-apps.folder'",
            fields="files(id, name)"
        ).execute()
        
        if not folder_response['files']:
            return content + "00_EnforcementShell.txt folder not found\n\n"
        
        enforcement_folder_id = folder_response['files'][0]['id']
        
        # Find Memory Files subfolder
        memory_folder_response = drive_service.files().list(
            q=f"'{enforcement_folder_id}' in parents and name='Memory Files' and mimeType='application/vnd.google-apps.folder'",
            fields="files(id, name)"
        ).execute()
        
        if not memory_folder_response['files']:
            return content + "Memory Files subfolder not found\n\n"
        
        memory_folder_id = memory_folder_response['files'][0]['id']
        
        # Files to load from Memory Files
        memory_files = [
            "BEHAVIOR_ENFORCEMENT.txt",
            "EnforcementShell.txt", 
            "EnforcementShell_Addendum.txt",
            "Founder's Directive_Elevated.txt",
            "Pricing_Billing_Monetization.txt"
        ]
        
        for filename in memory_files:
            content += load_single_file(drive_service, memory_folder_id, filename)
        
        return content
        
    except Exception as e:
        return content + f"Error loading enforcement shell files: {e}\n\n"

def load_core_directives_files(drive_service, vault_folder_id):
    """Load files from 01_Core_Directives/"""
    content = "=== CORE DIRECTIVES FILES ===\n\n"
    
    try:
        # Find 01_Core_Directives folder
        folder_response = drive_service.files().list(
            q=f"'{vault_folder_id}' in parents and name='01_Core_Directives' and mimeType='application/vnd.google-apps.folder'",
            fields="files(id, name)"
        ).execute()
        
        if not folder_response['files']:
            return content + "01_Core_Directives folder not found\n\n"
        
        core_folder_id = folder_response['files'][0]['id']
        
        # Files to load from Core Directives
        core_files = [
            "Comprehensive Services Full-Service Agency.txt",
            "Final checklist_Site Monkeys.txt",
            "Founders_Directive.txt",
            "Implementation_Roadmap.txt", 
            "Pricing_Billing_Monetization.txt",
            "Services_Offered.txt",
            "Quick_Launch.txt"
        ]
        
        for filename in core_files:
            content += load_single_file(drive_service, core_folder_id, filename)
        
        return content
        
    except Exception as e:
        return content + f"Error loading core directives files: {e}\n\n"

def load_single_file(drive_service, folder_id, filename):
    """Load a single file from Google Drive"""
    try:
        # Search for file
        file_response = drive_service.files().list(
            q=f"'{folder_id}' in parents and name='{filename}'",
            fields="files(id, name, mimeType)"
        ).execute()
        
        if not file_response['files']:
            return f"\n=== {filename} ===\nFILE NOT FOUND\n\n"
        
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
        return f"\n=== {filename} ===\n{content}\n\n"
        
    except Exception as e:
        return f"\n=== {filename} ===\nERROR LOADING: {e}\n\n"
