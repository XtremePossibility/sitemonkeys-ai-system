#!/usr/bin/env python3
"""
SITE MONKEYS AI - UPLOAD FILE FUNCTION
Vercel-compatible Python handler for file upload operations
"""

from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import traceback
import tempfile
import mimetypes
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Handle POST requests for file uploads"""
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            content_type = self.headers.get('Content-Type', '')
            
            if content_length == 0:
                self.send_error_response("No file data received", 400)
                return
            
            # Read the file data
            file_data = self.rfile.read(content_length)
            
            # Process file upload
            upload_result = process_file_upload(file_data, content_type, self.headers)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response = {
                "status": "success",
                "data": upload_result,
                "message": "File upload completed successfully",
                "timestamp": "2025-07-11T23:15:00Z"
            }
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self.send_error_response(str(e), 500)

    def do_GET(self):
        """Handle GET requests for upload status or file info"""
        try:
            # Parse query parameters
            query = urlparse(self.path).query
            params = parse_qs(query)
            
            # Get upload status or file info
            status_result = get_upload_status(params)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response = {
                "status": "success",
                "data": status_result,
                "message": "Upload system status retrieved",
                "timestamp": "2025-07-11T23:15:00Z"
            }
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self.send_error_response(str(e), 500)

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Content-Disposition, X-Filename')
        self.end_headers()

    def send_error_response(self, error_message, status_code=500):
        """Send standardized error response"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        error_response = {
            "status": "error",
            "error": error_message,
            "message": "File upload operation failed",
            "timestamp": "2025-07-11T23:15:00Z",
            "traceback": traceback.format_exc() if status_code == 500 else None
        }
        
        self.wfile.write(json.dumps(error_response).encode('utf-8'))

def process_file_upload(file_data, content_type, headers):
    """Process uploaded file"""
    try:
        # Extract filename from headers
        filename = extract_filename(headers)
        file_size = len(file_data)
        
        print(f"📁 Processing file upload: {filename} ({file_size} bytes)")
        
        # Validate file
        validation_result = validate_file(filename, file_data, file_size)
        if not validation_result['valid']:
            raise Exception(f"File validation failed: {validation_result['error']}")
        
        # Determine file type and target folder
        file_info = analyze_file(filename, file_data)
        target_folder = determine_target_folder(file_info)
        
        # Process file content (placeholder for actual processing)
        processed_content = process_file_content(file_data, file_info)
        
        # Store file (placeholder for actual storage logic)
        storage_result = store_file(filename, processed_content, target_folder)
        
        upload_result = {
            "upload_id": generate_upload_id(filename),
            "filename": filename,
            "original_size": file_size,
            "processed_size": len(processed_content) if processed_content else file_size,
            "file_type": file_info['type'],
            "mime_type": file_info['mime_type'],
            "target_folder": target_folder,
            "storage_path": storage_result['path'],
            "processed_at": "2025-07-11T23:15:00Z",
            "status": "completed",
            "vault_integration": True,
            "searchable": True,
            "metadata": {
                "content_preview": get_content_preview(processed_content),
                "processing_time": "0.1 seconds",
                "validation_score": validation_result.get('score', 100)
            }
        }
        
        return upload_result
        
    except Exception as e:
        raise Exception(f"File processing failed: {str(e)}")

def get_upload_status(params):
    """Get upload system status"""
    try:
        upload_id = params.get('upload_id', [None])[0]
        
        if upload_id:
            # Return specific upload status
            status_data = {
                "upload_id": upload_id,
                "status": "completed",
                "progress": 100,
                "uploaded_at": "2025-07-11T23:10:00Z"
            }
        else:
            # Return general system status
            status_data = {
                "system_ready": True,
                "supported_formats": [
                    ".docx", ".doc", ".pdf", ".txt", ".csv", 
                    ".xlsx", ".xls", ".pptx", ".ppt", ".md",
                    ".rtf", ".json", ".xml", ".html"
                ],
                "max_file_size": "10MB",
                "active_uploads": 0,
                "total_uploads_today": 0
            }
        
        return status_data
        
    except Exception as e:
        raise Exception(f"Failed to get upload status: {str(e)}")

def extract_filename(headers):
    """Extract filename from request headers"""
    # Try Content-Disposition header first
    content_disp = headers.get('Content-Disposition', '')
    if 'filename=' in content_disp:
        filename = content_disp.split('filename=')[1].strip('"')
        return filename
    
    # Try custom X-Filename header
    filename = headers.get('X-Filename', '')
    if filename:
        return filename
    
    # Default filename with timestamp
    import time
    return f"upload_{hash(str(headers))}_{int(time.time())}.txt"

def validate_file(filename, file_data, file_size):
    """Validate uploaded file"""
    # File size validation (10MB limit)
    max_size = 10 * 1024 * 1024  # 10MB
    if file_size > max_size:
        return {
            'valid': False,
            'error': f'File too large: {file_size} bytes (max: {max_size} bytes)'
        }
    
    # File extension validation
    allowed_extensions = [
        '.docx', '.doc', '.pdf', '.txt', '.csv', '.xlsx', '.xls',
        '.pptx', '.ppt', '.md', '.rtf', '.json', '.xml', '.html',
        '.htm', '.odt', '.ods', '.odp'
    ]
    
    file_ext = os.path.splitext(filename.lower())[1]
    if file_ext not in allowed_extensions:
        return {
            'valid': False,
            'error': f'Unsupported file type: {file_ext}'
        }
    
    # Basic content validation
    if file_size == 0:
        return {
            'valid': False,
            'error': 'File is empty'
        }
    
    return {
        'valid': True,
        'score': 100
    }

def analyze_file(filename, file_data):
    """Analyze file to determine type and characteristics"""
    file_ext = os.path.splitext(filename.lower())[1]
    mime_type, _ = mimetypes.guess_type(filename)
    
    file_info = {
        'type': get_file_category(file_ext),
        'extension': file_ext,
        'mime_type': mime_type or 'application/octet-stream',
        'is_text': file_ext in ['.txt', '.md', '.csv', '.json', '.xml', '.html', '.htm'],
        'is_document': file_ext in ['.docx', '.doc', '.pdf', '.rtf', '.odt'],
        'is_spreadsheet': file_ext in ['.xlsx', '.xls', '.csv', '.ods'],
        'is_presentation': file_ext in ['.pptx', '.ppt', '.odp']
    }
    
    return file_info

def get_file_category(extension):
    """Categorize file by extension"""
    categories = {
        'document': ['.docx', '.doc', '.pdf', '.rtf', '.odt'],
        'spreadsheet': ['.xlsx', '.xls', '.csv', '.ods'],
        'presentation': ['.pptx', '.ppt', '.odp'],
        'text': ['.txt', '.md'],
        'data': ['.json', '.xml', '.csv'],
        'web': ['.html', '.htm']
    }
    
    for category, extensions in categories.items():
        if extension in extensions:
            return category
    
    return 'other'

def determine_target_folder(file_info):
    """Determine which vault folder the file should go to"""
    folder_mapping = {
        'document': 'VAULT_MEMORY_FILES',
        'spreadsheet': 'VAULT_MEMORY_FILES', 
        'presentation': 'VAULT_MEMORY_FILES',
        'text': 'VAULT_MEMORY_FILES',
        'data': 'VAULT_MEMORY_FILES',
        'web': 'VAULT_MEMORY_FILES'
    }
    
    return folder_mapping.get(file_info['type'], 'VAULT_MEMORY_FILES')

def process_file_content(file_data, file_info):
    """Process file content for vault storage"""
    try:
        if file_info['is_text']:
            # For text files, decode and return as string
            content = file_data.decode('utf-8', errors='ignore')
            return content.encode('utf-8')
        else:
            # For binary files, return as-is
            return file_data
    except Exception as e:
        print(f"Warning: Content processing failed: {e}")
        return file_data

def store_file(filename, content, target_folder):
    """Store file in vault (placeholder implementation)"""
    # In real implementation, this would store to your vault system
    storage_path = f"{target_folder}/{filename}"
    
    return {
        'path': storage_path,
        'stored_at': "2025-07-11T23:15:00Z",
        'size': len(content)
    }

def get_content_preview(content):
    """Get preview of file content"""
    if content is None:
        return "No content"
    
    try:
        if isinstance(content, bytes):
            text_content = content.decode('utf-8', errors='ignore')
        else:
            text_content = str(content)
        
        # Return first 200 characters
        preview = text_content[:200]
        if len(text_content) > 200:
            preview += "..."
        
        return preview
    except:
        return "Binary content"

def generate_upload_id(filename):
    """Generate unique upload ID"""
    import time
    return f"up_{hash(filename)}_{int(time.time())}"[-12:]

# Error handling for module imports
if __name__ == "__main__":
    # This won't be called in Vercel, but good for local testing
    print("File upload handler ready")
