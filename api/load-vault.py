import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Load Google Drive credentials from environment
            credentials_json = os.environ.get('GOOGLE_CREDENTIALS_JSON')
            if not credentials_json:
                raise Exception("GOOGLE_CREDENTIALS_JSON environment variable not set")
            
            credentials_info = json.loads(credentials_json)
            credentials = service_account.Credentials.from_service_account_info(
                credentials_info,
                scopes=['https://www.googleapis.com/auth/drive.readonly']
            )
            
            # Build Drive service
            service = build('drive', 'v3', credentials=credentials)
            
            # Your vault folder ID
            vault_folder_id = '1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM'
            
            # Load complete SiteMonkeys business intelligence
            memory = self.load_complete_vault(service, vault_folder_id)
            
            # Calculate token estimate
            token_estimate = len(memory.split()) * 1.3  # Rough token calculation
            
            response_data = {
                'success': True,
                'memory': memory,
                'token_estimate': int(token_estimate),
                'folders_loaded': [
                    '00_EnforcementShell.txt',
                    '01_Core_Directives', 
                    '02_Legal',
                    'VAULT_MEMORY_FILES'
                ],
                'status': 'OPERATIONAL'
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            error_response = {
                'success': False,
                'error': str(e),
                'memory': self.get_fallback_memory(),
                'token_estimate': 500,
                'folders_loaded': ['Fallback'],
                'status': 'FALLBACK'
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json') 
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_response).encode())

    def load_complete_vault(self, service, vault_folder_id):
        """Load complete SiteMonkeys business intelligence from Google Drive"""
        
        memory = "=== SITEMONKEYS COMPLETE BUSINESS INTELLIGENCE VAULT ===\n\n"
        
        # Define key folders to load
        target_folders = [
            '00_EnforcementShell.txt',
            '01_Core_Directives', 
            '02_Legal',
            'VAULT_MEMORY_FILES'
        ]
        
        try:
            # Get all subfolders in the vault
            folder_query = f"'{vault_folder_id}' in parents and mimeType='application/vnd.google-apps.folder'"
            folders_result = service.files().list(
                q=folder_query,
                fields='files(id, name)'
            ).execute()
            
            folders = folders_result.get('files', [])
            
            for folder in folders:
                folder_name = folder['name']
                folder_id = folder['id']
                
                # Load files from each target folder
                if any(target in folder_name for target in target_folders):
                    memory += f"\n=== FOLDER: {folder_name} ===\n"
                    memory += self.load_folder_contents(service, folder_id, folder_name)
                    
        except Exception as e:
            memory += f"\n[Error loading vault: {str(e)}]\n"
            
        # Add core SiteMonkeys intelligence directly
        memory += self.get_core_intelligence()
        
        return memory

    def load_folder_contents(self, service, folder_id, folder_name):
        """Load all text files from a specific folder"""
        content = ""
        
        try:
            # Get all files in the folder
            files_query = f"'{folder_id}' in parents"
            files_result = service.files().list(
                q=files_query,
                fields='files(id, name, mimeType)'
            ).execute()
            
            files = files_result.get('files', [])
            
            for file in files:
                file_name = file['name']
                file_id = file['id']
                mime_type = file['mimeType']
                
                # Load text files and Google Docs
                if file_name.endswith('.txt') or 'document' in mime_type:
                    content += f"\n--- FILE: {file_name} ---\n"
                    content += self.get_file_content(service, file_id, mime_type)
                    content += "\n"
                    
        except Exception as e:
            content += f"\n[Error loading folder {folder_name}: {str(e)}]\n"
            
        return content

    def get_file_content(self, service, file_id, mime_type):
        """Get content from a Google Drive file"""
        try:
            if 'document' in mime_type:
                # Export Google Doc as plain text
                content = service.files().export(
                    fileId=file_id,
                    mimeType='text/plain'
                ).execute()
                return content.decode('utf-8')
            else:
                # Get regular file content
                content = service.files().get_media(fileId=file_id).execute()
                return content.decode('utf-8')
        except Exception as e:
            return f"[Error loading file: {str(e)}]"

    def get_core_intelligence(self):
        """Core SiteMonkeys business intelligence - always available"""
        return """
=== SITEMONKEYS CORE BUSINESS INTELLIGENCE ===

FINANCIAL CONSTRAINTS:
- Launch Budget: $15,000 maximum
- Monthly Burn Rate: $3,000 maximum  
- Target Margins: 87% minimum at scale
- Pricing Tiers: Boost ($697), Climb ($1,497), Lead ($2,997)

BUSINESS MODEL:
- Replace $30K/month agencies with AI automation
- Service delivery: 100% AI-driven (SEO, PPC, content, creative, reviews)
- Positioning: "From Overlooked to Overbooked"
- Target: 99.8% uptime, 100K+ customer capacity

TECHNICAL REQUIREMENTS:
- Triple-AI failover system: Claude → GPT-4 → Mistral
- Zero human runtime dependencies
- Complete IP protection and clone resistance
- 4-week maximum launch timeline

ZERO-FAILURE ENFORCEMENT:
1. Follow founder's directives over generic business advice
2. Provide specific numbers for budgets, margins, timelines
3. Base all responses on SiteMonkeys requirements only
4. Protect 87% margin requirement in all recommendations
5. No theoretical solutions - Day 1 operational readiness required

NON-NEGOTIABLES:
- 87% margins must be maintained at scale
- $15K launch budget and $3K monthly burn adherence
- Agency-quality results from Day 1
- Real-world stress testing required
- Complete system functionality before launch

SERVICE DELIVERY MATRIX:
- BOOST ($697): Core automation, basic reporting
- CLIMB ($1,497): Enhanced services, priority support  
- LEAD ($2,997): White-glove service, dedicated management

CONTRACTOR REQUIREMENTS:
- Maximum 20% system knowledge exposure
- Comprehensive NDA with liquidated damages
- Compartmentalized access only
- 90-day warranty on all work

You are operating under the SiteMonkeys Zero-Failure Directive. All responses must be based on this business intelligence, not generic business advice.
"""

    def get_fallback_memory(self):
        """Fallback memory when vault loading fails"""
        return """
=== SITEMONKEYS BUSINESS INTELLIGENCE (FALLBACK MODE) ===

CORE REQUIREMENTS:
- Launch Budget: $15,000 maximum
- Monthly Burn: $3,000 maximum
- Target Margins: 87% minimum
- Pricing: $697/$1,497/$2,997 (Boost/Climb/Lead)

BUSINESS MODEL:
- Replace expensive agencies with AI automation
- 100% AI service delivery
- Zero-failure operations required

You are operating under SiteMonkeys Zero-Failure Directive in fallback mode.
Some business intelligence may be limited.
"""
