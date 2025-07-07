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

# ✅ SIMPLIFIED VAULT STRUCTURE (POST-CONSOLIDATION)
EXPECTED_AUTO_LOAD_FILES = [
    "00_EnforcementShell/00_EnforcementCore.docx",
    "01_Core_Directives/01_CoreDirectives.docx", 
    "VAULT_MEMORY_FILES/VAULT_MEMORY_FILES.docx"  # ← THIS REPLACES 6 SEPARATE FILES
]

# Manual load folders (unchanged)
MANUAL_LOAD_FOLDERS = [
    "02_Legal/",
    "05_Complete_Contractor_Handoff/", 
    "06_AutoReplyTemplates.md/"
]

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

def store_vault_in_kv(vault_data):
    """Store vault data in Vercel KV - FIXED FOR 400 ERRORS"""
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
        
        # ✅ COMPRESS VAULT DATA TO AVOID SIZE LIMITS
        vault_content = vault_data.get("vault_content", "")
        
        # If content is too large, compress it
        if len(vault_content) > 80000:  # 80KB limit
            print(f"⚠️ Vault content large ({len(vault_content)} chars), compressing...")
            # Keep only essential sections
            lines = vault_content.split('\n')
            compressed_lines = []
            skip_section = False
            
            for line in lines:
                # Skip very long sections but keep headers
                if line.startswith('===') or line.startswith('---'):
                    compressed_lines.append(line)
                    skip_section = False
                elif len(line) > 500:  # Skip very long lines
                    if not skip_section:
                        compressed_lines.append("[Large content section - truncated for KV storage]")
                        skip_section = True
                else:
                    compressed_lines.append(line)
                    skip_section = False
            
            vault_content = '\n'.join(compressed_lines)
            print(f"📦 Compressed vault to {len(vault_content)} characters")
        
        # ✅ CREATE SMALLER PAYLOAD
        compressed_vault_data = {
            "vault_content": vault_content,
            "tokens": vault_data.get("tokens", 0),
            "estimated_cost": vault_data.get("estimated_cost", "$0.00"),
            "folders_loaded": vault_data.get("folders_loaded", []),
            "total_files": vault_data.get("total_files", 0),
            "structure_version": "simplified_post_consolidation",
            "last_updated": vault_data.get("last_updated", "now"),
            "compression_applied": len(vault_content) != len(vault_data.get("vault_content", ""))
        }
        
        # ✅ STORE MASTER INDEX FIRST (SMALLER)
        master_index = {
            "vault_structure": "simplified_post_consolidation", 
            "auto_load_files": EXPECTED_AUTO_LOAD_FILES,
            "manual_load_folders": MANUAL_LOAD_FOLDERS,
            "last_updated": vault_data.get("last_updated", "now"),
            "total_tokens": vault_data.get("tokens", 0),
            "total_files": vault_data.get("total_files", 0)
        }
        
        print(f"📤 Storing master index ({len(json.dumps(master_index))} bytes)...")
        response = requests.post(
            f'{kv_url}/set/sitemonkeys_vault/_master_index',
            headers=headers,
            json=master_index,
            timeout=30
        )
        
        print(f"Master index response: {response.status_code}")
        if response.status_code != 200:
            print(f"❌ Master index storage failed: {response.status_code} - {response.text}")
            return False
        
        # ✅ STORE MAIN VAULT CONTENT
        print(f"📤 Storing main vault ({len(json.dumps(compressed_vault_data))} bytes)...")
        response = requests.post(
            f'{kv_url}/set/sitemonkeys_vault',
            headers=headers,
            json=compressed_vault_data,
            timeout=30
        )
        
        print(f"Main vault response: {response.status_code}")
        if response.status_code == 200:
            print("✅ Vault data stored in KV successfully")
            return True
        else:
            print(f"❌ KV storage failed: {response.status_code} - {response.text}")
            print(f"Payload size: {len(json.dumps(compressed_vault_data))} bytes")
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
            print("⚠️ KV environment variables not found for retrieval")
            return None
            
        headers = {
            'Authorization': f'Bearer {kv_token}',
        }
        
        response = requests.get(
            f'{kv_url}/get/sitemonkeys_vault',
            headers=headers,
            timeout=30
        )
        
        print(f"KV Retrieval response status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                response_text = response.text.strip()
                if response_text and response_text != 'null':
                    result = json.loads(response_text)
                    print(f"✅ Retrieved vault data from KV: {len(str(result))} characters")
                    return result
                else:
                    print("⚠️ No vault data found in KV (null response)")
                    return None
                    
            except json.JSONDecodeError as e:
                print(f"❌ Failed to parse KV response as JSON: {e}")
                return None
        else:
            print(f"❌ KV retrieval failed: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ KV retrieval error: {str(e)}")
        return None

def load_vault_content_simplified():
    """Load vault content using NEW SIMPLIFIED STRUCTURE"""
    vault_content = "=== SITEMONKEYS BUSINESS VALIDATION VAULT ===\n\n"
    loaded_folders = []
    total_files = 0
    
    try:
        service = get_google_drive_service()
        
        print("🔄 Loading simplified vault structure...")
        
        # ✅ STEP 1: Get all subfolders first
        query = f"'{VAULT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder'"
        folders_result = service.files().list(q=query, fields="files(id, name)", pageSize=50).execute()
        all_folders = folders_result.get('files', [])
        
        print(f"📁 Found {len(all_folders)} total folders in vault")
        
        # ✅ STEP 2: Process only the expected auto-load folders
        expected_folder_names = ["00_EnforcementShell", "01_Core_Directives", "VAULT_MEMORY_FILES"]
        
        for expected_folder in expected_folder_names:
            print(f"\n🔍 Looking for folder: {expected_folder}")
            
            # Find matching folder
            matching_folder = None
            for folder in all_folders:
                if folder['name'] == expected_folder:
                    matching_folder = folder
                    break
            
            if not matching_folder:
                print(f"⚠️ Folder not found: {expected_folder}")
                vault_content += f"\n--- FOLDER MISSING: {expected_folder} ---\n"
                continue
            
            loaded_folders.append(expected_folder)
            vault_content += f"\n--- FOLDER: {expected_folder} ---\n"
            
            # ✅ STEP 3: Get files in this folder
            file_query = f"'{matching_folder['id']}' in parents"
            files_result = service.files().list(
                q=file_query, 
                fields="files(id, name, mimeType, size)",
                pageSize=100
            ).execute()
            files = files_result.get('files', [])
            
            print(f"📄 Found {len(files)} files in {expected_folder}")
            total_files += len(files)
            
            # ✅ STEP 4: Process each file
            for file in files:
                try:
                    file_content = ""
                    file_mime = file.get('mimeType', '')
                    file_name = file['name']
                    
                    print(f"  Processing: {file_name}")
                    
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
                        
                    else:
                        file_size = file.get('size', 'Unknown')
                        file_content = f"[File type: {file_mime} - Size: {file_size} bytes - Skipped unsupported format]"
                    
                    # Add content to vault
                    vault_content += f"\n=== {file_name} ===\n{file_content}\n"
                    print(f"  ✅ Loaded: {len(file_content)} characters")
                    
                except Exception as file_error:
                    vault_content += f"\n=== {file['name']} ===\n[ERROR loading file: {str(file_error)}]\n"
                    print(f"  ❌ Error: {file['name']} - {str(file_error)}")
        
        # ✅ FINAL SUMMARY
        vault_content += f"\n=== VAULT SUMMARY ===\nAuto-load folders: {len(loaded_folders)}\nFiles processed: {total_files}\nStructure: Simplified (post-consolidation)\n"
        
        print(f"✅ Vault loaded successfully: {len(loaded_folders)} folders, {total_files} files")
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
            # Parse URL to check for refresh parameter
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            is_refresh = 'refresh' in query_params and query_params['refresh'][0] == 'true'
            
            if is_refresh:
                print("🔄 Refresh requested - loading fresh vault data using SIMPLIFIED STRUCTURE...")
                
                # ✅ Load fresh vault content using new simplified structure
                vault_memory, loaded_folders, total_files = load_vault_content_simplified()
                
                # Calculate tokens (rough estimate)
                token_count = len(vault_memory) // 4
                estimated_cost = (token_count * 0.002) / 1000
                
                # ✅ Create vault data package with new structure info
                vault_data = {
                    "vault_content": vault_memory,
                    "tokens": token_count,
                    "estimated_cost": f"${estimated_cost:.4f}",
                    "folders_loaded": loaded_folders,
                    "total_files": total_files,
                    "structure_version": "simplified_post_consolidation",
                    "auto_load_files": EXPECTED_AUTO_LOAD_FILES,
                    "last_updated": "now"
                }
                
                # Store in KV with corrected structure
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
                    "structure_info": "Using simplified post-consolidation structure",
                    "message": f"Vault refreshed: {len(loaded_folders)} folders, {total_files} files"
                }
                
            else:
                print("📖 Checking for cached vault data...")
                
                # Try to get vault data from KV first
                cached_vault = get_vault_from_kv()
                
                if cached_vault:
                    print("✅ Found cached vault data in KV")
                    if isinstance(cached_vault, dict):
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
                        response = {
                            "status": "success",
                            "needs_refresh": True,
                            "vault_content": "",
                            "tokens": 0,
                            "estimated_cost": "$0.00",
                            "folders_loaded": [],
                            "total_files": 0,
                            "message": "Cached data format error - please refresh"
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
