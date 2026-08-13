import { openai } from '../configs/openai'
import { supabase } from '../configs/supabase'

export async function generateAndStoreEmbeddings(textOrArray) {
    try {
        const inputArray = Array.isArray(textOrArray) ? textOrArray : [textOrArray]
        const embeddingResponse = await openai.embeddings.create({
            model: import.meta.env.VITE_TEXT_EMBEDDING_MODEL, // nvidia/nemotron-3-embed-1b:free
            input: inputArray,
            encoding_format: 'float',
        })

        const vectorEmbeddings = inputArray.map((text, index) => ({
            content: text,
            embedding: embeddingResponse.data[index].embedding,
        }))

        const { error } = await supabase.from('documents').insert(vectorEmbeddings)

        if (error) {
            throw new Error(`Supabase insert failed: ${error.message}`)
        }

        return vectorEmbeddings
    } catch (error) {
        console.error('Failed to generate embeddings', error)
        throw error
    }
}
