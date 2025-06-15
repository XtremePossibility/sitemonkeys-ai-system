import os
import json
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from http.server import BaseHTTPRequestHandler

# Your exact folder ID
VAULT_FOLDER_ID = "1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM"

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Get credentials from environment
            google_creds = os.getenv('GOOGLE_CREDENTIALS_JSON')
            if not google_creds:
                raise Exception("No Google credentials found")
            
            # Parse the JSON credentials
            creds_dict = json.loads(google_creds)
            
            # Create credentials object
            credentials = Credentials.from_service_account_info(
                creds_dict,
                scopes=['https://www.googleapis.com/auth/drive.readonly']
            )
            
            # Build the Drive service
            service = build('drive', 'v3', credentials=credentials)
            
            # List files in the vault folder
            results = service.files().list(
                q=f"'{VAULT_FOLDER_ID}' in parents",
                fields="files(id, name, mimeType)"
            ).execute()
            
            files = results.get('files', [])
            
            if not files:
                raise Exception(f"No files found in folder {VAULT_FOLDER_ID}")
            
            # Load content from each file
            vault_content = "=== SITEMONKEYS BUSINESS INTELLIGENCE VAULT ===\n\n"
            files_loaded = 0
            
            for file_info in files:
                try:
                    if file_info['mimeType'] == 'application/vnd.google-apps.document':
                        # Export Google Doc as plain text
                        request = service.files().export_media(
                            fileId=file_info['id'],
                            mimeType='text/plain'
                        )
                        file_content = request.execute().decode('utf-8')
                        
                        vault_content += f"\n=== {file_info['name']} ===\n"
                        vault_content += file_content
                        vault_content += "\n\n"
                        files_loaded += 1
                        
                except Exception as file_error:
                    continue  # Skip files that can't be read
            
            # Return successful response
            response_data = {
                "success": True,
                "memory": vault_content,
                "token_estimate": len(vault_content.split()),
                "folders_loaded": files_loaded,
                "mode": "google_drive_loaded"
            }
            
        except Exception as e:
            # Return fallback business intelligence
            fallback_content = """=== SITEMONKEYS CORE BUSINESS INTELLIGENCE ===

FINANCIAL CONSTRAINTS:
- Launch Budget: $15,000 maximum
- Monthly Burn Rate: $3,000 maximum
- Margin Requirement: 87% minimum
- Emergency Fund: $5,000 reserve

PRICING STRATEGY:
- Basic Package: $697
- Professional Package: $1,497
- Premium Package: $2,997

ZERO-FAILURE PROTOCOLS:
- All decisions must align with 87% margin requirement
- No expenses exceeding $3K monthly burn rate
- All contractor work must include signed NDAs
- Legal compliance mandatory for all operations

ENFORCEMENT DIRECTIVES:
- Founder protection protocols active
- Market leader positioning required
- Persistence-driven execution mandatory
- Helpful initiative protocols enabled"""

            response_data = {
                "success": True,
                "memory": fallback_content,
                "token_estimate": 500,
                "folders_loaded": 0,
                "mode": "fallback_mode",
                "error": str(e)
            }
        
        # Send response
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
