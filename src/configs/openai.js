import OpenAI from 'openai'

if (!import.meta.env.VITE_OPENROUTER_API_KEY)
    throw new Error('OpenRouter API key is missing or invalid.')

export const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    dangerouslyAllowBrowser: true, // set true for development only
})
