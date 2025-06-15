import { google } from 'googleapis';

const VAULT_FOLDER_ID = '1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM';

export default async function handler(req, res) {
  try {
    const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    if (!credentialsJson) throw new Error("Google credentials not found");

    const credentials = JSON.parse(credentialsJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.list({
      q: `'${VAULT_FOLDER_ID}' in parents`,
      fields: 'files(id, name, mimeType)',
    });

    const files = response.data.files || [];
    let vaultContent = "=== SITEMONKEYS BUSINESS INTELLIGENCE VAULT ===\n\n";
    let filesLoaded = 0;

    for (const file of files) {
      try {
        let content = '';

        if (file.mimeType === 'application/vnd.google-apps.document') {
          const exported = await drive.files.export({
            fileId: file.id,
            mimeType: 'text/plain'
          });
          content = exported.data;
        } else if (file.mimeType === 'text/plain' || file.name.endsWith('.txt')) {
          const downloaded = await drive.files.get(
            { fileId: file.id, alt: 'media' },
            { responseType: 'stream' }
          );
          content = await streamToString(downloaded.data);
        } else if (file.mimeType.includes('wordprocessingml.document')) {
          const exported = await drive.files.export({
            fileId: file.id,
            mimeType: 'text/plain'
          });
          content = exported.data;
        } else if (file.mimeType.includes('spreadsheetml.sheet')) {
          const exported = await drive.files.export({
            fileId: file.id,
            mimeType: 'text/csv'
          });
          content = exported.data;
        }

        if (content) {
          vaultContent += `\n=== ${file.name} ===\n${content}\n\n`;
          filesLoaded++;
        }
      } catch (fileErr) {
        console.warn(`⚠️ Skipped ${file.name}: ${fileErr.message}`);
      }
    }

    const tokenEstimate = Math.round(vaultContent.length / 4.2);
    const estimatedCost = (tokenEstimate * 0.002 / 1000).toFixed(4);

    res.status(200).json({
      success: true,
      memory: vaultContent,
      token_estimate: tokenEstimate,
      folders_loaded: filesLoaded,
      estimated_cost: `$${estimatedCost}`,
      mode: 'google_drive_loaded'
    });
  } catch (err) {
    console.error('Vault load error:', err);
    res.status(200).json({
      success: true,
      memory: "=== SITEMONKEYS BUSINESS INTELLIGENCE VAULT ===\n\n",
      token_estimate: 12,
      folders_loaded: 0,
      estimated_cost: "$0.0000",
      mode: 'fallback_mode',
      error: err.message
    });
  }
}

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    stream.on('error', reject);
  });
}
