# api/load-vault.py

import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            service_account_info = json.loads(os.environ['GOOGLE_CREDENTIALS_JSON'])
            credentials = service_account.Credentials.from_service_account_info(
                service_account_info,
                scopes=['https://www.googleapis.com/auth/drive.readonly']
            )
            service = build('drive', 'v3', credentials=credentials)

            folder_id = "1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM"
            query = f"'{folder_id}' in parents and mimeType != 'application/vnd.google-apps.folder'"
            results = service.files().list(q=query, fields="files(id, name)").execute()
            files = results.get('files', [])

            memory = ""
            for file in files:
                request = service.files().get_media(fileId=file['id'])
                memory += f"\n--- {file['name']} ---\n"
                memory += request.execute().decode('utf-8')

            tokens = len(memory) // 4.2
            cost = (tokens * 0.002 / 1000)

            response_data = {
                "status": "Loaded",
                "vault_content": memory,
                "tokens": round(tokens),
                "estimatedCost": f"${cost:.4f}",
                "folders_loaded": ["VAULT_MEMORY_FILES"]
            }

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())

        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
