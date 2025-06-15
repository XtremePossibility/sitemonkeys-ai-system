import { google } from 'googleapis';

const VAULT_FOLDER_ID = "1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM";

export default async function handler(req, res) {
    try {
        // Get Google credentials from environment
        const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
        if (!credentialsJson) {
            throw new Error("Google credentials not found");
        }

        // Parse credentials
        const credentials = JSON.parse(credentialsJson);
        
        // Create auth client
        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/drive.readonly']
        });

        // Create Drive client
        const drive = google.drive({ version: 'v3', auth });

        // List files in vault folder
        const response = await drive.files.list({
            q: `'${VAULT_FOLDER_ID}' in parents`,
            fields: 'files(id, name, mimeType)'
        });

        const files = response.data.files || [];
        
        if (files.length === 0) {
            throw new Error(`No files found in folder ${VAULT_FOLDER_ID}`);
        }

        // Load content from each file
        let vaultContent = "=== SITEMONKEYS BUSINESS INTELLIGENCE VAULT ===\n\n";
        let filesLoaded = 0;

        for (const file of files) {
            try {
                if (file.mimeType === 'application/vnd.google-apps.document') {
                    // Export Google Doc as plain text
                    const exportResponse = await drive.files.export({
                        fileId: file.id,
                        mimeType: 'text/plain'
                    });

                    vaultContent += `\n=== ${file.name} ===\n`;
                    vaultContent += exportResponse.data;
                    vaultContent += "\n\n";
                    filesLoaded++;
                }
            } catch (fileError) {
                console.log(`Error loading file ${file.name}:`, fileError);
                continue;
            }
        }

        // Calculate token estimate
        const tokenEstimate = Math.round(vaultContent.length / 4.2);
        const estimatedCost = (tokenEstimate * 0.002 / 1000).toFixed(4);

        // Return successful response
        res.status(200).json({
            success: true,
            memory: vaultContent,
            token_estimate: tokenEstimate,
            folders_loaded: filesLoaded,
            estimated_cost: `$${estimatedCost}`,
            mode: 'google_drive_loaded'
        });

    } catch (error) {
        console.error('Vault loading error:', error);
        
        // Return fallback business intelligence
        const fallbackContent = `=== SITEMONKEYS CORE BUSINESS INTELLIGENCE ===

FINANCIAL CONSTRAINTS:
- Launch Budget: $15,000 maximum
- Monthly Burn Rate: $3,000 maximum
- Margin Requirement: 87% minimum
- Emergency Fund: $5,000 reserve

PRICING STRATEGY:
- Basic Package: $697
- Professional Package: $1,497
- Premium Package: $2,997

ZERO-FAILURE PROTOCOLS:
- All decisions must align with 87% margin requirement
- No expenses exceeding $3K monthly burn rate
- All contractor work must include signed NDAs
- Legal compliance mandatory for all operations

ENFORCEMENT DIRECTIVES:
- Founder protection protocols active
- Market leader positioning required
- Persistence-driven execution mandatory
- Helpful initiative protocols enabled`;

        res.status(200).json({
            success: true,
            memory: fallbackContent,
            token_estimate: 500,
            folders_loaded: 0,
            mode: 'fallback_mode',
            error: error.message
        });
    }
}
