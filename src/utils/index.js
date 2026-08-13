import { openai } from '../configs/openai'
import { supabase } from '../configs/supabase'

export async function main(textOrArray) {
    try {
        const inputArray = Array.isArray(textOrArray) ? textOrArray : [textOrArray]
        const response = await openai.embeddings.create({
            model: import.meta.env.VITE_TEXT_EMBEDDING_MODEL,
            input: inputArray,
            encoding_format: 'float',
        })

        const vectorEmbeddings = inputArray.map((text, index) => ({
            context: text,
            embedding: response.data[index].embedding,
        }))

        console.log(vectorEmbeddings)
        return vectorEmbeddings
    } catch (error) {
        console.error('Failed to generate embeddings', error)
        throw error
    }
}
