// ================================================================
// SITE MONKEYS VAULT LOADER - ISOLATED SYSTEM
// Handles Site Monkeys business intelligence vault loading
// Mode: Site Monkeys ONLY - Never loads in Truth/Business modes
// ================================================================

const vaultLogger = {
    log: (message) => console.log(`[VAULT] ${new Date().toISOString()} ${message}`),
    error: (message, error) => console.error(`[VAULT ERROR] ${new Date().toISOString()} ${message}`, error),
    warn: (message) => console.warn(`[VAULT WARN] ${new Date().toISOString()} ${message}`)
};

// Force immediate logging to verify module load
console.log('[VAULT] 🏛️ Site Monkeys Vault Loader initializing...');

class VaultLoader {
    constructor() {
        this.vaultData = null;
        this.initialized = false;
        this.mode = null;
        vaultLogger.log('📋 Vault Loader constructed');
    }

    // Initialize vault for Site Monkeys mode only
    async initialize(mode = 'site_monkeys') {
        try {
            if (mode !== 'site_monkeys') {
                vaultLogger.warn(`⚠️ Vault access denied for mode: ${mode} - Site Monkeys only`);
                return { success: false, error: 'Vault restricted to Site Monkeys mode' };
            }

            this.mode = mode;
            
            // Load vault data from environment variables (existing architecture)
            if (process.env.VAULT_CONTENT) {
                this.vaultData = process.env.VAULT_CONTENT;
                this.initialized = true;
                vaultLogger.log('✅ Site Monkeys vault loaded from environment');
                vaultLogger.log(`📊 Vault size: ${this.vaultData.length} characters`);
                
                return { 
                    success: true, 
                    size: this.vaultData.length,
                    mode: this.mode 
                };
            } else {
                vaultLogger.warn('⚠️ VAULT_CONTENT environment variable not found');
                return { success: false, error: 'Vault content not available' };
            }

        } catch (error) {
            vaultLogger.error('❌ Vault initialization failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Get vault content for Site Monkeys operations
    getVaultContent() {
        if (!this.initialized) {
            vaultLogger.warn('⚠️ Vault not initialized - call initialize() first');
            return null;
        }

        if (this.mode !== 'site_monkeys') {
            vaultLogger.warn('⚠️ Vault access denied - Site Monkeys mode required');
            return null;
        }

        vaultLogger.log('📤 Vault content retrieved');
        return this.vaultData;
    }

    // Check vault status
    getVaultStatus() {
        return {
            initialized: this.initialized,
            mode: this.mode,
            hasContent: !!this.vaultData,
            contentSize: this.vaultData ? this.vaultData.length : 0,
            timestamp: new Date().toISOString()
        };
    }

    // Validate mode access
    validateMode(requestedMode) {
        if (requestedMode !== 'site_monkeys') {
            vaultLogger.warn(`🚫 Mode validation failed: ${requestedMode} cannot access vault`);
            return false;
        }
        return true;
    }

    // Health check
    async healthCheck() {
        try {
            const hasEnvVar = !!process.env.VAULT_CONTENT;
            const status = this.getVaultStatus();
            
            vaultLogger.log('🔍 Vault health check completed');
            
            return {
                healthy: hasEnvVar && status.initialized,
                environment: hasEnvVar,
                status: status,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            vaultLogger.error('❌ Health check failed:', error);
            return {
                healthy: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Shutdown (cleanup if needed)
    async shutdown() {
        try {
            this.vaultData = null;
            this.initialized = false;
            this.mode = null;
            vaultLogger.log('✅ Vault Loader shutdown completed');
        } catch (error) {
            vaultLogger.error('❌ Error during vault shutdown:', error);
        }
    }
}

// Export singleton instance
console.log('[VAULT] 📦 Creating Site Monkeys Vault Loader instance...');
console.log('[VAULT] ✅ Vault Loader ready for export');

export default VaultLoader;
