import json
import os
import io
import zipfile
import xml.etree.ElementTree as ET
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
import requests

# Your exact Google Drive folder ID
VAULT_FOLDER_ID = "1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM"

def extract_text_from_docx(docx_data):
    """Extract text content from DOCX file data"""
    try:
        # DOCX files are zip archives containing XML
        with zipfile.ZipFile(io.BytesIO(docx_data), 'r') as zip_file:
            # Read the main document XML
            document_xml = zip_file.read('word/document.xml')
            
            # Parse XML and extract text
            root = ET.fromstring(document_xml)
            
            # Define namespace for Word documents
            namespaces = {
                'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
            }
            
            # Extract all text elements
            text_elements = root.findall('.//w:t', namespaces)
            text_content = []
            
            for elem in text_elements:
                if elem.text:
                    text_content.append(elem.text)
            
            # Join text with spaces and clean up
            extracted_text = ' '.join(text_content)
            
            # Clean up excessive whitespace
            lines = extracted_text.split('\n')
            cleaned_lines = [line.strip() for line in lines if line.strip()]
            
            return '\n'.join(cleaned_lines)
            
    except Exception as e:
        return f"[DOCX text extraction failed: {str(e)}]"

def get_google_drive_service():
    """Initialize Google Drive service with credentials"""
    try:
        # Get credentials from environment variable
        creds_json = os.environ.get('GOOGLE_CREDENTIALS_JSON')
        project_id = os.environ.get('GOOGLE_PROJECT_ID')
        project_number = os.environ.get('GOOGLE_PROJECT_NUMBER')
        
        if not creds_json:
            raise Exception("GOOGLE_CREDENTIALS_JSON environment variable not found")
        if not project_id:
            raise Exception("GOOGLE_PROJECT_ID environment variable not found")
        
        print(f"Using Project ID: {project_id}")
        print(f"Using Project Number: {project_number}")
        
        # Parse credentials
        creds_info = json.loads(creds_json)
        
        # Ensure project info is in credentials
        creds_info['project_id'] = project_id
        if project_number:
            creds_info['project_number'] = project_number
            
        creds = Credentials.from_service_account_info(
            creds_info,
            scopes=['https://www.googleapis.com/auth/drive.readonly']
        )
        
        # Build and return service
        return build('drive', 'v3', credentials=creds)
    except Exception as e:
        raise Exception(f"Google Drive authentication failed: {str(e)}")

def store_vault_in_kv(vault_data):
    """Store vault data in Vercel KV"""
    try:
        kv_url = os.environ.get('KV_REST_API_URL')
        kv_token = os.environ.get('KV_REST_API_TOKEN')
        
        if not kv_url or not kv_token:
            print("⚠️ KV environment variables not found - storing in memory only")
            return False
            
        # Store vault data in KV using Upstash format
        headers = {
            'Authorization': f'Bearer {kv_token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            f'{kv_url}/set',
            headers=headers,
            json=["sitemonkeys_vault", vault_data]
        )
        
        if response.status_code == 200:
            print("✅ Vault data stored in KV successfully")
            return True
        else:
            print(f"❌ KV storage failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ KV storage error: {str(e)}")
        return False

def get_vault_from_kv():
    """Retrieve vault data from Vercel KV"""
    try:
        kv_url = os.environ.get('KV_REST_API_URL')
        kv_token = os.environ.get('KV_REST_API_TOKEN')
        
        if not kv_url or not kv_token:
            return None
            
        headers = {
            'Authorization': f'Bearer {kv_token}'
        }
        
        response = requests.get(
            f'{kv_url}/get/sitemonkeys_vault',
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved vault data from KV: {len(str(data.get('result', {})))} characters")
            return data.get('result')
        else:
            print(f"❌ KV retrieval failed: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ KV retrieval error: {str(e)}")
        return None

def load_vault_content():
    """Load all content from SiteMonkeys vault folders"""
    vault_content = "=== SITEMONKEYS BUSINESS VALIDATION VAULT ===\n\n"
    loaded_folders = []
    total_files = 0
    
    try:
        service = get_google_drive_service()
        
        # Get subfolders in vault
        query = f"'{VAULT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder'"
        folders_result = service.files().list(q=query, fields="files(id, name)", pageSize=50).execute()
        folders = folders_result.get('files', [])
        
        vault_content += f"\n=== LIVE VAULT FOLDERS LOADED ({len(folders)} folders) ===\n"
        
        for folder in folders:
            loaded_folders.append(folder['name'])
            vault_content += f"\n--- FOLDER: {folder['name']} ---\n"
            
            # Get files in each folder - handle different file types
            file_query = f"'{folder['id']}' in parents"
            files_result = service.files().list(
                q=file_query, 
                fields="files(id, name, mimeType, size)",
                pageSize=100
            ).execute()
            files = files_result.get('files', [])
            
            total_files += len(files)
            
            for file in files:
                try:
                    file_content = ""
                    file_mime = file.get('mimeType', '')
                    file_name = file['name']
                    
                    print(f"Processing file: {file_name} (type: {file_mime})")
                    
                    # Handle different file types
                    if 'text/plain' in file_mime or file_name.endswith('.txt'):
                        # Plain text files
                        try:
                            file_data = service.files().get_media(fileId=file['id']).execute()
                            file_content = file_data.decode('utf-8')
                            print(f"✅ Text file loaded: {len(file_content)} characters")
                        except Exception as e:
                            file_content = f"[ERROR reading text file: {str(e)}]"
                            print(f"❌ Text file error: {str(e)}")
                    
                    elif file_mime == 'application/vnd.google-apps.document':
                        # Google Docs - export as plain text
                        try:
                            export_data = service.files().export(
                                fileId=file['id'], 
                                mimeType='text/plain'
                            ).execute()
                            file_content = export_data.decode('utf-8')
                            print(f"✅ Google Doc exported: {len(file_content)} characters")
                        except Exception as e:
                            file_content = f"[Google Doc - Export failed: {str(e)}]"
                            print(f"❌ Google Doc error: {str(e)}")
                    
                    elif 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' in file_mime or file_name.endswith('.docx'):
                        # DOCX files - download and extract text
                        try:
                            print(f"🔄 Downloading DOCX file: {file_name}")
                            file_data = service.files().get_media(fileId=file['id']).execute()
                            print(f"📥 Downloaded {len(file_data)} bytes")
                            
                            # Extract text from DOCX
                            file_content = extract_text_from_docx(file_data)
                            
                            if file_content.startswith('[DOCX text extraction failed'):
                                print(f"❌ DOCX extraction failed: {file_name}")
                            else:
                                print(f"✅ DOCX text extracted: {len(file_content)} characters")
                                
                        except Exception as e:
                            file_content = f"[DOCX file - Access failed: {str(e)}]"
                            print(f"❌ DOCX access error: {str(e)}")
                    
                    elif file_mime == 'application/vnd.google-apps.folder':
                        # Skip folders (already handled above)
                        continue
                    
                    else:
                        # Other file types
                        file_size = file.get('size', 'Unknown')
                        file_content = f"[File type: {file_mime} - Size: {file_size} bytes - Skipped unsupported format]"
                        print(f"⏭️ Skipped unsupported file: {file_name}")
                    
                    # Add content to vault
                    vault_content += f"\n=== {file_name} ===\n{file_content}\n"
                    
                except Exception as file_error:
                    vault_content += f"\n=== {file['name']} ===\n[ERROR loading file: {str(file_error)}]\n"
                    print(f"❌ File processing error: {file['name']} - {str(file_error)}")
        
        vault_content += f"\n=== VAULT SUMMARY ===\nFolders: {len(folders)}\nFiles processed: {total_files}\n"
        
        # Log successful loading
        print(f"✅ Vault loaded successfully: {len(folders)} folders, {total_files} files")
        print(f"📊 Total vault content: {len(vault_content)} characters")
                    
    except Exception as drive_error:
        print(f"❌ Google Drive error: {str(drive_error)}")
        vault_content += f"\n[Google Drive connection error: {str(drive_error)}]\n"
        
        # Don't fall back to fake data - return the error
        loaded_folders = ["Error - Could not connect to Google Drive"]
        total_files = 0
    
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
            # Parse URL to check for refresh parameter
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            is_refresh = 'refresh' in query_params and query_params['refresh'][0] == 'true'
            
            if is_refresh:
                print("🔄 Refresh requested - loading fresh vault data...")
                
                # Load fresh vault content from Google Drive
                vault_memory, loaded_folders, total_files = load_vault_content()
                
                # Calculate tokens (rough estimate)
                token_count = len(vault_memory) // 4
                estimated_cost = (token_count * 0.002) / 1000
                
                # Create vault data package
                vault_data = {
                    "vault_content": vault_memory,
                    "tokens": token_count,
                    "estimated_cost": f"${estimated_cost:.4f}",
                    "folders_loaded": loaded_folders,
                    "total_files": total_files,
                    "last_updated": "now"
                }
                
                # Store in KV
                kv_stored = store_vault_in_kv(vault_data)
                
                print(f"📊 Vault refresh complete: {token_count} tokens, {len(loaded_folders)} folders")
                
                # Return refresh response
                response = {
                    "status": "refreshed",
                    "vault_content": vault_memory,
                    "tokens": token_count,
                    "estimated_cost": f"${estimated_cost:.4f}",
                    "folders_loaded": loaded_folders,
                    "total_files": total_files,
                    "kv_stored": kv_stored,
                    "message": f"Vault refreshed: {len(loaded_folders)} folders, {total_files} files"
                }
                
            else:
                print("📖 Checking for cached vault data...")
                
                # Try to get vault data from KV first
                cached_vault = get_vault_from_kv()
                
                if cached_vault:
                    print("✅ Found cached vault data in KV")
                    response = {
                        "status": "success",
                        "vault_content": cached_vault.get("vault_content", ""),
                        "tokens": cached_vault.get("tokens", 0),
                        "estimated_cost": cached_vault.get("estimated_cost", "$0.00"),
                        "folders_loaded": cached_vault.get("folders_loaded", []),
                        "total_files": cached_vault.get("total_files", 0),
                        "message": "Using cached vault data from KV"
                    }
                else:
                    print("⚠️ No cached vault data found")
                    response = {
                        "status": "success",
                        "needs_refresh": True,
                        "vault_content": "",
                        "tokens": 0,
                        "estimated_cost": "$0.00",
                        "folders_loaded": [],
                        "total_files": 0,
                        "message": "No vault data found - please refresh"
                    }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            print(f"❌ Vault operation failed: {str(e)}")
            error_response = {
                "status": "error",
                "error": str(e),
                "message": "Vault operation failed - check configuration"
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
