// OpenRouter client helper with model routing and graceful fallbacks
// Docs: https://openrouter.ai/docs

const DEFAULT_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Prefer free models in roughly quality order; will fallback on errors/quotas
export const FREE_CHAT_MODELS = [
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-7b-it:free',
  'qwen/qwen-2-7b-instruct:free',
];

function backoff(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function callChatCompletion(messages, {
  modelList = FREE_CHAT_MODELS,
  temperature = 0.3,
  maxTokens = 800,
  stop,
  appName = process.env.OPENROUTER_APP_NAME || 'DuckWire/Clustering',
} = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages required');
  }

  if (!OPENROUTER_API_KEY) {
    // No key — return a deterministic placeholder to keep the pipeline working
    return {
      model: 'local/placeholder',
      content: JSON.stringify({
        headline: messages.find(m => m.role === 'user')?.content?.slice(0, 80) || 'Cluster Summary',
        summary: { left: [], center: [], right: [] },
        coverage: {},
      }),
      placeholder: true,
    };
  }

  let lastErr;
  for (let i = 0; i < modelList.length; i++) {
    const model = modelList[i];
    try {
      const resp = await fetch(`${DEFAULT_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': appName,
          'X-Title': appName,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stop,
        }),
      });

      if (resp.status === 429 || resp.status === 503) {
        await backoff(800 * (i + 1));
        continue;
      }

      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        lastErr = new Error(`OpenRouter ${resp.status} ${resp.statusText}: ${text?.slice(0, 200)}`);
        continue;
      }

      const json = await resp.json();
      const content = json?.choices?.[0]?.message?.content || '';
      if (!content) throw new Error('Empty completion');
      return { model, content };
    } catch (e) {
      lastErr = e;
      await backoff(300 * (i + 1));
      continue;
    }
  }
  throw lastErr || new Error('All OpenRouter models failed');
}
