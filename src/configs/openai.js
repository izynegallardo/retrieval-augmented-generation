import OpenAI from 'openai'

if (!import.meta.env.VITE_OPENROUTER_API_KEY)
    throw new Error('OpenRouter API key is missing or invalid.')

export const openai = new OpenAI({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    dangerouslyAllowBrowser: true, // set true for development only
})
