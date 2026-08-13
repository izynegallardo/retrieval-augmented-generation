import { openai } from '../configs/openai'
import { supabase } from '../configs/supabase'

export async function searchSimilarity(text) {
    try {
        const embeddingResponse = await openai.embeddings.create({
            model: import.meta.env.VITE_TEXT_EMBEDDING_MODEL,
            input: text,
            encoding_format: 'float',
        })

        const embedding = embeddingResponse.data[0].embedding
        console.log(embedding)

        const { data, error } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.1,
            match_count: 3,
        })

        if (error) throw error

        console.log(data)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
