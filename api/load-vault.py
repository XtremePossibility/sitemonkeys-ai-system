import os
import json
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
import io
from googleapiclient.http import MediaIoBaseDownload
from http.server import BaseHTTPRequestHandler

# Your Google Drive folder ID
VAULT_FOLDER_ID = "1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM"

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        debug_info = []
        
        try:
            debug_info.append("STEP 1: Starting vault load process")
            
            # Check for Google credentials
            credentials_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
            if not credentials_json:
                debug_info.append("ERROR: GOOGLE_CREDENTIALS_JSON not found in environment")
                raise Exception("Google credentials not found in environment variables")
            
            debug_info.append("STEP 2: Google credentials found")
            
            # Parse credentials
            try:
                credentials_dict = json.loads(credentials_json)
                debug_info.append("STEP 3: Credentials parsed successfully")
            except Exception as e:
                debug_info.append(f"ERROR: Failed to parse credentials JSON: {str(e)}")
                raise e
            
            # Create credentials object
            try:
                credentials = Credentials.from_service_account_info(
                    credentials_dict,
                    scopes=['https://www.googleapis.com/auth/drive.readonly']
                )
                debug_info.append("STEP 4: Credentials object created")
            except Exception as e:
                debug_info.append(f"ERROR: Failed to create credentials object: {str(e)}")
                raise e
            
            # Build Drive service
            try:
                service = build('drive', 'v3', credentials=credentials)
                debug_info.append("STEP 5: Google Drive service built")
            except Exception as e:
                debug_info.append(f"ERROR: Failed to build Drive service: {str(e)}")
                raise e
            
            # Test folder access
            try:
                debug_info.append(f"STEP 6: Attempting to access folder ID: {VAULT_FOLDER_ID}")
                results = service.files().list(
                    q=f"'{VAULT_FOLDER_ID}' in parents",
                    fields="files(id, name, mimeType)"
                ).execute()
                debug_info.append("STEP 7: Folder access successful")
            except Exception as e:
                debug_info.append(f"ERROR: Failed to access folder: {str(e)}")
                raise e
            
            files = results.get('files', [])
            debug_info.append(f"STEP 8: Found {len(files)} files in folder")
            
            if not files:
                debug_info.append("WARNING: No files found in the specified folder")
                debug_info.append("This could mean:")
                debug_info.append("- Wrong folder ID")
                debug_info.append("- Service account doesn't have access to folder")
                debug_info.append("- Folder is empty")
            
            vault_content = "=== SITEMONKEYS VAULT CONTENT ===\n\n"
            files_processed = 0
            
            # Process each file
            for file in files:
                try:
                    debug_info.append(f"PROCESSING: {file['name']} (Type: {file['mimeType']})")
                    
                    if file['mimeType'] == 'application/vnd.google-apps.document':
                        # Export Google Doc as plain text
                        request = service.files().export_media(
                            fileId=file['id'],
                            mimeType='text/plain'
                        )
                        content = request.execute().decode('utf-8')
                        vault_content += f"\n=== {file['name']} ===\n{content}\n"
                        files_processed += 1
                        debug_info.append(f"SUCCESS: Loaded {len(content)} characters from {file['name']}")
                    else:
                        debug_info.append(f"SKIPPED: {file['name']} (unsupported type)")
                        
                except Exception as e:
                    debug_info.append(f"ERROR processing {file['name']}: {str(e)}")
            
            debug_info.append(f"STEP 9: Successfully processed {files_processed} files")
            debug_info.append(f"STEP 10: Total vault content length: {len(vault_content)}")
            
            # Return success response with debug info
            response_data = {
                "success": True,
                "memory": vault_content,
                "token_estimate": len(vault_content.split()),
                "folders_loaded": len(files),
                "files_processed": files_processed,
                "debug_info": debug_info,
                "mode": "google_drive_success"
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            debug_info.append(f"FINAL ERROR: {str(e)}")
            
            # Return fallback with detailed debug info
            fallback_memory = """=== SITEMONKEYS FALLBACK BUSINESS INTELLIGENCE ===

FINANCIAL CONSTRAINTS:
- Launch Budget: $15,000 maximum
- Monthly Burn Rate: $3,000 maximum  
- Margin Requirement: 87% minimum
- Emergency Fund: $5,000 reserve

PRICING TIERS:
- Basic Package: $697
- Professional Package: $1,497  
- Premium Package: $2,997

ZERO-FAILURE ENFORCEMENT:
- All decisions must align with 87% margin requirement
- No expenses exceeding $3K monthly burn rate
- All contractor work must include signed NDAs
- Legal compliance mandatory for all operations"""

            response_data = {
                "success": True,
                "memory": fallback_memory,
                "token_estimate": 500,
                "folders_loaded": 0,
                "files_processed": 0,
                "debug_info": debug_info,
                "mode": "fallback_mode",
                "error": str(e)
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
