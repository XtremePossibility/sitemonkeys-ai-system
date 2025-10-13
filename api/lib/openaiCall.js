// OpenAI API Call Module with Retry Logic
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_WAIT_TIME = 30000; // 30 seconds

/**
 * Call OpenAI API with exponential backoff retry logic
 * @param {Object} params - OpenAI API parameters
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<Object>} - OpenAI API response
 */
export async function callOpenAI(params, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create(params);
      return response;
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.status && error.status !== 429 && error.status < 500) {
        throw error;
      }
      
      // Check if we should retry
      if (attempt < maxRetries - 1) {
        // Check if this is a rate limit error
        const isRateLimited = error.status === 429 || 
                             (error.message && error.message.includes('rate limit'));
        
        if (isRateLimited) {
          // Extract retry-after header if present
          let waitMs;
          if (error.headers && error.headers['retry-after']) {
            waitMs = parseInt(error.headers['retry-after']) * 1000;
          } else {
            // Exponential backoff with 30-second cap
            waitMs = Math.min(Math.pow(2, attempt) * 1000, 30000);
          }
          
          console.log(`⏳ Rate limited. Waiting ${waitMs}ms before retry ${attempt + 1}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
        } else {
          // For other errors, use standard exponential backoff
          const waitMs = Math.min(Math.pow(2, attempt) * 1000, 30000);
          console.log(`⚠️ Request failed. Retrying in ${waitMs}ms (${attempt + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
        }
      }
    }
  }
  
  throw lastError;
}

export default callOpenAI;