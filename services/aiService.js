const DEFAULT_SYSTEM_PROMPT =
  process.env.AI_SYSTEM_PROMPT ||
  'Jawab dengan bahasa Indonesia yang singkat, jelas, sopan, dan membantu.';

function getProvider() {
  return (process.env.AI_PROVIDER || '').toLowerCase().trim();
}

function getModel(provider) {
  if (process.env.AI_MODEL) return process.env.AI_MODEL;

  const modelMap = {
    ollama: process.env.OLLAMA_MODEL || 'llama3.2',
    openai: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    deepseek: process.env.DEEPSEEK_MODEL || 'deepseek-v4-pro',
    gemini: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  };

  return modelMap[provider] || '';
}

function getApiKey(provider) {
  const keyMap = {
    openai: process.env.OPENAI_API_KEY || process.env.AI_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY || process.env.AI_API_KEY,
    gemini: process.env.GEMINI_API_KEY || process.env.AI_API_KEY
  };

  return keyMap[provider];
}

function getAIConfig() {
  const provider = getProvider();
  const model = getModel(provider);

  return {
    provider,
    model,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    configured:
      provider === 'ollama' ||
      Boolean(getApiKey(provider))
  };
}

function normalizeHistory(history = []) {
  if (!Array.isArray(history)) return [];

  return history
    .filter((chat) => chat && chat.content)
    .slice(-8)
    .map((chat) => ({
      role: chat.role === 'user' ? 'user' : 'assistant',
      content: String(chat.content)
    }));
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const rawText = await response.text();

  let data = {};
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch (error) {
    data = { message: rawText };
  }

  if (!response.ok) {
    const message =
      data.error?.message ||
      data.error ||
      data.message ||
      `Request gagal dengan status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

async function askAI(message, history = []) {
  const provider = getProvider();

  if (provider === 'ollama') {
    return askOllama(message, history);
  }

  if (provider === 'openai') {
    return askOpenAI(message, history);
  }

  if (provider === 'deepseek') {
    return askDeepSeek(message, history);
  }

  if (provider === 'gemini') {
    return askGemini(message, history);
  }

  throw new Error(
    'AI_PROVIDER tidak valid di file .env. Gunakan openai, deepseek, gemini, atau ollama.'
  );
}

async function askOllama(message, history = []) {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const model = getModel('ollama');
  const previousMessages = normalizeHistory(history)
    .map((chat) => `${chat.role === 'user' ? 'User' : 'Assistant'}: ${chat.content}`)
    .join('\n');

  const prompt = [
    DEFAULT_SYSTEM_PROMPT,
    previousMessages ? `Riwayat percakapan:\n${previousMessages}` : '',
    `User: ${message}`,
    'Assistant:'
  ]
    .filter(Boolean)
    .join('\n\n');

  const data = await requestJson(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false
    })
  });

  return data.response || 'AI tidak memberikan jawaban.';
}

async function askOpenAI(message, history = []) {
  const apiKey = getApiKey('openai');
  const model = getModel('openai');
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY atau AI_API_KEY belum diisi di file .env.');
  }

  const messages = [
    { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
    ...normalizeHistory(history),
    { role: 'user', content: message }
  ];

  const data = await requestJson(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, messages })
  });

  return data.choices?.[0]?.message?.content || 'AI tidak memberikan jawaban.';
}

async function askDeepSeek(message, history = []) {
  const apiKey = getApiKey('deepseek');
  const model = getModel('deepseek');
  const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY atau AI_API_KEY belum diisi di file .env.');
  }

  const messages = [
    { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
    ...normalizeHistory(history),
    { role: 'user', content: message }
  ];

  const requestBody = { model, messages };

  if (model.startsWith('deepseek-v4')) {
    requestBody.thinking = { type: 'enabled' };
    requestBody.reasoning_effort = 'high';
  }

  const data = await requestJson(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  return data.choices?.[0]?.message?.content || 'AI tidak memberikan jawaban.';
}

async function askGemini(message, history = []) {
  const apiKey = getApiKey('gemini');
  const model = getModel('gemini');
  const baseUrl = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY atau AI_API_KEY belum diisi di file .env.');
  }

  const contents = normalizeHistory(history).map((chat) => ({
    role: chat.role === 'user' ? 'user' : 'model',
    parts: [{ text: chat.content }]
  }));

  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const data = await requestJson(
    `${baseUrl}/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: DEFAULT_SYSTEM_PROMPT }]
        },
        contents
      })
    }
  );

  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'AI tidak memberikan jawaban.';
}

module.exports = { askAI, getAIConfig };
