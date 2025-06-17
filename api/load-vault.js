import { google } from 'googleapis';
import mammoth from 'mammoth';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

function extractTextFromDocx(buffer) {
  return mammoth.extractRawText({ buffer }).then(result => result.value);
}

async function getDriveClient() {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  const auth = new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
  return google.drive({ version: 'v3', auth });
}

async function fetchFileContent(drive, file) {
  try {
    const res = await drive.files.get({
      fileId: file.id,
      alt: 'media',
    }, { responseType: 'arraybuffer' });

    const buffer = Buffer.from(res.data);

    if (file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await extractTextFromDocx(buffer);
    } else if (file.mimeType === 'text/plain' || file.name.endsWith('.txt')) {
      return buffer.toString('utf8');
    } else {
      return '';
    }
  } catch (err) {
    console.error(`❌ Failed to load ${file.name}: ${err.message}`);
    return '';
  }
}

async function listFiles(drive) {
  const files = [];
  let pageToken = null;
  do {
    const res = await drive.files.list({
      q: "trashed = false",
      fields: 'nextPageToken, files(id, name, mimeType)',
      spaces: 'drive',
      pageSize: 100,
      pageToken,
    });
    files.push(...res.data.files);
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return files;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const drive = await getDriveClient();
    const files = await listFiles(drive);

    let fullMemory = '=== CONTEXT OVERVIEW ===\n';
    let totalTokens = 0;
    const fileDebug = [];

    for (const file of files) {
      const content = await fetchFileContent(drive, file);
      const tokens = Math.ceil(content.length / 4);
      if (content.trim()) {
        fullMemory += `\n\n=== ${file.name} ===\n${content}`;
        totalTokens += tokens;
      }
      fileDebug.push({ name: file.name, mimeType: file.mimeType, tokens });
    }

    const estimatedCost = (totalTokens * 0.002 / 1000).toFixed(4);

    return res.status(200).json({
      success: true,
      memory: fullMemory,
      token_estimate: totalTokens,
      folders_loaded: fileDebug.length,
      estimated_cost: `$${estimatedCost}`,
      file_debug: fileDebug,
      mode: 'google_drive_loaded'
    });

  } catch (err) {
    console.error('💥 Vault Load Error:', err.message);
    return res.status(500).json({
      success: false,
      memory: '',
      token_estimate: 0,
      folders_loaded: 0,
      estimated_cost: '$0.0000',
      mode: 'fallback_mode',
      error: err.message
    });
  }
}
