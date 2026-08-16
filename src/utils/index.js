import { openai } from '../configs/openai'
import { supabase } from '../configs/supabase'
import { CharacterTextSplitter, RecursiveCharacterTextSplitter } from '@langchain/textsplitters'

async function createEmbedding(textOrArray) {
    try {
        const inputArray = Array.isArray(textOrArray) ? textOrArray : [textOrArray]
        const embeddingResponse = await openai.embeddings.create({
            model: import.meta.env.VITE_TEXT_EMBEDDING_MODEL,
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

async function insertEmbeddings(vectorEmbeddings) {
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

async function getExistingDocuments() {
    try {
        const { data, error } = await supabase.from('documents').select('content')

        if (error) {
            throw new Error(`Failed to get existing documents: ${error.message}`)
        }

        return data
    } catch (error) {
        console.error('Failed to get existing documents:', error)
        throw error
    }
}

async function splitDocument(text, document, recursive = true) {
    try {
        const separator = ['\n\n', '\n', '. ', ' ', '']
        const chunkSize = 500
        const chunkOverlap = 50

        const splitter = recursive
            ? new RecursiveCharacterTextSplitter({
                  separator,
                  chunkSize,
                  chunkOverlap,
              })
            : new CharacterTextSplitter({
                  separator,
                  chunkSize,
                  chunkOverlap,
              })

        return splitter.createDocuments([text], [{ document }])
    } catch (error) {
        console.log('Failed splitting documet:', error)
        throw error
    }
}

async function getMatchDocuments(embedding) {
    try {
        const { data, error } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.1,
            match_count: 5,
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

async function getChatCompletion(context, query, conversationHistory = []) {
    const messages = [
        {
            role: 'system',
            content: `
                    You are an enthusiastic movie and podcast expert who chats naturally with the user.
                    Use the knowledge context when answering questions about movies and podcasts.
                    Use the conversation history to remember things the user has told you and to understand follow-up questions.
                    If the user is simply chatting or telling you something personal, respond naturally rather than requiring movie or podcast context.
                    For factual movie or podcast questions, do not invent information.
                    CATALOG RESTRICTION:
                    You may ONLY recommend titles explicitly present in the Knowledge context.
                    You must NEVER recommend a title from your general knowledge.
                    If Knowledge context says:
                    "NO MATCHING MOVIES OR PODCASTS WERE FOUND"
                    then do not recommend anything.
                    Instead say:
                    "I don't have a suitable match in your catalog."
                    Speak naturally, like you're chatting with a friend.
            `.trim(),
        },

        ...conversationHistory,

        {
            role: 'user',
            content: `
                        Knowledge context:
                        ${context}

                        Current question:
                        ${query}
            `.trim(),
        },
    ]

    try {
        const { choices } = await openai.chat.completions.create({
            model: import.meta.env.VITE_CHAT_MODEL,
            messages,
            temperature: 0.3,
            frequency_penalty: 0.5,
        })

        console.log('Messages sent to AI:', messages)

        return choices[0].message.content
    } catch (error) {
        console.log('Failed to process chat completion:', error)
        throw error
    }
}

// Processes
export async function createStoreEmbedding(documents) {
    try {
        const texts = await processChunk(documents)

        const chunks = texts.map((text) => text.pageContent)

        const existingDocuments = await getExistingDocuments()

        const existingContent = new Set(existingDocuments.map((document) => document.content))

        const missingContent = chunks.filter((text) => !existingContent.has(text))

        console.log('Total chunks:', chunks.length)
        console.log('Existing:', chunks.length - missingContent.length)
        console.log('Missing:', missingContent.length)

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

export async function searchSimilarity(queryText) {
    const result = await createEmbedding(queryText)
    const queryEmbedding = result[0].embedding
    const matches = await getMatchDocuments(queryEmbedding)
    return matches
}

export async function processChunk(documents) {
    const result = await Promise.all(
        documents.map(async (document) => {
            const response = await fetch(document)
            const text = await response.text()

            return splitDocument(text, document)
        }),
    )

    return result.flat()
}

export async function processChat(query, conversationHistory = []) {
    console.log('Conversation history:', conversationHistory)

    try {
        const embeddingResult = await createEmbedding(query)

        const matches = await getMatchDocuments(embeddingResult[0].embedding)

        const context = matches?.length
            ? matches.map((match) => match.content).join('\n\n')
            : 'NO MATCHING MOVIES OR PODCASTS WERE FOUND'

        console.log('RAG matches:', matches)
        console.log('RAG context:', context)

        return await getChatCompletion(context, query, conversationHistory)
    } catch (error) {
        console.error('Failed to process chat:', error)
        throw error
    }
}
