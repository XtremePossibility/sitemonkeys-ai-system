// api/core/orchestrator.js
// ==================== STEP 3: LOAD VAULT CONTEXT ====================
async loadVaultContext(vaultCandidate, maybeSession) {
  try {
    // Check for global cached vault
    if (global.vaultContent && global.vaultContent.length > 1000) {
      const tokens = Math.ceil(global.vaultContent.length / 4);
      this.log(`[VAULT] Loaded from global: ${tokens} tokens`);
      return {
        content: global.vaultContent,
        tokens,
        loaded: true,
        expires: new Date(Date.now() + 3600000).toISOString()
      };
    }

    // Otherwise attempt to get from KV or fallback
    const { getVaultFromKv } = await import('../lib/vault-loader.js');
    const cachedVault = await getVaultFromKv();
    if (cachedVault?.vault_content) {
      const tokens = Math.ceil(cachedVault.vault_content.length / 4);
      this.log(`[VAULT] Loaded from KV: ${tokens} tokens`);
      return {
        content: cachedVault.vault_content,
        tokens,
        loaded: true,
        expires: new Date(Date.now() + 3600000).toISOString()
      };
    }

    this.log('[VAULT] No valid cached vault found');
    return null;

  } catch (err) {
    this.error('[VAULT] Load failed:', err);
    return null;
  }
}

// Other code...