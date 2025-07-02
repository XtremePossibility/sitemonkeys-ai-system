import os
import json
import glob
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.service_account import Credentials

# === CONFIGURATION ===
shared_drive_id = '1CGjbCAlk_Uk2FvgYOiq33zxpzDTuygof'
print(f"Using shared drive: {shared_drive_id}")

# === AUTH ===
creds_json = os.environ['GOOGLE_DRIVE_CREDENTIALS']
creds_info = json.loads(creds_json)
creds = Credentials.from_service_account_info(creds_info)
drive_service = build('drive', 'v3', credentials=creds)

# === FILE GATHERING ===
file_patterns = ['**/*']
all_files = []
for pattern in file_patterns:
    all_files.extend(glob.glob(pattern, recursive=True))

print(f"Found {len(all_files)} files to upload")
uploaded_count = 0

# === UPLOAD LOOP ===
for file_path in all_files:
    filename = os.path.basename(file_path)
    print(f"📤 Uploading {filename} as Google Doc to folder ID {shared_drive_id}")

    try:
        file_metadata = {
            'name': filename,
            'mimeType': 'application/vnd.google-apps.document',
            'parents': [shared_drive_id],
        }

        media = MediaFileUpload(file_path, mimetype='text/plain', resumable=True)

        drive_service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id',
            supportsAllDrives=True
        ).execute()

        print(f"✅ Uploaded: {filename}")
        uploaded_count += 1

    except Exception as e:
        print(f"❌ Failed to upload {filename}: {e}")

print(f"✅ Successfully uploaded {uploaded_count} file(s)!")
