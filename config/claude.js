const OpenAI = require('openai');

const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'ProInterview AI',
    },
});

const MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';

module.exports = { client, MODEL };
