// load-vault.js — Fixed to stream .docx and process locally

import { google } from 'googleapis';
import mammoth from 'mammoth';
import path from 'path';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

function bufferToStream(buffer) {
  return new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
}

function extractTextFromDocx(buffer) {
  return mammoth.extractRawText({ buffer }).then(result => result.value);
}

async function getDriveClient() {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
  return google.drive({ version: 'v3', auth });
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
      return buffer.toString('utf-8');
    } else {
      return ''; // Unsupported
    }
  } catch (error) {
    console.error(`Failed to load file ${file.name}:`, error.message);
    return '';
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const drive = await getDriveClient();
    const files = await listFiles(drive);

    let fullMemory = '=== CONTEXT OVERVIEW ===\n';
    const fileDebug = [];
    let totalTokens = 0;

    for (const file of files) {
      const content = await fetchFileContent(drive, file);
      const tokenEstimate = Math.ceil(content.length / 4);

      fileDebug.push({ name: file.name, mimeType: file.mimeType, tokens: tokenEstimate });

      if (content.length > 0) {
        fullMemory += `\n\n=== ${file.name} ===\n` + content;
        totalTokens += tokenEstimate;
      }
    }

    const estimatedCost = (totalTokens * 0.002 / 1000).toFixed(4);

    return res.status(200).json({
      success: true,
      memory: fullMemory,
      token_estimate: totalTokens,
      folders_loaded: files.length,
      estimated_cost: `$${estimatedCost}`,
      mode: 'google_drive_loaded',
      file_debug: fileDebug,
    });
  } catch (err) {
    console.error('Vault load error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
    });
  }
}
Once again you don't have to worry about it. no no no no no no no no no no no no no no no
