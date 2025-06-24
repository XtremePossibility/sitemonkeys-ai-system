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

def get_google_drive_service():
    """Initialize Google Drive service with credentials"""
    try:
        # Get credentials from environment variable
        credentials_json = os.environ.get('GOOGLE_CREDENTIALS_JSON')
        if not credentials_json:
            raise ValueError("GOOGLE_CREDENTIALS_JSON environment variable not found")
        
        # Parse the credentials JSON
        credentials_info = json.loads(credentials_json)
        
        # Create credentials object
        credentials = Credentials.from_service_account_info(
            credentials_info,
            scopes=['https://www.googleapis.com/auth/drive.readonly']
        )
        
        # Build the service
        service = build('drive', 'v3', credentials=credentials)
        return service
        
    except Exception as e:
        print(f"❌ Error initializing Google Drive service: {str(e)}")
        return None

def extract_text_from_docx_content(content):
    """Extract text from DOCX file content"""
    try:
        # Create a file-like object from the content
        file_like = io.BytesIO(content)
        
        # Open as ZIP file (DOCX is a ZIP archive)
        with zipfile.ZipFile(file_like, 'r') as zip_file:
            # Read the main document XML
            doc_xml = zip_file.read('word/document.xml')
            
            # Parse the XML
            root = ET.fromstring(doc_xml)
            
            # Extract text from all text nodes
            texts = []
            for elem in root.iter():
                if elem.tag.endswith('}t'):  # Text elements
                    if elem.text:
                        texts.append(elem.text)
            
            return ' '.join(texts)
            
    except Exception as e:
        print(f"❌ Error extracting text from DOCX: {str(e)}")
        return f"[DOCX content extraction failed: {str(e)}]"

def get_file_content(service, file_id, file_name):
    """Get content of a file from Google Drive"""
    try:
        # Download the file
        request = service.files().get_media(fileId=file_id)
        content = request.execute()
        
        # Process based on file type
        if file_name.lower().endswith('.docx'):
            return extract_text_from_docx_content(content)
        elif file_name.lower().endswith('.txt'):
            return content.decode('utf-8', errors='ignore')
        else:
            return f"[File type not supported: {file_name}]"
            
    except Exception as e:
        print(f"❌ Error getting file content for {file_name}: {str(e)}")
        return f"[Error reading file: {file_name}]"

def list_files_recursive(service, folder_id, folder_path=""):
    """Recursively list all files in folders"""
    try:
        all_files = []
        
        # Get all items in the current folder
        query = f"'{folder_id}' in parents and trashed=false"
        results = service.files().list(
            q=query,
            fields="files(id, name, mimeType, parents)"
        ).execute()
        
        items = results.get('files', [])
        
        for item in items:
            item_path = f"{folder_path}/{item['name']}" if folder_path else item['name']
            
            if item['mimeType'] == 'application/vnd.google-apps.folder':
                # It's a folder, recurse into it
                subfolder_files = list_files_recursive(service, item['id'], item_path)
                all_files.extend(subfolder_files)
            else:
                # It's a file
                all_files.append({
                    'id': item['id'],
                    'name': item['name'],
                    'path': item_path,
                    'mimeType': item['mimeType']
                })
        
        return all_files
        
    except Exception as e:
        print(f"❌ Error listing files in folder {folder_id}: {str(e)}")
        return []

def store_vault_in_kv(vault_data):
    """Store vault data in Vercel KV"""
    try:
        kv_url = os.environ.get('KV_REST_API_URL')
        kv_token = os.environ.get('KV_REST_API_TOKEN')
        
        if not kv_url or not kv_token:
            print("⚠️ KV credentials not found, skipping KV storage")
            return False
        
        # Store the vault data
        response = requests.post(
            f"{kv_url}/set/sitemonkeys_vault",
            headers={
                'Authorization': f'Bearer {kv_token}',
                'Content-Type': 'application/json'
            },
            json={'value': vault_data}
        )
        
        if response.status_code == 200:
            print("✅ Vault data stored in KV successfully")
            return True
        else:
            print(f"❌ Failed to store in KV: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error storing vault in KV: {str(e)}")
        return False

def get_vault_from_kv():
    """Get vault data from Vercel KV"""
    try:
        kv_url = os.environ.get('KV_REST_API_URL')
        kv_token = os.environ.get('KV_REST_API_TOKEN')
        
        if not kv_url or not kv_token:
            return None
        
        response = requests.get(
            f"{kv_url}/get/sitemonkeys_vault",
            headers={'Authorization': f'Bearer {kv_token}'}
        )
        
        if response.status_code == 200:
            data = response.json()
            return data.get('result')
        else:
            return None
            
    except Exception as e:
        print(f"❌ Error getting vault from KV: {str(e)}")
        return None

def load_vault_from_drive():
    """Load complete vault from Google Drive"""
    print("🚀 Starting vault loading from Google Drive...")
    
    # Initialize Google Drive service
    service = get_google_drive_service()
    if not service:
        return {
            'status': 'error',
            'message': 'Failed to initialize Google Drive service'
        }
    
    try:
        # Get all files recursively
        print(f"📁 Scanning folder: {VAULT_FOLDER_ID}")
        all_files = list_files_recursive(service, VAULT_FOLDER_ID)
        
        if not all_files:
            return {
                'status': 'error',
                'message': 'No files found in vault folder'
            }
        
        print(f"📄 Found {len(all_files)} files")
        
        # Build vault content
        vault_sections = []
        vault_sections.append("=== SITEMONKEYS BUSINESS VALIDATION VAULT ===\n\n")
        
        # Process files by folder
        folders = {}
        for file_info in all_files:
            folder_path = '/'.join(file_info['path'].split('/')[:-1]) if '/' in file_info['path'] else 'ROOT'
            if folder_path not in folders:
                folders[folder_path] = []
            folders[folder_path].append(file_info)
        
        # Process each folder
        for folder_path, files in folders.items():
            vault_sections.append(f"\n=== FOLDER: {folder_path} ===\n")
            
            for file_info in files:
                print(f"📖 Processing: {file_info['path']}")
                
                vault_sections.append(f"\n--- FILE: {file_info['name']} ---\n")
                
                # Get file content
                content = get_file_content(service, file_info['id'], file_info['name'])
                vault_sections.append(content)
                vault_sections.append("\n" + "="*50 + "\n")
        
        # Add summary
        vault_sections.append(f"\n=== VAULT SUMMARY ===\nFolders: {len(folders)}\nFiles processed: {len(all_files)}\n")
        
        # Combine all sections
        vault_content = ''.join(vault_sections)
        
        # Calculate tokens (rough estimate: 4 characters per token)
        estimated_tokens = len(vault_content) // 4
        
        print(f"✅ Vault loading complete!")
        print(f"📊 Content size: {len(vault_content)} characters")
        print(f"🔢 Estimated tokens: {estimated_tokens}")
        
        vault_data = {
            'content': vault_content,
            'tokens': estimated_tokens,
            'files_processed': len(all_files),
            'folders_loaded': list(folders.keys()),
            'timestamp': json.dumps({"loaded": "now"}),
            'status': 'success'
        }
        
        # Store in KV
        store_vault_in_kv(vault_data)
        
        return {
            'status': 'success',
            'message': 'Vault loaded successfully',
            'data': vault_content,
            'vault_content': vault_content,
            'memory': vault_content,
            'tokens': estimated_tokens,
            'files_processed': len(all_files),
            'folders_loaded': list(folders.keys()),
            'estimated_cost': f"${(estimated_tokens * 0.03 / 1000):.4f}"
        }
        
    except Exception as e:
        error_msg = f"Error loading vault: {str(e)}"
        print(f"❌ {error_msg}")
        return {
            'status': 'error',
            'message': error_msg
        }

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Parse query parameters
            from urllib.parse import urlparse, parse_qs
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            
            # Check if this is a refresh request
            if 'refresh' in query_params and query_params['refresh'][0] == 'true':
                print("🔄 Refresh request - loading fresh from Google Drive")
                result = load_vault_from_drive()
                if result['status'] == 'success':
                    result['status'] = 'refreshed'
            else:
                # Try to get from KV first
                print("📖 Checking KV cache...")
                kv_data = get_vault_from_kv()
                
                if kv_data:
                    print("✅ Found vault data in KV cache")
                    result = {
                        'status': 'success',
                        'message': 'Vault loaded from cache',
                        'data': kv_data['content'],
                        'vault_content': kv_data['content'],
                        'memory': kv_data['content'],
                        'tokens': kv_data['tokens'],
                        'files_processed': kv_data['files_processed'],
                        'folders_loaded': kv_data['folders_loaded'],
                        'estimated_cost': f"${(kv_data['tokens'] * 0.03 / 1000):.4f}",
                        'cached': True
                    }
                else:
                    print("⚠️ No vault data in KV cache")
                    result = {
                        'status': 'empty',
                        'message': 'No vault data found. Please refresh vault first.',
                        'needs_refresh': True
                    }
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            print(f"❌ Handler error: {str(e)}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {
                'status': 'error',
                'message': f'Server error: {str(e)}'
            }
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
