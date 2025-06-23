import json
import os
from http.server import BaseHTTPRequestHandler
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

# Your exact Google Drive folder ID
VAULT_FOLDER_ID = "1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM"

def get_google_drive_service():
    """Initialize Google Drive service with credentials"""
    try:
        # Get credentials from environment variable
        creds_json = os.environ.get('GOOGLE_CREDENTIALS_JSON')
        if not creds_json:
            raise Exception("GOOGLE_CREDENTIALS_JSON environment variable not found")
        
        # Parse credentials
        creds_info = json.loads(creds_json)
        creds = Credentials.from_service_account_info(
            creds_info,
            scopes=['https://www.googleapis.com/auth/drive.readonly']
        )
        
        # Build and return service
        return build('drive', 'v3', credentials=creds)
    except Exception as e:
        raise Exception(f"Google Drive authentication failed: {str(e)}")

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
                    
                    # Handle different file types
                    if 'text/plain' in file_mime or file_name.endswith('.txt'):
                        # Plain text files
                        try:
                            file_data = service.files().get_media(fileId=file['id']).execute()
                            file_content = file_data.decode('utf-8')
                        except Exception as e:
                            file_content = f"[ERROR reading text file: {str(e)}]"
                    
                    elif file_mime == 'application/vnd.google-apps.document':
                        # Google Docs - export as plain text
                        try:
                            export_data = service.files().export(
                                fileId=file['id'], 
                                mimeType='text/plain'
                            ).execute()
                            file_content = export_data.decode('utf-8')
                        except Exception as e:
                            # If export fails, try to get file info
                            file_content = f"[Google Doc - Export failed: {str(e)}]"
                    
                    elif 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' in file_mime or file_name.endswith('.docx'):
                        # DOCX files - try export first, then direct download
                        try:
                            # Try exporting as plain text
                            export_data = service.files().export(
                                fileId=file['id'], 
                                mimeType='text/plain'
                            ).execute()
                            file_content = export_data.decode('utf-8')
                        except:
                            try:
                                # If export fails, download directly
                                file_data = service.files().get_media(fileId=file['id']).execute()
                                file_content = f"[DOCX file downloaded - {len(file_data)} bytes - content extraction may require additional processing]"
                            except Exception as e:
                                file_content = f"[DOCX file - Access failed: {str(e)}]"
                    
                    elif file_mime == 'application/vnd.google-apps.folder':
                        # Skip folders (already handled above)
                        continue
                    
                    else:
                        # Other file types
                        file_size = file.get('size', 'Unknown')
                        file_content = f"[File type: {file_mime} - Size: {file_size} bytes - Skipped unsupported format]"
                    
                    # Add content to vault
                    vault_content += f"\n=== {file_name} ===\n{file_content}\n"
                    
                except Exception as file_error:
                    vault_content += f"\n=== {file['name']} ===\n[ERROR loading file: {str(file_error)}]\n"
        
        vault_content += f"\n=== VAULT SUMMARY ===\nFolders: {len(folders)}\nFiles processed: {total_files}\n"
        
        # Log successful loading
        print(f"Vault loaded successfully: {len(folders)} folders, {total_files} files")
                    
    except Exception as drive_error:
        print(f"Google Drive error: {str(drive_error)}")
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
            # Load actual vault content from Google Drive
            vault_memory, loaded_folders, total_files = load_vault_content()
            
            # Calculate tokens (rough estimate)
            token_count = len(vault_memory) // 4
            estimated_cost = (token_count * 0.002) / 1000
            
            # Return JSON response
            response = {
                "status": "success",
                "memory": vault_memory,
                "data": vault_memory,
                "vault_content": vault_memory,
                "tokens": token_count,
                "estimated_cost": f"${estimated_cost:.4f}",
                "folders_loaded": loaded_folders,
                "total_files": total_files,
                "message": f"SiteMonkeys Vault: {len(loaded_folders)} folders, {total_files} files, {token_count} tokens loaded"
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            error_response = {
                "status": "error",
                "error": str(e),
                "message": "Vault loading failed - check Google Drive permissions"
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
