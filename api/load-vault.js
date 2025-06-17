// /api/load-vault.js – Stream .docx and convert locally
import { google } from 'googleapis';
import mammoth from 'mammoth';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON),
      scopes: SCOPES
    });

    const drive = google.drive({ version: 'v3', auth });

    const fileList = await drive.files.list({
      q: "'1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM' in parents and trashed = false",
      fields: 'files(id, name, mimeType)',
    });

    let fullMemory = '=== CONTEXT OVERVIEW ===\n';
    const fileReport = [];
    let totalTokens = 0;

    for (const file of fileList.data.files) {
      let content = '';

      try {
        const fileId = file.id;
        const mime = file.mimeType;

        const response = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);

        if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const result = await mammoth.extractRawText({ buffer });
          content = result.value;
        } else if (mime === 'text/plain' || file.name.endsWith('.txt')) {
          content = buffer.toString('utf-8');
        }

        if (content.trim()) {
          fullMemory += `\n\n=== ${file.name} ===\n${content}`;
          const tokenEstimate = Math.ceil(content.length / 4);
          totalTokens += tokenEstimate;
          fileReport.push({ name: file.name, mimeType: mime, tokens: tokenEstimate });
        }

      } catch (err) {
        fileReport.push({ name: file.name, mimeType: file.mimeType, error: err.message });
      }
    }

    const estimatedCost = (totalTokens * 0.002 / 1000).toFixed(4);

    return res.status(200).json({
      success: true,
      memory: fullMemory,
      token_estimate: totalTokens,
      folders_loaded: fileReport.length,
      estimated_cost: `$${estimatedCost}`,
      file_debug: fileReport,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
