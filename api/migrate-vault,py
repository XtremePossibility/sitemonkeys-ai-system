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
        with zipfile.ZipFile(io.BytesIO(docx_data), 'r') as zip_file:
            document_xml = zip_file.read('word/document.xml')
            root = ET.fromstring(document_xml)
            
            namespaces = {
                'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
            }
            
            text_elements = root.findall('.//w:t', namespaces)
            text_content = []
            
            for elem in text_elements:
                if elem.text:
                    text_content.append(elem.text)
            
            extracted_text = ' '.join(text_content)
            lines = extracted_text.split('\n')
            cleaned_lines = [line.strip() for line in lines if line.strip()]
            
            return '\n'.join(cleaned_lines)
            
    except Exception as e:
        return f"[DOCX text extraction failed: {str(e)}]"

def get_google_drive_service():
    """Initialize Google Drive service with credentials"""
    try:
        creds_json = os.environ.get('GOOGLE_CREDENTIALS_JSON')
        project_id = os.environ.get('GOOGLE_PROJECT_ID')
        project_number = os.environ.get('GOOGLE_PROJECT_NUMBER')
        
        if not creds_json:
            raise Exception("GOOGLE_CREDENTIALS_JSON environment variable not found")
        if not project_id:
            raise Exception("GOOGLE_PROJECT_ID environment variable not found")
        
        print(f"Using Project ID: {project_id}")
        
        creds_info = json.loads(creds_json)
        creds_info['project_id'] = project_id
        if project_number:
            creds_info['project_number'] = project_number
            
        creds = Credentials.from_service_account_info(
            creds_info,
            scopes=['https://www.googleapis.com/auth/drive.readonly']
        )
        
        return build('drive', 'v3', credentials=creds)
    except Exception as e:
        raise Exception(f"Google Drive authentication failed: {str(e)}")

def store_file_in_kv(folder_name, file_name, content):
    """Store individual file in KV with organized key structure"""
    try:
        kv_url = os.environ.get('KV_REST_API_URL')
        kv_token = os.environ.get('KV_REST_API_TOKEN')
        
        if not kv_url or not kv_token:
            print("⚠️ KV environment variables not found")
            return False
            
        # Create hierarchical key: folder/filename
        kv_key = f"sitemonkeys_vault/{folder_name}/{file_name}"
        
        headers = {
            'Authorization': f'Bearer {kv_token}',
        }
        
        # Store file content
        response = requests.post(
            f'{kv_url}/set/{kv_key}',
            headers=headers,
            data=content.encode('utf-8'),
            timeout=30
        )
        
        if response.status_code == 200:
            print(f"✅ Stored: {folder_name}/{file_name}")
            return True
        else:
            print(f"❌ Failed to store {folder_name}/{file_name}: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ KV storage error for {folder_name}/{file_name}: {str(e)}")
        return False

def store_folder_index_in_kv(folder_name, file_list):
    """Store folder index (list of files) in KV"""
    try:
        kv_url = os.environ.get('KV_REST_API_URL')
        kv_token = os.environ.get('KV_REST_API_TOKEN')
        
        if not kv_url or not kv_token:
            return False
            
        kv_key = f"sitemonkeys_vault/{folder_name}/_index"
        
        headers = {
            'Authorization': f'Bearer {kv_token}',
        }
        
        folder_index = {
            "folder_name": folder_name,
            "files": file_list,
            "file_count": len(file_list),
            "last_updated": "migration"
        }
        
        response = requests.post(
            f'{kv_url}/set/{kv_key}',
            headers=headers,
            data=json.dumps(folder_index),
            timeout=30
        )
        
        if response.status_code == 200:
            print(f"✅ Stored folder index: {folder_name} ({len(file_list)} files)")
            return True
        else:
            print(f"❌ Failed to store folder index: {folder_name}")
            return False
            
    except Exception as e:
        print(f"❌ Folder index error: {str(e)}")
        return False

def migrate_vault_to_kv():
    """Migrate all vault content from Google Drive to KV storage"""
    print("🚀 Starting Google Drive → KV migration...")
    
    migration_stats = {
        "folders_processed": 0,
        "files_processed": 0,
        "files_stored": 0,
        "errors": []
    }
    
    try:
        service = get_google_drive_service()
        
        # Get all subfolders in vault
        query = f"'{VAULT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder'"
        folders_result = service.files().list(q=query, fields="files(id, name)", pageSize=50).execute()
        folders = folders_result.get('files', [])
        
        print(f"📁 Found {len(folders)} folders to migrate")
        
        for folder in folders:
            folder_name = folder['name']
            print(f"\n📂 Processing folder: {folder_name}")
            migration_stats["folders_processed"] += 1
            
            # Get files in this folder
            file_query = f"'{folder['id']}' in parents"
            files_result = service.files().list(
                q=file_query, 
                fields="files(id, name, mimeType, size)",
                pageSize=100
            ).execute()
            files = files_result.get('files', [])
            
            folder_file_list = []
            
            for file in files:
                file_name = file['name']
                file_mime = file.get('mimeType', '')
                migration_stats["files_processed"] += 1
                
                print(f"  📄 Processing: {file_name}")
                
                try:
                    file_content = ""
                    
                    # Handle different file types
                    if 'text/plain' in file_mime or file_name.endswith('.txt'):
                        file_data = service.files().get_media(fileId=file['id']).execute()
                        file_content = file_data.decode('utf-8')
                        
                    elif file_mime == 'application/vnd.google-apps.document':
                        export_data = service.files().export(
                            fileId=file['id'], 
                            mimeType='text/plain'
                        ).execute()
                        file_content = export_data.decode('utf-8')
                        
                    elif 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' in file_mime or file_name.endswith('.docx'):
                        file_data = service.files().get_media(fileId=file['id']).execute()
                        file_content = extract_text_from_docx(file_data)
                        
                    elif file_mime == 'application/vnd.google-apps.folder':
                        # Handle subfolders
                        print(f"    📁 Subfolder detected: {file_name}")
                        # TODO: Handle subfolders recursively if needed
                        continue
                        
                    else:
                        file_size = file.get('size', 'Unknown')
                        file_content = f"[File type: {file_mime} - Size: {file_size} bytes - Unsupported format]"
                    
                    # Store in KV
                    if file_content and not file_content.startswith('[DOCX text extraction failed'):
                        if store_file_in_kv(folder_name, file_name, file_content):
                            migration_stats["files_stored"] += 1
                            folder_file_list.append(file_name)
                        else:
                            migration_stats["errors"].append(f"Failed to store: {folder_name}/{file_name}")
                    else:
                        migration_stats["errors"].append(f"No content extracted: {folder_name}/{file_name}")
                        
                except Exception as file_error:
                    error_msg = f"Error processing {folder_name}/{file_name}: {str(file_error)}"
                    migration_stats["errors"].append(error_msg)
                    print(f"    ❌ {error_msg}")
            
            # Store folder index
            if folder_file_list:
                store_folder_index_in_kv(folder_name, folder_file_list)
        
        # Store overall vault index
        vault_index = {
            "total_folders": migration_stats["folders_processed"],
            "total_files": migration_stats["files_stored"],
            "migration_date": "now",
            "status": "completed"
        }
        
        kv_url = os.environ.get('KV_REST_API_URL')
        kv_token = os.environ.get('KV_REST_API_TOKEN')
        
        if kv_url and kv_token:
            headers = {'Authorization': f'Bearer {kv_token}'}
            requests.post(
                f'{kv_url}/set/sitemonkeys_vault/_master_index',
                headers=headers,
                data=json.dumps(vault_index),
                timeout=30
            )
        
        print(f"\n🎉 MIGRATION COMPLETE!")
        print(f"📊 Statistics:")
        print(f"   Folders processed: {migration_stats['folders_processed']}")
        print(f"   Files processed: {migration_stats['files_processed']}")
        print(f"   Files stored in KV: {migration_stats['files_stored']}")
        print(f"   Errors: {len(migration_stats['errors'])}")
        
        if migration_stats['errors']:
            print(f"\n⚠️ Errors encountered:")
            for error in migration_stats['errors'][:5]:  # Show first 5 errors
                print(f"   - {error}")
                
    except Exception as drive_error:
        print(f"❌ Migration failed: {str(drive_error)}")
        migration_stats["errors"].append(f"Drive error: {str(drive_error)}")
    
    return migration_stats

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        try:
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            is_migration = 'migrate' in query_params and query_params['migrate'][0] == 'true'
            
            if is_migration:
                print("🔄 Migration requested - starting Google Drive → KV migration...")
                migration_results = migrate_vault_to_kv()
                
                response = {
                    "status": "migration_complete",
                    "message": f"Migrated {migration_results['files_stored']} files from Google Drive to KV",
                    "statistics": migration_results
                }
            else:
                # Regular status check
                response = {
                    "status": "ready",
                    "message": "Ready for migration. Add ?migrate=true to start.",
                    "instruction": "Visit /api/migrate-vault?migrate=true to start migration"
                }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            print(f"❌ Migration handler error: {str(e)}")
            error_response = {
                "status": "error",
                "error": str(e),
                "message": "Migration failed"
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
