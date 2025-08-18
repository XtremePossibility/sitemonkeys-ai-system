// memory_smoke_test.mjs
// Run with: node memory_smoke_test.mjs
// memory_smoke_test.mjs
import MemoryModule from './memory_system/persistent_memory.js';
// 🔧 Adjust this path to your module:
import MemoryModule from './memory_system/memory_api.js';

// If your module exports named APIs instead of default, uncomment the next line and comment the line above:
// import { default as MemoryModule } from './memory_system/memory_api.js';

async function run() {
  console.log('== MEMORY SMOKE TEST ==');

  // Some memory modules export an object with methods; others export a class.
  // We’ll handle both cases safely:
  const mem =
    typeof MemoryModule === 'function'
      ? new MemoryModule()
      : MemoryModule;

  if (mem.initializeUser) {
    await mem.initializeUser('smoke_test_user');
  } else if (mem.initialize) {
    await mem.initialize();
  }

  // Health
  if (mem.healthCheck || mem.getSystemHealth) {
    const health = await (mem.healthCheck ? mem.healthCheck() : mem.getSystemHealth());
    console.log('HEALTH:', health);
  } else {
    console.log('HEALTH: (no health method found, skipping)');
  }

  // Provision + store
  const user = 'smoke_test_user';
  if (mem.provisionUserMemory) {
    await mem.provisionUserMemory(user);
  }
  const write = await (mem.storeConversationMemory
    ? mem.storeConversationMemory(user, 'Test memory: hello world', { userMarkedImportant: true })
    : mem.storeMemory(user, 'Test memory: hello world', { userMarkedImportant: true }));
  console.log('STORE:', write);

  // Retrieve
  const ctx = await (mem.getRelevantContext
    ? mem.getRelevantContext(user, 'hello', 2500)
    : mem.getContext(user, 'hello', 2500));
  console.log('RETRIEVE:', ctx);

  if (mem.shutdown) {
    await mem.shutdown();
  }
  console.log('✅ Smoke test completed.');
}

run().catch(e => {
  console.error('❌ Smoke test failed:', e);
  process.exit(1);
});
