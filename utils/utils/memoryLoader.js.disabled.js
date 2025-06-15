// ✅ SITE MONKEYS – ZERO-FAILURE AI SHELL WITH GOOGLE DRIVE INTEGRATION (ONE-AND-DONE)
// 🧠 GOOGLE DRIVE-BASED VAULT LOADER (JAVASCRIPT / NODE FOR VERCEL)
// This file should be saved as: `/utils/memoryLoader.js`

const { google } = require('googleapis');

const VAULT_FOLDER_ID = '1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM';
const TARGET_FILES = [
  "00_EnforcementShell.txt",
  "00_EnforcementShell_Addendum.txt", 
  "00_BEHAVIOR_ENFORCEMENT_DEEP_LAYER.txt",
  "FULL COMPLETE Founder's Directive – Elevated and Executable Form (Exact Instruction Set).txt",
  "Comprehensive Services Offered by a World-Class Full-Service Digital Marketing Agency.txt"
];

function authorizeGoogleDrive() {
  const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });
  return google.drive({ version: 'v3', auth });
}

async function loadVaultMemory() {
  const drive = authorizeGoogleDrive();
  let memory = "=== LOADED VAULT MEMORY ===\n";
  
  try {
    const folderQuery = `'${VAULT_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder'`;
    const foldersRes = await drive.files.list({
      q: folderQuery,
      fields: 'files(id, name)'
    });
    
    const folderId = foldersRes.data.files[0]?.id;
    if (!folderId) throw new Error('Subfolder not found');
    
    for (const fileName of TARGET_FILES) {
      const fileListRes = await drive.files.list({
        q: `'${folderId}' in parents and name = '${fileName}'`,
        fields: 'files(id, name, mimeType)'
      });
      
      const file = fileListRes.data.files[0];
      if (!file) continue;
      
      let content;
      if (file.mimeType === 'application/vnd.google-apps.document') {
        const exportRes = await drive.files.export({
          fileId: file.id,
          mimeType: 'text/plain'
        }, { responseType: 'stream' });
        content = await streamToString(exportRes.data);
      } else {
        const res = await drive.files.get({
          fileId: file.id,
          alt: 'media'
        }, { responseType: 'stream' });
        content = await streamToString(res.data);
      }
      
      memory += `\n--- ${file.name} ---\n${content}\n`;
    }
  } catch (err) {
    memory += `\n[Vault loading error: ${err.message}]`;
  }
  
  return memory;
}

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    stream.on('error', reject);
  });
}

module.exports = { loadVaultMemory };
