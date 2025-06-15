import os
import json
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials
from http.server import BaseHTTPRequestHandler

def get_google_drive_service():
    """Initialize Google Drive service with credentials"""
    try:
        # Get credentials from environment variable
        creds_json = os.environ.get('GOOGLE_CREDENTIALS_JSON')
        if not creds_json:
            raise Exception("GOOGLE_CREDENTIALS_JSON environment variable not found")
        
        # Parse JSON credentials
        creds_info = json.loads(creds_json)
        
        # Create credentials
        credentials = Credentials.from_service_account_info(
            creds_info,
            scopes=['https://www.googleapis.com/auth/drive.readonly']
        )
        
        # Build Drive service
        service = build('drive', 'v3', credentials=credentials)
        return service
        
    except Exception as e:
        print(f"Error initializing Google Drive service: {e}")
        return None

def load_all_files_from_folder(service, folder_id, folder_name=""):
    """Load ALL files from a folder, regardless of type"""
    try:
        # Query for ALL files in folder (both .txt and .docx)
        query = f"'{folder_id}' in parents and trashed=false"
        results = service.files().list(
            q=query,
            fields="files(id, name, mimeType, size)"
        ).execute()
        
        files = results.get('files', [])
        folder_content = f"\n=== {folder_name} FOLDER ({len(files)} files found) ===\n"
        
        # List all files found
        folder_content += f"Files discovered in {folder_name}:\n"
        for file in files:
            folder_content += f"  - {file['name']} (Type: {file['mimeType']}, Size: {file.get('size', 'Unknown')})\n"
        
        folder_content += "\n--- FILE CONTENTS ---\n"
        
        for file in files:
            try:
                # Only process text files and Google Docs
                if (file['mimeType'] == 'text/plain' or 
                    file['name'].endswith('.txt') or
                    file['mimeType'] == 'application/vnd.google-apps.document'):
                    
                    if file['mimeType'] == 'application/vnd.google-apps.document':
                        # Export Google Doc as plain text
                        file_content = service.files().export(
                            fileId=file['id'], 
                            mimeType='text/plain'
                        ).execute()
                    else:
                        # Download plain text file
                        file_content = service.files().get_media(fileId=file['id']).execute()
                    
                    content = file_content.decode('utf-8')
                    folder_content += f"\n--- {file['name']} ---\n{content[:1000]}...\n"  # First 1000 chars
                    
                else:
                    folder_content += f"\n--- {file['name']} (SKIPPED - {file['mimeType']}) ---\n"
                    
            except Exception as e:
                folder_content += f"\n--- {file['name']} (ERROR: {str(e)}) ---\n"
                continue
                
        return folder_content
        
    except Exception as e:
        print(f"Error loading folder {folder_name}: {e}")
        return f"\n=== {folder_name} FOLDER - ERROR: {str(e)} ===\n"

def discover_and_load_complete_vault():
    """Discover ALL folders and load complete vault contents"""
    try:
        service = get_google_drive_service()
        if not service:
            return {"success": False, "error": "Failed to initialize Google Drive service"}
        
        # Your SiteMonkeys vault folder ID
        VAULT_FOLDER_ID = "1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM"
        
        # DISCOVERY PHASE: Find ALL subfolders
        discovery_content = f"""
SITEMONKEYS ZERO-FAILURE VAULT DIAGNOSTIC REPORT
==============================================

VAULT FOLDER ID: {VAULT_FOLDER_ID}

"""
        
        # Get ALL subfolders in the vault
        query = f"'{VAULT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
        results = service.files().list(
            q=query,
            fields="files(id, name, createdTime)"
        ).execute()
        
        subfolders = results.get('files', [])
        
        discovery_content += f"TOTAL SUBFOLDERS DISCOVERED: {len(subfolders)}\n\n"
        discovery_content += "SUBFOLDER INVENTORY:\n"
        
        for folder in subfolders:
            discovery_content += f"  📁 {folder['name']} (ID: {folder['id']})\n"
        
        discovery_content += "\n" + "="*50 + "\n"
        
        # Core business intelligence (always included)
        vault_memory = discovery_content + """
=== CORE SITEMONKEYS BUSINESS INTELLIGENCE ===

FINANCIAL CONSTRAINTS:
- Launch Budget: $15,000 maximum
- Monthly Burn Rate: <$3,000
- Target Margins: 87%+ at scale
- Pricing Tiers: $697 (Boost), $1,497 (Climb), $2,997 (Lead)

ZERO-FAILURE ENFORCEMENT ACTIVE:
1. Founder's directives take priority over generic business advice
2. Provide specific numbers for budgets, margins, timelines
3. Base all responses on SiteMonkeys requirements only
4. Protect 87% margin requirement in all recommendations
5. No placeholders - actionable solutions only

TECHNICAL REQUIREMENTS:
- Triple-AI failover system: Claude → GPT-4 → Mistral
- 99.8% uptime requirement
- 100% AI automation (no human runtime dependencies)
- Complete IP protection and clone resistance
- 4-week launch timeline maximum

BUSINESS MODEL:
- Replace $30K/month agencies with AI automation
- Service pricing: $697-$2,997 (87-90% cost reduction for customers)
- "From Overlooked to Overbooked" positioning
- 100+ elite agency capabilities fully automated

"""
        
        # LOADING PHASE: Load content from ALL discovered folders
        loaded_folders = []
        failed_folders = []
        
        for folder in subfolders:
            folder_name = folder['name']
            folder_id = folder['id']
            
            try:
                print(f"Attempting to load folder: {folder_name}")
                folder_content = load_all_files_from_folder(service, folder_id, folder_name)
                vault_memory += folder_content
                loaded_folders.append(folder_name)
                print(f"Successfully loaded: {folder_name}")
                
            except Exception as e:
                error_msg = f"\n=== {folder_name} FOLDER - LOAD FAILED ===\nError: {str(e)}\n"
                vault_memory += error_msg
                failed_folders.append(f"{folder_name}: {str(e)}")
                print(f"Failed to load {folder_name}: {e}")
        
        # Final summary
        vault_memory += f"""

=== VAULT LOADING DIAGNOSTIC SUMMARY ===
Total subfolders discovered: {len(subfolders)}
Successfully loaded folders: {len(loaded_folders)}
Failed folders: {len(failed_folders)}

LOADED FOLDERS:
{chr(10).join([f"✅ {folder}" for folder in loaded_folders])}

FAILED FOLDERS:
{chr(10).join([f"❌ {folder}" for folder in failed_folders])}

VAULT STATUS: {'FULLY OPERATIONAL' if len(failed_folders) == 0 else 'PARTIAL ACCESS'}
BUSINESS INTELLIGENCE: {'COMPLETE' if len(loaded_folders) >= 4 else 'INCOMPLETE'}

ZERO-FAILURE SYSTEM: DIAGNOSTIC COMPLETE
"""
        
        # Calculate token estimate
        token_estimate = len(vault_memory.split()) * 1.3
        
        return {
            "success": True,
            "memory": vault_memory,
            "token_estimate": f"{token_estimate:.1f}",
            "folders_discovered": len(subfolders),
            "folders_loaded": len(loaded_folders),
            "folders_failed": len(failed_folders),
            "loaded_folder_names": loaded_folders,
            "failed_folder_names": failed_folders
        }
        
    except Exception as e:
        print(f"Critical vault loading error: {e}")
        return {
            "success": False,
            "error": f"Vault diagnostic failed: {str(e)}",
            "memory": f"EMERGENCY FALLBACK: Vault diagnostic error - {str(e)}"
        }

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            result = discover_and_load_complete_vault()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = json.dumps(result)
            self.wfile.write(response.encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {
                "success": False,
                "error": f"Server error: {str(e)}"
            }
            response = json.dumps(error_response)
            self.wfile.write(response.encode())
