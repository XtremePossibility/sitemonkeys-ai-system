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
import gzip
import base64

# Vault folder ID
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
        print(f"Using Project Number: {project_number}")
        
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

def store_vault_in_kv(vault_data):
    """Store vault data in Vercel KV using v2 key"""
    try:
        kv_url = os.environ.get('KV_REST_API_URL')
        kv_token = os.environ.get('KV_REST_API_TOKEN')
        
        if not kv_url or not kv_token:
            print("⚠️ KV environment variables not found")
            return False
            
        headers = {
            'Authorization': f'Bearer {kv_token}',
            'Content-Type': 'application/json'
        }
        
        # Convert to JSON and check size
        vault_json = json.dumps(vault_data)
        vault_size = len(vault_json)
        
        print(f"📊 Vault data size: {vault_size} bytes")
        
        # Compress if over 80KB
        if vault_size > 80000:
            print("🗜️ Compressing vault data...")
            compressed = gzip.compress(vault_json.encode('utf-8'))
            encoded = base64.b64encode(compressed).decode('utf-8')
            
            # Store compressed with metadata
            compressed_data = {
                "compressed": True,
                "data": encoded,
                "original_size": vault_size,
                "compressed_size": len(encoded)
            }
            
            response = requests.post(
                f'{kv_url}/set/sitemonkeys_vault_v2',
                headers=headers,
                data=json.dumps(compressed_data),
                timeout=30
            )
            
            print(f"📦 Compressed: {vault_size} → {len(encoded)} bytes")
        else:
            # Store uncompressed
            response = requests.post(
                f'{kv_url}/set/sitemonkeys_vault_v2',
                headers=headers,
                data=vault_json,
                timeout=30
            )
        
        print(f"🔑 KV Storage URL: {kv_url}/set/sitemonkeys_vault_v2")
        print(f"📤 KV Storage response status: {response.status_code}")
        print(f"📤 KV Storage response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Vault data stored in KV successfully")
            
            # Store master index separately for diagnostics
            master_index = {
                "folders_loaded": vault_data.get("folders_loaded", []),
                "total_files": vault_data.get("total_files", 0),
                "tokens": vault_data.get("tokens", 0),
                "estimated_cost": vault_data.get("estimated_cost", "$0.00"),
                "last_updated": vault_data.get("last_updated", "unknown"),
                "vault_status": "operational",
                "storage_method": "compressed" if vault_size > 80000 else "direct"
            }
            
            index_response = requests.post(
                f'{kv_url}/set/sitemonkeys_vault_v2_index',
                headers=headers,
                data=json.dumps(master_index),
                timeout=30
            )
            
            print(f"📋 Index storage status: {index_response.status_code}")
            return True
        else:
            print(f"❌ KV storage failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ KV storage error: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return False

def get_vault_from_kv():
    """Retrieve vault data from Vercel KV using v2 key"""
    try:
        kv_url = os.environ.get('KV_REST_API_URL')
        kv_token = os.environ.get('KV_REST_API_TOKEN')
        
        if not kv_url or not kv_token:
            print("⚠️ KV environment variables not found for retrieval")
            return None
            
        headers = {
            'Authorization': f'Bearer {kv_token}',
        }
        
        response = requests.get(
            f'{kv_url}/get/sitemonkeys_vault_v2',
            headers=headers,
            timeout=30
        )
        
        print(f"🔍 KV Retrieval URL: {kv_url}/get/sitemonkeys_vault_v2")
        print(f"📥 KV Retrieval response status: {response.status_code}")
        print(f"📥 KV Retrieval response length: {len(response.text) if response.text else 0}")
        
        if response.status_code == 200:
            try:
                response_text = response.text.strip()
                if response_text and response_text != 'null':
                    # Try to parse as JSON
                    data = json.loads(response_text)
                    
                    # Check if it's compressed
                    if isinstance(data, dict) and data.get("compressed"):
                        print("🗜️ Decompressing vault data...")
                        compressed_data = base64.b64decode(data["data"])
                        decompressed = gzip.decompress(compressed_data)
                        result = json.loads(decompressed.decode('utf-8'))
                        print(f"📦 Decompressed: {data.get('compressed_size', 0)} → {data.get('original_size', 0)} bytes")
                    else:
                        result = data
                    
                    print(f"✅ Retrieved vault data from KV: {len(str(result))} characters")
                    return result
                else:
                    print("⚠️ No vault data found in KV (null response)")
                    return None
                    
            except json.JSONDecodeError as e:
                print(f"❌ Failed to parse KV response as JSON: {e}")
                print(f"Raw response: {response.text[:500]}...")
                return None
        else:
            print(f"❌ KV retrieval failed: {response.status_code}")
            print(f"Error response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ KV retrieval error: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
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
        
        vault_content += f"\n=== LIVE VAULT FOLDERS LOADED ({len(loaded_folders)} folders) ===\n"
        
        # ZERO-FAILURE: Filter to only the 3 required folders
        target_folders = ['00_EnforcementShell', '01_Core_Directives', 'VAULT_MEMORY_FILES']
        
        for folder in folders:
            folder_name = folder['name']
            
            # Skip folders not in our target list
            if folder_name not in target_folders:
                print(f"⏭️ Skipping folder: {folder_name} (not in target list)")
                continue
                
            loaded_folders.append(folder_name)
            vault_content += f"\n--- FOLDER: {folder_name} ---\n"
            
            # Get files in each folder
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
                    
                    if 'text/plain' in file_mime or file_name.endswith('.txt'):
                        try:
                            file_data = service.files().get_media(fileId=file['id']).execute()
                            file_content = file_data.decode('utf-8')
                            print(f"✅ Text file loaded: {len(file_content)} characters")
                        except Exception as e:
                            file_content = f"[ERROR reading text file: {str(e)}]"
                            print(f"❌ Text file error: {str(e)}")
                    
                    elif file_mime == 'application/vnd.google-apps.document':
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
                        try:
                            print(f"🔄 Downloading DOCX file: {file_name}")
                            file_data = service.files().get_media(fileId=file['id']).execute()
                            print(f"📥 Downloaded {len(file_data)} bytes")
                            
                            file_content = extract_text_from_docx(file_data)
                            
                            if file_content.startswith('[DOCX text extraction failed'):
                                print(f"❌ DOCX extraction failed: {file_name}")
                            else:
                                print(f"✅ DOCX text extracted: {len(file_content)} characters")
                                
                        except Exception as e:
                            file_content = f"[DOCX file - Access failed: {str(e)}]"
                            print(f"❌ DOCX access error: {str(e)}")
                    
                    elif file_mime == 'application/vnd.google-apps.folder':
                        continue
                    
                    else:
                        file_size = file.get('size', 'Unknown')
                        file_content = f"[File type: {file_mime} - Size: {file_size} bytes - Skipped unsupported format]"
                        print(f"⏭️ Skipped unsupported file: {file_name}")
                    
                    vault_content += f"\n=== {file_name} ===\n{file_content}\n"
                    
                except Exception as file_error:
                    vault_content += f"\n=== {file['name']} ===\n[ERROR loading file: {str(file_error)}]\n"
                    print(f"❌ File processing error: {file['name']} - {str(file_error)}")
        
        vault_content += f"\n=== VAULT SUMMARY ===\nFolders: {len(loaded_folders)}\nFiles processed: {total_files}\n"
        
        print(f"✅ Vault loaded successfully: {len(folders)} folders, {total_files} files")
        print(f"📊 Total vault content: {len(vault_content)} characters")
                      
    except Exception as drive_error:
        print(f"❌ Google Drive error: {str(drive_error)}")
        vault_content += f"\n[Google Drive connection error: {str(drive_error)}]\n"
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
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            is_refresh = 'refresh' in query_params and query_params['refresh'][0] == 'true'
            
            if is_refresh:
                print("🔄 Refresh requested - loading fresh vault data...")
                
                vault_memory, loaded_folders, total_files = load_vault_content()
                
                token_count = len(vault_memory) // 4
                estimated_cost = (token_count * 0.002) / 1000
                
                vault_data = {
                    "vault_content": vault_memory,
                    "tokens": token_count,
                    "estimated_cost": f"${estimated_cost:.4f}",
                    "folders_loaded": loaded_folders,
                    "total_files": total_files,
                    "last_updated": "refresh_requested",
                    "vault_status": "operational"
                }
                
                kv_stored = store_vault_in_kv(vault_data)
                
                print(f"📊 Vault refresh complete: {token_count} tokens, {len(loaded_folders)} folders")
                
                response = {
                    "status": "refreshed",
                    "vault_content": vault_memory,
                    "tokens": token_count,
                    "estimated_cost": f"${estimated_cost:.4f}",
                    "folders_loaded": loaded_folders,
                    "total_files": total_files,
                    "kv_stored": kv_stored,
                    "message": f"Vault refreshed: {len(loaded_folders)} folders, {total_files} files",
                    "vault_status": "operational"
                }
                
            else:
                print("📖 Checking for cached vault data...")
                
                cached_vault = get_vault_from_kv()
                
                if cached_vault and isinstance(cached_vault, dict) and cached_vault.get("vault_content"):
                    print("✅ Found valid cached vault data in KV")
                    response = {
                        "status": "success",
                        "vault_content": cached_vault.get("vault_content", ""),
                        "tokens": cached_vault.get("tokens", 0),
                        "estimated_cost": cached_vault.get("estimated_cost", "$0.00"),
                        "folders_loaded": cached_vault.get("folders_loaded", []),
                        "total_files": cached_vault.get("total_files", 0),
                        "vault_status": cached_vault.get("vault_status", "operational"),
                        "message": "Using cached vault data from KV"
                    }
                else:
                    print("⚠️ No valid cached vault data found")
                    response = {
                        "status": "success",
                        "needs_refresh": True,
                        "vault_content": "",
                        "tokens": 0,
                        "estimated_cost": "$0.00",
                        "folders_loaded": [],
                        "total_files": 0,
                        "vault_status": "needs_refresh",
                        "message": "No vault data found - please refresh"
                    }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            print(f"❌ Vault operation failed: {str(e)}")
            error_response = {
                "status": "error",
                "error": str(e),
                "vault_status": "error",
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
