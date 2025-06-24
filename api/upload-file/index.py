Well when youimport json
import io
import zipfile
import xml.etree.ElementTree as ET
from http.server import BaseHTTPRequestHandler
import requests
import os
import cgi
from urllib.parse import parse_qs

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

def store_file_in_kv(folder_name, file_name, content):
    """Store individual file in KV with organized key structure"""
    try:
        kv_url = os.environ.get('KV_REST_API_URL')
        kv_token = os.environ.get('KV_REST_API_TOKEN')
        
        if not kv_url or not kv_token:
            print("⚠️ KV environment variables not found")
            return False, "KV environment variables not configured"
            
        # Clean the key - remove special characters that might cause issues
        clean_folder = folder_name.replace('/', '_').replace(' ', '_')
        clean_file = file_name.replace('/', '_').replace(' ', '_')
        kv_key = f"sitemonkeys_vault_{clean_folder}_{clean_file}"
        
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
        
        print(f"KV Storage - Status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✅ Stored: {clean_folder}/{clean_file}")
            return True, "File stored successfully"
        else:
            error_msg = f"KV storage failed: {response.status_code} - {response.text}"
            print(f"❌ {error_msg}")
            return False, error_msg
            
    except Exception as e:
        error_msg = f"KV storage error: {str(e)}"
        print(f"❌ {error_msg}")
        return False, error_msg

def detect_folder_from_filename(filename):
    """Smart folder detection based on filename"""
    name = filename.lower()
    
    if 'enforcement' in name or 'zero-failure' in name:
        return '00_EnforcementShell'
    elif 'directive' in name or 'service' in name or 'roadmap' in name or 'implementation' in name:
        return '01_Core_Directives'
    elif 'legal' in name or 'nda' in name or 'terms' in name or 'privacy' in name or 'contract' in name:
        return '02_Legal'
    elif 'ai' in name or 'tuning' in name:
        return '03_AI_Tuning'
    elif 'session' in name or 'log' in name:
        return '04_SessionLogs'
    elif 'contractor' in name or 'handoff' in name:
        return '05_Complete_Contractor_Handoff'
    elif 'template' in name or 'reply' in name:
        return '06_AutoReplyTemplates'
    else:
        return 'VAULT_MEMORY_FILES'  # Default folder

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        try:
            print("📤 File upload request received")
            
            # Parse multipart form data
            content_type = self.headers.get('content-type')
            if not content_type or not content_type.startswith('multipart/form-data'):
                response = {
                    "status": "error",
                    "message": "Invalid content type. Expected multipart/form-data."
                }
                self.wfile.write(json.dumps(response).encode())
                return
            
            # Get the boundary from content-type header
            boundary = content_type.split('boundary=')[1]
            
            # Read the POST data
            content_length = int(self.headers.get('content-length', 0))
            post_data = self.rfile.read(content_length)
            
            # Parse the multipart data
            form_data = cgi.parse_multipart(
                io.BytesIO(post_data), 
                {'boundary': boundary.encode()}
            )
            
            uploaded_files = []
            
            # Process uploaded files
            if 'files' in form_data:
                files = form_data['files']
                for file_data in files:
                    # For multipart uploads, we need to parse the file info
                    # This is a simplified version - in production, use a proper multipart parser
                    if isinstance(file_data, bytes) and len(file_data) > 0:
                        # Extract filename from form data (simplified)
                        filename = "uploaded_file.docx"  # Default name
                        
                        # Try to extract text from DOCX
                        if file_data.startswith(b'PK'):  # DOCX signature
                            extracted_text = extract_text_from_docx(file_data)
                            
                            if not extracted_text.startswith('[DOCX text extraction failed'):
                                # Detect appropriate folder
                                folder = detect_folder_from_filename(filename)
                                
                                # Store in KV
                                success, message = store_file_in_kv(folder, filename, extracted_text)
                                
                                uploaded_files.append({
                                    "filename": filename,
                                    "folder": folder,
                                    "success": success,
                                    "message": message,
                                    "content_length": len(extracted_text)
                                })
                            else:
                                uploaded_files.append({
                                    "filename": filename,
                                    "success": False,
                                    "message": "Failed to extract text from DOCX"
                                })
                        else:
                            uploaded_files.append({
                                "filename": filename,
                                "success": False,
                                "message": "Invalid file format (not DOCX)"
                            })
            
            successful_uploads = len([f for f in uploaded_files if f.get('success')])
            
            response = {
                "status": "success" if successful_uploads > 0 else "error",
                "message": f"Processed {len(uploaded_files)} files, {successful_uploads} uploaded successfully",
                "files": uploaded_files,
                "total_files": len(uploaded_files),
                "successful_uploads": successful_uploads
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            print(f"❌ Upload error: {str(e)}")
            error_response = {
                "status": "error",
                "message": f"Upload failed: {str(e)}"
            }
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers() do
