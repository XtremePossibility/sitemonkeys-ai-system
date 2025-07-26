// ================================================================
// MEMORY SYSTEM DIAGNOSTIC & CACHE BUSTER - v2025.07.26.1920
// Force Railway to rebuild memory system with different filename
// ================================================================

// DIAGNOSTIC FUNCTION - Test memory system loading
function testMemorySystemLoad() {
    console.log('[MEMORY DIAGNOSTIC] Starting memory system load test...');
    
    try {
        // Test 1: Check if file exists
        const fs = require('fs');
        const path = require('path');
        const memoryApiPath = path.join(__dirname, 'memory_api.js');
        
        if (fs.existsSync(memoryApiPath)) {
            console.log('[MEMORY DIAGNOSTIC] ✅ memory_api.js file exists');
            const fileStats = fs.statSync(memoryApiPath);
            console.log('[MEMORY DIAGNOSTIC] File size:', fileStats.size, 'bytes');
            console.log('[MEMORY DIAGNOSTIC] Last modified:', fileStats.mtime);
        } else {
            console.log('[MEMORY DIAGNOSTIC] ❌ memory_api.js file NOT FOUND');
            return false;
        }
        
        // Test 2: Try to require the module
        const memorySystem = require('./memory_api');
        console.log('[MEMORY DIAGNOSTIC] ✅ Module require successful');
        console.log('[MEMORY DIAGNOSTIC] Type of memorySystem:', typeof memorySystem);
        console.log('[MEMORY DIAGNOSTIC] Available functions:', Object.keys(memorySystem));
        
        // Test 3: Check critical functions
        const requiredFunctions = ['getRelevantContext', 'storeMemory', 'initializeUser'];
        const missingFunctions = requiredFunctions.filter(fn => typeof memorySystem[fn] !== 'function');
        
        if (missingFunctions.length === 0) {
            console.log('[MEMORY DIAGNOSTIC] ✅ All required functions present');
            return memorySystem;
        } else {
            console.log('[MEMORY DIAGNOSTIC] ❌ Missing functions:', missingFunctions);
            return false;
        }
        
    } catch (error) {
        console.log('[MEMORY DIAGNOSTIC] ❌ Error loading memory system:', error.message);
        console.log('[MEMORY DIAGNOSTIC] Stack trace:', error.stack);
        return false;
    }
}

// CACHE BUSTER - Force complete module reload
function bustModuleCache() {
    console.log('[CACHE BUSTER] Clearing Node.js module cache...');
    
    const moduleToDelete = require.resolve('./memory_api');
    if (require.cache[moduleToDelete]) {
        delete require.cache[moduleToDelete];
        console.log('[CACHE BUSTER] ✅ Deleted cached module:', moduleToDelete);
    }
    
    // Clear all memory_system related modules
    Object.keys(require.cache).forEach(key => {
        if (key.includes('memory_system') || key.includes('memory_api')) {
            delete require.cache[key];
            console.log('[CACHE BUSTER] ✅ Deleted cached module:', key);
        }
    });
}

// MAIN DIAGNOSTIC FUNCTION
function runMemoryDiagnostic() {
    console.log('\n=== MEMORY SYSTEM DIAGNOSTIC START ===');
    
    // Step 1: Test current load
    let memorySystem = testMemorySystemLoad();
    
    if (!memorySystem) {
        // Step 2: Try cache busting
        bustModuleCache();
        memorySystem = testMemorySystemLoad();
    }
    
    console.log('=== MEMORY SYSTEM DIAGNOSTIC END ===\n');
    return memorySystem;
}

// Export the diagnostic tools
module.exports = {
    runMemoryDiagnostic,
    testMemorySystemLoad,
    bustModuleCache
};

// AUTO-RUN if this file is executed directly
if (require.main === module) {
    runMemoryDiagnostic();
}
