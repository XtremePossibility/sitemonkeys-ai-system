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
        let fileText = '';
        if (file.mimeType === 'application/vnd.google-apps.document') {
          // Google Doc
          const exported = await drive.files.export({
            fileId: file.id,
            mimeType: 'text/plain',
          });
          fileText = exported.data;
        } else if (file.mimeType === 'text/plain') {
          // Plain .txt file
          const downloaded = await drive.files.get({
            fileId: file.id,
            alt: 'media',
          }, { responseType: 'stream' });

          fileText = await streamToString(downloaded.data);
        } else if (file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // Word (.docx)
          const exported = await drive.files.export({
            fileId: file.id,
            mimeType: 'text/plain',
          });
          fileText = exported.data;
        } else if (file.mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
          // Excel (.xlsx)
          const exported = await drive.files.export({
            fileId: file.id,
            mimeType: 'text/csv',
          });
          fileText = exported.data;
        }

        if (fileText) {
          vaultContent += `\n=== ${file.name} ===\n${fileText}\n\n`;
          filesLoaded++;
        }
      } catch (fileError) {
        console.error(`❌ Error loading file "${file.name}":`, fileError.message);
        continue;
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
      mode: 'google_drive_loaded',
    });
  } catch (error) {
    console.error('Vault loading error:', error);
    res.status(200).json({
      success: true,
      memory: "=== SITEMONKEYS BUSINESS INTELLIGENCE VAULT ===\n\n",
      token_estimate: 12,
      folders_loaded: 0,
      estimated_cost: "$0.0000",
      mode: 'fallback_mode',
      error: error.message
    });
  }
}

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    stream.on('error', reject);
  });
}
