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

print(f"Found {len(all_files)} API files to upload")
uploaded_count = 0

# === UPLOAD LOOP ===
for file_path in all_files:
    filename = os.path.basename(file_path)
    print(f"Uploading {filename} as raw file ({file_path})")

    try:
        file_metadata = {
            'name': filename,
            'parents': [shared_drive_id],
        }

        media = MediaFileUpload(file_path, mimetype='text/plain')

        query = f"name='{filename}' and '{shared_drive_id}' in parents"
        existing = drive_service.files().list(
            q=query,
            spaces='drive',
            fields='files(id, name)',
            supportsAllDrives=True
        ).execute()

        if existing['files']:
            file_id = existing['files'][0]['id']
            print(f"Overwriting existing file: {file_id}")
            drive_service.files().update(
                fileId=file_id,
                media_body=media,
                supportsAllDrives=True
            ).execute()
        else:
            drive_service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id',
                supportsAllDrives=True
            ).execute()

        uploaded_count += 1

    except Exception as e:
        print(f"❌ Error uploading {file_path}: {e}")

print(f"✅ Successfully uploaded {uploaded_count} file(s)!")
