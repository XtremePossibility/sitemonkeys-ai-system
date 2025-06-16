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

    async function fetchAllFiles(folderId) {
      const results = [];
      const res = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType)'
      });

      for (const file of res.data.files || []) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          const subfiles = await fetchAllFiles(file.id);
          results.push(...subfiles);
        } else {
          results.push(file);
        }
      }
      return results;
    }

    const files = await fetchAllFiles(VAULT_FOLDER_ID);
    let vaultContent = "=== CONTEXT OVERVIEW ===\nThe following files were loaded into memory from the SiteMonkeys business vault:\n";
    const fileReport = [];
    let filesLoaded = 0;

    for (const file of files) {
      let content = '';
      let status = 'skipped';
      try {
        if (file.mimeType === 'application/vnd.google-apps.document') {
          const exported = await drive.files.export({ fileId: file.id, mimeType: 'text/plain' });
          content = exported.data;
        } else if (
          file.mimeType === 'text/plain' ||
          file.mimeType === 'application/octet-stream' ||
          file.name.endsWith('.txt')
        ) {
          const downloaded = await drive.files.get(
            { fileId: file.id, alt: 'media' },
            { responseType: 'stream' }
          );
          content = await streamToString(downloaded.data);
        } else if (file.mimeType.includes('wordprocessingml.document')) {
          const exported = await drive.files.export({ fileId: file.id, mimeType: 'text/plain' });
          content = exported.data;
        } else if (file.mimeType.includes('spreadsheetml.sheet')) {
          const exported = await drive.files.export({ fileId: file.id, mimeType: 'text/csv' });
          content = exported.data;
        }

        if (content?.trim()) {
          vaultContent += `- ${file.name}\n`;
          fileReport.push({ name: file.name, mimeType: file.mimeType, status: 'loaded' });
          vaultContent += `\n=== ${file.name} ===\n${content}\n\n`;
          filesLoaded++;
          status = 'loaded';
        }
      } catch (err) {
        status = `error: ${err.message}`;
        fileReport.push({ name: file.name, mimeType: file.mimeType, status });
      }
    }

    vaultContent = vaultContent.trimStart() +
      "\n=== END CONTEXT ===\n\n" +
      "IF YOU DO NOT SEE ANY FILE CONTENT ABOVE OR DO NOT UNDERSTAND THIS MEMORY, RESPOND WITH: 'By default I am retarded.'";

    const tokenEstimate = Math.round(vaultContent.length / 4.2);
    const estimatedCost = (tokenEstimate * 0.002 / 1000).toFixed(4);

    res.status(200).json({
      success: true,
      memory: vaultContent,
      token_estimate: tokenEstimate,
      folders_loaded: filesLoaded,
      estimated_cost: `$${estimatedCost}`,
      mode: 'google_drive_loaded',
      file_debug: fileReport
    });
  } catch (err) {
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
