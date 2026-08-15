import { openai } from '../configs/openai'
import { supabase } from '../configs/supabase'

export async function createEmbedding(textOrArray) {
    try {
        const inputArray = Array.isArray(textOrArray) ? textOrArray : [textOrArray]
        const embeddingResponse = await openai.embeddings.create({
            model: import.meta.env.VITE_TEXT_EMBEDDING_MODEL, // 'nvidia/nemotron-3-embed-1b:free'
            input: inputArray,
            encoding_format: 'float',
        })

        const vectorEmbeddings = inputArray.map((text, index) => ({
            content: text,
            embedding: embeddingResponse.data[index].embedding,
        }))

        return vectorEmbeddings
    } catch (error) {
        console.error('Failed to create embeddings', error)
        throw error
    }
}

export async function getExistingDocuments(contentArray) {
    try {
        const { data, error } = await supabase
            .from('documents')
            .select('content')
            .in('content', contentArray)

        if (error) throw new Error(`Failed to get existing documents: ${error.message}`)

        return data
    } catch (error) {
        console.error('Failed to get existing documents:', error)
        throw error
    }
}

export async function insertEmbeddings(vectorEmbeddings) {
    try {
        const { error } = await supabase.from('documents').insert(vectorEmbeddings)

        if (error) throw new Error(`Failed to insert embeddings: ${error.message}`)

        return true
    } catch (error) {
        console.error('Failed to insert embeddings:', error)
        throw error
    }
}

export async function getEmbeddings() {
    try {
        const { data, error } = await supabase.from('documents').select('id, content, embedding')

        if (error) throw new Error(`Failed to get embeddings: ${error.message}`)

        return data
    } catch (error) {
        console.error('Failed to get embeddings:', error)
        throw error
    }
}

export async function storeEmbedding(textOrArray) {
    try {
        const inputArray = Array.isArray(textOrArray) ? textOrArray : [textOrArray]

        const existingDocuments = await getExistingDocuments(inputArray)
        const existingContent = new Set(existingDocuments.map((document) => document.content))

        const missingContent = inputArray.filter((text) => !existingContent.has(text))
        if (missingContent.length === 0) {
            return {
                inserted: 0,
                message: 'All embeddings already exist.',
            }
        }

        const vectorEmbeddings = await createEmbedding(missingContent)
        await insertEmbeddings(vectorEmbeddings)

        return {
            inserted: vectorEmbeddings.length,
            message: `Inserted ${vectorEmbeddings.length} embeddings.`,
        }
    } catch (error) {
        console.error('Failed to store embeddings:', error)
        throw error
    }
}

export async function getMatchDocuments(embedding) {
    try {
        const { data, error } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.1,
            match_count: 3,
        })

        if (error) {
            throw new Error(`Failed to match documents: ${error.message}`)
        }

        return data
    } catch (error) {
        console.error('Failed to get matching documents:', error)
        throw error
    }
}

async function getChatCompletion(text, query) {
    const chatMessages = [
        {
            role: 'system',
            content: `You are an enthusiastic podcast expert who loves recommending podcasts to 
                        people. You will be given two pieces of information - some context about
                        podcasts episodes and a question. Your main job is to formulate a short
                        answer to the question using the provided context. If you are unsure and
                        cannot find the answer in the context, say, "Sorry, I don't know the answer."
                        Please do not make up the answer.
                    `,
        },
    ]

    try {
        chatMessages.push({
            role: 'user',
            content: `Context: ${text} Question: ${query}`,
        })

        const response = await openai.chat.completions.create({
            model: import.meta.env.VITE_CHAT_MODEL, // 'openrouter/free'
            messages: chatMessages,
            temperature: 0.5,
            frequency_penalty: 0.5,
        })

        return response.choices[0].message.content
    } catch (error) {
        console.log('Failed to process chat completion:', error)
    }
}

export async function processChat(query) {
    try {
        const embedding = await createEmbedding(query)
        const matches = await getMatchDocuments(embedding[0].embedding)

        if (!matches || matches.length === 0) {
            return "Sorry, I don't know the answer."
        }

        const context = matches.map((match) => match.content).join('\n\n')
        const response = await getChatCompletion(context, query)

        return response
    } catch (error) {
        console.error('Failed to process chat:', error)
        throw error
    }
}
