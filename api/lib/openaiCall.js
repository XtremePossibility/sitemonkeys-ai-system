// api/lib/openaiCall.js
// Minimal OpenAI call wrapper with spacing + 429 retry. No external deps.

const MIN_API_INTERVAL_MS = Number(process.env.OPENAI_MIN_INTERVAL_MS || 1500); // 1.5s gap
const MAX_RETRIES = Number(process.env.OPENAI_MAX_RETRIES || 3);

let lastCallAt = 0;                 // simple global spacing
let inFlight = Promise.resolve();   // serialize to avoid bursts

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Single-file queue: prevents concurrent bursts from different callers
async function withQueue(fn) {
  const prev = inFlight;
  let release;
  inFlight = new Promise(res => (release = res));
  try {
    await prev;        // wait previous call
    return await fn();
  } finally {
    release();         // let next proceed
  }
}

export async function callOpenAI(payload) {
  return withQueue(async () => {
    // Ensure minimum spacing between calls
    const now = Date.now();
    const since = now - lastCallAt;
    if (since < MIN_API_INTERVAL_MS) {
      const wait = MIN_API_INTERVAL_MS - since;
      console.log(`[OPENAI] Spacing wait ${wait}ms`);
      await sleep(wait);
    }

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify(payload)
        });

        // Respect official backoff window if present
        if (resp.status === 429) {
          const retryAfter = resp.headers.get('retry-after');
          const waitMs = retryAfter ? Number(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
          console.log(`[OPENAI] 429 rate limited. Attempt ${attempt}/${MAX_RETRIES}. Waiting ${waitMs}ms`);
          await sleep(waitMs);
          continue;
        }

        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          throw new Error(`OpenAI ${resp.status} ${resp.statusText} ${text}`);
        }

        const json = await resp.json();
        lastCallAt = Date.now();
        return json;

      } catch (err) {
        if (attempt === MAX_RETRIES) {
          console.error('[OPENAI] Failed after retries:', err.message);
          throw err;
        }
        const waitMs = Math.pow(2, attempt) * 1000;
        console.log(`[OPENAI] Retryable error: ${err.message}. Backing off ${waitMs}ms`);
        await sleep(waitMs);
      }
    }
  });
}
