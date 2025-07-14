const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const axios = require('axios');
const JSZip = require('jszip');
const xml2js = require('xml2js');
const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// Vault folder ID
const VAULT_FOLDER_ID = "1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM";

/**
 * Extract text content from DOCX file data
 */
async function extractTextFromDocx(docxBuffer) {
    try {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(docxBuffer);
        
        const documentXml = await zipContent.file('word/document.xml').async('string');
        
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(documentXml);
        
        const textElements = [];
        
        function extractText(node) {
            if (node && typeof node === 'object') {
                if (node['w:t'] && Array.isArray(node['w:t'])) {
                    node['w:t'].forEach(textNode => {
                        if (textNode && textNode._) {
                            textElements.push(textNode._);
                        } else if (typeof textNode === 'string') {
                            textElements.push(textNode);
                        }
                    });
                }
                
                Object.keys(node).forEach(key => {
                    if (Array.isArray(node[key])) {
                        node[key].forEach(child => extractText(child));
                    } else if (typeof node[key] === 'object') {
                        extractText(node[key]);
                    }
                });
            }
        }
        
        extractText(result);
        
        const extractedText = textElements.join(' ');
        const lines = extractedText.split('\n');
        const cleanedLines = lines.filter(line => line.trim()).map(line => line.trim());
        
        return cleanedLines.join('\n');
    } catch (error) {
        return `[DOCX text extraction failed: ${error.message}]`;
    }
}

/**
 * Initialize Google Drive service with credentials
 */
function getGoogleDriveService() {
    try {
        const credsJson = process.env.GOOGLE_CREDENTIALS_JSON;
        const projectId = process.env.GOOGLE_PROJECT_ID;
        const projectNumber = process.env.GOOGLE_PROJECT_NUMBER;
        
        if (!credsJson) {
            throw new Error("GOOGLE_CREDENTIALS_JSON environment variable not found");
        }
        if (!projectId) {
            throw new Error("GOOGLE_PROJECT_ID environment variable not found");
        }
        
        console.log(`Using Project ID: ${projectId}`);
        console.log(`Using Project Number: ${projectNumber}`);
        
        const credsInfo = JSON.parse(credsJson);
        credsInfo.project_id = projectId;
        if (projectNumber) {
            credsInfo.project_number = projectNumber;
        }
        
        const auth = new google.auth.GoogleAuth({
            credentials: credsInfo,
            scopes: ['https://www.googleapis.com/auth/drive.readonly']
        });
        
        return google.drive({ version: 'v3', auth });
    } catch (error) {
        throw new Error(`Google Drive authentication failed: ${error.message}`);
    }
}

/**
 * Store vault data in Railway KV using v2 key
 */
async function storeVaultInKv(vaultData) {
    try {
        const kvUrl = process.env.KV_REST_API_URL;
        const kvToken = process.env.KV_REST_API_TOKEN;
        
        if (!kvUrl || !kvToken) {
            console.log("⚠️ KV environment variables not found");
            return false;
        }
        
        const headers = {
            'Authorization': `Bearer ${kvToken}`,
            'Content-Type': 'application/json'
        };
        
        // Convert to JSON and check size
        const vaultJson = JSON.stringify(vaultData);
        const vaultSize = Buffer.byteLength(vaultJson, 'utf8');
        
        console.log(`📊 Vault data size: ${vaultSize} bytes`);
        
        let requestData;
        let storageMethod = 'direct';
        
        // Compress if over 80KB
        if (vaultSize > 80000) {
            console.log("🗜️ Compressing vault data...");
            const compressed = await gzip(Buffer.from(vaultJson, 'utf8'));
            const encoded = compressed.toString('base64');
            
            // Store compressed with metadata
            requestData = {
                compressed: true,
                data: encoded,
                original_size: vaultSize,
                compressed_size: encoded.length
            };
            
            storageMethod = 'compressed';
            console.log(`📦 Compressed: ${vaultSize} → ${encoded.length} bytes`);
        } else {
            requestData = vaultData;
        }
        
        const response = await axios.post(
            `${kvUrl}/set/sitemonkeys_vault_v2`,
            requestData,
            { 
                headers,
                timeout: 30000
            }
        );
        
        console.log(`🔑 KV Storage URL: ${kvUrl}/set/sitemonkeys_vault_v2`);
        console.log(`📤 KV Storage response status: ${response.status}`);
        console.log(`📤 KV Storage response: ${response.data}`);
        
        if (response.status === 200) {
            console.log("✅ Vault data stored in KV successfully");
            
            // Store master index separately for diagnostics
            const masterIndex = {
                folders_loaded: vaultData.folders_loaded || [],
                total_files: vaultData.total_files || 0,
                tokens: vaultData.tokens || 0,
                estimated_cost: vaultData.estimated_cost || "$0.00",
                last_updated: vaultData.last_updated || "unknown",
                vault_status: "operational",
                storage_method: storageMethod
            };
            
            const indexResponse = await axios.post(
                `${kvUrl}/set/sitemonkeys_vault_v2_index`,
                masterIndex,
                { 
                    headers,
                    timeout: 30000
                }
            );
            
            console.log(`📋 Index storage status: ${indexResponse.status}`);
            return true;
        } else {
            console.log(`❌ KV storage failed: ${response.status} - ${response.data}`);
            return false;
        }
        
    } catch (error) {
        console.log(`❌ KV storage error: ${error.message}`);
        console.log(`Full error: ${error.stack}`);
        return false;
    }
}

/**
 * Retrieve vault data from Railway KV using v2 key
 */
async function getVaultFromKv() {
    try {
        const kvUrl = process.env.KV_REST_API_URL;
        const kvToken = process.env.KV_REST_API_TOKEN;
        
        if (!kvUrl || !kvToken) {
            console.log("⚠️ KV environment variables not found for retrieval");
            return null;
        }
        
        const headers = {
            'Authorization': `Bearer ${kvToken}`,
        };
        
        const response = await axios.get(
            `${kvUrl}/get/sitemonkeys_vault_v2`,
            { 
                headers,
                timeout: 30000
            }
        );
        
        console.log(`🔍 KV Retrieval URL: ${kvUrl}/get/sitemonkeys_vault_v2`);
        console.log(`📥 KV Retrieval response status: ${response.status}`);
        console.log(`📥 KV Retrieval response length: ${response.data ? JSON.stringify(response.data).length : 0}`);
        
        if (response.status === 200) {
            try {
                const data = response.data;
                
                if (data === null || data === undefined) {
                    console.log("⚠️ No vault data found in KV (null response)");
                    return null;
                }
                
                // Check if it's compressed
                if (typeof data === 'object' && data.compressed) {
                    console.log("🗜️ Decompressing vault data...");
                    const compressedBuffer = Buffer.from(data.data, 'base64');
                    const decompressed = await gunzip(compressedBuffer);
                    const result = JSON.parse(decompressed.toString('utf8'));
                    console.log(`📦 Decompressed: ${data.compressed_size || 0} → ${data.original_size || 0} bytes`);
                    return result;
                } else {
                    console.log(`✅ Retrieved vault data from KV: ${JSON.stringify(data).length} characters`);
                    return data;
                }
                
            } catch (parseError) {
                console.log(`❌ Failed to parse KV response: ${parseError.message}`);
                console.log(`Raw response: ${JSON.stringify(response.data).substring(0, 500)}...`);
                return null;
            }
        } else {
            console.log(`❌ KV retrieval failed: ${response.status}`);
            console.log(`Error response: ${response.data}`);
            return null;
        }
        
    } catch (error) {
        console.log(`❌ KV retrieval error: ${error.message}`);
        console.log(`Full error: ${error.stack}`);
        return null;
    }
}

/**
 * Load all content from SiteMonkeys vault folders
 */
async function loadVaultContent() {
    let vaultContent = "=== SITEMONKEYS BUSINESS VALIDATION VAULT ===\n\n";
    let loadedFolders = [];
    let totalFiles = 0;
    
    try {
        const drive = getGoogleDriveService();
        
        // Get subfolders in vault
        const query = `'${VAULT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder'`;
        const foldersResult = await drive.files.list({
            q: query,
            fields: "files(id, name)",
            pageSize: 50
        });
        
        const folders = foldersResult.data.files || [];
        
        vaultContent += `\n=== LIVE VAULT FOLDERS LOADED (${loadedFolders.length} folders) ===\n`;
        
        // ZERO-FAILURE: Filter to only the 3 required folders
        const targetFolders = ['00_EnforcementShell', '01_Core_Directives', 'VAULT_MEMORY_FILES'];
        
        for (const folder of folders) {
            const folderName = folder.name;
            
            // Skip folders not in our target list
            if (!targetFolders.includes(folderName)) {
                console.log(`⏭️ Skipping folder: ${folderName} (not in target list)`);
                continue;
            }
            
            loadedFolders.push(folderName);
            vaultContent += `\n--- FOLDER: ${folderName} ---\n`;
            
            // Get files in each folder
            const fileQuery = `'${folder.id}' in parents`;
            const filesResult = await drive.files.list({
                q: fileQuery,
                fields: "files(id, name, mimeType, size)",
                pageSize: 100
            });
            
            const files = filesResult.data.files || [];
            totalFiles += files.length;
            
            for (const file of files) {
                try {
                    let fileContent = "";
                    const fileMime = file.mimeType || '';
                    const fileName = file.name;
                    
                    console.log(`Processing file: ${fileName} (type: ${fileMime})`);
                    
                    if (fileMime.includes('text/plain') || fileName.endsWith('.txt')) {
                        try {
                            const response = await drive.files.get({
                                fileId: file.id,
                                alt: 'media'
                            }, { responseType: 'arraybuffer' });
                            
                            fileContent = Buffer.from(response.data).toString('utf-8');
                            console.log(`✅ Text file loaded: ${fileContent.length} characters`);
                        } catch (error) {
                            fileContent = `[ERROR reading text file: ${error.message}]`;
                            console.log(`❌ Text file error: ${error.message}`);
                        }
                    }
                    else if (fileMime === 'application/vnd.google-apps.document') {
                        try {
                            const response = await drive.files.export({
                                fileId: file.id,
                                mimeType: 'text/plain'
                            });
                            
                            fileContent = response.data;
                            console.log(`✅ Google Doc exported: ${fileContent.length} characters`);
                        } catch (error) {
                            fileContent = `[Google Doc - Export failed: ${error.message}]`;
                            console.log(`❌ Google Doc error: ${error.message}`);
                        }
                    }
                    else if (fileMime.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || fileName.endsWith('.docx')) {
                        try {
                            console.log(`🔄 Downloading DOCX file: ${fileName}`);
                            const response = await drive.files.get({
                                fileId: file.id,
                                alt: 'media'
                            }, { responseType: 'arraybuffer' });
                            
                            const fileData = Buffer.from(response.data);
                            console.log(`📥 Downloaded ${fileData.length} bytes`);
                            
                            fileContent = await extractTextFromDocx(fileData);
                            
                            if (fileContent.startsWith('[DOCX text extraction failed')) {
                                console.log(`❌ DOCX extraction failed: ${fileName}`);
                            } else {
                                console.log(`✅ DOCX text extracted: ${fileContent.length} characters`);
                            }
                            
                        } catch (error) {
                            fileContent = `[DOCX file - Access failed: ${error.message}]`;
                            console.log(`❌ DOCX access error: ${error.message}`);
                        }
                    }
                    else if (fileMime === 'application/vnd.google-apps.folder') {
                        continue;
                    }
                    else {
                        const fileSize = file.size || 'Unknown';
                        fileContent = `[File type: ${fileMime} - Size: ${fileSize} bytes - Skipped unsupported format]`;
                        console.log(`⏭️ Skipped unsupported file: ${fileName}`);
                    }
                    
                    vaultContent += `\n=== ${fileName} ===\n${fileContent}\n`;
                    
                } catch (fileError) {
                    vaultContent += `\n=== ${file.name} ===\n[ERROR loading file: ${fileError.message}]\n`;
                    console.log(`❌ File processing error: ${file.name} - ${fileError.message}`);
                }
            }
        }
        
        vaultContent += `\n=== VAULT SUMMARY ===\nFolders: ${loadedFolders.length}\nFiles processed: ${totalFiles}\n`;
        
        console.log(`✅ Vault loaded successfully: ${folders.length} folders, ${totalFiles} files`);
        console.log(`📊 Total vault content: ${vaultContent.length} characters`);
        
    } catch (driveError) {
        console.log(`❌ Google Drive error: ${driveError.message}`);
        vaultContent += `\n[Google Drive connection error: ${driveError.message}]\n`;
        loadedFolders = ["Error - Could not connect to Google Drive"];
        totalFiles = 0;
    }
    
    return { vaultContent, loadedFolders, totalFiles };
}

// Express app setup
const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Main vault endpoint - handles both GET and POST
app.all('/api/load-vault', async (req, res) => {
    try {
        const isRefresh = req.query.refresh === 'true';
        
        if (isRefresh) {
            console.log("🔄 Refresh requested - loading fresh vault data...");
            
            const { vaultContent: vaultMemory, loadedFolders, totalFiles } = await loadVaultContent();
            
            const tokenCount = Math.floor(vaultMemory.length / 4);
            const estimatedCost = (tokenCount * 0.002) / 1000;
            
            const vaultData = {
                vault_content: vaultMemory,
                tokens: tokenCount,
                estimated_cost: `$${estimatedCost.toFixed(4)}`,
                folders_loaded: loadedFolders,
                total_files: totalFiles,
                last_updated: "refresh_requested",
                vault_status: "operational"
            };
            
            const kvStored = await storeVaultInKv(vaultData);
            
            console.log(`📊 Vault refresh complete: ${tokenCount} tokens, ${loadedFolders.length} folders`);
            
            const response = {
                status: "refreshed",
                vault_content: vaultMemory,
                tokens: tokenCount,
                estimated_cost: `$${estimatedCost.toFixed(4)}`,
                folders_loaded: loadedFolders,
                total_files: totalFiles,
                kv_stored: kvStored,
                message: `Vault refreshed: ${loadedFolders.length} folders, ${totalFiles} files`,
                vault_status: "operational"
            };
            
            res.json(response);
            
        } else {
            console.log("📖 Checking for cached vault data...");
            
            const cachedVault = await getVaultFromKv();
            
            if (cachedVault && typeof cachedVault === 'object' && cachedVault.vault_content) {
                console.log("✅ Found valid cached vault data in KV");
                const response = {
                    status: "success",
                    vault_content: cachedVault.vault_content || "",
                    tokens: cachedVault.tokens || 0,
                    estimated_cost: cachedVault.estimated_cost || "$0.00",
                    folders_loaded: cachedVault.folders_loaded || [],
                    total_files: cachedVault.total_files || 0,
                    vault_status: cachedVault.vault_status || "operational",
                    message: "Using cached vault data from KV"
                };
                res.json(response);
            } else {
                console.log("⚠️ No valid cached vault data found");
                const response = {
                    status: "success",
                    needs_refresh: true,
                    vault_content: "",
                    tokens: 0,
                    estimated_cost: "$0.00",
                    folders_loaded: [],
                    total_files: 0,
                    vault_status: "needs_refresh",
                    message: "No vault data found - please refresh"
                };
                res.json(response);
            }
        }
        
    } catch (error) {
        console.log(`❌ Vault operation failed: ${error.message}`);
        const errorResponse = {
            status: "error",
            error: error.message,
            vault_status: "error",
            message: "Vault operation failed - check configuration"
        };
        res.json(errorResponse);
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'sitemonkeys-vault-loader',
        message: 'Vault loader service is running',
        endpoints: ['/api/load-vault', '/health']
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'vault-loader' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 SiteMonkeys Vault loader service running on port ${PORT}`);
    console.log(`📍 Vault endpoint: http://localhost:${PORT}/api/load-vault`);
});
