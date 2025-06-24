import json
import os
import io
import zipfile
import xml.etree.ElementTree as ET
from http.server import BaseHTTPRequestHandler
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

def store_in_kv(key, value):
    """Store data in Vercel KV"""
    try:
        kv_rest_api_url = os.environ.get('KV_REST_API_URL')
        kv_rest_api_token = os.environ.get('KV_REST_API_TOKEN')
        
        if not kv_rest_api_url or not kv_rest_api_token:
            print("❌ KV credentials not found, storing locally for this session")
            return False
            
        headers = {
            'Authorization': f'Bearer {kv_rest_api_token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            f"{kv_rest_api_url}/set/{key}",
            headers=headers,
            data=value.encode('utf-8')
        )
        
        if response.status_code == 200:
            print(f"✅ Data stored in KV: {len(value)} characters")
            return True
        else:
            print(f"❌ KV storage failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ KV storage error: {str(e)}")
        return False

def get_from_kv(key):
    """Get data from Vercel KV"""
    try:
        kv_rest_api_url = os.environ.get('KV_REST_API_URL')
        kv_rest_api_token = os.environ.get('KV_REST_API_TOKEN')
        
        if not kv_rest_api_url or not kv_rest_api_token:
            return None
            
        headers = {
            'Authorization': f'Bearer {kv_rest_api_token}'
        }
        
        response = requests.get(
            f"{kv_rest_api_url}/get/{key}",
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            return data.get('result')
        else:
            return None
            
    except Exception as e:
        print(f"❌ KV retrieval error: {str(e)}")
        return None

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

def load_vault_from_google_drive():
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
        
        # Check if this is a refresh request
        if '?refresh=true' in self.path:
            self.handle_refresh()
        else:
            self.handle_get()
    
    def handle_refresh(self):
        """Handle vault refresh request"""
        try:
            print("🔄 Vault refresh requested - loading from Google Drive...")
            
            # Load fresh vault content from Google Drive
            vault_memory, loaded_folders, total_files = load_vault_from_google_drive()
            
            # Store in KV
            kv_stored = store_in_kv('sitemonkeys_vault', vault_memory)
            
            # Calculate tokens
            token_count = len(vault_memory) // 4
            estimated_cost = (token_count * 0.002) / 1000
            
            print(f"📊 Vault refresh complete: {token_count} tokens, {len(loaded_folders)} folders")
            
            # Return JSON response
            response = {
                "status": "refreshed",
                "memory": vault_memory,
                "data": vault_memory,
                "vault_content": vault_memory,
                "tokens": token_count,
                "estimated_cost": f"${estimated_cost:.4f}",
                "folders_loaded": loaded_folders,
                "total_files": total_files,
                "kv_stored": kv_stored,
                "message": f"Vault refreshed: {len(loaded_folders)} folders, {total_files} files, {token_count} tokens loaded"
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            print(f"❌ Vault refresh failed: {str(e)}")
            error_response = {
                "status": "error",
                "error": str(e),
                "message": "Vault refresh failed - check Google Drive permissions"
            }
            self.wfile.write(json.dumps(error_response).encode())
    
    def handle_get(self):
        """Handle normal vault get request - try KV first"""
        try:
            print("📖 Checking KV for existing vault data...")
            
            # Try to get from KV first
            vault_memory = get_from_kv('sitemonkeys_vault')
            
            if vault_memory:
                print("✅ Found vault data in KV")
                # Calculate tokens
                token_count = len(vault_memory) // 4
                estimated_cost = (token_count * 0.002) / 1000
                
                # Extract folder info from vault content
                folder_count = vault_memory.count('--- FOLDER:')
                file_count = vault_memory.count('=== ') - folder_count
                
                response = {
                    "status": "success",
                    "memory": vault_memory,
                    "data": vault_memory,
                    "vault_content": vault_memory,
                    "tokens": token_count,
                    "estimated_cost": f"${estimated_cost:.4f}",
                    "folders_loaded": [f"Folder {i+1}" for i in range(folder_count)],
                    "total_files": file_count,
                    "source": "kv_cache",
                    "message": f"Vault loaded from cache: {folder_count} folders, {file_count} files, {token_count} tokens"
                }
                
                self.wfile.write(json.dumps(response).encode())
                
            else:
                print("❌ No vault data in KV - need to refresh first")
                response = {
                    "status": "empty",
                    "message": "No vault data found. Please refresh vault first.",
                    "needs_refresh": True
                }
                self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            print(f"❌ Vault loading failed: {str(e)}")
            error_response = {
                "status": "error",
                "error": str(e),
                "message": "Vault loading failed"
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
