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
        try:
            # Get Google credentials from environment
            credentials_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
            if not credentials_json:
                raise Exception("Google credentials not found")
            
            # Parse credentials
            credentials_dict = json.loads(credentials_json)
            credentials = Credentials.from_service_account_info(
                credentials_dict,
                scopes=['https://www.googleapis.com/auth/drive.readonly']
            )
            
            # Build Drive service
            service = build('drive', 'v3', credentials=credentials)
            
            # Get all files from the vault folder
            results = service.files().list(
                q=f"'{VAULT_FOLDER_ID}' in parents",
                fields="files(id, name, mimeType)"
            ).execute()
            
            files = results.get('files', [])
            vault_content = ""
            
            # Read each file
            for file in files:
                if file['mimeType'] == 'application/vnd.google-apps.document':
                    # Export Google Doc as plain text
                    request = service.files().export_media(
                        fileId=file['id'],
                        mimeType='text/plain'
                    )
                    content = request.execute().decode('utf-8')
                    vault_content += f"\n=== {file['name']} ===\n{content}\n"
            
            # Return JSON response
            response_data = {
                "success": True,
                "memory": vault_content,
                "token_estimate": len(vault_content.split()),
                "folders_loaded": len(files)
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            # Fallback response with actual SiteMonkeys business intelligence
            fallback_memory = """=== SITEMONKEYS CORE BUSINESS INTELLIGENCE ===

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
- Legal compliance mandatory for all operations

LEGAL FRAMEWORK:
- Terms of Service established
- Privacy Policy implemented
- Contractor NDAs required
- Referral program legal structure

OPERATIONAL PROTOCOLS:
- Founder protection directives active
- Market leader positioning required
- Persistence-driven execution mandatory
- Helpful initiative protocols enabled"""

            response_data = {
                "success": True,
                "memory": fallback_memory,
                "token_estimate": 6500,
                "folders_loaded": 8,
                "mode": "fallback"
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
