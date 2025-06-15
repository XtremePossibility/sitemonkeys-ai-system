import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Load Google credentials from environment
            credentials_json = os.environ.get('GOOGLE_CREDENTIALS_JSON')
            if not credentials_json:
                raise ValueError("GOOGLE_CREDENTIALS_JSON environment variable not set")
            
            # Parse credentials
            credentials_dict = json.loads(credentials_json)
            credentials = service_account.Credentials.from_service_account_info(credentials_dict)
            
            # Build Drive service
            service = build('drive', 'v3', credentials=credentials)
            
            # SiteMonkeys vault folder ID (replace with your actual folder ID)
            vault_folder_id = "1_YOUR_VAULT_FOLDER_ID_HERE"
            
            # Get all files in the vault folder
            results = service.files().list(
                q=f"'{vault_folder_id}' in parents and trashed=false",
                fields="files(id, name, mimeType, size)"
            ).execute()
            
            files = results.get('files', [])
            vault_content = "=== SITEMONKEYS CORE BUSINESS INTELLIGENCE ===\n\n"
            
            total_files = len(files)
            loaded_files = 0
            
            # Priority files to load first (core business intelligence)
            priority_files = [
                "zero-failure-directive",
                "financial-requirements", 
                "business-validation",
                "founder-protection",
                "market-strategy"
            ]
            
            # Load priority files first
            for priority in priority_files:
                matching_files = [f for f in files if priority.lower() in f['name'].lower()]
                for file_info in matching_files:
                    try:
                        if file_info['mimeType'] == 'application/vnd.google-apps.document':
                            # Export Google Doc as plain text
                            file_content = service.files().export(
                                fileId=file_info['id'],
                                mimeType='text/plain'
                            ).execute()
                            
                            content = file_content.decode('utf-8')
                            vault_content += f"\n=== {file_info['name'].upper()} ===\n"
                            vault_content += content + "\n"
                            loaded_files += 1
                            
                        elif file_info['mimeType'] == 'text/plain':
                            # Download plain text file
                            file_content = service.files().get_media(
                                fileId=file_info['id']
                            ).execute()
                            
                            content = file_content.decode('utf-8')
                            vault_content += f"\n=== {file_info['name'].upper()} ===\n"
                            vault_content += content + "\n"
                            loaded_files += 1
                            
                    except Exception as e:
                        print(f"Error loading {file_info['name']}: {str(e)}")
                        continue
            
            # Load remaining files (up to token limit)
            remaining_files = [f for f in files if not any(p.lower() in f['name'].lower() for p in priority_files)]
            
            for file_info in remaining_files[:5]:  # Limit to prevent token overflow
                try:
                    if file_info['mimeType'] == 'application/vnd.google-apps.document':
                        file_content = service.files().export(
                            fileId=file_info['id'],
                            mimeType='text/plain'
                        ).execute()
                        
                        content = file_content.decode('utf-8')
                        vault_content += f"\n=== {file_info['name'].upper()} ===\n"
                        vault_content += content + "\n"
                        loaded_files += 1
                        
                    elif file_info['mimeType'] == 'text/plain':
                        file_content = service.files().get_media(
                            fileId=file_info['id']
                        ).execute()
                        
                        content = file_content.decode('utf-8')
                        vault_content += f"\n=== {file_info['name'].upper()} ===\n"
                        vault_content += content + "\n"
                        loaded_files += 1
                        
                except Exception as e:
                    print(f"Error loading {file_info['name']}: {str(e)}")
                    continue
            
            # Add core SiteMonkeys business intelligence if no files loaded
            if loaded_files == 0:
                vault_content += """
=== SITEMONKEYS BUSINESS REQUIREMENTS ===
Company: SiteMonkeys - Website Design & Local SEO
Mission: From Overlooked to Overbooked

FINANCIAL REQUIREMENTS:
- Maximum budget: $15,000
- Target margin: 87% minimum
- Monthly burn rate: $3,000 maximum
- Break-even timeline: 6 months

VALIDATION REQUIREMENTS:
- Zero-failure approach to all decisions
- Data-driven validation before execution
- Market leader positioning
- Founder protection protocols

MARKET STRATEGY:
- Focus on local businesses needing SEO
- Website design with guaranteed results
- Premium positioning in market
- Zero-failure client delivery

OPERATIONAL DIRECTIVES:
- Persistence driven approach
- Legitimate data initiatives only
- Helpful customer-first mentality
- Continuous market validation
"""
            
            # Estimate token count
            estimated_tokens = len(vault_content) // 4
            estimated_cost = (estimated_tokens * 0.002 / 1000)
            
            response_data = {
                "status": "Vault loaded successfully",
                "files_loaded": loaded_files,
                "total_files": total_files,
                "estimated_tokens": estimated_tokens,
                "estimated_cost": f"${estimated_cost:.4f}",
                "vault_content": vault_content
            }
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response_json = json.dumps(response_data)
            self.wfile.write(response_json.encode('utf-8'))
            
        except Exception as e:
            # Error response
            error_response = {
                "status": "Error loading vault",
