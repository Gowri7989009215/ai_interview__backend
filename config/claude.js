const OpenAI = require('openai');

const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': process.env.FRONTEND_URL || 'https://ai-interview-frontend-5ptg.onrender.com',
        'X-Title': 'ProInterview AI',
    },
});

const MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';

module.exports = { client, MODEL };
